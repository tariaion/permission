import { apiService } from './api';
import { ApiResponse, CreateUserRequest, UpdateUserRequest, User } from '@/types';

export class UserService {
  public async getAllUsers(): Promise<User[]> {
    const response = await apiService.get<User[]>('/auth/users');
    return response.data || [];
  }

  public async getUserById(id: string): Promise<User | null> {
    const response = await apiService.get<User>(`/auth/users/${id}`);
    return response.data || null;
  }

  public async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiService.post<User>('/auth/users', userData);
    return response.data!;
  }

  public async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const response = await apiService.put<User>(`/auth/users/${id}`, updates);
    return response.data || null;
  }

  public async deleteUser(id: string): Promise<boolean> {
    const response = await apiService.delete(`/auth/users/${id}`);
    return response.success;
  }

  public async changePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const response = await apiService.post(`/auth/users/${id}/change-password`, {
      oldPassword,
      newPassword,
    });
    return response.success;
  }
}

export const userService = new UserService();