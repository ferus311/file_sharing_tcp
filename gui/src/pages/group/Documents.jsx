import React, { useEffect, useState } from 'react';
import { Layout, Card, List, Avatar, message, Button, Popconfirm, Modal, Input, Upload, Spin } from 'antd';
import { FolderOutlined, FileOutlined, DeleteOutlined, UploadOutlined, PlusOutlined, DownloadOutlined, CopyOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Documents = ({ groupId, rootDirId, token, isAdminProps, setReFetch }) => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(isAdminProps);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const [itemsDir, setItemsDir] = useState([]);
    const [dirId, setDirId] = useState(rootDirId);
    const [dirHistory, setDirHistory] = useState([rootDirId]); // Track directory history

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadingFileName, setUploadingFileName] = useState('');
    const [overwriteConfirmVisible, setOverwriteConfirmVisible] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);

    const [copying, setCopying] = useState(false);
    const [itemToCopy, setItemToCopy] = useState(null);
    const [targetDirId, setTargetDirId] = useState(null);

    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [itemToRename, setItemToRename] = useState(null);

    const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
    const [itemToMove, setItemToMove] = useState(null);
    const [moveTargetDirId, setMoveTargetDirId] = useState(null);

    const [overwriteCopyConfirmVisible, setOverwriteCopyConfirmVisible] = useState(false);
    const [overwriteMoveConfirmVisible, setOverwriteMoveConfirmVisible] = useState(false);

    useEffect(() => {
        fetchListGroupContent();
    }, [groupId, dirId]);

    const fetchListGroupContent = async () => {
        setLoading(true);
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.listDirectory(cleanToken, groupId, dirId);
            if (!isAdminProps) setReFetch(true);

            if (response.startsWith('2000')) {
                let data = response.slice(5).trim();
                if (data.endsWith('||')) data = data.slice(0, -2);

                const dataArray = data ? data.split('||').map(item => {
                    const [type, id, name] = item.split('&');
                    return { type, id: parseInt(id, 10), name };
                }) : [];

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
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            let response = "";

            if (itemType === 'D') response = await window.electronAPI.deleteFolder(cleanToken, itemId);
            else if (itemType === 'F') response = await window.electronAPI.deleteFile(cleanToken, itemId);

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
            setDirHistory([...dirHistory, item.id]);
            setDirId(item.id);
        }
    };

    const handleBack = () => {
        if (dirHistory.length > 1) {
            const newHistory = [...dirHistory];
            newHistory.pop();
            setDirId(newHistory[newHistory.length - 1]);
            setDirHistory(newHistory);
        }
    };

    const handleUpload = async ({ file }) => {
        const existingFile = items.find(item => item.name === file.name && item.type === 'F');
        if (existingFile) {
            setFileToUpload(file);
            setOverwriteConfirmVisible(true);
            return;
        }
        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUploading(true);
        setUploadingFileName(file.name);

        const CHUNK_SIZE = 1024; // Kích thước mỗi phần tệp
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileExtension = file.name.split('.').pop(); // Trích xuất định dạng tệp

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            // Đọc chunk dưới dạng base64
            const chunkData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]); // Lấy dữ liệu base64
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(chunk);
            });

            // Chuỗi dữ liệu cần upload
            const dataString = `${file.name}||${fileExtension}||${chunkIndex}||${totalChunks}||${chunkData}`;

            try {
                const response = await window.electronAPI.uploadFile(token, groupId, dirId, dataString);
                if (response.startsWith('2001')) {
                    // Chunk upload successful
                } else if (response.startsWith('2000')) {
                    // File upload successful
                    message.success('File uploaded successfully.');
                    setUploading(false);
                    setUploadingFileName('');
                    fetchListGroupContent();
                    return;
                } else {
                    throw new Error('Failed to upload chunk');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                message.error('An error occurred while uploading the file.');
                setUploading(false);
                setUploadingFileName('');
                return;
            }
        }

        message.success('File uploaded successfully.');
        fetchListGroupContent();
    };

    const confirmOverwrite = async () => {
        setOverwriteConfirmVisible(false);
        if (fileToUpload) {
            await uploadFile(fileToUpload);
            setFileToUpload(null);
        }
    };

    const cancelOverwrite = () => {
        setOverwriteConfirmVisible(false);
        setFileToUpload(null);
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            const result = await window.electronAPI.downloadFile(token, fileId, fileName);

            if (result.success) {
                alert(`File has been downloaded to: ${result.filePath}`);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleCreateFolder = async () => {
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.createFolder(cleanToken, groupId, dirId, newFolderName);

            if (response.startsWith('2000')) {
                message.success('Folder created successfully.');
                fetchListGroupContent();
            } else {
                console.error('Failed to create folder:', response);
                message.error('An error occurred while creating the folder.');
            }

            setIsModalVisible(false);
            setNewFolderName('');
        } catch (error) {
            console.error('Error creating folder:', error);
            message.error('An error occurred while creating the folder.');
        }
    };

    const fetchTargetDirContent = async (targetDirId) => {
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.listDirectory(cleanToken, groupId, targetDirId);
            if (response.startsWith('2000')) {
                let data = response.slice(5).trim();
                if (data.endsWith('||')) data = data.slice(0, -2);

                const dataArray = data.split('||').map(item => {
                    const [type, id, name] = item.split('&');
                    return { type, id: parseInt(id, 10), name };
                });

                return dataArray;
            } else {
                console.error('Failed to fetch target directory content:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching target directory content:', error);
            return [];
        }
    };

    const handleCopyItem = async () => {
        if (!itemToCopy || !targetDirId) return;
        const targetItems = await fetchTargetDirContent(targetDirId);
        const existingItem = targetItems.find(item => item.name === itemToCopy.name && item.type === itemToCopy.type);
        if (existingItem) {
            setOverwriteCopyConfirmVisible(true);
            return;
        }
        await copyItem();
    };

    const copyItem = async () => {
        setCopying(true);
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.copyItem(cleanToken, itemToCopy.id, targetDirId, itemToCopy.type === 'F');
            if (response.startsWith('2000')) {
                message.success('Item copied successfully.');
                fetchListGroupContent();
            } else {
                console.error('Failed to copy item:', response);
                message.error('An error occurred while copying the item.');
            }
        } catch (error) {
            console.error('Error copying item:', error);
            message.error('An error occurred while copying the item.');
        } finally {
            setCopying(false);
            setItemToCopy(null);
            setTargetDirId(null);
        }
    };

    const confirmOverwriteCopy = async () => {
        setOverwriteCopyConfirmVisible(false);
        await copyItem();
    };

    const handleRenameItem = async () => {
        if (!itemToRename || !newItemName) return;
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.renameItem(cleanToken, itemToRename.id, newItemName, itemToRename.type === 'F');
            if (response.startsWith('2000')) {
                message.success('Item renamed successfully.');
                fetchListGroupContent();
            } else {
                console.error('Failed to rename item:', response);
                message.error('An error occurred while renaming the item.');
            }
        } catch (error) {
            console.error('Error renaming item:', error);
            message.error('An error occurred while renaming the item.');
        } finally {
            setIsRenameModalVisible(false);
            setNewItemName('');
            setItemToRename(null);
        }
    };

    const handleMoveItem = async () => {
        if (!itemToMove || !moveTargetDirId) return;
        const targetItems = await fetchTargetDirContent(moveTargetDirId);
        const existingItem = targetItems.find(item => item.name === itemToMove.name && item.type === itemToMove.type);
        if (existingItem) {
            setOverwriteMoveConfirmVisible(true);
            return;
        }
        await moveItem();
    };

    const moveItem = async () => {
        try {
            const cleanToken = token.replace(/\n/g, '').replace(/\r/g, '');
            const response = await window.electronAPI.moveItem(cleanToken, itemToMove.id, moveTargetDirId, itemToMove.type === 'F');
            if (response.startsWith('2000')) {
                message.success('Item moved successfully.');
                fetchListGroupContent();
            } else {
                console.error('Failed to move item:', response);
                message.error('An error occurred while moving the item.');
            }
        } catch (error) {
            console.error('Error moving item:', error);
            message.error('An error occurred while moving the item.');
        } finally {
            setIsMoveModalVisible(false);
            setMoveTargetDirId(null);
            setItemToMove(null);
        }
    };

    const confirmOverwriteMove = async () => {
        setOverwriteMoveConfirmVisible(false);
        await moveItem();
    };

    return (
        <>
            {uploading && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <Spin size="large" tip={`Uploading ${uploadingFileName}...`} />
                </div>
            )}
            <Modal
                title="File already exists"
                visible={overwriteConfirmVisible}
                onOk={confirmOverwrite}
                onCancel={cancelOverwrite}
                okText="Overwrite"
                cancelText="Cancel"
            >
                <p>A file with the same name already exists. Do you want to overwrite it?</p>
            </Modal>
            <Modal
                title="Item already exists"
                visible={overwriteCopyConfirmVisible}
                onOk={confirmOverwriteCopy}
                onCancel={() => setOverwriteCopyConfirmVisible(false)}
                okText="Overwrite"
                cancelText="Cancel"
            >
                <p>An item with the same name already exists in the target directory. Do you want to overwrite it?</p>
            </Modal>
            <Modal
                title="Item already exists"
                visible={overwriteMoveConfirmVisible}
                onOk={confirmOverwriteMove}
                onCancel={() => setOverwriteMoveConfirmVisible(false)}
                okText="Overwrite"
                cancelText="Cancel"
            >
                <p>An item with the same name already exists in the target directory. Do you want to overwrite it?</p>
            </Modal>
            <Modal
                title="Copy Item"
                visible={!!itemToCopy}
                onOk={handleCopyItem}
                onCancel={() => setItemToCopy(null)}
                okText="Copy"
                cancelText="Cancel"
            >
                <Input
                    placeholder="Enter target directory ID"
                    value={targetDirId}
                    onChange={(e) => setTargetDirId(e.target.value)}
                />
            </Modal>
            <Modal
                title="Rename Item"
                visible={isRenameModalVisible}
                onOk={handleRenameItem}
                onCancel={() => setIsRenameModalVisible(false)}
                okText="Rename"
                cancelText="Cancel"
            >
                <Input
                    placeholder="Enter new item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                />
            </Modal>
            <Modal
                title="Move Item"
                visible={isMoveModalVisible}
                onOk={handleMoveItem}
                onCancel={() => setIsMoveModalVisible(false)}
                okText="Move"
                cancelText="Cancel"
            >
                <Input
                    placeholder="Enter target directory ID"
                    value={moveTargetDirId}
                    onChange={(e) => setMoveTargetDirId(e.target.value)}
                />
            </Modal>
            <div>
                {isAdmin === 1 ? "ADMIN" : "MEMBER"}
            </div>
            <Layout>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack} disabled={dirHistory.length <= 1}>
                        Back
                    </Button>
                    <Upload customRequest={handleUpload} showUploadList={false} style={{ marginLeft: '8px' }}>
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
                locale={{ emptyText: 'No documents in this group' }} // Add this line
                renderItem={item => (
                    <List.Item key={item.id}>
                        <Card
                            className="custom-card shadow-sm p-3 mb-5 bg-white rounded"
                            title={item.type === 'D' ? <FolderOutlined className="large-icon" /> : <FileOutlined className="large-icon" />}
                            onClick={() => handleItemClick(item)}
                            hoverable
                            extra={
                                <>
                                    {isAdmin === 1 && (
                                        <Popconfirm
                                            title="Are you sure to delete this item?"
                                            onConfirm={() => handleDeleteItem(item.id, item.type)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined style={{ color: 'red' }} />}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Popconfirm>
                                    )}
                                    {item.type === 'F' && (
                                        <Button
                                            type="text"
                                            icon={<DownloadOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadFile(item.id, item.name);
                                            }}
                                        />
                                    )}
                                    <Button
                                        type="text"
                                        icon={<CopyOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToCopy(item);
                                        }}
                                    />
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToRename(item);
                                            setIsRenameModalVisible(true);
                                        }}
                                    />
                                    <Button
                                        type="text"
                                        icon={<ArrowRightOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToMove(item);
                                            setIsMoveModalVisible(true);
                                        }}
                                    />
                                </>
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
