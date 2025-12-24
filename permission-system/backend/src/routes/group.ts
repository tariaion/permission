import { Router } from 'express';
import { GroupService } from '../services/group';
import { authenticateToken } from '../middleware/auth';
import { PermissionChecker } from '../services/permission-checker';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const groupService = new GroupService();
const permissionChecker = new PermissionChecker();

// 创建组验证schema
const createGroupSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  departmentId: Joi.string().required(),
  leaderId: Joi.string().optional(),
});

// 更新组验证schema
const updateGroupSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  leaderId: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// 获取所有组
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const groups = await groupService.getAllGroups(user);
    
    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('获取组列表失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取组列表失败',
    });
  }
});

// 获取单个组
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const group = await groupService.getGroupById(id, user);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: '组不存在',
      });
    }
    
    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('获取组信息失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取组信息失败',
    });
  }
});

// 创建组
router.post('/', authenticateToken, validateRequest(createGroupSchema), async (req, res) => {
  try {
    const user = req.user;
    await permissionChecker.checkAndThrow(user, 'groups', 'create');
    
    const group = await groupService.createGroup(req.body);
    
    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('创建组失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '创建组失败',
    });
  }
});

// 更新组
router.put('/:id', authenticateToken, validateRequest(updateGroupSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const group = await groupService.updateGroup(id, req.body, user);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: '组不存在',
      });
    }
    
    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('更新组失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '更新组失败',
    });
  }
});

// 删除组
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const deleted = await groupService.deleteGroup(id, user);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '组不存在',
      });
    }
    
    res.json({
      success: true,
      message: '组删除成功',
    });
  } catch (error) {
    console.error('删除组失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '删除组失败',
    });
  }
});

// 获取指定部门的组
router.get('/department/:departmentId', authenticateToken, async (req, res) => {
  try {
    const { departmentId } = req.params;
    const user = req.user;
    
    const groups = await groupService.getGroupsByDepartment(departmentId, user);
    
    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('获取部门组失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取部门组失败',
    });
  }
});

export default router;