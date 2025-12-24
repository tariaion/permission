import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionCheckResult } from '../types';

export const usePermissions = () => {
  const { user, token, refreshUserPermissions } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * 检查用户是否有指定权限
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user?.effectivePermissions) return false;
    return user.effectivePermissions.includes(permission);
  }, [user?.effectivePermissions]);

  /**
   * 检查用户是否有任一权限
   */
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user?.effectivePermissions) return false;
    return permissions.some(permission => user.effectivePermissions!.includes(permission));
  }, [user?.effectivePermissions]);

  /**
   * 检查用户是否有所有权限
   */
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user?.effectivePermissions) return false;
    return permissions.every(permission => user.effectivePermissions!.includes(permission));
  }, [user?.effectivePermissions]);

  /**
   * 检查用户是否可以访问特定资源
   */
  const canAccessResource = useCallback((
    resource: string, 
    action: string = 'read'
  ): PermissionCheckResult => {
    const permission = `${resource}:${action}`;
    const hasResourcePermission = hasPermission(permission);
    const hasManagePermission = hasPermission(`${resource}:manage`);
    const hasAdminPermission = hasPermission('system:admin');

    let permissions: string[] = [];
    if (user?.effectivePermissions) {
      permissions = user.effectivePermissions;
    }

    if (hasAdminPermission) {
      return {
        hasPermission: true,
        permissions,
        reason: 'System administrator'
      };
    }

    if (hasManagePermission) {
      return {
        hasPermission: true,
        permissions,
        reason: 'Resource manager'
      };
    }

    if (hasResourcePermission) {
      return {
        hasPermission: true,
        permissions,
        reason: 'Direct permission'
      };
    }

    return {
      hasPermission: false,
      permissions,
      reason: `Missing permission: ${permission}`
    };
  }, [hasPermission, user?.effectivePermissions]);

  /**
   * 检查用户是否可以访问自己的资源
   */
  const canAccessSelf = useCallback((
    resource: string, 
    action: string = 'read',
    targetUserId?: string
  ): boolean => {
    if (targetUserId === user?.id) {
      const selfPermission = `${resource}:${action}_self`;
      return hasPermission(selfPermission) || hasPermission(`${resource}:*`);
    }
    return false;
  }, [user?.id, hasPermission]);

  /**
   * 检查用户是否可以访问特定部门
   */
  const canAccessDepartment = useCallback((departmentId: string): boolean => {
    if (hasPermission('system:admin') || hasPermission('department:manage_all')) {
      return true;
    }
    return user?.departmentId === departmentId;
  }, [hasPermission, user?.departmentId]);

  /**
   * 检查用户是否可以访问特定组
   */
  const canAccessGroup = useCallback((groupId: string): boolean => {
    if (hasPermission('system:admin') || hasPermission('group:manage_all')) {
      return true;
    }
    return user?.groupId === groupId;
  }, [hasPermission, user?.groupId]);

  /**
   * 刷新用户权限信息
   */
  const refreshPermissions = useCallback(async () => {
    if (!token || !refreshUserPermissions) return;
    
    setLoading(true);
    try {
      await refreshUserPermissions();
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [token, refreshUserPermissions]);

  /**
   * 获取用户在特定作用域的权限
   */
  const getScopedPermissions = useCallback((scope: 'global' | 'department' | 'group'): string[] => {
    if (!user?.effectivePermissions) return [];
    
    // 简化实现，实际可以根据权限的作用域进行过滤
    return user.effectivePermissions.filter(perm => {
      if (scope === 'global') {
        return perm.startsWith('system:') || perm.includes('_all');
      } else if (scope === 'department') {
        return perm.startsWith('department:') || perm.startsWith('user:') || perm.startsWith('group:');
      } else if (scope === 'group') {
        return perm.startsWith('group:') || perm.startsWith('user:');
      }
      return false;
    });
  }, [user?.effectivePermissions]);

  /**
   * 检查路由权限
   */
  const canAccessRoute = useCallback((requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return hasAnyPermission(requiredPermissions);
  }, [hasAnyPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    canAccessSelf,
    canAccessDepartment,
    canAccessGroup,
    refreshPermissions,
    getScopedPermissions,
    canAccessRoute,
    loading,
    permissions: user?.effectivePermissions || [],
    isAdmin: hasPermission('system:admin'),
    isManager: hasAnyPermission(['department:manage', 'group:manage', 'user:manage']),
  };
};