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
#include "user.h"
#include "group.h"
#include "db.h"
#include "file.h"

#define PORT 12345
#define BACKLOG 10

MYSQL *conn;

// Function to send a response to the client
void send_response(int client_sock, int result, const char *message)
{
    char response[1024];
    snprintf(response, sizeof(response), "%d %s", result, message);
    send(client_sock, response, strlen(response), 0);
}

// Function to handle client request
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

    if (strncmp(buffer, "LOGIN", 5) == 0)
    {
        char username[50], password[255];
        sscanf(buffer, "LOGIN %s %s", username, password);

        int result = handle_login(client_sock, username, password);
        send_response(client_sock, result, result == 2000 ? "Login successful" : "Login failed");
    }
    else if (strncmp(buffer, "REGISTER", 8) == 0)
    {
        char username[50], password[255];
        sscanf(buffer, "REGISTER %s %s", username, password);

        int result = handle_registration(client_sock, username, password);
        send_response(client_sock, result, result == 2000 ? "Registration successful" : "Registration failed");
    }
    else if (strncmp(buffer, "LIST_DIRECTORY_CONTENT", 22) == 0)
    {
        char group_id[255], dir_id[255];
        sscanf(buffer, "LIST_DIRECTORY_CONTENT %s||%s", group_id, dir_id);
        int result = list_directory(client_sock, group_id, dir_id);
        send_response(client_sock, result, result == 2000 ? "Directory listed successfully" : "Directory listing failed");
    }
    else if (strncmp(buffer, "UPLOAD_FILE", 11) == 0)
    {
        char user_id[255], group_id[255], data[255], file_name[255], file_size[255], dir_id[255];
        sscanf(buffer, "UPLOAD_FILE %s %s||%s||%s||%s||%s", user_id, group_id, data, file_name, file_size, dir_id);
        int result = upload_file(client_sock, user_id, group_id, data, file_name, file_size, dir_id);
        send_response(client_sock, result, result == 2000 ? "File uploaded successfully" : "File upload failed");
    }
    else if (strncmp(buffer, "DOWNLOAD_FILE", 13) == 0)
    {
        char user_id[255], file_id[255], file_size[255];
        sscanf(buffer, "DOWNLOAD_FILE %s %s||%s", user_id, file_id, file_size);
        int result = download_file(client_sock, user_id, file_id, file_size);
        send_response(client_sock, result, result == 2000 ? "File downloaded successfully" : "File download failed");
    }
    else if (strncmp(buffer, "RENAME_ITEM", 11) == 0)
    {
        char user_id[255], item_id[255], new_name[255];
        sscanf(buffer, "RENAME_ITEM %s %s||%s", user_id, item_id, new_name);
        int result = rename_file(client_sock, user_id, item_id, new_name);
        send_response(client_sock, result, result == 2000 ? "File renamed successfully" : "File rename failed");
    }
    else if (strncmp(buffer, "DELETE_ITEM", 11) == 0)
    {
        char user_id[255], item_id[255], item_type[255];
        sscanf(buffer, "DELETE_ITEM %s %s||%s", user_id, item_id, item_type);
        int result = delete_file(client_sock, user_id, item_id, item_type);
        send_response(client_sock, result, result == 2000 ? "File deleted successfully" : "File delete failed");
    }
    else if (strncmp(buffer, "COPY_ITEM", 9) == 0)
    {
        char user_id[255], item_id[255], target_directory_id[255];
        sscanf(buffer, "COPY_ITEM %s %s||%s", user_id, item_id, target_directory_id);
        int result = copy_file(client_sock, user_id, item_id, target_directory_id);
        send_response(client_sock, result, result == 2000 ? "File copied successfully" : "File copy failed");
    }
    else if (strncmp(buffer, "MOVE_ITEM", 9) == 0)
    {
        char user_id[255], item_id[255], target_directory_id[255];
        sscanf(buffer, "MOVE_ITEM %s %s||%s", user_id, item_id, target_directory_id);
        int result = move_file(client_sock, user_id, item_id, target_directory_id);
        send_response(client_sock, result, result == 2000 ? "File moved successfully" : "File move failed");
    }
    else
    {
        send_response(client_sock, 4000, "Unknown command");
    }
}

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
