import React, { useEffect, useState } from 'react';
import { Layout, Card, List, Avatar, message, Button, Popconfirm, Modal, Input, Upload } from 'antd';
import { FolderOutlined, FileOutlined,   DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Documents = ({ groupId, token, isAdminProps, setReFetch }) => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(isAdminProps);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const [itemsDir, setItemsDir] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

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

    const handleUpload = async ({ file }) => {
        const CHUNK_SIZE = 1024; // Kích thước mỗi phần tệp
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileExtension = file.name.split('.').pop(); // Trích xuất định dạng tệp
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
                    console.log(response);
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
        fetchListGroupContent();
    };


    const handleCreateFolder = async () => {
        try {
            setItemsDir([...itemsDir, { type: 'D', id: 1, name: newFolderName }]);
            message.success('Folder created successfully.');
            setIsModalVisible(false);
            setNewFolderName('');
            // const response = await window.electronAPI.createFolder(token, groupId, newFolderName);
            // if (response.startsWith('2000')) {
            //     message.success('Folder created successfully.');
            //     setIsModalVisible(false);
            //     setNewFolderName('');

            //     setItemsDir(...itemsDir, {type: 'D', id: 1, name: newFolderName})
            //     // Refresh the list of documents
            //     const fetchGroupDetails = async () => {
            //         try {
            //             const response = await window.electronAPI.getGroupDetails(groupId);
            //             if (response.startsWith('2000')) {
            //                 const parsedItemsDir = parseApiResponse(response);
            //                 setItemsDir(parsedItemsDir);
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
        <>
            <div>  
                {isAdmin === 1 ? "ADMIN" : "MEMBER"} 
            </div>
            <Layout>
                <div style={{ marginBottom: '16px', display: 'flex', }}>
                    <Upload customRequest={handleUpload}>
                        <Button icon={<UploadOutlined />}>Upload File</Button>
                    </Upload>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} style={{ marginLeft: '8px' }}>
                        Create Folder
                    </Button>
                </div>
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
