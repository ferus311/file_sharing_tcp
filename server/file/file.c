#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <mysql/mysql.h>

#include "file.h"
#include "../database/db.h"

#define BUFFER_SIZE 1024

extern MYSQL *conn; // Sử dụng kết nối MySQL toàn cục từ db.h

// Gửi mã trạng thái tới client
void send_status(int client_sock, int status_code)
{
    char response[32];
    snprintf(response, sizeof(response), "%d\r\n", status_code);
    send(client_sock, response, strlen(response), 0);
}

// Liệt kê các file trong thư mục
int handle_list_directory(int client_sock, const char *token, const char *group_id, const char *dir_id)
{
    // // Lấy user_id từ token
    // int user_id = get_user_id_by_token(token);
    // if (user_id == -1)
    // {
    //     send(client_sock, "4010\r\n", 6, 0); // Token không hợp lệ
    //     return 4010;  // Mã lỗi nếu không tìm thấy user_id từ token
    // }

    char query[1024];
    char response[2048] = "2000 "; // 2000 là mã thành công

    // Nếu dir_id là NULL hoặc không có, liệt kê các thư mục con trong nhóm
    if (dir_id == NULL || strcmp(dir_id, "") == 0) {
        // Liệt kê các thư mục gốc trong nhóm
        snprintf(query, sizeof(query), 
                 "SELECT dir_id, dir_name FROM directories WHERE group_id = '%s' AND parent_id IS NULL", group_id);
    } else {
        // Nếu có dir_id, liệt kê các thư mục con trong thư mục này
        snprintf(query, sizeof(query), 
                 "SELECT dir_id, dir_name FROM directories WHERE group_id = '%s' AND parent_id = '%s'", 
                 group_id, dir_id);
    }

    // Thực thi câu truy vấn thư mục
    if (mysql_query(conn, query))
    {
        send(client_sock, "5000\r\n", 6, 0); // Lỗi trong quá trình thực thi truy vấn
        return 5000;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL)
    {
        send(client_sock, "5000\r\n", 6, 0); // Lỗi lưu kết quả
        return 5000; 
    }

    MYSQL_ROW row;

    // Duyệt qua các thư mục con và thêm vào kết quả phản hồi
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "DIR:%s&%s||", row[0], row[1]);
    }

    mysql_free_result(res); // Giải phóng kết quả truy vấn thư mục

    // Truy vấn các tệp trong thư mục
    if (dir_id == NULL || strcmp(dir_id, "") == 0) {
        // Nếu dir_id là NULL, tìm các tệp không có thư mục (dir_id IS NULL)
        snprintf(query, sizeof(query), 
                 "SELECT file_id, file_name FROM files WHERE group_id = '%s' AND dir_id IS NULL", group_id);
    } else {
        // Nếu có dir_id, tìm các tệp trong thư mục đó
        snprintf(query, sizeof(query), 
                 "SELECT file_id, file_name FROM files WHERE group_id = '%s' AND dir_id = '%s'", 
                 group_id, dir_id);
    }

    // Thực thi câu truy vấn tệp
    if (mysql_query(conn, query))
    {
        send(client_sock, "5000\r\n", 6, 0); // Lỗi trong quá trình thực thi truy vấn
        return 5000;
    }

    res = mysql_store_result(conn);
    if (res == NULL)
    {
        send(client_sock, "5000\r\n", 6, 0); // Lỗi lưu kết quả
        return 5000;
    }

    // Duyệt qua các file và thêm vào kết quả phản hồi
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "FILE:%s&%s||", row[0], row[1]);
    }

    mysql_free_result(res); // Giải phóng kết quả truy vấn tệp

    // Nếu có thư mục hoặc tệp, gửi kết quả về client
    if (strlen(response) > 5) // Kiểm tra xem có thư mục hoặc tệp nào không (có '2000 ' ở đầu)
    {
        send(client_sock, response, strlen(response), 0);
    }
    else
    {
        send(client_sock, "4040\r\n", 6, 0); // Không có thư mục hay tệp nào
    }

    return 2000; // Thành công
}


// Upload file
int upload_file(int client_sock, const char *user_id, const char *group_id, const char *data, const char *file_name, const char *file_size, const char *dir_id)
{
    char file_path[256];
    snprintf(file_path, sizeof(file_path), "./data/%s/%s/%s", group_id, dir_id, file_name);

    FILE *dest = fopen(file_path, "wb");
    if (dest == NULL)
    {
        send_status(client_sock, 4040); // Lỗi mở file
        return -1;
    }

    // Ghi dữ liệu vào file (giả sử dữ liệu được gửi sau yêu cầu)
    char buffer[BUFFER_SIZE];
    int bytes_read;
    int remaining_size = atoi(file_size);

    while ((bytes_read = recv(client_sock, buffer, BUFFER_SIZE, 0)) > 0 && remaining_size > 0)
    {
        fwrite(buffer, 1, bytes_read, dest);
        remaining_size -= bytes_read;
    }

    fclose(dest);

    // Thêm thông tin file vào cơ sở dữ liệu
    char query[512];
    snprintf(query, sizeof(query),
             "INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) "
             "VALUES ('%s', '%s', %s, %s, %s, %s)",
             file_name, file_path, file_size, user_id, group_id, dir_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi chèn vào DB
        return -1;
    }

    send_status(client_sock, 2000); // Thành công
    return 0;
}

