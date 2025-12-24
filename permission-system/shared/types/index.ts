export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  groupId?: string;
  position?: 'member' | 'group_leader' | 'department_leader' | 'admin';
  departmentId?: string;
  leaderId?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  leaderId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  leaderId?: string;
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
  scope?: 'global' | 'department' | 'group';
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: Date;
  scope?: 'global' | 'department' | 'group';
}

export interface AuthToken {
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
  groupId?: string;
  position?: 'member' | 'group_leader' | 'department_leader' | 'admin';
  departmentId?: string;
  leaderId?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
  groupId?: string;
  position?: 'member' | 'group_leader' | 'department_leader' | 'admin';
  departmentId?: string;
  leaderId?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions?: string[];
  scope?: 'global' | 'department' | 'group';
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  scope?: 'global' | 'department' | 'group';
}

export interface CreatePermissionRequest {
  name: string;
  resource: string;
  action: string;
  description: string;
  scope?: 'global' | 'department' | 'group';
}

export interface UpdatePermissionRequest {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
  scope?: 'global' | 'department' | 'group';
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  departmentId: string;
  leaderId?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
  leaderId?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
}

// 权限检查相关类型
export interface PermissionCheckContext {
  user: User;
  targetUserId?: string;
  targetGroupId?: string;
  targetDepartmentId?: string;
  action: string;
  resource: string;
}