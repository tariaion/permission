#!/bin/bash
set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$WORK_DIR/permission-system/backend"

echo "开始启动权限系统服务..."
echo "工作目录: $WORK_DIR"
echo "后端目录: $BACKEND_DIR"

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

start_service() {
    cd "$BACKEND_DIR"
    
    echo "设置环境变量..."
    export NODE_ENV=production
    export PORT=${DEPLOY_RUN_PORT}
    
    echo "检查dist目录..."
    if [ ! -d "dist" ]; then
        echo "❌ dist目录不存在，请先运行构建脚本"
        exit 1
    fi
    
    echo "启动后端服务..."
    echo "端口: ${DEPLOY_RUN_PORT}"
    echo "环境: ${NODE_ENV}"
    
    # 使用Node.js运行构建后的代码
    node dist/index.js
}

echo "清理端口 ${DEPLOY_RUN_PORT}..."
kill_port_if_listening

echo "启动HTTP服务..."
start_service