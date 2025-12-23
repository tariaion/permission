import { Router } from 'express';
import { PermissionController } from '../controllers/permission';
import { authenticateToken } from '../middleware/auth';
import { 
  validateRequest, 
  createPermissionSchema, 
  updatePermissionSchema 
} from '../middleware/validation';
import { requirePermission } from '../middleware/permission';

const router = Router();
const permissionController = new PermissionController();

router.post(
  '/',
  authenticateToken,
  requirePermission('permissions', 'create'),
  validateRequest(createPermissionSchema),
  permissionController.createPermission
);

router.get(
  '/',
  authenticateToken,
  requirePermission('permissions', 'read'),
  permissionController.getAllPermissions
);

router.get(
  '/:id',
  authenticateToken,
  requirePermission('permissions', 'read'),
  permissionController.getPermissionById
);

router.put(
  '/:id',
  authenticateToken,
  requirePermission('permissions', 'update'),
  validateRequest(updatePermissionSchema),
  permissionController.updatePermission
);

router.delete(
  '/:id',
  authenticateToken,
  requirePermission('permissions', 'delete'),
  permissionController.deletePermission
);

router.get(
  '/resource/:resource',
  authenticateToken,
  requirePermission('permissions', 'read'),
  permissionController.getPermissionsByResource
);

export default router;