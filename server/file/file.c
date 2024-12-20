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

#include "../group/utils.h"
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

int handle_list_group_content(int client_sock, const char *token, int group_id)
{
    char query[2048];
    char response[2048] = "2000 "; // Mã thành công

    // Liệt kê các thư mục gốc trong nhóm
    snprintf(query, sizeof(query), 
             "SELECT dir_id, dir_name FROM directories WHERE group_id = %d AND parent_id IS NULL", group_id);

    // Thực thi câu truy vấn thư mục
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send(client_sock, "5000\r\n", 6, 0); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    MYSQL_ROW row;

    // Duyệt qua các thư mục con và thêm vào kết quả phản hồi
    while ((row = mysql_fetch_row(res)) != NULL) 
    {
        if (row[0] == NULL || row[1] == NULL) {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int dir_id = atoi(row[0]); // id thư mục
        char *dir_name = row[1];    // tên thư mục

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(dir_name) + 10 > sizeof(response)) {
            fprintf(stderr, "Buffer overflow detected in response.\n");
            send(client_sock, "5000\r\n", 6, 0); // Lỗi bộ đệm
            mysql_free_result(res);
            return -1;
        }

        // Thêm thư mục vào phản hồi
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "D&%d&%s||", dir_id, dir_name);
    }

    mysql_free_result(res); // Giải phóng kết quả truy vấn thư mục

    // Truy vấn các tệp trong nhóm (không phân biệt theo thư mục)
    snprintf(query, sizeof(query), 
             "SELECT file_id, file_name FROM files WHERE group_id = %d AND dir_id IS NULL", group_id);

    // Log câu truy vấn SQL cho tệp

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send(client_sock, "5000\r\n", 6, 0); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res2 = mysql_store_result(conn);
    MYSQL_ROW row2;

    // Duyệt qua các tệp và thêm vào kết quả phản hồi
    while ((row2 = mysql_fetch_row(res2)) != NULL) 
    {
        if (row2[0] == NULL || row2[1] == NULL) {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int file_id = atoi(row2[0]); // id tệp
        char *file_name = row2[1];    // tên tệp

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(file_name) + 10 > sizeof(response)) {
            fprintf(stderr, "Buffer overflow detected in response.\n");
            send(client_sock, "5000\r\n", 6, 0); // Lỗi bộ đệm
            mysql_free_result(res2);
            return -1;
        }

        // Thêm tệp vào phản hồi
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "F&%d&%s||", file_id, file_name);
    }

    mysql_free_result(res2); // Giải phóng kết quả truy vấn tệp

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

