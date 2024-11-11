#ifndef USER_H
#define USER_H

int handle_login(int client_sock, const char *username, const char *password);
int handle_registration(int client_sock, const char *username, const char *password);

#endif
