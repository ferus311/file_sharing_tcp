import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, Typography, Card, List, Avatar, message, Button, Modal, Input, Upload } from 'antd';
import { FolderOutlined, FileOutlined, TeamOutlined, LogoutOutlined, UserOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './GroupDetail.css';
import { useAuth } from '../context/AuthContext';

const { Sider, Content } = Layout;

const Documents = ({ handleItemClick, groupId, token }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchListGroupContent = async (groupId) => {
        setLoading(true);
        try {
            const response = await window.electronAPI.listGroupContent(token, groupId);
            console.log(response);

            if (response.startsWith('2000')) {
                let data = response.slice(5).trim();
                if (data.endsWith('||')) data = data.slice(0, -2);

                const dataArray = data.split('||').map(item => {
                    const [type, id, name] = item.split('&');
                    return { type, id: parseInt(id, 10), name };
                });

                setItems(dataArray);
            } else {
                console.error('Failed to fetch groups:', response);
                setItems([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListGroupContent(groupId);
    }, [groupId]);

    return (
        <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={items}
            loading={loading}
            renderItem={item => (
                <List.Item key={item.id}>
                    <Card
                        className="custom-card shadow-sm p-3 mb-5 bg-white rounded"
                        title={item.type === 'D' ? <FolderOutlined className="large-icon" /> : <FileOutlined className="large-icon" />}
                        onClick={() => handleItemClick(item)}
                        hoverable
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
};

const Members = ({ groupId, token }) => {
    const [members, setMembers] = useState([]);
    const parseApiMemberResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        const members = parts[1].split('||').map(member => {
            const [id, name] = member.split('&');
            return { id, name };
        });
        return members;
    };

    useEffect(() => {
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

    }, [groupId]);

    return (
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
}

const LeaveGroup = () => <div>Leave Group Component</div>;


const GroupDetail = () => {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { groupId, groupName } = location.state || {};
    const [currentView, setCurrentView] = useState('documents'); // Trạng thái hiện tại của nội dung
    const [items, setItems] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const parseApiResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        const items = parts[1].split('||').map(item => {
            const [type, id, name] = item.split('&');
            return { type, id, name };
        });
        return items;
    };

    const handleItemClick = (item) => {
        if (item.type === 'D') {
            navigate(`/group/${groupId}/folder/${item.id}`);
        } else {
            navigate(`/group/${groupId}/file/${item.id}`);
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'documents':
                return <Documents groupId={groupId} token={token} handleItemClick={handleItemClick} />;
            case 'members':
                return <Members groupId={groupId} token={token} />;
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

    const handleUpload = async ({ file }) => {
        const CHUNK_SIZE = 1024; // Kích thước mỗi phần tệp
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileExtension = file.name.split('.').pop(); // Trích xuất định dạng tệp

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const chunkData = e.target.result.split(',')[1]; // Lấy dữ liệu base64 từ kết quả đọc
                const dataString = `${file.name}||${fileExtension}||${chunkIndex}||${totalChunks}||${chunkData}`;

                try {
                    const response = await window.electronAPI.uploadFile(token, groupId, dataString);
                    if (!response.startsWith('2000')) {
                        throw new Error('Failed to upload chunk');
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    message.error('An error occurred while uploading the file.');
                    return;
                }
            };
            reader.readAsDataURL(chunk);
            await new Promise(resolve => reader.onloadend = resolve); // Đảm bảo rằng mỗi phần được gửi tuần tự
        }

        message.success('File uploaded successfully.');
        // Refresh the list of documents
        const fetchGroupDetails = async () => {
            try {
                const response = await window.electronAPI.getGroupDetails(groupId);
                if (response.startsWith('2000')) {
                    const parsedItems = parseApiResponse(response);
                    setItems(parsedItems);
                } else {
                    console.error('Failed to fetch group details:', response);
                }
            } catch (error) {
                console.error('Error fetching group details:', error);
            }
        };
        fetchGroupDetails();
    };


    const handleCreateFolder = async () => {
        try {
            setItems([...items, { type: 'D', id: 1, name: newFolderName }]);
            message.success('Folder created successfully.');
            setIsModalVisible(false);
            setNewFolderName('');
            // const response = await window.electronAPI.createFolder(token, groupId, newFolderName);
            // if (response.startsWith('2000')) {
            //     message.success('Folder created successfully.');
            //     setIsModalVisible(false);
            //     setNewFolderName('');

            //     setItems(...items, {type: 'D', id: 1, name: newFolderName})
            //     // Refresh the list of documents
            //     const fetchGroupDetails = async () => {
            //         try {
            //             const response = await window.electronAPI.getGroupDetails(groupId);
            //             if (response.startsWith('2000')) {
            //                 const parsedItems = parseApiResponse(response);
            //                 setItems(parsedItems);
            //             } else {
            //                 console.error('Failed to fetch group details:', response);
            //             }
            //         } catch (error) {
            //             console.error('Error fetching group details:', error);
            //         }
            //     };
            //     fetchGroupDetails();
            // } else {
            //     message.error('Failed to create folder.');
            // }
        } catch (error) {
            console.error('Error creating folder:', error);
            message.error('An error occurred while creating the folder.');
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
                <div style={{ marginBottom: '16px', display: 'flex', }}>
                    <Upload customRequest={handleUpload}>
                        <Button icon={<UploadOutlined />}>Upload File</Button>
                    </Upload>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} style={{ marginLeft: '8px' }}>
                        Create Folder
                    </Button>
                </div>

                <Content style={{ padding: 24 }}>
                    {renderContent()}
                </Content>
                <Modal
                    title="Create New Folder"
                    visible={isModalVisible}
                    onOk={handleCreateFolder}
                    onCancel={() => setIsModalVisible(false)}
                >
                    <Input
                        placeholder="Enter folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                </Modal>
            </Layout>
        </Layout>
    );
};

export default GroupDetail;
