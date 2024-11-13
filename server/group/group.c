#include <stdio.h>
#include <string.h>
#include <mysql/mysql.h>
#include <sys/socket.h>
#include "../user/user.h"
#include "../token/token.h"
#include "../database/db.h"
#include "group.h"

extern MYSQL *conn;

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

    // Prepare the response
    char response[8192];
    snprintf(response, sizeof(response), "2000 %s\r\n", activity);

    // Send the response to the client
    send(client_sock, response, strlen(response), 0);

    // Clean up
    mysql_free_result(res);
}


// Handle create group
int handle_create_group(int client_sock, int *token, const char *group_name) {
    char query[512];
    char username[50];

    // Step 1: Find username by user_id
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *token);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 1. Error: %s\n", mysql_error(conn));
        return 4040; // User not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
            return 4040;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row == NULL) {
            fprintf(stderr, "mysql_fetch_row() failed. Error: %s\n", mysql_error(conn));
            mysql_free_result(res);
            return 4040; // User not found
        }

        strncpy(username, row[0], sizeof(username) - 1);
        username[sizeof(username) - 1] = '\0';  // Ensure null-termination

        mysql_free_result(res);
    }

    // Step 2: Check if group name already exists
    snprintf(query, sizeof(query), "SELECT group_name FROM `groups` WHERE group_name = '%s'", group_name);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 2. Error: %s\n", mysql_error(conn));
        return -1;
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
            return -1;
        }

        if (mysql_num_rows(res) > 0) {
            mysql_free_result(res);
            return 4090; // Group name already exists
        }

        mysql_free_result(res);
    }

    // Step 3: Create the group
    snprintf(query, sizeof(query), "INSERT INTO `groups` (group_name, created_by) VALUES ('%s', %d)", group_name, *token);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    return 2000; // Success
}

int handle_request_join_group(int client_sock, int *token, int *group_id) {
    char query[512];
    char username[50];

    // Step 1: Find username by user_id
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *token);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 1. Error: %s\n", mysql_error(conn));
        return 4041; // User not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 1 Error: %s\n", mysql_error(conn));
            return 4040;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row == NULL) {
            fprintf(stderr, "mysql_fetch_row() failed 4. Error: %s\n", mysql_error(conn));
            mysql_free_result(res);
            return 4041; // User not found
        }

        strncpy(username, row[0], sizeof(username) - 1);
        username[sizeof(username) - 1] = '\0';  // Ensure null-termination

        mysql_free_result(res);
    }

    // Step 2: Check if group id already exists
    snprintf(query, sizeof(query), "SELECT group_id FROM `groups` WHERE group_id = %d", *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 2. Error: %s\n", mysql_error(conn));
        return -1;
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed 2. Error: %s\n", mysql_error(conn));
            return -1;
        }

        if (mysql_num_rows(res) == 0) {
            mysql_free_result(res);
            return 4040; // Group name not exists
        }

        mysql_free_result(res);
    }

    // Step 3: Check if user already in group
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", *token, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed 3. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_ROW row = mysql_fetch_row(res);
    if (row != NULL && atoi(row[0]) > 0) {
        printf("The pair (user_id: %d, group_id: %d) exists in the user_groups table.\n", *token, *group_id);
        return 4090; // User already in group
    } else {
        printf("The pair (user_id: %d, group_id: %d) does not exist in the user_groups table.\n", *token, *group_id);
        return 2000; // Success
    }
    mysql_free_result(res);
}


