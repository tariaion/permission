import { apiService } from './api';
import { ApiResponse, Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@/types';

export class PermissionService {
  public async getAllPermissions(params?: {
    category?: string;
    resource?: string;
    search?: string;
  }): Promise<ApiResponse<Permission[]>> {
    return apiService.get('/permissions', { params });
  }

  public async getPermission(id: string): Promise<ApiResponse<Permission>> {
    return apiService.get(`/permissions/${id}`);
  }

  public async createPermission(data: CreatePermissionRequest): Promise<ApiResponse<Permission>> {
    return apiService.post('/permissions', data);
  }

  public async updatePermission(id: string, data: UpdatePermissionRequest): Promise<ApiResponse<Permission>> {
    return apiService.put(`/permissions/${id}`, data);
  }

  public async deletePermission(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/permissions/${id}`);
  }

  public async getPermissionStats(): Promise<ApiResponse<any>> {
    return apiService.get('/permissions/stats/overview');
  }

  public async initializeSystemPermissions(): Promise<ApiResponse<void>> {
    return apiService.post('/permissions/initialize');
  }
}

export const permissionService = new PermissionService();