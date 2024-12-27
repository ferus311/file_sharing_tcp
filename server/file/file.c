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
#include <openssl/bio.h>
#include <openssl/evp.h>
#include <errno.h>

#include "../group/utils.h"
#include "file.h"
#include "../database/db.h"

#define BUFFER_SIZE 1024
#define FILE_PATH_SIZE 2048

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
        if (row[0] == NULL || row[1] == NULL)
        {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int dir_id = atoi(row[0]); // id thư mục
        char *dir_name = row[1];   // tên thư mục

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(dir_name) + 10 > sizeof(response))
        {
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
        if (row2[0] == NULL || row2[1] == NULL)
        {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int file_id = atoi(row2[0]); // id tệp
        char *file_name = row2[1];   // tên tệp

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(file_name) + 10 > sizeof(response))
        {
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
        if (row[0] == NULL || row[1] == NULL)
        {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int dir_id = atoi(row[0]); // id thư mục
        char *dir_name = row[1];   // tên thư mục

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(dir_name) + 10 > sizeof(response))
        {
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
        if (row2[0] == NULL || row2[1] == NULL)
        {
            continue; // Bỏ qua nếu dữ liệu NULL
        }

        int file_id = atoi(row2[0]); // id tệp
        char *file_name = row2[1];   // tên tệp

        // Kiểm tra xem có đủ không gian trong response buffer
        if (strlen(response) + strlen(file_name) + 10 > sizeof(response))
        {
            fprintf(stderr, "Buffer overflow detected in response.\n");
            send(client_sock, "5000\r\n", 6, 0); // Lỗi bộ đệm
            mysql_free_result(res2);
            return -1;
        }

        // Thêm tệp vào phản hồi
        snprintf(response + strlen(response), sizeof(response) - strlen(response), "F&%d&%s||", file_id, file_name);
    }

    mysql_free_result(res2); // Giải phóng kết quả truy vấn tệp

    // Gửi kết quả về client
    send(client_sock, response, strlen(response), 0);

    return 2000; // Thành công
}

// Download file
void handle_download_file(int client_sock, const char *token, int file_id)
{
    printf("Debug: handle_download_file called with token: %s, file_id: %d\n", token, file_id);

    // Truy vấn cơ sở dữ liệu để lấy thông tin tệp
    char query[BUFFER_SIZE];
    snprintf(query, sizeof(query), "SELECT file_name, file_path FROM files WHERE file_id = %d", file_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to query file info: %s\n", mysql_error(conn));
        send(client_sock, "500 Internal Server Error", strlen("500 Internal Server Error"), 0);
        return;
    }

    MYSQL_RES *result = mysql_store_result(conn);
    if (result == NULL)
    {
        fprintf(stderr, "Failed to store result: %s\n", mysql_error(conn));
        send(client_sock, "500 Internal Server Error", strlen("500 Internal Server Error"), 0);
        return;
    }

    MYSQL_ROW row = mysql_fetch_row(result);
    if (row == NULL)
    {
        send(client_sock, "404 File Not Found", strlen("404 File Not Found"), 0);
        mysql_free_result(result);
        return;
    }

    const char *file_name = row[0];
    const char *file_path = row[1];
    printf("Debug: file_name: %s, file_path: %s\n", file_name, file_path);

    // Mở tệp để đọc
    FILE *file = fopen(file_path, "rb");
    if (file == NULL)
    {
        perror("Failed to open file");
        send(client_sock, "500 Internal Server Error", strlen("500 Internal Server Error"), 0);
        mysql_free_result(result);
        return;
    }

    // Gửi tệp về client
    char buffer[BUFFER_SIZE];
    size_t bytes_read;
    while ((bytes_read = fread(buffer, 1, sizeof(buffer), file)) > 0)
    {
        if (send(client_sock, buffer, bytes_read, 0) < 0)
        {
            perror("Failed to send file");
            break;
        }
        printf("Debug: Sent %zu bytes\n", bytes_read);
    }

    fclose(file);
    mysql_free_result(result);

    // Log the action
    snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'download_file', 'group', %d, 'Downloaded file %s')", get_user_id_by_token(token), file_id, file_name);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
    }

    // Send status code 2000 when download is complete
    send_status(client_sock, 2000);
}

