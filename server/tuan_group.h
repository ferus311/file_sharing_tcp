#ifndef TUAN_GROUP_H
#define TUAN_GROUP_H

int handle_create_group(int client_sock, int *token, const char *group_name);
int handle_request_join_group(int client_sock, int *token, int *group_id);
int handle_invite_user_to_group(int client_sock, int *token, int *group_id, int *invitee_id);
int handle_leave_group(int client_sock, int *token, int *group_id);

#endif
