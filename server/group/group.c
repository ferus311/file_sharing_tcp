#include <stdio.h>
#include <string.h>
#include <mysql/mysql.h>
#include <sys/socket.h>
#include "../user/user.h"
#include "../token/token.h"
#include "../database/db.h"
#include "group.h"
#include "utils.h"

extern MYSQL *conn;

// Gửi mã trạng thái tới client
void send_message(int client_sock, int status_code, const char *message)
{
    char response[1024];
    if (message != NULL)
    {
        snprintf(response, sizeof(response), "%d %s", status_code, message);
    }
    else
    {
        snprintf(response, sizeof(response), "%d", status_code);
    }
    send(client_sock, response, strlen(response), 0);
}

void show_log(int client_sock, int group_id, const char *timestamp)
{
    MYSQL_RES *res;
    MYSQL_ROW row;

    // Prepare the SQL query
    char query[512];
    snprintf(query, sizeof(query), "SELECT user_id, action, timestamp, details FROM activity_log WHERE target_id = %d AND timestamp >= '%s'", group_id, timestamp);

    // Execute the query
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT error: %s\n", mysql_error(conn));
        return;
    }

    // Store the result
    res = mysql_store_result(conn);
    if (res == NULL)
    {
        fprintf(stderr, "mysql_store_result() failed: %s\n", mysql_error(conn));
        return;
    }

    // Fetch and concatenate the results
    char activity[4096] = "";
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        char log_entry[1024];
        snprintf(log_entry, sizeof(log_entry), "User ID: %s, Action: %s, Timestamp: %s, Details: %s\n", row[0], row[1], row[2], row[3]);
        strncat(activity, log_entry, sizeof(activity) - strlen(activity) - 1);
    }

    // Send the response back to the client
    send_message(client_sock, 2000, activity);

    // Clean up
    mysql_free_result(res);
}

