#ifndef TOKEN_H
#define TOKEN_H

#define SECRET_KEY "my_secret_key"
#define TOKEN_EXPIRY 3600 // Thời gian hết hạn token (1 giờ)

void create_token(const char *user_id, char *token);
int validate_token(const char *token, char *user_id);

#endif // TOKEN_H
