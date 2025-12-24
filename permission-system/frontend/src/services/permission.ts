import { apiService } from './api';
import { CreatePermissionRequest, UpdatePermissionRequest, Permission } from '@/types';

export class PermissionService {
  public async getAllPermissions(): Promise<Permission[]> {
    const response = await apiService.get<Permission[]>('/permissions');
    return response.data || [];
  }

  public async getPermissionById(id: string): Promise<Permission | null> {
    const response = await apiService.get<Permission>(`/permissions/${id}`);
    return response.data || null;
  }

  public async createPermission(permissionData: CreatePermissionRequest): Promise<Permission> {
    const response = await apiService.post<Permission>('/permissions', permissionData);
    return response.data!;
  }

  public async updatePermission(id: string, updates: UpdatePermissionRequest): Promise<Permission | null> {
    const response = await apiService.put<Permission>(`/permissions/${id}`, updates);
    return response.data || null;
  }

  public async deletePermission(id: string): Promise<boolean> {
    const response = await apiService.delete(`/permissions/${id}`);
    return response.success;
  }

  public async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const response = await apiService.get<Permission[]>(`/permissions/resource/${resource}`);
    return response.data || [];
  }
}

export const permissionService = new PermissionService();