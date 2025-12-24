import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  theme,
  Drawer,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  LogoutOutlined,
  SettingOutlined,
  ApartmentOutlined,
  BlockOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useRoutePermissions } from '@/components/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 路由配置，包含权限要求
  const routes = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
      requiredPermissions: [] as string[],
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
      requiredPermissions: ['user:read'],
    },
    {
      key: '/roles',
      icon: <TeamOutlined />,
      label: '角色管理',
      requiredPermissions: ['role:read'],
    },
    {
      key: '/permissions',
      icon: <SafetyOutlined />,
      label: '权限管理',
      requiredPermissions: ['permission:read'],
    },
    {
      key: '/job-levels',
      icon: <CrownOutlined />,
      label: '职级管理',
      requiredPermissions: ['job_level:read'],
    },
    {
      key: '/departments',
      icon: <ApartmentOutlined />,
      label: '部门管理',
      requiredPermissions: ['department:read'],
    },
    {
      key: '/groups',
      icon: <BlockOutlined />,
      label: '组管理',
      requiredPermissions: ['group:read'],
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 根据权限过滤菜单项
  const getMenuItems = () => {
    return routes.filter(route => {
      if (route.requiredPermissions.length === 0) return true;
      return route.requiredPermissions.some(permission => hasPermission(permission));
    });
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuVisible(false);
    }
  };

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await logout();
      navigate('/login');
    }
  };

  const siderContent = (
    <>
      <div style={{
        height: 32,
        margin: 16,
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        {collapsed ? 'PS' : '权限系统'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed}>
          {siderContent}
        </Sider>
      )}
      
      <AntLayout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            )}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            )}
          </div>
          <div style={{ paddingRight: isMobile ? 16 : 24 }}>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  size={isMobile ? 'small' : 'default'}
                />
                {!isMobile && <span>{user?.username}</span>}
              </Space>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: isMobile ? '12px 8px' : '24px 16px',
            padding: isMobile ? 12 : 24,
            minHeight: 280,
            background: colorBgContainer,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        bodyStyle={{ padding: 0 }}
        width={250}
      >
        {siderContent}
      </Drawer>
    </AntLayout>
  );
};