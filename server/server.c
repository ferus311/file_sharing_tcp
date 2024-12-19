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
#include <sys/stat.h>
#include <openssl/bio.h>
#include <openssl/evp.h>
#include "user/user.h"
#include "file/file.h"
#include "group/group.h"
#include "database/db.h"

#define PORT 1234
#define BACKLOG 10
#define BUFFER_SIZE 1024
#define FILE_PATH_SIZE 2048

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
    if (num_parsed == 2)
    {
        strcpy(data, token);
    }
}

int calcDecodeLength(const char *b64input, size_t len) {
    int padding = 0;

    if (len >= 2 && b64input[len - 1] == '=' && b64input[len - 2] == '=')
        padding = 2;
    else if (len >= 1 && b64input[len - 1] == '=')
        padding = 1;

    return (int)(len * 0.75) - padding;
}

unsigned char *base64_decode_v2(const char *data, size_t input_length, size_t *output_length) {
    BIO *bio, *b64;

    int decodeLen = calcDecodeLength(data, input_length);
    unsigned char *buffer = (unsigned char *)malloc(decodeLen + 1);
    if (!buffer) {
        perror("Failed to allocate memory");
        return NULL;
    }
    buffer[decodeLen] = '\0'; // Ensure null-terminated

    bio = BIO_new_mem_buf((void *)data, -1);
    b64 = BIO_new(BIO_f_base64());
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL); // No newlines
    bio = BIO_push(b64, bio);

    *output_length = BIO_read(bio, buffer, input_length);
    if (*output_length <= 0) {
        perror("BIO_read failed");
        free(buffer);
        buffer = NULL;
    }

    BIO_free_all(bio);
    return buffer;
}

void handle_receive_file_chunk(int client_sock, const char *token, int group_id, const char *data) {
    char file_name[BUFFER_SIZE];
    char file_extension[BUFFER_SIZE];
    int chunk_index, total_chunks;
    char chunk_data[BUFFER_SIZE * 4]; // Increased size for base64 data

    // Parse data
    sscanf(data, "%1023[^|]||%1023[^|]||%d||%d||%4096s", file_name, file_extension, &chunk_index, &total_chunks, chunk_data);

    // Decode base64
    size_t decoded_length;
    unsigned char *decoded_data = base64_decode_v2(chunk_data, strlen(chunk_data), &decoded_length);
    
    // Create directory if not exists
    char group_folder[FILE_PATH_SIZE];
    snprintf(group_folder, sizeof(group_folder), "uploads/group_%d", group_id);
    mkdir(group_folder, 0777);

    // File path
    char file_path[FILE_PATH_SIZE];
    snprintf(file_path, sizeof(file_path), "%s/%s", group_folder, file_name);

    // Open file in append mode
    FILE *file = fopen(file_path, "ab");
    if (file == NULL) {
        perror("Failed to open file");
        free(decoded_data);
        return;
    }

    fwrite(decoded_data, 1, decoded_length, file);
    fclose(file);
    free(decoded_data);

    if (chunk_index == total_chunks - 1) {
        printf("File received successfully: %s\n", file_path);
        send(client_sock, "2000 File uploaded successfully", strlen("2000 File uploaded successfully"), 0);
    } else {
        send(client_sock, "2000 Chunk uploaded successfully", strlen("2000 Chunk uploaded successfully"), 0);
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
        handle_list_group(client_sock, token);
    }
    else if (strcmp(command, "LIST_GROUP_MEMBERS") == 0)
    {
        split(data, "||", tokens, 1);
        int group_id = atoi(tokens[0]);
        handle_list_group_members(client_sock, token, group_id);
    }
    else if (strcmp(command, "REQUEST_JOIN_GROUP") == 0)
    {
        split(data, "||", tokens, 1);
        int group_id = atoi(tokens[0]);
        handle_request_join_group(client_sock, token, group_id);
    }
    else if (strcmp(command, "INVITE_USER_TO_GROUP") == 0)
    {
        split(data, "||", tokens, 2);
        int group_id = atoi(tokens[0]);
        int invitee_id = atoi(tokens[1]);
        handle_invite_user_to_group(client_sock, group_id, invitee_id);
    }
    else if (strcmp(command, "RESPOND_INVITATION") == 0)
    {
        split(data, "||", tokens, 2);
        int group_id = atoi(tokens[0]);
        const char *approval_status = tokens[1];
        handle_respond_invitation(client_sock, token, group_id, approval_status);
    }
    else if (strcmp(command, "APPROVE_JOIN_REQUEST") == 0)
    {
        split(data, "||", tokens, 2);
        int user_id = atoi(tokens[0]);
        const char *approval_status = tokens[1];
        handle_approve_join_request(client_sock, token, user_id, approval_status);
    }
    else if (strcmp(command, "LEAVE_GROUP") == 0)
    {
        split(data, "||", tokens, 1);
        int group_id = atoi(tokens[0]);
        handle_leave_group(client_sock, token, group_id);
    }
    else if (strcmp(command, "REMOVE_MEMBER") == 0)
    {
        split(data, "||", tokens, 2);
        int group_id = atoi(tokens[0]);
        int user_id = atoi(tokens[1]);
        handle_remove_member(client_sock, token, group_id, user_id);
    }
    else if (strcmp(command, "LIST_GROUP_CONTENT") == 0)
    {
        split(data, "||", tokens, 2);
        if (tokens[1] != NULL)
        {
            int group_id = atoi(tokens[1]);
            handle_list_group_content(client_sock, token, group_id);
        }
        else
        {
            send(client_sock, "5000\r\n", 6, 0); // Invalid request
        }
    }
    else if (strcmp(command, "LIST_DIRECTORY_CONTENT") == 0)
    {
        split(data, "||", tokens, 3);
        if (tokens[1] != NULL && tokens[1] != NULL)
        {
            int group_id = atoi(tokens[1]);
            int folder_id = atoi(tokens[2]);
            handle_list_directory(client_sock, token, group_id, folder_id);
        }
        else
        {
            send(client_sock, "5000\r\n", 6, 0); // Invalid request
        }
    }
    else if (strcmp(command, "UPLOAD_FILE") == 0)
    {
        int group_id;
        char remaining_data[BUFFER_SIZE * 4]; // Increased size for base64 data
        sscanf(data, "%d||%4095[^\r\n]", &group_id, remaining_data);
        handle_receive_file_chunk(client_sock, token, group_id, remaining_data);
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
    char *str_copy = strdup(str); // Create a copy of the input string
    int i = 0;

    token = strtok(str_copy, delim); // Split first element
    while (token != NULL && i < max_tokens)
    {
        out[i++] = strdup(token);    // Save element to out array
        token = strtok(NULL, delim); // Split next element
    }

    free(str_copy); // Free memory of string copy
}
