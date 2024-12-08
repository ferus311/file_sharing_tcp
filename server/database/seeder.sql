-- Thêm dữ liệu mẫu vào bảng users
INSERT INTO users (username, password) VALUES
('alice', 'password4'),
('bob', 'password5'),
('charlie', 'password6'),
('david', 'password7'),
('eve', 'password8'),
('frank', 'password9'),
('grace', 'password10'),
('hannah', 'password11'),
('isaac', 'password12'),
('jane', 'password13');

-- Thêm dữ liệu mẫu vào bảng groups
INSERT INTO `groups` (group_name, created_by) VALUES
('team_alpha', 1),
('team_beta', 2),
('project_delta', 3),
('study_group', 4),
('hiking_club', 5),
('coding_club', 6),
('art_enthusiasts', 7),
('book_lovers', 8),
('sports_fans', 9),
('movie_buff', 10);

-- Thêm dữ liệu mẫu vào bảng user_groups
INSERT INTO user_groups (user_id, group_id, role) VALUES
(1, 1, 'admin'), (2, 1, 'member'),
(3, 2, 'admin'), (4, 2, 'member'),
(5, 3, 'admin'), (6, 3, 'member'),
(7, 4, 'admin'), (8, 4, 'member'),
(9, 5, 'admin'), (10, 5, 'member'),
(2, 6, 'admin'), (3, 6, 'member'),
(4, 7, 'admin'), (5, 7, 'member'),
(6, 8, 'admin'), (7, 8, 'member'),
(8, 9, 'admin'), (9, 9, 'member'),
(10, 10, 'admin'), (1, 10, 'member');

-- Thêm dữ liệu mẫu vào bảng directories
INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES
('documents', NULL, 1, 1), ('images', NULL, 1, 1),
('root', NULL, 2, 3), ('subdir_alpha', 3, 2, 3),
('data', NULL, 3, 5), ('reports', NULL, 3, 5),
('shared', NULL, 4, 7), ('projects', NULL, 4, 7),
('public', NULL, 5, 9), ('private', NULL, 5, 9);

-- Thêm dữ liệu mẫu vào bảng files
INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
('doc1.pdf', '/uploads/group_1/docs/doc1.pdf', 2048, 1, 1, 1),
('img1.png', '/uploads/group_1/images/img1.png', 1024, 1, 1, 2),
('presentation.pptx', '/uploads/group_1/root/presentation.pptx', 4096, 3, 2, 3),
('notes.txt', '/uploads/group_1/subdir_alpha/notes.txt', 512, 4, 2, 4),
('data.csv', '/uploads/group_1/data/data.csv', 8192, 5, 3, 5),
('summary.docx', '/uploads/group_1/reports/summary.docx', 4096, 5, 3, 6),
('collaborate.md', '/uploads/group_1/shared/collaborate.md', 1024, 7, 4, 7),
('prototype.zip', '/uploads/group_1/projects/prototype.zip', 2048, 7, 4, 8),
('schedule.xls', '/uploads/group_1/public/schedule.xls', 3072, 9, 5, 9),
('confidential.pdf', '/uploads/group_1/private/confidential.pdf', 1024, 9, 5, 10);

-- Thêm dữ liệu mẫu vào bảng activity_log
INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES
(1, 'uploaded file', 'group', 1, 'User 1 uploaded doc1.pdf to group 1'),
(2, 'joined group', 'group', 1, 'User 2 joined group 1'),
(3, 'uploaded file', 'group', 2, 'User 3 uploaded presentation.pptx to group 2'),
(4, 'created directory', 'group', 2, 'User 4 created subdir_alpha in group 2'),
(5, 'uploaded file', 'group', 3, 'User 5 uploaded data.csv to group 3'),
(6, 'created group', 'group', 6, 'User 6 created coding_club group'),
(7, 'shared file', 'group', 4, 'User 7 shared prototype.zip in group 4'),
(8, 'joined group', 'group', 8, 'User 8 joined group 8'),
(9, 'uploaded file', 'group', 5, 'User 9 uploaded schedule.xls to group 5'),
(10, 'joined group', 'group', 10, 'User 10 joined movie_buff group');

-- Thêm dữ liệu mẫu vào bảng group_requests
INSERT INTO group_requests (user_id, group_id, request_type, status) VALUES
(1, 6, 'join_request', 'pending'),
(2, 7, 'invitation', 'accepted'),
(3, 8, 'join_request', 'rejected'),
(4, 9, 'invitation', 'pending'),
(5, 10, 'join_request', 'pending'),
(6, 1, 'invitation', 'accepted'),
(7, 2, 'join_request', 'pending'),
(8, 3, 'invitation', 'rejected'),
(9, 4, 'join_request', 'accepted'),
(10, 5, 'invitation', 'pending');
