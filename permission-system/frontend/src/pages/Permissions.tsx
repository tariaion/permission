import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { usePermissions } from '@/hooks';
import { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@/types';

export const Permissions: React.FC = () => {
  const { permissions, loading, createPermission, updatePermission, deletePermission } = usePermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingPermission(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    form.setFieldsValue({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, values as UpdatePermissionRequest);
      } else {
        await createPermission(values as CreatePermissionRequest);
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePermission(id);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => (
        <Tag color="blue">{resource}</Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color="green">{action}</Tag>
      ),
    },
    {
      title: '权限标识',
      key: 'identifier',
      render: (_, record: Permission) => (
        <Tag color="purple">
          {record.resource}:{record.action}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Permission) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const defaultActions = ['create', 'read', 'update', 'delete'];
  const defaultResources = ['users', 'roles', 'permissions'];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>权限管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加权限
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={permissions}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={editingPermission ? '编辑权限' : '添加权限'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="权限名称"
            name="name"
            rules={[
              { required: true, message: '请输入权限名称' },
              { min: 2, message: '权限名称至少2个字符' },
            ]}
          >
            <Input placeholder="例如：查看用户" />
          </Form.Item>

          <Form.Item
            label="资源"
            name="resource"
            rules={[
              { required: true, message: '请输入资源名称' },
              { min: 2, message: '资源名称至少2个字符' },
            ]}
          >
            <Input placeholder="例如：users, roles, permissions" />
          </Form.Item>

          <Form.Item
            label="操作"
            name="action"
            rules={[
              { required: true, message: '请输入操作类型' },
              { min: 2, message: '操作类型至少2个字符' },
            ]}
          >
            <Input placeholder="例如：create, read, update, delete" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[
              { required: true, message: '请输入权限描述' },
              { max: 200, message: '描述不能超过200个字符' },
            ]}
          >
            <Input.TextArea rows={3} placeholder="详细描述这个权限的作用" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPermission ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>常用权限模板：</div>
          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
            <div>资源：users, roles, permissions</div>
            <div>操作：create, read, update, delete</div>
            <div>示例：用户管理 - users:read, users:create, users:update, users:delete</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};