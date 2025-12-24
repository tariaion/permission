import { Router } from 'express';
import { JobLevelModel } from '../models/job-level';
import { CreateJobLevelRequest, UpdateJobLevelRequest } from '../types/shared';
import { routePermissionMiddleware } from '../middleware/route-permission';

const router = Router();
const jobLevelModel = new JobLevelModel();

// 获取所有职级
router.get('/', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['job_level:read']
}), async (req, res) => {
  try {
    const { active, minLevel, maxLevel, search } = req.query;
    let jobLevels;

    if (search) {
      jobLevels = await jobLevelModel.searchJobLevels(search as string);
    } else if (minLevel && maxLevel) {
      jobLevels = await jobLevelModel.getJobLevelsByLevelRange(
        parseInt(minLevel as string), 
        parseInt(maxLevel as string)
      );
    } else if (active === 'true') {
      jobLevels = await jobLevelModel.getActiveJobLevels();
    } else {
      jobLevels = await jobLevelModel.findAll();
    }

    // 按级别排序
    jobLevels.sort((a, b) => a.level - b.level);

    res.json({
      success: true,
      data: jobLevels
    });
  } catch (error) {
    console.error('Get job levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job levels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取单个职级
router.get('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['job_level:read']
}), async (req, res) => {
  try {
    const { id } = req.params;
    const jobLevel = await jobLevelModel.findById(id);

    if (!jobLevel) {
      return res.status(404).json({
        success: false,
        message: 'Job level not found'
      });
    }

    res.json({
      success: true,
      data: jobLevel
    });
  } catch (error) {
    console.error('Get job level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job level',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建职级
router.post('/', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['job_level:create']
}), async (req, res) => {
  try {
    const jobLevelData: CreateJobLevelRequest = req.body;

    // 验证必填字段
    if (!jobLevelData.name || !jobLevelData.code || jobLevelData.level === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, code, level'
      });
    }

    // 检查代码是否已存在
    if (await jobLevelModel.existsByCode(jobLevelData.code)) {
      return res.status(409).json({
        success: false,
        message: 'Job level code already exists'
      });
    }

    // 检查级别是否已存在
    if (await jobLevelModel.existsByLevel(jobLevelData.level)) {
      return res.status(409).json({
        success: false,
        message: 'Job level already exists for this level'
      });
    }

    const jobLevel = await jobLevelModel.create(jobLevelData);

    res.status(201).json({
      success: true,
      data: jobLevel,
      message: 'Job level created successfully'
    });
  } catch (error) {
    console.error('Create job level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job level',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新职级
router.put('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['job_level:update']
}), async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateJobLevelRequest = req.body;

    // 检查职级是否存在
    const existingJobLevel = await jobLevelModel.findById(id);
    if (!existingJobLevel) {
      return res.status(404).json({
        success: false,
        message: 'Job level not found'
      });
    }

    // 如果更新代码，检查新代码是否已被使用
    if (updates.code && updates.code !== existingJobLevel.code) {
      if (await jobLevelModel.existsByCode(updates.code)) {
        return res.status(409).json({
          success: false,
          message: 'Job level code already exists'
        });
      }
    }

    // 如果更新级别，检查新级别是否已被使用
    if (updates.level !== undefined && updates.level !== existingJobLevel.level) {
      if (await jobLevelModel.existsByLevel(updates.level)) {
        return res.status(409).json({
          success: false,
          message: 'Job level already exists for this level'
        });
      }
    }

    const jobLevel = await jobLevelModel.update(id, updates);

    res.json({
      success: true,
      data: jobLevel,
      message: 'Job level updated successfully'
    });
  } catch (error) {
    console.error('Update job level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job level',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除职级
router.delete('/:id', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['job_level:delete']
}), async (req, res) => {
  try {
    const { id } = req.params;

    // 检查职级是否存在
    const existingJobLevel = await jobLevelModel.findById(id);
    if (!existingJobLevel) {
      return res.status(404).json({
        success: false,
        message: 'Job level not found'
      });
    }

    // TODO: 检查是否有用户使用此职级
    // const userModel = new UserModel();
    // const usersWithJobLevel = await userModel.getUsersByJobLevel(id);
    // if (usersWithJobLevel.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Cannot delete job level: users are assigned to this level'
    //   });
    // }

    const deleted = await jobLevelModel.delete(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete job level'
      });
    }

    res.json({
      success: true,
      message: 'Job level deleted successfully'
    });
  } catch (error) {
    console.error('Delete job level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job level',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取职级统计
router.get('/stats/overview', routePermissionMiddleware.requirePermissions({
  requiredPermissions: ['job_level:read']
}), async (req, res) => {
  try {
    const allJobLevels = await jobLevelModel.findAll();
    const activeJobLevels = await jobLevelModel.getActiveJobLevels();

    const stats = {
      total: allJobLevels.length,
      active: activeJobLevels.length,
      inactive: allJobLevels.length - activeJobLevels.length,
      levelRange: {
        min: Math.min(...allJobLevels.map(jl => jl.level)),
        max: Math.max(...allJobLevels.map(jl => jl.level))
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get job level stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job level statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;