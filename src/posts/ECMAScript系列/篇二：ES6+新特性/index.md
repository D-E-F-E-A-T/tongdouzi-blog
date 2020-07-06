---
title: ECMAScript系列篇二：ES6+新特性
date: 2020-01-06
categories:
  - 技术
tags:
  - linux
featureImage: ../ECMAScript.png
---

## ES6 新特性

### Symbol

ES6新特性中新增了一种原始类型 `Symbol`：

```js
var symbol = Symbol();  // 与 String/Boolean/Number 类似，可以使用 Symbol 创建 symbol 值
typeof symbol;      // "symbol"
```

symbol 值像数字和字符串一样，可以作为对象属性的键。symbol 键设计的初衷就是避免冲突，每一个 symbol 值都独一无二，不与其它 symbol 等同，即使二者有相同的描述也不相等：

```js
Symbol('aaa') === Symbol('aaa'); // false
Symbol.for('aaa') === Symbol.for('aaa'); // true
```

> 与任何其他原始类型的值不同，symbol 值不能被自动转换成字符串，尝试拼接 symbol 值与字符串将报错：

```js
console.log(Symbol() + '---');  // Uncaught TypeError: Cannot convert a Symbol value to a string
console.log(Symbol().toString() + '---');   // Symbol()---
```

JavaScript 中最常见的对象检查的特性会忽略 symbol 键。如 `for ... in` 循环、`Object.keys(obj)` 和 `Object.getOwnPropertyNames(obj)` 只会遍历对象的字符串键，symbol 键直接跳过。但是 symbol 也不完全是私有的：用新的API `Object.getOwnPropertySymbols(obj)` 和 `Reflect.ownKeys(obj)` 就可以列出对象的 symbol 键：

```js
var obj = {
    [Symbol()]: 'aaaa'  // 必须使用 [] 括起来
}
Object.keys(obj);   // []
Object.getOwnPropertySymbols(obj);   // [Symbol()]
```

### for ... of

在 ES5 之前遍历数组：

```js
var arr = ['zero', 'one', 'two', 'three'];
for(var i = 0, len = arr.length; i < len; i++){
	console.log(i + ' : ' + arr[i]);
}
```

在 ES5 中可以使用 `.forEach()` 方法来遍历数组：

```js
var arr = ['zero', 'one', 'two', 'three'];
arr.forEach(function(n, i){
	console.log(i + ' : ' + n);
});
```

但是使用 `.forEach()` 方法不能使用 `continue` 关键字来跳过本次循环，不能使用 `break` 来终止循环，也不能使用 `return` 来终止函数。

ES5 还支持使用 `for ... in` 语法来遍历对象或者数组：

```js
var arr = ['zero', 'one', 'two', 'three'];
for(var key in arr){
	console.log(key + ' : ' + arr[key]);
}
```

但是 `for ... in` 是为遍历对象而设计的语法，会遍历出对象的**可枚举属性**。遍历数组时不但会遍历数组元素，还会遍历出自定义属性和原型链上的属性。

```js
var arr = ['zero', 'one', 'two', 'three'];
arr.name = 'pxm';
for(var key in arr){
	console.log(key + ' : ' + arr[key]);   // 会遍历出 name : pxm
}

function A () {};
A.prototype.foo = 1;
var a = new A();
a.bar = 2;
for(var key in a) {
  console.log(key + ' : ' + a[key]);  // bar : 2 foo : 1
}
```

ES6 带来了 `for ... of` 语法，这种语法有更强的扩展能力，可以用来遍历数组以及任何 `iterable` 对象：

```js
var arr = ['zero', 'one', 'two', 'three'];
arr.name = 'pxm';
for(var value of arr){
	console.log(value);     // 不会遍历出 pxm
}

function A () {};
A.prototype.foo = 1;
var a = new A();
a.bar = 2;
for(var value of a) { // Uncaught TypeError: a is not iterable
  console.log(value);
}
```

### Iterator

