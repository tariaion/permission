import { JsonStore } from '../utils/json-store';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/shared';

export class RoleModel {
  private store: JsonStore<Role>;

  constructor() {
    this.store = new JsonStore<Role>('roles.json');
  }

  public async findAll(): Promise<Role[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<Role | null> {
    const role = this.store.findById(id);
    return role || null;
  }

  public async findByCode(code: string): Promise<Role | null> {
    const role = this.store.findOne(role => role.code === code);
    return role || null;
  }

  public async findByName(name: string): Promise<Role | null> {
    const role = this.store.findOne(role => role.name === name);
    return role || null;
  }

  public async findByScope(scope: 'global' | 'department' | 'group'): Promise<Role[]> {
    const roles = await this.findAll();
    return roles.filter(role => role.scope === scope);
  }

  public async findByJobLevel(jobLevelId: string): Promise<Role[]> {
    const roles = await this.findAll();
    return roles.filter(role => role.jobLevels.includes(jobLevelId));
  }

  public async create(roleData: CreateRoleRequest): Promise<Role> {
    const now = new Date();
    return this.store.create({
      ...roleData,
      permissions: roleData.permissions || [],
      jobLevels: roleData.jobLevels || [],
      scope: roleData.scope || 'global',
      isActive: true,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async update(id: string, updates: UpdateRoleRequest): Promise<Role | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    return this.store.update(id, updateData);
  }

  public async delete(id: string): Promise<boolean> {
    // 检查是否为系统角色
    const role = await this.findById(id);
    if (role && role.isSystem) {
      throw new Error('Cannot delete system role');
    }
    return this.store.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return this.store.exists(id);
  }

  public async existsByCode(code: string): Promise<boolean> {
    const role = await this.findByCode(code);
    return role !== null;
  }

  public async existsByName(name: string): Promise<boolean> {
    const role = await this.findByName(name);
    return role !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }

  public async getActiveRoles(): Promise<Role[]> {
    const roles = await this.findAll();
    return roles.filter(role => role.isActive);
  }

  public async getSystemRoles(): Promise<Role[]> {
    const roles = await this.findAll();
    return roles.filter(role => role.isSystem);
  }

  public async getNonSystemRoles(): Promise<Role[]> {
    const roles = await this.findAll();
    return roles.filter(role => !role.isSystem);
  }

  public async searchRoles(query: string): Promise<Role[]> {
    const roles = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return roles.filter(role => 
      role.name.toLowerCase().includes(lowerQuery) ||
      role.code.toLowerCase().includes(lowerQuery) ||
      role.description.toLowerCase().includes(lowerQuery)
    );
  }

  // 初始化系统角色
  public async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      { 
        code: 'super_admin', 
        name: '超级管理员', 
        description: '拥有系统所有权限',
        scope: 'global' as const,
        permissions: ['system:admin']
      },
      { 
        code: 'admin', 
        name: '管理员', 
        description: '系统管理员',
        scope: 'global' as const,
        permissions: ['user:manage', 'role:manage', 'permission:read', 'department:manage_all', 'group:manage_all', 'job_level:manage']
      },
      { 
        code: 'department_manager', 
        name: '部门经理', 
        description: '部门管理权限',
        scope: 'department' as const,
        permissions: ['user:create', 'user:read', 'user:update', 'group:create', 'group:read', 'group:update', 'department:manage']
      },
      { 
        code: 'group_leader', 
        name: '组长', 
        description: '组管理权限',
        scope: 'group' as const,
        permissions: ['user:read', 'group:manage']
      },
      { 
        code: 'employee', 
        name: '员工', 
        description: '普通员工权限',
        scope: 'group' as const,
        permissions: ['user:read_self', 'profile:read', 'profile:update']
      }
    ];

    for (const roleData of systemRoles) {
      const existing = await this.findByCode(roleData.code);
      if (!existing) {
        this.store.create({
          ...roleData,
          jobLevels: [],
          isActive: true,
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