// Xóa file
int handle_delete_file(int client_sock, const char *token, int file_id)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Truy vấn file để lấy thông tin file_path, uploaded_by và group_id
    snprintf(query, sizeof(query), "SELECT file_path, uploaded_by, group_id FROM files WHERE file_id = %d", file_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
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
    char file_path[500];
    int group_id = atoi(row[2]);
    snprintf(file_path, sizeof(file_path), "%s", row[0]);
    mysql_free_result(res);

    // Kiểm tra quyền: tìm role trong bảng user_groups
    snprintf(query, sizeof(query), "SELECT role FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4030); // Không có quyền xóa file
        mysql_free_result(res);
        return -1;
    }

    row = mysql_fetch_row(res);
    if (strcmp(row[0], "admin") != 0)
    {
        send_status(client_sock, 4030); // Không có quyền xóa file
        mysql_free_result(res);
        return -1;
    }
    mysql_free_result(res);

    // Xóa file trong hệ thống
    if (remove(file_path) != 0)
    {
        send_status(client_sock, 5000); // Lỗi xóa file trong hệ thống
        return -1;
    }

    // Xóa file trong cơ sở dữ liệu
    snprintf(query, sizeof(query), "DELETE FROM files WHERE file_id = %d", file_id);
    if (mysql_query(conn, query) == 0)
    {
        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'delete_file', 'group', %d, 'Deleted file %s')", user_id, group_id, file_path);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }

        send_status(client_sock, 2000); // Xóa file thành công
        return 0;
    }

    send_status(client_sock, 5000); // Lỗi xóa file trong database
    return -1;
}

void delete_files_in_directory(int dir_id)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT file_path FROM files WHERE dir_id = %d", dir_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to query files in directory: %s\n", mysql_error(conn));
        return;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL)
    {
        fprintf(stderr, "Failed to store result: %s\n", mysql_error(conn));
        return;
    }

    MYSQL_ROW row;
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        if (row[0] != NULL)
        {
            remove(row[0]); // Delete the physical file
        }
    }

    mysql_free_result(res);
}

void delete_subdirectories_and_files(int dir_id)
{
    char query[512];
    snprintf(query, sizeof(query), "SELECT dir_id FROM directories WHERE parent_id = %d", dir_id);

    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to query subdirectories: %s\n", mysql_error(conn));
        return;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL)
    {
        fprintf(stderr, "Failed to store result: %s\n", mysql_error(conn));
        return;
    }

    MYSQL_ROW row;
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        int sub_dir_id = atoi(row[0]);
        delete_files_in_directory(sub_dir_id);
        delete_subdirectories_and_files(sub_dir_id);
    }

    mysql_free_result(res);

    // Delete files in the current directory
    delete_files_in_directory(dir_id);
}

int handle_delete_folder(int client_sock, const char *token, int dir_id)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Truy vấn để lấy thông tin `group_id` của thư mục
    snprintf(query, sizeof(query), "SELECT group_id FROM directories WHERE dir_id = %d", dir_id);

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // Thư mục không tồn tại
        mysql_free_result(res);
        return -1;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    int group_id = atoi(row[0]); // group_id chứa thư mục
    mysql_free_result(res);

    // Kiểm tra quyền xóa: user_id phải là admin của nhóm
    snprintf(query, sizeof(query), "SELECT role FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // Lỗi truy vấn SQL
        return -1;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4030); // Không có quyền xóa thư mục
        mysql_free_result(res);
        return -1;
    }

    row = mysql_fetch_row(res);
    if (strcmp(row[0], "admin") != 0)
    {
        send_status(client_sock, 4030); // Không có quyền xóa thư mục
        mysql_free_result(res);
        return -1;
    }
    mysql_free_result(res);

    // Xóa các tệp và thư mục con
    delete_subdirectories_and_files(dir_id);

    // Xóa thư mục khỏi bảng directories
    snprintf(query, sizeof(query), "DELETE FROM directories WHERE dir_id = %d", dir_id);

    if (mysql_query(conn, query) == 0)
    {
        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'delete_folder', 'group', %d, 'Deleted folder %d')", user_id, group_id, dir_id);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }

        send_status(client_sock, 2000); // Xóa thư mục thành công
        return 0;
    }

    send_status(client_sock, 5000); // Lỗi xóa thư mục trong database
    return -1;
}

