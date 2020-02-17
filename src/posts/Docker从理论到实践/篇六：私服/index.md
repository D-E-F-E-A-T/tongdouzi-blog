---
title: Docker从理论到实践篇六：私服
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## Docker 私服

仓库是集中存放镜像文件的。镜像构建完成后，集中的存储、分发镜像
dockerhub 服务器在国外，dockercn 加速效果有限，国内可以使用阿里云的加速器或者中国科技大学的加速器：

```json
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
```