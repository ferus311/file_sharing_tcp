#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <openssl/bio.h>
#include <openssl/evp.h>
#include <openssl/buffer.h>
#include "token.h"

#define TOKEN_EXPIRY 3600 // Thời gian hết hạn token (1 giờ)

// Hàm mã hóa Base64
char *base64_encode(const unsigned char *input, int length)
{
    BIO *bmem, *b64;
    BUF_MEM *bptr;

    b64 = BIO_new(BIO_f_base64());
    bmem = BIO_new(BIO_s_mem());
    b64 = BIO_push(b64, bmem);
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    BIO_write(b64, input, length);
    BIO_flush(b64);
    BIO_get_mem_ptr(b64, &bptr);

    char *buff = (char *)malloc(bptr->length + 1);
    memcpy(buff, bptr->data, bptr->length);
    buff[bptr->length] = 0;

    BIO_free_all(b64);

    return buff;
}

// Hàm giải mã Base64
unsigned char *base64_decode(const char *input, int length, int *out_len)
{
    BIO *b64, *bmem;
    unsigned char *buffer = (unsigned char *)malloc(length);
    memset(buffer, 0, length);

    b64 = BIO_new(BIO_f_base64());
    bmem = BIO_new_mem_buf((void *)input, length);
    bmem = BIO_push(b64, bmem);
    BIO_set_flags(bmem, BIO_FLAGS_BASE64_NO_NL);
    *out_len = BIO_read(bmem, buffer, length);

    BIO_free_all(bmem);

    return buffer;
}

void create_payload(char *payload, const char *user_id, int expiry)
{
    snprintf(payload, 256, "%s:%ld", user_id, time(NULL) + expiry);
}

void create_token(const char *user_id, char *token)
{
    char payload[256];
    create_payload(payload, user_id, TOKEN_EXPIRY);
    char *encoded_payload = base64_encode((unsigned char *)payload, strlen(payload));
    snprintf(token, 512, "%s", encoded_payload);
    free(encoded_payload);
}

int validate_token(const char *token, char *user_id)
{
    int decoded_len;
    unsigned char *decoded_payload = base64_decode(token, strlen(token), &decoded_len);
    decoded_payload[decoded_len] = '\0';

    // Kiểm tra thời gian hết hạn
    char *colon_position = strrchr((char *)decoded_payload, ':');
    if (!colon_position)
    {
        free(decoded_payload);
        return 0; // Payload không hợp lệ
    }

    time_t exp = atol(colon_position + 1);
    if (time(NULL) > exp)
    {
        free(decoded_payload);
        return 0; // Token đã hết hạn
    }

    // Lấy user_id
    int user_id_len = colon_position - (char *)decoded_payload;
    strncpy(user_id, (char *)decoded_payload, user_id_len);
    user_id[user_id_len] = '\0';

    free(decoded_payload);
    return 1; // Token hợp lệ
}

int get_user_id(const char *token)
{
    char user_id[512];
    validate_token(token, user_id);
    return atoi(user_id);
}

// int main() {
//     char token[512];
//     char user_id[256];

//     // Tạo token cho user_id "user123"
//     create_token("user123", token);
//     printf("Token: %s\n", token);

//     // Kiểm tra token
//     if (validate_token(token, user_id)) {
//         printf("Token hợp lệ. User ID: %s\n", user_id);
//     } else {
//         printf("Token không hợp lệ hoặc đã hết hạn.\n");
//     }

//     return 0;
// }
