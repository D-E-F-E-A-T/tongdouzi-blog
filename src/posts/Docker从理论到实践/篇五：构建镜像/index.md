---
title: Docker从理论到实践篇五：构建镜像
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
publish: true
---

## 基于容器的构建

容器其实就是在镜像之上叠加一个可写层。基于一个容器，可以通过 `docker commit` 命令将可写层提交为镜像中的一个只读层从而构建出一个新的镜像。

首先创建一个容器并且在里面启动一个简单的 web 服务：

```shell
root@vps:~# docker run -it busybox
/ # mkdir -p /var/www/html
/ # touch /var/www/html/index.html
/ # echo "<h3>hello</h3>" > /var/www/html/index.html
/ # httpd -f -h /var/www/html/
```

基于这个容器构建一个镜像：

```shell
root@vps:~# docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
46568497c531        busybox             "sh"                36 seconds ago      Up 34 seconds                           frosty_lewin
root@vps:~# docker commit -p 46568497c531 myweb:v0.0.1
sha256:a7fe7a6a954593e397b90557d8781b75f705e5e0195ac07416a0d47d7e2cfd58
root@vps:~# docker image ls
REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
myweb                           v0.0.1              a7fe7a6a9545        17 seconds ago      1.22MB
busybox                         latest              6d5fcfe5ff17        3 months ago        1.22MB
```

新构建的镜像中的层是在 busybox 镜像的基础上叠加了容器 46568497c531 的读写层：

```
root@vps:~# docker image inspect -f {{.RootFS.Layers}} busybox
[sha256:195be5f8be1df6709dafbba7ce48f2eee785ab7775b88e0c115d8205407265c5]
root@vps:~# docker image inspect -f {{.RootFS.Layers}} myweb:v0.0.1
[sha256:195be5f8be1df6709dafbba7ce48f2eee785ab7775b88e0c115d8205407265c5 sha256:6822d2c3990d00db7dd18a70e9f37431c31cf3d73f1226d9e7e2a679a8124eab]
```

使用新镜像运行容器时，容器的 httpd 服务并没有自动启动起来，因为新构建的镜像 myweb:v0.0.1 的默认启动命令继承的还是 busybox:latest 这个镜像的启动命令。`docker commit` 命令可以通过 `-c` 来修改一些指令：

```shell
root@vps:~# docker commit -p -a "Shawmon Peng <pengxiaomeng@outlook.com>" -c 'CMD ["/bin/httpd", "-f", "-h", "/var/www/html/"]' 46568497c531 myweb:v0.0.2
sha256:3b653e8c97b4b481e00b7148bbc447774622f670cb5c39692b0955fd51124ecd
root@vps:~# docker run -d myweb:v0.0.2
fcd2530ded6fd5a24f182014aae5129ec381e2547e83f492b24ade53c5d1fc0b
root@vps:~# curl 172.17.0.2
<h3>hello</h3>
```

## 基于 Dockerfile 的构建

Dockerfile 是一个 Docker 镜像的描述文件，里面包含了这个镜像的信息和构建步骤，使用 `docker build` 命令可以基于一个 Dockerfile 文件构建镜像。

### 指令

Dockerfile 由一条条指令构成，主要分为四类：

- 基础镜像信息
- 维护者信息
- 镜像操作指令
- 容器启动时执行指令

**◇ FROM**

FROM 指令必须位于 Dockerfile 文件的第一个非注释行，指明构建的新镜像的使用的基础镜像，后续的指令运行于此基础镜像所提供的运行环境之上。

基础镜像的名字可以使用 `REPOSITORY:TAG` 的形式，也可以使用 `REPOSITORY@DIGEST` 的形式。构建过程中 Docker 会先在本地查看有没有指定的基础镜像，没有才会从仓库注册服务器下载，本地镜像可能存在被篡改的风险，因此基础镜像的名字建议使用 `REPOSITORY@DIGEST` 的形式：

```
FROM ubuntu:19.10
```