// Tạo nhóm
int handle_create_group(int client_sock, const char *token, const char *group_name)
{
    char query[512];
    int code;

    // Step 1: Check if group name already exists
    code = check_group_exist_by_name(client_sock, group_name);
    if (code)
    {
        return code;
    }

    // Step 2: Create the group
    int user_id = get_user_id_by_token(token);

    snprintf(query, sizeof(query), "INSERT INTO `groups` (group_name, created_by) VALUES ('%s', %d)", group_name, user_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to create group: %s\n", mysql_error(conn));
        return -1;
    }

    // Lấy ID của nhóm vừa tạo
    int group_id = mysql_insert_id(conn);

    // Thêm người dùng vào nhóm với vai trò admin
    snprintf(query, sizeof(query), "INSERT INTO user_groups (user_id, group_id, role) VALUES (%d, %d, 'admin')", user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to add user to group: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 3: Send the response back to the client
    char response[1024];
    snprintf(response, sizeof(response), "2000 %d\r\n", group_id);
    send(client_sock, response, strlen(response), 0);

    return 2000; // Success
}

// Tham gia nhóm
int handle_request_join_group(int client_sock, const char *token, int group_id)
{
    char query[512];
    MYSQL_RES *res;

    // Step 1: Validate the token and retrieve the user ID
    int user_id = get_user_id_by_token(token);
    if (user_id <= 0)
    {
        send_message(client_sock, 4000, "Invalid token or user not found");
        return 4000;
    }

    // Step 2: Check if the group exists
    snprintf(query, sizeof(query), "SELECT group_id FROM `groups` WHERE group_id = %d", group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed for group existence. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_message(client_sock, 4041, "Group not found");
        if (res)
            mysql_free_result(res);
        return 4041;
    }
    mysql_free_result(res);

    // Step 3: Check if the user is already a member of the group
    snprintf(query, sizeof(query),
             "SELECT user_id FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed for user membership check. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res && mysql_num_rows(res) > 0)
    {
        send_message(client_sock, 4001, "User already a member of the group");
        mysql_free_result(res);
        return 4001;
    }
    if (res)
        mysql_free_result(res);

    // Step 4: Check if a pending join request already exists
    snprintf(query, sizeof(query),
             "SELECT request_id FROM group_requests "
             "WHERE user_id = %d AND group_id = %d AND request_type = 'join_request' AND status = 'pending'",
             user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed for pending join request check. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res && mysql_num_rows(res) > 0)
    {
        send_message(client_sock, 4002, "Join request already pending");
        mysql_free_result(res);
        return 4002;
    }
    if (res)
        mysql_free_result(res);

    // Step 5: Insert the join request into the group_requests table
    snprintf(query, sizeof(query),
             "INSERT INTO group_requests (user_id, group_id, request_type, status) "
             "VALUES (%d, %d, 'join_request', 'pending')",
             user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "INSERT failed for join request. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5001, "Failed to submit join request");
        return 5001;
    }

    // Step 6: Send a success response back to the client
    send_message(client_sock, 2000, "Join request submitted successfully");
    return 2000;
}

int handle_list_requests(int client_sock, const char *token, int group_id) {
    char query[512];
    int user_id = get_user_id_by_token(token); // Lấy user_id từ token

    // Validate token and user_id
    if (user_id <= 0) {
        send_message(client_sock, 4030, NULL); // "Invalid or expired token"
        return 4030;
    }

    // Step 1: Check if the user is the creator of the group
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT created_by failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch group creator"
        return 5000;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch group creator"
        return 5000;
    }

    if (mysql_num_rows(res) == 0) {
        send_message(client_sock, 4040, NULL); // "Group not found"
        mysql_free_result(res);
        return 4040;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    int created_by = atoi(row[0]); // Lấy user_id của admin nhóm
    mysql_free_result(res);

    if (created_by != user_id) {
        send_message(client_sock, 4030, NULL); // "Permission denied: You are not the creator of this group"
        return 4030;
    }

    // Step 2: Query the list of requests
    snprintf(query, sizeof(query),
             "SELECT r.request_id, u.username, r.request_type, r.status, r.created_at "
             "FROM group_requests r "
             "JOIN users u ON r.user_id = u.user_id "
             "WHERE r.group_id = %d", group_id);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT requests failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch requests"
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch requests"
        return 5000;
    }

    int num_rows = mysql_num_rows(res);
    if (num_rows == 0) {
        send_message(client_sock, 2000, NULL); // No requests found
        mysql_free_result(res);
        return 2000;
    }

    // Step 3: Build the response
    char response[2048] = "";
    MYSQL_ROW req_row;

    while ((req_row = mysql_fetch_row(res))) {
        char temp[512];
        int request_id = atoi(req_row[0]);
        char *username = req_row[1];
        char *request_type = req_row[2];
        char *status = req_row[3];
        char *created_at = req_row[4];

        snprintf(temp, sizeof(temp), "%d&%s&%s&%s&%s||",
                 request_id, username, request_type, status, created_at);
        strncat(response, temp, sizeof(response) - strlen(response) - 1);
    }

    mysql_free_result(res);

    // Step 4: Remove trailing "||" if present
    int len = strlen(response);
    if (len > 2 && response[len - 2] == '|' && response[len - 1] == '|') {
        response[len - 2] = '\0';
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, response);
    return 2000;
}

// Mời người dùng vào nhóm
int handle_invite_user_to_group(int client_sock, int group_id, int invitee_id)
{
    char query[512];

    // Step 1: Check if group_id exists
    snprintf(query, sizeof(query), "SELECT 1 FROM `groups` WHERE group_id = %d", group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT group_id failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // Failed to fetch group
        return 5000;
    }   

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_message(client_sock, 4040, NULL); // Group does not exist
        if (res) mysql_free_result(res);
        return 4040;
    }
    mysql_free_result(res);

    // Step 2: Check if invitee_id exists
    snprintf(query, sizeof(query), "SELECT 1 FROM users WHERE user_id = %d", invitee_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT invitee_id failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // Failed to fetch user
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_message(client_sock, 4040, NULL); // User does not exist
        if (res) mysql_free_result(res);
        return 4040;
    }
    mysql_free_result(res);

    // Step 3: Check if invitee is already in the group
    snprintf(query, sizeof(query), "SELECT 1 FROM user_groups WHERE user_id = %d AND group_id = %d", invitee_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT user in group failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // Failed to check group membership
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res != NULL && mysql_num_rows(res) > 0)
    {
        send_message(client_sock, 4001, NULL); // User already in group
        mysql_free_result(res);
        return 4001;
    }
    mysql_free_result(res);

    // Step 4: Check if an invitation already exists
    snprintf(query, sizeof(query), "SELECT 1 FROM group_requests WHERE user_id = %d AND group_id = %d AND request_type = 'invitation' AND status = 'pending'", invitee_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT pending invitation failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // Failed to check existing invitation
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res != NULL && mysql_num_rows(res) > 0)
    {
        send_message(client_sock, 4002, NULL); // Pending invitation already exists
        mysql_free_result(res);
        return 4002;
    }
    mysql_free_result(res);

    // Step 5: Insert the invitation into group_requests
    snprintf(query, sizeof(query), "INSERT INTO group_requests (user_id, group_id, request_type, status) VALUES (%d, %d, 'invitation', 'pending')", invitee_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "INSERT invitation failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // Failed to send invitation
        return 5000;
    }

    // Step 6: Send the response back to the client
    send_message(client_sock, 2000, NULL); // Invitation sent successfully
    return 2000;
}


