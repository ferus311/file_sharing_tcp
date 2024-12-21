// import React, { useEffect, useState } from 'react';
// import { Typography, List, Avatar, Button, Tag, message } from 'antd';
// import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
// import { useAuth } from '../../context/AuthContext';

// const Requests = ({ groupId, token, isAdminProps, setReFetch }) => {
//     const [listJoinRequests, setListJoinRequests] = useState([]); // Danh sách join requests
//     const [listInvitations, setListInvitations] = useState([]); // Danh sách invitations
//     const [isAdmin, setIsAdmin] = useState(isAdminProps);
//     const { username } = useAuth();

//     // Parse API response
//     const parseApiListRequestsResponse = (response) => {
//         const parts = response.split(' ');
//         if (parts[0] !== '2000') return [];

//         // Ghép lại dữ liệu sau mã 2000
//         const data = parts.slice(1).join(' '); // Phần dữ liệu còn lại sau '2000'
//         if (!data) return []; // Kiểm tra nếu dữ liệu trống

//         // Xử lý từng yêu cầu
//         const requests = data.split('||').map((request) => {
//             const [request_id, user_name, request_type, status, created_at] = request.split('&');
//             if (request_id && user_name && request_type && status && created_at) {
//                 return {
//                     request_id: request_id.trim(),
//                     user_name: user_name.trim(),
//                     request_type: request_type.trim(),
//                     status: status.trim(),
//                     created_at: created_at.trim(),
//                 };
//             }
//             return null; // Bỏ qua dữ liệu không hợp lệ
//         }).filter(Boolean); // Loại bỏ các phần tử null

//         return requests;
//     };

//     const fetchListRequests = async () => {
//         console.log("----------Start fetchListRequests-----------");
//         try {
//             const response = await window.electronAPI.listRequests(token, groupId);
//             console.log("fetchListRequests: " + response);

//             if (!isAdminProps) setReFetch(true);

//             if (response.startsWith('2000')) {
//                 const parsedRequests = parseApiListRequestsResponse(response);
//                 const joinRequests = parsedRequests.filter(req => req.request_type === 'join_request');
//                 const invitations = parsedRequests.filter(req => req.request_type === 'invitation');

//                 setListJoinRequests(joinRequests);
//                 setListInvitations(invitations);
//             } else {
//                 console.error('Failed to fetch list requests:', response);
//             }
//         } catch (error) {
//             console.error('Error fetching list requests:', error);
//         }
//     };

//     useEffect(() => {
//         fetchListRequests();
//     }, [groupId]);

//     const handleAction = async (action, requestId) => {
//         console.log(`Performing ${action} on request ID: ${requestId}`);
//         const response = await window.electronAPI.approveJoinRequest(token, requestId, action);
//         console.log("handleAction: " + response);

//         if (response.startsWith('2000')) {
//             message.success(`${action} successfully`);
//             await fetchListRequests();
//         } else {
//             console.error('Failed to fetch list requests:', response);
//         }
//     };

//     return (
//         <div className="container">
//             <Typography.Title level={3}>
//                 {isAdmin === 1 ? "Admin View - Manage Requests" : "Request Overview"}
//             </Typography.Title>

//             {/* Join Requests Section */}
//             <Typography.Title level={4}>Join Requests</Typography.Title>
//             <List
//                 itemLayout="vertical"
//                 dataSource={listJoinRequests}
//                 renderItem={(request) => (
//                     <List.Item
//                         actions={
//                             isAdmin === 1 && request.status === 'pending'
//                                 ? [
//                                       <Button
//                                           type="text"
//                                           icon={<CheckOutlined style={{ color: 'green' }} />}
//                                           onClick={() => handleAction('accepted', request.request_id)}
//                                       >
//                                           Accept
//                                       </Button>,
//                                       <Button
//                                           type="text"
//                                           icon={<CloseOutlined style={{ color: 'red' }} />}
//                                           onClick={() => handleAction('rejected', request.request_id)}
//                                       >
//                                           Reject
//                                       </Button>,
//                                   ]
//                                 : []
//                         }
//                     >
//                         <List.Item.Meta
//                             avatar={<Avatar icon={<UserOutlined />} />}
//                             title={`Join Request from ${request.user_name}`}
//                             description={
//                                 <>
//                                     <Tag
//                                         color={
//                                             request.status === 'pending'
//                                                 ? 'blue'
//                                                 : request.status === 'accepted'
//                                                 ? 'green'
//                                                 : 'red'
//                                         }
//                                     >
//                                         {request.status.toUpperCase()}
//                                     </Tag>
//                                     <Typography.Text type="secondary">
//                                         {`Created at: ${request.created_at}`}
//                                     </Typography.Text>
//                                 </>
//                             }
//                         />
//                     </List.Item>
//                 )}
//             />

