import React, { useEffect, useState } from 'react';
import { Typography, Card, List, Avatar, message, Button, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Members = ({ groupId, token, isAdminProps, setReFetch }) => {
    const { t } = useTranslation(); // Initialize useTranslation
    const [members, setMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(isAdminProps);
    const { username } = useAuth();
    const parseApiMemberResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        const members = parts[1].split('||').map(member => {
            const [id, name] = member.split('&');
            return { id, name };
        });
        return members;
    };

    const handleDeleteMember = async (memberId) => {
        try {
            const response = await window.electronAPI.removeMember(token, groupId, memberId);
            if (response.startsWith('2000')) {
                message.success(t('member_removed_successfully'));
                fetchGroupMembers();
            } else {
                message.error(t('failed_to_remove_member'));
                console.error('Failed to remove member:', response);
            }
        } catch (error) {
            console.error('Error removing member:', error);
            message.error(t('error_removing_member'));
        }
    };

    const fetchGroupMembers = async () => {
        try {
            const response = await window.electronAPI.listGroupMembers(token, groupId);
            if (!isAdminProps) setReFetch(true);

            if (response.startsWith('2000')) {
                const parsedMembers = parseApiMemberResponse(response);
                setMembers(parsedMembers);
            } else {
                console.error('Failed to fetch group members:', response);
            }
        } catch (error) {
            console.error('Error fetching group members:', error);
        }
    };

    useEffect(() => {
        fetchGroupMembers();

    }, [groupId]);

    return (
        <div className="container">
            <div>
                {isAdmin === 1 ? t('admin') : t('member')}
            </div>
            <List
                itemLayout="horizontal"
                dataSource={members}
                renderItem={member => (
                    <List.Item
                        actions={
                            isAdmin === 1 && member.name != username
                                ? [
                                    <Popconfirm
                                        title={t('are_you_sure_to_remove_this_member')}
                                        onConfirm={() => handleDeleteMember(member.id)}
                                        okText={t('yes')}
                                        cancelText={t('no')}
                                    >
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined style={{ color: 'red' }} />}
                                        />
                                    </Popconfirm>
                                ]
                                : []
                        }
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={<Typography.Text>{member.name}</Typography.Text>}
                            description={t('member_id') + member.id}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
}

export default Members;
