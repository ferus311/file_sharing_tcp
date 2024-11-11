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
#include "tuan_group.h"
#include "db.h"

#define PORT 12345
#define BACKLOG 10

MYSQL *conn;

// Function to handle client request
void handle_client_request(int client_sock) {
    char buffer[1024];
    int bytes_read;

    // Read request from client
    bytes_read = recv(client_sock, buffer, sizeof(buffer), 0);
    if (bytes_read <= 0) {
        close(client_sock);
        return;
    }

    buffer[bytes_read] = '\0';

    if (strncmp(buffer, "LOGIN", 5) == 0) {
        char username[50], password[255];
        sscanf(buffer, "LOGIN %s %s", username, password);

        int result = handle_login(client_sock, username, password);
        
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "REGISTER", 8) == 0) {
        char username[50], password[255];
        sscanf(buffer, "REGISTER %s %s", username, password);

        int result = handle_registration(client_sock, username, password);
        send(client_sock, &result, sizeof(result), 0);
    }
    // Add more handling logic for other commands like CREATE_GROUP, LIST_GROUPS, etc.
    else if (strncmp(buffer, "CREATE_GROUP", 12) == 0) {
        char group_name[100];
        int user_id;
        sscanf(buffer, "CREATE_GROUP %d %s", &user_id, group_name);

        int result = handle_create_group(client_sock, &user_id, group_name);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "LIST_GROUP_MEMBER", 8) == 0) {
        char username[50], password[255];
        sscanf(buffer, "LIST_GROUP_MEMBER %s %s", username, password);

        int result = handle_registration(client_sock, username, password);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "LIST_GROUP", 8) == 0) {
        char username[50], password[255];
        sscanf(buffer, "LIST_GROUP %s %s", username, password);

        int result = handle_registration(client_sock, username, password);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "REQUEST_JOIN_GROUP", 8) == 0) {
        int token, group_id;
        sscanf(buffer, "REQUEST_JOIN_GROUP %d %d", &token, &group_id);

        int result = handle_request_join_group(client_sock, &token, &group_id);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "INVITE_USER_TO_GROUP", 8) == 0) {
        int token, group_id, invitee_id;
        sscanf(buffer, "INVITE_USER_TO_GROUP %d %d||%d", &token, &group_id, &invitee_id);

        int result = handle_invite_user_to_group(client_sock, &token, &group_id, &invitee_id);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "RESPOND_INVITATION", 8) == 0) {
        char username[50], password[255];
        sscanf(buffer, "CREATE_GROUP %s %s", username, password);

        int result = handle_registration(client_sock, username, password);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "APPROVE_JOIN_REQUEST", 8) == 0) {
        char username[50], password[255];
        sscanf(buffer, "APPROVE_JOIN_REQUEST %s %s", username, password);

        int result = handle_registration(client_sock, username, password);
        send(client_sock, &result, sizeof(result), 0);
    }
    else if (strncmp(buffer, "LEAVE_GROUP", 8) == 0) {
        int token, group_id;
        sscanf(buffer, "LEAVE_GROUP %d %d", &token, &group_id);

        int result = handle_leave_group(client_sock, &token, &group_id);
        send(client_sock, &result, sizeof(result), 0);
    }
}

int main() {
    int server_sock, client_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_len;
    fd_set read_fds;
    int max_fd;

    // Initialize MySQL
    init_mysql();

    // Create server socket
    server_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (server_sock < 0) {
        perror("socket failed");
        exit(1);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(server_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind failed");
        exit(1);
    }

    if (listen(server_sock, BACKLOG) < 0) {
        perror("listen failed");
        exit(1);
    }

    printf("Server is listening on port %d...\n", PORT);

    FD_ZERO(&read_fds);
    FD_SET(server_sock, &read_fds);
    max_fd = server_sock;

    while (1) {
        fd_set temp_fds = read_fds;
        int activity = select(max_fd + 1, &temp_fds, NULL, NULL, NULL);

        if (activity < 0) {
            perror("select failed");
            break;
        }

        if (FD_ISSET(server_sock, &temp_fds)) {
            client_addr_len = sizeof(client_addr);
            client_sock = accept(server_sock, (struct sockaddr *)&client_addr, &client_addr_len);
            if (client_sock < 0) {
                perror("accept failed");
                continue;
            }

            FD_SET(client_sock, &read_fds);
            if (client_sock > max_fd) {
                max_fd = client_sock;
            }
        }

        for (int i = 0; i <= max_fd; i++) {
            if (FD_ISSET(i, &temp_fds)) {
                if (i == server_sock) {
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
