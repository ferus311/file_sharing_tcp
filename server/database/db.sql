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
