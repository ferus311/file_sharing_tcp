#ifndef TUAN_SERVER_H
#define TUAN_SERVER_H

#include <mysql/mysql.h>

extern MYSQL *conn;

void handle_client_request(int client_sock);
void init_mysql();

#endif