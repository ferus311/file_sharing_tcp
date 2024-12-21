#ifndef TOKEN_H
#define TOKEN_H

// Define the token expiry time (e.g., 3600 seconds = 1 hour)
#define TOKEN_EXPIRY 3600

// Function to create a payload for the token
void create_payload(char *payload, const char *user_id, int expiry);

// Function to create a token from a user ID
void create_token(const char *user_id, char *token);

// Function to validate a token and extract the user ID
int validate_token(const char *token, char *user_id);

int get_user_id(const char *token);

// Base64 encoding and decoding functions
char *base64_encode(const unsigned char *input, int length);
unsigned char *base64_decode(const char *input, int length, int *out_len);

#endif // TOKEN_H
