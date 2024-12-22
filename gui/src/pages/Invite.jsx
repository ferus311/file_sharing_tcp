import React, { useEffect, useState } from "react";
import { List, Button, Card, message, Spin, Empty, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const Invite = () => {
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
      console.log("fetchInvitations:", response);
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
        console.log(requestId + " --- " + approvalStatus)
      const response = await window.electronAPI.respondInvitation(
        token,
        requestId,
        approvalStatus
      );
      console.log(`${approvalStatus} response:`, response);
      if (response.startsWith("2000")) {
        message.success(
          `Invitation ${approvalStatus === "accepted" ? "accepted" : "rejected"
          } successfully.`
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
          `Failed to ${approvalStatus === "accepted" ? "accept" : "reject"
          } invitation.`
        );
      }
    } catch (error) {
      console.error(
        `Error ${approvalStatus === "accepted" ? "accepting" : "rejecting"
        } invitation:`,
        error
      );
      message.error(
        `An error occurred while ${approvalStatus === "accepted" ? "accepting" : "rejecting"
        } the invitation.`
      );
    }
  };

  const handleAccept = (requestId) => respondToInvitation(requestId, "accepted");
  const handleReject = (requestId) => respondToInvitation(requestId, "rejected");

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
                Let's share together!
              </h1>
            </div>
            <div className="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
              <img src="assets/img/breadcrumb.png" alt="img" />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "20px" }}>
        <h2>Group Invitations</h2>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Spin tip="Loading invitations..." />
          </div>
        ) : invitations.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Empty description="No pending invitations" />
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
                      {invite.status.charAt(0).toUpperCase() +
                        invite.status.slice(1)}
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
                      Accept
                    </Button>
                    <Button
                      type="danger"
                      icon={<CloseOutlined />}
                      onClick={() => handleReject(invite.requestId)}
                      disabled={invite.status !== "pending"}
                    >
                      Reject
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
