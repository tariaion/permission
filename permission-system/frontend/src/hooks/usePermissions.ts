import { useState, useEffect } from 'react';
import { message } from 'antd';
import { permissionService } from '@/services';
import { Permission } from '@/types';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取权限列表失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async (permissionData: any) => {
    try {
      setLoading(true);
      const newPermission = await permissionService.createPermission(permissionData);
      setPermissions(prev => [...prev, newPermission]);
      message.success('权限创建成功');
      return newPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建权限失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (id: string, updates: any) => {
    try {
      setLoading(true);
      const updatedPermission = await permissionService.updatePermission(id, updates);
      if (updatedPermission) {
        setPermissions(prev => prev.map(permission => permission.id === id ? updatedPermission : permission));
        message.success('权限更新成功');
      }
      return updatedPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新权限失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (id: string) => {
    try {
      setLoading(true);
      await permissionService.deletePermission(id);
      setPermissions(prev => prev.filter(permission => permission.id !== id));
      message.success('权限删除成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除权限失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
  };
};