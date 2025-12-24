#!/bin/bash
set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$WORK_DIR/permission-system/backend"

echo "开始构建后端项目..."
echo "工作目录: $WORK_DIR"

# 检查Node.js版本
echo "检查Node.js版本..."
node --version
npm --version

# 清理之前的构建
echo "清理之前的构建..."
rm -rf dist node_modules/.cache

# 安装依赖
echo "安装后端依赖..."
npm install

# 构建项目
echo "构建后端项目..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 后端构建成功"
    echo "构建产物目录: $WORK_DIR/backend/dist"
else
    echo "❌ 后端构建失败"
    exit 1
fi

# 验证构建产物
echo "验证构建产物..."
ls -la dist/

echo "后端构建完成"