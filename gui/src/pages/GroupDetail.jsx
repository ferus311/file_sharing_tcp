import React, { useEffect, useState } from 'react';
import { List, Typography, Card, Breadcrumb } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GroupDetail = () => {
    const [items, setItems] = useState([]);
    const [currentPath, setCurrentPath] = useState(['Home', 'Group Details']);
    const [loading, setLoading] = useState(false);
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        fetchListGroupContent(groupId);
    }, [groupId]);

    const fetchListGroupContent = async (groupId) => {
        setLoading(true);
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.listGroupContent(cleanToken, groupId);

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

    const handleItemClick = (item) => {
        if (item.type === 'D') {
            navigate(`/group/${groupId}/folder/${item.id}`);
            setCurrentPath(prevPath => [...prevPath, item.name]);
        } else {
            navigate(`/group/${groupId}/file/${item.id}`);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <Typography.Title level={2}>Group Details</Typography.Title>
            <Breadcrumb style={{ marginBottom: '16px' }}>
                {currentPath.map((step, index) => (
                    <Breadcrumb.Item key={index}>{step}</Breadcrumb.Item>
                ))}
            </Breadcrumb>

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
        </div>
    );
};

export default GroupDetail;
