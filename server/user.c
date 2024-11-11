#include <stdio.h>
#include <string.h>
#include <mysql/mysql.h>
#include "user.h"
#include "db.h"

// Handle user login
int handle_login(int client_sock, const char *username, const char *password) {
    char query[512];
    snprintf(query, sizeof(query), "SELECT * FROM users WHERE username = '%s' AND password = '%s'", username, password);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (mysql_num_rows(res) == 0) {
        return 4040;  // User not found
    } else {
        return 2000;  // Success
    }
}

// Handle user registration
int handle_registration(int client_sock, const char *username, const char *password) {
    char query[512];
    snprintf(query, sizeof(query), "INSERT INTO users (username, password) VALUES ('%s', '%s')", username, password);

    if (mysql_query(conn, query)) {
        fprintf(stderr, "INSERT failed. Error: %s\n", mysql_error(conn));
        return -1;
    }

    return 2000;  // Success
}
