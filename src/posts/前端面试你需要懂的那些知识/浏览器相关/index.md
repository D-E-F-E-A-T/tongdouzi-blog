---
title: 前端面试你需要懂的那些知识 - 浏览器相关
date: 2020-06-06
categories:
  - 技术
tags:
  - 前端
featureImage: ../前端面试.jpg
---

## DOM 事件绑定的几种方式？

1. 在 HTML 中绑定 DOM0 级别事件

```html
<!-- onclick 属性值是 js 代码片段。在 js 代码片段中的 this 指向当前目标元素，event 指向事件对象 -->
<button type="button" onclick="console.log(this);console.log(event)">按钮</button>
```

2. 在 JS 中绑定 DOM0 级别事件

```html
<button type="button">按钮</button>
<script type="text/javascript">
	function handleClick (e) {
		console.log(this)
		console.log(e)
	}
	var btn = document.querySelector('button')
	// 将一个函数赋值给元素的 onclick 属性，在函数中 this 指向当前目标元素，第一个参数为事件对象
	btn.onclick = handleClick
</script>
```

3. 在 JS 中绑定 DOM2 级别事件

```html
<button type="button">按钮</button>
<script type="text/javascript">
	function handleClick (e) {
		console.log(this)
		console.log(e)
	}
	var btn = document.querySelector('button')
	// 使用 DOM2 级别的 addEventListener 方法绑定函数，函数中的 this 指向当前目标元素，第一个参数为事件对象
	btn.addEventListener('click', handleClick, false)
</script>
```

## DOM 事件中的 target 和 currentTarget 的区别

DOM 事件的发生需要经历三个阶段：捕获阶段、目标阶段、冒泡阶段

捕获阶段事件从 window 向下传递到事件源元素
目标阶段事件发生在事件源元素
冒泡阶段事件从事件源元素向上传递的 window

在这三个阶段中，target 永远指向事件源元素，currentTarget 则指向当前事件传递到的元素，与 this 指向相同

## webStorage 和 cookie 的区别？

cookie 的设计初衷是解决登录状态保持问题。http 是无状态的协议，以一问一答的方式工作。每次问答之间没有任何的状态保持。服务器在返回 http 响应时，在 setCookie 响应头中设置 cookie 及其有效期等信息，浏览器接收到响应后将 cookie 存储在本地。浏览器对服务器下一次请求时，浏览器自动使用 Cookie 请求头带到服务器。

而 webStorage 是 html5 规范中新的 API，可以实现在本地存储一下数据，其中 localStorage 中存储的数据永久有效，sessionStorage 中存储的数据在浏览器关闭之前有效。

cookie 数据时需要通过 http 在浏览器和服务器之间传递的，因此存储的数据量不能超过 4k。而 webStorage 仅仅保存在本地，因此数据量可以达到 5M 或者更多。
