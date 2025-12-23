# 权限管理系统

一个基于 RBAC（基于角色的访问控制）的完整权限管理系统，使用 Node.js + Express + TypeScript 后端，React + TypeScript + Vite 前端，JSON 文件数据存储。

## 系统架构

### 后端技术栈
- **Node.js** + **Express** - Web 框架
- **TypeScript** - 类型安全的 JavaScript
- **Rollup** - 模块打包工具
- **JSON 文件存储** - 轻量级数据持久化
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **Joi** - 数据验证

### 前端技术栈
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design** - UI 组件库
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

## 项目结构

```
permission-system/
├── backend/                 # 后端应用
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑
│   │   ├── types/          # 类型定义
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 应用入口
│   ├── data/               # JSON 数据文件
│   ├── package.json
│   ├── rollup.config.js
│   └── tsconfig.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── hooks/          # 自定义 hooks
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── types/          # 类型定义
│   │   ├── App.tsx         # 应用根组件
│   │   └── main.tsx        # 入口文件
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── shared/                 # 共享类型和工具
│   ├── types/
│   └── index.ts
└── package.json           # 根目录配置
```

## 核心功能

### 用户管理
- 用户注册、登录、注销
- 用户信息管理（增删改查）
- 密码修改
- 用户状态管理（启用/禁用）

### 角色管理
- 角色创建、编辑、删除
- 角色权限分配
- 角色与用户关联

### 权限管理
- 细粒度权限控制（资源:操作）
- 权限创建、编辑、删除
- 权限与角色关联

### 安全特性
- JWT Token 认证
- 密码加密存储
- 基于角色的访问控制（RBAC）
- API 权限中间件
- 请求参数验证

## API 接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户注销
- `GET /api/auth/me` - 获取当前用户信息

### 用户管理
- `GET /api/auth/users` - 获取用户列表
- `POST /api/auth/users` - 创建用户
- `GET /api/auth/users/:id` - 获取用户详情
- `PUT /api/auth/users/:id` - 更新用户信息
- `DELETE /api/auth/users/:id` - 删除用户

### 角色管理
- `GET /api/roles` - 获取角色列表
- `POST /api/roles` - 创建角色
- `GET /api/roles/:id` - 获取角色详情
- `PUT /api/roles/:id` - 更新角色信息
- `DELETE /api/roles/:id` - 删除角色
- `GET /api/roles/:id/permissions` - 获取角色权限

### 权限管理
- `GET /api/permissions` - 获取权限列表
- `POST /api/permissions` - 创建权限
- `GET /api/permissions/:id` - 获取权限详情
- `PUT /api/permissions/:id` - 更新权限信息
- `DELETE /api/permissions/:id` - 删除权限

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 生产环境运行
```bash
npm start
```

## 默认账户

系统会自动创建一个默认管理员账户：
- 用户名：admin
- 密码：admin123

## 环境变量

后端支持以下环境变量配置：

- `PORT` - 服务端口（默认：3001）
- `NODE_ENV` - 运行环境（默认：development）
- `JWT_SECRET` - JWT 密钥
- `JWT_EXPIRES_IN` - JWT 过期时间（默认：24h）
- `CORS_ORIGIN` - CORS 允许的源
- `BCRYPT_ROUNDS` - bcrypt 加密轮数（默认：12）
- `DATA_DIR` - 数据存储目录（默认：./data）

## 部署

项目包含自动化部署脚本：

- `deploy_build.sh` - 构建项目
- `deploy_run.sh` - 启动服务

## 扩展性设计

### 数据存储扩展
- 当前使用 JSON 文件存储，便于开发和演示
- 可以轻松扩展为数据库存储（MySQL、PostgreSQL、MongoDB 等）
- 数据模型层抽象，存储层可插拔

### 权限模型扩展
- 支持更复杂的权限模型（ABAC、ACL 等）
- 支持权限继承和层级结构
- 支持动态权限和临时权限

### 功能扩展
- 支持多租户架构
- 支持权限审计日志
- 支持批量操作
- 支持权限导入导出

## 许可证

MIT License