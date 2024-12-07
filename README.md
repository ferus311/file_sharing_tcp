Ứng dụng chia sẻ file tài liệu sử dụng giao thức tcp

# cai dat mysql server

# cai thu vien su dung mysql:

-   sudo apt-get install libmysqlclient-dev

# chay file sql de tao db

-   mysql -u root - p (login vao mysql server)
-   source path_to_file.sql ( lenh chạy file sql)

-   chinh sua config trong file db.c

Di chuyen den thu muc server

## chay server

-   chay lenh : make
-   khoi chay server: ./server

## khoi chay client

-   dam bao da cai dat nodejs >= 20.x va npm
-   tai dependencies : npm install (co the chay lai nhieu lan de update thu vien)

### cach 1:

-   b1 chay lenh 1 : npm run dev-react
-   b2 chay giao dien : npm run dev-electron

### cach 2:

-   chay lenh: npm run dev
-   sau do reload man hinh electron ( ctrl r )
