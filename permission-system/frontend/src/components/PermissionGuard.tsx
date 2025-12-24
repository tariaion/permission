import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string | string[];
  requireAll?: boolean; // 是否需要所有权限，默认false（只需要任一权限）
  fallback?: React.ReactNode;
  resource?: string;
  action?: string;
  userId?: string; // 用于检查自己资源的权限
  departmentId?: string;
  groupId?: string;
}

/**
 * 权限守卫组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  resource,
  action = 'read',
  userId,
  departmentId,
  groupId
}) => {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessSelf,
    canAccessDepartment,
    canAccessGroup,
    canAccessResource
  } = usePermissions();

  // 检查权限逻辑
  const checkPermission = (): boolean => {
    // 1. 检查直接权限
    if (permissions) {
      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
      if (requireAll) {
        return hasAllPermissions(permissionArray);
      } else {
        return hasAnyPermission(permissionArray);
      }
    }

    // 2. 检查资源权限
    if (resource) {
      // 检查是否为访问自己的资源
      if (userId && canAccessSelf(resource, action, userId)) {
        return true;
      }

      // 检查部门权限
      if (departmentId && !canAccessDepartment(departmentId)) {
        return false;
      }

      // 检查组权限
      if (groupId && !canAccessGroup(groupId)) {
        return false;
      }

      const resourceCheck = canAccessResource(resource, action);
      return resourceCheck.hasPermission;
    }

    // 如果没有指定权限要求，默认允许访问
    return true;
  };

  const hasRequiredPermission = checkPermission();

  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * 管理员权限守卫
 */
export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * 管理者权限守卫
 */
export const ManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isManager } = usePermissions();

  if (!isManager) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * 自己资源权限守卫
 */
export const SelfResourceGuard: React.FC<{
  children: React.ReactNode;
  resource: string;
  action?: string;
  targetUserId?: string;
  fallback?: React.ReactNode;
}> = ({
  children,
  resource,
  action = 'read',
  targetUserId,
  fallback = null
}) => {
  const { canAccessSelf, hasPermission } = usePermissions();

  // 如果是管理员或具有管理权限，直接允许
  if (hasPermission('system:admin') || hasPermission(`${resource}:manage`)) {
    return <>{children}</>;
  }

  // 检查是否为访问自己的资源
  if (targetUserId && canAccessSelf(resource, action, targetUserId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * 部门权限守卫
 */
export const DepartmentGuard: React.FC<{
  children: React.ReactNode;
  departmentId?: string;
  fallback?: React.ReactNode;
}> = ({
  children,
  departmentId,
  fallback = null
}) => {
  const { canAccessDepartment, hasPermission } = usePermissions();

  // 管理员可以访问所有部门
  if (hasPermission('system:admin') || hasPermission('department:manage_all')) {
    return <>{children}</>;
  }

  // 检查部门访问权限
  if (departmentId && canAccessDepartment(departmentId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * 组权限守卫
 */
export const GroupGuard: React.FC<{
  children: React.ReactNode;
  groupId?: string;
  fallback?: React.ReactNode;
}> = ({
  children,
  groupId,
  fallback = null
}) => {
  const { canAccessGroup, hasPermission } = usePermissions();

  // 管理员可以访问所有组
  if (hasPermission('system:admin') || hasPermission('group:manage_all')) {
    return <>{children}</>;
  }

  // 检查组访问权限
  if (groupId && canAccessGroup(groupId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;