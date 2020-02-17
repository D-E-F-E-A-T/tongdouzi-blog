---
title: Docker从理论到实践篇二：镜像和容器
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../docker.jpg
---

## 什么是联合挂载技术？

一个 linux 系统的运行，需要用到两个文件系统：

**1. bootfs：**

- 包含了 boot loader 和 kernel
- 使用同一个内核版本的所有 linux 系统 bootfs 都是一样的
- 只在系统启动阶段被挂载，系统启动完成会被立刻卸载掉

**2. rootfs：**

- 包含了 `/dev`、`/proc`、`/bin`、`/etc`、`/lib`、`/usr`、`/tmp` 等这些典型的目录结构以及这些目录下的配置文件、二进制文件以及库文件等
- 不同的发行版 rootfs 是不同的，并且用户可以直接对 rootfs 进行修改
- rootfs 在系统启动之后首先以只读模式挂载，完成一系列自检之后重新挂载为读写模式

一个容器的运行则有些不同：

**1. bootfs：**

容器共享宿主机的内核，因此不需要 rootfs

**2. rootfs：**

采用联合挂载的机制，将镜像以只读方式挂载，再在最上层叠加一个容器专用的可写层，形成容器最终的 rootfs。

这里所谓的联合挂载，就是把多个不同的文件系统合并挂载到同一个挂载点，形成一个虚拟文件系统的技术。联合挂载技术需要特殊的存储驱动来支撑，这样的存储驱动有 aufs、devicemapper、zfs、vfs、btrfs、overlay、overlay2 等，这些存储驱动与常说的 ext4fs、xfs 等存储驱动不同，他们依赖并且建立在 ext4fs、xfs 之上，不参与磁盘结果的划分，仅仅实现将 ext4fs、xfs 文件系统中的目录进行合并，向用户呈现。

在 Docker 最初的版本中使用的是 aufs，aufs 是在 2006 年对 UnionFS 的重新实现，但是由于代码质量的原因，一直没有被加入到 linux 内核中，需要通过打补丁的方式在 linux 系统上使用。因此在 Docker 初期：

- 友好激进的 Ubuntu（Debian 系） 中，直接将 aufs 打包进自己的发行版中，所以 Docker 在 Ubuntu 中默认采用 aufs，
- 稳定保守的 CentOS（Redhat 系） 中，不能直接使用 aufs，因此 Docker 在 CentOS 中默认采用自家主导的 devicemapper

overlay 作为 aufs 主要竞争者，成功在 3.18 版本中整合进 linux 内核，overlay2 在 4.0 版本中整合进 linux 内核。因此最新版本的 Docker 默认使用 overlay2 作为存储驱动器。

```shell
# 查看 Docker 使用的存储驱动器类型
root@vps:~# docker info | grep 'Storage Driver'
WARNING: No swap limit support
 Storage Driver: overlay2
```

下面以 overlay 为例，研究以下联合挂载是怎么工作的。overlay 的挂载需要用到三种目录：

- lower：只读目录，可以是多个，合并之后的修改操作不会影响到这些目录
- upper：读写目录，只能是一个，合并之后的修改操作只会影响这个目录
- work：工作目录，overlay 用来解决文件拷贝问题，用户不需要关心

首先按照以下方法快速创建演示目录：

```shell
root@vps:~# mkdir -p overlaytest/{U,L1,L2,W,M}
root@vps:~# cd overlaytest/
root@vps:~/overlaytest# echo U | tee U/u U/c1
U
root@vps:~/overlaytest# echo L1 | tee L1/l1 L1/c2
L1
root@vps:~/overlaytest# echo L2 | tee L2/l2 L2/c1 L2/c2
L2
root@vps:~/overlaytest# echo W | tee W/w
W
root@vps:~/overlaytest# tree .
.
|-- L1
|   |-- c2
|   `-- l1
|-- L2
|   |-- c1
|   |-- c2
|   `-- l2
|-- M
|-- U
|   |-- c1
|   `-- u
`-- W
    `-- w

5 directories, 8 files
```

使用 mount 命令使用联合挂载：

```shell
root@vps:~/overlaytest# mount -t overlay overlaytest -o lowerdir=L2:L1,upperdir=U,workdir=W M
```

**合并**

这时候去查看合并目录 M 下的内容：

```shell
root@vps:~/overlaytest# mount -t overlay overlaytest -o lowerdir=L2:L1,upperdir=U,workdir=W M
root@vps:~/overlaytest# tree M/
M/
|-- c1
|-- c2
|-- l1
|-- l2
`-- u

0 directories, 5 files
root@vps:~/overlaytest# cat M/c1
U
root@vps:~/overlaytest# cat M/c2
L2
```

