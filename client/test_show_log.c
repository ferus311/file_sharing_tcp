#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

#define SERVER_IP "127.0.0.1"
#define SERVER_PORT 1234
#define BUFFER_SIZE 2000

void send_log_activity_request(int sock, int group_id, const char *timestamp);

int main() {
    int sock;
    struct sockaddr_in server_addr;
    char server_reply[BUFFER_SIZE];

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

    // Send LOG_ACTIVITY request with fixed group_id and timestamp
    int group_id = 1;
    const char *timestamp = "2023-01-01 00:00:00";
    send_log_activity_request(sock, group_id, timestamp);

    // Receive a reply from the server
    if (recv(sock, server_reply, BUFFER_SIZE, 0) < 0) {
        puts("recv failed");
    }
    puts("Server reply:");
    puts(server_reply);

    close(sock);
    return 0;
}

void send_log_activity_request(int sock, int group_id, const char *timestamp) {
    char message[256];
    char* token = "abncnd";
    snprintf(message, sizeof(message), "LOG_ACTIVITY %s %d||%s\r\n",token, group_id, timestamp);
    send(sock, message, strlen(message), 0);
}
