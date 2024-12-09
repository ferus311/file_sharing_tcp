import React, { useEffect, useState } from 'react';
import { List, Typography, Card, Breadcrumb, Spin } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FolderDetail = () => {
    const [items, setItems] = useState([]);
    const [currentPath, setCurrentPath] = useState(['Home', 'Group Details']);
    const [loading, setLoading] = useState(false);
    const { groupId, folderId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const apiResponse = await fetchListDirectory(groupId, folderId);
                const parsedItems = parseApiResponse(apiResponse);
                setItems(parsedItems);

                setCurrentPath(prevPath => [
                    ...prevPath,
                    folderId ? `Folder: ${folderId}` : ''
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId, folderId]);

    const fetchListDirectory = async (groupId, folderId) => {
        const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
        try {
            const response = await window.electronAPI.listDirectory(cleanToken, groupId, folderId);
            if (response.startsWith('2000')) {
                let data = response.slice(5).trim();
                if (data.endsWith('||')) {
                    data = data.slice(0, -2);
                }
                return data;
            } else {
                console.error('API Error:', response);
                return '';
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return '';
        }
    };

    const parseApiResponse = (response) => {
        return response.split('||')
            .map(item => {
                const [type, id, name] = item.split('&');
                return { type, id: parseInt(id, 10), name };
            })
            .filter(item => item.type && item.id && item.name);
    };

    const handleItemClick = (item) => {
        const path = item.type === 'D'
            ? `/group/${groupId}/folder/${item.id}`
            : `/group/${groupId}/file/${item.id}`;
        navigate(path);
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <Typography.Title level={2} style={{ color: 'white' }}>Folder Details</Typography.Title>
            <Breadcrumb style={{ marginBottom: '16px' }}>
                {currentPath.map((step, index) => (
                    <Breadcrumb.Item key={index}>{step}</Breadcrumb.Item>
                ))}
            </Breadcrumb>

            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <List
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={items}
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
            )}
        </div>
    );
};

export default FolderDetail;
