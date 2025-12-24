import { JsonStore } from '../utils/json-store';
import { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../types/shared';

export class PermissionModel {
  private store: JsonStore<Permission>;

  constructor() {
    this.store = new JsonStore<Permission>('permissions.json');
  }

  public async findAll(): Promise<Permission[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<Permission | null> {
    const permission = this.store.findById(id);
    return permission || null;
  }

  public async findByCode(code: string): Promise<Permission | null> {
    const permission = this.store.findOne(permission => permission.code === code);
    return permission || null;
  }

  public async findByResource(resource: string): Promise<Permission[]> {
    const permissions = await this.findAll();
    return permissions.filter(permission => permission.resource === resource);
  }

  public async findByCategory(category: 'system' | 'business' | 'data'): Promise<Permission[]> {
    const permissions = await this.findAll();
    return permissions.filter(permission => permission.category === category);
  }

  public async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const permission = this.store.findOne(p => p.resource === resource && p.action === action);
    return permission || null;
  }

  public async create(permissionData: CreatePermissionRequest): Promise<Permission> {
    const now = new Date();
    return this.store.create({
      ...permissionData,
      category: permissionData.category || 'business',
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async update(id: string, updates: UpdatePermissionRequest): Promise<Permission | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    return this.store.update(id, updateData);
  }

  public async delete(id: string): Promise<boolean> {
    // 检查是否为系统权限
    const permission = await this.findById(id);
    if (permission && permission.isSystem) {
      throw new Error('Cannot delete system permission');
    }
    return this.store.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return this.store.exists(id);
  }

  public async existsByCode(code: string): Promise<boolean> {
    const permission = await this.findByCode(code);
    return permission !== null;
  }

  public async existsByResourceAndAction(resource: string, action: string): Promise<boolean> {
    const permission = await this.findByResourceAndAction(resource, action);
    return permission !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }

  public async getActivePermissions(): Promise<Permission[]> {
    const permissions = await this.findAll();
    return permissions.filter(permission => !permission.isSystem || permission.category !== 'system');
  }

  public async getSystemPermissions(): Promise<Permission[]> {
    const permissions = await this.findAll();
    return permissions.filter(permission => permission.isSystem);
  }

  public async getBusinessPermissions(): Promise<Permission[]> {
    return this.findByCategory('business');
  }

  public async getDataPermissions(): Promise<Permission[]> {
    return this.findByCategory('data');
  }

  public async searchPermissions(query: string): Promise<Permission[]> {
    const permissions = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return permissions.filter(permission => 
      permission.name.toLowerCase().includes(lowerQuery) ||
      permission.code.toLowerCase().includes(lowerQuery) ||
      permission.description.toLowerCase().includes(lowerQuery)
    );
  }

  // 初始化系统权限
  public async initializeSystemPermissions(): Promise<void> {
    const systemPermissions = [
      { code: 'system:admin', name: '系统管理员', resource: 'system', action: 'admin', description: '拥有所有系统权限', category: 'system' },
      { code: 'user:create', name: '创建用户', resource: 'user', action: 'create', description: '创建新用户', category: 'business' },
      { code: 'user:read', name: '查看用户', resource: 'user', action: 'read', description: '查看用户信息', category: 'business' },
      { code: 'user:update', name: '更新用户', resource: 'user', action: 'update', description: '更新用户信息', category: 'business' },
      { code: 'user:delete', name: '删除用户', resource: 'user', action: 'delete', description: '删除用户', category: 'business' },
      { code: 'user:manage', name: '管理用户', resource: 'user', action: 'manage', description: '用户管理权限', category: 'business' },
      { code: 'user:read_self', name: '查看自己', resource: 'user', action: 'read_self', description: '查看自己的信息', category: 'business' },
      { code: 'user:update_self', name: '更新自己', resource: 'user', action: 'update_self', description: '更新自己的信息', category: 'business' },
      { code: 'role:create', name: '创建角色', resource: 'role', action: 'create', description: '创建新角色', category: 'business' },
      { code: 'role:read', name: '查看角色', resource: 'role', action: 'read', description: '查看角色信息', category: 'business' },
      { code: 'role:update', name: '更新角色', resource: 'role', action: 'update', description: '更新角色信息', category: 'business' },
      { code: 'role:delete', name: '删除角色', resource: 'role', action: 'delete', description: '删除角色', category: 'business' },
      { code: 'role:manage', name: '管理角色', resource: 'role', action: 'manage', description: '角色管理权限', category: 'business' },
      { code: 'permission:create', name: '创建权限', resource: 'permission', action: 'create', description: '创建新权限', category: 'system' },
      { code: 'permission:read', name: '查看权限', resource: 'permission', action: 'read', description: '查看权限信息', category: 'system' },
      { code: 'permission:update', name: '更新权限', resource: 'permission', action: 'update', description: '更新权限信息', category: 'system' },
      { code: 'permission:delete', name: '删除权限', resource: 'permission', action: 'delete', description: '删除权限', category: 'system' },
      { code: 'permission:manage', name: '管理权限', resource: 'permission', action: 'manage', description: '权限管理权限', category: 'system' },
      { code: 'department:create', name: '创建部门', resource: 'department', action: 'create', description: '创建新部门', category: 'business' },
      { code: 'department:read', name: '查看部门', resource: 'department', action: 'read', description: '查看部门信息', category: 'business' },
      { code: 'department:update', name: '更新部门', resource: 'department', action: 'update', description: '更新部门信息', category: 'business' },
      { code: 'department:delete', name: '删除部门', resource: 'department', action: 'delete', description: '删除部门', category: 'business' },
      { code: 'department:manage', name: '管理部门', resource: 'department', action: 'manage', description: '部门管理权限', category: 'business' },
      { code: 'department:manage_all', name: '管理所有部门', resource: 'department', action: 'manage_all', description: '管理所有部门的权限', category: 'business' },
      { code: 'group:create', name: '创建组', resource: 'group', action: 'create', description: '创建新组', category: 'business' },
      { code: 'group:read', name: '查看组', resource: 'group', action: 'read', description: '查看组信息', category: 'business' },
      { code: 'group:update', name: '更新组', resource: 'group', action: 'update', description: '更新组信息', category: 'business' },
      { code: 'group:delete', name: '删除组', resource: 'group', action: 'delete', description: '删除组', category: 'business' },
      { code: 'group:manage', name: '管理组', resource: 'group', action: 'manage', description: '组管理权限', category: 'business' },
      { code: 'group:manage_all', name: '管理所有组', resource: 'group', action: 'manage_all', description: '管理所有组的权限', category: 'business' },
      { code: 'job_level:create', name: '创建职级', resource: 'job_level', action: 'create', description: '创建新职级', category: 'business' },
      { code: 'job_level:read', name: '查看职级', resource: 'job_level', action: 'read', description: '查看职级信息', category: 'business' },
      { code: 'job_level:update', name: '更新职级', resource: 'job_level', action: 'update', description: '更新职级信息', category: 'business' },
      { code: 'job_level:delete', name: '删除职级', resource: 'job_level', action: 'delete', description: '删除职级', category: 'business' },
      { code: 'job_level:manage', name: '管理职级', resource: 'job_level', action: 'manage', description: '职级管理权限', category: 'business' },
      { code: 'profile:read', name: '查看档案', resource: 'profile', action: 'read', description: '查看档案信息', category: 'business' },
      { code: 'profile:update', name: '更新档案', resource: 'profile', action: 'update', description: '更新档案信息', category: 'business' },
    ];

    for (const permData of systemPermissions) {
      const existing = await this.findByCode(permData.code);
      if (!existing) {
        this.store.create({
          ...permData,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}