CC = gcc
CFLAGS = -Wall -g
LIBS = -lmysqlclient

SRCS = server.c db.c user.c group.c
OBJS = $(SRCS:.c=.o)

server: $(OBJS)
	$(CC) $(OBJS) -o server $(LIBS)

.c.o:
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f $(OBJS) server