`for ... of` 语法设计的目的是遍历任何 `iterable` 对象。所谓 `iterable` 对象就是实现了 `Symbol.iterator` 方法的对象，String、Array、TypedArray、Map 和 Set 对象就内置实现了 `Symbol.iterator` 方法：

```js
console.log(Array.prototype[Symbol.iterator]); // f values() { [native code] }
console.log(Map.prototype[Symbol.iterator]); // ƒ values() { [native code] }
console.log(String.prototype[Symbol.iterator]); //ƒ [Symbol.iterator]() { [native code] }
```

`Symbol.iterator` 方法返回一个迭代器对象，迭代器对象包含一个 `.next()` 方法，`.next()` 方法的每次调用，都会返回一个迭代结果对象。
这个迭代结果对象包含一个表示本次迭代的值的 value 属性和一个表示迭代是否接触的 done 属性：

```ts
interface IteratorResult<T> {
  done: boolean;
  value: T;
}

interface Iterator<T> {
  next(): IteratorResult<T>;
}

interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
```

简单实现一个 `Symbol.iterator` 方法并迭代：

```js
function MyIterable () {
  this.store = Array.prototype.slice.call(arguments)
}
MyIterable.prototype[Symbol.iterator] = function () {
  var store = this.store
  return {
    next: function () {
      return {
        done: store.length === 0,
        value: store.pop(),
      }
    }
  }
}
```

```js
var iterable = new MyIterable('zero', 'one', 'two')
var iterator = iterable[Symbol.iterator]()
do {
  var rst = iterator.next()
  if (!rst.done) console.log("value: " + rst.value)
} while (!rst.done)
```

使用 `for ... of` 语法简化迭代过程：

```js
var iterable = new MyIterable('zero', 'one', 'two')
for (var value of iterable) {
  console.log("value: " + value)
}
```

### Generators

Generators 是一个特殊的函数，其特殊之处是在执行过程中，可以暂停执行。普通函数开始执行时推入调用栈，函数结束执行栈弹出调用栈，如果外部没有持有对其堆栈的引用，垃圾回收机制会在之后回收掉其堆栈结构。Generators 函数在执行过程中遇到 `yield` 语句可以暂停执行，弹出调用栈，但是这个堆栈结构不会被销毁，下次可以重新激活，堆栈结构重新入栈并且继续执行。

Generators 使用 `function*` 关键字声明，使用 `yield` 关键字暂停执行，使用 `return` 关键字结束执行：

```js
function* MyIterable () {
  var store = Array.prototype.slice.call(arguments)
  for (var i = 0; i < store.length; i++) {
    yield store[i]
  }
  return 'hello'
}
```

Generators 调用将会返回一个 iterable 对象，迭代这个 iterable 对象，每次迭代的值是 Generators 函数体中 yeild 关键字指定的值，调用这个 iterable 对象的 `next()` 方法可以让 Generators 恢复执行：

```js
var iterable = MyIterable('zero', 'one', 'two')
for (var value of iterable) {
  console.log("value: " + value)
}
```

但是有意思的是，Generators 返回的 iterable 对象最后一次调用 `next()` 方法时，返回结果的 done 值是 true，value 值是 Generators 中的 `return` 关键字指定的值：

```js
var iterable = MyIterable('zero', 'one', 'two')
iterable.next() // {value: "zero", done: false}
iterable.next() // {value: "one", done: false}
iterable.next() // {value: "two", done: false}
iterable.next() // {value: "hello", done: true}
```

还有一个更有意思的地方是，Generators 返回的 iterable 对象的 `next()` 方法可以传参，这个参数将传给上一次 `yield` 语句左边的变量：

```js
function* MyIterable () {
  var store = Array.prototype.slice.call(arguments)
  var result = ''
  for (var i = 0; i < store.length; i++) {
    var val = yield store[i]
    console.log('val', val)
    result += val
  }
  return result
}

var iterable = MyIterable('zero', 'one')
iterable.next()  // {value: "zero", done: false}
iterable.next('hello')  // val hello  // {value: "one", done: false}
iterable.next('world') // val world // {value: "helloworld", done: true}
```

[参考生成器 MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*)

### Promises

