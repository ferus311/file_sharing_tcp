-- Adding more users to test different roles and cases
INSERT INTO users (username, password) VALUES
('admin_user', 'adminpass'),   -- Administrator for groups
('member_user', 'memberpass'), -- Regular member
('guest_user', 'guestpass');   -- User with no group access

-- Adding more groups for testing group permissions
INSERT INTO `groups` (group_name, created_by) VALUES
('group4', 4),   -- Created by `admin_user`
('group5', 5);   -- Created by `member_user`

-- Adding more user-group relationships to test permissions
INSERT INTO user_groups (user_id, group_id, role) VALUES
(1, 1, 'admin'),      -- user1 as admin in group1
(2, 1, 'member'),     -- user2 as member in group1
(3, 2, 'admin'),      -- user3 as admin in group2
(4, 4, 'admin'),      -- admin_user as admin in group4
(5, 4, 'member'),     -- member_user as member in group4
(6, 5, 'admin');      -- guest_user as admin in group5, no other membership

-- Adding directories for testing nested structures and permission checks
INSERT INTO directories (dir_name, parent_id, group_id, created_by) VALUES
('dir1', NULL, 1, 1),      -- Root directory for group1 by user1
('subdir1', 1, 1, 2),      -- Subdirectory in dir1 for group1 by user2
('dir2', NULL, 2, 3),      -- Root directory for group2 by user3
('dir3', NULL, 4, 4),      -- Root directory for group4 by admin_user
('subdir2', 4, 4, 5);      -- Subdirectory in dir3 for group4 by member_user

-- Adding files for testing file access and listing
INSERT INTO files (file_name, file_path, file_size, uploaded_by, group_id, dir_id) VALUES
('file1_group1.txt', '/path/to/file1_group1.txt', 500, 1, 1, 1),  -- File in dir1 by user1 in group1
('file2_group1.txt', '/path/to/file2_group1.txt', 1000, 2, 1, 2), -- File in subdir1 by user2 in group1
('file3_group2.txt', '/path/to/file3_group2.txt', 2000, 3, 2, 3), -- File in dir2 by user3 in group2
('file4_group4.txt', '/path/to/file4_group4.txt', 2500, 4, 4, 4), -- File in dir3 by admin_user in group4
('file5_group4.txt', '/path/to/file5_group4.txt', 3000, 5, 4, 5); -- File in subdir2 by member_user in group4