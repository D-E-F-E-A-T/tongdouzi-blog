---
title: ECMAScript系列篇三：类型
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../ECMAScript.png
---

## 原始类型和引用类型

## 原型链

**JavaScript中的变量是没有类型的，只有值才有。**

```js
typeof null // 'object'
typeof function () {} // 'function'
typeof /s/ // 'object'
typeof 42n // 'bigint'
```

1997年 JavaScript 首次被标准化，只有六种原始类型，在ES6以前，JS程序中使用的每一个值都是以下几种类型之一：

- `Undefined`
- `Null`
- `Boolean`
- `Number`
- `String`
- `Object`

**除了Object是对象类型，其他的都是原始（基本）类型。**

typeof只能判断五种数据类型：undefined、string、number、boolean、object

判断类型的几种方式
https://www.cnblogs.com/Amy-world/p/9958208.html

getOwnProperties
