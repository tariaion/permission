import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, SafetyOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useRoles, usePermissions } from '@/hooks';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { users } = useUsers();
  const { roles } = useRoles();
  const { permissions } = usePermissions();

  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        欢迎回来，{user?.username}！
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={users.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="角色数量"
              value={roles.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="权限数量"
              value={permissions.length}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="系统状态">
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: 12 }}>
                <span>API服务：</span>
                <span style={{ color: '#52c41a', marginLeft: 8 }}>正常运行</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span>数据库：</span>
                <span style={{ color: '#52c41a', marginLeft: 8 }}>JSON文件存储</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span>当前环境：</span>
                <span style={{ color: '#1890ff', marginLeft: 8 }}>开发环境</span>
              </div>
              <div>
                <span>用户角色：</span>
                <span style={{ color: '#722ed1', marginLeft: 8 }}>
                  {user?.roles.length ? user.roles.join(', ') : '无角色'}
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="快速操作">
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: 12 }}>
                <span>✅ 用户管理：</span>
                <span style={{ color: '#52c41a', marginLeft: 8 }}>
                  {users.length} 个用户
                </span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span>✅ 角色管理：</span>
                <span style={{ color: '#52c41a', marginLeft: 8 }}>
                  {roles.length} 个角色
                </span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span>✅ 权限管理：</span>
                <span style={{ color: '#52c41a', marginLeft: 8 }}>
                  {permissions.length} 个权限
                </span>
              </div>
              <div>
                <span>✅ 系统安全：</span>
                <span style={{ color: '#52c41a', marginLeft: 8 }}>JWT认证</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};