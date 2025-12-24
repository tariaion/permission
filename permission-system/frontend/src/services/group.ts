import { api } from './api';
import { ApiResponse, Group, CreateGroupRequest, UpdateGroupRequest } from '@/types';

export const groupService = {
  // 获取所有组
  async getAllGroups(): Promise<ApiResponse<Group[]>> {
    return api.get('/groups');
  },

  // 根据ID获取组
  async getGroupById(id: string): Promise<ApiResponse<Group>> {
    return api.get(`/groups/${id}`);
  },

  // 创建组
  async createGroup(data: CreateGroupRequest): Promise<ApiResponse<Group>> {
    return api.post('/groups', data);
  },

  // 更新组
  async updateGroup(id: string, data: UpdateGroupRequest): Promise<ApiResponse<Group>> {
    return api.put(`/groups/${id}`, data);
  },

  // 删除组
  async deleteGroup(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/groups/${id}`);
  },

  // 获取指定部门的组
  async getGroupsByDepartment(departmentId: string): Promise<ApiResponse<Group[]>> {
    return api.get(`/groups/department/${departmentId}`);
  },
};