传统的使用回调的方式写异步过程的方式让我们陷入**回调地狱**的问题，同时剥夺了我们使用 `return` 和 `throw` 这些关键字的能力，因此 ES6 推出 Promise 提供全新的异步编程方式。

Promise 对象本质上是一个状态机。Promise 对象的初始化状态是 `pedding`，`pedding` 状态可以转换成 `fulfilled` 或者 `rejected` 状态中的一种，并且一旦状态确定不能再更改。Promise 构造函数接收一个函数作为参数，在这个函数中接收两个回调：

```js
const promi = new Promise(function(resolve, reject){
  // resolve() 将 promise 对象的状态置为 fulfilled
  // reject() 将 promise 对象的状态置为 rejected
  // promise 内部发生异常时 promise 对象的状态也会被置为 rejected
  setTimeout(function(){
    var random = Math.random();
    if(random > 0.5){
      resolve('resolve:' + random);
    }else{
      reject('reject:' + random);
    }
  }, 1000);
})
```

promise 对象的 `.then()` 方法用来注册 promise 对象状态确定后的回调。`.then()` 方法第一个参数是 promise 对象转化为 `fulfilled` 状态的回调，第二个参数是 promise 对象转化为 `rejected` 状态的回调：

```js
promi.then(function(data){ // fulfilled 回调接收的参数就是 promise 对象调用 resolved() 时传递的数据
  console.log(data);
}, function(data){  // rejected 回调接收的参数就是 promise 对象调用 reject() 方法时传递的参数或者发生异常时的异常对象
  console.log(data);
});
```

`.then()` 方法返回一个新的 Promise 对象。因此可以链式调用 `.then()`。新的 Promise 对象的状态取决于 fulfilled 回调或者 rejected 回调 return 的值：

- 当返回值不是 promise 对象时，新的 promise 对象的状态与原 promise 对象状态保持一致，返回值也会传递到新 promise 对象的回调中

```js
new Promise(function(resolve, reject){
  setTimeout(function(){
    resolve('resolve...');
  }, 1000);
}).then(function(data){
  console.log(data);  // resolve...
  return data;
}).then(function(data){
  console.log(data);  // resolve...
});
```

- 当返回值是 promise 对象时，新的 promise 对象就直接用这个返回的 promise 对象

```js
new Promise(function(resolve, reject){
  setTimeout(function(){
    resolve('resolve...');
  }, 1000);
}).then(function(data){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
        reject('reject...');
    }, 1000);
  });
}).catch(function(data){  // .catch(fn) 相当于 .then(null, fn)
    console.log(data);  // reject...
});
```

为了理解 Promise 的行为，简单实现 Promise 的代码如下：

```js
function Promise(executor) {
  var self = this;
  this.status = 'pending';    // pedding | fulfilled | rejected
  this.value = undefined;
  this.onResolvedCallback = [];
  this.onRejectedCallback = [];
  // 将 promise 对象的状态置为 fulfilled
  function resolve() {
    self.status = 'fulfilled';
    self.onResolvedCallback.forEach(function (callback) {
      callback();
    });
  }
  // 将 promise 对象的状态置为 rejected
  function reject() {
    self.status = 'rejected';
    self.onRejectedCallback.forEach(function (callback) {
      callback();
    });
  }
  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
Promise.prototype.then = function (onResolve, onReject) {
  var self = this;
  return new Promise(function (resolve, reject) {
    function resolveHandler() {
      var res = onResolve();
      if (res instanceof Promise) {
        res.then(resolve, reject);
        return;
      }
      resolve();
    }
    function rejectHandler() {
      var res = onReject();
      if (res instanceof Promise) {
        res.then(resolve, reject);
        return;
      }
      reject();
    }
    if (self.status === 'fulfilled') {
      resolveHandler();
    } else if (self.status === 'rejected') {
      rejectHandler()
    } else {
      self.onResolvedCallback.push(resolveHandler);
      self.onResolvedCallback.push(rejectHandler);
    }
  });
}
```

