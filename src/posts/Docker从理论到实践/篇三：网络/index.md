---
title: Docker从理论到实践篇三：网络
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## Docker 网络

- 虚拟交换机 各种碰撞
- 虚拟路由器 NAT 效率低
- overlay network 隧道

```shell
➜  ~ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
e2057d2744fd        bridge              bridge              local
c17869425a68        host                host                local
1b2de68c3893        none                null                local
```