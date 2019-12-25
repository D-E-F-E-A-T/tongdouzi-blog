---
title: npm 的进阶使用技巧
date: 2019-11-06
categories:
  - 技术
tags:
  - js
---

[npm link/ln][https://docs.npmjs.com/cli/link]

包链接(package linking)过程分为两步：

1. 在一个 npm 包目录下执行 `npm link` 会在全局 npm 包存放目录 `{prefix}/lib/node_modules/` 下创建一个 symlink 链接到 `npm link` 执行所在的 npm 包。`npm config get prefix` 可以读取到 prefix 的实际值。同时，`npm link` 还会在 `{prefix}/bin/` 目录下创建 symlink 链接到 package.json 的 bin 字段指定的位置。例如：

```json
{
  // ...
  "bin": {
    "asc": "bin/asc",
    "asinit": "bin/asinit"
  }
  // ...
}
```

2. 在另一个 npm 包目录下执行 `npm link package-name` 会在当前 npm 包的 `./node_modules/` 下创建一个 symbolic 链接到全局 npm 包存放路径里面已经安装的 npm 包

> 配合 npm-scopr 可以自动在包名前面添加 scope 前缀 `@-symbol/`

https://www.jianshu.com/p/aaa7db89a5b2

npm scope

再看看九头蛇这种符合仓库是怎么做的？