联合挂载的过程如下图所示，每个层中的文件都会投射到合并后的目录，如果存在同名文件，upper 中的文件覆盖 lower 中的文件，lower 中较顶层的文件覆盖较底层的文件：

![联合挂载](./联合挂载.png)

**写时复制**

当对合并后的目录做写操作时，改动只会发生在 upper，不会影响到 lower。写操作分为 3 种：

- 新增操作：

```shell
root@vps:~/overlaytest# echo create > M/x
root@vps:~/overlaytest# tree .
.
|-- L1
|   |-- c2
|   `-- l1
|-- L2
|   |-- c1
|   |-- c2
|   `-- l2
|-- M
|   |-- c1
|   |-- c2
|   |-- l1
|   |-- l2
|   |-- u
|   `-- x
|-- U
|   |-- c1
|   |-- u
|   `-- x
`-- W
    |-- w
    `-- work

6 directories, 15 files
```

可以看到实际上，新增文件直接写到了 upper 层

- 删除操作：

```shell
rm M/u
rm M/c1
```

- 修改操作：

```shell
echo x > xx
```

## Docker 镜像和容器在本地是如何存储的？

Docker 的默认存储目录是 `/var/lib/docker`，Docker 管理的所有镜像、容器、网络、卷等对象的数据都保存在这个目录下:

```shell
root@vps:~# ls -l /var/lib/docker
total 48
drwx------ 2 root root 4096 Feb  5 02:22 builder
drwx--x--x 4 root root 4096 Feb  5 02:22 buildkit
drwx------ 2 root root 4096 Feb 15 20:31 containers
drwx------ 3 root root 4096 Feb  5 02:22 image
drwxr-x--- 3 root root 4096 Feb  5 02:22 network
drwx------ 6 root root 4096 Feb 16 01:34 overlay2
drwx------ 4 root root 4096 Feb  5 02:22 plugins
drwx------ 2 root root 4096 Feb  5 02:22 runtimes
drwx------ 2 root root 4096 Feb  5 02:22 swarm
drwx------ 2 root root 4096 Feb 16 01:34 tmp
drwx------ 2 root root 4096 Feb  5 02:22 trust
drwx------ 2 root root 4096 Feb  5 02:22 volumes
```

镜像相关的数据都存放在 `/var/lib/docker/image` 目录下，使用的每个存储驱动器会单独作为一个目录存放在这里：

```shell
root@vps:~# ls -l /var/lib/docker/image/overlay2/
total 24
drwx------ 4 root root 4096 Feb  5 02:23 distribution/
drwx------ 4 root root 4096 Feb  5 02:22 imagedb/
drwx------ 5 root root 4096 Feb  5 02:23 layerdb/
-rw------- 1 root root  271 Feb 16 01:34 repositories.json
```

`/var/lib/docker/image/overlay2/imagedb/` 中存放的是镜像的元数据，`/var/lib/docker/image/overlay2/imagedb/` 中存放的是层的元数据。

首先下载一个 nginx:latest 镜像到本地：

```shell
root@vps:~# docker pull nginx:latest
latest: Pulling from library/nginx
bc51dd8edc1b: Pull complete
66ba67045f57: Pull complete
bf317aa10aa5: Pull complete
Digest: sha256:ad5552c786f128e389a0263104ae39f3d3c7895579d45ae716f528185b36bc6f
Status: Downloaded newer image for nginx:latest
docker.io/library/nginx:latest
```

其实从输出信息中就可以看出，这个镜像包含了三个层。使用下面的命令可以查看镜像的详细信息：

```shell
root@vps:~# docker image ls nginx:latest
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx               latest              2073e0bcb60e        13 days ago         127MB
root@vps:~# docker image inspect -f {{.ID}} nginx:latest
sha256:2073e0bcb60ee98548d313ead5eacbfe16d9054f8800a32bedd859922a99a6e1
root@vps:~# docker image inspect -f {{.RootFS.Layers}} nginx:latest
[sha256:488dfecc21b1bc607e09368d2791cb784cf8c4ec5c05d2952b045b3e0f8cc01e sha256:b4a29beac87cb2648ad511811c9c798c2aade5e0d82995a27a5d986ae24898b0 sha256:22439467ad99389c16d8c9a499ce94cc4cc882d2865b97819213300f2fe0198d]
```

