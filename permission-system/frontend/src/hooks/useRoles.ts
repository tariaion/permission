import { useState, useEffect } from 'react';
import { message } from 'antd';
import { roleService } from '@/services';
import { Role } from '@/types';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取角色列表失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: any) => {
    try {
      setLoading(true);
      const newRole = await roleService.createRole(roleData);
      setRoles(prev => [...prev, newRole]);
      message.success('角色创建成功');
      return newRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建角色失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, updates: any) => {
    try {
      setLoading(true);
      const updatedRole = await roleService.updateRole(id, updates);
      if (updatedRole) {
        setRoles(prev => prev.map(role => role.id === id ? updatedRole : role));
        message.success('角色更新成功');
      }
      return updatedRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新角色失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: string) => {
    try {
      setLoading(true);
      await roleService.deleteRole(id);
      setRoles(prev => prev.filter(role => role.id !== id));
      message.success('角色删除成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除角色失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};