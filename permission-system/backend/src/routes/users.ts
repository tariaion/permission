import { Router } from 'express';
import { UserModel } from '../models/user';
import { RoleModel } from '../models/role';
import { DepartmentModel } from '../models/department';
import { GroupModel } from '../models/group';
import { JobLevelModel } from '../models/job-level';
import { CreateUserRequest, UpdateUserRequest } from '../types/shared';
import { routePermissionMiddleware } from '../middleware/route-permission';
import { PermissionService } from '../services/permission';
import bcrypt from 'bcryptjs';

const router = Router();
const userModel = new UserModel();
const roleModel = new RoleModel();
const departmentModel = new DepartmentModel();
const groupModel = new GroupModel();
const jobLevelModel = new JobLevelModel();
const permissionService = new PermissionService();

// 获取所有用户
router.get('/', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:read']
}), async (req, res) => {
  try {
    const { active, department, group, jobLevel, role, search } = req.query;
    let users;

    if (search) {
      users = await userModel.searchUsers(search as string);
    } else if (department) {
      users = await userModel.getUsersByDepartment(department as string);
    } else if (group) {
      users = await userModel.getUsersByGroup(group as string);
    } else if (jobLevel) {
      users = await userModel.getUsersByJobLevel(jobLevel as string);
    } else if (role) {
      users = await userModel.getUsersByRole(role as string);
    } else if (active === 'true') {
      users = await userModel.getActiveUsers();
    } else {
      users = await userModel.findAll();
    }

    // 移除密码字段
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: usersWithoutPassword
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取当前用户信息
router.get('/profile', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['profile:read', 'user:read_self']
}), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取用户权限信息
router.get('/:id/permissions', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:read'],
  allowSelf: true
}), async (req, res) => {
  try {
    const { id } = req.params;

    // 检查权限：只有管理员或用户自己可以查看
    if (req.user?.id !== id && !req.userPermissions?.includes('system:admin')) {
      const hasPermission = await permissionService.checkPermission({
        user: req.user!,
        action: 'read',
        resource: 'user',
        targetUserId: id
      });
      
      if (!hasPermission.hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
    }

    const userPermissions = await permissionService.getUserEffectivePermissions(id);

    res.json({
      success: true,
      data: userPermissions
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取单个用户
router.get('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:read'],
  allowSelf: true
}), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建用户
router.post('/', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:create']
}), async (req, res) => {
  try {
    const userData: CreateUserRequest = req.body;

    // 验证必填字段
    if (!userData.username || !userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, email, password'
      });
    }

    // 检查用户名是否已存在
    if (await userModel.existsByUsername(userData.username)) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // 检查邮箱是否已存在
    if (await userModel.existsByEmail(userData.email)) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // 验证角色是否存在
    if (userData.roles && userData.roles.length > 0) {
      for (const roleId of userData.roles) {
        if (!(await roleModel.exists(roleId))) {
          return res.status(400).json({
            success: false,
            message: `Role ${roleId} does not exist`
          });
        }
      }
    }

    // 验证部门是否存在
    if (userData.departmentId && !(await departmentModel.exists(userData.departmentId))) {
      return res.status(400).json({
        success: false,
        message: 'Department does not exist'
      });
    }

    // 验证组是否存在
    if (userData.groupId && !(await groupModel.exists(userData.groupId))) {
      return res.status(400).json({
        success: false,
        message: 'Group does not exist'
      });
    }

    // 验证职级是否存在
    if (userData.jobLevelId && !(await jobLevelModel.exists(userData.jobLevelId))) {
      return res.status(400).json({
        success: false,
        message: 'Job level does not exist'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await userModel.create({
      ...userData,
      password: hashedPassword
    });

    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新用户
router.put('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:update'],
  allowSelf: true
}), async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateUserRequest = req.body;

    // 检查用户是否存在
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 如果不是管理员且不是更新自己的信息，检查权限
    if (req.user?.id !== id && !req.userPermissions?.includes('system:admin')) {
      const hasPermission = await permissionService.checkPermission({
        user: req.user!,
        action: 'update',
        resource: 'user',
        targetUserId: id
      });
      
      if (!hasPermission.hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
    }

    // 如果更新用户名，检查是否已被使用
    if (updates.username && updates.username !== existingUser.username) {
      if (await userModel.existsByUsername(updates.username)) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // 如果更新邮箱，检查是否已被使用
    if (updates.email && updates.email !== existingUser.email) {
      if (await userModel.existsByEmail(updates.email)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // 验证角色是否存在
    if (updates.roles) {
      for (const roleId of updates.roles) {
        if (!(await roleModel.exists(roleId))) {
          return res.status(400).json({
            success: false,
            message: `Role ${roleId} does not exist`
          });
        }
      }
    }

    // 验证部门是否存在
    if (updates.departmentId && !(await departmentModel.exists(updates.departmentId))) {
      return res.status(400).json({
        success: false,
        message: 'Department does not exist'
      });
    }

    // 验证组是否存在
    if (updates.groupId && !(await groupModel.exists(updates.groupId))) {
      return res.status(400).json({
        success: false,
        message: 'Group does not exist'
      });
    }

    // 验证职级是否存在
    if (updates.jobLevelId && !(await jobLevelModel.exists(updates.jobLevelId))) {
      return res.status(400).json({
        success: false,
        message: 'Job level does not exist'
      });
    }

    // 如果更新密码，需要加密
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await userModel.update(id, updates);

    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除用户
router.delete('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:delete']
}), async (req, res) => {
  try {
    const { id } = req.params;

    // 检查用户是否存在
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 不能删除自己
    if (req.user?.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    const deleted = await userModel.delete(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取用户统计
router.get('/stats/overview', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['user:read']
}), async (req, res) => {
  try {
    const allUsers = await userModel.findAll();
    const activeUsers = await userModel.getActiveUsers();

    const stats = {
      total: allUsers.length,
      active: activeUsers.length,
      inactive: allUsers.length - activeUsers.length,
      byDepartment: {} as Record<string, number>,
      byJobLevel: {} as Record<string, number>,
      byRole: {} as Record<string, number>
    };

    // 按部门统计
    allUsers.forEach(user => {
      if (user.departmentId) {
        stats.byDepartment[user.departmentId] = (stats.byDepartment[user.departmentId] || 0) + 1;
      }
    });

    // 按职级统计
    allUsers.forEach(user => {
      if (user.jobLevelId) {
        stats.byJobLevel[user.jobLevelId] = (stats.byJobLevel[user.jobLevelId] || 0) + 1;
      }
    });

    // 按角色统计
    allUsers.forEach(user => {
      user.roles.forEach(roleId => {
        stats.byRole[roleId] = (stats.byRole[roleId] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;