镜像的 ID 为 `2073e0bcb60ee98548d313ead5eacbfe16d9054f8800a32bedd859922a99a6e1，包含的三个层的` ID 从底层到顶层分别是：
`488dfecc21b1bc607e09368d2791cb784cf8c4ec5c05d2952b045b3e0f8cc01e`、`b4a29beac87cb2648ad511811c9c798c2aade5e0d82995a27a5d986ae24898b0` 和 `22439467ad99389c16d8c9a499ce94cc4cc882d2865b97819213300f2fe0198d`

有了这些信息，再去查看镜像在 `/var/lib/docker/image/` 下是怎么存储的：

```shell
root@vps:~# ls -l /var/lib/docker/image/overlay2/imagedb/content/sha256/
total 8
-rw------- 1 root root 6666 Feb 16 01:34 2073e0bcb60ee98548d313ead5eacbfe16d9054f8800a32bedd859922a99a6e1
root@vps:~# ls -l /var/lib/docker/image/overlay2/layerdb/sha256/
total 12
drwx------ 2 root root 4096 Feb 16 01:34 488dfecc21b1bc607e09368d2791cb784cf8c4ec5c05d2952b045b3e0f8cc01e
drwx------ 2 root root 4096 Feb 16 01:34 99360ffcb2da18fd9ede194efaf5d4b90e7aee99f45737e918113e6833dcf278
drwx------ 2 root root 4096 Feb 16 01:34 a3136fbf38691346715cac8360bcdfca0fff812cede416469653670f04e2cab0
root@vps:~#
```

`/var/lib/docker/image/overlay2/imagedb/content/sha256/` 下面，镜像的元数据存储在以 imageId 作为文件名的文件中，但是 `/var/lib/docker/image/overlay2/layerdb/sha256/` 下面，除了存在一个以最顶层的 ID 作为文件名的文件，其他层的 ID 没有出现在这个目录中。这是因为，层的元信息存储的文件名是 chainId，而不是 layerId。layerId 的计算规则父层的 chaindId 和本层的 layerId 一起做 sha256sum 运算，如果没有父层，则直接取本层的 ID 作为 chainId：

```shell
root@vps:~# echo -n "sha256:488dfecc21b1bc607e09368d2791cb784cf8c4ec5c05d2952b045b3e0f8cc01e sha256:b4a29beac87cb2648ad511811c9c798c2aade5e0d82995a27a5d986ae24898b0" | sha256sum -
99360ffcb2da18fd9ede194efaf5d4b90e7aee99f45737e918113e6833dcf278  -
root@vps:~# echo -n "sha256:99360ffcb2da18fd9ede194efaf5d4b90e7aee99f45737e918113e6833dcf278 sha256:22439467ad99389c16d8c9a499ce94cc4cc882d2865b97819213300f2fe0198d" | sha256sum -
a3136fbf38691346715cac8360bcdfca0fff812cede416469653670f04e2cab0  -
```

以 imageId 作为文件名的文件内容都是 json 字符串，里面保存的是镜像的远信息

```shell
root@vps:~# cat /var/lib/docker/image/overlay2/imagedb/content/sha256/2073e0bcb60ee98548d313ead5eacbfe16d9054f8800a32bedd859922a99a6e1  | jq ".rootfs"
{
  "type": "layers",
  "diff_ids": [
    "sha256:488dfecc21b1bc607e09368d2791cb784cf8c4ec5c05d2952b045b3e0f8cc01e",
    "sha256:b4a29beac87cb2648ad511811c9c798c2aade5e0d82995a27a5d986ae24898b0",
    "sha256:22439467ad99389c16d8c9a499ce94cc4cc882d2865b97819213300f2fe0198d"
  ]
}
```

以 chainId 作为文件名的文件是一个目录，这个目录中的 `cache-id` 文件保存着层的 rootfs 实际上存储的位置：

```shell
root@vps:~# cat  /var/lib/docker/image/overlay2/layerdb/sha256/488dfecc21b1bc607e09368d2791cb784cf8c4ec5c05d2952b045b3e0f8cc01e/cache-id
4c01a472c28c077378b526a91fb4c98bb1b7d9aacb10322ea9ddc8ea1132216c
```

层的 rootfs 的内容实际存储在 `/var/lib/docker/overlay2/<cache-id>/diff` 这个目录中

