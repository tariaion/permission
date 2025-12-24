import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
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
  ApartmentOutlined,
} from '@ant-design/icons';
import { Layout } from '@/components';
import { departmentService } from '@/services';
import { Department } from '@/types';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setModalVisible(true);
    form.setFieldsValue(department);
  };

  const handleDelete = async (id: string) => {
    try {
      await departmentService.deleteDepartment(id);
      message.success('部门删除成功');
      fetchDepartments();
    } catch (error) {
      message.error('删除部门失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, values);
        message.success('部门更新成功');
      } else {
        await departmentService.createDepartment(values);
        message.success('部门创建成功');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      message.error(editingDepartment ? '更新部门失败' : '创建部门失败');
    }
  };

  const columns = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
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
      render: (_, record: Department) => (
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
            title="确定要删除这个部门吗？"
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
            <ApartmentOutlined />
            部门管理
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增部门
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Table
              columns={columns}
              dataSource={departments}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              size="small"
            />
          </Col>
        </Row>
      </Card>

      <Modal
        title={editingDepartment ? '编辑部门' : '新增部门'}
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
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              placeholder="请输入部门描述"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Departments;