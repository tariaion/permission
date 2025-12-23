import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { PermissionChecker } from '../services/permission-checker';

export const requirePermission = (resource: string, action: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '用户未认证',
        });
        return;
      }

      const permissionChecker = new PermissionChecker();
      const hasPermission = await permissionChecker.hasPermission(
        req.user,
        resource,
        action
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: `权限不足：需要 ${resource}:${action} 权限`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '权限检查失败',
      });
    }
  };
};

export const requireAnyPermission = (permissions: Array<{ resource: string; action: string }>) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '用户未认证',
        });
        return;
      }

      const permissionChecker = new PermissionChecker();
      const hasPermission = await permissionChecker.hasAnyPermission(
        req.user,
        permissions
      );

      if (!hasPermission) {
        const requiredPermissions = permissions
          .map(p => `${p.resource}:${p.action}`)
          .join(', ');
        res.status(403).json({
          success: false,
          error: `权限不足：需要以下任一权限 ${requiredPermissions}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '权限检查失败',
      });
    }
  };
};

export const requireRole = (roleName: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '用户未认证',
        });
        return;
      }

      const permissionChecker = new PermissionChecker();
      const hasRole = await permissionChecker.hasRole(req.user, roleName);

      if (!hasRole) {
        res.status(403).json({
          success: false,
          error: `权限不足：需要 ${roleName} 角色`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '角色检查失败',
      });
    }
  };
};

export const requireAnyRole = (roleNames: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '用户未认证',
        });
        return;
      }

      const permissionChecker = new PermissionChecker();
      const hasRole = await permissionChecker.hasAnyRole(req.user, roleNames);

      if (!hasRole) {
        res.status(403).json({
          success: false,
          error: `权限不足：需要以下任一角色 ${roleNames.join(', ')}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '角色检查失败',
      });
    }
  };
};