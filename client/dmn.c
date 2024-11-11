#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 12345
#define SERVER_IP "127.0.0.1"
#define BUFFER_SIZE 1024

void login(int sockfd);
void upload_file(int sockfd);
void download_file(int sockfd);
void rename_file(int sockfd);
void delete_file(int sockfd);
void copy_file(int sockfd);
void move_file(int sockfd);

int main()
{
    int sockfd;
    struct sockaddr_in server_addr;
    int choice;

    // Tạo socket
    if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    // Thiết lập địa chỉ server
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = inet_addr(SERVER_IP);

    // Kết nối đến server
    if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        perror("Connection to server failed");
        close(sockfd);
        exit(EXIT_FAILURE);
    }

    // Menu cho người dùng
    while (1)
    {
        printf("\n--- File Sharing Client ---\n");
        printf("1. Login\n");
        printf("2. Upload File\n");
        printf("3. Download File\n");
        printf("4. Rename File\n");
        printf("5. Delete File\n");
        printf("6. Copy File\n");
        printf("7. Move File\n");
        printf("0. Exit\n");
        printf("Choose an option: ");
        scanf("%d", &choice);
        getchar(); // Để xóa ký tự newline còn lại trong buffer

        switch (choice)
        {
        case 1:
            login(sockfd);
            break;
        case 2:
            upload_file(sockfd);
            break;
        case 3:
            download_file(sockfd);
            break;
        case 4:
            rename_file(sockfd);
            break;
        case 5:
            delete_file(sockfd);
            break;
        case 6:
            copy_file(sockfd);
            break;
        case 7:
            move_file(sockfd);
            break;
        case 0:
            close(sockfd);
            exit(0);
        default:
            printf("Invalid choice\n");
        }
    }

    close(sockfd);
    return 0;
}

void login(int sockfd)
{
    char username[50], password[255], login_message[BUFFER_SIZE];
    int result;

    printf("Enter username: ");
    fgets(username, sizeof(username), stdin);
    username[strcspn(username, "\n")] = '\0';

    printf("Enter password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';

    snprintf(login_message, sizeof(login_message), "LOGIN %s %s", username, password);
    send(sockfd, login_message, strlen(login_message), 0);

    if (recv(sockfd, &result, sizeof(result), 0) < 0)
    {
        perror("Receive failed");
        return;
    }

    if (result == 2000)
    {
        printf("Login successful\n");
    }
    else if (result == 4040)
    {
        printf("Account does not exist\n");
    }
    else if (result == 4010)
    {
        printf("Incorrect password\n");
    }
    else
    {
        printf("Login failed with unknown error code: %d\n", result);
    }
}

void upload_file(int sockfd)
{
    char group_id[50], file_name[255], upload_message[BUFFER_SIZE], data[BUFFER_SIZE];
    int file_size;
    FILE *file;

    printf("Enter group ID: ");
    fgets(group_id, sizeof(group_id), stdin);
    group_id[strcspn(group_id, "\n")] = '\0';

    printf("Enter file name: ");
    fgets(file_name, sizeof(file_name), stdin);
    file_name[strcspn(file_name, "\n")] = '\0';

    file = fopen(file_name, "rb");
    if (!file)
    {
        perror("File open failed");
        return;
    }

    fseek(file, 0, SEEK_END);
    file_size = ftell(file);
    fseek(file, 0, SEEK_SET);

    snprintf(upload_message, sizeof(upload_message), "UPLOAD_FILE %s ||%s||%d", group_id, file_name, file_size);
    send(sockfd, upload_message, strlen(upload_message), 0);

    while (fread(data, 1, sizeof(data), file) > 0)
    {
        send(sockfd, data, sizeof(data), 0);
    }

    fclose(file);
    printf("File uploaded successfully\n");
}

void download_file(int sockfd)
{
    char file_id[50], download_message[BUFFER_SIZE];
    FILE *file;
    int bytes_received;
    char buffer[BUFFER_SIZE];

    printf("Enter file ID: ");
    fgets(file_id, sizeof(file_id), stdin);
    file_id[strcspn(file_id, "\n")] = '\0';

    snprintf(download_message, sizeof(download_message), "DOWNLOAD_FILE %s", file_id);
    send(sockfd, download_message, strlen(download_message), 0);

    file = fopen("downloaded_file", "wb");
    if (!file)
    {
        perror("File open failed");
        return;
    }

    while ((bytes_received = recv(sockfd, buffer, BUFFER_SIZE, 0)) > 0)
    {
        fwrite(buffer, 1, bytes_received, file);
    }

    fclose(file);
    printf("File downloaded successfully\n");
}

void rename_file(int sockfd)
{
    char item_id[50], new_name[255], rename_message[BUFFER_SIZE];
    int result;

    printf("Enter item ID: ");
    fgets(item_id, sizeof(item_id), stdin);
    item_id[strcspn(item_id, "\n")] = '\0';

    printf("Enter new name: ");
    fgets(new_name, sizeof(new_name), stdin);
    new_name[strcspn(new_name, "\n")] = '\0';

    snprintf(rename_message, sizeof(rename_message), "RENAME_ITEM %s ||%s", item_id, new_name);
    send(sockfd, rename_message, strlen(rename_message), 0);
    recv(sockfd, &result, sizeof(result), 0);

    printf("Rename operation %s\n", result == 2000 ? "successful" : "failed");
}

void delete_file(int sockfd)
{
    char item_id[50], delete_message[BUFFER_SIZE];
    int result;

    printf("Enter item ID: ");
    fgets(item_id, sizeof(item_id), stdin);
    item_id[strcspn(item_id, "\n")] = '\0';

    snprintf(delete_message, sizeof(delete_message), "DELETE_ITEM %s", item_id);
    send(sockfd, delete_message, strlen(delete_message), 0);
    recv(sockfd, &result, sizeof(result), 0);

    printf("Delete operation %s\n", result == 2000 ? "successful" : "failed");
}

void copy_file(int sockfd)
{
    char item_id[50], target_directory_id[50], copy_message[BUFFER_SIZE];
    int result;

    printf("Enter item ID: ");
    fgets(item_id, sizeof(item_id), stdin);
    item_id[strcspn(item_id, "\n")] = '\0';

    printf("Enter target directory ID: ");
    fgets(target_directory_id, sizeof(target_directory_id), stdin);
    target_directory_id[strcspn(target_directory_id, "\n")] = '\0';

    snprintf(copy_message, sizeof(copy_message), "COPY_ITEM %s ||%s", item_id, target_directory_id);
    send(sockfd, copy_message, strlen(copy_message), 0);
    recv(sockfd, &result, sizeof(result), 0);

    printf("Copy operation %s\n", result == 2000 ? "successful" : "failed");
}

void move_file(int sockfd)
{
    char item_id[50], target_directory_id[50], move_message[BUFFER_SIZE];
    int result;

    printf("Enter item ID: ");
    fgets(item_id, sizeof(item_id), stdin);
    item_id[strcspn(item_id, "\n")] = '\0';

    printf("Enter target directory ID: ");
    fgets(target_directory_id, sizeof(target_directory_id), stdin);
    target_directory_id[strcspn(target_directory_id, "\n")] = '\0';

    snprintf(move_message, sizeof(move_message), "MOVE_ITEM %s ||%s", item_id, target_directory_id);
    send(sockfd, move_message, strlen(move_message), 0);
    recv(sockfd, &result, sizeof(result), 0);

    printf("Move operation %s\n", result == 2000 ? "successful" : "failed");
}