```shell
root@vps:~# ls -l /var/lib/docker/overlay2/
total 16
drwx------ 3 root root 4096 Feb 16 01:34 4c01a472c28c077378b526a91fb4c98bb1b7d9aacb10322ea9ddc8ea1132216c
drwx------ 4 root root 4096 Feb 16 01:34 82266000dbe547fbd753c574d7160861d4e7f30ed4c01b448dd13417fb46d35f
drwx------ 4 root root 4096 Feb 16 01:34 a0cd54f8521118290f2a8b86ea7e1fc5f94e7f4fb0bdf0fecc71e2b46a441f98
drwxr-xr-x 2 root root 4096 Feb 16 01:34 l
root@vps:~#
```

```shell
root@vps:~# ls -l /var/lib/docker/overlay2/4c01a472c28c077378b526a91fb4c98bb1b7d9aacb10322ea9ddc8ea1132216c/diff/
total 76
drwxr-xr-x  2 root root 4096 Jan 30 08:00 bin
drwxr-xr-x  2 root root 4096 Nov 10 20:17 boot
drwxr-xr-x  2 root root 4096 Jan 30 08:00 dev
drwxr-xr-x 28 root root 4096 Jan 30 08:00 etc
drwxr-xr-x  2 root root 4096 Nov 10 20:17 home
drwxr-xr-x  7 root root 4096 Jan 30 08:00 lib
drwxr-xr-x  2 root root 4096 Jan 30 08:00 lib64
drwxr-xr-x  2 root root 4096 Jan 30 08:00 media
drwxr-xr-x  2 root root 4096 Jan 30 08:00 mnt
drwxr-xr-x  2 root root 4096 Jan 30 08:00 opt
drwxr-xr-x  2 root root 4096 Nov 10 20:17 proc
drwx------  2 root root 4096 Jan 30 08:00 root
drwxr-xr-x  3 root root 4096 Jan 30 08:00 run
drwxr-xr-x  2 root root 4096 Jan 30 08:00 sbin
drwxr-xr-x  2 root root 4096 Jan 30 08:00 srv
drwxr-xr-x  2 root root 4096 Nov 10 20:17 sys
drwxrwxrwt  2 root root 4096 Jan 30 08:00 tmp
drwxr-xr-x 10 root root 4096 Jan 30 08:00 usr
drwxr-xr-x 11 root root 4096 Jan 30 08:00 var
```

理解了镜像在本地是怎么存储的，那么容器呢？首先使用 nginx:latest 镜像创建一个容器：

```shell
root@vps:~# docker run -d nginx
21d4a82e184c2918ee9e9dec3cdd4ddf187750289270d221416d3c239995eec9
```

在 `/var/lib/docker/containers/` 目录下，出现了一个以 containerId 文件名的目录，这个目录下保存着容器相关的配置文件：

```shll
root@vps:~# ls -l /var/lib/docker/containers/
total 4
drwx------ 4 root root 4096 Feb 16 16:27 21d4a82e184c2918ee9e9dec3cdd4ddf187750289270d221416d3c239995eec9
root@vps:~# ls -l /var/lib/docker/containers/21d4a82e184c2918ee9e9dec3cdd4ddf187750289270d221416d3c239995eec9/
total 32
-rw-r----- 1 root root    0 Feb 16 16:27 21d4a82e184c2918ee9e9dec3cdd4ddf187750289270d221416d3c239995eec9-json.log
drwx------ 2 root root 4096 Feb 16 16:27 checkpoints
-rw------- 1 root root 2763 Feb 16 16:27 config.v2.json
-rw-r--r-- 1 root root 1470 Feb 16 16:27 hostconfig.json
-rw-r--r-- 1 root root   13 Feb 16 16:27 hostname
-rw-r--r-- 1 root root  174 Feb 16 16:27 hosts
drwx------ 2 root root 4096 Feb 16 16:27 mounts
-rw-r--r-- 1 root root   61 Feb 16 16:27 resolv.conf
-rw-r--r-- 1 root root   71 Feb 16 16:27 resolv.conf.hash
```




```shell
root@vps:~# ls -l /var/lib/docker/image/overlay2/layerdb/mounts/
total 4
drwxr-xr-x 2 root root 4096 Feb 16 16:27 21d4a82e184c2918ee9e9dec3cdd4ddf187750289270d221416d3c239995eec9
root@vps:~# ls -l /var/lib/docker/image/overlay2/layerdb/mounts/21d4a82e184c2918ee9e9dec3cdd4ddf187750289270d221416d3c239995eec9/
total 12
-rw-r--r-- 1 root root 69 Feb 16 16:27 init-id
-rw-r--r-- 1 root root 64 Feb 16 16:27 mount-id
-rw-r--r-- 1 root root 71 Feb 16 16:27 parent
```

