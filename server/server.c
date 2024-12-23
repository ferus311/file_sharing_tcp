#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <mysql/mysql.h>
#include "sys/select.h"

#include "token/token.h"
#include "user/user.h"
#include "file/file.h"
#include "group/group.h"
#include "database/db.h"

#define PORT 1234
#define BACKLOG 10
#define BUFFER_SIZE 1024

MYSQL *conn;

void handle_client_request(int client_sock);
void parse_message(const char *message, char *command, char *token, char *data);
void handle_command(int client_sock, const char *command, const char *token, const char *data);
void split(const char *str, const char *delim, char **out, int max_datas);


int main()
{
    int server_sock, client_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_len;
    fd_set read_fds;
    int max_fd;

    // Initialize MySQL
    init_mysql();

    // Create server socket
    server_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (server_sock < 0)
    {
        perror("socket failed");
        exit(1);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(server_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        perror("bind failed");
        exit(1);
    }

    if (listen(server_sock, BACKLOG) < 0)
    {
        perror("listen failed");
        exit(1);
    }

    printf("Server is listening on port %d...\n", PORT);

    FD_ZERO(&read_fds);
    FD_SET(server_sock, &read_fds);
    max_fd = server_sock;

    while (1)
    {
        fd_set temp_fds = read_fds;
        int activity = select(max_fd + 1, &temp_fds, NULL, NULL, NULL);

        if (activity < 0)
        {
            perror("select failed");
            break;
        }

        if (FD_ISSET(server_sock, &temp_fds))
        {
            client_addr_len = sizeof(client_addr);
            client_sock = accept(server_sock, (struct sockaddr *)&client_addr, &client_addr_len);
            if (client_sock < 0)
            {
                perror("accept failed");
                continue;
            }

            FD_SET(client_sock, &read_fds);
            if (client_sock > max_fd)
            {
                max_fd = client_sock;
            }
        }

        for (int i = 0; i <= max_fd; i++)
        {
            if (FD_ISSET(i, &temp_fds))
            {
                if (i == server_sock)
                {
                    continue;
                }

                handle_client_request(i);

                close(i);
                FD_CLR(i, &read_fds);
            }
        }
    }

    mysql_close(conn);
    close(server_sock);

    return 0;
}

void handle_client_request(int client_sock)
{
    char buffer[1024 * 4 + 256]; // chunk data + token + command
    int bytes_read;

    // Read request from client
    bytes_read = recv(client_sock, buffer, sizeof(buffer), 0);
    if (bytes_read <= 0)
    {
        close(client_sock);
        return;
    }

    buffer[bytes_read] = '\0';

    char command[50], token[512], data[1024];
    printf("%s\n", buffer);
    parse_message(buffer, command, token, data);
    handle_command(client_sock, command, token, data);
}

void parse_message(const char *message, char *command, char *token, char *data)
{
    // Initialize token and data to empty strings
    token[0] = '\0';
    data[0] = '\0';

    // Try to parse message with token
    int num_parsed = sscanf(message, "%s %s %[^\r\n]", command, token, data);

    // If only command and data are present, shift data to token
    if (strcmp(command, "LOGIN") == 0 || strcmp(command, "REGISTER") == 0)
    {
        strcpy(data, token);
        token[0] = '\0';
    }
}

int validate_token_or_send_error(int client_sock, const char *token)
{
    if (token == NULL || strlen(token) == 0)
    {
        send(client_sock, "4011 No token provided\r\n", 24, 0);
        return 0;
    }

    char user_id[256];
    if (!validate_token(token, user_id))
    {
        send(client_sock, "4011 Token invalid or expired\r\n", 31, 0);
        return 0;
    }

    return 1;
}

void handle_command(int client_sock, const char *command, const char *token, const char *data)
{
    // check if have token then validate it
    if (token != NULL && strlen(token) > 0)
    {
        if (!validate_token_or_send_error(client_sock, token))
        {
            return;
        }
    }

    char *datas[10] = {NULL}; // Adjust size as needed

    if (strcmp(command, "LOGIN") == 0)
    {
        split(data, "||", datas, 2);
        handle_login(client_sock, datas[0], datas[1]);
    }
    else if (strcmp(command, "REGISTER") == 0)
    {
        split(data, "||", datas, 2);
        handle_registration(client_sock, datas[0], datas[1]);
    }
    else if (strcmp(command, "CHECK_ADMIN") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_check_admin(client_sock, token, group_id);
    }
    else if (strcmp(command, "LOG_ACTIVITY") == 0)
    {
        split(data, "||", datas, 2);
        int group_id = atoi(datas[0]);
        const char *timestamp = datas[1];
        show_log(client_sock, group_id, timestamp);
    }
    else if (strcmp(command, "CREATE_GROUP") == 0)
    {
        split(data, "||", datas, 1);
        handle_create_group(client_sock, token, datas[0]);
    }
    else if (strcmp(command, "LIST_GROUPS") == 0)
    {
        handle_list_group(client_sock, token);
    }
    else if (strcmp(command, "LIST_GROUPS_NOT_JOINED") == 0)
    {
        handle_list_group_not_joined(client_sock, token);
    }
    else if (strcmp(command, "LIST_GROUP_MEMBERS") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_list_group_members(client_sock, token, group_id);
    }
    else if (strcmp(command, "LIST_REQUESTS") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_list_requests(client_sock, token, group_id);
    }
    else if (strcmp(command, "REQUEST_JOIN_GROUP") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_request_join_group(client_sock, token, group_id);
    }
    else if (strcmp(command, "INVITE_USER_TO_GROUP") == 0)
    {
        split(data, "||", datas, 2);
        int group_id = atoi(datas[0]);
        int invitee_id = atoi(datas[1]);
        handle_invite_user_to_group(client_sock, group_id, invitee_id);
    }
    else if (strcmp(command, "LIST_AVAILABLE_INVITE_USERS") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_list_available_invite_user(client_sock, token, group_id);
    }
    else if (strcmp(command, "LIST_INVITATIONS") == 0)
    {
        handle_list_invitations(client_sock, token);
    }
    else if (strcmp(command, "RESPOND_INVITATION") == 0)
    {
        split(data, "||", datas, 2);
        int requestId = atoi(datas[0]);
        const char *approval_status = datas[1];
        handle_respond_invitation(client_sock, token, requestId, approval_status);
    }
    else if (strcmp(command, "APPROVE_JOIN_REQUEST") == 0)
    {
        split(data, "||", datas, 2);
        int request_id = atoi(datas[0]);
        const char *approval_status = datas[1];
        handle_approve_join_request(client_sock, token, request_id, approval_status);
    }
    else if (strcmp(command, "LEAVE_GROUP") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_leave_group(client_sock, token, group_id);
    }
    else if (strcmp(command, "REMOVE_MEMBER") == 0)
    {
        split(data, "||", datas, 2);
        int group_id = atoi(datas[0]);
        int user_id = atoi(datas[1]);
        handle_remove_member(client_sock, token, group_id, user_id);
    }
    else if (strcmp(command, "LIST_GROUP_CONTENT") == 0)
    {
        split(data, "||", datas, 1);
        int group_id = atoi(datas[0]);
        handle_list_group_content(client_sock, token, group_id);
    }
    else if (strcmp(command, "LIST_DIRECTORY_CONTENT") == 0)
    {
        split(data, "||", datas, 2);
        int group_id = atoi(datas[0]);
        int folder_id = atoi(datas[1]);
        handle_list_directory(client_sock, token, group_id, folder_id);
    }
    else if (strcmp(command, "UPLOAD_FILE") == 0)
    {
        int group_id, dir_id;
        char remaining_data[BUFFER_SIZE * 4]; // Increased size for base64 data
        sscanf(data, "%d||%d||%4095[^\r\n]", &group_id, &dir_id, remaining_data);
        handle_receive_file_chunk(client_sock, token, group_id, dir_id, remaining_data);
    }
    else if (strcmp(command, "DOWNLOAD_FILE") == 0)
    {
        int file_id;
        sscanf(data, "%d", &file_id);
        handle_download_file(client_sock, token, file_id);
    }
    else if (strcmp(command, "RENAME_ITEM") == 0)
    {
        split(data, "||", datas, 3);
        int item_id = atoi(datas[0]);
        int is_file;
        if (strcmp(datas[2], "true") == 0)
        {
            is_file = 1;
        }
        else
        {
            is_file = 0;
        }
        handle_rename_item(client_sock, token, item_id, datas[1], is_file);
    }
    else if (strcmp(command, "DELETE_FOLDER") == 0)
    {
        split(data, "||", datas, 1);
        int dir_id = atoi(datas[0]);
        handle_delete_folder(client_sock, token, dir_id);
    }
    else if (strcmp(command, "DELETE_FILE") == 0)
    {
        split(data, "||", datas, 1);
        int file_id = atoi(datas[0]);
        handle_delete_file(client_sock, token, file_id);
    }
    else if (strcmp(command, "COPY_ITEM") == 0)
    {
        split(data, "||", datas, 3);
        int item_id = atoi(datas[0]);
        int target_dir_id = atoi(datas[1]);
        int is_file; // 1 if file, 0 if folder
        if (strcmp(datas[2], "true") == 0)
        {
            is_file = 1;
        }
        else
        {
            is_file = 0;
        }
        handle_copy_item(client_sock, token, item_id, target_dir_id, is_file);
    }
    else if (strcmp(command, "MOVE_ITEM") == 0)
    {
        split(data, "||", datas, 3);
        int item_id = atoi(datas[0]);
        int target_dir_id = atoi(datas[1]);
        int is_file; // 1 if file, 0 if folder
        if (strcmp(datas[2], "true") == 0)
        {
            is_file = 1;
        }
        else
        {
            is_file = 0;
        }
        handle_move_item(client_sock, token, item_id, target_dir_id, is_file);
    }
    else if (strcmp(command, "LIST_ADMIN_GROUPS") == 0)
    {
        handle_list_admin_groups(client_sock, token);
    }
    else if (strcmp(command, "CREATE_FOLDER") == 0)
    {
        split(data, "||", datas, 3);
        int group_id = atoi(datas[0]);
        int parent_dir_id = atoi(datas[1]);
        handle_create_folder(client_sock, token, group_id, parent_dir_id, datas[2]);
    }
    else
    {
        send(client_sock, "4000\r\n", 6, 0); // Bad request
    }

    // Free allocated memory for datas
    for (int i = 0; i < 10; i++)
    {
        if (datas[i] != NULL)
        {
            free(datas[i]);
        }
    }
}

void split(const char *str, const char *delim, char **out, int max_datas)
{
    char *token;
    char *str_copy = strdup(str); // Tạo một bản sao của chuỗi đầu vào
    int i = 0;

    token = strtok(str_copy, delim); // Tách phần tử đầu tiên
    while (token != NULL && i < max_datas)
    {                                // Lặp lại cho đến khi không còn phần tử nào hoặc đạt đến giới hạn max_datas
        out[i++] = strdup(token);    // Lưu phần tử vào mảng out
        token = strtok(NULL, delim); // Tách phần tử tiếp theo
    }

    free(str_copy); // Giải phóng bộ nhớ của bản sao chuỗi
}

// void split(const char *str, const char *delim, char **out, int max_datas)
// {
//     char *token;
//     char *str_copy = strdup(str); // Tạo bản sao của chuỗi đầu vào
//     if (str_copy == NULL)
//     {
//         fprintf(stderr, "Error: strdup failed for str_copy\n");
//         return;
//     }
//     printf("DEBUG: str_copy = '%s'\n", str_copy); // Debug bản sao của chuỗi đầu vào

//     int i = 0;
//     token = strtok(str_copy, delim); // Tách phần tử đầu tiên
//     while (token != NULL && i < max_datas)
//     {
//         printf("DEBUG: data[%d] = '%s'\n", i, token); // Debug từng token được tách
//         out[i] = strdup(token);                       // Sao chép token độc lập vào mảng out
//         if (out[i] == NULL)
//         {
//             fprintf(stderr, "Error: strdup failed for token[%d]\n", i);
//             break;
//         }
//         printf("DEBUG: out[%d] = '%s'\n", i, out[i]);
//         i++;
//         token = strtok(NULL, delim); // Tách phần tử tiếp theo
//     }

//     out[i] = NULL;                           // Đặt NULL vào cuối mảng để đánh dấu kết thúc
//     printf("DEBUG: Total datas = %d\n", i); // Debug tổng số token đã tách

//     free(str_copy); // Giải phóng bộ nhớ của bản sao chuỗi
// }
