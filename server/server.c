#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <mysql/mysql.h>
#include <fcntl.h>
#include <sys/select.h>
#include "user/user.h"
#include "group/group.h"
#include "database/db.h"

#define PORT 1234
#define BACKLOG 10

MYSQL *conn;

void handle_client_request(int client_sock);
void parse_message(const char *message, char *command, char *token, char *data);
void handle_command(int client_sock, const char *command, const char *token, const char *data);
void split(const char *str, const char *delim, char **out, int max_tokens);

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

                // Handle client request
                handle_client_request(i);

                // Close the connection after handling the request
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
    char buffer[1024];
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
    if (num_parsed == 2)
    {
        strcpy(data, token);
        token[0] = '\0';
    }
}

void handle_command(int client_sock, const char *command, const char *token, const char *data)
{
    char *tokens[10] = {NULL}; // Adjust size as needed

    if (strcmp(command, "LOGIN") == 0)
    {
        split(data, "||", tokens, 2);
        handle_login(client_sock, tokens[0], tokens[1]);
    }
    else if (strcmp(command, "REGISTER") == 0)
    {
        split(data, "||", tokens, 2);
        handle_registration(client_sock, tokens[0], tokens[1]);
    }

    else if (strcmp(command, "LOG_ACTIVITY") == 0)
    {
        char *tokens[2];
        split(data, "||", tokens, 2);

        int group_id = atoi(tokens[0]);
        const char *timestamp = tokens[1];
        show_log(client_sock, group_id, timestamp);
    }
    else if (strcmp(command, "CREATE_GROUP") == 0)
    {
        split(data, "||", tokens, 1);
        handle_create_group(client_sock, token, tokens[0]);
    }
    else if (strcmp(command, "LIST_GROUPS") == 0)
    {
        // Handle list groups with token
    }
    else if (strcmp(command, "LIST_GROUP_MEMBERS") == 0)
    {
        split(data, "||", tokens, 1);
        // Handle list group members with token and group ID
    }
    else if (strcmp(command, "REQUEST_JOIN_GROUP") == 0)
    {
        split(data, "||", tokens, 1);
        handle_request_join_group(client_sock, token, tokens[0]);
        // Handle request join group with token and group ID
    }
    else if (strcmp(command, "INVITE_USER_TO_GROUP") == 0)
    {
        split(data, "||", tokens, 2);
        handle_invite_user_to_group(client_sock, token, tokens[0], tokens[1]);
    }
    else if (strcmp(command, "RESPOND_INVITATION") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle respond invitation with token, group ID, and approval status
    }
    else if (strcmp(command, "APPROVE_JOIN_REQUEST") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle approve join request with token, group ID, and user ID
    }
    else if (strcmp(command, "LEAVE_GROUP") == 0)
    {
        split(data, "||", tokens, 1);
        handle_leave_group(client_sock, token, tokens[0]);
        // Handle leave group with token and group ID
    }
    else if (strcmp(command, "REMOVE_MEMBER") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle remove member with token, group ID, and user ID
    }
    else if (strcmp(command, "LIST_DIRECTORY_CONTENT") == 0)
    {
        split(data, "||", tokens, 1);
        // Handle list directory content with token and directory ID
    }
    else if (strcmp(command, "UPLOAD_FILE") == 0)
    {
        split(data, "||", tokens, 4);
        // Handle upload file with token, group ID, file data, file name, file size, and directory ID
    }
    else if (strcmp(command, "DOWNLOAD_FILE") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle download file with token and file ID
    }
    else if (strcmp(command, "RENAME_ITEM") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle rename item with token, item ID, and new name
    }
    else if (strcmp(command, "DELETE_ITEM") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle delete item with token, item ID, and item type
    }
    else if (strcmp(command, "COPY_ITEM") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle copy item with token, item ID, and target directory ID
    }
    else if (strcmp(command, "MOVE_ITEM") == 0)
    {
        split(data, "||", tokens, 2);
        // Handle move item with token, item ID, and target directory ID
    }

    else
    {
        send(client_sock, "4000\r\n", 6, 0); // Bad request
    }

    // Free allocated memory for tokens
    for (int i = 0; i < 10; i++)
    {
        if (tokens[i] != NULL)
        {
            free(tokens[i]);
        }
    }
}

void split(const char *str, const char *delim, char **out, int max_tokens)
{
    char *token;
    char *str_copy = strdup(str); // Tạo một bản sao của chuỗi đầu vào
    int i = 0;

    token = strtok(str_copy, delim); // Tách phần tử đầu tiên
    while (token != NULL && i < max_tokens)
    {                                // Lặp lại cho đến khi không còn phần tử nào hoặc đạt đến giới hạn max_tokens
        out[i++] = strdup(token);    // Lưu phần tử vào mảng out
        token = strtok(NULL, delim); // Tách phần tử tiếp theo
    }

    free(str_copy); // Giải phóng bộ nhớ của bản sao chuỗi
}
