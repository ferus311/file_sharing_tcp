#include <stdio.h>
#include <string.h>
#include <mysql/mysql.h>
#include <sys/socket.h>
#include "group.h"

// Check group exist by name
int check_group_exist_by_name(int client_sock, const char *group_name){
    char query[512];

    snprintf(query, sizeof(query), "SELECT group_name FROM `groups` WHERE group_name = '%s'", group_name);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed step 2. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (mysql_num_rows(res) > 0) {
        send(client_sock, "4090\r\n", 6, 0);
        return 4090; // Group name already exists
    }
    mysql_free_result(res);
    return 0;
}

// Check group exist by id
int check_group_exist_by_id(int client_sock, int *group_id){
    char query[512];
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
    return 0;
}

// Check user in group
int check_user_in_group(int client_sock, int *user_id, int *group_id){
    snprintf(query, sizeof(query), "SELECT COUNT(*) FROM user_groups WHERE user_id = %d AND group_id = %d", *user_id, *group_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);
    if (res != 0){
        send(client_sock, "4091\r\n", 6, 0);
        // DOCS: sửa mã lỗi
        return 4091;
    }
    mysql_free_result(res);
    return 0;
}

// Check user exist by id
int check_user_exist_by_id(int client_sock, int *user_id){
    snprintf(query, sizeof(query), "SELECT username FROM users WHERE user_id = %d", *user_id);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }
    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        send(client_sock, "4041\r\n", 6, 0); // User not found
        return 4041; // User not found
    }
    mysql_free_result(res);
    return 0;
}