```shell
root@vps:~# ls -l /var/lib/docker/overlay2/
total 24
drwx------ 3 root root 4096 Feb 16 01:34 4c01a472c28c077378b526a91fb4c98bb1b7d9aacb10322ea9ddc8ea1132216c
drwx------ 4 root root 4096 Feb 16 01:34 82266000dbe547fbd753c574d7160861d4e7f30ed4c01b448dd13417fb46d35f
drwx------ 4 root root 4096 Feb 16 16:26 a0cd54f8521118290f2a8b86ea7e1fc5f94e7f4fb0bdf0fecc71e2b46a441f98
drwx------ 5 root root 4096 Feb 16 16:27 aa9d847e2287ee11d29e75b23dddcfd124906cf072c03527eab8dfcd23854e74
drwx------ 4 root root 4096 Feb 16 16:27 aa9d847e2287ee11d29e75b23dddcfd124906cf072c03527eab8dfcd23854e74-init
drwxr-xr-x 2 root root 4096 Feb 16 16:27 l
```

```shell
mount | grep overlay

overlay on /var/lib/docker/overlay2/aa9d847e2287ee11d29e75b23dddcfd124906cf072c03527eab8dfcd23854e74/merged type overlay
(rw,relatime,
  lowerdir=
    /var/lib/docker/overlay2/l/IWFGBIYHMLMJUECHNNQSHXJG3A:
    /var/lib/docker/overlay2/l/PIM6GB3U2ARCNVEEDGBR5FYZPM:
    /var/lib/docker/overlay2/l/ZPJAK4TPD2ULHC72PZYYCBTUML:
    /var/lib/docker/overlay2/l/HN535SHO5FWXN2KNJ7KOASS57H,
  upperdir=
    /var/lib/docker/overlay2/aa9d847e2287ee11d29e75b23dddcfd124906cf072c03527eab8dfcd23854e74/diff,
  workdir=
    /var/lib/docker/overlay2/aa9d847e2287ee11d29e75b23dddcfd124906cf072c03527eab8dfcd23854e74/work
)
```

## 哈哈哈

Docker 镜像是软件的交付品，Docker 容器是软件的运行态。

<!-- 作为交付品的镜像要求在分发的过程中不可篡改，而 -->

linux 你还

Docker 镜像其实就是一个静态的文件系统及文件系统上存放的内容。





- 基础镜像可以共享、
- 容器专用的可写层

AUFS 只是 Docker 使用的存储驱动的一种，除了 AUFS 之外，Docker 还支持了不同的存储驱动，包括 aufs、devicemapper、overlay2、zfs 和 vfs 等等，

在最新的 Docker 中，overlay2 取代了 aufs 成为了推荐的存储驱动，但是在没有 overlay2 驱动的机器上仍然会使用 aufs 作为 Docker 的默认驱动。


UnionFS 其实是一种为 Linux 操作系统设计的用于把多个文件系统『联合』到同一个挂载点的文件系统服务。

容器和镜像的区别就在于，所有的镜像都是只读的，而每一个容器其实等于镜像加上一个可读写的层，也就是同一个镜像可以对应多个容器。



镜像的分层构建

所谓 UnionFS

但是每个容器拥有自己的 rootfs。


这个 rootfs 采用联合挂载


```shell
docker image inspect -f {{.Id}} ubuntu
ccc6e87d482b79dd1645affd958479139486e47191dfe7a997c862d89cd8b4c0

root@vps:~# docker image inspect -f {{.RootFS.Layers}} ubuntu
[sha256:43c67172d1d182ca5460fc962f8f053f33028e0a3a1d423e05d91b532429e73d sha256:21ec61b65b20ec53a1b7f069fd04df5acb0e75434bd3603c88467c8bfc80d9c6 sha256:1d0dfb259f6a31f95efcba61f0a3afa318448890610c7d9a64dc4e95f9add843 sha256:f55aa0bd26b801374773c103bed4479865d0e37435b848cb39d164ccb2c3ba51]
# ubuntu 的镜像由四个层组成
```

