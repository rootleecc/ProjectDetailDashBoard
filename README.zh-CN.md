# 项目详情仪表板

一个现代化的 Web 应用，用于实时监控和分析项目数据，提供交互式仪表板和数据可视化功能。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图表**: Chart.js + React-Chartjs-2
- **Excel 处理**: XLSX
- **图标**: Lucide React
- **类型检查**: TypeScript

## 功能特性

- 📊 交互式仪表板
  - 开发状态和测试状态优先展示
  - 支持饼图和柱状图可视化
  - 实时数据统计和百分比显示
- 💾 仪表板管理
  - 保存多个仪表板配置
  - 快速切换已保存的仪表板
  - 删除不需要的仪表板
- 🔍 数据分析功能
  - 项目状态追踪
  - 需求审批流程
  - SME 评审状态
  - 开发进度监控
  - 测试状态跟踪
  - UAT 延期管理
  - CMAN 包管理（FS/SEC）
  - ServiceNow 变更记录
- 📈 数据可视化
  - 多维度数据展示
  - 实时搜索和过滤
  - 详细的数据表格视图
- 💻 用户友好界面
  - 现代化设计
  - 响应式布局
  - 直观的操作流程
- 📤 数据导出
  - 导出为 Excel 格式
  - 保留所有数据和格式

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

4. 预览生产构建：
```bash
npm run preview
```

## 使用指南

### 导入数据
1. 点击"导入项目数据"按钮
2. 选择 Excel 文件（支持 .xlsx, .xls, .csv 格式）
3. 系统自动解析并展示数据

### 保存仪表板
1. 导入数据后，点击"保存仪表板"按钮
2. 系统自动保存当前视图配置
3. 可在下拉菜单中查看所有保存的仪表板

### 管理仪表板
1. 使用顶部下拉菜单切换不同的仪表板
2. 点击删除图标可移除不需要的仪表板
3. 可随时导入新数据更新现有仪表板

### 数据分析
1. 使用搜索框过滤特定项目或状态
2. 查看各个维度的数据分布
3. 通过图表直观了解项目进展
4. 在数据表格中查看详细信息

### 导出报告
1. 点击"导出报告"按钮
2. 自动下载包含当前视图数据的 Excel 文件
3. 可用于离线分析或分享

## RHEL 8 部署指南

### 系统要求
- RHEL 8 或更高版本
- Node.js 18 或更高版本
- Nginx 1.14 或更高版本
- 2GB 以上内存
- 10GB 以上磁盘空间

### 安装必要软件
1. 安装 Node.js：
```bash
# 添加 NodeSource 仓库
dnf module enable nodejs:18
dnf module install nodejs:18

# 验证安装
node --version
npm --version
```

2. 安装 Nginx：
```bash
dnf install nginx
```

### 应用部署步骤

1. 创建应用目录：
```bash
mkdir -p /var/www/project-dashboard
cd /var/www/project-dashboard
```

2. 上传项目文件：
```bash
# 使用 SCP 或其他方式上传项目文件
# 示例：
scp -r * user@server:/var/www/project-dashboard/
```

3. 安装依赖并构建：
```bash
cd /var/www/project-dashboard
npm install
npm run build
```

4. 配置 Nginx：
```bash
# 创建 Nginx 配置文件
cat > /etc/nginx/conf.d/project-dashboard.conf << 'EOL'
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/project-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOL
```

5. 启动服务：
```bash
# 测试 Nginx 配置
nginx -t

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 配置防火墙
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### SELinux 配置
如果启用了 SELinux，需要配置适当的权限：
```bash
# 允许 Nginx 访问网络
setsebool -P httpd_can_network_connect 1

# 设置正确的文件上下文
semanage fcontext -a -t httpd_sys_content_t "/var/www/project-dashboard/dist(/.*)?"
restorecon -Rv /var/www/project-dashboard/dist
```

### 监控和维护
1. 日志位置：
   - Nginx 访问日志：`/var/log/nginx/access.log`
   - Nginx 错误日志：`/var/log/nginx/error.log`

2. 性能优化：
   - 启用 Nginx 缓存
   - 配置合适的 worker_processes
   - 优化静态资源压缩

3. 安全加固：
   - 配置 SSL/TLS
   - 启用 HTTP/2
   - 设置安全响应头
   - 定期更新系统和依赖包

### 故障排除
1. 检查服务状态：
```bash
systemctl status nginx
```

2. 检查日志：
```bash
tail -f /var/log/nginx/error.log
```

3. 检查权限：
```bash
ls -la /var/www/project-dashboard
```

4. SELinux 问题：
```bash
ausearch -m AVC -ts recent
```