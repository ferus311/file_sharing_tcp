import React, { useEffect, useState } from 'react';
import { List, Typography, Card } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import './GroupDetail.css';

const GroupDetail = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        // Simulate API call
        const apiResponse = "2000 D&dir_id1&dir_name1||F&file_id1&file_name1||D&dir_id2&dir_name2||F&file_id2&file_name2";
        const parsedItems = parseApiResponse(apiResponse);
        setItems(parsedItems);
    }, []);

    const parseApiResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];
        const items = parts[1].split('||').map(item => {
            const [type, id, name] = item.split('&');
            return { type, id, name };
        });
        return items;
    };

    return (
        <div className="container" style={{ paddingTop: '100px'}}>
            <Typography.Title level={2} style={{ color: 'white' }}>Group Details</Typography.Title>
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
        </div>
    );
};

export default GroupDetail;
