#!/bin/bash

# 安装 Node.js 18
dnf module enable nodejs:18 -y
dnf module install nodejs:18 -y

# 安装 Nginx
dnf install nginx -y

# 进入项目目录
cd /home/gl34819

# 安装依赖并构建
npm install
npm run build

# 配置 Nginx
cp nginx.conf /etc/nginx/conf.d/excel-viewer.conf

# 配置 SELinux
setsebool -P httpd_can_network_connect 1
semanage fcontext -a -t httpd_sys_content_t "/home/gl34819/dist(/.*)?"
restorecon -Rv /home/gl34819/dist

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 配置防火墙
firewall-cmd --permanent --add-service=http
firewall-cmd --reload