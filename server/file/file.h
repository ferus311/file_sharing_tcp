#ifndef FILE_H
#define FILE_H

// Khai báo các hàm xử lý file
int handle_list_directory(int client_sock, const char *token, int group_id, int dir_id);
int handle_list_group_content(int client_sock, const char *token, int group_id);
int handle_delete_folder(int client_sock, const char *token, int dir_id);
int handle_delete_file(int client_sock, const char *token, int file_id);
void handle_download_file(int client_sock, const char *token, int file_id);
int rename_file(int client_sock, const char *user_id, const char *item_id, const char *new_name);
int move_file(int client_sock, const char *user_id, const char *item_id, const char *target_directory_id);
void handle_receive_file_chunk(int client_sock, const char *token, int group_id,int dir_id, const char *data);
void handle_create_folder(int client_sock, const char *token, int group_id, int parent_dir_id, const char *folder_name);
void handle_copy_item(int client_sock, const char *token, int item_id, int target_dir_id, int is_file);
void handle_move_item(int client_sock, const char *token, int item_id, int target_dir_id, int is_file);
void handle_rename_item(int client_sock, const char *token, int item_id, const char *new_name, int is_file);

#endif // FILE_H
