import { Request, Response, NextFunction } from 'express';
import { PermissionCheckContext, PermissionCheckResult, RoutePermissionOptions, User } from '../types/shared';
import { PermissionService } from '../services/permission';

export class RoutePermissionMiddleware {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  /**
   * 路由权限检查中间件
   */
  public requirePermissions(options: RoutePermissionOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user as User;
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const context: PermissionCheckContext = {
          user,
          action: this.getActionFromMethod(req.method),
          resource: this.getResourceFromPath(req.path),
          route: req.path,
          method: req.method,
          targetUserId: req.params.userId,
          targetGroupId: req.params.groupId,
          targetDepartmentId: req.params.departmentId,
        };

        // 检查必需权限
        if (options.requiredPermissions && options.requiredPermissions.length > 0) {
          const hasRequiredPermission = await this.checkPermissions(user, options.requiredPermissions, context);
          if (!hasRequiredPermission.hasPermission) {
            return res.status(403).json({
              success: false,
              message: 'Insufficient permissions',
              error: `Missing required permissions: ${options.requiredPermissions.join(', ')}`
            });
          }
        }

        // 检查部门权限
        if (options.checkDepartment && req.params.departmentId) {
          const canAccessDepartment = await this.canAccessDepartment(user, req.params.departmentId);
          if (!canAccessDepartment) {
            return res.status(403).json({
              success: false,
              message: 'Cannot access this department'
            });
          }
        }

        // 检查组权限
        if (options.checkGroup && req.params.groupId) {
          const canAccessGroup = await this.canAccessGroup(user, req.params.groupId);
          if (!canAccessGroup) {
            return res.status(403).json({
              success: false,
              message: 'Cannot access this group'
            });
          }
        }

        // 检查是否允许操作自己的资源
        if (options.allowSelf && req.params.userId) {
          if (req.params.userId === user.id) {
            return next();
          }
        }

        // 将用户权限信息附加到请求对象
        const userPermissionInfo = await this.permissionService.getUserEffectivePermissions(user.id);
        req.userPermissions = userPermissionInfo.effectivePermissions;

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({
          success: false,
          message: 'Permission check failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };
  }

  /**
   * 管理员权限检查
   */
  public requireAdmin() {
    return this.requirePermissions({
      requiredPermissions: ['system:admin']
    });
  }

  /**
   * 用户管理权限检查
   */
  public requireUserManagement() {
    return this.requirePermissions({
      requiredPermissions: ['user:manage'],
      allowSelf: true
    });
  }

  /**
   * 角色管理权限检查
   */
  public requireRoleManagement() {
    return this.requirePermissions({
      requiredPermissions: ['role:manage']
    });
  }

  /**
   * 部门管理权限检查
   */
  public requireDepartmentManagement() {
    return this.requirePermissions({
      requiredPermissions: ['department:manage'],
      checkDepartment: true
    });
  }

  /**
   * 组管理权限检查
   */
  public requireGroupManagement() {
    return this.requirePermissions({
      requiredPermissions: ['group:manage'],
      checkGroup: true
    });
  }

  private async checkPermissions(
    user: User,
    requiredPermissions: string[],
    context: PermissionCheckContext
  ): Promise<PermissionCheckResult> {
    const userPermissions = await this.permissionService.getUserEffectivePermissions(user.id);
    
    for (const permission of requiredPermissions) {
      if (!userPermissions.effectivePermissions.includes(permission)) {
        return {
          hasPermission: false,
          reason: `Missing permission: ${permission}`,
          grantedBy: 'role',
          permissions: userPermissions.effectivePermissions
        };
      }
    }

    return {
      hasPermission: true,
      grantedBy: 'role',
      permissions: userPermissions.effectivePermissions
    };
  }

  private async canAccessDepartment(user: User, departmentId: string): Promise<boolean> {
    const userPermissions = await this.permissionService.getUserEffectivePermissions(user.id);
    
    // 管理员可以访问所有部门
    if (userPermissions.effectivePermissions.includes('department:manage_all')) {
      return true;
    }

    // 用户自己的部门
    if (user.departmentId === departmentId) {
      return true;
    }

    // 部门管理员可以访问自己的部门
    if (userPermissions.effectivePermissions.includes('department:manage') && user.departmentId === departmentId) {
      return true;
    }

    // 检查部门访问权限列表
    return userPermissions.departmentAccess.includes(departmentId);
  }

  private async canAccessGroup(user: User, groupId: string): Promise<boolean> {
    const userPermissions = await this.permissionService.getUserEffectivePermissions(user.id);
    
    // 管理员可以访问所有组
    if (userPermissions.effectivePermissions.includes('group:manage_all')) {
      return true;
    }

    // 用户自己的组
    if (user.groupId === groupId) {
      return true;
    }

    // 组管理员可以访问自己的组
    if (userPermissions.effectivePermissions.includes('group:manage') && user.groupId === groupId) {
      return true;
    }

    // 检查组访问权限列表
    return userPermissions.groupAccess.includes(groupId);
  }

  private getActionFromMethod(method: string): string {
    const methodActionMap: Record<string, string> = {
      'GET': 'read',
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update',
      'DELETE': 'delete'
    };
    return methodActionMap[method] || 'unknown';
  }

  private getResourceFromPath(path: string): string {
    const pathParts = path.split('/').filter(part => part && !part.match(/^[0-9a-fA-F]{24}$/));
    return pathParts[0] || 'unknown';
  }
}

// 扩展Request接口
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userPermissions?: string[];
    }
  }
}

export const routePermissionMiddleware = new RoutePermissionMiddleware();