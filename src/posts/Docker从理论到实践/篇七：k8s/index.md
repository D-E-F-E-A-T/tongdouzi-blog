---
title: Docker从理论到实践篇七：k8s
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## docker compose

主机 -> 容器

主机 -> 项目 -> 服务 -> 容器

特性：

1. 使用 `PROJECT_NAME` 隔离环境，不同 `PROJECT_NAME` 下可以存在同名服务
2. 保留并维持服务用到的所有数据卷
3. 只在容器的配置发生改变的时候才会重新创建容器
4. 每个 PROJECT 有自己的变量，根据这些变量自定义环境变量或者 users。Compose file 可以通过继承另一个 Compose file

```shell
root@vps:~/composetest# docker-compose up
Creating network "composetest_default" with the default driver
Building web
Step 1/9 : FROM python:3.7-alpine
3.7-alpine: Pulling from library/python
c9b1b535fdd9: Pull complete
2cc5ad85d9ab: Pull complete
29edaae8dc30: Pull complete
ad2b1dc8253c: Pull complete
f5cf370601a5: Pull complete
Digest: sha256:04c0e1365bf119f30e965ae7bd3ac6dc37ce59a8c1277e1b256de002cd364b78
Status: Downloaded newer image for python:3.7-alpine
 ---> 13f1d829523b
Step 2/9 : WORKDIR /code
 ---> Running in 292a99cf00f4
Removing intermediate container 292a99cf00f4
 ---> 1f280da3d51c
Step 3/9 : ENV FLASK_APP app.py
 ---> Running in 95da47fdf8e9
Removing intermediate container 95da47fdf8e9
 ---> 7e2deb63f5cf
Step 4/9 : ENV FLASK_RUN_HOST 0.0.0.0
 ---> Running in f6d425f1f549
Removing intermediate container f6d425f1f549
 ---> 5a8623a722ea
Step 5/9 : RUN apk add --no-cache gcc musl-dev linux-headers
 ---> Running in 28b73e540f26
fetch http://dl-cdn.alpinelinux.org/alpine/v3.11/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.11/community/x86_64/APKINDEX.tar.gz
(1/12) Installing libgcc (9.2.0-r3)
(2/12) Installing libstdc++ (9.2.0-r3)
(3/12) Installing binutils (2.33.1-r0)
(4/12) Installing gmp (6.1.2-r1)
(5/12) Installing isl (0.18-r0)
(6/12) Installing libgomp (9.2.0-r3)
(7/12) Installing libatomic (9.2.0-r3)
(8/12) Installing mpfr4 (4.0.2-r1)
(9/12) Installing mpc1 (1.1.0-r1)
(10/12) Installing gcc (9.2.0-r3)
(11/12) Installing linux-headers (4.19.36-r0)
(12/12) Installing musl-dev (1.1.24-r1)
Executing busybox-1.31.1-r9.trigger
OK: 124 MiB in 46 packages
Removing intermediate container 28b73e540f26
 ---> f6aeefb8aaf6
Step 6/9 : COPY requirements.txt requirements.txt
 ---> c9507c609889
Step 7/9 : RUN pip install -r requirements.txt
 ---> Running in 044d6d03ef69
Collecting flask
  Downloading Flask-1.1.1-py2.py3-none-any.whl (94 kB)
Collecting redis
  Downloading redis-3.4.1-py2.py3-none-any.whl (71 kB)
Collecting Werkzeug>=0.15
  Downloading Werkzeug-1.0.0-py2.py3-none-any.whl (298 kB)
Collecting itsdangerous>=0.24
  Downloading itsdangerous-1.1.0-py2.py3-none-any.whl (16 kB)
Collecting click>=5.1
  Downloading click-7.1.1-py2.py3-none-any.whl (82 kB)
Collecting Jinja2>=2.10.1
  Downloading Jinja2-2.11.1-py2.py3-none-any.whl (126 kB)
Collecting MarkupSafe>=0.23
  Downloading MarkupSafe-1.1.1.tar.gz (19 kB)
Building wheels for collected packages: MarkupSafe
  Building wheel for MarkupSafe (setup.py): started
  Building wheel for MarkupSafe (setup.py): finished with status 'done'
  Created wheel for MarkupSafe: filename=MarkupSafe-1.1.1-cp37-cp37m-linux_x86_64.whl size=32613 sha256=2c3e6fb4f226275c782e53fd6251592a8707402bed86ef8d6b44f1a72c11a5f5
  Stored in directory: /root/.cache/pip/wheels/b9/d9/ae/63bf9056b0a22b13ade9f6b9e08187c1bb71c47ef21a8c9924
Successfully built MarkupSafe
Installing collected packages: Werkzeug, itsdangerous, click, MarkupSafe, Jinja2, flask, redis
Successfully installed Jinja2-2.11.1 MarkupSafe-1.1.1 Werkzeug-1.0.0 click-7.1.1 flask-1.1.1 itsdangerous-1.1.0 redis-3.4.1
Removing intermediate container 044d6d03ef69
 ---> cf194718fcaa
Step 8/9 : COPY . .
 ---> cd1bdd253c0c
Step 9/9 : CMD ["flask", "run"]
 ---> Running in 56e7cdf95afd
Removing intermediate container 56e7cdf95afd
 ---> af47351aef32
Successfully built af47351aef32
Successfully tagged composetest_web:latest
WARNING: Image for service web was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Pulling redis (redis:alpine)...
alpine: Pulling from library/redis
c9b1b535fdd9: Already exists
8dd5e7a0ba4a: Pull complete
e20c1cdf5aef: Pull complete
25131c35a099: Pull complete
bd7c9740b22d: Pull complete
d4f86850c303: Pull complete
Digest: sha256:49a9889fc47003cc8b8d83bb008dacd3164f6f594caed5e7f1c6829f52c221a8
Status: Downloaded newer image for redis:alpine
Creating composetest_redis_1 ... done
Creating composetest_web_1   ... done
Attaching to composetest_web_1, composetest_redis_1
redis_1  | 1:C 18 Mar 2020 09:02:34.511 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis_1  | 1:C 18 Mar 2020 09:02:34.511 # Redis version=5.0.8, bits=64, commit=00000000, modified=0, pid=1, just started
redis_1  | 1:C 18 Mar 2020 09:02:34.511 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
redis_1  | 1:M 18 Mar 2020 09:02:34.514 * Running mode=standalone, port=6379.
redis_1  | 1:M 18 Mar 2020 09:02:34.514 # WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
redis_1  | 1:M 18 Mar 2020 09:02:34.514 # Server initialized
redis_1  | 1:M 18 Mar 2020 09:02:34.514 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
redis_1  | 1:M 18 Mar 2020 09:02:34.514 * Ready to accept connections
web_1    |  * Serving Flask app "app.py"
web_1    |  * Environment: production
web_1    |    WARNING: This is a development server. Do not use it in a production deployment.
web_1    |    Use a production WSGI server instead.
web_1    |  * Debug mode: off
web_1    |  * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
^CGracefully stopping... (press Ctrl+C again to force)
Stopping composetest_redis_1 ... done
Stopping composetest_web_1   ...
Killing composetest_web_1    ... done
```