// Rời nhóm
int handle_leave_group(int client_sock, const char *token, int group_id)
{
    char query[512];
    int code;

    // Step 1: Check if token is existed
    int int_user_id = get_user_id_by_token(token);
    code = check_user_exist_by_id(client_sock, int_user_id);
    if (code)
    {
        return code;
    }

    // Step 2: Check if group_id is existed
    code = check_group_exist_by_id(client_sock, group_id);
    if (code)
    {
        return code;
    }

    // Step 3: Check if token is in group_id
    code = check_user_in_group(client_sock, int_user_id, group_id);
    if (code)
    {
        return code;
    }

    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", int_user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

// Xóa thành viên
int handle_remove_member(int client_sock, const char *token, int group_id, int user_id)
{
    char query[512];
    int code;
    MYSQL_ROW row;

    // Step 1: Check if group_id is existed
    code = check_group_exist_by_id(client_sock, group_id);
    if (code)
    {
        return code;
    }

    // Step 2: Check if user_id in group
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);
    if (res == 0)
    {
        send(client_sock, "4030\r\n", 6, 0);
        return 4030;
    }
    mysql_free_result(res);

    // Step 3: Check if delete user token have authority
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    res = mysql_store_result(conn);

    int int_user_id = get_user_id_by_token(token);

    // Get create by user_id
    row = mysql_fetch_row(res);
    char *str_user_id = row[0];
    int int_created_by = atoi(str_user_id);

    // Compare if send command user is the creator group
    if (int_created_by != int_user_id)
    {
        send(client_sock, "4031\r\n", 6, 0); // No authority
        return 4031;
    }
    mysql_free_result(res);

    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

// Liệt kê danh sách nhóm người dùng
int handle_list_group(int client_sock, const char *token)
{
    char query[512];
    char combined_groups[4096] = "";

    if (token == NULL || strlen(token) == 0)
    {
        // Nếu không có token, lấy tất cả các nhóm
        snprintf(query, sizeof(query), "SELECT group_id, group_name FROM `groups`");
    }
    else
    {
        // Nếu có token, lấy các nhóm người dùng đã tham gia
        int user_id = get_user_id_by_token(token);

        // Lấy group_id mà người dùng đã tham gia
        snprintf(query, sizeof(query), "SELECT group_id FROM user_groups WHERE user_id = %d", user_id);
    }

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);

    MYSQL_ROW row;

    if (mysql_num_rows(res) == 0)
    {
        // Không có nhóm
        send_message(client_sock, 2000, NULL);
        mysql_free_result(res);
        return 2000;
    }

    // Nếu không có token, sẽ có cả group_id và group_name trong kết quả
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        int group_id;
        const char *group_name;

        // Nếu có token, chỉ trả về các nhóm mà người dùng tham gia
        if (token != NULL && strlen(token) > 0)
        {
            group_id = atoi(row[0]);
            snprintf(query, sizeof(query), "SELECT group_name FROM `groups` WHERE group_id = %d", group_id);

            if (mysql_query(conn, query))
            {
                fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
                return -1;
            }

            MYSQL_RES *res_group = mysql_store_result(conn);
            MYSQL_ROW row_group = mysql_fetch_row(res_group);
            group_name = row_group[0];

            mysql_free_result(res_group);
        }
        else
        {
            // Nếu không có token, lấy cả tên nhóm từ bảng `groups`
            group_id = atoi(row[0]);
            group_name = row[1];
        }

        // Tạo chuỗi theo định dạng group_name&group_id
        char group_entry[256];
        snprintf(group_entry, sizeof(group_entry), "%d&%s", group_id, group_name);

        // Nối vào combined_groups với separator ||
        if (strlen(combined_groups) > 0)
        {
            strncat(combined_groups, "||", sizeof(combined_groups) - strlen(combined_groups) - 1);
        }
        strncat(combined_groups, group_entry, sizeof(combined_groups) - strlen(combined_groups) - 1);
    }

    mysql_free_result(res);

    // Gửi phản hồi đến client
    send_message(client_sock, 2000, combined_groups);

    return 2000;
}

