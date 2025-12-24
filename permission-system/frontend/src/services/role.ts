import { apiService } from './api';
import { ApiResponse, CreateRoleRequest, UpdateRoleRequest, Role } from '@/types';

export class RoleService {
  public async getAllRoles(): Promise<Role[]> {
    const response = await apiService.get<Role[]>('/roles');
    return response.data || [];
  }

  public async getRoleById(id: string): Promise<Role | null> {
    const response = await apiService.get<Role>(`/roles/${id}`);
    return response.data || null;
  }

  public async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await apiService.post<Role>('/roles', roleData);
    return response.data!;
  }

  public async updateRole(id: string, updates: UpdateRoleRequest): Promise<Role | null> {
    const response = await apiService.put<Role>(`/roles/${id}`, updates);
    return response.data || null;
  }

  public async deleteRole(id: string): Promise<boolean> {
    const response = await apiService.delete(`/roles/${id}`);
    return response.success;
  }

  public async getRolePermissions(id: string): Promise<any[]> {
    const response = await apiService.get<any[]>(`/roles/${id}/permissions`);
    return response.data || [];
  }
}

export const roleService = new RoleService();