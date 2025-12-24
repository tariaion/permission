import { User, PermissionCheckContext, Group, Department } from '../types/shared';
import { AuthService } from './auth';
import { RoleService } from './role';
import { PermissionService } from './permission';
import { GroupModel } from '../models/group';
import { DepartmentModel } from '../models/department';

export class PermissionChecker {
  private authService: AuthService;
  private roleService: RoleService;
  private permissionService: PermissionService;
  private groupModel: GroupModel;
  private departmentModel: DepartmentModel;

  constructor() {
    this.authService = new AuthService();
    this.roleService = new RoleService();
    this.permissionService = new PermissionService();
    this.groupModel = new GroupModel();
    this.departmentModel = new DepartmentModel();
  }

  public async hasPermission(user: User, resource: string, action: string): Promise<boolean> {
    if (!user.isActive) {
      return false;
    }

    const userPermissions = await this.getUserPermissions(user);
    return userPermissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  public async checkPermissionWithContext(context: PermissionCheckContext): Promise<boolean> {
    const { user, targetUserId, targetGroupId, targetDepartmentId, action, resource } = context;

    // 管理员拥有所有权限
    if (user.position === 'admin') {
      return true;
    }

    // 检查基本权限
    const hasBasicPermission = await this.hasPermission(user, resource, action);
    if (!hasBasicPermission) {
      return false;
    }

    // 个人权限：只能操作自己的信息
    if (targetUserId && !await this.canAccessUser(user, targetUserId)) {
      return false;
    }

    // 组长权限：只能操作本组内的信息
    if (targetGroupId && !await this.canAccessGroup(user, targetGroupId)) {
      return false;
    }

    // 部门领导权限：只能操作本部门内的信息
    if (targetDepartmentId && !await this.canAccessDepartment(user, targetDepartmentId)) {
      return false;
    }

    return true;
  }

  private async canAccessUser(currentUser: User, targetUserId: string): Promise<boolean> {
    // 用户可以访问自己的信息
    if (currentUser.id === targetUserId) {
      return true;
    }

    // 管理员可以访问所有用户
    if (currentUser.position === 'admin') {
      return true;
    }

    const targetUser = await this.authService.getUserById(targetUserId);
    if (!targetUser) {
      return false;
    }

    // 部门领导可以访问本部门所有用户
    if (currentUser.position === 'department_leader' && 
        currentUser.departmentId === targetUser.departmentId) {
      return true;
    }

    // 组长可以访问本组成员
    if (currentUser.position === 'group_leader' && 
        currentUser.groupId === targetUser.groupId) {
      return true;
    }

    return false;
  }

  private async canAccessGroup(currentUser: User, targetGroupId: string): Promise<boolean> {
    // 管理员可以访问所有组
    if (currentUser.position === 'admin') {
      return true;
    }

    // 部门领导可以访问本部门的所有组
    if (currentUser.position === 'department_leader' && currentUser.departmentId) {
      const targetGroup = await this.groupModel.getGroupById(targetGroupId);
      return targetGroup?.departmentId === currentUser.departmentId;
    }

    // 组长只能访问自己管理的组
    if (currentUser.position === 'group_leader') {
      const targetGroup = await this.groupModel.getGroupById(targetGroupId);
      return targetGroup?.leaderId === currentUser.id;
    }

    return false;
  }

  private async canAccessDepartment(currentUser: User, targetDepartmentId: string): Promise<boolean> {
    // 管理员可以访问所有部门
    if (currentUser.position === 'admin') {
      return true;
    }

    // 部门领导只能访问自己管理的部门
    if (currentUser.position === 'department_leader') {
      return currentUser.departmentId === targetDepartmentId;
    }

    return false;
  }

  public async hasAnyPermission(user: User, permissions: Array<{ resource: string; action: string }>): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(user, permission.resource, permission.action)) {
        return true;
      }
    }
    return false;
  }

  public async hasAllPermissions(user: User, permissions: Array<{ resource: string; action: string }>): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(user, permission.resource, permission.action))) {
        return false;
      }
    }
    return true;
  }

  public async hasRole(user: User, roleName: string): Promise<boolean> {
    for (const roleId of user.roles) {
      const role = await this.roleService.getRoleById(roleId);
      if (role && role.name === roleName) {
        return true;
      }
    }
    return false;
  }

  public async hasAnyRole(user: User, roleNames: string[]): Promise<boolean> {
    for (const roleName of roleNames) {
      if (await this.hasRole(user, roleName)) {
        return true;
      }
    }
    return false;
  }

  public async getUserPermissions(user: User): Promise<any[]> {
    const permissions = [];
    const addedPermissionIds = new Set();

    for (const roleId of user.roles) {
      const role = await this.roleService.getRoleById(roleId);
      if (role) {
        for (const permissionId of role.permissions) {
          if (!addedPermissionIds.has(permissionId)) {
            const permission = await this.permissionService.getPermissionById(permissionId);
            if (permission) {
              permissions.push(permission);
              addedPermissionIds.add(permissionId);
            }
          }
        }
      }
    }

    return permissions;
  }

  public async checkAndThrow(user: User, resource: string, action: string, errorMessage?: string): Promise<void> {
    if (!(await this.hasPermission(user, resource, action))) {
      throw new Error(errorMessage || `权限不足：需要 ${resource}:${action} 权限`);
    }
  }

  public async checkAndThrowWithContext(context: PermissionCheckContext, errorMessage?: string): Promise<void> {
    if (!(await this.checkPermissionWithContext(context))) {
      throw new Error(errorMessage || `权限不足：无法执行该操作`);
    }
  }
}