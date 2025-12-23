import { useState, useEffect } from 'react';
import { message } from 'antd';
import { userService } from '@/services';
import { User } from '@/types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户列表失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    try {
      setLoading(true);
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      message.success('用户创建成功');
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建用户失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: any) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(id, updates);
      if (updatedUser) {
        setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
        message.success('用户更新成功');
      }
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      message.success('用户删除成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除用户失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (id: string, oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await userService.changePassword(id, oldPassword, newPassword);
      message.success('密码修改成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '密码修改失败';
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
  };
};