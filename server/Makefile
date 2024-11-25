CC = gcc
CFLAGS = -Wall -I/usr/include/openssl -I./database -I./user -I./group -I./file -I./token -g
LIBS = -lmysqlclient -lcrypto -lssl

SRCS = server.c database/db.c user/user.c group/group.c file/file.c token/token.c group/utils.c
OBJS = $(SRCS:.c=.o)

server: $(OBJS)
	$(CC) $(OBJS) -o server $(LIBS)

.c.o:
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) server
