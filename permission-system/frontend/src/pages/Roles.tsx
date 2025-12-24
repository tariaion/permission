import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useRoles } from '@/hooks';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

const { Option } = Select;

export const Roles: React.FC = () => {
  const { roles, loading, createRole, updateRole, deleteRole } = useRoles();
  const { permissions } = usePermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values as UpdateRoleRequest);
      } else {
        await createRole(values as CreateRoleRequest);
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id);
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
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissionIds: string[]) => permissionIds.length,
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions_list',
      render: (permissionIds: string[]) => (
        <Space wrap>
          {permissionIds.slice(0, 3).map((permissionId, index) => {
            const permission = permissions.find(p => p.id === permissionId);
            return (
              <Tag key={index} color="blue" style={{ fontSize: '12px' }}>
                {permission?.name || permissionId}
              </Tag>
            );
          })}
          {permissionIds.length > 3 && (
            <Tag color="default" style={{ fontSize: '12px' }}>
              +{permissionIds.length - 3} 更多
            </Tag>
          )}
        </Space>
      ),
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
      render: (_: any, record: Role) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
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

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>角色管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加角色
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
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
            label="角色名称"
            name="name"
            rules={[
              { required: true, message: '请输入角色名称' },
              { min: 2, message: '角色名称至少2个字符' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[
              { required: true, message: '请输入角色描述' },
              { max: 200, message: '描述不能超过200个字符' },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="权限"
            name="permissions"
          >
            <Select
              mode="multiple"
              placeholder="选择权限"
              optionLabelProp="label"
            >
              {permissions.map(permission => (
                <Option
                  key={permission.id}
                  value={permission.id}
                  label={`${permission.name} (${permission.resource}:${permission.action})`}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{permission.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {permission.resource}:{permission.action}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {permission.description}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRole ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};