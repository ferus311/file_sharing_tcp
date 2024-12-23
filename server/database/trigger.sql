DELIMITER $$

CREATE TRIGGER create_default_directory
AFTER INSERT ON `groups`
FOR EACH ROW
BEGIN
    DECLARE root_dir_id INT;

    -- Tạo thư mục root cho nhóm mới
    INSERT INTO directories (dir_name, group_id, created_by)
    VALUES ('root', NEW.group_id, NEW.created_by);

    -- Lấy ID của thư mục root vừa tạo
    SET root_dir_id = LAST_INSERT_ID();

    -- Cập nhật root_dir_id trong bảng groups
    UPDATE `groups`
    SET root_dir_id = root_dir_id
    WHERE group_id = NEW.group_id;
END $$

DELIMITER ;
