import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuthService } from '../services/auth';
import { ApiResponse, LoginRequest, CreateUserRequest, UpdateUserRequest } from '../types/shared';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginRequest: LoginRequest = req.body;
      const result = await this.authService.login(loginRequest);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      };
      res.status(400).json(response);
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        await this.authService.logout(token);
      }

      const response: ApiResponse = {
        success: true,
        message: '退出登录成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '退出登录失败',
      };
      res.status(400).json(response);
    }
  };

  public getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: '用户未认证',
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: req.user,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取用户信息失败',
      };
      res.status(500).json(response);
    }
  };

  public createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const createUserRequest: CreateUserRequest = req.body;
      const user = await this.authService.createUser(createUserRequest);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: '用户创建成功',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '用户创建失败',
      };
      res.status(400).json(response);
    }
  };

  public updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates: UpdateUserRequest = req.body;
      const user = await this.authService.updateUser(id, updates);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: '用户不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: '用户更新成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '用户更新失败',
      };
      res.status(400).json(response);
    }
  };

  public getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await this.authService.getAllUsers();

      const response: ApiResponse = {
        success: true,
        data: users,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取用户列表失败',
      };
      res.status(500).json(response);
    }
  };

  public getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.authService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: '用户不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '获取用户信息失败',
      };
      res.status(500).json(response);
    }
  };

  public deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.authService.deleteUser(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: '用户不存在',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: '用户删除成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '用户删除失败',
      };
      res.status(400).json(response);
    }
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      await this.authService.changePassword(id, oldPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: '密码修改成功',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '密码修改失败',
      };
      res.status(400).json(response);
    }
  };
}