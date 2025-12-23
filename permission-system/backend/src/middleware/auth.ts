import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: '访问令牌缺失',
      });
      return;
    }

    const authService = new AuthService();
    const user = await authService.validateToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        error: '访问令牌无效或已过期',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: '令牌验证失败',
    });
  }
};