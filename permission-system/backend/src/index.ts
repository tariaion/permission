import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './routes/auth';
import roleRoutes from './routes/role';
import permissionRoutes from './routes/permission';
import { AuthService } from './services/auth';

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

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '权限系统API运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
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
    
    const existingAdmin = await authService.getAllUsers();
    if (existingAdmin.length === 0) {
      console.log('创建默认管理员账户...');
      await authService.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        roles: [],
      });
      console.log('默认管理员账户创建完成');
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