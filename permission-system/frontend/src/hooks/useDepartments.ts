import { useState, useEffect } from 'react';
import { departmentService } from '@/services';
import { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      } else {
        setError(response.error || '获取部门列表失败');
      }
    } catch (err) {
      setError('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (data: CreateDepartmentRequest) => {
    try {
      setLoading(true);
      const response = await departmentService.createDepartment(data);
      if (response.success) {
        await fetchDepartments();
        return response.data;
      } else {
        throw new Error(response.error || '创建部门失败');
      }
    } catch (err) {
      setError('创建部门失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id: string, data: UpdateDepartmentRequest) => {
    try {
      setLoading(true);
      const response = await departmentService.updateDepartment(id, data);
      if (response.success) {
        await fetchDepartments();
        return response.data;
      } else {
        throw new Error(response.error || '更新部门失败');
      }
    } catch (err) {
      setError('更新部门失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      setLoading(true);
      const response = await departmentService.deleteDepartment(id);
      if (response.success) {
        await fetchDepartments();
      } else {
        throw new Error(response.error || '删除部门失败');
      }
    } catch (err) {
      setError('删除部门失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};