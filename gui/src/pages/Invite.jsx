import React, { useEffect, useState } from "react";
import { List, Button, Card, message, Spin, Empty, Tag, Input } from "antd"; // Import Input for search
import { CheckOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons"; // Import SearchOutlined
import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Invite = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const response = await window.electronAPI.listInvitations(token);
            if (response.startsWith("2000")) {
                const data = response
                    .slice(5)
                    .trim()
                    .split("||")
                    .map((item) => {
                        const [groupId, groupName, requestId, status] = item.split("&");
                        return { groupId, groupName, requestId, status };
                    });
                setInvitations(data);
            } else {
                setInvitations([]);
            }
        } catch (error) {
            console.error("Error fetching invitations:", error);
        } finally {
            setLoading(false);
        }
    };

    const respondToInvitation = async (requestId, approvalStatus) => {
        try {
            const response = await window.electronAPI.respondInvitation(
                token,
                requestId,
                approvalStatus
            );
            if (response.startsWith("2000")) {
                message.success(
                    t(`invitation_${approvalStatus}_successfully`)
                );
                setInvitations((prev) =>
                    prev.map((invite) =>
                        invite.requestId === requestId
                            ? { ...invite, status: approvalStatus }
                            : invite
                    )
                );
            } else {
                message.error(
                    t(`failed_to_${approvalStatus}_invitation`)
                );
            }
        } catch (error) {
            console.error(
                `Error ${approvalStatus === "accepted" ? "accepting" : "rejecting"
                } invitation:`,
                error
            );
            message.error(
                t(`error_${approvalStatus}_invitation`)
            );
        }
    };

    const handleAccept = (requestId) => respondToInvitation(requestId, "accepted");
    const handleReject = (requestId) => respondToInvitation(requestId, "rejected");

    return (
        <div>
            <div
                className="breadcrumb-wrapper bg-cover"
                style={{ backgroundImage: "url('/assets/img/breadcrumb-1.jpg')" }}
            >
                <div className="container">
                    <div className="page-heading">
                        <div className="page-header-left">
                            <h1 className="wow fadeInUp" data-wow-delay=".3s">
                                {t('lets_share_together')}
                            </h1>
                        </div>
                        <div className="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
                            <img src="/assets/img/breadcrumb.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: "20px" }}>
                <h2>{t('group_invitations')}</h2>
                {loading ? (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Spin tip={t('loading_invitations')} />
                    </div>
                ) : invitations.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Empty description={t('no_pending_invitations')} />
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 16, column: 2 }}
                        dataSource={invitations}
                        renderItem={(invite) => (
                            <List.Item key={invite.requestId}>
                                <Card
                                    title={invite.groupName}
                                    extra={
                                        <Tag
                                            color={
                                                invite.status === "pending"
                                                    ? "blue"
                                                    : invite.status === "accepted"
                                                        ? "green"
                                                        : "red"
                                            }
                                        >
                                            {t(invite.status)}
                                        </Tag>
                                    }
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            onClick={() => handleAccept(invite.requestId)}
                                            disabled={invite.status !== "pending"}
                                        >
                                            {t('accept')}
                                        </Button>
                                        <Button
                                            type="danger"
                                            icon={<CloseOutlined />}
                                            onClick={() => handleReject(invite.requestId)}
                                            disabled={invite.status !== "pending"}
                                        >
                                            {t('reject')}
                                        </Button>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default Invite;
