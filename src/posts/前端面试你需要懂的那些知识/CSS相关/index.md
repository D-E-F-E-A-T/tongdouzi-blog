---
title: 前端面试你需要懂的那些知识 - JS执行环境相关
date: 2020-06-06
categories:
  - 技术
tags:
  - 前端
featureImage: ../前端面试.jpg
---

## css 选择器有哪些？权重如何计算？

css 选择器包括基本选择器和组合选择器，基本选择器有：ID 选择器，类选择器，标签选择器，属性选择器，伪类选择器，伪元素选择器，通配符选择器。组合选择器有：基于文档结构的相邻选择器，子选择器，后代选择器，基于逻辑结构的与选择器，或（逗号）选择器

权重的计算设计到层叠的过程，层叠分三个步骤：

1. 按照重要性排序，使用 `!important` 声明的样式权重最高
2. 重要性相同，按照特殊性排序：选择器各部分的权重之和就是整个选择器的权重（或选择区需要分开计算）
  - 内联元素的特殊性是： 1-0-0-0 => 内联样式 > 嵌入样式表 > 外部样式
  - ID选择器的特殊性是： 0-1-0-0
  - 类选择器、属性选择器和伪类选择器的特殊性是： 0-0-1-0
  - 元素选择器和伪元素选择器的特殊性是： 0-0-0-1
  - 通配符选择器的特殊性是： 0-0-0-0
3. 特殊性相同，按照先后顺序排序
4. 最后考虑继承的样式

## 盒模型

css 的盒模型，一般讲的是 block 水平元素的几何模型。行内元素有另外的一套标准

标准模型由四部分组成：

- content 内容区域
- padding 内边距区域
- border 边框区域
- margin 外边距区域

由于历史原因 css 盒模型有两套标准，IE 的怪异盒模型和 W3C 的标准盒模型。

怪异盒模型：盒子尺寸包含 content、padding、border 这些区域，`box-sizing: border-box;`
标准盒模型：盒子尺寸只包含 content 区域，`box-sizing: content-box;`

实际上在开发中，或者在很多组件库的实现中，最常用的是 `border-box`，切图的时候不需要计算。

另外，由于早期浏览器主要负责文字排版，为了排版美观，引入了 margin 重叠特性。就是说 css 盒子在垂直方向的 margin 会产生重叠。重叠之后的取值规则是：正正取最正，负负取最负，正负取相加

## margin 坍塌现象

两个盒子在垂直方向上设置 margin 值时，会出现一个有趣的塌陷现象，分为两种情况：

- 相互接触的兄弟元素，接触的地方分别设置了 margin，这时候会发生 margin 重叠，二者实际的间距是“正正取最正、负负取最负、正负取相加”之后的值
- 相互接触的父子元素，接触的地方，子元素设置了 margin，这时候 margin 会转移到父元素身上

## BFC

具有 BFC 特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 BFC 具有普通容器所没有的一些特性：

1. 同一个 BFC 下会发生 margin 坍塌现象 - margin 重叠
2. BFC 可以包含浮动的元素（清除浮动）
3. BFC 可以避免 float 的文字环绕效果，制造二列布局

BFC 的核心特性：在 BFC 中，每一个盒子的外边缘（margin）会触碰到容器的内边缘(border)。

由这个核心特性，衍生出下面三个比较重要的特性：

