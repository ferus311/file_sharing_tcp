import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Avatar } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const SearchGroups = ({ visible, onClose }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGroups, setFilteredGroups] = useState([]);


    // Dữ liệu nhóm để test
    const groups = [
        { id: 1, name: 'team_alpha' },
        { id: 2, name: 'team_beta' },
        { id: 3, name: 'project_delta' },
        { id: 4, name: 'study_group' },
        { id: 5, name: 'hiking_club' },
        { id: 6, name: 'coding_club' },
        { id: 7, name: 'art_enthusiasts' },
        { id: 8, name: 'book_lovers' },
        { id: 9, name: 'sports_fans' },
        { id: 10, name: 'movie_buff' },
    ];

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value) {
            const filtered = groups.filter(group => group.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredGroups(filtered);
        } else {
            setFilteredGroups([]);
        }
    };

    return (
        <Modal
            title="Search Groups"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Input
                placeholder="Search for groups"
                value={searchTerm}
                onChange={handleSearch}
            />
            <List
                itemLayout="horizontal"
                dataSource={filteredGroups}
                renderItem={group => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<FolderOutlined />} />}
                            title={group.name}
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default SearchGroups;
