#ifndef SERVER_H
#define SERVER_H

#include <mysql/mysql.h>

extern MYSQL *conn;

void handle_client_request(int client_sock);
void init_mysql();

#endif
