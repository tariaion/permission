import { Router } from 'express';
import { RoleController } from '../controllers/role';
import { authenticateToken } from '../middleware/auth';
import { 
  validateRequest, 
  createRoleSchema, 
  updateRoleSchema 
} from '../middleware/validation';
import { requirePermission } from '../middleware/permission';

const router = Router();
const roleController = new RoleController();

router.post(
  '/',
  authenticateToken,
  requirePermission('roles', 'create'),
  validateRequest(createRoleSchema),
  roleController.createRole
);

router.get(
  '/',
  authenticateToken,
  requirePermission('roles', 'read'),
  roleController.getAllRoles
);

router.get(
  '/:id',
  authenticateToken,
  requirePermission('roles', 'read'),
  roleController.getRoleById
);

router.put(
  '/:id',
  authenticateToken,
  requirePermission('roles', 'update'),
  validateRequest(updateRoleSchema),
  roleController.updateRole
);

router.delete(
  '/:id',
  authenticateToken,
  requirePermission('roles', 'delete'),
  roleController.deleteRole
);

router.get(
  '/:id/permissions',
  authenticateToken,
  requirePermission('roles', 'read'),
  roleController.getRolePermissions
);

export default router;