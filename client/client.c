#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

#define SERVER_IP "127.0.0.1"
#define SERVER_PORT 1234
#define BUFFER_SIZE 2000

void handle_login(int sock);
void handle_registration(int sock);
void send_log_activity_request(int sock, const char *token, int group_id, const char *timestamp);
void show_secondary_menu(int sock, const char *token);

int main() {
    int sock;
    struct sockaddr_in server_addr;
    char server_reply[BUFFER_SIZE];

    while (1) {
        // Create socket
        sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock == -1) {
            printf("Could not create socket");
            return -1;
        }
        puts("Socket created");

        server_addr.sin_family = AF_INET;
        server_addr.sin_port = htons(SERVER_PORT);

        // Convert IPv4 and IPv6 addresses from text to binary form
        if (inet_pton(AF_INET, SERVER_IP, &server_addr.sin_addr) <= 0) {
            perror("Invalid address/ Address not supported");
            return -1;
        }

        // Connect to server
        if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
            perror("Connection failed");
            return -1;
        }

        int choice;
        printf("1. Login\n2. Register\n3. Exit\nEnter choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1:
                handle_login(sock);
                break;
            case 2:
                handle_registration(sock);
                break;
            case 3:
                close(sock);
                return 0;
            default:
                printf("Invalid choice\n");
                break;
        }

        close(sock);
    }

    return 0;
}

void handle_login(int sock) {
    char username[50], password[50], buffer[BUFFER_SIZE];
    printf("Enter username: ");
    scanf("%s", username);
    printf("Enter password: ");
    scanf("%s", password);

    // Send login request to server
    snprintf(buffer, sizeof(buffer), "LOGIN %s||%s\r\n", username, password);
    send(sock, buffer, strlen(buffer), 0);

    // Receive response from server
    if (recv(sock, buffer, BUFFER_SIZE, 0) < 0) {
        puts("recv failed");
        return;
    }
    printf("Server reply: %s\n", buffer);

    // Check if login was successful
    if (strncmp(buffer, "2000", 4) == 0) {
        printf("Login successful. Token: %s\n", buffer + 5);
        show_secondary_menu(sock, buffer + 5);
    } else if (strncmp(buffer, "4040", 4) == 0) {
        printf("User not found.\n");
    } else if (strncmp(buffer, "4010", 4) == 0) {
        printf("Incorrect password.\n");
    } else {
        printf("Login failed.\n");
    }
}

void handle_registration(int sock) {
    char username[50], password[50], buffer[BUFFER_SIZE];
    printf("Enter username: ");
    scanf("%s", username);
    printf("Enter password: ");
    scanf("%s", password);

    snprintf(buffer, sizeof(buffer), "REGISTER %s||%s\r\n", username, password);
    send(sock, buffer, strlen(buffer), 0);

    int valread = read(sock, buffer, BUFFER_SIZE);
    buffer[valread] = '\0';
    printf("Server response: %s\n", buffer);

    if (strncmp(buffer, "2000", 4) == 0) {
        printf("Registration successful. Token: %s\n", buffer + 5);
    } else if (strncmp(buffer, "4090", 4) == 0) {
        printf("Username already exists.\n");
    } else {
        printf("Registration failed.\n");
    }
}

void show_secondary_menu(int sock, const char *token) {
    int choice;
    while (1) {
        printf("1. Show Log\n2. Logout\nEnter choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1: {
                int group_id;
                printf("Enter group ID to view logs: ");
                scanf("%d", &group_id);
                // Fixed timestamp for testing
                send_log_activity_request(sock, token, group_id, "2023-01-01 00:00:00");

                // Receive and display log activity response
                char buffer[BUFFER_SIZE];
                int bytes_received = recv(sock, buffer, BUFFER_SIZE, 0);
                if (bytes_received < 0) {
                    puts("recv failed");
                    return;
                }
                buffer[bytes_received] = '\0'; // Null-terminate the received data
                printf("Server reply:\n%s\n", buffer);
                break;
            }
            case 2:
                return;
            default:
                printf("Invalid choice\n");
                break;
        }
    }
}

void send_log_activity_request(int sock, const char *token, int group_id, const char *timestamp) {
    char message[256];
    snprintf(message, sizeof(message), "LOG_ACTIVITY %s %d||%s\r\n", token, group_id, timestamp);
    send(sock, message, strlen(message), 0);
}
