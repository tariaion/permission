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
import { requirePermission } from '../middleware/permission';

const router = Router();
const authController = new AuthController();

router.post('/login', validateRequest(loginSchema), authController.login);

router.post('/logout', authenticateToken, authController.logout);

router.get('/me', authenticateToken, authController.getCurrentUser);

router.post(
  '/users',
  authenticateToken,
  requirePermission('users', 'create'),
  validateRequest(createUserSchema),
  authController.createUser
);

router.get(
  '/users',
  authenticateToken,
  requirePermission('users', 'read'),
  authController.getAllUsers
);

router.get(
  '/users/:id',
  authenticateToken,
  requirePermission('users', 'read'),
  authController.getUserById
);

router.put(
  '/users/:id',
  authenticateToken,
  requirePermission('users', 'update'),
  validateRequest(updateUserSchema),
  authController.updateUser
);

router.delete(
  '/users/:id',
  authenticateToken,
  requirePermission('users', 'delete'),
  authController.deleteUser
);

router.post(
  '/users/:id/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

export default router;