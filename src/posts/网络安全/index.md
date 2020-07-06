---
title: 网络安全
date: 2020-03-23
categories:
  - 技术
tags:
  - 网络
---

### 证书

向 CA 机构申请证书需要准备两个原材料：

- 购买一个域名
- 生成新的密钥对 - 授权密钥对

证书的作用，就是证明公钥属于域名

CA 机构发放证书前，需要要求申请者证明自己对域名和密钥的控制权：

- 申请者拥有对域名的控制权：在域名下配置一个指定的 DNS 记录，或者在域名下的指定 URI 放置一个指定的 HTTP 资源
- 申请者拥有对密钥的控制权：提供一个 nonce（一次性数字）要求申请者使用私钥对它签名

申请者完成对域名和密钥的控制权证明之后，可以要求 CA 机构为指定的公钥办法指定域名的证书：

- 摘要
- 签名
- 签署

Let’s Encrypt 的证书能否通过平台的验证主要取决于该平台是否在其受信证书存储中包含ISRG的"ISRG Root X1"证书或IdenTrust的"DST Root CA X3"证书。

根证书离线存储在安全的地点。我们使用中间证书（在下节介绍）向用户颁发终端实体证书。

在正常情况下，Let’s Encrypt 颁发的证书将来自“Let’s Encrypt Authority X3”。


https://letsencrypt.org/zh-cn/how-it-works


docker create \
  --name=letsencrypt \
  -it \
  --cap-add=NET_ADMIN \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e URL=tongdouzi.com \
  -e SUBDOMAINS=www,blog,home \
  -e VALIDATION=dns \
  -e DNSPLUGIN=aliyun \
  -e EMAIL=pengxiaomeng@outlook.com \
  -p 4443:443 \
  -p 8880:80 \
  -v /mnt/user/appdata/letsencrypt:/config \
  --restart unless-stopped \
  linuxserver/letsencrypt
