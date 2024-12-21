INSERT INTO users (username, password) VALUES
('dmn', '123'),
('dmn2', '123'),
('dmn3', '123'),
('dmn4', '123'),
('dmn5', '123'),
('dmn6', '123'),
('dmn7', '123'),
('dmn8', '123');

INSERT INTO `groups` (group_name, created_by) VALUES
('group_1', 1),
('group_2', 1),
('group_3', 2),
('group_4', 2),
('group_5', 3),
('group_6', 3);

INSERT INTO user_groups (user_id, group_id, role) VALUES
(1, 1, 'admin'),
(1, 2, 'admin'),
(1, 3, 'member'),
(2, 1, 'member'),
(2, 2, 'member'),
(2, 3, 'admin'),
(2, 4, 'admin'),
(3, 4, 'member'),
(3, 5, 'admin'),
(3, 6, 'admin'),
(4, 1, 'member'),
(7, 1, 'member');


INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES
('gr1_dir1', NULL, 1, 1),
('gr3_dir1', NULL, 3, 2),
('gr4_dir1', NULL, 4, 2),
('gr5_dir1', NULL, 5, 3),
('gr6_dir1', NULL, 6, 3),
('gr1_dir1_dir1', 1, 1, 1);

INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
('gr1_file1.txt', '/uploads/group_1/gr1_file1.txt', 2048, 1, 1, NULL),
('gr1_dir1_file1.txt', '/uploads/group_1/gr1_dir1/gr1_dir1_file1.txt', 2048, 1, 1, 1),
('gr1_dir1_dir1_file1.txt', '/uploads/group_1/gr1_dir1/gr1_dir1_dir1/gr1_dir1_dir1_file1.txt', 2048, 1, 1, 2),
('gr2_file1.txt', '/uploads/group_2/gr2_file1.txt', 2048, 1, 2, NULL);

INSERT INTO group_requests (user_id, group_id, request_type, status) VALUES
(3, 1, 'join_request', 'pending'),
(4, 1, 'join_request', 'accepted'),
(5, 1, 'join_request', 'rejected'),
(6, 1, 'invitation', 'pending'),
(7, 1, 'invitation', 'accepted'),
(8, 1, 'invitation', 'rejected');
