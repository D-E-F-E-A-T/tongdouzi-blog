---
title: lerna
date: 2019-11-06
categories:
  - 技术
tags:
  - js
---

## 分包

前端项目越来越复杂，维护起来越来越困难。为了避免项目臃肿，成熟的团队会将项目拆分成多个包进行开发。分包的过程中发现以下一些偿命导致开发体验不是很好：

- A 包中紧急修复了一个 bug，升级了版本发布到仓库。依赖 A 包的所有项目需要手动更新依赖包的版本到最新版本，维护成本很高。
- 新开发的项目中需要 A 包添加或者修改一些功能，需要先在 A 包中完成编码之后，发布到仓库。本地项目重新安装最新版本的 A 包之后进行测试，如果有问题需要对 A 包重新编码、发布，开发链路很长。
- 依赖重复的问题

### 包链接(package linking)

包链接实现的功能是使开发者能够在本地同时开发两个包，npm 和 yarn 对这个功能提供了支持：[`npm link`](https://docs.npmjs.com/cli/link)/[`yarn link`](https://classic.yarnpkg.com/zh-Hans/docs/cli/link)

包链接(package linking)过程分为两步：

1. 在一个 npm 包目录下执行 `npm link` 会在全局 npm 包存放目录 `{prefix}/lib/node_modules/` 下创建一个 symlink 链接到 `npm link` 执行所在的 npm 包。`npm config get prefix` 可以读取到 prefix 的实际值。同时，`npm link` 还会在 `{prefix}/bin/` 目录下创建 symlink 链接到 package.json 的 bin 字段指定的位置。例如：

```json
{
  "bin": {
    "asc": "bin/asc",
    "asinit": "bin/asinit"
  }
}
```

2. 在另一个 npm 包目录下执行 `npm link package-name` 会在当前 npm 包的 `./node_modules/` 下创建一个 symbolic 链接到全局 npm 包存放路径里面已经安装的 npm 包

### yarn workspaces

---
> 配合 npm-scopr 可以自动在包名前面添加 scope 前缀 `@-symbol/`

https://www.jianshu.com/p/aaa7db89a5b2

npm scope

再看看九头蛇这种符合仓库是怎么做的？

node 环境下使用 es modules

https://blog.csdn.net/universsky2015/article/details/83754741

1. 将文件后缀改为 .mjs

2. 使用babel插件将es6转码为es5

3. babel-node

https://blog.csdn.net/universsky2015/article/details/83754741

[npm 命令和 yarn 命令对照](https://classic.yarnpkg.com/zh-Hans/docs/migrating-from-npm#toc-cli-commands-comparison)