int handle_list_directory(int client_sock, const char *token, int group_id, int dir_id)
{
    char query[2048];
    char response[2048] = "2000 "; // Mã thành công

    // Liệt kê các thư mục gốc trong nhóm
    snprintf(query, sizeof(query), 
             "SELECT dir_id, dir_name FROM directories WHERE group_id = %d AND parent_id = %d", group_id, dir_id);

    // Thực thi câu truy vấn thư mục
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send(client_sock, "5000\r\n", 6, 0); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    MYSQL_ROW row;

    // Duyệt qua các thư mục con và thêm vào kết quả phản hồi
    while ((row = mysql_fetch_row(res)) != NULL) 
    {
        if (row[0] == NULL || row[1] == NULL) {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int dir_id = atoi(row[0]); // id thư mục
        char *dir_name = row[1];    // tên thư mục

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(dir_name) + 10 > sizeof(response)) {
            fprintf(stderr, "Buffer overflow detected in response.\n");
            send(client_sock, "5000\r\n", 6, 0); // Lỗi bộ đệm
            mysql_free_result(res);
            return -1;
        }

        // Thêm thư mục vào phản hồi
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "D&%d&%s||", dir_id, dir_name);
    }

    mysql_free_result(res); // Giải phóng kết quả truy vấn thư mục

    // Truy vấn các tệp trong nhóm (không phân biệt theo thư mục)
    snprintf(query, sizeof(query), 
             "SELECT file_id, file_name FROM files WHERE group_id = %d AND dir_id = %d", group_id, dir_id);

    // Log câu truy vấn SQL cho tệp

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "SELECT failed. Error: %s\n", mysql_error(conn));
        send(client_sock, "5000\r\n", 6, 0); // Lỗi truy vấn
        return -1;
    }

    MYSQL_RES *res2 = mysql_store_result(conn);
    MYSQL_ROW row2;

    // Duyệt qua các tệp và thêm vào kết quả phản hồi
    while ((row2 = mysql_fetch_row(res2)) != NULL) 
    {
        if (row2[0] == NULL || row2[1] == NULL) {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int file_id = atoi(row2[0]); // id tệp
        char *file_name = row2[1];    // tên tệp

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(file_name) + 10 > sizeof(response)) {
            fprintf(stderr, "Buffer overflow detected in response.\n");
            send(client_sock, "5000\r\n", 6, 0); // Lỗi bộ đệm
            mysql_free_result(res2);
            return -1;
        }

        // Thêm tệp vào phản hồi
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "F&%d&%s||", file_id, file_name);
    }

    mysql_free_result(res2); // Giải phóng kết quả truy vấn tệp

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
int handle_delete_file(int client_sock, const char *token, int file_id)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Truy vấn file để lấy thông tin file_path, uploaded_by và group_id
    snprintf(query, sizeof(query), "SELECT file_path, uploaded_by, group_id FROM files WHERE file_id = %d", file_id);

    if (mysql_query(conn, query)) {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0) {
        send_status(client_sock, 4040); // File không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    char file_path[500];
    // int uploaded_by = atoi(row[1]);
    int group_id = atoi(row[2]);
    snprintf(file_path, sizeof(file_path), "%s", row[0]);
    mysql_free_result(res);

    // Kiểm tra quyền: tìm created_by trong bảng groups
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);
    if (mysql_query(conn, query)) {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0) {
        send_status(client_sock, 4040); // Group không tồn tại
        mysql_free_result(res);
        return -1;
    }

    row = mysql_fetch_row(res);
    int created_by = atoi(row[0]);
    mysql_free_result(res);

    // Kiểm tra quyền xóa file: user_id phải là uploaded_by hoặc created_by
    if (user_id != created_by) {
        send_status(client_sock, 4030); // Không có quyền xóa file
        return -1;
    }

    // Xóa file trong hệ thống
    // if (remove(file_path) != 0) {
    //     send_status(client_sock, 5000); // Lỗi xóa file trong hệ thống
    //     return -1;
    // }

    // Xóa file trong cơ sở dữ liệu
    snprintf(query, sizeof(query), "DELETE FROM files WHERE file_id = %d", file_id);
    if (mysql_query(conn, query) == 0) {
        send_status(client_sock, 2000); // Xóa file thành công
        return 0;
    }

    send_status(client_sock, 5000); // Lỗi xóa file trong database
    return -1;
}

// Xóa thư mục
int handle_delete_dir(int client_sock, const char *token, int dir_id) {
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Truy vấn để lấy thông tin `created_by` và `group_id` của thư mục
    snprintf(query, sizeof(query), "SELECT created_by, group_id FROM directories WHERE dir_id = %d", dir_id);

    if (mysql_query(conn, query)) {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0) {
        send_status(client_sock, 4040); // Thư mục không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    // int dir_created_by = atoi(row[0]); // Người tạo thư mục
    int group_id = atoi(row[1]);       // group_id chứa thư mục
    mysql_free_result(res);

    // Truy vấn `created_by` của nhóm để xác định người tạo nhóm
    snprintf(query, sizeof(query), "SELECT created_by FROM `groups` WHERE group_id = %d", group_id);

    if (mysql_query(conn, query)) {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0) {
        send_status(client_sock, 4040); // Nhóm không tồn tại
        mysql_free_result(res);
        return -1;
    }

    row = mysql_fetch_row(res);
    int group_created_by = atoi(row[0]); // Người tạo nhóm
    mysql_free_result(res);

    // Kiểm tra quyền xóa: user_id phải là dir_created_by hoặc group_created_by
    if (user_id != group_created_by) {
        send_status(client_sock, 4030); // Không có quyền xóa thư mục
        return -1;
    }

    // Xóa thư mục khỏi bảng directories
    snprintf(query, sizeof(query), "DELETE FROM directories WHERE dir_id = %d", dir_id);

    if (mysql_query(conn, query) == 0) {
        send_status(client_sock, 2000); // Xóa thư mục thành công
        return 0;
    }

    send_status(client_sock, 5000); // Lỗi xóa thư mục trong database
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