int handle_invite_user_to_group(int client_sock, int *token, int *group_id, int *invitee_id) {
    char query[512];
    char username[50];

    // Step 1: Check if token is existed
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *token);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 1. Error: %s\n", mysql_error(conn));
        return 4041; // User not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
            return 4041;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row == NULL) {
            fprintf(stderr, "mysql_fetch_row() failed. Error: %s\n", mysql_error(conn));
            mysql_free_result(res);
            return 4041; // User not found
        }

        strncpy(username, row[0], sizeof(username) - 1);
        username[sizeof(username) - 1] = '\0';  // Ensure null-termination

        mysql_free_result(res);
    }
    // Step 2: Check if group_id is existed
    snprintf(query, sizeof(query), "SELECT group_id FROM `groups` WHERE group_id = %d", *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 2. Error: %s\n", mysql_error(conn));
        return 4040; // Group not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 2 Error: %s\n", mysql_error(conn));
            return 4040;
        }

        if (mysql_num_rows(res) == 0) {
            mysql_free_result(res);
            return 4040; // Group not found
        }

        mysql_free_result(res);
    }
    // Step 3: Check if token is in group_id
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", *token, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed Error: %s\n", mysql_error(conn));
        return 4030;
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 3 Error: %s\n", mysql_error(conn));
            return 4030;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row == NULL || atoi(row[0]) == 0) {
            mysql_free_result(res);
            return 4030; // User not in group
        }

        mysql_free_result(res);
    }
    // Step 4: Check if invitee_id is existed
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *invitee_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return 4042; // Invitee not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 4 Error: %s\n", mysql_error(conn));
            return 4042;
        }

        if (mysql_num_rows(res) == 0) {
            mysql_free_result(res);
            return 4042; // Invitee not found
        }

        mysql_free_result(res);
    }
    // Step 5: Check if invitee_id is in group_id
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", *invitee_id, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 5. Error: %s\n", mysql_error(conn));
        return 4090;
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 5 Error: %s\n", mysql_error(conn));
            return 4090;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row != NULL && atoi(row[0]) > 0) {
            mysql_free_result(res);
            return 4090; // Invitee already in group
        }

        mysql_free_result(res);
    }
    // Step 6: Insert into user_groups
    snprintf(query, sizeof(query), "INSERT INTO user_groups (user_id, group_id) VALUES (%d, %d)", *invitee_id, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return 2000;
    }
}

int handle_leave_group(int client_sock, int *token, int *group_id){
    char query[512];
    char username[50];

    // Step 1: Check if token is existed
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *token);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 1. Error: %s\n", mysql_error(conn));
        return 4041; // User not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
            return 4041;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row == NULL) {
            fprintf(stderr, "mysql_fetch_row() failed. Error: %s\n", mysql_error(conn));
            mysql_free_result(res);
            return 4041; // User not found
        }

        strncpy(username, row[0], sizeof(username) - 1);
        username[sizeof(username) - 1] = '\0';  // Ensure null-termination

        mysql_free_result(res);
    }
    // Step 2: Check if group_id is existed
    snprintf(query, sizeof(query), "SELECT group_id FROM `groups` WHERE group_id = %d", *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 2. Error: %s\n", mysql_error(conn));
        return 4040; // Group not found
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 2 Error: %s\n", mysql_error(conn));
            return 4040;
        }

        if (mysql_num_rows(res) == 0) {
            mysql_free_result(res);
            return 4040; // Group not found
        }

        mysql_free_result(res);
    }

    // Step 3: Check if token is in group_id
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", *token, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed Error: %s\n", mysql_error(conn));
        return 4030;
    } else {
        MYSQL_RES *res = mysql_store_result(conn);
        if (res == NULL) {
            fprintf(stderr, "mysql_store_result() failed. 3 Error: %s\n", mysql_error(conn));
            return 4030;
        }

        MYSQL_ROW row = mysql_fetch_row(res);
        if (row == NULL || atoi(row[0]) == 0) {
            mysql_free_result(res);
            return 4030; // User not in group
        }

        mysql_free_result(res);
    }

    // Step 4: Delete from user_groups
    snprintf(query, sizeof(query), "DELETE FROM user_groups WHERE user_id = %d AND group_id = %d", *token, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "DELETE failed. Error: %s\n", mysql_error(conn));
        return 2000;
    }
}