int calcDecodeLength(const char *b64input, size_t len)
{
    int padding = 0;

    if (len >= 2 && b64input[len - 1] == '=' && b64input[len - 2] == '=')
        padding = 2;
    else if (len >= 1 && b64input[len - 1] == '=')
        padding = 1;

    return (int)(len * 0.75) - padding;
}

unsigned char *base64_decode_v2(const char *data, size_t input_length, size_t *output_length)
{
    BIO *bio, *b64;

    int decodeLen = calcDecodeLength(data, input_length);
    unsigned char *buffer = (unsigned char *)malloc(decodeLen + 1);
    if (!buffer)
    {
        perror("Failed to allocate memory");
        return NULL;
    }
    buffer[decodeLen] = '\0'; // Ensure null-terminated

    bio = BIO_new_mem_buf((void *)data, -1);
    b64 = BIO_new(BIO_f_base64());
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL); // No newlines
    bio = BIO_push(b64, bio);

    *output_length = BIO_read(bio, buffer, input_length);
    if (*output_length <= 0)
    {
        perror("BIO_read failed");
        free(buffer);
        buffer = NULL;
    }

    BIO_free_all(bio);
    return buffer;
}

size_t get_file_size(const char *file_path)
{
    struct stat st;
    if (stat(file_path, &st) == 0)
    {
        return st.st_size;
    }
    return 0;
}

