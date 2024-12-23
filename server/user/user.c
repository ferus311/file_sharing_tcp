#include <stdio.h>
#include <string.h>
#include <mysql/mysql.h>
#include <sys/socket.h>
#include "../token/token.h"
#include "../database/db.h"
#include "user.h"
#include "../group/utils.h"



// Handle user login
int handle_login(int client_sock, const char *username, const char *password) {
    char query[512];
    snprintf(query, sizeof(query), "SELECT user_id, password FROM users WHERE username = '%s'", username);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (mysql_num_rows(res) == 0) {
        send(client_sock, "4040\r\n", 6, 0);  // User not found
        mysql_free_result(res);
        return 4040;
    } else {
        MYSQL_ROW row = mysql_fetch_row(res);
        if (strcmp(row[1], password) != 0) {
            send(client_sock, "4041\r\n", 6, 0);
            mysql_free_result(res);
            return 4010;
        } else {
            // Generate token
            char token[512];
            create_token(row[0], token);

            // Send token to client
            char response[1024];
            snprintf(response, sizeof(response), "2000 %s\r\n", token);
            send(client_sock, response, strlen(response), 0);

            mysql_free_result(res);
            return 2000;  // Success
        }
    }
}
// Handle user registration
int handle_registration(int client_sock, const char *username, const char *password) {
    char query[512];
    snprintf(query, sizeof(query), "SELECT * FROM users WHERE username = '%s'", username);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (mysql_num_rows(res) > 0) {
        send(client_sock, "4090\r\n", 6, 0);  // Username already exists
        mysql_free_result(res);
        return 4090;
    }

    snprintf(query, sizeof(query), "INSERT INTO users (username, password) VALUES ('%s', '%s')", username, password);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        mysql_free_result(res);
        return -1;
    }

    // Retrieve the user_id of the newly created user
    snprintf(query, sizeof(query), "SELECT user_id FROM users WHERE username = '%s'", username);
    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT user_id failed. Error: %s\n", mysql_error(conn));
        mysql_free_result(res);
        return -1;
    }
    res = mysql_store_result(conn);
    MYSQL_ROW row = mysql_fetch_row(res);
    char token[512];
    create_token(row[0], token);
    mysql_free_result(res);

    // Send token to client
    char response[1024];
    snprintf(response, sizeof(response), "2000 %s\r\n", token);
    send(client_sock, response, strlen(response), 0);

    return 2000;  // Success
}

int handle_check_admin(int client_sock, const char *token, int group_id) {
    char query[512];
    int user_id = get_user_id_by_token(token); // Lấy user_id trực tiếp từ token

    // Truy vấn vai trò của user trong nhóm
    snprintf(query, sizeof(query), "SELECT role FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT role failed. Error: %s\n", mysql_error(conn));
        send(client_sock, "5000\r\n", 6, 0); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "mysql_store_result() failed. Error: %s\n", mysql_error(conn));
        send(client_sock, "5000\r\n", 6, 0); // Lỗi truy vấn
        return -1;
    }

    if (mysql_num_rows(res) == 0) {
        send(client_sock, "4040\r\n", 6, 0); // User không có trong nhóm
        mysql_free_result(res);
        return 4040;
    }

    // Lấy role và kiểm tra quyền admin
    MYSQL_ROW row = mysql_fetch_row(res);
    int result = -1;
    if (row && row[0]) {
        const char *role = row[0];
        if (strcmp(role, "admin") == 0) {
            result = 1; // Là admin
        } else if (strcmp(role, "member") == 0) {
            result = 0; // Là thành viên
        }
    }
    mysql_free_result(res);

    // Gửi kết quả phản hồi
    char response[1024];
    snprintf(response, sizeof(response), "2000 %d\r\n", result);
    send(client_sock, response, strlen(response), 0);

    return 200;
}
