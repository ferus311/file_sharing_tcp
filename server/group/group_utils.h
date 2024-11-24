#ifndef GROUP_H
#define GROUP_H

int check_group_exist_by_name(const char *group_name);
int check_group_exist_by_id(int *group_id);
int check_user_in_group(int *user_id, int *group_id);
int check_user_exist_by_id(int client_sock, int *user_id);

#endif // GROUP_H