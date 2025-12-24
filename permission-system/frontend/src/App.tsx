import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { Roles } from '@/pages/Roles';
import { Permissions } from '@/pages/Permissions';
import { JobLevels } from '@/pages/JobLevels';
import { Departments } from '@/pages/Departments';
import { Groups } from '@/pages/Groups';
import { NotFound } from '@/pages/NotFound';
import 'antd/dist/reset.css';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = () => (
  <Layout />
);

// 权限控制的路由组件
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['system:admin']}>
    {children}
  </ProtectedRoute>
);

const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['user:manage', 'department:manage', 'group:manage']}>
    {children}
  </ProtectedRoute>
);

const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['user:read']}>
    {children}
  </ProtectedRoute>
);

const PermissionSystemApp: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* 用户管理 - 需要用户读取权限 */}
                      <Route
                        path="/users"
                        element={
                          <UserManagementRoute>
                            <Users />
                          </UserManagementRoute>
                        }
                      />
                      
                      {/* 角色管理 - 需要角色管理权限 */}
                      <Route
                        path="/roles"
                        element={
                          <ProtectedRoute requiredPermissions={['role:read']}>
                            <Roles />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* 权限管理 - 需要权限读取权限 */}
                      <Route
                        path="/permissions"
                        element={
                          <ProtectedRoute requiredPermissions={['permission:read']}>
                            <Permissions />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* 职级管理 - 需要职级读取权限 */}
                      <Route
                        path="/job-levels"
                        element={
                          <ProtectedRoute requiredPermissions={['job_level:read']}>
                            <JobLevels />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* 部门管理 - 需要部门读取权限 */}
                      <Route
                        path="/departments"
                        element={
                          <ProtectedRoute requiredPermissions={['department:read']}>
                            <Departments />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* 组管理 - 需要组读取权限 */}
                      <Route
                        path="/groups"
                        element={
                          <ProtectedRoute requiredPermissions={['group:read']}>
                            <Groups />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default PermissionSystemApp;