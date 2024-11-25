#include <stdio.h>
#include <string.h>
#include <mysql/mysql.h>
#include <sys/socket.h>
#include "../user/user.h"
#include "../token/token.h"
#include "../database/db.h"
#include "group.h"
#include "group_utils.h"

extern MYSQL *conn;

// Gửi mã trạng thái tới client
void send_status(int client_sock, int status_code, const char *message)
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
    send_status(client_sock, 2000, activity);

    // Clean up
    mysql_free_result(res);
}


// Tạo nhóm
int handle_create_group(int client_sock, const char *token, const char *group_name) {
    char query[512];
    char user_id[256];
    int code;

    // Step 1: Check if group name already exists
    code = check_group_exist_by_name(group_name);
    if(code){
        return code;
    }

    // Step 2: Create the group
    // FIXME: how to get user_id
    int result = validate_token(token, user_id);
    int user_id_int = atoi(user_id);

    snprintf(query, sizeof(query), "INSERT INTO `groups` (group_name, created_by) VALUES ('%s', %d)", group_name, user_id_int);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 3: Send the response back to the client
    send_status(client_sock, 2000, NULL);

    return 2000; // Success
}

// Tham gia nhóm
// FIXME: change token to user_id 
int handle_request_join_group(int client_sock, int *token, int *group_id) {
    char query[512];
    char user_id[256];
    int code;

    // Step 1: Find username by user_id
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *token);
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
    code = check_group_exist_by_id(group_id);
    if(code){
        return code;
    }

    // Step 3: Check if user already in group
    code = check_user_in_group(token, group_id);
    if(code){
        return code;
    }

    // Step 4: Insert into user_groups
    snprintf(query, sizeof(query), "INSERT INTO user_groups (user_id, group_id) VALUES (%d, %d)", *token, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_status(client_sock, 2000, NULL);    
}

// Mời người dùng vào nhóm
int handle_invite_user_to_group(int client_sock, int *group_id, int *invitee_id) {
    char query[512];
    char username[50];
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
    snprintf(query, sizeof(query), "INSERT INTO user_groups (user_id, group_id) VALUES (%d, %d)", *invitee_id, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 6: Send the response back to the client
    send_status(client_sock, 2000, NULL);
}

// Rời nhóm
int handle_leave_group(int client_sock, int *token, int *group_id){
    char query[512];
    char username[50];
    int code;

    // Step 1: Check if token is existed
    code = check_user_exist_by_id(client_sock, token);
    if (code) {
        return code;
    }

    // Step 2: Check if group_id is existed
    code = check_user_exist_by_id(client_sock, token);
    if (code){
        return code;
    }

    // Step 3: Check if token is in group_id
    code = check_user_in_group(client_sock, token, group_id);
    if (code){
        return code;
    }


    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", *token, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_status(client_sock, 2000, NULL);
}

// Xóa thành viên
int handle_remove_member(int client_sock, int *token, int *group_id, int *user_id){
    char query[512];
    char username[50];
    
    // Step 1: Check if group_id is existed
    snprintf(query, sizeof(query), "SELECT group_id FROM `groups` WHERE group_id = %d", *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    } 
    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {  // Khong tim thay group
        send(client_sock, "4040\r\n", 6, 0);
        return 4040;
    }
    mysql_free_result(res);

    // Step 2: Check if user_id in group
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", *user_id, *group_id);
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
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);
    res = mysql_store_result(conn);
    if (res != token) {
        send(client_sock, "4031\r\n", 6, 0); // No authority
    }
    mysql_free_result(res);

    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", *user_id, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    // Step 5: Send the response back to the client
    send_status(client_sock, 2000, NULL);
}

// Liệt kê danh sách nhóm người dùng
int handle_list_group(int client_sock, int *user_id){
    char query[512];
    char username[50];
    int code;

    // Step 1: Check if user_id is existed
    code = check_user_exist_by_id()

    // Step 2: get group_id user joined
    snprintf(query, sizeof(query), "SELECT group_id FROM user_groups WHERE user_id = %d", *user_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_ROW row;
    char combined_groups[4096] = "";

    if (mysql_num_rows(res) == 0) {
        // User has no groups
        send_status(client_sock, 2000, NULL);
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
        if (res_group == NULL) {
            fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
            mysql_free_result(res);
            return -1;
        }

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
    send_status(client_sock, 2000, combined_groups);

    return 2000;
}

int handle_list_group_members(int client_sock, int *group_id){
    // Step 1 check group exist
}