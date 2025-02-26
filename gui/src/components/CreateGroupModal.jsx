import React, { useState } from "react";
import { Modal, Button, Form, Input, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

const CreateGroupModal = ({ isModalVisible, handleCancel, handleCreateGroup, loading }) => {
    const { t } = useTranslation();

    return (
        <Modal
            title={t('create_group')}
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
                    label={t('group_name')}
                    name="groupName"
                    rules={[
                        { required: true, message: t('please_input_group_name') },
                    ]}
                >
                    <Input textColor="black" placeholder={t('enter_group_name')} />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button onClick={handleCancel}>{t('cancel')}</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {t('create_group')}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateGroupModal;
