set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "开始构建权限管理系统..."

echo "安装后端依赖..."
cd "$WORK_DIR/permission-system/backend"
npm install

echo "构建后端..."
npm run build

echo "安装前端依赖..."
cd "$WORK_DIR/permission-system/frontend"
npm install

echo "构建前端..."
npm run build

echo "构建共享模块..."
cd "$WORK_DIR/permission-system/shared"
npm install
npm run build

echo "项目构建完成！"