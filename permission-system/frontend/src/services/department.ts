import { api } from './api';
import { ApiResponse, Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types';

export const departmentService = {
  // 获取所有部门
  async getAllDepartments(): Promise<ApiResponse<Department[]>> {
    return api.get('/departments');
  },

  // 根据ID获取部门
  async getDepartmentById(id: string): Promise<ApiResponse<Department>> {
    return api.get(`/departments/${id}`);
  },

  // 创建部门
  async createDepartment(data: CreateDepartmentRequest): Promise<ApiResponse<Department>> {
    return api.post('/departments', data);
  },

  // 更新部门
  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<ApiResponse<Department>> {
    return api.put(`/departments/${id}`, data);
  },

  // 删除部门
  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/departments/${id}`);
  },
};