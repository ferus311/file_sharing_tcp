import React, { useEffect, useState } from "react";
import { List, Button, Card, message, Spin, Empty, Tag, Input } from "antd"; // Import Input for search
import { PlusOutlined, SearchOutlined } from "@ant-design/icons"; // Import SearchOutlined
import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next'; // Import useTranslation

const JoinGroup = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [joinableGroups, setJoinableGroups] = useState([]);
    const [pendingGroups, setPendingGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    useEffect(() => {
        fetchGroupsNotJoined();
    }, []);

    const fetchGroupsNotJoined = async () => {
        try {
            setLoading(true);
            const response = await window.electronAPI.listGroupsNotJoined(token);
            if (response.startsWith("2000")) {
                const [joinableSection, pendingSection] = response
                    .slice(5)
                    .split("::")
                    .map((section) => section.trim());

                const joinable = joinableSection
                    ? joinableSection.split("||").map((item) => {
                        const [groupId, groupName] = item.split("&");
                        return { groupId, groupName };
                    })
                    : [];

                const pending = pendingSection
                    ? pendingSection.split("||").map((item) => {
                        const [groupId, groupName] = item.split("&");
                        return { groupId, groupName };
                    })
                    : [];

                setJoinableGroups(joinable);
                setPendingGroups(pending);
            } else {
                console.error("Failed to fetch groups.");
                setJoinableGroups([]);
                setPendingGroups([]);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async (groupId) => {
        try {
            const response = await window.electronAPI.requestJoinGroup(token, groupId);
            if (response.startsWith("2000")) {
                message.success(t('request_to_join_group_sent_successfully'));
                // Move the group from joinable to pending
                const joinedGroup = joinableGroups.find(
                    (group) => group.groupId === groupId
                );
                setJoinableGroups((prevGroups) =>
                    prevGroups.filter((group) => group.groupId !== groupId)
                );
                setPendingGroups((prevGroups) => [...prevGroups, joinedGroup]);
            }
        } catch (error) {
            console.error("Error sending join request:", error);
        }
    };

    // Filter joinable groups based on search term
    const filteredJoinableGroups = joinableGroups.filter(group =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                {t('discover_new_groups')}
                            </h1>
                        </div>
                        <div className="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
                            <img src="/assets/img/breadcrumb.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: "20px" }}>
                <h2>{t('groups_you_can_join')}</h2>
                <Input
                    placeholder={t('search_group_name')}
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: "20px" }}
                />
                {loading ? (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Spin tip={t('loading_groups')} />
                    </div>
                ) : filteredJoinableGroups.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Empty description={t('no_groups_available_to_join')} />
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={filteredJoinableGroups}
                        renderItem={(group) => (
                            <List.Item key={group.groupId}>
                                <Card title={group.groupName}>
                                    <div style={{ textAlign: "center" }}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleJoinRequest(group.groupId)}
                                        >
                                            {t('request_to_join')}
                                        </Button>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}

                <h2 style={{ marginTop: "40px" }}>{t('pending_join_requests')}</h2>
                {pendingGroups.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Empty description={t('no_pending_requests')} />
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={pendingGroups}
                        renderItem={(group) => (
                            <List.Item key={group.groupId}>
                                <Card title={group.groupName}>
                                    <div style={{ textAlign: "center" }}>
                                        <Tag color="blue">{t('pending')}</Tag>
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

export default JoinGroup;
