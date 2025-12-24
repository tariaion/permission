export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[]; // 角色ID列表
  jobLevelId?: string; // 职级ID
  departmentId?: string;
  groupId?: string;
  leaderId?: string;
  directPermissions: string[]; // 直接分配的权限ID（绕过角色的特殊权限）
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  leaderId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string; // 支持多级部门
  leaderId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  code: string; // 唯一角色代码
  description: string;
  permissions: string[]; // 权限ID列表
  jobLevels: string[]; // 可分配的职级ID列表
  scope: 'global' | 'department' | 'group'; // 作用域
  isActive: boolean;
  isSystem: boolean; // 是否为系统角色
  createdAt: Date;
  updatedAt: Date;
}

// 职级系统
export interface JobLevel {
  id: string;
  name: string;
  code: string;
  level: number; // 数字越大级别越高
  description: string;
  permissions: string[]; // 职级自带的权限
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 权限系统 - 更细粒度
export interface Permission {
  id: string;
  name: string;
  code: string; // 唯一权限代码，如 'user:create', 'user:read', 'user:update', 'user:delete'
  resource: string; // 资源类型，如 'user', 'role', 'permission', 'department', 'group'
  action: string; // 操作类型，如 'create', 'read', 'update', 'delete', 'manage', 'approve'
  description: string;
  category: 'system' | 'business' | 'data'; // 权限分类
  isSystem: boolean; // 是否为系统权限，不可删除
  isActive?: boolean; // 是否激活
  createdAt: Date;
  updatedAt: Date;
}

// 扩展的角色系统
export interface Role {
  id: string;
  name: string;
  code: string; // 唯一角色代码
  description: string;
  permissions: string[]; // 权限ID列表
  jobLevels: string[]; // 可分配的职级ID列表
  scope: 'global' | 'department' | 'group'; // 作用域
  isActive: boolean;
  isSystem: boolean; // 是否为系统角色
  createdAt: Date;
  updatedAt: Date;
}

// 扩展的用户系统
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[]; // 角色ID列表
  jobLevelId?: string; // 职级ID
  departmentId?: string;
  groupId?: string;
  leaderId?: string;
  directPermissions: string[]; // 直接分配的权限ID（绕过角色的特殊权限）
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 组织架构
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string; // 支持多级部门
  leaderId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  leaderId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 权限路由配置
export interface RoutePermission {
  id: string;
  path: string;
  method: string;
  requiredPermissions: string[]; // 需要的权限代码
  optionalPermissions?: string[]; // 可选权限（用于增强功能）
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  jobLevelId?: string;
  departmentId?: string;
  groupId?: string;
  leaderId?: string;
  directPermissions?: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  roles?: string[];
  jobLevelId?: string;
  departmentId?: string;
  groupId?: string;
  leaderId?: string;
  directPermissions?: string[];
  isActive?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description: string;
  permissions?: string[];
  jobLevels?: string[];
  scope?: 'global' | 'department' | 'group';
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  description?: string;
  permissions?: string[];
  jobLevels?: string[];
  scope?: 'global' | 'department' | 'group';
  isActive?: boolean;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  resource: string;
  action: string;
  description: string;
  category?: 'system' | 'business' | 'data';
}

export interface UpdatePermissionRequest {
  name?: string;
  code?: string;
  resource?: string;
  action?: string;
  description?: string;
  category?: 'system' | 'business' | 'data';
}

export interface CreateJobLevelRequest {
  name: string;
  code: string;
  level: number;
  description: string;
  permissions?: string[];
}

export interface UpdateJobLevelRequest {
  name?: string;
  code?: string;
  level?: number;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface CreateGroupRequest {
  name: string;
  code: string;
  description: string;
  departmentId: string;
  leaderId?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  code?: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description: string;
  parentId?: string;
  leaderId?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string;
  leaderId?: string;
  isActive?: boolean;
}

export interface CreateRoutePermissionRequest {
  path: string;
  method: string;
  requiredPermissions: string[];
  optionalPermissions?: string[];
  description: string;
}

export interface UpdateRoutePermissionRequest {
  path?: string;
  method?: string;
  requiredPermissions?: string[];
  optionalPermissions?: string[];
  description?: string;
  isActive?: boolean;
}

// 权限检查相关类型
export interface PermissionCheckContext {
  user: User;
  action: string;
  resource: string;
  targetUserId?: string;
  targetGroupId?: string;
  targetDepartmentId?: string;
  route?: string;
  method?: string;
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  grantedBy: 'role' | 'job_level' | 'direct' | 'system';
  permissions: string[];
}

// 用户完整权限信息
export interface UserPermissionInfo {
  userId: string;
  permissions: Permission[];
  roles: Role[];
  jobLevel?: JobLevel;
  effectivePermissions: string[]; // 最终有效的权限代码列表
  departmentAccess: string[]; // 可访问的部门ID
  groupAccess: string[]; // 可访问的组ID
}

// 路由权限检查中间件选项
export interface RoutePermissionOptions {
  requiredPermissions?: string[];
  optionalPermissions?: string[];
  checkDepartment?: boolean;
  checkGroup?: boolean;
  allowSelf?: boolean; // 是否允许用户操作自己的资源
}