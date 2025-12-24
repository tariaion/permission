import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BlockOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { Layout } from '@/components';
import { groupService, departmentService } from '@/services';
import { Group, Department } from '@/types';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGroups();
    fetchDepartments();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAllGroups();
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      message.error('获取组列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      message.error('获取部门列表失败');
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setModalVisible(true);
    form.setFieldsValue(group);
  };

  const handleDelete = async (id: string) => {
    try {
      await groupService.deleteGroup(id);
      message.success('组删除成功');
      fetchGroups();
    } catch (error) {
      message.error('删除组失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingGroup) {
        await groupService.updateGroup(editingGroup.id, values);
        message.success('组更新成功');
      } else {
        await groupService.createGroup(values);
        message.success('组创建成功');
      }
      setModalVisible(false);
      fetchGroups();
    } catch (error) {
      message.error(editingGroup ? '更新组失败' : '创建组失败');
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || departmentId;
  };

  const columns = [
    {
      title: '组名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '所属部门',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (departmentId: string) => (
        <Tag icon={<ApartmentOutlined />} color="blue">
          {getDepartmentName(departmentId)}
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
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
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
      render: (_, record: Group) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个组吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Card
        title={
          <Space>
            <BlockOutlined />
            组管理
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增组
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Table
              columns={columns}
              dataSource={groups}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              size="small"
            />
          </Col>
        </Row>
      </Card>

      <Modal
        title={editingGroup ? '编辑组' : '新增组'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="组名称"
            rules={[{ required: true, message: '请输入组名称' }]}
          >
            <Input placeholder="请输入组名称" />
          </Form.Item>
          <Form.Item
            name="departmentId"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select placeholder="请选择所属部门">
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              placeholder="请输入组描述"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Groups;