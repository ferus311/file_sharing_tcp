import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Group from "../components/Group";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import CreateGroupModal from "../components/CreateGroupModal"; // Import Modal component

const Homepage = () => {
    const { token } = useAuth();
    const [groups, setGroups] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetching groups data
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await window.electronAPI.listGroups(token);
                if (response.startsWith('2000')) {
                    const data = response.slice(5); // Loại bỏ mã 2000 và khoảng trắng
                    const groupArray = data
                        .split('||') // Tách các nhóm bằng "||"
                        .map((item) => {
                            const [id, name] = item.split('&'); // Tách ID và tên nhóm bằng "&"
                            return { id: parseInt(id, 10), name };
                        });
                    setGroups(groupArray);
                } else {
                    console.error('Failed to fetch groups:', response);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, [token]);

    // Hiển thị Modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Đóng Modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Xử lý submit form tạo nhóm
    const handleCreateGroup = async (values) => {
        setLoading(true);
        try {
            const response = await window.electronAPI.createGroup(token, values.groupName);
            if (response.startsWith('2000')) {
                message.success('Group created successfully!');
                const newGroup = { id: response.split(' ')[1], name: values.groupName };
                setGroups([...groups, newGroup]);
                setIsModalVisible(false);
            } else {
                message.error('Failed to create group.');
            }
        } catch (error) {
            console.error("Error creating group:", error);
            message.error('An error occurred while creating the group.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="breadcrumb-wrapper bg-cover" style={{ backgroundImage: "url('assets/img/breadcrumb-1.jpg')" }}>
                <div className="container">
                    <div className="page-heading">
                        <div className="page-header-left">
                            <h1 className="wow fadeInUp" data-wow-delay=".3s">Let's share together!</h1>
                        </div>
                        <div className="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
                            <img src="assets/img/breadcrumb.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>

            <section className="news-section fix section-padding">
                <div className="container">
                    <div className="row g-4">
                        {groups.map((group, index) => (
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.1}s`} key={index}>
                                <Link to={`/group/${group.id}`}>
                                    <Group groupId={group.id} groupName={group.name} />
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="page-nav-wrap pt-5 text-center wow fadeInUp" data-wow-delay=".3s">
                        <ul>
                            <li><a className="page-numbers icon" href="news-grid.html#"><i className="fa-solid fa-arrow-left-long"></i></a></li>
                            <li><a className="page-numbers" href="news-grid.html#">01</a></li>
                            <li><a className="page-numbers" href="news-grid.html#">02</a></li>
                            <li><a className="page-numbers" href="news-grid.html#">03</a></li>
                            <li><a className="page-numbers icon" href="news-grid.html#"><i className="fa-solid fa-arrow-right-long"></i></a></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Nút + để mở Modal */}
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                size="large"
                style={{ position: "fixed", bottom: "30px", right: "30px" }}
            >
                Create Group
            </Button>

            {/* Gọi Modal CreateGroupModal */}
            <CreateGroupModal
                isModalVisible={isModalVisible}
                handleCancel={handleCancel}
                handleCreateGroup={handleCreateGroup}
                loading={loading}
            />
        </div>
    );
};

export default Homepage;
