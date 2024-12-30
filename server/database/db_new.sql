-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS file_sharing_v2;

-- Sử dụng cơ sở dữ liệu vừa tạo
USE file_sharing_v2;

-- Bảng lưu thông tin người dùng
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu thông tin các nhóm
CREATE TABLE IF NOT EXISTS `groups` (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    created_by INT NOT NULL,
    root_dir_id INT DEFAULT NULL,  -- Thêm cột lưu ID thư mục root
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng liên kết người dùng và nhóm, lưu vai trò của người dùng trong nhóm
CREATE TABLE IF NOT EXISTS user_groups (
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE
);

-- Bảng lưu thông tin các thư mục trong từng nhóm
CREATE TABLE IF NOT EXISTS directories (
    dir_id INT AUTO_INCREMENT PRIMARY KEY,
    dir_name VARCHAR(100) NOT NULL,
    parent_id INT DEFAULT NULL,
    group_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES directories(dir_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng lưu thông tin các tệp trong từng thư mục (dir_id không NULL)
CREATE TABLE IF NOT EXISTS files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by INT NOT NULL,
    group_id INT NOT NULL,
    dir_id INT NOT NULL,  -- Chỉnh sửa: Không cho phép NULL cho dir_id
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (dir_id) REFERENCES directories(dir_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE
);

-- Bảng log hoạt động của nhóm
CREATE TABLE IF NOT EXISTS activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type ENUM('group') NOT NULL,  -- Chỉ có 'group' làm đối tượng mục tiêu
    target_id INT NOT NULL,  -- Lưu group_id của nhóm mà người dùng đã thực hiện hành động
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (target_id) REFERENCES `groups`(group_id)
);

-- Bảng lưu trữ lời mời và yêu cầu gia nhập nhóm
CREATE TABLE IF NOT EXISTS group_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,  -- Người gửi yêu cầu hoặc nhận lời mời
    group_id INT NOT NULL,  -- Nhóm mà yêu cầu hoặc lời mời hướng đến
    request_type ENUM('join_request', 'invitation') NOT NULL,  -- Kiểu yêu cầu: xin gia nhập ('join_request') hoặc lời mời ('invitation')
    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',  -- Trạng thái của yêu cầu (chờ, chấp nhận, từ chối)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian tạo yêu cầu
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật yêu cầu
    FOREIGN KEY (user_id) REFERENCES users(user_id),  -- Tham chiếu đến người dùng
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id)  -- Tham chiếu đến nhóm
);

-- Seeder: Thêm người dùng mẫu vào bảng users
INSERT INTO users (username, password) VALUES
('admin_user', 'password123'),
('user1', 'password456'),
('user2', 'password789');

-- Seeder: Thêm nhóm mẫu vào bảng groups
INSERT INTO `groups` (group_name, created_by) VALUES
('Group A', 1),  -- admin_user làm người tạo nhóm
('Group B', 2),  -- user1 làm người tạo nhóm
('Group C', 3);  -- user2 làm người tạo nhóm

-- Seeder: Liên kết người dùng với nhóm trong bảng user_groups
INSERT INTO user_groups (user_id, group_id, role) VALUES
(1, 1, 'admin'),  -- admin_user là admin của Group A
(2, 1, 'member'),  -- user1 là member của Group A
(3, 2, 'member'),  -- user2 là member của Group B
(1, 3, 'member');  -- admin_user là member của Group C

-- Seeder: Thêm thư mục mẫu vào bảng directories
INSERT INTO directories (dir_name, group_id, created_by) VALUES
('Documents', 1, 1),  -- Group A có thư mục 'Documents'
('Photos', 2, 2),     -- Group B có thư mục 'Photos'
('Videos', 3, 3);     -- Group C có thư mục 'Videos'

-- Seeder: Thêm tệp mẫu vào bảng files
INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
('file1.txt', '/files/file1.txt', 500, 1, 1, 1),  -- user1 tải file lên Group A, thư mục 'Documents'
('file2.jpg', '/files/file2.jpg', 1500, 2, 2, 2), -- user2 tải file lên Group B, thư mục 'Photos'
('file3.mp4', '/files/file3.mp4', 3000, 3, 3, 3); -- user3 tải file lên Group C, thư mục 'Videos'

-- Seeder: Thêm log hoạt động vào bảng activity_log
INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES
(1, 'created group', 'group', 1, 'Group A was created by admin_user'),
(2, 'joined group', 'group', 1, 'user1 joined Group A'),
(3, 'uploaded file', 'group', 2, 'user2 uploaded file2.jpg to Group B');

-- Seeder: Thêm yêu cầu gia nhập nhóm vào bảng group_requests
INSERT INTO group_requests (user_id, group_id, request_type, status) VALUES
(2, 3, 'join_request', 'pending'),  -- user2 yêu cầu gia nhập Group C
(1, 2, 'invitation', 'accepted');   -- admin_user mời user1 gia nhập Group B