1. 避免**相互接触的父子元素**之间的 margin 坍塌：因为 BFC 容器的内部盒子的外边缘要碰到容器内边缘，所以垂直方向上盒子的 margin 不会转移到容器。[案例](https://codepen.io/pengxiaomeng/pen/oNbLERO)
2. 避免浮动元素撑不起容器高度：BFC 容器内，即使是浮动元素，它的底部外边缘也要接触到容器的底部内边缘，因此能够撑起容器高度。[案例](https://codepen.io/pengxiaomeng/pen/MWKeVeX)
3. 避免文字环绕：BFC 容器内，每一个盒子的外边缘（margin）会触碰到容器的内边缘(border)，所以文字不会环绕。[案例](https://codepen.io/pengxiaomeng/pen/OJMXvWW)

BFC 的元素的条件：

1. **根元素** `<html>` 元素
2. **浮动元素** float 的值不是 none。
3. **绝对/固定/stickty定位元素** position 的值不是 static 或者 relative
4. **overflow 非 visible 元素** overflow 的值不是 visible
5. **非块级盒子的块级容器** display 的值是 inline-block、inline-flex、inline-table、inline-grid、inline-grid、table、table-cell、table-caption、flex、grid、**flow-root**。flow-root 是专门使元素 BFC 的一个 CSS 属性。

## 清除浮动的几种方式：

清除浮动有两种思路：

1. 在容器末尾添加一个 `clear: both;` 元素，可以使用一个空元素或者伪元素
2. 使容器成为 BFC

注意为了兼容 IE6、IE7，需要在容器上加一条 `*zoom: 1;` 样式来触发 haslayout

## 三栏自适应布局的实现

[案例](https://codepen.io/pengxiaomeng/pen/PoZzaPg)

实现三栏可以使用的方法是：浮动布局、flex 布局、inline-block 布局、网格布局、table 布局、绝对定位布局六种
实现自适应的方法是：margin、padding、calc、BFC（对于 float 布局来说），-margin 或者 translate

## 多列等高布局

1. 构建假背景
2. flexbox 布局
3. table 布局
4. 正填充+负边距

[案例](https://codepen.io/pengxiaomeng/pen/jOWrvyJ)

## 元素居中的实现

[案例](https://codepen.io/pengxiaomeng/pen/oNbEBjJ)

## 移动端 1px 像素边框的实现

```less
.border(
  @borderWidth: 1px;
  @borderStyle: solid;
  @borderColor: @lignt-gray-color;
  @borderRadius: 0) {
  position: relative;
  &:before {
    content: '';
    position: absolute;
    width: 98%;
    height: 98%;
    top: 0;
    left: 0;
    transform-origin: left top;
    box-sizing: border-box;
    pointer-events: none;
  }
  @media (min-device-pixel-ratio: 2) {
    &:before {
      width: 200%;
      height: 200%;
      transform: scale(.5);
    }
  }
  @media (min-device-pixel-ratio: 2.5) {
    &:before {
      width: 250%;
      height: 250%;
      transform: scale(.4);
    }
  }
  @media (min-device-pixel-ratio: 2.75) {
    &:before {
      width: 275%;
      height: 275%;
      transform: scale(0.36);
    }
  }
  @media (min-device-pixel-ratio: 3) {
    &:before {
      width: 300%;
      height: 300%;
      transform: scale(0.33);
    }
  }
  .border-radius(@borderRadius);
    &:before {
        border-width: @borderWidth;
        border-style: @borderStyle;
        border-color: @borderColor;
    }
}

.border-all(
	@borderWidth: 1px;
	@borderStyle: solid;
	@borderColor: @lignt-gray-color;
	@borderRadius: 0) {
  .border(@borderWidth; @borderStyle; @borderColor; @borderRadius);
}
```

## display有哪些值？说明他们的作用

## position的值releave和absolute定位远点是？

## CSS3

css3新增了一些属性，像flex，这是css3中很重要的改变，所以除了flex以外的垂直水平居中的技巧都是属于css2的。
- css2的水平居中技巧
将元素display为行内元素，再text-align:center;即可
或者
将块级元素定义一个宽度，再margin: 0 auto;即可
- css3的水平居中技巧
将元素display设为flex，再通过justify-content: center; 实现居中。
- css2的垂直居中技巧
单行内容的垂直居中可以通过设置相同height值和line-height值来实现。
多行内容的垂直居中且高度可变可以通过设置上下相同的padding值来实现。
行级盒子：小图标和标题对齐设置vertical-align: middle。
绝对定位：top:50%; left:50%;的方法，需要已知块级的宽高
- css3的垂直居中技巧
将元素display设为flex，再通过align-items:center;来实现。
