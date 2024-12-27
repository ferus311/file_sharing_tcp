import React, { useEffect, useState } from 'react';
import { Typography, Card, List, Avatar, message, Button, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';


const Members = ({ groupId, token, isAdminProps, setReFetch }) => {
    const [members, setMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(isAdminProps);
    const {username} = useAuth();
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
                message.success('Member removed successfully');
                fetchGroupMembers();
            } else {
                message.error('Failed to remove member');
                console.error('Failed to remove member:', response);
            }
        } catch (error) {
            console.error('Error removing member:', error);
            message.error('An error occurred while removing the member');
        }
    };

    const fetchGroupMembers = async () => {
        try {
            const response = await window.electronAPI.listGroupMembers(token, groupId);
            if(!isAdminProps) setReFetch(true);

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
                {isAdmin === 1 ? "ADMIN" : "MEMBER"}
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
                                        title="Are you sure to remove this member?"
                                        onConfirm={() => handleDeleteMember(member.id)}
                                        okText="Yes"
                                        cancelText="No"
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
                            description={`Member ID: ${member.id}`}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
}

export default Members;
