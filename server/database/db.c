#include <stdio.h>
#include <stdlib.h>
#include <mysql/mysql.h>
#include "db.h"

#define MYSQL_HOST "localhost"
#define MYSQL_USER "fong"
#define MYSQL_PASS "123"
#define MYSQL_DB "file_sharing_v2"

// Initialize MySQL connection
void init_mysql() {
    conn = mysql_init(NULL);
    if (conn == NULL) {
        fprintf(stderr, "mysql_init() failed\n");
        exit(1);
    }

    if (mysql_real_connect(conn, MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB, 0, NULL, 0) == NULL) {
        fprintf(stderr, "mysql_real_connect() failed\n");
        mysql_close(conn);
        exit(1);
    }
}
