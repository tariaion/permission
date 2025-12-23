import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RoleService } from '../services/role';
import { ApiResponse, CreateRoleRequest, UpdateRoleRequest } from '../types/shared';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  public createRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const createRoleRequest: CreateRoleRequest = req.body;
      const role = await this.roleService.createRole(createRoleRequest);

      const response: ApiResponse = {
        success: true,
        data: role,
        message: '角色创建成功',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '角色创建失败',
      };
      res.status(400).json(response);
    }
  };

  public updateRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates: UpdateRoleRequest = req.body;
      const role = await this.roleService.updateRole(id, updates);

      if (!role) {
        const response: ApiResponse = {
          success: false,
          error: '角色不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: role,
        message: '角色更新成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '角色更新失败',
      };
      res.status(400).json(response);
    }
  };

  public getAllRoles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const roles = await this.roleService.getAllRoles();

      const response: ApiResponse = {
        success: true,
        data: roles,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取角色列表失败',
      };
      res.status(500).json(response);
    }
  };

  public getRoleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.roleService.getRoleById(id);

      if (!role) {
        const response: ApiResponse = {
          success: false,
          error: '角色不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: role,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取角色信息失败',
      };
      res.status(500).json(response);
    }
  };

  public deleteRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.roleService.deleteRole(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: '角色不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: '角色删除成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '角色删除失败',
      };
      res.status(400).json(response);
    }
  };

  public getRolePermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permissions = await this.roleService.getRolePermissions(id);

      const response: ApiResponse = {
        success: true,
        data: permissions,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取角色权限失败',
      };
      res.status(500).json(response);
    }
  };
}