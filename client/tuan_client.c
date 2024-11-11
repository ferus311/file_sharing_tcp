#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 12345
#define SERVER_IP "10.0.2.15"

void login(int sockfd);

void create_group(int sockfd) {
    char group_name[50], create_group_message[1024];
    int result, token;

    // Nhập tên đăng nhập và mật khẩu
    printf("Enter group name: ");
    fgets(group_name, sizeof(group_name), stdin);
    group_name[strcspn(group_name, "\n")] = '\0'; // Xóa ký tự newline

    printf("Enter token: ");
    scanf("%d", &token);

    // Tạo thông điệp đăng nhập
    snprintf(create_group_message, sizeof(create_group_message), "CREATE_GROUP %d %s", token, group_name);

    // Gửi thông điệp đăng nhập đến server
    if (send(sockfd, create_group_message, strlen(create_group_message), 0) < 0) {
        perror("Send failed");
        return;
    }

    // Nhận phản hồi từ server
    if (recv(sockfd, &result, sizeof(result), 0) < 0) {
        perror("Receive failed");
        return;
    }

    // Kiểm tra kết quả tao nhom
    if (result == 2000) {
        printf("Create group successful\n");
    } else if (result == 4040) {
        printf("Wrong token enter\n");
    } else if (result == 4090) {
        printf("Group already existed\n");
    } else {
        printf("Login failed with unknown error code: %d\n", result);
    }
}

void request_join_group(int sockfd) {
    char request_join_group_msg[1024];
    int result, token, group_id;

    // Nhập tên đăng nhập và mật khẩu
    printf("Enter group id: ");
    scanf("%d", &group_id);

    printf("Enter token: ");
    scanf("%d", &token);

    // Tạo thông điệp đăng nhập
    snprintf(request_join_group_msg, sizeof(request_join_group_msg), "REQUEST_JOIN_GROUP %d %d", token, group_id);

    // Gửi thông điệp đăng nhập đến server
    if (send(sockfd, request_join_group_msg, strlen(request_join_group_msg), 0) < 0) {
        perror("Send failed");
        return;
    }

    // Nhận phản hồi từ server
    if (recv(sockfd, &result, sizeof(result), 0) < 0) {
        perror("Receive failed");
        return;
    }

    // Kiểm tra kết quả tao nhom
    if (result == 2000) {
        printf("Send request successful\n");
    } else if (result == 4040) {
        printf("Group not found\n");
    } else if (result == 4090) {
        printf("Already join group\n");
    } else if (result == 4041) {
        printf("Wrong token enter\n");
    } else {
        printf("Login failed with unknown error code: %d\n", result);
    }
}


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

    // // Thực hiện đăng nhập
    // login(sockfd);

    request_join_group(sockfd);

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