```
FROM ubuntu@a30685e91c6c7a9e84380699ab7c26cfb94cc690bc2e32295e3cdcdee483e096
```

构建过程优先从本地获取指定的基础镜像，本地找不到才会到 DockerHub Registry 获取。本地镜像存在被篡改替换的风险，因此建议使用 digest 方式

**◇ MAINTAINER、LABEL**

MAINTAINER 指令用来指定维护者的信息，这个指令已经废弃，新版本用 LABEL 指令以键值对的形式指定镜像的元信息，包括维护者信息。现在为了兼容不同 Docker 版本，Dockerfile 一般两个指令都加上：

```
MAINTAINER "luofu <pengxiaomeng@outlook.com>"
LABEL maintainer="luofu <pengxiaomeng@outlook.com>"
```

**◇ COPY**

COPY 指令用于拷贝文件到构建的镜像的文件系统中去。

源路径通常是相对路径，指定需要拷贝的文件在构建时所在文件系统上的位置。可以是目录，可以使用通配符，可以指定多个，且要求必须位于 Dockerfile 文件所在目录之内，不能超出其外。

目标路径通常是绝对路径，指定将文件拷贝到镜像中的文件系统的哪个位置。只有当拷贝的文件是一个单个文件时才可以是一个文件路径，否则必须为目录。如果这个文件路径不存在，构建过程中会自动创建这个文件和其父目录。

```
COPY ./www/html/* /var/www/html/
```

路径中有空格时，采用下面的形式：

```
COPY ["./www/html/*", "/var/www/html/"]
```

**◇ ADD**

ADD 指令的功能同 COPY，用来拷贝文件到构建的镜像文件系统中去。与 COPY 不同的是，ADD 指令源路径支持 URL 或者 tar 文件。

如果是一个 URL，则从这个 URL 下载文件并复制到镜像中:

```
ADD webapp.tar.gz /var/www/html/
```

如果是一个本地 tar 文件，会自动解压缩并且把得到的所有文件复制到镜像中：

```
ADD https://examples.com/webapp.tar.gz /var/www/html/
```

**◇ WORKDIR**

WORKDIR 指令用来设定工作目录，对 COPY、ADD、RUN、CMD、ENTRYPOINT 指令中的容器中地址有效。默认的工作路径是 `/`

```
WORKDIR /var/www/html/
COPY ./www/html/* ./
```

效果等同于：

```
COPY ./www/html/* /var/www/html/
```

**◇ RUN**

在镜像构建阶段，在基础镜像提供的运行环境之上执行一个命令：

```
RUN cd /usr/local/src && \
    tar xf nginx-1.15.2 ./src/
```

注意这个命令执行的环境是基础镜像，所以需要这个基础镜像中存在这个命令。例如需要使用 `RUN` 指令安装一个软件包，使用不同的基础镜像被执行的命令不一样：

```
FROM alpine:3.7
RUN apk add --no-cache curl
ENTRYPOINT ["curl"]
```

```
FROM ubuntu:18.04
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y --no-install-recommends install curl && \
    DEBIAN_FRONTEND=noninteractive apt-get -y autoremove && \
    DEBIAN_FRONTEND=noninteractive apt-get clean
ENTRYPOINT ["curl"]
```

```
FROM centos:7
RUN yum update -y && \
    yum -y install wget && \
    yum clean all
ENTRYPOINT ["curl"]
```

<!-- docker build -t curl:centos -f Docker_centos .
docker run --name curl_alpine -it --rm curl:alpine www.baidu.com -->

**◇ CMD**

指定在容器启动时，在容器运行环境中默认执行的命令：

```
FROM busybox:latest
CMD ping www.baidu.com
```

以这个镜像创建的容器启动时如果没有指定启动命令，默认会执行 `ping www.baidu.com` 命令。

但是如果启动容器时指定了启动命令，如 `docker run IMAGE ping www.google.com`，则默认命令不会被执行，镜像默认命令会被用户指定命令覆盖，因此容器启动固定的初始化任务，不能用 `CMD` 指定，需要用到下面的 `ENTRYPOINT` 指令。

