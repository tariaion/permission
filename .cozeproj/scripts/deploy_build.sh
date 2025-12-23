set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "Working directory: $WORK_DIR"

# 构建共享模块
echo "Building shared module..."
cd "$WORK_DIR/permission-system/shared"
npm install
npm run build

# 构建后端
echo "Building backend..."
cd "$WORK_DIR/permission-system/backend"
npm install
npm run build

# 构建前端
echo "Building frontend..."
cd "$WORK_DIR/permission-system/frontend"
npm install
npm run build

echo "Build completed successfully!"