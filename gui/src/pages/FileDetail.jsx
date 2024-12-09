import React, { useEffect, useState } from 'react';
import { Typography, Card, Spin, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const FileDetail = () => {
    const { fileId, groupId } = useParams();
    const [fileDetails, setFileDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập API để lấy thông tin chi tiết của file
        const fetchFileDetails = async () => {
            // Giả lập API response cho thông tin tệp
            const apiResponse = await fetchFileDetail(groupId, fileId);
            setFileDetails(apiResponse);
            setLoading(false);
        };

        fetchFileDetails();
    }, [groupId, fileId]);

    const fetchFileDetail = (groupId, fileId) => {
        // Giả lập dữ liệu trả về từ API
        return {
            id: fileId,
            name: `File Name ${fileId}`,
            description: `This is the detailed description for file ${fileId}.`,
            size: `${Math.floor(Math.random() * 100)} MB`,
            createdAt: '2024-01-01',
            downloadLink: `https://example.com/file/${fileId}/download`,
        };
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
            <Typography.Title level={2} style={{ color: 'white' }}>File Details</Typography.Title>

            <Card
                title={`File: ${fileDetails.name}`}
                extra={<Button type="primary" icon={<DownloadOutlined />} href={fileDetails.downloadLink} target="_blank">Download</Button>}
                style={{ width: 600, margin: '0 auto' }}
            >
                <Typography.Text><strong>Description:</strong> {fileDetails.description}</Typography.Text><br />
                <Typography.Text><strong>Size:</strong> {fileDetails.size}</Typography.Text><br />
                <Typography.Text><strong>Created At:</strong> {fileDetails.createdAt}</Typography.Text><br />
            </Card>
        </div>
    );
};

export default FileDetail;