//             {/* Invitations Section */}
//             <Typography.Title level={4}>Invitations</Typography.Title>
//             <List
//                 itemLayout="vertical"
//                 dataSource={listInvitations}
//                 renderItem={(invitation) => (
//                     <List.Item>
//                         <List.Item.Meta
//                             avatar={<Avatar icon={<UserOutlined />} />}
//                             title={`Invitation for ${invitation.user_name}`}
//                             description={
//                                 <>
//                                     <Tag
//                                         color={
//                                             invitation.status === 'pending'
//                                                 ? 'blue'
//                                                 : invitation.status === 'accepted'
//                                                 ? 'green'
//                                                 : 'red'
//                                         }
//                                     >
//                                         {invitation.status.toUpperCase()}
//                                     </Tag>
//                                     <Typography.Text type="secondary">
//                                         {`Created at: ${invitation.created_at}`}
//                                     </Typography.Text>
//                                 </>
//                             }
//                         />
//                     </List.Item>
//                 )}
//             />
//         </div>
//     );
// };

// export default Requests;

import React, { useEffect, useState } from 'react';
import { Typography, List, Avatar, Button, Tag, message, Select, Form } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const Requests = ({ groupId, token, isAdminProps, setReFetch }) => {
    const [listJoinRequests, setListJoinRequests] = useState([]); // Join requests
    const [listInvitations, setListInvitations] = useState([]); // Invitations
    const [availableUsers, setAvailableUsers] = useState([]); // Users available for invitation
    const [isAdmin, setIsAdmin] = useState(isAdminProps);
    const { username } = useAuth();
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);

    // Parse API response
    const parseApiListRequestsResponse = (response) => {
        const parts = response.split(' ');
        if (parts[0] !== '2000') return [];

        const data = parts.slice(1).join(' ');
        if (!data) return [];

        const requests = data.split('||').map((request) => {
            const [request_id, user_name, request_type, status, created_at] = request.split('&');
            if (request_id && user_name && request_type && status && created_at) {
                return {
                    request_id: request_id.trim(),
                    user_name: user_name.trim(),
                    request_type: request_type.trim(),
                    status: status.trim(),
                    created_at: created_at.trim(),
                };
            }
            return null;
        }).filter(Boolean);

        return requests;
    };

    const fetchListRequests = async () => {
        try {
            const response = await window.electronAPI.listRequests(token, groupId);
            if (!isAdminProps) setReFetch(true);

            if (response.startsWith('2000')) {
                const parsedRequests = parseApiListRequestsResponse(response);
                const joinRequests = parsedRequests.filter(req => req.request_type === 'join_request');
                const invitations = parsedRequests.filter(req => req.request_type === 'invitation');

                setListJoinRequests(joinRequests);
                setListInvitations(invitations);
            } else {
                console.error('Failed to fetch list requests:', response);
            }
        } catch (error) {
            console.error('Error fetching list requests:', error);
        }
    };

    const fetchAvailableUsers = async () => {
        if (isFetchingUsers) return; // Prevent multiple calls
        setIsFetchingUsers(true);

        try {
            const response = await window.electronAPI.listAvailableInviteUsers(token, groupId);
            if (response.startsWith('2000')) {
                const parsedUsers = response
                    .slice(5)
                    .split('||')
                    .map(user => {
                        const [user_id, user_name] = user.split('&');
                        return { user_id: user_id.trim(), user_name: user_name.trim() };
                    });
                setAvailableUsers(parsedUsers);
            } else {
                console.error('Failed to fetch available users:', response);
            }
        } catch (error) {
            console.error('Error fetching available users:', error);
        } finally {
            setIsFetchingUsers(false);
        }
    };

    useEffect(() => {
        fetchListRequests();
    }, [groupId]);

    const handleAction = async (action, requestId) => {
        const response = await window.electronAPI.approveJoinRequest(token, requestId, action);
        if (response.startsWith('2000')) {
            message.success(`${action} successfully`);
            await fetchListRequests();
        } else {
            console.error('Failed to perform action on request:', response);
        }
    };

    const handleSendInvitation = async (values) => {
        try {
            const { user_id } = values;
            const response = await window.electronAPI.inviteUserToGroup(token, groupId, user_id);
            if (response.startsWith('2000')) {
                message.success('Invitation sent successfully');
                fetchListRequests();
                setAvailableUsers([]); // Clear available users
            } else {
                message.error('Failed to send invitation');
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            message.error('Failed to send invitation');
        }
    };

    return (
        <div className="container">
            <Typography.Title level={3}>
                {isAdmin === 1 ? "Admin View - Manage Requests" : "Request Overview"}
            </Typography.Title>

            {/* Invitation Sending Section */}
            {isAdmin === 1 && (
                <div style={{ marginBottom: '20px' }}>
                    <Typography.Title level={4}>Invite Users</Typography.Title>
                    <Form
                        layout="inline"
                        onFinish={handleSendInvitation}
                    >
                        <Form.Item
                            name="user_id"
                            rules={[{ required: true, message: 'Please select a user to invite' }]}
                        >
                            <Select
                                style={{ width: 300 }}
                                placeholder="Select a user to invite"
                                options={availableUsers.map(user => ({
                                    value: user.user_id,
                                    label: user.user_name,
                                }))}
                                onClick={fetchAvailableUsers} // Fetch available users on click
                                loading={isFetchingUsers} // Show loading while fetching
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Send Invitation
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}

            {/* Join Requests Section */}
            <Typography.Title level={4}>Join Requests</Typography.Title>
            <List
                itemLayout="vertical"
                dataSource={listJoinRequests}
                renderItem={(request) => (
                    <List.Item
                        actions={isAdmin === 1 && request.status === 'pending'
                            ? [
                                  <Button
                                      type="text"
                                      icon={<CheckOutlined style={{ color: 'green' }} />}
                                      onClick={() => handleAction('accepted', request.request_id)}
                                  >
                                      Accept
                                  </Button>,
                                  <Button
                                      type="text"
                                      icon={<CloseOutlined style={{ color: 'red' }} />}
                                      onClick={() => handleAction('rejected', request.request_id)}
                                  >
                                      Reject
                                  </Button>,
                              ]
                            : []
                        }
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={`Join Request from ${request.user_name}`}
                            description={
                                <>
                                    <Tag
                                        color={
                                            request.status === 'pending'
                                                ? 'blue'
                                                : request.status === 'accepted'
                                                ? 'green'
                                                : 'red'
                                        }
                                    >
                                        {request.status.toUpperCase()}
                                    </Tag>
                                    <Typography.Text type="secondary">
                                        {`Created at: ${request.created_at}`}
                                    </Typography.Text>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />

            {/* Invitations Section */}
            <Typography.Title level={4}>Invitations</Typography.Title>
            <List
                itemLayout="vertical"
                dataSource={listInvitations}
                renderItem={(invitation) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={`Invitation for ${invitation.user_name}`}
                            description={
                                <>
                                    <Tag
                                        color={
                                            invitation.status === 'pending'
                                                ? 'blue'
                                                : invitation.status === 'accepted'
                                                ? 'green'
                                                : 'red'
                                        }
                                    >
                                        {invitation.status.toUpperCase()}
                                    </Tag>
                                    <Typography.Text type="secondary">
                                        {`Created at: ${invitation.created_at}`}
                                    </Typography.Text>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Requests;
