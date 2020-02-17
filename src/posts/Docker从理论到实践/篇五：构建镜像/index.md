---
title: Docker从理论到实践篇五：构建镜像
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## Docker 构建镜像

### 基于容器 - docker commit

```shell
docker commit
```

### 基于 Dockerfile - docker build

```shell
docker build
```

同一个应用，开发、测试、线上不同的环境，所需的配置不同
例如 nginx 配置文件，我们希望根据创建容器指定的环境变量动态生成

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

FROM 指令必须位于 Dockerfile 文件的第一个非注释行，用于指定镜像构建使用的基准镜像，后续的指令运行于此基础镜像所提供的运行环境

```dockerfile
FROM <repository>:<tag>
# 缺省 tag 默认 latest
FROM <repository>@<digest>
```

构建过程优先从本地获取指定的基础镜像，本地找不到才会到 DockerHub Registry 获取。本地镜像存在被篡改替换的风险，因此建议使用 digest 方式

MAINTAINER 指令已经废弃，用来指定维护者的信息
LABEL 指令可以用键值对的形式指定镜像的元信息，包括维护者信息

```dockerfile
MAINTAINER "luofu <pengxiaomeng@outlook.com>"
LABEL maintainer="luofu <pengxiaomeng@outlook.com>"
```

COPY 复制文件到构建的镜像文件中去

```dockerfile
COPY <src> ... <dest>
# 路径中有空格时，采用第二种
COPY ["<src>"..."<dest>"]
```

src 通常是相对路径，可以使用通配符，要求必须位于 Dockerfile 文件所在目录之内。
dest 是绝对路径，指定构建的镜像文件系统中的位置，如果路径不存在，构建过程中会自动创建，包括其父目录

