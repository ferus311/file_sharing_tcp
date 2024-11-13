#ifndef GROUP_H
#define GROUP_H

void show_log(int client_sock, int group_id, const char *timestamp);
int handle_create_group(int client_sock, int *token, const char *group_name);
int handle_request_join_group(int client_sock, int *token, int *group_id);
int handle_invite_user_to_group(int client_sock, int *token, int *group_id, int *invitee_id);
int handle_leave_group(int client_sock, int *token, int *group_id);


#endif // GROUP_H
