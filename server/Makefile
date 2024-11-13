CC = gcc
CFLAGS = -Wall -I/usr/include/openssl -g
LIBS = -lmysqlclient -lcrypto -lssl

SRCS = server.c db.c user.c group.c file.c token.c
OBJS = $(SRCS:.c=.o)

server: $(OBJS)
	$(CC) $(OBJS) -o server $(LIBS)

.c.o:
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f $(OBJS) server
