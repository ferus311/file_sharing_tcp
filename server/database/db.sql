-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS file_sharing;

-- Sử dụng cơ sở dữ liệu vừa tạo
USE file_sharing;

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
    FOREIGN KEY (parent_id) REFERENCES directories(dir_id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng lưu thông tin các tệp trong từng thư mục
CREATE TABLE IF NOT EXISTS files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by INT NOT NULL,
    group_id INT NOT NULL,
    dir_id INT DEFAULT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE,
    FOREIGN KEY (dir_id) REFERENCES directories(dir_id) ON DELETE SET NULL
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

-- Thêm dữ liệu mẫu vào bảng users
INSERT INTO users (username, password) VALUES
('user1', 'password1'),
('user2', 'password2'),
('user3', 'password3');

-- Thêm dữ liệu mẫu vào bảng groups
INSERT INTO `groups` (group_name, created_by) VALUES
('group1', 1),
('group2', 2),
('group3', 3);

-- Thêm dữ liệu mẫu vào bảng user_groups
INSERT INTO user_groups (user_id, group_id, role) VALUES
(1, 1, 'admin'),
(2, 1, 'member'),
(3, 2, 'admin'),
(1, 3, 'member');

-- Thêm dữ liệu mẫu vào bảng directories
INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES
('root', NULL, 1, 1),
('subdir1', 1, 1, 1),
('subdir2', 1, 2, 2);

-- Thêm dữ liệu mẫu vào bảng files
INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
('file1.txt', '/path/to/file1.txt', 1024, 1, 1, 1),
('file2.txt', '/path/to/file2.txt', 2048, 2, 1, 2),
('file3.txt', '/path/to/file3.txt', 4096, 3, 2, NULL);

-- Thêm dữ liệu mẫu vào bảng activity_log
INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES
(1, 'created group', 'group', 1, 'User 1 created group 1'),
(2, 'joined group', 'group', 1, 'User 2 joined group 1'),
(3, 'created group', 'group', 2, 'User 3 created group 2');
