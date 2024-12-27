import React, { useEffect, useState } from "react";
import { List, Button, Card, message, Spin, Empty, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const JoinGroup = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joinableGroups, setJoinableGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);

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
        message.success("Request to join group sent successfully.");
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

  return (
    <div>
      <div
        className="breadcrumb-wrapper bg-cover"
        style={{ backgroundImage: "url('assets/img/breadcrumb-1.jpg')" }}
      >
        <div className="container">
          <div className="page-heading">
            <div className="page-header-left">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">
                Discover New Groups!
              </h1>
            </div>
            <div className="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
              <img src="assets/img/breadcrumb.png" alt="img" />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "20px" }}>
        <h2>Groups You Can Join</h2>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Spin tip="Loading groups..." />
          </div>
        ) : joinableGroups.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Empty description="No groups available to join" />
          </div>
        ) : (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={joinableGroups}
            renderItem={(group) => (
              <List.Item key={group.groupId}>
                <Card title={group.groupName}>
                  <div style={{ textAlign: "center" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleJoinRequest(group.groupId)}
                    >
                      Request to Join
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}

        <h2 style={{ marginTop: "40px" }}>Pending Join Requests</h2>
        {pendingGroups.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Empty description="No pending requests" />
          </div>
        ) : (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={pendingGroups}
            renderItem={(group) => (
              <List.Item key={group.groupId}>
                <Card title={group.groupName}>
                  <div style={{ textAlign: "center" }}>
                    <Tag color="blue">Pending</Tag>
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
