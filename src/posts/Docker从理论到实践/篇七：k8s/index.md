---
title: Docker从理论到实践篇七：k8s
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## k8s 介绍

C/C++ 针对系统 API 进行开发
Java 针对 JVM 和基于 JVM 的类库进行开发

部署几台linux主机，在linux上部署k8s集群。K8S 提供了 API，程序针对 K8S 的 API 进行开发

K8S 不能代表所有的云计算环境，但是至少是最火热的云计算环境，OpenStack 实际上已经凉了。这种运行在云计算环境中的应用程序称为 Cloud Native Application。

在云平台之上的基础上诞生的技术，称为 Serverless 技术，其中以 K8S 为基础上的 Serverless 技术称为 KNative。

Faas - Function as a service - 函数即服务

函数的特点是，只有在需要使用的时候才会执行，使用完了就退出。云计算环境中可以将应用程序函数化，只有在需要这个服务的时候，云计算平台调度节点创建应用程序执行环境，使用结束了又释放这个节点。这么做与传统起服务始终占据系统资源的做法比，释放了大量资源的占用，用完即走。系统资源得到最大合理的利用

1、单体应用架构：所有功能以模块化、插件化的方式集成在一个应用程序中，也有人称为巨石架构
2、分层架构：每个层次负责一个功能
3、微服务架构：每个微小的功能都做成一个服务，一个完整的应用可能包含几十个服务，服务之间相互调用。如果这个调用关系由运维人员去维护，工作难度是不可想象的。因此微服务架构下，服务之间的调用都不是通过静态配置来实现，而是采用动态的服务发现机制去实现。

每个应用到服务总线 - Service Bus 去注册自己提供的服务和自己的地址，一个服务要用到另外一个服务时，先向服务总线查询，再去访问对应的服务。

> 有点类似于静态 IP 和 DHCP 之间的关系

哪个服务运行在哪个节点，在这个庞大的调用网中手工人肉去部署，难度太大，因此需要用到服务编排技术。

服务编排系统，需要考虑的问题有点多，节点上的环境能不能满足服务的依赖，这些都需要考虑的问题。这时候容器就出现在视野中，容器自带运行环境，可以运行在任何节点中。运行服务 变成 运行容器，服务编排系统 变成容器编排系统。

docker 极富创造性的解决了应用程序打包的根本性难题

容器编排 - 容器应用的自动布局、协同和管理，主要负责完成以下具体任务：

- Service Discovery 服务发现
- Load Balancing 负载均衡
- Secrets/Configuration/Storage management 密钥/配置/存储管理
- Health checks 健康检查
- Auto-[scaling/restart/healing] of containers and nodes 自动扩/缩容、重启、修复容器和节点
- Zero-downtime deploys 零宕机部署

可用的编排系统：

1. k8s：Google 负责原始开发，后提交到由 Google/AWS/Microsoft/IBM/Intel/Cisco/RedHat 作为会员的 Cloud Native Computing Foundation 组织
2. Docker Swarm：Docker 公司开发
3. Apache Mesos and Marathon：University of California at Berkeley 原始开发，Mesos 是一个数据中心操作系统，Marathon 在 Mesos 上实现容器编排功能。

17 年的时候还是三足鼎立的，现在基本上 k8s 已经成为了主流，甚至 Docker 在自己的 Docker ee 产品上也同时支持 k8s 和自家的 Docker Swarm，Mesos 中也加入了 k8s 的支持

k8s 的前身是 Google 公司内部已经使用了十几年的 Borg 系统，Docker 公司的 Docker 技术虽然极大降低了容器技术的使用门槛，使得容器技术迅速普及，但是 Docker 技术在容器编排方面的经验显然远远比不上 Google 公司。15 年 Google 借鉴 Borg 的经验使用 Golang 开发 k8s，迅速占领市场，所向披靡。

Kubernetes - 舵

## 架构

k8s 集群中所有的主机分成两类：

- masters 负责管理节点
- nodes 负责运行容器

masters 在同一个集群中可以有多个，但是只是做冗余。平时只有一个 master 发出指令管理 nodes，当这个 master 突然宕机时，备用的 master 能够立刻接替指挥工作，避免整个集群瘫痪。


