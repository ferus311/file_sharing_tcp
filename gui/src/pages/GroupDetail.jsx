import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, Typography, Card, List, Avatar, message, Button, Modal, Input, Upload } from 'antd';
import { FolderOutlined, FileOutlined, TeamOutlined, LogoutOutlined, UserOutlined, PlusSquareOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './GroupDetail.css';
import { useAuth } from '../context/AuthContext';
import Documents from '../pages/group/Documents';
import Members from '../pages/group/Members';
import Requests from '../pages/group/Requests';

const { Sider, Content } = Layout;
message.config({
    top: 80, // Cách mép trên cùng 80px
    duration: 2, // Thời gian hiển thị mặc định 2 giây
    maxCount: 3, // Số lượng message tối đa hiển thị cùng lúc
});

const LeaveGroup = () => <div>Leave Group Component</div>;


const GroupDetail = () => {
    const { token } = useAuth();
    const location = useLocation();
    const { groupId, groupName } = location.state || {};
    const [currentView, setCurrentView] = useState('documents'); // Trạng thái hiện tại của nội dung
    const navigate = useNavigate();

    const [reFetch, setReFetch] = useState(false);
    const [isAdmin, setIsAdmin] = useState(0);  

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

    const parseApiCheckAdmin = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        const result = parseInt(parts[1], 10);
        return result;
    };

    const fetchCheckAdmin = async () => {
        console.log("----------Start fetchCheckAdmin-----------")
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response2 = await window.electronAPI.checkAdmin(cleanToken, groupId);
            console.log("fetchCheckAdmin: " + response2);
            setReFetch(false)
            if (response2.startsWith('2000')) {
                const result = parseApiCheckAdmin(response2);
                setIsAdmin(result);
            } else {
                console.error('Failed to fetch group members:', response2);
            }
        } catch (error) {
            console.error('Error fetching group members:', error);
        }
    };


    useEffect(() => {
        fetchCheckAdmin();
    }, [reFetch]);

    const renderContent = () => {
        switch (currentView) {
            case 'documents':
                return <Documents groupId={groupId} token={token} isAdminProps={isAdmin} setReFetch={setReFetch}/>;
            case 'members':
                return <Members groupId={groupId} token={token} isAdminProps={isAdmin} setReFetch={setReFetch}/>;
            case 'requests':
                return <Requests groupId={groupId} token={token} isAdminProps={isAdmin} setReFetch={setReFetch}/>;
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
                message.info(`Uploading chunk ${chunkIndex + 1} of ${totalChunks}`);
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
                    <Menu.Item key="requests" icon={<PlusSquareOutlined />}>
                        Requests
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