**◇ ENTRYPOINT**

`ENTRYPOINT` 用来指定一个容器的入口命令，如果 Dockerfile 中指定了 `ENTRYPOINT` 指令，则 `CMD` 指令指定的默认启动命令和 `docker run` 指定的自定义启动命令会作为参数附加在 `ENTRYPOINT` 指定的入口命令之后：

```
FROM ubuntu
ENTRYPOINT ["/usr/bin/top", "-b"]
CMD ["-c"]
```

**`RUN/CMD/EENTRYPOINT` 的两种形式**

`RUN/CMD/ENTRYPOINT` 这些指令语法都有两种形式：

1. shell 形式：`RUN/CMD command`
2. exec 形式：`RUN/CMD ["command", "params1", "params2"]`

shell 和 exec 形式的区别是：

- shell 形式会先启动一个 shell，然后在这个 shell 中执行命令，命令经过 shell 处理
- exec 形式不会启动 shell，直接执行指定的可执行文件，命令不经过 shell 处理

因此，shell 和 exec 在用法上需要注意以下两种情况：

1. exec 形式不能使用变量替换、重定向、通配符等 shell 特性，如 `CMD ["echo", "$HOME"]`，因为没有经过 shell 处理，`$HOME` 不会替换成真实的环境变量的值，只作为一个普通的字符串处理。需要使用变量替换可以使用 `CMD echo $HOME` 或者 `CMD ["/bin/sh", "-c", "echo $HOME"]`。
2. shell 形式因为需要先启动一个 shell，所以容器 PID 为 1 的进程是 shell，例如 `CMD top -b`，1 号的进程是 `/bin/sh -c` 而不是 `top -b`。当使用 `docker stop` 命令停止容器时，Docker 会向容器内的 1 号进程发送 `SIGTERM` 信号，使得 1 号进程能够优雅的关闭。但是采用 shell 形式，接收到这个 `SIGTERM` 信号的进程是 `sh`，`sh` 程序忽略 `SIGTERM` 信号，没有进行优雅退出处理，Docker 在等待 10 秒钟超时之后，发送 `SIGKILL` 强制杀死 sh 进程，并销毁了它的 PID 命名空间。

> 有些镜像中 `ENTRYPOINT` 是一个启动 shell 脚本，这个脚本进行一些初始化操作之后，通过 `exec "$@"` 的方式让需要接收 Unix 信号的进程取代自己成为容器的 1 号进程。

**`ENTRYPOINT`、`CMD`、`docker run` 三者是怎样影响启动命令的？**

|    ENTRYPOINT   |    CMD   | docker run |                 COMM                |
|:---------------:|:--------:|:----------:|:-----------------------------------:|
|     `top -b`    |   `-c`   |            | `/bin/sh -c 'top -b' /bin/sh -c -c` |
|     `top -b`    |   `-c`   |    `-H`    |       `/bin/sh -c 'top -b' -H`      |
|     `top -b`    | `["-c"]` |            |       `/bin/sh -c 'top -b' -c`      |
|     `top -b`    | `["-c"]` |    `-H`    |       `/bin/sh -c 'top -b' -H`      |
| `["top", "-b"]` |   `-c`   |            |        `top -b /bin/sh -c -c`       |
| `["top", "-b"]` |   `-c`   |    `-H`    |             `top -b -H`             |
| `["top", "-b"]` | `["-c"]` |            |             `top -b -c`             |
| `["top", "-b"]` | `["-c"]` |    `-H`    |             `top -b -H`             |

**◇ SHELL**

指定运行命令时用的 shell，没有指定的情况下，在 *nix 上使用 `["/bin/sh", "-c"]`，在 Windows 上使用 `["cmd", "/S", "/C"]`

**◇ STOPSIGNAL**

指定 `docker stop` 发送给容器 1 号进程的 Unix 信号，默认是 `SIGTERM - 15`

