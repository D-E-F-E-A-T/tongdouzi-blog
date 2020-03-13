---
title: Docker从理论到实践篇三：数据卷
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## 数据卷

容器的 rootfs 是由一系列只读层上面叠加一个容器专用的读写层进行联合挂载而来，在容器中所有的写操作都只会保留到这个容器专有的读写层。这也就意味着，随着容器的删除，容器专用的读写层也会被删除，容器运行过程中产生过的数据也就会被删除。但是在很多场景下，需要持久化存储数据，例如 mysql，这就需要通过数据卷机制绕过联合挂载文件系统。

数据卷是将宿主系统上的一个文件/目录，直接映射到容器中的一个文件/目录，在容器内部对这个文件/目录的读写操作，相当于直接对宿主系统上的文件/目录进行操作。实际上，存储卷机制，是在宿主的 Mount 用户空间和容器的 Mount 用户空间的某个子路径上开辟一个共享区域，使得容器中可以读取宿主文件系统中的数据，并且容器中产生的数据可以保存到宿主的文件系统中，从而：

- 数据能够脱离容器生命周期而持久化保存
- 数据可以在容器和宿主、容器和容器之间实现共享

```shell
root@vps:~# echo '<h3>Hello, docker!</h3>' > /root/web/index.html
root@vps:~# docker run --name b1 -it -v /root/web/:/usr/local/html busybox
/ # cat /usr/local/html/index.html
<h3>Hello, docker!</h3>
/ # echo 'Hello, world!' >> /usr/local/html/index.html
/ # exit
root@vps:~# cat /root/web/index.html
<h3>Hello, docker!</h3>
Hello, world!
```

数据卷有两种类型：

- Bind mount volume：宿主机文件系统位置人为指定的卷
- Docker-managed volume：宿主机文件系统位置由 Docker daemon 创建的卷

```shell
# Bind mount volume - 宿主机上的 /root/web 目录，与容器内的 /usr/share/nginx/html 绑定
docker run -it -v /root/web:/usr/share/nginx/html nginx
# Docker-managed volume - 在宿主机上自动生成一个目录，与容器内的 /usr/share/nginx/html 绑定
docker run -it -v /usr/share/nginx/html nginx
```

Docker 在宿主机上生成的路径可以通过以下方式查看，一般位于 `/var/lib/docker/volumes/<volume-id>/_data` 下：

```shell
root@vps:~# docker run --name b2 -d -v /usr/local/html busybox
8ecffc078134783655ac313925fea9494f5937b2baa09bdb8f16577ece3f1e75
root@vps:~# docker inspect -f {{.Mounts}} b2
[{volume 316a601bd29caa82904c1757edb8164fb2d6fcbc0fc60328858d74dadb9c838f /var/lib/docker/volumes/316a601bd29caa82904c1757edb8164fb2d6fcbc0fc60328858d74dadb9c838f/_data /usr/local/html local  true }]
```

数据卷的另一种用法，使用 `--volumes-form` 直接复用另一个容器的卷配置：

```shell
docker run -it --name b3 --volumes-form b1 busybox
```

这种用法使用的场景常常是使用一个不会运行的基础架构容器，其他具有生产功能的容器复用基础架构容器的卷配置、网络配置：

```shell
docker run -it --name b4 --network container:b --volumes-form b busybox
```
