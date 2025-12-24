import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { jobLevelService } from '@/services/job-level';
import { permissionService } from '@/services/permission';
import type { JobLevel, Permission } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

export const JobLevelsPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJobLevel, setEditingJobLevel] = useState<JobLevel | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadJobLevels();
    loadPermissions();
    loadStats();
  }, []);

  const loadJobLevels = async () => {
    setLoading(true);
    try {
      const response = await jobLevelService.getAllJobLevels({ active: true });
      if (response.success && response.data) {
        setJobLevels(response.data.sort((a, b) => a.level - b.level));
      }
    } catch (error) {
      message.error('加载职级列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await permissionService.getAllPermissions({ category: 'business' });
      if (response.success && response.data) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('加载权限列表失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await jobLevelService.getJobLevelStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleCreate = () => {
    setEditingJobLevel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (jobLevel: JobLevel) => {
    setEditingJobLevel(jobLevel);
    form.setFieldsValue(jobLevel);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await jobLevelService.deleteJobLevel(id);
      if (response.success) {
        message.success('删除成功');
        loadJobLevels();
        loadStats();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingJobLevel) {
        const response = await jobLevelService.updateJobLevel(editingJobLevel.id, values);
        if (response.success) {
          message.success('更新成功');
          setModalVisible(false);
          loadJobLevels();
        } else {
          message.error(response.message || '更新失败');
        }
      } else {
        const response = await jobLevelService.createJobLevel(values);
        if (response.success) {
          message.success('创建成功');
          setModalVisible(false);
          loadJobLevels();
          loadStats();
        } else {
          message.error(response.message || '创建失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      '#108ee9', '#52c41a', '#faad14', '#fa541c', '#722ed1', '#eb2f96', '#13c2c2'
    ];
    return colors[level - 1] || '#d9d9d9';
  };

  const columns = [
    {
      title: '职级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: JobLevel) => (
        <Space>
          <CrownOutlined style={{ color: getLevelColor(record.level) }} />
          <span>{text}</span>
          {!record.isActive && <Tag color="red">停用</Tag>}
        </Space>
      ),
    },
    {
      title: '职级代码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (text: number) => (
        <Tag color={getLevelColor(text)} style={{ fontWeight: 'bold' }}>
          Level {text}
        </Tag>
      ),
      sorter: (a: JobLevel, b: JobLevel) => a.level - b.level,
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => <Tag color="green">{permissions?.length || 0} 项</Tag>,
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
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (text: any, record: JobLevel) => (
        <Space>
          <PermissionGuard
            permissions="job_level:update"
            fallback={<Button size="small" disabled>编辑</Button>}
          >
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          
          <PermissionGuard
            permissions="job_level:delete"
            fallback={<Button size="small" danger disabled>删除</Button>}
          >
            <Popconfirm
              title="确定要删除这个职级吗？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计信息 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic title="总职级数" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="活跃职级" value={stats.active} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="停用职级" value={stats.inactive} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="级别范围" 
                value={`${stats.levelRange?.min || 0} - ${stats.levelRange?.max || 0}`} 
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <Space>
            <CrownOutlined />
            职级管理
          </Space>
        }
        extra={
          <Space>
            <PermissionGuard permissions="job_level:create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新增职级
              </Button>
            </PermissionGuard>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={loadJobLevels}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={jobLevels}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingJobLevel ? '编辑职级' : '新增职级'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="职级名称"
                rules={[{ required: true, message: '请输入职级名称' }]}
              >
                <Input placeholder="请输入职级名称" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="code"
                label="职级代码"
                rules={[
                  { required: true, message: '请输入职级代码' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '职级代码只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="例如: senior_engineer" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="level"
            label="职级级别"
            rules={[{ required: true, message: '请输入职级级别' }]}
          >
            <InputNumber
              placeholder="数字越大级别越高"
              min={1}
              max={99}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="内置权限"
          >
            <Select
              mode="multiple"
              placeholder="请选择此职级默认拥有的权限"
              allowClear
            >
              {permissions.map(permission => (
                <Option key={permission.id} value={permission.id}>
                  {permission.name} ({permission.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入职级描述' }]}
          >
            <TextArea rows={3} placeholder="请输入职级描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};