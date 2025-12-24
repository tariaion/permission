import { PermissionCheckContext, PermissionCheckResult, UserPermissionInfo } from '../types/shared';
import { UserModel } from '../models/user';
import { RoleModel } from '../models/role';
import { PermissionModel } from '../models/permission';
import { JobLevelModel } from '../models/job-level';
import { DepartmentModel } from '../models/department';
import { GroupModel } from '../models/group';

export class PermissionService {
  private userModel: UserModel;
  private roleModel: RoleModel;
  private permissionModel: PermissionModel;
  private jobLevelModel: JobLevelModel;
  private departmentModel: DepartmentModel;
  private groupModel: GroupModel;

  constructor() {
    this.userModel = new UserModel();
    this.roleModel = new RoleModel();
    this.permissionModel = new PermissionModel();
    this.jobLevelModel = new JobLevelModel();
    this.departmentModel = new DepartmentModel();
    this.groupModel = new GroupModel();
  }

  /**
   * 获取用户完整权限信息
   */
  public async getUserEffectivePermissions(userId: string): Promise<UserPermissionInfo> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await this.getRolesForUser(user);
    const jobLevel = user.jobLevelId ? await this.jobLevelModel.findById(user.jobLevelId) || undefined : undefined;

    // 收集所有权限
    const permissions = new Set<string>();
    const permissionDetails: any[] = [];

    // 来自角色的权限
    for (const role of roles) {
      for (const permissionId of role.permissions) {
        const permission = await this.permissionModel.findById(permissionId);
        if (permission && permission.isActive) {
          permissions.add(permission.code);
          permissionDetails.push(permission);
        }
      }
    }

    // 来自职级的权限
    if (jobLevel) {
      for (const permissionId of jobLevel.permissions) {
        const permission = await this.permissionModel.findById(permissionId);
        if (permission && permission.isActive) {
          permissions.add(permission.code);
          permissionDetails.push(permission);
        }
      }
    }

    // 直接分配的权限
    for (const permissionId of user.directPermissions) {
      const permission = await this.permissionModel.findById(permissionId);
      if (permission && permission.isActive) {
        permissions.add(permission.code);
        permissionDetails.push(permission);
      }
    }

    // 计算可访问的部门和组
    const departmentAccess = await this.calculateDepartmentAccess(user, roles);
    const groupAccess = await this.calculateGroupAccess(user, roles);

