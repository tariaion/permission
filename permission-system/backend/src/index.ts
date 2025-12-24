import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './routes/auth';
import roleRoutes from './routes/role';
import permissionRoutes from './routes/permissions';
import jobLevelRoutes from './routes/job-levels';
import userRoutes from './routes/users';
import groupRoutes from './routes/group';
import departmentRoutes from './routes/department';
import { AuthService } from './services/auth';
import { DepartmentModel } from './models/department';
import { GroupModel } from './models/group';
import { PermissionModel } from './models/permission';
import { RoleModel } from './models/role';
import { JobLevelModel } from './models/job-level';

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/job-levels', jobLevelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '权限系统API运行正常',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API端点不存在',
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  });
});

const initializeDefaultData = async (): Promise<void> => {
  try {
    console.log('正在初始化默认数据...');

    const authService = new AuthService();
    const departmentModel = new DepartmentModel();
    const groupModel = new GroupModel();
    const permissionModel = new PermissionModel();
    const roleModel = new RoleModel();
    const jobLevelModel = new JobLevelModel();
    
    // 初始化系统权限
    console.log('初始化系统权限...');
    await permissionModel.initializeSystemPermissions();
    
    // 初始化系统角色
    console.log('初始化系统角色...');
    await roleModel.initializeSystemRoles();
    
    // 创建默认职级
    console.log('创建默认职级...');
    const existingJobLevels = await jobLevelModel.findAll();
    if (existingJobLevels.length === 0) {
      await jobLevelModel.create({
        name: '实习生',
        code: 'intern',
        level: 1,
        description: '实习生职级'
      });
      
      await jobLevelModel.create({
        name: '初级工程师',
        code: 'junior_engineer',
        level: 2,
        description: '初级工程师职级'
      });
      
      await jobLevelModel.create({
        name: '中级工程师',
        code: 'middle_engineer',
        level: 3,
        description: '中级工程师职级'
      });
      
      await jobLevelModel.create({
        name: '高级工程师',
        code: 'senior_engineer',
        level: 4,
        description: '高级工程师职级'
      });
      
      await jobLevelModel.create({
        name: '技术专家',
        code: 'tech_expert',
        level: 5,
        description: '技术专家职级'
      });
      
      await jobLevelModel.create({
        name: '架构师',
        code: 'architect',
        level: 6,
        description: '架构师职级'
      });
    }
    
    const users = await authService.getAllUsers();
    if (users.length === 0) {
      console.log('创建默认管理员账户...');
      
      // 获取超级管理员角色
      const adminRole = await roleModel.findByCode('super_admin');
      
      await authService.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        roles: adminRole ? [adminRole.id] : [],
        jobLevelId: (await jobLevelModel.findByCode('architect'))?.id,
      }, { 
        id: '', 
        username: 'system', 
        email: '', 
        password: '', 
        roles: [], 
        directPermissions: [],
        createdAt: new Date(), 
        updatedAt: new Date(), 
        isActive: true 
      });
      console.log('默认管理员账户创建完成');
    }

    // 创建默认部门和组
    const departments = await departmentModel.findAll();
    if (departments.length === 0) {
      console.log('创建默认部门...');
      const techDept = await departmentModel.create({
        name: '技术部',
        code: 'tech',
        description: '负责技术研发和维护',
      });
      
      console.log('创建默认组...');
      await groupModel.create({
        name: '前端组',
        code: 'frontend',
        description: '负责前端开发',
        departmentId: techDept.id,
      });
      
      await groupModel.create({
        name: '后端组',
        code: 'backend',
        description: '负责后端开发',
        departmentId: techDept.id,
      });
      
      console.log('默认部门和组创建完成');
    }

    console.log('默认数据初始化完成');
  } catch (error) {
    console.error('初始化默认数据失败:', error);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await initializeDefaultData();
    
    app.listen(config.port, () => {
      console.log(`权限系统API服务器运行在端口 ${config.port}`);
      console.log(`环境: ${config.nodeEnv}`);
      console.log(`健康检查: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;