int handle_list_group_not_joined(int client_sock, const char *token)
{
    if (token == NULL || strlen(token) == 0)
    {
        send_message(client_sock, 4000, "Invalid token");
        return -1;
    }

    // Step 1: Retrieve user_id from the token
    int user_id = get_user_id_by_token(token);
    if (user_id <= 0)
    {
        send_message(client_sock, 4001, "Invalid user");
        return -1;
    }

    char query[1024];
    char response[8192] = "";

    // Query for groups the user can request to join
    snprintf(query, sizeof(query),
             "SELECT g.group_id, g.group_name "
             "FROM `groups` g "
             "WHERE g.group_id NOT IN ("
             "    SELECT ug.group_id "
             "    FROM user_groups ug "
             "    WHERE ug.user_id = %d"
             ") "
             "AND g.group_id NOT IN ("
             "    SELECT gr.group_id "
             "    FROM group_requests gr "
             "    WHERE gr.user_id = %d AND gr.request_type = 'join_request' AND gr.status = 'pending'"
             ")",
             user_id, user_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL)
    {
        send_message(client_sock, 5001, "No groups found");
        return -1;
    }

    MYSQL_ROW row;

    // Add groups the user can request to join
    char joinable_groups[4096] = "";
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        int group_id = atoi(row[0]);
        const char *group_name = row[1];

        // Append group details
        char entry[256];
        snprintf(entry, sizeof(entry), "%d&%s", group_id, group_name);

        if (strlen(joinable_groups) > 0)
        {
            strncat(joinable_groups, "||", sizeof(joinable_groups) - strlen(joinable_groups) - 1);
        }
        strncat(joinable_groups, entry, sizeof(joinable_groups) - strlen(joinable_groups) - 1);
    }

    mysql_free_result(res);

    // Query for groups with pending requests
    snprintf(query, sizeof(query),
             "SELECT g.group_id, g.group_name "
             "FROM group_requests gr "
             "JOIN `groups` g ON gr.group_id = g.group_id "
             "WHERE gr.user_id = %d AND gr.request_type = 'join_request' AND gr.status = 'pending'",
             user_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed for pending requests. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return -1;
    }

    res = mysql_store_result(conn);
    if (res == NULL)
    {
        send_message(client_sock, 5001, "No pending requests found");
        return -1;
    }

    // Add groups with pending requests
    char pending_groups[4096] = "";
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        int group_id = atoi(row[0]);
        const char *group_name = row[1];

        // Append group details
        char entry[256];
        snprintf(entry, sizeof(entry), "%d&%s", group_id, group_name);

        if (strlen(pending_groups) > 0)
        {
            strncat(pending_groups, "||", sizeof(pending_groups) - strlen(pending_groups) - 1);
        }
        strncat(pending_groups, entry, sizeof(pending_groups) - strlen(pending_groups) - 1);
    }

    mysql_free_result(res);

    // Combine the two sections into the response
    snprintf(response, sizeof(response), "%s::%s", joinable_groups, pending_groups);

    // Send the response
    send_message(client_sock, 2000, response);

    return 2000; // Success
}