    return {
      userId: user.id,
      permissions: permissionDetails,
      roles,
      jobLevel,
      effectivePermissions: Array.from(permissions),
      departmentAccess,
      groupAccess
    };
  }

  /**
   * 检查用户权限
   */
  public async checkPermission(context: PermissionCheckContext): Promise<PermissionCheckResult> {
    const userPermissions = await this.getUserEffectivePermissions(context.user.id);
    
    // 构建权限代码
    const permissionCode = `${context.resource}:${context.action}`;
    
    // 检查具体权限
    if (userPermissions.effectivePermissions.includes(permissionCode)) {
      return {
        hasPermission: true,
        grantedBy: 'role',
        permissions: [permissionCode]
      };
    }

    // 检查通用权限
    const generalPermission = `${context.resource}:*`;
    if (userPermissions.effectivePermissions.includes(generalPermission)) {
      return {
        hasPermission: true,
        grantedBy: 'role',
        permissions: [generalPermission]
      };
    }

    // 检查管理权限
    const managePermission = `${context.resource}:manage`;
    if (userPermissions.effectivePermissions.includes(managePermission)) {
      return {
        hasPermission: true,
        grantedBy: 'role',
        permissions: [managePermission]
      };
    }

    // 检查系统管理员权限
    if (userPermissions.effectivePermissions.includes('system:admin')) {
      return {
        hasPermission: true,
        grantedBy: 'system',
        permissions: ['system:admin']
      };
    }

    // 特殊情况：用户操作自己的资源
    if (context.targetUserId === context.user.id) {
      const selfPermissions = [
        'user:read_self',
        'user:update_self',
        'profile:read',
        'profile:update'
      ];
      
      const selfPermissionCode = `${context.resource}:${context.action}_self`;
      if (selfPermissions.includes(selfPermissionCode) && 
          userPermissions.effectivePermissions.includes(selfPermissionCode)) {
        return {
          hasPermission: true,
          grantedBy: 'direct',
          permissions: [selfPermissionCode]
        };
      }
    }

    return {
      hasPermission: false,
      reason: `Permission denied: ${permissionCode}`,
      grantedBy: 'role',
      permissions: []
    };
  }

  /**
   * 检查用户是否可以访问特定部门
   */
  public async canAccessDepartment(userId: string, departmentId: string): Promise<boolean> {
    const userPermissions = await this.getUserEffectivePermissions(userId);
    
    return userPermissions.departmentAccess.includes(departmentId);
  }

  /**
   * 检查用户是否可以访问特定组
   */
  public async canAccessGroup(userId: string, groupId: string): Promise<boolean> {
    const userPermissions = await this.getUserEffectivePermissions(userId);
    
    return userPermissions.groupAccess.includes(groupId);
  }

  /**
   * 获取用户在特定作用域的权限
   */
  public async getPermissionsByScope(userId: string, scope: 'global' | 'department' | 'group'): Promise<string[]> {
    const userPermissions = await this.getUserEffectivePermissions(userId);
    const scopedPermissions: string[] = [];

    for (const permission of userPermissions.permissions) {
      // 这里可以根据权限的作用域进行过滤
      // 目前简化实现，返回所有权限
      scopedPermissions.push(permission.code);
    }

    return scopedPermissions;
  }

  /**
   * 获取所有权限
   */
  public async getAllPermissions(): Promise<Permission[]> {
    return this.permissionModel.findAll();
  }

  /**
   * 根据ID获取权限
   */
  public async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissionModel.findById(id);
  }

  /**
   * 创建权限
   */
  public async createPermission(permissionData: CreatePermissionRequest): Promise<Permission> {
    return this.permissionModel.create(permissionData);
  }

  /**
   * 更新权限
   */
  public async updatePermission(id: string, updates: UpdatePermissionRequest): Promise<Permission | null> {
    return this.permissionModel.update(id, updates);
  }

  /**
   * 删除权限
   */
  public async deletePermission(id: string): Promise<boolean> {
    return this.permissionModel.delete(id);
  }

  /**
   * 根据资源获取权限
   */
  public async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return this.permissionModel.findByResource(resource);
  }

  private async getRolesForUser(user: any): Promise<any[]> {
    const roles: any[] = [];
    
    for (const roleId of user.roles) {
      const role = await this.roleModel.findById(roleId);
      if (role && role.isActive) {
        roles.push(role);
      }
    }

    return roles;
  }

  private async calculateDepartmentAccess(user: any, roles: any[]): Promise<string[]> {
    const departmentAccess = new Set<string>();

    // 用户自己的部门
    if (user.departmentId) {
      departmentAccess.add(user.departmentId);
    }

    // 角色提供的部门访问权限
    for (const role of roles) {
      if (role.scope === 'global' || role.scope === 'department') {
        // 全局角色或部门角色可以访问所有部门
        const departments = await this.departmentModel.findAll();
        departments.forEach(dept => {
          if (dept.isActive) {
            departmentAccess.add(dept.id);
          }
        });
      }
    }

    return Array.from(departmentAccess);
  }

  private async calculateGroupAccess(user: any, roles: any[]): Promise<string[]> {
    const groupAccess = new Set<string>();

    // 用户自己的组
    if (user.groupId) {
      groupAccess.add(user.groupId);
    }

    // 角色提供的组访问权限
    for (const role of roles) {
      if (role.scope === 'global') {
        // 全局角色可以访问所有组
        const groups = await this.groupModel.findAll();
        groups.forEach(group => {
          if (group.isActive) {
            groupAccess.add(group.id);
          }
        });
      } else if (role.scope === 'department' && user.departmentId) {
        // 部门角色可以访问部门下的所有组
        const groups = await this.groupModel.findByDepartment(user.departmentId);
        groups.forEach(group => {
          if (group.isActive) {
            groupAccess.add(group.id);
          }
        });
      }
    }

    return Array.from(groupAccess);
  }
}