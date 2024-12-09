import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, Typography, Card, List, Avatar, message } from 'antd';
import { FolderOutlined, FileOutlined, TeamOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './GroupDetail.css';
import { useAuth } from '../context/AuthContext';

const { Sider, Content } = Layout;

const Documents = ({ items }) => (
    <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={items}
        renderItem={item => (
            <List.Item>
                <Card
                    className="custom-card shadow-sm p-3 mb-5 bg-white rounded"
                    title={item.type === 'D' ? <FolderOutlined className="large-icon" /> : <FileOutlined className="large-icon" />}
                >
                    <Card.Meta
                        title={item.type === 'D' ? `Directory: ${item.name}` : `File: ${item.name}`}
                        description={`ID: ${item.id}`}
                    />
                </Card>
            </List.Item>
        )}
    />
);

const Members = ({ members }) => (
    <div className="container">
        <List
            itemLayout="horizontal"
            dataSource={members}
            renderItem={member => (
                <List.Item>
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

const LeaveGroup = () => <div>Leave Group Component</div>;

const GroupDetail = () => {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { groupId, groupName } = location.state || {};
    const [currentView, setCurrentView] = useState('documents'); // Trạng thái hiện tại của nội dung
    const [items, setItems] = useState([]);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        // Simulate API call
        const apiFileResponse = "2000 D&dir_id1&dir_name1||F&file_id1&file_name1||D&dir_id2&dir_name2||F&file_id2&file_name2";

        const parsedFileItems = parseApiDirResponse(apiFileResponse);
        setItems(parsedFileItems);

        const fetchGroupMembers = async () => {
            try {
                const response = await window.electronAPI.listGroupMembers(token, groupId);
                console.log(response);

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

        fetchGroupMembers();
        // const apiMemberResponse = "2000 MEMBER_ID1&MEMBER_Name1||MEMBER_ID2&MEMBER_Name2";
        // const parsedMemItems = parseApiMemberResponse(apiMemberResponse);
        // setMembers(parsedMemItems);


    }, [groupId]);

    const parseApiDirResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        return parts[1].split('||').map(item => {
            const [type, id, name] = item.split('&');
            return { type, id, name };
        });
    };

    const parseApiMemberResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        const members = parts[1].split('||').map(member => {
            const [id, name] = member.split('&');
            return { id, name };
        });
        return members;
    };

    const renderContent = () => {
        switch (currentView) {
            case 'documents':
                return <Documents items={items} />;
            case 'members':
                return <Members members={members} />;
            case 'leave':
                return <LeaveGroup />;
            default:
                return <div>Select an option from the menu</div>;
        }
    };

    const handleLeaveGroup = async () => {
        try {
            const response = await window.electronAPI.leaveGroup(token, groupId);
            if (response.startsWith('2000')) {
                message.success('You have left the group successfully.');
                navigate('/');
            } else {
                message.error('Failed to leave the group.');
            }
        } catch (error) {
            console.error('Error leaving group:', error);
            message.error('An error occurred while leaving the group.');
        }
    };
    return (
        <Layout style={{ minHeight: '100vh', paddingTop: '100px' }}>
            <Sider width={200} style={{ background: 'white' }}>
                <div className='fs-4 text-uppercase' style={{ padding: '10px', textAlign: 'center', background: 'white', fontWeight: 'bold' }}>
                    {groupName}
                </div>
                <Menu
                    mode="inline"
                    onClick={({ key }) => setCurrentView(key)} // Thay đổi trạng thái khi nhấp vào menu
                    selectedKeys={[currentView]}
                >
                    <Menu.Item key="documents" icon={<FolderOutlined />}>
                        Documents
                    </Menu.Item>
                    <Menu.Item key="members" icon={<TeamOutlined />}>
                        Members
                    </Menu.Item>
                    <Menu.Item key="leave" onClick={handleLeaveGroup} icon={<LogoutOutlined />} style={{ color: 'red' }}>
                        Leave Group
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Breadcrumb style={{ margin: '16px' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>{groupName}</Breadcrumb.Item>
                </Breadcrumb>
                <Content style={{ padding: 24 }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default GroupDetail;
