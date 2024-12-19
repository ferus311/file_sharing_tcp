INSERT INTO users (username, password) VALUES
('dmn', '123');

INSERT INTO `groups` (group_name, created_by) VALUES
('group_1', 1),
('group_2', 1);

INSERT INTO user_groups (user_id, group_id, role) VALUES
(1, 1, 'admin'),
(1, 2, 'admin');

INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES
('gr1_dir1', NULL, 1, 1),
('gr1_dir1_dir1', 1, 1, 1);

INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
('gr1_file1.txt', '/uploads/group_1/gr1_file1.txt', 2048, 1, 1, NULL),
('gr1_dir1_file1.txt', '/uploads/group_1/gr1_dir1/gr1_dir1_file1.txt', 2048, 1, 1, 1),
('gr1_dir1_dir1_file1.txt', '/uploads/group_1/gr1_dir1/gr1_dir1_dir1/gr1_dir1_dir1_file1.txt', 2048, 1, 1, 2),
('gr2_file1.txt', '/uploads/group_2/gr2_file1.txt', 2048, 1, 2, NULL);
