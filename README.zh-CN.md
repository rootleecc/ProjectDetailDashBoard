# Excel 文件查看器

一个用于查看和分析 Excel 文件的现代化 Web 应用，具有交互式仪表板和数据可视化功能。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图表**: Chart.js + React-Chartjs-2
- **Excel 处理**: XLSX
- **图标**: Lucide React
- **类型检查**: TypeScript

## 功能特性

- 📊 交互式仪表板（饼图和柱状图）
- 📑 多工作表支持
- 🔍 实时搜索功能
- 📈 数据可视化，包括：
  - 项目状态
  - 需求审批
  - SME 评审
  - 开发状态
  - 测试状态
  - UAT 延期
  - CMAN 包（FS/SEC）
  - ServiceNow 变更
- 💾 导出修改后的数据
- 📱 响应式设计

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

## ECS 部署指南

### 前置条件

1. 在 AWS 账户中设置 ECS 集群
2. 配置应用负载均衡器（ALB）
3. 创建用于容器镜像的 ECR 仓库

### Docker 配置

1. 在项目根目录创建 Dockerfile：
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 创建 nginx.conf 用于路由：
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 部署步骤

1. 构建并标记 Docker 镜像：
```bash
docker build -t excel-viewer .
docker tag excel-viewer:latest [ECR_REGISTRY]/excel-viewer:latest
```

2. 推送到 ECR：
```bash
aws ecr get-login-password --region [REGION] | docker login --username AWS --password-stdin [ECR_REGISTRY]
docker push [ECR_REGISTRY]/excel-viewer:latest
```

3. 更新 ECS 任务定义：
- 设置容器镜像为你的 ECR 镜像
- 配置内存和 CPU 要求
- 映射 80 端口

4. 更新 ECS 服务：
- 选择新的任务定义
- 配置所需任务数量
- 设置 ALB 目标组

### CI/CD 流水线（可选）

使用 AWS CodePipeline，包含：
1. 源：GitHub 仓库
2. 构建：AWS CodeBuild
3. 部署：AWS ECS

CodeBuild buildspec.yml 示例：
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
      - REPOSITORY_URI=$ECR_REGISTRY/excel-viewer
      - IMAGE_TAG=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
  build:
    commands:
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  post_build:
    commands:
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - printf '{"ImageURI":"%s"}' $REPOSITORY_URI:$IMAGE_TAG > imageDefinitions.json
artifacts:
  files:
    - imageDefinitions.json
```

### 监控

1. 设置 CloudWatch 指标监控：
   - 容器洞察
   - ALB 指标
   - 目标组健康状况

2. 配置告警：
   - CPU/内存使用率过高
   - 错误率
   - 响应时间

### 安全考虑

1. 使用安全组控制流量
2. 在 ALB 上启用 AWS WAF
3. 使用 SSL/TLS 证书实现 HTTPS
4. 实施适当的 IAM 角色和策略