// Liệt kê danh sách thành viên nhóm
int handle_list_group_members(int client_sock, const char *token, int group_id)
{
    int code;

    // Step 1 check group exist
    code = check_group_exist_by_id(client_sock, group_id);
    if (code)
    {
        return code;
    }

    // Step 2 check user in group
    int user_id = get_user_id_by_token(token);

    code = check_user_in_group(client_sock, user_id, group_id);
    if (code)
    {
        return code;
    }

    // Step 3 get group members
    char query[4096];
    snprintf(query, sizeof(query), "SELECT user_id FROM user_groups WHERE group_id = %d", group_id);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    MYSQL_ROW row;
    char combined_members[4096] = "";

    if (mysql_num_rows(res) == 0)
    {
        // User has no groups
        send_message(client_sock, 2000, NULL);
        mysql_free_result(res);
        return 2000;
    }

    while ((row = mysql_fetch_row(res)) != NULL)
    {
        int user_id = atoi(row[0]);

        // Get username from users table
        snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", user_id);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
            return -1;
        }

        MYSQL_RES *res_user = mysql_store_result(conn);

        MYSQL_ROW row_user = mysql_fetch_row(res_user);
        char *username = row_user[0];

        // Create string in format username&user_id
        char user_entry[256];
        snprintf(user_entry, sizeof(user_entry), "%d&%s", user_id, username);

        // Append to combined_groups with separator ||
        if (strlen(combined_members) > 0)
        {
            strncat(combined_members, "||", sizeof(combined_members) - strlen(combined_members) - 1);
        }
        strncat(combined_members, user_entry, sizeof(combined_members) - strlen(combined_members) - 1);

        mysql_free_result(res_user);
    }

    mysql_free_result(res);

    // Send response to client
    send_message(client_sock, 2000, combined_members);
    return 2000;
}

int handle_list_invitations(int client_sock, const char *token) {
    if (token == NULL || strlen(token) == 0) {
        // Nếu token không hợp lệ, trả về lỗi
        send_message(client_sock, 4000, "Invalid token");
        return -1;
    }

    // Lấy user_id từ token
    int user_id = get_user_id_by_token(token);
    if (user_id <= 0) {
        send_message(client_sock, 4001, "Invalid user");
        return -1;
    }

    char query[512];
    snprintf(query, sizeof(query),
             "SELECT g.group_id, g.group_name, r.request_id, r.status "
             "FROM group_requests r "
             "JOIN `groups` g ON r.group_id = g.group_id "
             "WHERE r.user_id = %d AND r.request_type = 'invitation' AND r.status = 'pending'",
             user_id);

    if (mysql_query(conn, query)) {
        // Truy vấn SQL thất bại
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        send_message(client_sock, 5001, "No invitations found");
        return -1;
    }

    MYSQL_ROW row;
    char response[4096] = "";

    while ((row = mysql_fetch_row(res)) != NULL) {
        int group_id = atoi(row[0]);
        const char *group_name = row[1];
        int request_id = atoi(row[2]);
        const char *status = row[3];

        // Kết hợp dữ liệu thành chuỗi response
        char entry[256];
        snprintf(entry, sizeof(entry), "%d&%s&%d&%s", group_id, group_name, request_id, status);

        // Nối entry vào response
        if (strlen(response) > 0) {
            strncat(response, "||", sizeof(response) - strlen(response) - 1);
        }
        strncat(response, entry, sizeof(response) - strlen(response) - 1);
    }

    mysql_free_result(res);

    if (strlen(response) == 0) {
        // Không có lời mời nào
        send_message(client_sock, 4040, "No pending invitations");
    } else {
        // Gửi danh sách lời mời
        send_message(client_sock, 2000, response);
    }

    return 2000; // Thành công
}

