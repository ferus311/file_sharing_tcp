import React, { useState } from "react";
import { Modal, Button, Form, Input, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const CreateGroupModal = ({ isModalVisible, handleCancel, handleCreateGroup, loading }) => {

    return (
        <Modal
            title="Create a New Group"
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
        >
            <Form
                layout="vertical"
                onFinish={handleCreateGroup}
                name="create-group-form"
            >
                <Form.Item
                    label="Group Name"
                    name="groupName"
                    rules={[
                        { required: true, message: "Please input the group name!" },
                    ]}
                >
                    <Input textColor="black" placeholder="Enter group name" />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Create Group
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateGroupModal;
