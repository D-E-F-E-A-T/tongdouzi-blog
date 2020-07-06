---
title: 前端面试你需要懂的那些知识 - 移动端相关
date: 2020-06-06
categories:
  - 技术
tags:
  - 前端
featureImage: ../前端面试.jpg
---

## 移动端碰到过什么样的兼容性

- fixed 定位在软键盘弹起后 absolute 化，解决方案：使用局部滚动取代全局滚动，使用 absolute 取代 fixed 定位。注意在 IOS 中滚动元素需要加上 `-webkit-overflow-scrolling: touch;` 是滚动恢复弹性
- 使用 :active 伪类做按钮的点击态效果时，IOS 中 :active 伪类无效，在 body 上绑定一个 touchstart 事件处理函数即可

> 其实，在 PC 端也有使用 transform 后子元素中 fixed 定位 absolute 化的问题
> mozilla开发社区: [1] By default, Safari Mobile does not use the :active state unless there is a touchstart event handler on the relevant element or on the `<body>`.

## 移动端 click 事件的 300ms 延时？点透问题？

最初 iPhone 推出的时候，还没有移动互联网的概念，网站都是为 PC 设计的。于是 iPhone 的工程师约定，在 iPhone 的 Safari 浏览网页，使用 double tap 手势或者双指拉伸事件缩放页面。因此当用户点击一个按钮时，Safari 需要等待 300ms 看有没有再次点击，是需要放大页面还是触发按钮的 click 事件？之后，其他手机浏览器都默认了 Safari 的约定。因此移动端的 click 事件有 300ms 的延时。

伴随着 click 事件 300ms 延时的是点透问题。比如页面上有一个遮罩，遮罩下面有一个按钮。当点击遮罩的时候，浏览器记录点击位置等待 300ms，300ms 之内如果由于某种原因（例如touchend事件中）遮罩突然关闭了，300ms 之后，浏览器会去获取记录的点击位置处的元素，在这个元素上分派 click 事件。于是，我们在遮罩上的点击事件，在按钮上触发了，这种现象就是移动端点透现象。

300ms 延时的解决方案：

1. 设置 `<meta name="viewport" content="width=device-width">` Android 上的 Chrome 32+ 会禁用 300ms 延时；
2. 设置 `<meta name="viewport" content="user-scalable=no">` Android 上的 Chrome（所有版本）都会禁用 300ms 延时；
3. 使用 zepto 的 tap 事件取代 click 事件
4. 使用 Fastclick 库兼容处理

事件点透的解决方案：

1. 根本解决方案是使用上述手段消除 300ms 延时
2. touchend 事件处理函数中阻止默认行为
3. css3 的 pointer-events
4. touchend 事件处理函数中延时300ms之后才让遮罩消失

js 消除 300ms 延时的简单实例：

```html
<button type="button" onclick="alert(new Date() - window.startTime)" ontouchstart="window.startTime = new Date()">按钮</button>
<script>
	var btn = document.querySelector('button')
	var startTime, startX, startY, deltaTime, deltaX, deltaY;
	btn.addEventListener('touchstart', function (e) {
		startTime = new Date()
		startX = e.changedTouches[0].pageX
		startY = e.changedTouches[0].pageY
	}, false)
	btn.addEventListener('touchend', function (e) {
		deltaTime = new Date - startTime
		deltaX = e.changedTouches[0].pageX - startX
		deltaY = e.changedTouches[0].pageY - startY
		if (deltaTime < 700 && deltaX < 10 && deltaY < 10) {
			e.preventDefault()
			btn.click()
		}
	}, false)

</script>
```

## 移动端高清适配解决方案？

- 以 bootstrap 为代表的的 **media query 方案**

```css
@media screen and (max-width: 600px) { /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
  /*你的css代码*/
}
```

- 以天猫首页为代表的 **flex 弹性布局**

viewport 固定为 device-width，高度定死，宽度自适应，元素都采用px做单位。

```html
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
```

- 以淘宝首页为代表的 rem + viewport 缩放

根据屏幕宽度设定 rem 值，需要适配的元素都使用 rem 为单位，不需要适配的元素还是使用 px 为单位。（1em = 16px

根据rem将页面放大dpr倍, 然后viewport设置为1/dpr.

如iphone6 plus的dpr为3, 则页面整体放大3倍, 1px(css单位)在plus下默认为3px(物理像素)
然后viewport设置为1/3, 这样页面整体缩回原始大小. 从而实现高清。


这样整个网页在设备内显示时的页面宽度就会等于设备逻辑像素大小，也就是device-width。
这个device-width的计算公式为：设备的物理分辨率/(devicePixelRatio * scale)，
在scale为1的情况下，device-width = 设备的物理分辨率/devicePixelRatio 。

- rem 方式

比如说“魅族”移动端的实现方式，viewport也是固定的：

```html
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">。
```

通过以下代码来控制rem基准值(设计稿以720px宽度量取实际尺寸)

```js
!function (d) {
	var c = d.document;
	var a = c.documentElement;
	var b = d.devicePixelRatio;
	var f;

	function e() {
		var h = a.getBoundingClientRect().width, g;
		if (b === 1) {
			h = 720
		}
		if(h>720) h = 720;//设置基准值的极限值
		g = h / 7.2;
		a.style.fontSize = g + "px"
	}

	if (b > 2) {
		b = 3
	} else {
		if (b > 1) {
			b = 2
		} else {
			b = 1
		}
	}
	a.setAttribute("data-dpr", b);
	d.addEventListener("resize", function () {
		clearTimeout(f);
		f = setTimeout(e, 200)
	}, false);
	e()
}(window);
```

CSS 中几种长度单位的区别：

`px`、`rem`、`em` 都是相对长度单位，但是相对的基准不一样：

`pt` 在css单位中属于真正的绝对单位，1pt = 1/72(inch)

- `px` 相对的是设备屏幕
- `rem` 相对的只是 `<HTML>` 根元素
- `em` 相对的是当前元素文本的字体尺寸

`rem` 和 `em` 的基准是可以调节的，而 `px` 则不可调节

设备的 `device-width` 计算公式：物理像素宽度 / (设备像素比 * 缩放)

在显示器领域的 ppi：每英寸多少像素数
在打印领域的 dpi：每英寸多少点

浏览器应该对css中的像素进行调节，使得浏览器中 1 css 像素的大小在不同物理设备上看上去大小总是差不多 ，目的是为了保证阅读体验一致。

DPR = 设备像素/CSS像素