**◇ USER**

USER 指令用于指定 `RUN/CMD/ENTRYPOINT` 指令运行时使用的用户名和组

```
RUN groupadd -r redis && useradd -r -g redis redis
USER redis
RUN [ "redis-server" ]
```

**◇ ARG**

ARG 指令声明一个构建时变量，构建时变量可以通过 `docker build` 命令的 `--build-arg` 选项设定值：

```
ARG user
```
```
docker run --build-arg user=pxm test
```

ARG 也可以指定一个默认值，当 `--build-arg` 选项中没有指定这个值时，采用默认值：

```
ARG user=pxm
```
```
docker run test
```

**◇ ENV**

ENV 指令声明并初始化一个环境变量，并且持久化到镜像中，在镜像运行时依然存在。ENV 指令有两种格式：

- `ENV <key1>=<value1> <key2>=<value2> ...`

```
ENV myName John Doe
ENV myDog Rex The Dog
ENV myCat fluffy
```

- `ENV <key1> <value1> <key2> <value1> ...`

```
ENV myName="John Doe" myDog=Rex\ The\ Dog \
    myCat=fluffy
```

在创建容器时使用 `docker create` 的 `-e, --env` 选项也可以设定环境变量的值，构建阶段通过 ENV 指令设定的环境变量值将会被覆盖。

ARG 与 ENV 指令都可以定义构建时用的变量，但是二者有以下两点区别：

1. ENV 指令声明的环境变量不仅仅在构建时有效，还能够持久化到镜像中，如果没有被覆盖，在运行时依然有效。而 ARG 指令声明的变量只在构建时有效。
2. 如果 ENV 指令和 ARG 指令声明的变量同名，则 ENV 变量的指覆盖 ARG 变量的值。可以理解为 ENV 定义的是一个本地作用域变量，而 ARG 是以参数的形式从外部传递过来的，本地作用域变量覆盖外部作用域变量。例如下面的案例：

```
FROM ubuntu
ENV CONT_IMG_VER v1.0.0
ARG CONT_IMG_VER
RUN echo $CONT_IMG_VER
```

使用 `docker build --build-arg CONT_IMG_VER=v2.0.1 .` 命令构建时，打印的值是 `v1.0.0`。

**◇ VOLUME**

声明一个卷挂载点：

```
VOLUME ["/var/www/html/"]
```

或者：

```
VOLUME /var/www/html/
```

在创建容器时使用 `-v, --volume` 选项指定这个卷挂载点映射到宿主机的哪个路径:

```
docker run -v /appdata/www:/var/www/html/ www
```

**◇ EXPOSE**

声明一个容器对外暴露的端口：

```
EXPOSE 80/udp
```

在创建容器时使用 `-p, --publish list` 选项指定这个暴露点和宿主机的哪个端口绑定：

```
docker run -p 8080:80/tcp www
```

或者使用 `-P, --publish-all` 选项绑定所有声明的端口到主机的动态随机生成的端口：

```
docker run -P www
```

**◇ HEALTHCHECK**

告诉 Docker 怎么去测试这个容器是不是仍在工作。注意 1 号进程仍在运行不代表容器依然工作，例如一个 www 服务器仍在运行，但是陷入死循环不能处理新的连接，这时候应该判定容器不能正常工作：

```shell
HEALTHCHECK --start-period=2s --duration=60s CMD wget -O - -q http://${IP:-0.0.0.0}:${PORT:-80}
```

镜像没有指定 `HEALTHCHECK` 指令，则默认继承基础镜像的 `HEALTHCHECK` 指令。如果想明确告诉 Docker 这个镜像没有指定任何 `HEALTHCHECK`，可以使用 `HEALTHCHECK NONE`。

**◇ ONBUILD**

定义一个触发器，当一个镜像使用本镜像作为基础镜像进行构建时触发这个触发器。

```
ONBUILD ADD 'https://www.example.com/xxx.tar.gz'
```

**案例**

