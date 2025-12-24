import { Router } from 'express';
import { DepartmentService } from '../services/department';
import { authenticateToken } from '../middleware/auth';
import { PermissionChecker } from '../services/permission-checker';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const departmentService = new DepartmentService();
const permissionChecker = new PermissionChecker();

// 创建部门验证schema
const createDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  leaderId: Joi.string().optional(),
});

// 更新部门验证schema
const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  leaderId: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// 获取所有部门
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const departments = await departmentService.getAllDepartments(user);
    
    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error('获取部门列表失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取部门列表失败',
    });
  }
});

// 获取单个部门
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const department = await departmentService.getDepartmentById(id, user);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: '部门不存在',
      });
    }
    
    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('获取部门信息失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取部门信息失败',
    });
  }
});

// 创建部门
router.post('/', authenticateToken, validateRequest(createDepartmentSchema), async (req, res) => {
  try {
    const user = req.user;
    await permissionChecker.checkAndThrow(user, 'departments', 'create');
    
    const department = await departmentService.createDepartment(req.body);
    
    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('创建部门失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '创建部门失败',
    });
  }
});

// 更新部门
router.put('/:id', authenticateToken, validateRequest(updateDepartmentSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const department = await departmentService.updateDepartment(id, req.body, user);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: '部门不存在',
      });
    }
    
    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('更新部门失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '更新部门失败',
    });
  }
});

// 删除部门
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const deleted = await departmentService.deleteDepartment(id, user);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '部门不存在',
      });
    }
    
    res.json({
      success: true,
      message: '部门删除成功',
    });
  } catch (error) {
    console.error('删除部门失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '删除部门失败',
    });
  }
});

export default router;