void handle_receive_file_chunk(int client_sock, const char *token, int group_id, int dir_id, const char *data)
{
    char file_name[BUFFER_SIZE];
    char file_extension[BUFFER_SIZE];
    int chunk_index, total_chunks;
    char chunk_data[BUFFER_SIZE * 4]; // Dành cho dữ liệu base64

    int user_id = get_user_id_by_token(token);

    // Parse data
    if (sscanf(data, "%1023[^|]||%1023[^|]||%d||%d||%4100s", file_name, file_extension, &chunk_index, &total_chunks, chunk_data) != 5)
    {
        perror("Failed to parse chunk data");
        send(client_sock, "5000 Failed to parse chunk data", strlen("5000 Failed to parse chunk data"), 0);
        return;
    }

    // Decode base64
    size_t decoded_length;
    unsigned char *decoded_data = base64_decode_v2(chunk_data, strlen(chunk_data), &decoded_length);
    if (!decoded_data)
    {
        perror("Failed to decode base64 data");
        send(client_sock, "5000 Failed to decode base64 data", strlen("5000 Failed to decode base64 data"), 0);
        return;
    }

    // Create directory if not exists
    char group_folder[FILE_PATH_SIZE];
    snprintf(group_folder, sizeof(group_folder), "uploads/group_%d", group_id);
    if (mkdir(group_folder, 0777) && errno != EEXIST)
    {
        perror("Failed to create group directory");
        free(decoded_data);
        send(client_sock, "5000 Failed to create group directory", strlen("5000 Failed to create group directory"), 0);
        return;
    }

    // Create sub-directory for dir_id if not exists
    char dir_folder[FILE_PATH_SIZE];
    snprintf(dir_folder, sizeof(dir_folder), "%s/dir_%d", group_folder, dir_id);
    if (mkdir(dir_folder, 0777) && errno != EEXIST)
    {
        perror("Failed to create directory");
        free(decoded_data);
        send(client_sock, "5000 Failed to create directory", strlen("5000 Failed to create directory"), 0);
        return;
    }

    // File path
    char file_path[FILE_PATH_SIZE];
    snprintf(file_path, sizeof(file_path), "%s/%s", dir_folder, file_name);

    // If it's the first chunk, remove the existing file if it exists
    if (chunk_index == 0)
    {
        // Check if the file already exists in the database
        char query[BUFFER_SIZE];
        snprintf(query, sizeof(query), "SELECT file_id, file_path FROM files WHERE file_name = '%s' AND dir_id = %d", file_name, dir_id);
        if (mysql_query(conn, query))
        {
            perror("Failed to query existing file");
            free(decoded_data);
            send(client_sock, "5000 Failed to query existing file", strlen("5000 Failed to query existing file"), 0);
            return;
        }

        MYSQL_RES *res = mysql_store_result(conn);
        if (res)
        {
            MYSQL_ROW row = mysql_fetch_row(res);
            if (row)
            {
                // File exists, remove it from the filesystem and database
                remove(row[1]);
                snprintf(query, sizeof(query), "DELETE FROM files WHERE file_id = %s", row[0]);
                mysql_query(conn, query);
            }
            mysql_free_result(res);
        }

        // Remove the existing file if it exists in the filesystem
        remove(file_path);
    }

    // Open file in append mode
    FILE *file = fopen(file_path, "ab");
    if (file == NULL)
    {
        perror("Failed to open file");
        free(decoded_data);
        send(client_sock, "5000 Failed to write file", strlen("5000 Failed to write file"), 0);
        return;
    }

    fwrite(decoded_data, 1, decoded_length, file);
    fclose(file);
    free(decoded_data);

    if (chunk_index == total_chunks - 1)
    {
        // File is fully received, save to database
        size_t file_size = get_file_size(file_path);
        char query[BUFFER_SIZE];
        snprintf(query, sizeof(query),
                 "INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) "
                 "VALUES ('%s', '%s', %zu, (SELECT user_id FROM users WHERE user_id = '%d'), %d, %d) "
                 "ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), file_size = VALUES(file_size), uploaded_by = VALUES(uploaded_by), upload_date = CURRENT_TIMESTAMP",
                 file_name, file_path, file_size, user_id, group_id, dir_id);

        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to save file info to database. Error: %s\n", mysql_error(conn));
            send(client_sock, "5000 Failed to save file info", strlen("5000 Failed to save file info"), 0);
            return;
        }

        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'upload_file', 'group', %d, 'Uploaded file %s')", user_id, group_id, file_name);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }

        printf("File received and saved to database successfully: %s\n", file_path);
        send(client_sock, "2000 File uploaded successfully", strlen("2000 File uploaded successfully"), 0);
    }
    else
    {
        printf("Chunk %d of %d uploaded successfully\n", chunk_index, total_chunks);
        send(client_sock, "2001 Chunk uploaded successfully", strlen("2001 Chunk uploaded successfully"), 0);
    }
}

void handle_create_folder(int client_sock, const char *token, int group_id, int parent_dir_id, const char *folder_name)
{
    char query[BUFFER_SIZE];
    int user_id = get_user_id_by_token(token);

    // Check if the folder already exists
    snprintf(query, sizeof(query), "SELECT dir_id FROM directories WHERE dir_name = '%s' AND parent_id = %d AND group_id = %d", folder_name, parent_dir_id, group_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res && mysql_num_rows(res) > 0)
    {
        send_status(client_sock, 4001); // Folder already exists
        mysql_free_result(res);
        return;
    }
    mysql_free_result(res);

    // Insert the new folder into the database
    snprintf(query, sizeof(query), "INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES ('%s', %d, %d, %d)", folder_name, parent_dir_id, group_id, user_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL insert error
        return;
    }

    // Log the action
    snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'create_folder', 'group', %d, 'Created folder %s')", user_id, group_id, folder_name);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
    }

    send_status(client_sock, 2000); // Success
}

