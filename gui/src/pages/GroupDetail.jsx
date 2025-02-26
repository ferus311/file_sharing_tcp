import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, message } from 'antd';
import { FolderOutlined, TeamOutlined, LogoutOutlined, PlusSquareOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Documents from '../pages/group/Documents';
import Members from '../pages/group/Members';
import Requests from '../pages/group/Requests';
import LogActivity from '../pages/group/LogActivity';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const { Sider, Content } = Layout;
message.config({
    top: 80, // Cách mép trên cùng 80px
    duration: 2, // Thời gian hiển thị mặc định 2 giây
    maxCount: 3, // Số lượng message tối đa hiển thị cùng lúc
});

const LeaveGroup = () => <div>Leave Group Component</div>;

// Add Banner component
const Banner = ({ groupName }) => {
    const { t } = useTranslation(); // Initialize useTranslation
    return (
        <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: '#f0f2f5',
            borderRadius: '8px',
            margin: '20px 0'
        }}>
            <h1 style={{ fontSize: '2.5em', marginBottom: '20px' }}>{t('welcome_to')} {groupName}</h1>
            <p style={{ fontSize: '1.2em', color: '#666' }}>
                {t('collaborate_with_team')}
            </p>
        </div>
    );
};

const GroupDetail = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const { token } = useAuth();
    const location = useLocation();
    const { groupId, groupName, rootDirId } = location.state || {};

    const [currentView, setCurrentView] = useState('banner'); // Changed default view to banner
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
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response2 = await window.electronAPI.checkAdmin(cleanToken, groupId);
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
        if (!token) navigate('/login');
        fetchCheckAdmin();
    }, []);

    const renderContent = () => {
        switch (currentView) {
            case 'banner':
                return <Banner groupName={groupName} />;
            case 'documents':
                return <Documents groupId={groupId} rootDirId={rootDirId} token={token} isAdminProps={isAdmin} setReFetch={setReFetch} />;
            case 'members':
                return <Members groupId={groupId} token={token} isAdminProps={isAdmin} setReFetch={setReFetch} />;
            case 'requests':
                return <Requests groupId={groupId} token={token} isAdminProps={isAdmin} setReFetch={setReFetch} />;
            case 'logActivity':
                return <LogActivity groupId={groupId} />;
            case 'leave':
                return <LeaveGroup />;
            default:
                return <div>{t('select_option')}</div>;
        }
    };

    const handleLeaveGroup = async () => {
        try {
            const response = await window.electronAPI.leaveGroup(token, groupId);
            if (response.startsWith('2000')) {
                message.success(t('left_group_successfully'));
                navigate('/');
            } else {
                message.error(t('failed_to_leave_group'));
            }
        } catch (error) {
            console.error('Error leaving group:', error);
            message.error(t('error_leaving_group'));
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
                    <Menu.Item key="banner" icon={<HomeOutlined />}>
                        {t('home')}
                    </Menu.Item>
                    <Menu.Item key="documents" icon={<FolderOutlined />}>
                        {t('documents')}
                    </Menu.Item>
                    <Menu.Item key="members" icon={<TeamOutlined />}>
                        {t('members')}
                    </Menu.Item>
                    <Menu.Item key="requests" icon={<PlusSquareOutlined />}>
                        {t('requests')}
                    </Menu.Item>
                    <Menu.Item key="logActivity" icon={<FileTextOutlined />}>
                        {t('log_activity')}
                    </Menu.Item>
                    <Menu.Item key="leave" onClick={handleLeaveGroup} icon={<LogoutOutlined />} style={{ color: 'red' }}>
                        {t('leave_group')}
                    </Menu.Item>
                </Menu>
            </Sider>

            <Content style={{ padding: 24 }}>
                <Breadcrumb style={{ margin: '16px' }}>
                    <Breadcrumb.Item>{t('home')}</Breadcrumb.Item>
                    <Breadcrumb.Item>{groupName}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t('root_dir_id')} : {rootDirId}</Breadcrumb.Item>
                </Breadcrumb>
                {renderContent()}
            </Content>
        </Layout>
    );
};

export default GroupDetail;