int handle_respond_invitation(int client_sock, const char *token, int requestId, const char *approval_status)
{
    char query[512];

    // Step 1: Validate token and retrieve user_id
    int user_id = get_user_id_by_token(token);
    if (user_id <= 0) {
        send_message(client_sock, 4001, "Invalid token or user not found");
        return 4001;
    }

    // Step 2: Validate the invitation exists and is pending
    snprintf(query, sizeof(query),
             "SELECT group_id, status FROM group_requests WHERE request_id = %d AND user_id = %d AND request_type = 'invitation'",
             requestId, user_id);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Database query failed");
        return 5000;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (!res || mysql_num_rows(res) == 0) {
        send_message(client_sock, 4040, "No pending invitation found");
        mysql_free_result(res);
        return 4040;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    int group_id = atoi(row[0]);
    const char *current_status = row[1];
    mysql_free_result(res);

    if (strcmp(current_status, "pending") != 0) {
        send_message(client_sock, 4000, "Invitation already processed");
        return 4000;
    }

    // Step 3: Check if approval_status is valid
    if (strcmp(approval_status, "accepted") != 0 && strcmp(approval_status, "rejected") != 0) {
        send_message(client_sock, 4000, "Invalid approval status");
        return 4000;
    }

    // Step 4: Update the group_requests table based on approval_status
    snprintf(query, sizeof(query),
             "UPDATE group_requests SET status = '%s' WHERE request_id = %d",
             approval_status, requestId);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "UPDATE failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, "Failed to update invitation status");
        return 5000;
    }

    // Step 5: If accepted, add the user to the group
    if (strcmp(approval_status, "accepted") == 0) {
        snprintf(query, sizeof(query),
                 "INSERT INTO user_groups (user_id, group_id) VALUES (%d, %d)",
                 user_id, group_id);

        if (mysql_query(conn, query)) {
            fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
            send_message(client_sock, 5000, "Failed to add user to the group");
            return 5000;
        }
    }

    // Step 6: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

int handle_approve_join_request(int client_sock, const char *token, int request_id, const char *approval_status)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Step 1: Validate user_id
    if (user_id <= 0)
    {
        send_message(client_sock, 4030, NULL);//"Invalid or expired token"
        return 4030;
    }

    // Step 2: Validate approval_status
    if (strcmp(approval_status, "accepted") != 0 && strcmp(approval_status, "rejected") != 0)
    {
        send_message(client_sock, 4000, NULL); //"Invalid approval status"
        return 4000;
    }

    // Step 3: Check if the request exists and fetch group_id
    snprintf(query, sizeof(query), "SELECT group_id, request_type, status FROM group_requests WHERE request_id = %d", request_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT group_id failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL);//"Failed to fetch group ID"
        return 5000;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_message(client_sock, 4040, NULL);//"Request not found"
        if (res)
            mysql_free_result(res);
        return 4040;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    int group_id = atoi(row[0]);
    const char *request_type = row[1];
    const char *request_status = row[2];
    mysql_free_result(res);

    // Step 4: Ensure the user_id is the creator of the group
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT created_by failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL);//"Failed to fetch group creator"
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_message(client_sock, 4040, NULL);//"Group not found"
        if (res)
            mysql_free_result(res);
        return 4040;
    }

    row = mysql_fetch_row(res);
    int created_by = atoi(row[0]);
    mysql_free_result(res);

    if (created_by != user_id)
    {
        send_message(client_sock, 4030, NULL);//"Permission denied: You are not the creator of this group"
        return 4030;
    }

    // Step 5: Ensure the request is still pending
    if (strcmp(request_status, "pending") != 0)
    {
        send_message(client_sock, 4001, NULL);//"Request is no longer pending"
        return 4001;
    }

    // Step 6: Update the request status
    snprintf(query, sizeof(query), "UPDATE group_requests SET status = '%s' WHERE request_id = %d", approval_status, request_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "UPDATE failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL);//"Failed to update request status"
        return 5000;
    }

    // Step 7: If accepted, add the user to the group
    if (strcmp(approval_status, "accepted") == 0 && strcmp(request_type, "join_request") == 0)
    {
        snprintf(query, sizeof(query),
                 "INSERT INTO user_groups (user_id, group_id) "
                 "SELECT user_id, group_id FROM group_requests WHERE request_id = %d", request_id);

        if (mysql_query(conn, query))
        {
            fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
            send_message(client_sock, 5000, NULL);//"Failed to add user to group"
            return 5000;
        }
    }

    // Step 8: Send success response
    send_message(client_sock, 2000, NULL);//"Request processed successfully"
    return 2000;
}

