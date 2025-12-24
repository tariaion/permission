#!/bin/bash
set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$WORK_DIR/permission-system/backend"

echo "简化启动权限系统服务..."
echo "工作目录: $WORK_DIR"
echo "后端目录: $BACKEND_DIR"

cd "$BACKEND_DIR"

# 设置环境变量
export NODE_ENV=production
export PORT=${DEPLOY_RUN_PORT}

echo "端口: ${PORT}"
echo "环境: ${NODE_ENV}"

# 简化启动 - 直接运行
node dist/index.js