如果 src 是一个目录，则相当于 src/*，复制时会递归复制 src 目录下的所有文件到目标，但是 src 目录本身不会被复制

如果指定了多个 src，或者 src 中使用了通配符，则 dest 必须是一个目录，必须以 / 结尾

```shell
# 进入 Dockerfile 所在目录
docker build -t v1.0.0 ./
```

注意：每个 COPY 指令会在镜像中创建一个层，因此建议拷贝目的地址相同的，尽量合并为一个指令

ADD 指令，同 COPY，可以复制文件到构建的镜像文件中去，与 COPY 不同的是，ADD 指令 src 支持 URL 或者 tar 文件。如果是一个 URL，则从这个 URL 下载文件并复制到镜像中。如果是一个本地 tar 文件，会自动解压缩并且把得到的所有文件复制到镜像中。

WORKDIR 指令：设定工作目录，对 RUN、CMD、ENTRYPOINT、COPY 和 ADD 指令中的容器中地址有效。默认的工作路径是 /

```dockerfile
COPY index.html /usr/local/html/
# 等效于
WORKDIR /usr/local/html/
COPY index.html ./
```

VOLUME 指令：指定镜像使用的卷，但是 VOLUME 指令只能设定 docker 管理卷，不能设定绑定挂载点卷，也就是说卷在宿主上的映射路径只能是 docker 自己生成的，不能是自己指定的。

```dockerfile
VOLUME <mountpoint>
VOLUME ["<mountpoint>"]
eg:
VOLUME /usr/local/mysql/
```

EXPOSE 指令：指定容器需要对外暴露的端口。EXPOSE 指令只是声明需要暴露哪些端口，没有和宿主端口做任何绑定。和宿主端口的绑定需要在创建容器时通过 `-p` 或者 `-P` 选项指定。特别注意 `-P` 选项就是读取 EXPOSE 指令声明暴露的所有端口，然后和宿主端口做动态绑定。

```dockerfile
EXPOSE <port>[<protocol>] [<port>[<protocol>]]
# protocol 可选 tcp | udp，缺省默认 tcp
eg:
EXPOSE 11211/udp 11211/tcp
```

ENV 指令：指定镜像所需要的环境变量，指定后，可以在之后的指令如 ENV、ADD、COPY 等指令参数中直接使用这个环境变量

```dockerfile
ENV <key> <value>
# key 之后的所有部分都被视为 value，包括空格
ENV <key>=<value> ...
# value 中有空格需要用引号包裹
# 定义多个变量时，建议使用第二种方式，避免在镜像中产生更多的层
```

```dockerfile
COPY index.html /usr/local/html/
# 等效于
ENV HTML_ROOT=/usr/local/html/  \
    SOURCE_FILES=index.html
COPY ${SOURCE_FILES:-index.html} ${HTML_ROOT:-/usr/local/html/}
```

注意：在创建容器时指定使用 `-e` 选项 `docker run -e HTML_ROOT="/usr/local/web/"` 也可以设定环境变量的值，但是不会影响到镜像构建过程。因为镜像构建和容器创建发生在两个不同的阶段。

RUN 指令：在构建镜像时执行一个命令，注意这个命令时基于基础镜像的，基础镜像中必须存在这些命令

```shell
RUN cd /usr/local/src && \
    tar xf nginx-1.15.2 ./src/
# 如果需要执行多个命令，建议使用 && 合并到同一个 RUN 指令中，避免在镜像中产生更多的层
```

```shell
FROM centos
RUN yum -y install epel-release && \
    yum makecache && \
    yum install nginx
```

CMD 指令：在创建容器时默认执行命令

RUN/CMD 指令语法格式都有两种：

```shell
1. RUN/CMD <command>
2. RUN/CMD ["<executable>", "params1", "params2"]
两种有很多不同之处，<command> 中可能有变量替换、重定向、通配符等 shell 特性，因此需要先启动 shell，在用 shell 去执行 command，最后还要替换
```

CMD 指令设定是创建容器的默认命令，在 `docker run` 命令中可以覆盖掉默认命令。如果镜像不允许覆盖，则可以配合 ENTRYPOINT 命令实现，这样 `docker run` 命令后面跟的命令不会覆盖掉 ENTRYPOINT，只是会跟在 ENTRYPOINT 的后面作为 ENTRYPOINT 的参数


允许出现多个 CMD 指令，但是只有最后一个会生效
允许出现多个 ENTRYPOINT，但是只有最后一个会生效
CMD 和 ENTRYPOINT 可以同时出现，这种情况 CMD 就会作为 ENTRYPOINT 后面紧跟的默认参数

```dockerfile
CMD ["/bin/httpd", "-f", "-h ${WEB_DOC_ROOT}"]
ENTRYPOINT ["/bin/sh", "-c"]
```

容器中只有 1 号进程能够接收 unix 信号，使用 `docker stop <container>` 命令会向 1 号进程发送 SIGTERM 信号，使用 `docker kill <container>` 命令会向 1 号进程发送 SIGKILL 信号

在 shell 中执行命令的几种方式：

`COMMAND` - 启动一个新的进程，这个新的进程的父进程是 shell 进程
`COMMAND &` - 启动一个新的进程，这个新的进程的父进程是 shell 进程
`nohub COMMAND &`
`exec COMMAND` 替换 shell 进程

USER 指令：用于指定 RUN、CMD 或者 ENTRYPOINT 指令运行时使用的用户名或 UID

```dockerfile
USER <UID> | <UserName>
```

HEALTHCHECK 指令：告诉 Docker 怎么去测试容器是不是正常工作。默认继承自基础镜像。

注意：1 号进程正常运行并不代表容器正常工作。例如一个 nginx 容器，陷入死循环不能处理新的连接，1 号进程正常运行，但是容器没有正常工作。

```
HEALTHCHECK [OPTIONS] CMD <command> # HEALTHCHECK 会在容器期间自动执行
HEALTHCHECK NONE # 禁用从基础镜像继承过来的 healthcheck

eg:
HEALTHCHECK --start-period=2s --duration=60s CMD wget -O - -q http://${IP:-0.0.0.0}:${PORT:-80}
```

SHELL 指令：指定运行命令时用的 shell，在 Linux 上默认为 ["/bin/sh", "-c"]，在 Windows 上默认为 ["cmd", "/S", "/C"]
STOPSIGNAL 指令：`docker stop` 发送给 1 号进程的信号，默认 15 - SIGTERM 信号

ARG 指令：声明一个变量，这个变量的值可以在镜像构建时通过 `docker build --build-arg <key>=<value>` 覆盖。

ONBUILD 指令：一个触发器，用这个 Dockerfile 构建的镜像，被其他 Dockerfile 用作基础镜像时，会触发这个指令

```dockerfile
ONBUILD ADD 'https://www.example.com/xxx.tar.gz'
```