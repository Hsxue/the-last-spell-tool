#!/bin/bash
# ============================================================
# deploy.sh - 一键构建并部署到远程服务器 (nginx)
# ============================================================
# 用法:
#   ./deploy.sh                 # 使用默认配置部署
#   ./deploy.sh --build-only    # 仅本地构建，不部署
# ============================================================

set -euo pipefail

# -----------------------------
# 配置区域 (修改这里)
# -----------------------------
REMOTE_USER="root"                    # SSH 用户名
REMOTE_HOST="8.138.26.11"          # 服务器 IP 或域名
REMOTE_PORT="22"                      # SSH 端口
REMOTE_PATH="/var/www/webdev2"        # 远程部署目录
NGINX_CONF_PATH="/etc/nginx/conf.d"   # nginx 配置目录
DOMAIN="your-domain.com"              # 域名 (可选，留空则用 IP)
# -----------------------------

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查是否仅构建
BUILD_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --build-only) BUILD_ONLY=true ;;
  esac
done

# 检查必要命令
check_dependencies() {
  local deps=("npm" "ssh" "scp")
  for dep in "${deps[@]}"; do
    if ! command -v "$dep" &> /dev/null; then
      log_error "缺少依赖: $dep"
      exit 1
    fi
  done
  log_info "依赖检查通过"
}

# 构建项目
build_project() {
  log_info "开始构建项目..."
  npm install
  npm run build
  log_info "构建完成，产物在 dist/ 目录"
  
  # 验证构建产物
  if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    log_error "构建产物异常"
    exit 1
  fi
}

# 生成 nginx 配置
generate_nginx_config() {
  local server_name="${DOMAIN:-$REMOTE_HOST}"
  
  cat > nginx.conf <<EOF
server {
    listen 80;
    server_name ${server_name};
    
    root ${REMOTE_PATH};
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA 路由支持 - 所有路由回退到 index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
  log_info "nginx 配置已生成: nginx.conf"
}

# 部署到远程服务器
deploy_to_remote() {
  log_info "开始部署到 ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}..."
  
  # SSH 连接测试
  if ! ssh -p "$REMOTE_PORT" -o ConnectTimeout=5 "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH连接成功'" &> /dev/null; then
    log_error "无法连接到远程服务器，请检查配置"
    exit 1
  fi
  
  # 创建远程目录
  ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "sudo mkdir -p ${REMOTE_PATH}"
  
  # 上传构建产物
  log_info "上传构建产物..."
  scp -P "$REMOTE_PORT" -r dist/* "$REMOTE_USER@$REMOTE_HOST:${REMOTE_PATH}/"
  
  # 设置权限
  ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "sudo chown -R www-data:www-data ${REMOTE_PATH} 2>/dev/null || sudo chown -R nginx:nginx ${REMOTE_PATH} 2>/dev/null || true"
  
  # 部署 nginx 配置
  log_info "部署 nginx 配置..."
  generate_nginx_config
  
  # 上传并启用 nginx 配置
  scp -P "$REMOTE_PORT" nginx.conf "$REMOTE_USER@$REMOTE_HOST:/tmp/webdev2-nginx.conf"
  ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "sudo mv /tmp/webdev2-nginx.conf ${NGINX_CONF_PATH}/webdev2.conf"
  
  # 测试并重启 nginx
  log_info "重启 nginx..."
  ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "sudo nginx -t && sudo systemctl reload nginx"
  
  log_info "部署完成!"
  log_info "访问地址: http://${DOMAIN:-$REMOTE_HOST}"
  
  # 清理临时文件
  rm -f nginx.conf
}

# 主流程
main() {
  echo "============================================"
  echo "  The Last Spell - WebDev2 部署脚本"
  echo "============================================"
  echo ""
  
  check_dependencies
  
  if [ "$BUILD_ONLY" = true ]; then
    build_project
    log_info "仅构建模式，跳过远程部署"
    exit 0
  fi
  
  # 检查配置是否已修改
  if [[ "$REMOTE_HOST" == "your-server-ip" ]]; then
    log_error "请先修改脚本中的服务器配置 (REMOTE_HOST, REMOTE_USER 等)"
    exit 1
  fi
  
  build_project
  deploy_to_remote
  
  echo ""
  log_info "🎉 部署成功!"
}

main "$@"
