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
    if (message != NULL) {
        snprintf(response, sizeof(response), "%d %s", status_code, message);
    } else {
        snprintf(response, sizeof(response), "%d", status_code);
    }
    send(client_sock, response, strlen(response), 0);
}

void show_log(int client_sock, int group_id, const char *timestamp) {
    MYSQL_RES *res;
    MYSQL_ROW row;

    // Prepare the SQL query
    char query[512];
    snprintf(query, sizeof(query), "SELECT user_id, action, timestamp, details FROM activity_log WHERE target_id = %d AND timestamp >= '%s'", group_id, timestamp);

    // Execute the query
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT error: %s\n", mysql_error(conn));
        return;
    }

    // Store the result
    res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed: %s\n", mysql_error(conn));
        return;
    }

    // Fetch and concatenate the results
    char activity[4096] = "";
    while ((row = mysql_fetch_row(res)) != NULL) {
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
int handle_create_group(int client_sock, const char *token, const char *group_name) {
    char query[512];
    int code;

    // Step 1: Check if group name already exists
    code = check_group_exist_by_name(client_sock,group_name);
    if(code){
        return code;
    }

    // Step 2: Create the group
    int int_user_id = get_user_id_by_token(token);

    snprintf(query, sizeof(query), "INSERT INTO `groups` (group_name, created_by) VALUES ('%s', %d)", group_name, int_user_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 3: Send the response back to the client
    send_message(client_sock, 2000, NULL);

    return 2000; // Success
}

// Tham gia nhóm
int handle_request_join_group(int client_sock, const char *token, int group_id) {
    char query[512];
    int code;

    // Step 1: Find username by user_id
    int int_user_id = get_user_id_by_token(token);
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", int_user_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 1. Error: %s\n", mysql_error(conn));
        return -1; // User not found
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        send(client_sock, "4041\r\n", 6, 0); // User not found
        return 4041; // Group not found
    }
    mysql_free_result(res);

    // Step 2: Check if group id already exists
    code = check_group_exist_by_id(client_sock, group_id);
    if(code){
        return code;
    }

    // Step 3: Check if user already in group
    code = check_user_in_group(client_sock, int_user_id, group_id);
    if(code){
        return code;
    }

    // Step 4: Insert into user_groups
    snprintf(query, sizeof(query), "INSERT INTO group_requests (user_id, group_id, request_type) VALUES (%d, %d, 'join_request')", int_user_id, group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

// Mời người dùng vào nhóm
int handle_invite_user_to_group(int client_sock, int group_id, int invitee_id) {
    char query[512];
    int code;

    // Step 1: Check if group_id is existed
    code = check_group_exist_by_id(client_sock, group_id);
    if(code){
        return code;
    }

    // Step 2: Check if invitee is in group_id
    code = check_user_in_group(client_sock, invitee_id, group_id);
    if(code){
        return code;
    }


    // Step 3: Check if invitee_id is existed
    code = check_user_exist_by_id(client_sock, invitee_id);
    if (code) {
        return code;
    }

    // Step 5: Insert into user_groups
    // FIXME: Insert into queue
    snprintf(query, sizeof(query), "INSERT INTO group_requests (user_id, group_id, request_type) VALUES (%d, %d, 'invitation')", invitee_id, group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 6: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

// Rời nhóm
int handle_leave_group(int client_sock, const char* token, int group_id){
    char query[512];
    int code;

    // Step 1: Check if token is existed
    int int_user_id = get_user_id_by_token(token);
    code = check_user_exist_by_id(client_sock, int_user_id);
    if (code) {
        return code;
    }

    // Step 2: Check if group_id is existed
    code = check_group_exist_by_id(client_sock, group_id);
    if (code){
        return code;
    }

    // Step 3: Check if token is in group_id
    code = check_user_in_group(client_sock, int_user_id, group_id);
    if (code){
        return code;
    }


    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", int_user_id, group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

// Xóa thành viên
int handle_remove_member(int client_sock, const char *token, int group_id, int user_id){
    char query[512];
    int code;
    MYSQL_ROW row;

    // Step 1: Check if group_id is existed
    code = check_group_exist_by_id(client_sock, group_id);
    if (code){
        return code;
    }

    // Step 2: Check if user_id in group
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);
    if (res == 0){
        send(client_sock, "4030\r\n", 6, 0);
        return 4030;
    }
    mysql_free_result(res);

    // Step 3: Check if delete user token have authority
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    res = mysql_store_result(conn);

    int int_user_id = get_user_id_by_token(token);

    // Get create by user_id
    row = mysql_fetch_row(res);
    char* str_user_id = row[0];
    int int_created_by = atoi(str_user_id);

    // Compare if send command user is the creator group
    if (int_created_by != int_user_id) {
        send(client_sock, "4031\r\n", 6, 0); // No authority
        return 4031;
    }
    mysql_free_result(res);

    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

// Liệt kê danh sách nhóm người dùng
int handle_list_group(int client_sock, const char *token){
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Step 2: get group_id user joined
    snprintf(query, sizeof(query), "SELECT group_id FROM user_groups WHERE user_id = %d", user_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);

    MYSQL_ROW row;
    char combined_groups[4096] = "";

    if (mysql_num_rows(res) == 0) {
        // User has no groups
        send_message(client_sock, 2000, NULL);
        mysql_free_result(res);
        return 2000;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        int group_id = atoi(row[0]);

        // Get group_name from groups table
        snprintf(query, sizeof(query), "SELECT group_name FROM `groups` WHERE group_id = %d", group_id);
        if (mysql_query(conn, query)) {
            fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
            return -1;
        }

        MYSQL_RES *res_group = mysql_store_result(conn);

        MYSQL_ROW row_group = mysql_fetch_row(res_group);
        char *group_name = row_group[0];

        // Create string in format group_name&group_id
        char group_entry[256];
        snprintf(group_entry, sizeof(group_entry), "%s&%d", group_name, group_id);

        // Append to combined_groups with separator ||
        if (strlen(combined_groups) > 0) {
            strncat(combined_groups, "||", sizeof(combined_groups) - strlen(combined_groups) - 1);
        }
        strncat(combined_groups, group_entry, sizeof(combined_groups) - strlen(combined_groups) - 1);

        mysql_free_result(res_group);
    }

    mysql_free_result(res);

    // Send response to client
    send_message(client_sock, 2000, combined_groups);

    return 2000;
}

// Liệt kê danh sách thành viên nhóm
int handle_list_group_members(int client_sock, const char* token, int group_id){
    int code;

    // Step 1 check group exist
    code = check_group_exist_by_id(client_sock, group_id);
    if (code){
        return code;
    }

    // Step 2 check user in group
    int user_id = get_user_id_by_token(token);
    code = check_user_in_group(client_sock, user_id, group_id);
    if (code){
        return code;
    }

    // Step 3 get group members
    char query[4096];
    snprintf(query, sizeof(query), "SELECT user_id FROM user_groups WHERE group_id = %d", group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    MYSQL_ROW row;
    char combined_members[4096] = "";

    if (mysql_num_rows(res) == 0) {
        // User has no groups
        send_message(client_sock, 2000, NULL);
        mysql_free_result(res);
        return 2000;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        int user_id = atoi(row[0]);

        // Get username from users table
        snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", user_id);
        if (mysql_query(conn, query)) {
            fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
            return -1;
        }

        MYSQL_RES *res_user = mysql_store_result(conn);

        MYSQL_ROW row_user = mysql_fetch_row(res_user);
        char *username = row_user[0];

        // Create string in format username&user_id
        char user_entry[256];
        snprintf(user_entry, sizeof(user_entry), "%s&%d", username, user_id);

        // Append to combined_groups with separator ||
        if (strlen(combined_members) > 0) {
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

int handle_respond_invitation(int client_sock, const char* token, int group_id, const char* approval_status){
    char query[512];
    int code;
    
    // Step 1: Check if group_id is existed
    code = check_group_exist_by_id(client_sock, group_id);
    if(code){
        return code;
    }

    // Step 2: Check if token is existed
    int int_user_id = get_user_id_by_token(token);
    code = check_user_exist_by_id(client_sock, int_user_id);
    if (code) {
        return code;
    }

    // Step 3: Check if user_id in group
    code = check_user_in_group(client_sock, int_user_id, group_id);
    if (code){
        return code;
    }

    // Step 4: Check if approval_status is valid
    if (strcmp(approval_status, "accepted") != 0 && strcmp(approval_status, "rejected") != 0) {
        send_message(client_sock, 4000, "Invalid approval status");
        return 4000;
    }

    // Step 5: Update the group_requests table based on approval_status
    if (strcmp(approval_status, "accept") == 0) {
        snprintf(query, sizeof(query), "UPDATE group_requests SET request_status = 'accepted' WHERE user_id = %d AND group_id = %d AND request_type = 'invitation'", int_user_id, group_id);
    } else {
        snprintf(query, sizeof(query), "UPDATE group_requests SET request_status = 'rejected' WHERE user_id = %d AND group_id = %d AND request_type = 'invitation'", int_user_id, group_id);
    }

    if (mysql_query(conn, query)) {
        fprintf(stderr, "UPDATE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 6: If accepted, add the user to the group
    if (strcmp(approval_status, "accept") == 0) {
        snprintf(query, sizeof(query), "INSERT INTO user_groups (user_id, group_id) VALUES (%d, %d)", int_user_id, group_id);
        if (mysql_query(conn, query)) {
            fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
            return -1;
        }
    }

    // Step 7: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}

int handle_approve_join_request(int client_sock, const char* token, int user_id, const char* approval_status){
    char query[512];
    int code;

    // Step 1: Check if token is valid and get user_id of the requester
    int int_user_id = get_user_id_by_token(token);
    code = check_user_exist_by_id(client_sock, int_user_id);
    if (code) {
        return code;
    }

    // Step 2: Check if user_id exists
    code = check_user_exist_by_id(client_sock, user_id);
    if (code) {
        return code;
    }

    // Step 3: Check if approval_status is valid
    if (strcmp(approval_status, "accepted") != 0 && strcmp(approval_status, "rejected") != 0) {
        send_message(client_sock, 4000, "Invalid approval status");
        return 4000;
    }

    // Step 4: Update the group_requests table based on approval_status
    if (strcmp(approval_status, "accepted") == 0) {
        snprintf(query, sizeof(query), "UPDATE group_requests SET request_status = 'accepted' WHERE user_id = %d AND request_type = 'join_request'", user_id);
    } else {
        snprintf(query, sizeof(query), "UPDATE group_requests SET request_status = 'rejected' WHERE user_id = %d AND request_type = 'join_request'", user_id);
    }

    if (mysql_query(conn, query)) {
        fprintf(stderr, "UPDATE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: If accepted, add the user to the group
    if (strcmp(approval_status, "accepted") == 0) {
        snprintf(query, sizeof(query), "INSERT INTO user_groups (user_id, group_id) VALUES (%d, (SELECT group_id FROM group_requests WHERE user_id = %d AND request_type = 'join_request'))", user_id, user_id);
        if (mysql_query(conn, query)) {
            fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
            return -1;
        }
    }

    // Step 6: Send the response back to the client
    send_message(client_sock, 2000, NULL);
    return 2000;
}