```
root@vps:~# docker images
REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
composetest_web                 latest              af47351aef32        9 minutes ago       220MB
redis                           alpine              d8415a415147        4 days ago          30.4MB
myweb                           v0.0.2              01af8ab4e2fb        5 days ago          1.22MB
myweb                           v0.0.1              bc4ade92a696        5 days ago          1.22MB
python                          3.7-alpine          13f1d829523b        7 days ago          96.4MB
nginx                           1.17.8-alpine       48c8a7c47625        7 weeks ago         21.8MB
shadowsocks/shadowsocks-libev   latest              be0b19faac99        2 months ago        17.6MB
busybox                         latest              6d5fcfe5ff17        2 months ago        1.22MB
root@vps:~# docker ps -a
CONTAINER ID        IMAGE                           COMMAND                  CREATED             STATUS                    PORTS                                              NAMES
f0e5189be940        redis:alpine                    "docker-entrypoint.s…"   9 minutes ago       Up 2 minutes              6379/tcp                                           composetest_redis_1
4533769fed34        composetest_web                 "flask run"              9 minutes ago       Up 2 minutes              0.0.0.0:5000->5000/tcp                             composetest_web_1
091a84a43428        shadowsocks/shadowsocks-libev   "/bin/sh -c 'exec ss…"   3 days ago          Up 3 days                 0.0.0.0:13142->8388/tcp, 0.0.0.0:13142->8388/udp   ss
fcd2530ded6f        myweb:v0.0.2                    "/bin/httpd -f -h /v…"   5 days ago          Up 5 days                                                                    interesting_ride
a72f214da8c4        myweb:v0.0.1                    "sh"                     5 days ago          Exited (130) 5 days ago                                                      unruffled_dubinsky
9a6879572c97        busybox                         "sh"                     5 days ago          Up 5 days                                                                    focused_kilby
root@vps:~#
```

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

master 的架构：

etcd 类似于 redis 的key/value 数据库，由 CoreOS 公司使用 Go 语言开发

CoreOS 是 Google 扶持的，制衡 Docker 公司，CoreOS 无法撼动 Docker 在容器领域上的统治地位，但是 CoreOS 在其他领域建树很多。后来 CoreOS 被红帽收购，红帽被 IBM 收购

Scheduler 负责调度管理的节点
Controller 负责完成指令
API Server 负责接收指令

control loop：
API Server 接收指令，直接修改 etcd 配置。控制器不停询问 etcd 保存的配置是不是与当前集群匹配，如果不匹配，调整集群以适应配置。



Node 架构
kubelet 用来监听 master 的配置
Docker 是 k8s 支持的一种容器运行时，k8s 定义了容器运行时接口 cri-o，容器存储接口、容器网络接口.
Pod 是 k8s 中对容器的封装，也就是容器的外壳。因此 k8s 运行的基本单元是 Pod，而不是容器

Pod 中可以有多个容器，一般是有一个不会用的基础架构容器，其他容器复用基础架构容器的网络和数据卷

Service 客户端直接访问，反代理到各个提供服务的 Pod，可以实现负载均衡

service 的 IP 地址称为 service-ip、cluster-ip
pod 的 IP 地址称为 pod-ip
因为 pod 可能销毁、恢复，ip 地址会变，所以 service 反代到 pod 不使用 pod-id 做标识，使用 label
service 不会当即，因为他实际上就是 iptables 规则

service-ip 特殊时候也会变，所以 k8s 之上必不可少一个 dns 服务器，动态寻址 service

node-ip 节点的 ip