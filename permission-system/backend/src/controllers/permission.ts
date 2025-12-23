import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PermissionService } from '../services/permission';
import { ApiResponse, CreatePermissionRequest, UpdatePermissionRequest } from '../types/shared';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  public createPermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const createPermissionRequest: CreatePermissionRequest = req.body;
      const permission = await this.permissionService.createPermission(createPermissionRequest);

      const response: ApiResponse = {
        success: true,
        data: permission,
        message: '权限创建成功',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '权限创建失败',
      };
      res.status(400).json(response);
    }
  };

  public updatePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates: UpdatePermissionRequest = req.body;
      const permission = await this.permissionService.updatePermission(id, updates);

      if (!permission) {
        const response: ApiResponse = {
          success: false,
          error: '权限不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: permission,
        message: '权限更新成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '权限更新失败',
      };
      res.status(400).json(response);
    }
  };

  public getAllPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const permissions = await this.permissionService.getAllPermissions();

      const response: ApiResponse = {
        success: true,
        data: permissions,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取权限列表失败',
      };
      res.status(500).json(response);
    }
  };

  public getPermissionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permission = await this.permissionService.getPermissionById(id);

      if (!permission) {
        const response: ApiResponse = {
          success: false,
          error: '权限不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: permission,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取权限信息失败',
      };
      res.status(500).json(response);
    }
  };

  public deletePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.permissionService.deletePermission(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: '权限不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: '权限删除成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '权限删除失败',
      };
      res.status(400).json(response);
    }
  };

  public getPermissionsByResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { resource } = req.params;
      const permissions = await this.permissionService.getPermissionsByResource(resource);

      const response: ApiResponse = {
        success: true,
        data: permissions,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取资源权限失败',
      };
      res.status(500).json(response);
    }
  };
}