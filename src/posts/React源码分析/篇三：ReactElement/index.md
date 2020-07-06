---
title: Rect 源码分析篇三：Vitual DOM
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

虚拟 DOM 是 React 用来描述 UI 的工具，是在内存中模拟真实 DOM 的一棵树。实际上，React 支持的渲染目标早已不再仅仅是浏览器端的 DOM 环境，还可以是 ios/android 的 Native 环境，虚拟 DOM 这个名词已经不太恰当了。虚拟 DOM 是由 React Element 作为节点组成的一棵树。

## React Element & JSX

React 的 API 设计遵循的式声明式的编程范式，不同于 jQuery 的 API 设计遵循的是命令式编程范式。

- 命令式编程范式：行动导向（Action-Oriented），告诉计算机执行的步骤
- 声明式编程范式：目标驱动（Goal-Driven），告诉计算机希望的结果

在页面上渲染一个列表，jQuery 会这么做：

```js
const ul = $('<ul></ul>');
const li1 = $('<li>one</li>');
const li2 = $('<li>two</li>');
ul.append(li1);
ul.append(li2);
ul.appendTo(document.body);
// 也可以采用优雅的链式写法
$('<ul></ul>').append('<li>one</li>').append('<li>two</li>').appendTo(document.body);
```

jQuery 需要开发者明确告知怎么完成这件事情，具体步骤是什么：

1. 创建一个 ul 节点
2. 创建第一个 li 节点
3. 创建第二个 li 节点
4. 将第一个 li 节点挂载到 ul DOM 节点上
5. 将第二个 li 节点挂载到 ul DOM 节点上
6. 将 ul 节点挂载到 `document.body` 上

同样一件事情，React 的方式完全不一样：

```js
const App = () => (
  <ul>
    <li>one</li>
    <li>two</li>
  </ul>
);
ReactDOM.render(<App />, document.body);
```

React 只需要开发者告知你希望 UI 长什么样？React 自己会确保实际渲染的效果是你希望的样子：

- `document.body` 下面要有一个 ul 节点
- ul 节点要有两个 li 节点
- 其中一个 li 节点中的文本要是 `'one'`
- 另外一个 li 节点中的文本要是 `'two'`

那么问题来了，开发者怎么向 React 描述希望的 UI 长什么样子呢？在 JavaScript 中，当然只能用结构化的普通 JavaScript 对象来描述：

```js
const REACT_ELEMENT_TYPE = Symbol ? Symbol.for('react.element') : 0xeac7;
const vDOM = {
  $$typeof: REACT_ELEMENT_TYPE,
  ref: null,
  key: null,
  type: 'ul',
  props: {
    children: [
      {
        $$typeof: REACT_ELEMENT_TYPE,
        ref: null,
        key: null,
        type:'li',
        props: {
          children: ['one']
        },
      },
      {
        $$typeof: REACT_ELEMENT_TYPE,
        ref: null,
        key: null,
        type: 'li',
        props: {
          children: ['two']
        },
      },
    ],
  }
};
ReactDOM.render(vDOM, document.body);
```

描述 UI 的结构化的普通 JavaScript 对象就是所谓的虚拟 DOM。虽然虚拟 DOM 节点的结构比真实 DOM 节点已经简化了很多，但是直接手写整棵虚拟 DOM 树还是有点复杂的。像浏览器提供 `document.createElement()` 来创建 DOM 节点一样，React 也提供了 `React.createElement()` 来创建虚拟 DOM 节点，因此上面的代码可以简化为：

```js
const vDOM = React.createElement('ul', null, [
  React.createElement('li', null, 'one'),
  React.createElement('li', null, 'two'),
]);
ReactDOM.render(vDOM, document.body);
```

但是这还不够，类似浏览器中使用 HTML 标记语言描述真实 DOM 结构一样，React 创造了类 HTML 的 JSX 语法来简化开发者对 UI 的描述：

```js
const vDOM = (
  <ul>
    <li>one</li>
    <li>two</li>
  </ul>
);
ReactDOM.render(vDOM, document.body);
```

