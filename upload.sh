#!/bin/bash

# 使用 rsync 上传文件，排除指定目录
rsync -av \
  --exclude 'node_modules' \
  --exclude 'backup' \
  --exclude '.bolt' \
  ./ /home/gl34819/

echo "Files uploaded successfully!"