---
title: 替代 nginx 的反向代理服务器 traefik
date: 2020-03-29
categories:
  - 技术
tags:
  - web 服务器
  - 反向代理
---

Traefik 是一款反向代理服务器，

服务发现、自动配置

Traefik 根据所在环境采用的基础架构 - 集群技术，自动收集信息、发现服务。

目前兼容的基础架构有 Kubernetes、Docker、Docker Swarm、AWS、Mesos、Marathon 等等，甚至兼容运行在裸金属上的传统应用

不需要维护和同步一个单独的配置文件。实时、自动。

系统的门户、拦截、路由所有请求，自动寻找匹配服务

path
host
headers 等等

传统服务器，需要一个配置文件，这个配置文件中包含了所有的路由配置。Traefik 自己去获取这些信息。

服务部署完成、自动侦测，自动更新路由

detects

抛弃 ip

cluster API

这些连接 cluster API 的东西在 Traefik 称作 providers

## 反向代理服务器
