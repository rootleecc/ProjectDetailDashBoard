# Excel Viewer

A modern web application for viewing and analyzing Excel files with interactive dashboards and data visualization.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React-Chartjs-2
- **Excel Processing**: XLSX
- **Icons**: Lucide React
- **Type Checking**: TypeScript

## Features

- 📊 Interactive dashboards with pie and bar charts
- 📑 Multiple sheet support
- 🔍 Real-time search functionality
- 📈 Data visualization for:
  - Project Status
  - Requirements Approval
  - SME Reviews
  - Development Status
  - Testing Status
  - UAT Extensions
  - CMAN Packages (FS/SEC)
  - ServiceNow Changes
- 💾 Export modified data
- 📱 Responsive design

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## ECS Deployment Guide

### Prerequisites

1. Set up an ECS cluster in your AWS account
2. Configure an Application Load Balancer (ALB)
3. Create an ECR repository for the container image

### Docker Configuration

1. Create a Dockerfile in the project root:
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

2. Create nginx.conf for routing:
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

### Deployment Steps

1. Build and tag Docker image:
```bash
docker build -t excel-viewer .
docker tag excel-viewer:latest [ECR_REGISTRY]/excel-viewer:latest
```

2. Push to ECR:
```bash
aws ecr get-login-password --region [REGION] | docker login --username AWS --password-stdin [ECR_REGISTRY]
docker push [ECR_REGISTRY]/excel-viewer:latest
```

3. Update ECS Task Definition:
- Set container image to your ECR image
- Configure memory and CPU requirements
- Map port 80

4. Update ECS Service:
- Select the new task definition
- Configure desired count of tasks
- Set up ALB target group

### CI/CD Pipeline (Optional)

Use AWS CodePipeline with:
1. Source: GitHub repository
2. Build: AWS CodeBuild
3. Deploy: AWS ECS

CodeBuild buildspec.yml example:
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

### Monitoring

1. Set up CloudWatch metrics for:
   - Container insights
   - ALB metrics
   - Target group health

2. Configure alarms for:
   - High CPU/Memory usage
   - Error rates
   - Response times

### Security Considerations

1. Use security groups to control traffic
2. Enable AWS WAF on the ALB
3. Use SSL/TLS certificates for HTTPS
4. Implement proper IAM roles and policies