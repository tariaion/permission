import { User } from '../types/shared';
import { AuthService } from './auth';
import { RoleService } from './role';
import { PermissionService } from './permission';

export class PermissionChecker {
  private authService: AuthService;
  private roleService: RoleService;
  private permissionService: PermissionService;

  constructor() {
    this.authService = new AuthService();
    this.roleService = new RoleService();
    this.permissionService = new PermissionService();
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
}