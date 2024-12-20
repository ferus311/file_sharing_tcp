import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, Typography, Card, List, Avatar, message, Button, Popconfirm } from 'antd';
import { FolderOutlined, FileOutlined, TeamOutlined, LogoutOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Documents = ({ groupId, token, isAdminProps, setReFetch }) => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(isAdminProps);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchListGroupContent();
    }, [groupId]);

    const fetchListGroupContent = async () => {
        console.log("----------Start fetchListGroupContent-----------")
        setLoading(true);
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.listGroupContent(cleanToken, groupId);
            console.log("fetchListGroupContent>>> " + response);
            if(!isAdminProps) setReFetch(true);


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

    const handleDeleteItem = async (itemId, itemType) => {
        console.log(`Deleting item with ID: ${itemId}`);
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = "";

            if (itemType == 'D') response = await window.electronAPI.deleteDir(cleanToken, itemId);
            else if(itemType == 'F') response = await window.electronAPI.deleteFile(cleanToken, itemId);

            console.log("reshandleDeleteItem: " + response)

            if (response.startsWith('2000')) {
                message.success("Item deleted successfully");
                fetchListGroupContent();
            } else {
                console.error("Failed to delete item:", response);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };


    const handleItemClick = (item) => {
        if (item.type === 'D') {
            navigate(`/group/${groupId}/folder/${item.id}`);
        } else {
            navigate(`/group/${groupId}/file/${item.id}`);
        }
    };

    return (
        <>
            <div>  
                {isAdmin === 1 ? "ADMIN" : "MEMBER"} 
            </div>
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
                        extra={
                            isAdmin === 1 && (
                                <Popconfirm
                                    title="Are you sure to delete this item?"
                                    onConfirm={() => handleDeleteItem(item.id, item.type)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined style={{ color: 'red' }} />}
                                        onClick={(e) => e.stopPropagation()} // Ngăn chặn mở card khi click xóa
                                    />
                                </Popconfirm>
                            )
                        }
                    >
                        <Card.Meta
                            title={item.type === 'D' ? `Directory: ${item.name}` : `File: ${item.name}`}
                            description={`ID: ${item.id}`}
                        />
                    </Card>
                </List.Item>
            )}
        />
        </>
    );
}

export default Documents;