void handle_copy_item(int client_sock, const char *token, int item_id, int target_dir_id, int is_file)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Check if the token is valid
    if (user_id == -1)
    {
        send_status(client_sock, 4030); // Invalid token
        return;
    }

    printf("Debug: User ID: %d\n", user_id);

    // Check if the target directory belongs to the user's group
    snprintf(query, sizeof(query), "SELECT group_id FROM directories WHERE dir_id = %d", target_dir_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // Directory not found
        if (res)
            mysql_free_result(res);
        return;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    if (row == NULL)
    {
        send_status(client_sock, 4040); // Directory not found
        mysql_free_result(res);
        return;
    }

    int group_id = atoi(row[0]);
    mysql_free_result(res);

    printf("Debug: Group ID: %d\n", group_id);

    // Check if the user is an admin of the group
    snprintf(query, sizeof(query), "SELECT role FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4030); // No permission
        if (res)
            mysql_free_result(res);
        return;
    }

    row = mysql_fetch_row(res);
    if (row == NULL || strcmp(row[0], "admin") != 0)
    {
        send_status(client_sock, 4030); // No permission
        mysql_free_result(res);
        return;
    }
    mysql_free_result(res);

    printf("Debug: User is admin\n");

    if (is_file)
    {
        // Copy file
        snprintf(query, sizeof(query), "SELECT file_name, file_path, file_size, uploaded_by FROM files WHERE file_id = %d", item_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL query error
            return;
        }

        res = mysql_store_result(conn);
        if (res == NULL || mysql_num_rows(res) == 0)
        {
            send_status(client_sock, 4040); // File not found
            if (res)
                mysql_free_result(res);
            return;
        }

        row = mysql_fetch_row(res);
        if (row == NULL)
        {
            send_status(client_sock, 4040); // File not found
            mysql_free_result(res);
            return;
        }

        char source_path[FILE_PATH_SIZE];
        snprintf(source_path, sizeof(source_path), "%s", row[1]);
        char dest_path[FILE_PATH_SIZE];
        snprintf(dest_path, sizeof(dest_path), "uploads/group_%d/dir_%d/%s", group_id, target_dir_id, row[0]);

        // Check if the file already exists in the target directory
        snprintf(query, sizeof(query), "SELECT file_id, file_path FROM files WHERE file_name = '%s' AND dir_id = %d", row[0], target_dir_id);
        if (mysql_query(conn, query))
        {
            perror("Failed to query existing file");
            mysql_free_result(res);
            send_status(client_sock, 5000); // SQL query error
            return;
        }

        MYSQL_RES *res2 = mysql_store_result(conn);
        if (res2)
        {
            MYSQL_ROW row2 = mysql_fetch_row(res2);
            if (row2)
            {
                // File exists, remove it from the filesystem and database
                remove(row2[1]);
                snprintf(query, sizeof(query), "DELETE FROM files WHERE file_id = %s", row2[0]);
                mysql_query(conn, query);
            }
            mysql_free_result(res2);
        }

        // Create destination directory if it does not exist
        char dest_dir[FILE_PATH_SIZE];
        snprintf(dest_dir, sizeof(dest_dir), "uploads/group_%d/dir_%d", group_id, target_dir_id);
        if (mkdir(dest_dir, 0777) && errno != EEXIST)
        {
            perror("Failed to create destination directory");
            send_status(client_sock, 5000); // Error creating directory
            mysql_free_result(res);
            return;
        }

        FILE *src = fopen(source_path, "rb");
        if (src == NULL)
        {
            perror("Failed to open source file");
            send_status(client_sock, 4040); // File not found or error opening file
            mysql_free_result(res);
            return;
        }

        FILE *dest = fopen(dest_path, "wb");
        if (dest == NULL)
        {
            perror("Failed to open destination file");
            fclose(src);
            send_status(client_sock, 4040); // File not found or error opening file
            mysql_free_result(res);
            return;
        }

        char buffer[BUFFER_SIZE];
        size_t bytes;
        while ((bytes = fread(buffer, 1, BUFFER_SIZE, src)) > 0)
        {
            fwrite(buffer, 1, bytes, dest);
        }

        fclose(src);
        fclose(dest);

        // Insert the new file into the database
        snprintf(query, sizeof(query),
                 "INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) "
                 "VALUES ('%s', '%s', %zu, %d, %d, %d)",
                 row[0], dest_path, atoi(row[2]), atoi(row[3]), group_id, target_dir_id);

        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL insert error
            mysql_free_result(res);
            return;
        }

        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'copy_file', 'group', %d, 'Copied file %s to directory %d')", user_id, group_id, row[0], target_dir_id);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }

        printf("Debug: File copied and inserted into database successfully\n");
        mysql_free_result(res);
        send_status(client_sock, 2000); // Success
    }
    else
    {
        // Copy directory
        snprintf(query, sizeof(query), "SELECT dir_name FROM directories WHERE dir_id = %d", item_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL query error
            return;
        }

        res = mysql_store_result(conn);
        if (res == NULL || mysql_num_rows(res) == 0)
        {
            send_status(client_sock, 4040); // Directory not found
            if (res)
                mysql_free_result(res);
            return;
        }

        row = mysql_fetch_row(res);
        if (row == NULL)
        {
            send_status(client_sock, 4040); // Directory not found
            mysql_free_result(res);
            return;
        }

        char dir_name[256];
        snprintf(dir_name, sizeof(dir_name), "%s", row[0]);
        mysql_free_result(res);

        // Check if the directory already exists in the target directory
        snprintf(query, sizeof(query), "SELECT dir_id FROM directories WHERE dir_name = '%s' AND parent_id = %d", dir_name, target_dir_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL query error
            return;
        }

        MYSQL_RES *res2 = mysql_store_result(conn);
        if (res2 && mysql_num_rows(res2) > 0)
        {
            MYSQL_ROW row2 = mysql_fetch_row(res2);
            snprintf(query, sizeof(query), "DELETE FROM directories WHERE dir_id = %s", row2[0]);
            mysql_query(conn, query);
            mysql_free_result(res2);
        }

        // Insert the new directory into the database
        snprintf(query, sizeof(query), "INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES ('%s', %d, %d, %d)", dir_name, target_dir_id, group_id, user_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL insert error
            return;
        }

        // Get the new directory ID
        int new_dir_id = mysql_insert_id(conn);

        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'copy_folder', 'group', %d, 'Copied folder %s to directory %d')", user_id, group_id, dir_name, target_dir_id);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }

        // Copy subdirectories and files
        copy_subdirectories_and_files(client_sock, token, item_id, new_dir_id);

        send_status(client_sock, 2000); // Success
    }
}

