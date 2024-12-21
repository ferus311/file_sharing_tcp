#ifndef GROUP_H
#define GROUP_H

void show_log(int client_sock, int group_id, const char *timestamp);
int handle_create_group(int client_sock, const char *token, const char *group_name);
int handle_request_join_group(int client_sock, const char *token, int group_id) ;
int handle_list_requests(int client_sock, const char *token, int group_id) ;
int handle_invite_user_to_group(int client_sock, int group_id, int invitee_id);
int handle_leave_group(int client_sock, const char* token, int group_id);
int handle_remove_member(int client_sock, const char *token, int group_id, int user_id);
int handle_list_group(int client_sock, const char *token);
int handle_list_group_members(int client_sock, const char* token, int group_id);
int handle_respond_invitation(int client_sock, const char* token, int group_id, const char* approval_status);
int handle_approve_join_request(int client_sock, const char* token, int request_id, const char* approval_status);
int handle_list_available_invite_user(int client_sock, const char *token, int group_id);
#endif // GROUP_H