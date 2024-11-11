#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 12345
#define SERVER_IP "127.0.0.1"

void login(int sockfd);

int main() {
    int sockfd;
    struct sockaddr_in server_addr;

    // Tạo socket
    if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    // Thiết lập địa chỉ server
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = inet_addr(SERVER_IP);

    // Kết nối đến server
    if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Connection to server failed");
        close(sockfd);
        exit(EXIT_FAILURE);
    }

    // Thực hiện đăng nhập
    login(sockfd);

    // Đóng kết nối
    close(sockfd);
    return 0;
}

void login(int sockfd) {
    char username[50], password[255], login_message[1024];
    int result;

    // Nhập tên đăng nhập và mật khẩu
    printf("Enter username: ");
    fgets(username, sizeof(username), stdin);
    username[strcspn(username, "\n")] = '\0'; // Xóa ký tự newline

    printf("Enter password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0'; // Xóa ký tự newline

    // Tạo thông điệp đăng nhập
    snprintf(login_message, sizeof(login_message), "LOGIN %s %s", username, password);

    // Gửi thông điệp đăng nhập đến server
    if (send(sockfd, login_message, strlen(login_message), 0) < 0) {
        perror("Send failed");
        return;
    }

    // Nhận phản hồi từ server
    if (recv(sockfd, &result, sizeof(result), 0) < 0) {
        perror("Receive failed");
        return;
    }

    // Kiểm tra kết quả đăng nhập
    if (result == 2000) {
        printf("Login successful\n");
    } else if (result == 4040) {
        printf("Account does not exist\n");
    } else if (result == 4010) {
        printf("Incorrect password\n");
    } else if (result == 4090) {
        printf("Account already logged in\n");
    } else if (result == 4000) {
        printf("Client already initiated a session\n");
    } else {
        printf("Login failed with unknown error code: %d\n", result);
    }
}
