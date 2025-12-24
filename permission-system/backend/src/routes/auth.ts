import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { 
  validateRequest, 
  loginSchema, 
  createUserSchema, 
  updateUserSchema,
  changePasswordSchema 
} from '../middleware/validation';
import { PermissionChecker } from '../services/permission-checker';

const router = Router();
const authController = new AuthController();
const permissionChecker = new PermissionChecker();

router.post('/login', validateRequest(loginSchema), authController.login);

router.post('/logout', authenticateToken, authController.logout);

router.get('/me', authenticateToken, authController.getCurrentUser);

router.post(
  '/users',
  authenticateToken,
  validateRequest(createUserSchema),
  async (req, res, next) => {
    try {
      const user = req.user;
      await permissionChecker.checkAndThrow(user, 'users', 'create');
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: error instanceof Error ? error.message : '权限不足',
      });
    }
  },
  authController.createUser
);

router.get(
  '/users',
  authenticateToken,
  authController.getAllUsers
);

router.get(
  '/users/:id',
  authenticateToken,
  authController.getUserById
);

router.put(
  '/users/:id',
  authenticateToken,
  validateRequest(updateUserSchema),
  authController.updateUser
);

router.delete(
  '/users/:id',
  authenticateToken,
  authController.deleteUser
);

router.post(
  '/users/:id/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

export default router;