#ifndef UTILS_H
#define UTILS_H

int check_group_exist_by_name(int client_sock, const char *group_name);
int check_group_exist_by_id(int client_sock, int *group_id);
int check_user_in_group(int client_sock, int *user_id, int *group_id);
int check_user_exist_by_id(int client_sock, int *user_id);

#endif // GROUP_H