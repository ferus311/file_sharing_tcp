ALTER TABLE files
ADD CONSTRAINT fk_files_directory
FOREIGN KEY (dir_id) REFERENCES directories(dir_id)
ON DELETE CASCADE;

ALTER TABLE directories
ADD CONSTRAINT fk_directories_parent
FOREIGN KEY (parent_id) REFERENCES directories(dir_id)
ON DELETE CASCADE;
