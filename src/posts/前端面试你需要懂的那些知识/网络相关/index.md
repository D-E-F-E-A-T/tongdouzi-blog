---
title: 前端面试你需要懂的那些知识 - 网络相关
date: 2020-06-06
categories:
  - 技术
tags:
  - 前端
featureImage: ../前端面试.jpg
---

## 介绍一下网络分层模型

理论标准 - OSI七层模型：应用层、表示层、会话层、传输层、网络层、数据链路层、物理层
现实标准 - TCP/IP四层模型：应用层、传输层、网络层、数据链路层

![分层模型](./分层模型.png)

网络层协议：IP、ICMP、ARP、RARP
传输层协议：TCP、UDP
应用层协议：FTP、Telnet、SMTP、HTTP、RIP、NFS、DNS

## TCP 和 UDP 的区别是什么？

TCP：提供基于连接的可靠传输服务，一般网页、邮件这些应用会使用 TCP 协议
UDP：提供快速的不可靠传输服务，一般视频、聊天这些应用会使用 UDP 协议

## 介绍一下 TCP 三次握手和四次挥手

参考 HTTP

## 介绍一下 http1.0、http1.1 和 http2 的主要区别

参考 HTTP

7. HTTPS是什么？
HTTPS即加密的HTTP，HTTPS并不是一个新协议，而是HTTP+SSL（TLS）。原本HTTP先和TCP（假定传输层是TCP协议）直接通信，而加了SSL后，就变成HTTP先和SSL通信，再由SSL和TCP通信，相当于SSL被嵌在了HTTP和TCP之间
握手机制
8. CDN 原理
9. CDN 获取最近节点资源的算法是什么
10. 介绍几种常见的状态码