但是 JSX 语法不是标准的 JS 语法，直接在浏览器环境中是没有办法运行的。React 团队最初提供 `jsxtransformer.js` 来转换 JSX 语法，后来完全交给专业的 JS 语法转换工具 babel，babel 通过 [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx) 插件支持 JSX 语法。[这里](https://babeljs.io/repl)可以在线试玩。

再来看源码实现，与 React Element 相关的 API 都在 react 包中：

```js
// packages/react/src/React.js
import {
  createElement,
  createFactory,
  cloneElement,
  isValidElement,
} from './ReactElement';

import {
  createElementWithValidation,
  createFactoryWithValidation,
  cloneElementWithValidation,
} from './ReactElementValidator';

const React = {
  createElement: __DEV__ ? createElementWithValidation : createElement,
  cloneElement: __DEV__ ? cloneElementWithValidation : cloneElement,
  createFactory: __DEV__ ? createFactoryWithValidation : createFactory,
  isValidElement: isValidElement,
}

export default React;
```

开发环境下使用的 `*ElementWithValidation()` 加了一些前置的参数校验，最终还是会 `*Element.apply(this, arguments);`，所以具体 React Element 的操作细节看 `packages/react/src/ReactElement.js` 文件中的就行了：

```js
// packages/react/src/ReactElement.js
export function createElement(type, config, children) {
  let propName;

  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```

`React.createElement()` 做了 4 件事情：

- **拷贝** config 到 props，ref 和 key 除外，key 会被转换成字符串
- 添加 props.children 属性到 props：`React.createElement('span', null, 'hello', 'world')` 和 `React.createElement('span', null, ['hello', 'world'])`
- 拷贝类组件的 defaultProps 到 props 中
- 调用 `ReactElement()` 工厂方法创建 Element

再来看 `React.cloneElement()` 这个 API：

```js
// packages/react/src/ReactElement.js
export function cloneElement(element, config, children) {
  invariant(
    !(element === null || element === undefined),
    'React.cloneElement(...): The argument must be a React element, but you passed %s.',
    element,
  );

  let propName;

  // Original props are copied
  const props = Object.assign({}, element.props);

  // Reserved names are extracted
  let key = element.key;
  let ref = element.ref;
  // Self is preserved since the owner is preserved.
  const self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  const source = element._source;

  // Owner will be preserved, unless ref is overridden
  let owner = element._owner;

  if (config != null) {
    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // Remaining properties override existing props
    let defaultProps;
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps;
    }
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
          props[propName] = defaultProps[propName];
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
}
```

- 拷贝 element.props 到 props
- 拷贝 config 到 props：注意一种情况，想重置而不是覆盖 element.props 中的某个属性，在 config 中传 undefined 就好了，会取 type.defaultProps 中的属性值
- 添加 props.children 属性
- 调用 `ReactElement()` 工厂方法创建 Element

`React.createFactory()` 只是 `React.createElement()` 的柯里化：

```js
// packages/react/src/ReactElement.js
export function createFactory(type) {
  const factory = createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook: remove it
  factory.type = type;
  return factory;
}
```

最后看创建 Element 的工厂方法：

```js
// packages/react/src/ReactElement.js
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,

    type: type,
    key: key,
    ref: ref,
    props: props,

    _owner: owner,
  };
  return element;
};
```

## Component

React Element 降低了开发者描述 UI 的成本，但是当一个应用足够大时，虚拟树上存在成百上千个 React Element，管理维护这个虚拟树的难度还是很大。React 使用组件化的思想，将 UI 打碎成可以复用的组件，相当于在虚拟树上将一些分支截下来。例如下面这棵树：

```js
const tree = (
  <form>
    <h3>请填写：</h3>
    <p>
      <labe>姓</labe>
      <input type="text" />
    </p>
    <p>
      <labe>名</labe>
      <input type="text" />
    </p>
  </form>
)
```

这棵树虽然节点不是特别多，但是可以看到这棵树的某些分支结构高度相似，可以抽象成一个组件，减少主树的复杂度：

```js
const InputBox = ({label}) => (
  <p>
    <labe>{label}</labe>
    <input type="text" />
  </p>
)

const tree = (
  <form>
    <h3>请填写：</h3>
    <InputBox label={'姓'} />
    <InputBox label={'名'} />
  </form>
)
```

因此存在两种类型的 React Element：

- Host Element：宿主环境原生支持的类型，type 值一个字符串，如 `'div'`
- Composite Element：用户自定义的类型，type 值一个 Component，如 `InputBox`

React Component 是可复用的代码片段，它接收 props 和 state 作为输入，输出需要渲染的 React Element。可以是一个函数，也可以是一个实现了 `render()` 方法 `React.Component/React.PureComponent` 子类：

```js
// packages/react/src/React.js
import {Component, PureComponent} from './ReactBaseClasses';

const React = {
  Component,
  PureComponent,
}

export default React;
```

基类 `React.Component` 的代码很简单，原型对象上定义了一个属性 `.isReactComponent` 和两个方法 `.setState()`、`.forceUpdate()`：

```js
// packages/react/src/ReactBaseClasses.js
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};

Component.prototype.setState = function(partialState, callback) {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  );
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};
```

基类 `React.PureComponent` 原型继承于 `React.Component`，只是在自己的原型方法上增加了一个 `.isPureReactComponent` 属性：

```js
// packages/react/src/ReactBaseClasses.js
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
```

如果使用 `new React.Component()` 作为原型对象，就需要调用 `React.Component` 的构造函数。 所以这里需要使用一个临时类 `ComponentDummy` 做中转，避免调用 `React.Component` 的构造函数。
