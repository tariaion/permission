<<<<<<< HEAD
import React, { Children } from 'react';
=======
import React from 'react';
>>>>>>> 6ca9cf9 (Restored to '004672d3e0b522a6a98d03d9c0c3c11f40f1e980')
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute, useIsAdmin, useIsDepartmentLeader } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { Roles } from '@/pages/Roles';
import { Permissions } from '@/pages/Permissions';
import { Departments } from '@/pages/Departments';
import { Groups } from '@/pages/Groups';
import { NotFound } from '@/pages/NotFound';
import 'antd/dist/reset.css';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = () => (
  <Layout></Layout>
);

// 权限控制的路由组件
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPosition={['admin']}>
    {children}
  </ProtectedRoute>
);

const DepartmentLeaderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPosition={['admin', 'department_leader']}>
    {children}
  </ProtectedRoute>
);

const GroupLeaderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPosition={['admin', 'department_leader', 'group_leader']}>
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
                      
                      {/* 用户管理 - 需要组长及以上权限 */}
                      <Route
                        path="/users"
                        element={
                          <GroupLeaderRoute>
                            <Users />
                          </GroupLeaderRoute>
                        }
                      />
                      
                      {/* 角色管理 - 需要管理员权限 */}
                      <Route
                        path="/roles"
                        element={
                          <AdminRoute>
                            <Roles />
                          </AdminRoute>
                        }
                      />
                      
                      {/* 权限管理 - 需要管理员权限 */}
                      <Route
                        path="/permissions"
                        element={
                          <AdminRoute>
                            <Permissions />
                          </AdminRoute>
                        }
                      />
                      
                      {/* 部门管理 - 需要部门领导及以上权限 */}
                      <Route
                        path="/departments"
                        element={
                          <DepartmentLeaderRoute>
                            <Departments />
                          </DepartmentLeaderRoute>
                        }
                      />
                      
                      {/* 组管理 - 需要组长及以上权限 */}
                      <Route
                        path="/groups"
                        element={
                          <GroupLeaderRoute>
                            <Groups />
                          </GroupLeaderRoute>
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