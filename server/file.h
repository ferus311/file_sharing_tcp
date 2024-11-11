#ifndef FILE_H
#define FILE_H

// Khai báo các hàm xử lý file
int list_directory(int client_sock, const char *group_id, const char *dir_id);
int upload_file(int client_sock, const char *user_id, const char *group_id, const char *data, const char *file_name, const char *file_size, const char *dir_id);
int download_file(int client_sock, const char *user_id, const char *file_id, const char *file_size);
int rename_file(int client_sock, const char *user_id, const char *item_id, const char *new_name);
int delete_file(int client_sock, const char *user_id, const char *item_id, const char *item_type);
int copy_file(int client_sock, const char *user_id, const char *item_id, const char *target_directory_id);
int move_file(int client_sock, const char *user_id, const char *item_id, const char *target_directory_id);

#endif // FILE_H
