import { useState, useEffect } from 'react';
import { groupService } from '@/services';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '@/types';

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getAllGroups();
      if (response.success) {
        setGroups(response.data || []);
      } else {
        setError(response.error || '获取组列表失败');
      }
    } catch (err) {
      setError('获取组列表失败');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (data: CreateGroupRequest) => {
    try {
      setLoading(true);
      const response = await groupService.createGroup(data);
      if (response.success) {
        await fetchGroups();
        return response.data;
      } else {
        throw new Error(response.error || '创建组失败');
      }
    } catch (err) {
      setError('创建组失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (id: string, data: UpdateGroupRequest) => {
    try {
      setLoading(true);
      const response = await groupService.updateGroup(id, data);
      if (response.success) {
        await fetchGroups();
        return response.data;
      } else {
        throw new Error(response.error || '更新组失败');
      }
    } catch (err) {
      setError('更新组失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      setLoading(true);
      const response = await groupService.deleteGroup(id);
      if (response.success) {
        await fetchGroups();
      } else {
        throw new Error(response.error || '删除组失败');
      }
    } catch (err) {
      setError('删除组失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGroupsByDepartment = async (departmentId: string) => {
    try {
      setLoading(true);
      const response = await groupService.getGroupsByDepartment(departmentId);
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.error || '获取部门组失败');
      }
    } catch (err) {
      setError('获取部门组失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupsByDepartment,
  };
};