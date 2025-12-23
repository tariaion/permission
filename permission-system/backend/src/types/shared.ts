export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: Date;
}

export interface AuthToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreatePermissionRequest {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}