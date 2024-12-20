import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, message} from 'antd';
import { FolderOutlined, TeamOutlined, LogoutOutlined, PlusSquareOutlined } from '@ant-design/icons';
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
                <Content style={{ padding: 24 }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default GroupDetail;
