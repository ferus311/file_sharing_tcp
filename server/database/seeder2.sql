-- Chèn dữ liệu mẫu vào bảng users
INSERT INTO `users` (username, password) VALUES
    ('john_doe', 'password123'),
    ('jane_smith', 'password456'),
    ('alice_wong', 'password789'),
    ('bob_johnson', 'password101'),
    ('mary_clark', 'password102');

-- Chèn dữ liệu mẫu vào bảng groups
INSERT INTO `groups` (group_name, created_by) VALUES
    ('Tech Enthusiasts', 1),
    ('Book Club', 2),
    ('Photography Lovers', 3),
    ('Music Lovers', 4),
    ('Art Appreciation', 5);

-- Chèn thư mục root vào bảng directories (trigger sẽ tự động gán root_dir_id cho mỗi nhóm)
-- Không cần chèn dữ liệu vào bảng directories, vì trigger đã tự động tạo thư mục root.

-- Chèn dữ liệu mẫu vào bảng user_groups
INSERT INTO `user_groups` (user_id, group_id, role) VALUES
    (1, 1, 'admin'),
    (2, 2, 'member'),
    (3, 3, 'admin'),
    (4, 4, 'member'),
    (5, 5, 'admin');

-- Chèn dữ liệu mẫu vào bảng files
INSERT INTO `files` (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
    ('tech_meeting_minutes.txt', '/tech_meeting/tech_meeting_minutes.txt', 5000, 1, 1, 1),
    ('book_review.docx', '/book_review/book_review.docx', 3000, 2, 2, 2),
    ('photography_tips.pdf', '/photography_tips/photography_tips.pdf', 2000, 3, 3, 3),
    ('music_playlist.m3u', '/music_playlist/music_playlist.m3u', 7000, 4, 4, 4),
    ('art_gallery.zip', '/art_gallery/art_gallery.zip', 12000, 5, 5, 5);

-- Chèn dữ liệu mẫu vào bảng activity_log
INSERT INTO `activity_log` (user_id, action, target_type, target_id, details) VALUES
    (1, 'Created Group', 'group', 1, 'Tech Enthusiasts group created'),
    (2, 'Joined Group', 'group', 2, 'Joined Book Club'),
    (3, 'Uploaded File', 'group', 1, 'Uploaded tech meeting minutes'),
    (4, 'Created File', 'group', 2, 'Uploaded book review document'),
    (5, 'Joined Group', 'group', 3, 'Joined Photography Lovers');

-- Chèn dữ liệu mẫu vào bảng group_requests
INSERT INTO `group_requests` (user_id, group_id, request_type, status) VALUES
    (2, 1, 'join_request', 'pending'),
    (3, 2, 'invitation', 'accepted'),
    (4, 3, 'join_request', 'rejected'),
    (5, 1, 'invitation', 'accepted');