```shell
root@vps:~# ll /var/lib/docker/overlay2
total 28
drwx------  7 root root 4096 Feb  5 02:32 ./
drwx--x--x 14 root root 4096 Feb  5 02:22 ../
drwx------  4 root root 4096 Feb  5 02:32 06659b3c2e477acaa58395fcb4d7b0e91f1b7155480025951d868237b8b1332b/
drwx------  4 root root 4096 Feb  5 02:32 50602e65c493512472b88dfdd07c2232924e7fbbb4bccc5fbec31389ff783fc4/
drwx------  3 root root 4096 Feb  5 02:32 b1bf887e780a3fb875b20797047f579919d7b2986d7641d2ba00a5a43f515363/
drwx------  4 root root 4096 Feb  5 02:32 e33bb0a706daeae9356f6ea942e14f49b6ab626182136d75c0fe9534a959e6b3/
drwxr-xr-x  2 root root 4096 Feb  5 02:32 l/
```

可以看到镜像的层都放置在 /var/lib/docker/aufs/diff 目录下，然后被联合挂载在 /var/lib/docker/aufs/mnt 里面

docker history

## docker 的基本使用

![Docker 常用命令梳理](./docker常用命令.jpg)

### 镜像管理

使用 `docker search` 命令可以从 docker hub 搜索仓库：

```shell
➜  ~ docker search busybox
NAME                      DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
busybox                   Busybox base image.                             1777                [OK]
progrium/busybox                                                          71                                      [OK]
radial/busyboxplus        Full-chain, Internet enabled, busybox made f…   26                                      [OK]
arm32v7/busybox           Busybox base image.                             8
```

这个命令可以列举出 Docker Hub 上所有的官方仓库和用户仓库，仓库名称使用 `/` 分割的是用户仓库，如 `progrium/busybox`，没有分割的是官方仓库，如 `nginx`

