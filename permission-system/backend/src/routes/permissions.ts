import { Router } from 'express';
import { PermissionModel } from '../models/permission';
import { CreatePermissionRequest, UpdatePermissionRequest } from '../types/shared';
import { routePermissionMiddleware } from '../middleware/route-permission';
import { ApiResponse } from '../types/shared';

const router = Router();
const permissionModel = new PermissionModel();

// 初始化系统权限
router.post('/initialize', routePermissionMiddleware.requireAdmin(), async (req, res) => {
  try {
    await permissionModel.initializeSystemPermissions();
    res.json({
      success: true,
      message: 'System permissions initialized successfully'
    });
  } catch (error) {
    console.error('Initialize permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize system permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取所有权限
router.get('/', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['permission:read']
}), async (req, res) => {
  try {
    const { category, resource, search } = req.query;
    let permissions;

    if (search) {
      permissions = await permissionModel.searchPermissions(search as string);
    } else if (category) {
      permissions = await permissionModel.findByCategory(category as 'system' | 'business' | 'data');
    } else if (resource) {
      permissions = await permissionModel.findByResource(resource as string);
    } else {
      permissions = await permissionModel.findAll();
    }

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取单个权限
router.get('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['permission:read']
}), async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await permissionModel.findById(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Get permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建权限
router.post('/', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['permission:create']
}), async (req, res) => {
  try {
    const permissionData: CreatePermissionRequest = req.body;

    // 验证必填字段
    if (!permissionData.name || !permissionData.code || !permissionData.resource || !permissionData.action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, code, resource, action'
      });
    }

    // 检查权限代码是否已存在
    if (await permissionModel.existsByCode(permissionData.code)) {
      return res.status(409).json({
        success: false,
        message: 'Permission code already exists'
      });
    }

    const permission = await permissionModel.create(permissionData);

    res.status(201).json({
      success: true,
      data: permission,
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新权限
router.put('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['permission:update']
}), async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdatePermissionRequest = req.body;

    // 检查权限是否存在
    const existingPermission = await permissionModel.findById(id);
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // 如果更新代码，检查新代码是否已被使用
    if (updates.code && updates.code !== existingPermission.code) {
      if (await permissionModel.existsByCode(updates.code)) {
        return res.status(409).json({
          success: false,
          message: 'Permission code already exists'
        });
      }
    }

    const permission = await permissionModel.update(id, updates);

    res.json({
      success: true,
      data: permission,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除权限
router.delete('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['permission:delete']
}), async (req, res) => {
  try {
    const { id } = req.params;

    // 检查权限是否存在
    const existingPermission = await permissionModel.findById(id);
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    const deleted = await permissionModel.delete(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete permission'
      });
    }

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    if (error instanceof Error && error.message === 'Cannot delete system permission') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete system permission'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete permission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取权限统计
router.get('/stats/overview', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['permission:read']
}), async (req, res) => {
  try {
    const allPermissions = await permissionModel.findAll();
    const systemPermissions = await permissionModel.getSystemPermissions();
    const businessPermissions = await permissionModel.getBusinessPermissions();
    const dataPermissions = await permissionModel.getDataPermissions();

    const stats = {
      total: allPermissions.length,
      system: systemPermissions.length,
      business: businessPermissions.length,
      data: dataPermissions.length,
      byResource: {} as Record<string, number>
    };

    // 按资源分组统计
    allPermissions.forEach(permission => {
      stats.byResource[permission.resource] = (stats.byResource[permission.resource] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get permission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permission statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;