void copy_subdirectories_and_files(int client_sock, const char *token, int parent_dir_id, int new_parent_dir_id)
{
    char query[512];
    MYSQL_RES *res;
    MYSQL_ROW row;

    // Copy subdirectories
    snprintf(query, sizeof(query), "SELECT dir_id FROM directories WHERE parent_id = %d", parent_dir_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    res = mysql_store_result(conn);
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        handle_copy_item(client_sock, token, atoi(row[0]), new_parent_dir_id, 0);
    }
    mysql_free_result(res);

    // Copy files
    snprintf(query, sizeof(query), "SELECT file_id FROM files WHERE dir_id = %d", parent_dir_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    res = mysql_store_result(conn);
    while ((row = mysql_fetch_row(res)) != NULL)
    {
        handle_copy_item(client_sock, token, atoi(row[0]), new_parent_dir_id, 1);
    }
    mysql_free_result(res);
}

void handle_move_item(int client_sock, const char *token, int item_id, int target_dir_id, int is_file)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Check if the token is valid
    if (user_id == -1)
    {
        send_status(client_sock, 4030); // Invalid token
        return;
    }

    // Check if the target directory belongs to the user's group
    snprintf(query, sizeof(query), "SELECT group_id FROM directories WHERE dir_id = %d", target_dir_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    MYSQL_RES *res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4040); // Directory not found
        if (res)
            mysql_free_result(res);
        return;
    }

    MYSQL_ROW row = mysql_fetch_row(res);
    int group_id = atoi(row[0]);
    mysql_free_result(res);

    // Check if the user is an admin of the group
    snprintf(query, sizeof(query), "SELECT role FROM user_groups WHERE user_id = %d AND group_id = %d", user_id, group_id);
    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL query error
        return;
    }

    res = mysql_store_result(conn);
    if (res == NULL || mysql_num_rows(res) == 0)
    {
        send_status(client_sock, 4030); // No permission
        if (res)
            mysql_free_result(res);
        return;
    }

    row = mysql_fetch_row(res);
    if (strcmp(row[0], "admin") != 0)
    {
        send_status(client_sock, 4030); // No permission
        mysql_free_result(res);
        return;
    }
    mysql_free_result(res);

    if (is_file)
    {
        // Check if the file already exists in the target directory
        snprintf(query, sizeof(query), "SELECT file_id, file_path FROM files WHERE file_name = (SELECT file_name FROM files WHERE file_id = %d) AND dir_id = %d", item_id, target_dir_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL query error
            return;
        }

        MYSQL_RES *res2 = mysql_store_result(conn);
        if (res2)
        {
            MYSQL_ROW row2 = mysql_fetch_row(res2);
            if (row2)
            {
                // File exists, remove it from the filesystem and database
                remove(row2[1]);
                snprintf(query, sizeof(query), "DELETE FROM files WHERE file_id = %s", row2[0]);
                mysql_query(conn, query);
            }
            mysql_free_result(res2);
        }

        // Move file
        snprintf(query, sizeof(query), "UPDATE files SET dir_id = %d WHERE file_id = %d", target_dir_id, item_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL update error
            return;
        }

        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'move_file', 'group', %d, 'Moved file %d to directory %d')", user_id, group_id, item_id, target_dir_id);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }
    }
    else
    {
        // Check if the directory already exists in the target directory
        snprintf(query, sizeof(query), "SELECT dir_id FROM directories WHERE dir_name = (SELECT dir_name FROM directories WHERE dir_id = %d) AND parent_id = %d", item_id, target_dir_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL query error
            return;
        }

        MYSQL_RES *res2 = mysql_store_result(conn);
        if (res2 && mysql_num_rows(res2) > 0)
        {
            MYSQL_ROW row2 = mysql_fetch_row(res2);
            snprintf(query, sizeof(query), "DELETE FROM directories WHERE dir_id = %s", row2[0]);
            mysql_query(conn, query);
            mysql_free_result(res2);
        }

        // Move directory
        snprintf(query, sizeof(query), "UPDATE directories SET parent_id = %d WHERE dir_id = %d", target_dir_id, item_id);
        if (mysql_query(conn, query))
        {
            send_status(client_sock, 5000); // SQL update error
            return;
        }

        // Log the action
        snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'move_folder', 'group', %d, 'Moved folder %d to directory %d')", user_id, group_id, item_id, target_dir_id);
        if (mysql_query(conn, query))
        {
            fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
        }
    }

    send_status(client_sock, 2000); // Success
}

void handle_rename_item(int client_sock, const char *token, int item_id, const char *new_name, int is_file)
{
    char query[512];
    int user_id = get_user_id_by_token(token);

    // Check if the token is valid
    if (user_id == -1)
    {
        send_status(client_sock, 4030); // Invalid token
        return;
    }

    if (is_file)
    {
        // Rename file
        snprintf(query, sizeof(query), "UPDATE files SET file_name = '%s' WHERE file_id = %d", new_name, item_id);
    }
    else
    {
        // Rename directory
        snprintf(query, sizeof(query), "UPDATE directories SET dir_name = '%s' WHERE dir_id = %d", new_name, item_id);
    }

    if (mysql_query(conn, query))
    {
        send_status(client_sock, 5000); // SQL update error
        return;
    }

    // Log the action
    snprintf(query, sizeof(query), "INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (%d, 'rename_%s', 'group', %d, 'Renamed %s to %s')", user_id, is_file ? "file" : "folder", item_id, is_file ? "file" : "folder", new_name);
    if (mysql_query(conn, query))
    {
        fprintf(stderr, "Failed to log action: %s\n", mysql_error(conn));
    }

    send_status(client_sock, 2000); // Success
}
