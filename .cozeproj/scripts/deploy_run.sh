set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

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

kill_backend_if_running() {
    local backend_pids
    backend_pids=$(ps aux | grep "node.*dist/index.js" | grep -v grep | awk '{print $2}' | paste -sd' ' - || true)
    if [[ -n "${backend_pids}" ]]; then
      echo "Killing backend processes: ${backend_pids}"
      echo "${backend_pids}" | xargs -I {} kill -9 {}
      sleep 1
    fi
}

start_services() {
    cd "$WORK_DIR/permission-system"
    
    # 启动后端服务（在后台）
    echo "Starting backend service..."
    cd backend
    nohup node dist/index.js > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    
    # 等待后端启动
    sleep 2
    
    # 构建前端静态文件并使用简单HTTP服务器
    echo "Building and starting frontend static server..."
    cd ../frontend
    npm run build
    
    # 使用Python创建简单的静态文件服务器
    nohup python3 -m http.server ${DEPLOY_RUN_PORT} --directory dist --bind 0.0.0.0 > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend static server started with PID: $FRONTEND_PID on port ${DEPLOY_RUN_PORT}"
    
    # 等待服务启动
    sleep 3
    
    echo "Services started successfully!"
    echo "Backend is running on: http://localhost:3001"
    echo "Frontend is running on: http://localhost:${DEPLOY_RUN_PORT}"
    echo ""
    echo "Available API endpoints:"
    echo "- POST http://localhost:3001/api/auth/login"
    echo "- POST http://localhost:3001/api/auth/register"
    echo "- GET  http://localhost:3001/api/auth/me"
    echo "- POST http://localhost:3001/api/auth/logout"
    echo "- GET  http://localhost:3001/api/users"
    echo "- GET  http://localhost:3001/api/users/:id"
    echo "- PUT  http://localhost:3001/api/users/:id"
    echo "- DELETE http://localhost:3001/api/users/:id"
    echo "- GET  http://localhost:3001/api/roles"
    echo "- POST http://localhost:3001/api/roles"
    echo "- GET  http://localhost:3001/api/roles/:id"
    echo "- PUT  http://localhost:3001/api/roles/:id"
    echo "- DELETE http://localhost:3001/api/roles/:id"
    echo "- GET  http://localhost:3001/api/permissions"
    echo "- POST http://localhost:3001/api/permissions"
    echo "- GET  http://localhost:3001/api/permissions/:id"
    echo "- PUT  http://localhost:3001/api/permissions/:id"
    echo "- DELETE http://localhost:3001/api/permissions/:id"
}

echo "Clearing processes and ports..."
kill_port_if_listening
kill_backend_if_running
echo "Starting services on port ${DEPLOY_RUN_PORT} for deploy..."
start_services