每个仓库里面有很多个使用 tag 标记的镜像，docker 命令中目前没有直接显示仓库下所有 tag 的命令，因此最好还是去 [Docker Hub](https://hub.docker.com/) 查看。

使用 `docker pull` 命令将仓库注册服务器上的镜像拉取到本地：

```shell
➜  ~ docker pull busybox:1.31.1
1.31.1: Pulling from library/busybox
bdbbaa22dec6: Pull complete
Digest: sha256:6915be4043561d64e0ab0f8f098dc2ac48e077fe23f488ac24b665166898115a
Status: Downloaded newer image for busybox:1.31.1
docker.io/library/busybox:1.31.1
```

拉取镜像需要指定 tag，没有指定 tag，则默认拉取这个仓库下的 latest 标签标记的镜像。

使用 `docker images/docker image ls` 命令可以列举出所有本地已下载的镜像

```shell
➜  ~ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
busybox             1.31.1              6d5fcfe5ff17        4 weeks ago         1.22MB
nginx               1.17.6-alpine       a624d888d69f        2 months ago        21.5MB
```

使用 `docker rmi/docker image rm` 命令可以删除本地的镜像：

```shell
➜  ~ docker rmi busybox:1.31.1
Untagged: busybox:1.31.1
Untagged: busybox@sha256:6915be4043561d64e0ab0f8f098dc2ac48e077fe23f488ac24b665166898115a
Deleted: sha256:6d5fcfe5ff170471fcc3c8b47631d6d71202a1fd44cf3c147e50c8de21cf0648
Deleted: sha256:195be5f8be1df6709dafbba7ce48f2eee785ab7775b88e0c115d8205407265c5
➜  ~ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx               1.17.6-alpine       a624d888d69f        2 months ago        21.5MB
```

注意，如果存在用这个镜像创建的容器，这个镜像是不能被删除的，需要先删除所有使用这个镜像创建的容器才能够删除这个镜像。

- commit/build/push
- load/import


### 启动容器

### 容器管理

由于容器是动态的，有完整的生命周期，所以和容器相关的操作大多是关于容器状态转换的。看下面这张容器状态转换图能够帮助理清楚思路：

![容器的生命周期](./docker容器生命周期.png)

在开始认识容器状态转换相关的命令之前，记住 `docker ps/docker container list` 命令，这个命令列举出 Docker Host 上所有正在运行的容器，如果加上 `-d`，其他非运行状态的容器也会列举出来：

```shell
➜  ~ docker ps -a
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS                      PORTS               NAMES
```

创建容器使用 `docker create` 命令，启动容器使用 `docker start` 命令，在实际使用中通常使用 `docker run` 命令一步到位创建并且启动容器。`docker run` 命令比较复杂，常用的选项列举在下：

```shell
Usage: docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
Options:
  --name string                        Assign a name to the container
  -d, --detach                         Run container in background and print container ID
  -t, --tty                            Allocate a pseudo-TTY
  -i, --interactive                    Keep STDIN open even if not attached
```

**1、容器的标识**

每个容器都拥有唯一ID，这个 ID 由 docker daemon 自动生成，是一个 64 位长度，由数字和字母 a~f 组成。同时 Docker 也允许截取完整 ID 的前 12 个字符作为容器的截断 ID。

```shell
➜  ~ docker run busybox
➜  ~ docker ps -a --no-trunc
# 显示完整ID
CONTAINER ID                                                       IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
90d1896b3c50c63331bc665e122dc1587bb31d8f0a6fdd9617d6ac0b55f3317d   busybox             "sh"                9 seconds ago       Exited (0) 8 seconds ago                       nostalgic_chaum
# 显示截断ID
➜  ~ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
90d1896b3c50        busybox             "sh"                5 seconds ago       Exited (0) 3 seconds ago                       nostalgic_chaum
```

无论是完整 ID 还是截断 ID，对于人类来说无论识别还是记忆都不是很友好。因此 Docker 还允许为每个容器指定便于识记的名字。指定名字使用 `--name` 选项，如果没有指定，Docker 会随机生成一个：

```shell
➜  ~ docker run --name b1 busybox
➜  ~ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED              STATUS                          PORTS               NAMES
0cb154d0591f        busybox             "sh"                6 seconds ago        Exited (0) 6 seconds ago                            b1
90d1896b3c50        busybox             "sh"                8 minutes ago        Exited (0) 8 minutes ago                            nostalgic_chaum
```

以后对某个容器进行操作，可以使用这个容器的完整ID、截断ID、名字中的任何一个：

```shell
➜  ~ docker rm b1
b1
➜  ~ docker ps -aq
90d1896b3c50
➜  ~ docker rm $(docker ps -aq)
# 这个命令可以用于批量删除容器
90d1896b3c50
➜  ~ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
```

**2、入口命令和 1 号进程**

创建容器需要用到一个**入口命令（ENTRYPOINT CMD）**来创建容器的 1 号进程，如果没有指定入口命令，就自动读取配置文件中指定的入口命令。

```shell
➜  ~ docker run --name b1 busybox sh
➜  ~ docker ps -a | grep b1
85735bb9c7ac        busybox             "sh"                5 seconds ago       Exited (0) 4 seconds ago                       b1
# 可以看到容器创建成功了，但是容器的状态是 Exited
```

这个命令启动了一个容器，容器使用 `sh` 来创建容器的 1 号进程。但是这个容器在创建后不久就自动退出了，这是因为 `sh` 命令创建的 1 号进程的 stdin 关闭了，1 号进程接收不到输入自动返回了，根据 Docker 的设计，1 号进程返回，则容器退出。

为了避免这个问题，创建容器时常常需要指定 `-it` 选项，`-i` 选项维持 STDIN 打开状态，`-t` 选项给容器分配一个伪终端：

<!-- 指定 -t 是为了避免标准输入来自一个管道：$ echo test | docker run -i busybox cat -->

```shell
➜  ~ docker run --name b2 -it busybox sh
/ # %
# 进入到 sh 交互界面
# ctrl-p ctrl-q 断开连接
➜  ~ docker ps -a | grep b2
ca807ebbb65e        busybox             "sh"                10 seconds ago       Up 8 seconds                                        b2
```

需要注意的是这个 1 号进程不能运行在后台，例如：

```shell
$ docker run -p 80:80 my_image service nginx start
```

这个操作成功启动了容器里面的 nginx 服务，但是 1 号进程 - `service nginx start` 返回了，容器也就停止了。虽然容器里面的 nginx 服务启动了，但是使用不了。正确的做法是使用下面的命令：

```shell
$ docker run -p 80:80 my_image nginx -g 'daemon off;'
```

**3、连接和断开**

所谓的 attach 指的是将当前终端的 `stdin`、`stdout` 和 `stderr` 连接到一个运行中的容器，让你可以能够查看容器正在输出的内容，并且交互控制容器，就像直接你的终端上执行命令一样。所谓的 detach 当然就是将当前终端的 `stdin`、`stdout` 和 `stderr` 和容器断开连接。

`docker run` 默认自动连接上启动的容器：

```shell
➜  ~ docker run --name b3 -it busybox ping www.baidu.com
PING www.baidu.com (14.215.177.38): 56 data bytes
64 bytes from 14.215.177.38: seq=0 ttl=37 time=29.920 ms
64 bytes from 14.215.177.38: seq=1 ttl=37 time=29.025 ms
64 bytes from 14.215.177.38: seq=2 ttl=37 time=29.370 ms
read escape sequence
```

在连接模式下，使用 `ctrl-c` 会向容器发送 SIGKILL 信号，如果指定了 `--sig-proxy` 选项，则向容器发送 SIGINT 信号。
在连接模式下并且指定了 `-it` 选项，使用 `ctrl-p ctrl-q` 可以断开容器与当前控制台的连接，但是保持容器的运行。

`docker run` 命令指定了 `-d` 选项，则创建完这个容器不会自动连接上：

```shell
➜  ~ docker run --name b4 -it -d busybox ping www.baidu.com
2482f220a5445786d03910a3cbe647c6b4fa658177a87bfdc9a924789836b39f
➜  ~ docker ps -a | grep b4
2482f220a544        busybox             "ping www.baidu.com"   13 seconds ago      Up 12 seconds                                  b4
# 容器创建成功，并且处于运行中状态
```

没有连接上的运行中容器，可以使用 `docker attach` 命令连接上：

```shell
➜  ~ docker ps -a | grep b4
2482f220a544        busybox             "ping www.baidu.com"   13 seconds ago      Up 12 seconds                                  b4
➜  ~ docker attach b4
64 bytes from 14.215.177.38: seq=61 ttl=37 time=30.061 ms
64 bytes from 14.215.177.38: seq=62 ttl=37 time=29.371 ms
64 bytes from 14.215.177.38: seq=63 ttl=37 time=32.594 ms
read escape sequence
```

每当连接上一个容器时，Docker 划分一个 1MB 的缓存区，当缓存区被填满，进程输出显示的速度会受到影响。因此如果只是需要查看进程的输出，建议使用 `docker logs` 访问而不是通过 `docker attach` 连接容器。

```shell
➜  ~ docker logs b4
PING www.baidu.com (14.215.177.38): 56 data bytes
64 bytes from 14.215.177.38: seq=0 ttl=37 time=27.592 ms
64 bytes from 14.215.177.38: seq=1 ttl=37 time=32.219 ms
# ...
```

创建完容器，参考容器状态转换图，可以对不同状态下的容器使用下面这些命令：

- `docker stop`：停止一个运行中的容器（向容器 1 号进程发送 SIGTERM 信号，比较温和）
- `docker kill`：杀死一个运行中的容器（向容器 1 号进程发送 SIGKILL 信号，比较粗暴）
- `docker start`：开始一个停止的容器
- `docker pause`：暂停一个运行中的容器
- `docker unpause`：恢复一个暂停中的容器
- `docker rm`：删除一个运行中的容器，加 -f 选项强制删除非运行中的容器

`docker exec` 命令用于在一个运行中的容器中执行一个命令：

```shell
➜  ~ docker run -it -d --name b1 busybox sh
461c969e510b6146a5f330e5e61ae06400da9328f31b40d269f62c46a9d61b02
➜  ~ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
461c969e510b        busybox             "sh"                4 seconds ago       Up 3 seconds                            b1
➜  ~ docker exec b1 ping www.baidu.com
PING www.baidu.com (14.215.177.39): 56 data bytes
64 bytes from 14.215.177.39: seq=0 ttl=37 time=32.660 ms
64 bytes from 14.215.177.39: seq=1 ttl=37 time=32.633 ms
^C
➜  ~ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
461c969e510b        busybox             "sh"                54 seconds ago      Up 53 seconds                           b1
➜  ~ docker attach b1
/ # ps -ef
PID   USER     TIME  COMMAND
    1 root      0:00 sh
    6 root      0:00 ping www.baidu.com
   11 root      0:00 ps -ef
```

注意到，使用 `docker exec` 在 b1 容器中执行 `ping www.baidu.com` 命令时，Docker 新启动一个会话去执行这个命令，使用 `ctrl-c` 可以终止退出命令，但是 `ping www.baidu.com` 这个进程并没有停止。这是由于执行命令没有使用 `-it` 选项，建议每次执行命令都带上 `-it`:

```shell
$ docker exec -it b1 ping www.baidu.com
```