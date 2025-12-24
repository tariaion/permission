import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { Layout } from '@/components';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useDepartments } from '@/hooks/useDepartments';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';
import { User, CreateUserRequest, UpdateUserRequest, Position } from '@/types';

const { Option } = Select;

const positionOptions = [
  { value: 'member', label: '普通成员', icon: <UserOutlined /> },
  { value: 'group_leader', label: '组长', icon: <TeamOutlined /> },
  { value: 'department_leader', label: '部门领导', icon: <ApartmentOutlined /> },
  { value: 'admin', label: '管理员', icon: <CrownOutlined /> },
];

const getPositionColor = (position?: Position): string => {
  switch (position) {
    case 'admin': return 'red';
    case 'department_leader': return 'orange';
    case 'group_leader': return 'blue';
    default: return 'green';
  }
};

const getPositionName = (position?: Position): string => {
  const option = positionOptions.find(opt => opt.value === position);
  return option?.label || '未知';
};

export const Users: React.FC = () => {
  const { users, loading, createUser, updateUser, deleteUser, refetch } = useUsers();
  const { roles } = useRoles();
  const { departments } = useDepartments();
  const { groups } = useGroups();
  const { user: currentUser } = useAuth();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAdd = () => {
    setEditingUser(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      roles: user.roles,
      position: user.position,
      departmentId: user.departmentId,
      groupId: user.groupId,
      isActive: user.isActive,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values as UpdateUserRequest);
        message.success('用户更新成功');
      } else {
        await createUser(values as CreateUserRequest);
        message.success('用户创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(editingUser ? '更新用户失败' : '创建用户失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('用户删除成功');
      refetch();
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const canEditUser = (user: User): boolean => {
    if (!currentUser) return false;
    
    // 管理员可以编辑所有用户
    if (currentUser.position === 'admin') return true;
    
    // 用户可以编辑自己的信息
    if (currentUser.id === user.id) return true;
    
    // 部门领导可以编辑本部门用户
    if (currentUser.position === 'department_leader' && 
        currentUser.departmentId === user.departmentId) return true;
    
    // 组长可以编辑本组成员
    if (currentUser.position === 'group_leader' && 
        currentUser.groupId === user.groupId) return true;
    
    return false;
  };

  const canDeleteUser = (user: User): boolean => {
    if (!currentUser) return false;
    
    // 不能删除自己
    if (currentUser.id === user.id) return false;
    
    // 管理员可以删除所有用户
    if (currentUser.position === 'admin') return true;
    
    // 部门领导可以删除本部门用户（除管理员）
    if (currentUser.position === 'department_leader' && 
        currentUser.departmentId === user.departmentId &&
        user.position !== 'admin') return true;
    
    // 组长可以删除本组成员（除管理员和部门领导）
    if (currentUser.position === 'group_leader' && 
        currentUser.groupId === user.groupId &&
        !['admin', 'department_leader'].includes(user.position || 'member')) return true;
    
    return false;
  };

  const getDepartmentName = (departmentId?: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || '未分配';
  };

  const getGroupName = (groupId?: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || '未分配';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      responsive: ['md'],
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: User) => (
        <Space>
          <strong>{text}</strong>
          {record.id === currentUser?.id && <Tag color="gold">我</Tag>}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      render: (position: Position) => {
        const option = positionOptions.find(opt => opt.value === position);
        return (
          <Tag color={getPositionColor(position)} icon={option?.icon}>
            {getPositionName(position)}
          </Tag>
        );
      },
    },
    {
      title: '部门',
      dataIndex: 'departmentId',
      key: 'departmentId',
      responsive: ['md'],
      render: (departmentId: string) => (
        <Tag color="cyan">
          <ApartmentOutlined />
          {getDepartmentName(departmentId)}
        </Tag>
      ),
    },
    {
      title: '组',
      dataIndex: 'groupId',
      key: 'groupId',
      responsive: ['lg'],
      render: (groupId: string) => (
        <Tag color="blue">
          <TeamOutlined />
          {getGroupName(groupId)}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      responsive: ['xl'],
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map((roleId, index) => (
            <Tag key={index} color="purple">
              {roles.find(r => r.id === roleId)?.name || roleId}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['xl'],
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space size="small">
          {canEditUser(record) && (
            <Tooltip title="编辑用户">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {canDeleteUser(record) && (
            <Tooltip title="删除用户">
              <Popconfirm
                title="确定要删除这个用户吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Card
        title={
          <Space>
            <UserOutlined />
            用户管理
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refetch}
              loading={loading}
            >
              刷新
            </Button>
            {(currentUser?.position === 'admin' || 
              currentUser?.position === 'department_leader' || 
              currentUser?.position === 'group_leader') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加用户
              </Button>
            )}
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              size="small"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Col>
        </Row>
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            label="职位"
            name="position"
            rules={[{ required: true, message: '请选择职位' }]}
          >
            <Select placeholder="请选择职位">
              {positionOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    {option.icon}
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="部门"
            name="departmentId"
          >
            <Select 
              placeholder="请选择部门" 
              allowClear
              onChange={() => form.setFieldsValue({ groupId: undefined })}
            >
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="组"
            name="groupId"
          >
            <Select placeholder="请选择组" allowClear>
              {groups
                .filter(group => 
                  !form.getFieldValue('departmentId') || 
                  group.departmentId === form.getFieldValue('departmentId')
                )
                .map(group => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="角色"
            name="roles"
          >
            <Select mode="multiple" placeholder="请选择角色">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              label="状态"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="活跃" unCheckedChildren="禁用" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};