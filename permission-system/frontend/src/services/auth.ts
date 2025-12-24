import { apiService } from './api';
import { LoginRequest, LoginResponse } from '@/types';

export class AuthService {
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      apiService.setToken(response.data.token);
      apiService.setUser(response.data.user);
    }
    
    return response.data!;
  }

  public async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.removeToken();
      apiService.removeUser();
    }
  }

  public async getCurrentUser(): Promise<any> {
    const response = await apiService.get('/auth/me');
    return response.data;
  }

  public async getUserPermissions(userId?: string): Promise<any> {
    const url = userId ? `/users/${userId}/permissions` : '/users/profile/permissions';
    const response = await apiService.get(url);
    return response.data;
  }

  public isAuthenticated(): boolean {
    return !!apiService.getToken();
  }

  public getCurrentUserFromStorage(): any {
    return apiService.getUser();
  }
}

export const authService = new AuthService();