参考：
[Implementing](https://www.promisejs.org/implementing/)
[剖析Promise内部结构](https://github.com/xieranmaya/blog/issues/3)

Promise 还提供了两个重要的静态方法：`Promise.all()` 和 `Promise.race()`。这两个方法可以连接多个 promise 对象构造一个新的 promise 对象，这个新的 promise 对象的状态取决于其连接的各个 promise 对象。

`Promise.all()`：当连接的 promise 对象的状态都转化为 fulfilled 时，Promise.all() 对象的状态转化为 fulfilled；当连接的 promise 对象中任一一个的状态转化为 rejected 时，Promise.all() 对象的状态**`立即`**转化为 rejected。

```js
var promise1 = new Promise(function(resolve, reject){
  setTimeout(function(){
    Math.random() > 0.5 ? resolve('promise1...') : reject('promise1...');
  }, 1000);
});
var promise2 = new Promise(function(resolve, reject){
  setTimeout(function(){
    resolve('promise2...');
  }, 2000);
});
Promise.all([ promise1, promise2 ]).then(function(results){
  console.log('resolve:', results);   // 2s后：resolve: ["promise1...", "promise2..."]
}, function(results){
  console.log('reject:', results);   // 1s后：reject: promise1...
});
```

`Promise.race()`：Promise.race() 对象的状态只取决于连接的所有 promise 对象中第一个状态确定的 promise 对象，这个 promise 对象的状态是 fulfilled，则 Promise.race() 对象的状态为 fulfilled；这个 promise 对象的状态是 rejected，则 Promise.race() 对象的状态为 rejected

```js
var promise1 = new Promise(function(resolve, reject){
  setTimeout(function(){
    Math.random() > 0.5 ? resolve('promise1...') : reject('promise1...');
  }, 1000);
});
var promise2 = new Promise(function(resolve, reject){
  setTimeout(function(){
    resolve('promise2...');
  }, 2000);
});
Promise.race([ promise1, promise2 ]).then(function(result){
  console.log('resolve:', result);   // 1s后：resolve: promise1...
}, function(result){
  console.log('reject:', result);   // 1s后：reject: promise1...
});
```

### Arrow functions

```js
const foo = () => {
  //...
}
```

```js
const foo = () => doSomething()
```

```js
const foo = param => doSomething(param)
```

this绑定

### let & const
### Classes

在没有 class 之前实现类继承的方式主要有以下几种：

- 对象冒充

```js
function Pet(){
	this.race;
	this.setRace = function(race){
		this.race = race;
	}
	this.getRace = function(){
		return this.race;
	}
}
function Dog(){
	this.Pet = Pet;
	this.Pet();
	delete this.Pet();

	this.name;
	this.setName = function(name){
		this.name = name;
	}
	this.getName = function(){
		return this.name;
	}
}
var dog = new Dog();
dog.setRace('Dog');		// 继承了setRace方法
dog.setName('旺财');
console.log(dog);		// Dog {race: "Dog", name: "旺财"}
```

- call/apply

```js
function Pet(){
	this.race;
	this.setRace = function(race){
		this.race = race;
	}
	this.getRace = function(){
		return this.race;
	}
}
function Dog(){
	Pet.apply(this, arguments);

	this.name;
	this.setName = function(name){
		this.name = name;
	}
	this.getName = function(){
		return this.name;
	}
}
var dog = new Dog();
dog.setRace('Dog');		// 继承了setRace方法
dog.setName('旺财');
console.log(dog);		// Dog {race: "Dog", name: "旺财"}
```

- prototype

```js
function Pet(){
	this.race;
	this.setRace = function(race){
		this.race = race;
	}
	this.getRace = function(){
		return this.race;
	}
}
function Dog(){
	this.name;
	this.setName = function(name){
		this.name = name;
	}
	this.getName = function(){
		return this.name;
	}
}
Dog.prototype = new Pet();

var dog = new Dog();
dog.setRace('Dog');		// 继承了setRace方法
dog.setName('旺财');
console.log(dog);		// Dog {race: "Dog", name: "旺财"}
```

ES6 的 class 和 extends 关键字的出现给出了一个统一的规范。class 用来定义一个类，大大简化了类的定义方式：

```js
class Dog {
  constructor(name, age){     // 构造方法
    this.name = name;
    this._age = age;
  };
  get age(){              // 属性 getter
    return this._age;
  };
  set age(val){           // 属性 setter
    if (!Number.isInteger(val))
      throw new Error("必须为整数。");
    this._age = val;
  };
  static bark(){          // 静态方法
    alert('旺旺！');
  }
}
var dog = new Dog('旺财', 18);
dog.name        // "旺财"
dog.age         // 18
dog.age = 1.1   // VM247:11 Uncaught Error: 必须为整数。
Dog.bark()      // 旺旺！
```

> class 语法并没有提供实例属性和静态属性的支持，ES7 有提案，可能在将来的版本中实现。

ES6 的 extends 关键字用来在 class 实现继承：

```js
class Pet {
	constructor(race) {
		this.race = race;
	}
	setRace(race) {
		this.race = race;
	}
	getRace() {
		return this.race;
	}
}
class Dog extends Pet {
	constructor(name) {
		super();    // 调用父类的构造方法
		this.name = name;
	}
	setName(name) {
		this.name = name;
	}
	getName() {
		return this.name;
	}
}
var dog = new Dog();
dog.setRace('Dog'); // 继承了setRace方法
dog.setName('旺财');
console.log(dog); // Dog {race: "Dog", name: "旺财"}
```

为了使新创建的类继承所有的静态属性，我们需要让这个新的函数对象继承超类的函数对象；同样，为了使新创建的类继承所有实例方法，我们需要让新函数的 `prototype` 对象继承超类的 `prototype` 对象。

创建一个类的时候，类的定义中有一个 `constructor` 方法，依据这个方法创建了一个新的函数，这个函数拥有类的静态属性；然后我们又创建一个对象并将它赋给这个函数的 `prototype` 属性，这个对象拥有类的实例属性。

为了使新创建的类继承所有的静态属性，我们需要让这个新的函数对象继承超类的函数对象；同样，为了使新创建的类继承所有实例方法，我们需要让新函数的 `prototype` 对象继承超类的 `prototype` 对象。

由构造函数构造的对象的原型取决于构造函数的 `prototype` 属性，因此改变构造函数 `prototype` 属性即可实现。但是对于静态属性，不能再定义函数的同时改变他的原型。只不过你可以通过 `Object.setPrototypeOf()` 方法绕过这一限制：

```js
class Dog {
}
// 连结实例属性
Object.setPrototypeOf(Dog.prototype, Pet.prototype);
// 连结静态属性
Object.setPrototypeOf(Dog, Pet);
```

但随即带来的问题是，这个方法性能很差，而 JS 引擎又很难对其进行优化，所以我们期待一种更完美的方法，能够在创建函数的同时处理好原型。

`super` 是一个全新的关键字，它可以帮我们绕开我们在子类中定义的属性和方法，直接从子类的原型开始查找属性，从而绕过我们覆盖到父类上的同名方法。在子类的构造函数中，可以使用 `super()` 调用父类的构造方法。

在子类中执行父类的构造函数前，this 对象还没有被分配，因此在使用 `super()` 调用父类的构造函数之前访问 this 会出发一个引用错误。当然，不利用父类的构造函数产生对象而是直接构造一个对象返回的方式不需要使用 `super()`

### Proxys

ECMAScript 标准委员会定义了一个适用于所有对象的由 14 种**内部**方法组成的集合，这些内部方法有：
<!--
- `obj.[[Get]](key, receiver)` – 读取对象属性值操作时被调用，如 obj.prop 或 obj[key]
- `obj.[[Set]](key, value, receiver)` – 设置对象属性值操作时被调用，如 obj.prop = value 或 obj[key] = value
- `obj.[HasProperty]` – 检测对象中是否存在某属性时被调用，如 key in obj
- `obj.[Enumerate]` – 列举对象的可枚举属性时被调用，如 for (key in obj)
- `obj.[GetPrototypeOf]` – 获取对象的原型时被调用，如 obj.[__proto__] 或 Object.getPrototypeOf(obj)。
- `obj.[[Call]](thisValue, arguments)` – 调用一个函数时调用，如 obj() 或 x.method()
- `obj.[[Construct]](arguments, newTarget)` – 调用构造函数时调用，如 new Date(2890, 6, 2)
- ... -->

- `get(target, propKey, receiver)`：拦截对象属性的读取，比如 proxy.foo 和 proxy['foo'] 。
- `set(target, propKey, value, receiver)`：拦截对象属性的设置，比如 proxy.foo = v 或 proxy['foo'] = v ，返回一个布尔值。
- `has(target, propKey)`：拦截 propKey in proxy 的操作，返回一个布尔值。
- `deleteProperty(target, propKey)`：拦截 delete proxy[propKey] 的操作，返回一个布尔值。
- `ownKeys(target)`：拦截 Object.getOwnPropertyNames(proxy) 、 Object.getOwnPropertySymbols(proxy) 、Object.keys(proxy) 、for...in 循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 Object.keys() 的返回结果仅包括目标对象自身的可遍历属性。
- `getOwnPropertyDescriptor(target, propKey)`：拦截 Object.getOwnPropertyDescriptor(proxy, propKey) ，返回属性的描述对象。
- `defineProperty(target, propKey, propDesc)`：拦截 Object.defineProperty(proxy, propKey, propDesc） 、Object.defineProperties(proxy, propDescs) ，返回一个布尔值。
- `preventExtensions(target)`：拦截 Object.preventExtensions(proxy) ，返回一个布尔值。
- `getPrototypeOf(target)`：拦截 Object.getPrototypeOf(proxy) ，返回一个对象。
- `isExtensible(target)`：拦截 Object.isExtensible(proxy) ，返回一个布尔值。
- `setPrototypeOf(target, proto)`：拦截 Object.setPrototypeOf(proxy, proto) ，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
- `apply(target, object, args)`：拦截 Proxy 实例作为函数调用的操作，比如 proxy(...args)、proxy.call(object, ...args) 、proxy.apply(...) 。
- `construct(target, args)`：拦截 Proxy 实例作为构造函数调用的操作，比如 new proxy(...args) 。

这些内部方法在一般的JS代码中是不可见的，但是借助 ES6 的代理特性，可以用任意 JS 代码替换这些内部方法。

ES66 规范定义了一个 Proxy 全局构造函数：

```js
var target = {}, handler = {}
var proxy = new Proxy(target, handler);
```
target 是代理的目标对象，在代理对象 proxy 上所有的内部方法都会转发至 target：

```js
proxy.name = "旺财";
target.name     // "旺财"
```

而 handler 中可以覆写代理对象上任何内部方法：

```js
var arr = [1,2,3];
var proxyArr = new Proxy(arr, {
  get: function (target, name) {
    if (name in target || (+name >= 0 && +name < 4294967295)) {
      return target[name];
    } else {
      throw "非法索引";
    }
  },
  set: function (target, name, val) {
    if (name in target || (+name >= 0 && +name < 4294967295)) {
      target[name] = val;
    } else {
      throw "非法索引";
    }
  }
})
proxyArr[999999999999]           //抛出异常,"非法索引"
proxyArr["foo"] = 1              //抛出异常,"非法索引"
```

### Modules
### Multiline strings
### Template literals
### Default parameters
### The spread operator
### Destructuring assignments
### Enhanced object literals
### Map & Set

在 Javascript 中，一个普通的对象就只是一个开放的键值对集合，可以进行获取、设置、删除、遍历——任何一个哈希表支持的操作。

大多数情况下只需要使用对象来存储键值对就行了，不需要使用 Set 和 Map 这些 ES6 新特性。但是使用对象存储键值对的方式存在以下的局限性：

- 对象的键名总是字符串（当然，ES6 中也可以是Symbol）而不能是另一个对象
- 对象会通过原型链继承一些不需要的属性，并且自定义的属性名很可能与这些继承的属性冲突
- 没有有效的获知属性个数的方法
- ES6 中的 `for...of` 循环不能遍历纯粹的对象

因此，ES6 中定义了两种新的集合类型：

- Map：一个键值对构成的集合
- Set：一群值的集合

Map 支持以下操作：

- new：`new Map()` 返回一个空 Map，`new Map(pairs)` 根据所含元素形如 `[key, value]` 的数组 pairs 来创建一个新的Map
- set：`.set(key, value)` 添加一对新的键值对，key 可以是字符串/Symbol，也可以是对象。如果 Map 中已经存在 key 相同的值，会直接覆盖
- get：`.get(key)` 返回一个键名对应的值
- delete：`.delete(key)` 按键名删除一项
- has：`.has(key)` 测试一个键名是否存在
- clear：`.clear()` 清空Map
- size：`.size` 获取 Map 中项目的个数
- traversal：`.keys()` 返回所有键的迭代器，`.values()` 返回所有值的迭代器，`.entries()/[Symbol.iterator]` 返回所有键值对的迭代器，`.forEach(f)` 遍历所有的键值对

```js
var map = new Map([['name', '旺财']]);
map.get('name');        // "旺财"
map.set('name', '来福');    // Map {"name" => "来福"}
map.get('name');    // "来福"
```

Set 支持以下操作：

- new：`new Set()` 创建一个空的 Set，`new Set(iterable)` 创建一个由可迭代对象的所有迭代值组成的 Set
- add：`.add(value)` 向集合中添加一个值，如果 Set 中已经存在相同的值，不会产生任何效果
- delete：`.delete(value)` 从集合中删除一个值
- size：`.size` 获取集合中值的个数
- has：`.has(value)` 判断 Set 中是否包含指定的值
- clear：`.clear()` 清空 Set
- traversal：`.keys()` 返回所有键的迭代器，`.values()` 返回所有值的迭代器，`.entries()/[Symbol.iterator]` 返回所有键值对的迭代器，`.forEach(f)` 遍历所有的键值对。Set 的 key 和 value 是一样的，Set 上定义这些方法是为了兼容 Map

```js
var set = new Set('abc');
set.size    // 3
set.add('a');   // Set {"a", "b", "c"}
set.size    // 3
```

WeakMap 和 WeakSet 与 Map、Set 的行为几乎一样，但是有以下限制：

- WeakMap 只支持 new、has、get、set 和 delete。
- WeakSet 只支持 new、has、add 和 delete。
- WeakSet 的值和 WeakMap 的键必须是对象。

这两种弱集合都不可迭代，除非专门查询或给出你感兴趣的键，否则不能获得一个弱集合中的项。这些设计的限制让垃圾回收机制能回收仍在使用中的弱集合里的无效对象。

## ES7 新特性

### Array.prototype.includes()
### 求幂运算符(**)

## ES8 新特性

### 字符串填充（padStart 和 padEnd）
### Object.values
### Object.entries
### Object.getOwnPropertyDescriptors()
### 函数参数列表和调用中的尾随逗号
### **Async Functions**
### 共享内存 和 Atomics

## ES9 新特性

### Rest(剩余)/Spread(展开) 属性
### Asynchronous iteration （异步迭代）
### **Promise.prototype.finally()**
### 正则表达式改进：先行断言(lookahead) 和 后行断言(lookbehind)、Unicode 属性转义 \p{…} 和 \P{…}、命名捕获组（Named capturing groups）、正则表达式的 ‘s’ 标志

## 提案中

### Decorator

Decorator 提案到目前为止还处在 stage 2 阶段，在 TypeScript 里也仅作为一项实验性特性，但是在 Babel 的加持下，已被广泛使用。

Decorator 是一种与类相关的语法，用来装饰类和方法。Decorator 就是一个函数：

```js
function logged (target) {
  console.log(target)
  return target
}

function readonly(target, name, descriptor){
  descriptor.writable = false
  return descriptor
}

@logged
class A () {
  @readonly
  foo () {}
}
```

相当于：

```js
A = logged(A) || A
Object.defineProperty(A.prototype, 'foo', descriptor);
```
