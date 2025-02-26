import React, { useEffect, useState } from 'react';
import { Typography, Card, Spin, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const FileDetail = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const { token } = useAuth();
    const { fileId, groupId } = useParams();
    const [fileDetails, setFileDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập API để lấy thông tin chi tiết của file
        const fetchFileDetails = async () => {
            // Giả lập API response cho thông tin tệp
            const apiResponse = await fakeFileDetail(groupId, fileId);
            setFileDetails(apiResponse);
            setLoading(false);
        };

        fetchFileDetails();
    }, [groupId, fileId]);

    const fakeFileDetail = (groupId, fileId) => {
        // Giả lập dữ liệu trả về từ API
        return {
            id: fileId,
            name: `File Name ${fileId}`,
            description: `This is the detailed description for file ${fileId}.`,
            size: `${Math.floor(Math.random() * 100)} MB`,
            // createdAt: '2024-01-01',
        };
    };

    const handleDownloadFile = async () => {
        try {
            const result = await window.electronAPI.downloadFile(token, fileId);
            if (result.success) {
                alert(t('file_downloaded_to', { filePath: result.filePath }));
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '100px' }}>
            <Typography.Title level={2} style={{ color: 'white' }}>{t('file_details')}</Typography.Title>

            <Card
                title={`${t('file')}: ${fileDetails.name}`}
                extra={<Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadFile}>{t('download')}</Button>}
                style={{ width: 600, margin: '0 auto' }}
            >
                <Typography.Paragraph>{fileDetails.description}</Typography.Paragraph>
                <Typography.Paragraph>{t('size')}: {fileDetails.size}</Typography.Paragraph>
                <Typography.Paragraph>{t('created_at')}: {fileDetails.createdAt}</Typography.Paragraph>
            </Card>
        </div>
    );
};

export default FileDetail;