首先编写 Dockerfile 文件：

```
FROM busybox

WORKDIR /var/www/html/
RUN echo "<h3>hello</h3>" > /var/www/html/index.html

EXPOSE 80
CMD ["httpd", "-f", "-h", "./"]
```

基于这个 Dockerfile 文件构建镜像：

```shell
root@vps:~/runtest# docker build -t myweb:v0.0.3 .
Sending build context to Docker daemon  2.048kB
Step 1/5 : FROM busybox
 ---> 6d5fcfe5ff17
Step 2/5 : WORKDIR /var/www/html/
 ---> Using cache
 ---> 5c92384ba6c5
Step 3/5 : RUN echo "<h3>hello</h3>" > /var/www/html/index.html
 ---> Using cache
 ---> e5842e5f4f75
Step 4/5 : EXPOSE 80
 ---> Using cache
 ---> fe2ae4363b0d
Step 5/5 : CMD ["httpd", "-f", "-h", "./"]
 ---> Using cache
 ---> 94e3e4d4a737
Successfully built 94e3e4d4a737
Successfully tagged myweb:v0.0.3
root@vps:~/runtest#
root@vps:~# docker run -d myweb:v0.0.3
root@vps:~# curl 172.17.0.3
<h3>hello</h3>
```

同样观察这个新镜像中的层：

```shell
root@vps:~/runtest# docker image inspect -f {{.RootFS.Layers}} myweb:v0.0.3
[sha256:195be5f8be1df6709dafbba7ce48f2eee785ab7775b88e0c115d8205407265c5 sha256:40389742d9a5a687b44e2936b562fd02df0c2948a6ed885a13bd5c01cfa1ce6d sha256:8be95a18e21666e16b50371ddb3c1cf1c8419b6020ed97790eefcde91b44aae5]
```

可以看到新构建的层是在 busybox 的基础上增加了两个层，这是因为 `WORKDIR` 和 `RUN` 指令会创建一个新的层。`WORKDIR` 指令需要创建新的层是因为如果指定的工作目录不存在，需要创建目录，`RUN`  指令创建新的层是因为执行的命令可能会对现有文件系统产生更改。产生过多的层在镜像运行进行联合挂载时会产生不必要的性能损耗，因此编写 Dockerfile 文件时尽量减少操作步骤，合并相关的操作。

<!-- 多个 FROM 指令的问题 -->

## 镜像上传

公有仓库 dockerhub dockercn 阿里云(dev.aliyun.com) quay.io

私有仓库 docker-distribution/docker-registry vmware harbor

推送镜像需要保证本地镜像的名字与推送的服务器一致
docker push mageedu/httpd

## 镜像导入和导出

docker save -o myimages.gz IMAGE1 IMAGE1
docker load -i myimages.gz


着重理解 https://yq.aliyun.com/articles/5545
http://shareinto.github.io/2019/01/30/docker-init(1)/

PID1 POD0 分别是谁？

在 shell 中执行命令的几种方式：

`COMMAND` - 启动一个新的进程，这个新的进程的父进程是 shell 进程
`COMMAND &` - 启动一个新的进程，这个新的进程的父进程是 shell 进程
`nohub COMMAND &`
`exec COMMAND` 替换 shell 进程

- https://www.dnscrypt.org/
- https://hub.docker.com/r/linuxserver/duckdns
- https://hub.docker.com/r/linuxserver/letsencrypt

关于 bash 中变量的默认值：

```shell
➜  ~ echo ${NAME:-tom}
tom
➜  ~ NAME=jerry
➜  ~ echo ${NAME:-tom}
jerry
```

${NAME:+tom} NAME 有值时显示 tom

Dockerfile 文件中的任何一个指令都会在一个新的镜像文件层中执行，因此尽量合并多个操作，减少层数

RUN here can only be one CMD instruction in a Dockerfile

允许出现多个 CMD 指令，但是只有最后一个会生效
允许出现多个 ENTRYPOINT，但是只有最后一个会生效