// Liet ke danh sach user khong co trong nhom
int handle_list_available_invite_user(int client_sock, const char *token, int group_id) {
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Validate token and user_id
    if (user_id <= 0) {
        send_message(client_sock, 4030, NULL); // "Invalid or expired token"
        return 4030;
    }

    // Step 1: Check if the user is the creator of the group
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT created_by failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch group creator"
        return 5000;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch group creator"
        return 5000;
    }

    if (mysql_num_rows(res) == 0) {
        send_message(client_sock, 4040, NULL); // "Group not found"
        mysql_free_result(res);
        return 4040;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    int created_by = atoi(row[0]); // Get the creator's user ID
    mysql_free_result(res);

    if (created_by != user_id) {
        send_message(client_sock, 4030, NULL); // "Permission denied: You are not the creator of this group"
        return 4030;
    }

    // Step 2: Query users who are not already part of the group
    snprintf(query, sizeof(query),
             "SELECT u.user_id, u.username "
             "FROM users u "
             "WHERE u.user_id NOT IN ("
             "  SELECT ug.user_id "
             "  FROM user_groups ug "
             "  WHERE ug.group_id = %d"
             ") AND u.user_id NOT IN ("
             "  SELECT gr.user_id "
             "  FROM group_requests gr "
             "  WHERE gr.group_id = %d AND gr.status = 'pending'"
             ")",
             group_id, group_id);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT available users failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch available users"
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
        send_message(client_sock, 5000, NULL); // "Failed to fetch available users"
        return 5000;
    }

    int num_rows = mysql_num_rows(res);
    if (num_rows == 0) {
        send_message(client_sock, 2000, NULL); // No available users found
        mysql_free_result(res);
        return 2000;
    }

    // Step 3: Build the response
    char response[2048] = "";
    MYSQL_ROW user_row;

    while ((user_row = mysql_fetch_row(res))) {
        char temp[256];
        int available_user_id = atoi(user_row[0]);
        char *username = user_row[1];

        snprintf(temp, sizeof(temp), "%d&%s||", available_user_id, username);
        strncat(response, temp, sizeof(response) - strlen(response) - 1);
    }

    mysql_free_result(res);

    // Step 4: Remove trailing "||" if present
    int len = strlen(response);
    if (len > 2 && response[len - 2] == '|' && response[len - 1] == '|') {
        response[len - 2] = '\0';
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, response);
    return 2000;
}