// Download file
int download_file(int client_sock, const char *user_id, const char *file_id, const char *file_size)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT file_path FROM files WHERE file_id = %s", file_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL)
    {
        send_status(client_sock, 4040); // File không tồn tại
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    if (row == NULL)
    {
        send_status(client_sock, 4040);
        mysql_free_result(res);
        return -1;
    }

    FILE *src = fopen(row[0], "rb");
    mysql_free_result(res);

    if (src == NULL)
    {
        send_status(client_sock, 4040); // File không tồn tại
        return -1;
    }

    send_status(client_sock, 2000); // Thành công

    char buffer[BUFFER_SIZE];
    int bytes;
    while ((bytes = fread(buffer, 1, BUFFER_SIZE, src)) > 0)
    {
        send(client_sock, buffer, bytes, 0);
    }

    fclose(src);
    return 0;
}

// Sửa tên file
int rename_file(int client_sock, const char *user_id, const char *item_id, const char *new_name)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT file_path FROM files WHERE file_id = %s", item_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // File không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    char old_path[256];
    snprintf(old_path, sizeof(old_path), "%s", row[0]);
    mysql_free_result(res);

    char new_path[256];
    snprintf(new_path, sizeof(new_path), "./data/files/%s", new_name);

    if (rename(old_path, new_path) == 0)
    {
        snprintf(query, sizeof(query), "UPDATE files SET file_name = '%s', file_path = '%s' WHERE file_id = %s", new_name, new_path, item_id);
        if (mysql_query(conn, query) == 0)
        {
            send_status(client_sock, 2000); // Thành công
            return 0;
        }
    }

    send_status(client_sock, 5000); // Lỗi đổi tên
    return -1;
}

// Xóa file
int delete_file(int client_sock, const char *user_id, const char *item_id, const char *item_type)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT file_path FROM files WHERE file_id = %s", item_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // File không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    char file_path[256];
    snprintf(file_path, sizeof(file_path), "%s", row[0]);
    mysql_free_result(res);

    if (remove(file_path) == 0)
    {
        snprintf(query, sizeof(query), "DELETE FROM files WHERE file_id = %s", item_id);
        if (mysql_query(conn, query) == 0)
        {
            send_status(client_sock, 2000); // Thành công
            return 0;
        }
    }

    send_status(client_sock, 5000); // Lỗi xóa file
    return -1;
}

// Sao chép file
int copy_file(int client_sock, const char *user_id, const char *item_id, const char *target_directory_id)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT file_name, file_path FROM files WHERE file_id = %s", item_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // File không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    char source_path[256];
    snprintf(source_path, sizeof(source_path), "%s", row[1]);

    char dest_path[256];
    snprintf(dest_path, sizeof(dest_path), "./data/%s/%s/%s", user_id, target_directory_id, row[0]);
    mysql_free_result(res);

    FILE *src = fopen(source_path, "rb");
    FILE *dest = fopen(dest_path, "wb");
    char buffer[BUFFER_SIZE];
    size_t bytes;

    if (src == NULL || dest == NULL)
    {
        send_status(client_sock, 4040); // File không tồn tại hoặc lỗi mở file
        return -1;
    }

    while ((bytes = fread(buffer, 1, BUFFER_SIZE, src)) > 0)
    {
        fwrite(buffer, 1, bytes, dest);
    }

    fclose(src);
    fclose(dest);
    send_status(client_sock, 2000); // Thành công
    return 0;
}

// Di chuyển file
int move_file(int client_sock, const char *user_id, const char *item_id, const char *target_directory_id)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT file_name, file_path FROM files WHERE file_id = %s", item_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // File không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    char source_path[256];
    snprintf(source_path, sizeof(source_path), "%s", row[1]);

    char dest_path[256];
    snprintf(dest_path, sizeof(dest_path), "./data/%s/%s/%s", user_id, target_directory_id, row[0]);
    mysql_free_result(res);

    if (rename(source_path, dest_path) == 0)
    {
        snprintf(query, sizeof(query), "UPDATE files SET file_path = '%s', dir_id = %s WHERE file_id = %s", dest_path, target_directory_id, item_id);
        if (mysql_query(conn, query) == 0)
        {
            send_status(client_sock, 2000); // Thành công
            return 0;
        }
    }

    send_status(client_sock, 5000); // Lỗi di chuyển
    return -1;
}
