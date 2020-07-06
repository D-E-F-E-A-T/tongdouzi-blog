---
title: React 源码分析篇四：Stack&Context
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## Stack

packages/react-reconciler/src/ReactFiberStack.js

## HostContext

DOM 环境用来创建节点的 API，除了创建 Text 节点专用的 `document.createTextNode()` 、创建 DocumentFragment 节点专用的 `document.createDocumentFragment()`、创建 Comment 节点专用的 `document.createComment()` 之外，普通节点可以用下面两个：

- `document.createElement('div')`
- `document.createElementNS('http://www.w3.org/2000/svg', 'rect')`

包括用于设置 attrbute 的 API：

- `node.setAttribute('class', 'box')`
- `node.setAttributeNS('http://www.w3.org/2000/svg', 'fill', 'red')`

`document.createElementNS()` 和 `node.setAttributeNS()` 的第一个参数就是 namespaceURI。DOM 环境常用的 namespaceURI 有：

- http://www.w3.org/1999/xhtml for HTML
- http://www.w3.org/2000/svg for SVG
- http://www.w3.org/1998/Math/MathML for MathML

在 `packages/react-dom/src/shared/DOMNamespaces.js` 这个文件中定义了这些 NAMESPACE：

```js
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
```

那 HostContext 跟 NAMESPACE 有什么关系呢？在 `packages/react-dom/src/client/ReactDOMHostConfig.js` 文件中有 HostContext 的类型声明：

```js
// packages/react-dom/src/client/ReactDOMHostConfig.js
type HostContextDev = {
  namespace: string,
  ancestorInfo: mixed,
};
type HostContextProd = string;
export type HostContext = HostContextDev | HostContextProd;
```

HostContext 在开发和生产环境是不同的结构，生产环境 HostContext 就是 NAMESPACE 本身。HostContext 决定了这个 Fiber 对象下的所有 HostComponent 类型的子孙 Fiber 对象创建 DOM 节点时使用的 NAMESPACE。

我们还可以追踪一下 `document.createElement()/document.createElementNS()` API 的调用链。

`packages/react-dom/src/client/ReactDOMComponent.js` 文件中封装了一个 `createElement()` 函数创建 DOM 节点：

```js
// packages/react-dom/src/client/ReactDOMComponent.js
function createElement(
  type: string,
  props: Object,
  rootContainerElement: Element | Document,
  parentNamespace: string,
): Element {
  // ...
}
```

这个函数需要根据传入的 `parentNamespace` 来决定使用哪个 API 来创建 DOM 节点。`createElement()` 只在 `packages/react-dom/src/client/ReactDOMHostConfig.js` 文件中的 `createInstance()` 函数中用到：

```js
function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): Instance {
  // ...
}
```

`createInstance()` 在生产环境下，直接取 `hostContext` 作为调用 `createElement()` 的 `parentNamespace`。`createInstance()` 这个函数只在 `packages/react-reconciler/src/ReactFiberCompleteWork.js` 文件中的 `completeWork()` 函数中渲染 HostComponent 类型 Fiber 对象的时候才会用到：

```js
// packages/react-reconciler/src/ReactFiberCompleteWork.js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    // ...
    case HostComponent: {
      // ...
      const currentHostContext = getHostContext();

      let instance = createInstance(
        type,
        newProps,
        rootContainerInstance,
        currentHostContext,
        workInProgress,
      );
      // ...
    }
    // ...
  }

  return null;
}
```

`completeWork()` 函数中调用 `getHostContext()` 获取到当前的名称空间。`getHostContext()` 函数来自于 `packages/react-reconciler/src/ReactFiberHostContext.js` 这个文件，这个文件就是 React 中关于 HostContext 相关操作的核心文件。文件中定义了三个游标：

```js
let contextStackCursor: StackCursor<HostContext | NoContextT> = createCursor(
  NO_CONTEXT,
);
let contextFiberStackCursor: StackCursor<Fiber | NoContextT> = createCursor(
  NO_CONTEXT,
);
let rootInstanceStackCursor: StackCursor<Container | NoContextT> = createCursor(
  NO_CONTEXT,
);
```

- contextStackCursor：用于定位当前的 HostContext
- rootInstanceStackCursor：用于定位当前 container DOM 节点，只会在渲染 HostRoot 类型或者 HostPortal 类型 Fiber 对象时才会推入值。
- contextFiberStackCursor：用于定位当前的 Fiber

对外部有用的其实只有 contextStackCursor 和 rootInstanceStackCursor 这两个游标，所以对外暴露 `getHostContext()` 和 `getRootHostContainer()` 分别用来获取当前的 HostContext 和当前的 container DOM 节点：

```js
function getHostContext(): HostContext {
  const context = requiredContext(contextStackCursor.current);
  return context;
}
function getRootHostContainer(): Container {
  const rootInstance = requiredContext(rootInstanceStackCursor.current);
  return rootInstance;
}
```

那么 contextFiberStackCursor 这个游标是什么用的呢？其实只是供内部 `pushHostContext()/popHostContext()` 函数优化用的。

`pushHostContext()`/`popHostContext()` 用于推入推出 HostContext 和 Fiber：

```js
function pushHostContext(fiber: Fiber): void {
  const rootInstance: Container = requiredContext(
    rootInstanceStackCursor.current,
  );
  const context: HostContext = requiredContext(contextStackCursor.current);
  const nextContext = getChildHostContext(context, fiber.type, rootInstance);

  // Don't push this Fiber's context unless it's unique.
  if (context === nextContext) {
    return;
  }

  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber, fiber);
  push(contextStackCursor, nextContext, fiber);
}

function popHostContext(fiber: Fiber): void {
  // Do not pop unless this Fiber provided the current context.
  // pushHostContext() only pushes Fibers that provide unique contexts.
  if (contextFiberStackCursor.current !== fiber) {
    return;
  }

  pop(contextStackCursor, fiber);
  pop(contextFiberStackCursor, fiber);
}
```

注意这地方有优化，不是每次调用都会推入推出。只有这次的 Fiber 对子 Fiber 的 HostContext 产生影响时才会推入，例如 Fiber 对象的 type 是 `'svg'` 时。只有这次的 Fiber 是 contextFiberStackCursor 定位的 Fiber 时才会推出。

`pushHostContainer()`/`popHostContainer()` 用于推入推出 container、HostContext 和 Fiber：

```js
function pushHostContainer(fiber: Fiber, nextRootInstance: Container) {
  // Push current root instance onto the stack;
  // This allows us to reset root when portals are popped.
  push(rootInstanceStackCursor, nextRootInstance, fiber);
  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber, fiber);

  // Finally, we need to push the host context to the stack.
  // However, we can't just call getRootHostContext() and push it because
  // we'd have a different number of entries on the stack depending on
  // whether getRootHostContext() throws somewhere in renderer code or not.
  // So we push an empty value first. This lets us safely unwind on errors.
  push(contextStackCursor, NO_CONTEXT, fiber);
  const nextRootContext = getRootHostContext(nextRootInstance);
  // Now that we know this function doesn't throw, replace it.
  pop(contextStackCursor, fiber);
  push(contextStackCursor, nextRootContext, fiber);
}

function popHostContainer(fiber: Fiber) {
  pop(contextStackCursor, fiber);
  pop(contextFiberStackCursor, fiber);
  pop(rootInstanceStackCursor, fiber);
}
```

由于 container 只有在 HostRoot 和 HostPortal 类型的 Fiber 时才会发生变化，所以这两个方法只发生在 HostRoot 和 HostPortal 类型的 Fiber 更新过程中调用。

## Context

React 有新旧两套 Context API，这里的 Context 就是用于实现老版 Context API 的。老版 Context API 无论在使用体验上还是渲染性能上的表现都存在一些问题，所以 React 计划在 17 之后的版本中移除老版 Context API。

回顾一下老版 Context API 的用法：

```js
class Parent extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
  }

  static childContextTypes = {
    value: PropTypes.string,
  };

  getChildContext() {
    return {value: this.state.value};
  }

  render () {
    return (
      <div style={{'margin': '100px'}}>
        <input type="text" value={this.state.value} onChange={this.handleChange}/>
        <Child />
      </div>
    );
  }

  handleChange = (ev) => {
    this.setState({
      value: ev.target.value
    })
  };

}


class Child extends React.Component {

  static contextTypes = {
    value: PropTypes.string,
  };

  render () {
    return <h3>Child: {this.context.value}</h3>;
  }

}
```

父组件需要使用 `type.childContextTypes` 来声明自身对外暴露的 context：

```js
// packages/react-reconciler/src/ReactFiberContext.js
function isContextProvider(type: Function): boolean {
  const childContextTypes = type.childContextTypes;
  return childContextTypes !== null && childContextTypes !== undefined;
}
```

在 `packages/react-reconciler/src/ReactFiberContext.js` 这个文件中定义了两个游标和一个变量：

```js
let contextStackCursor: StackCursor<Object> = createCursor(emptyContextObject);
let didPerformWorkStackCursor: StackCursor<boolean> = createCursor(false);
let previousContext: Object = emptyContextObject;
```

- contextStackCursor 用于保存当前的 context
- didPerformWorkStackCursor 用于保存当前 context 在本次渲染中是否发生变化
- previousContext 用于保存 contextStackCursor 指向当前 context 时之前的 context

对外暴露 didPerformWorkStackCursor 这个游标值的是 `hasContextChanged()` 这个函数：

```js
function hasContextChanged(): boolean {
  return didPerformWorkStackCursor.current;
}
```

对外暴露的用于获取 contextStackCursor 这个游标值的是 `getUnmaskedContext()` 和 `getMaskedContext()` 两个函数。这里所谓的 `mask` 指的是 `type.contextTypes`，`getUnmaskedContext()` 结果中出现所有能够访问到的 context，`getMaskedContext()` 会从 unmaskedContext 中挑选出 `type.contextTypes` 中声明了的 context。

还需要特别关注的是，组件实例获取到的 context 中，不能包含组件自己提供的 context，因此 `getUnmaskedContext()` 实现中需要用到 `previousContext` 这个变量保存不包含自身提供的 context：

```js
// packages/react-reconciler/src/ReactFiberContext.js
function getUnmaskedContext(
  workInProgress: Fiber,
  Component: Function,
  didPushOwnContextIfProvider: boolean,
): Object {
  if (didPushOwnContextIfProvider && isContextProvider(Component)) {
    // If the fiber is a context provider itself, when we read its context
    // we may have already pushed its own child context on the stack. A context
    // provider should not "see" its own child context. Therefore we read the
    // previous (parent) context instead for a context provider.
    return previousContext;
  }
  return contextStackCursor.current;
}
function getMaskedContext(
  workInProgress: Fiber,
  unmaskedContext: Object,
): Object {
  const type = workInProgress.type;
  const contextTypes = type.contextTypes;
  if (!contextTypes) {
    return emptyContextObject;
  }

  // Avoid recreating masked context unless unmasked context has changed.
  // Failing to do this will result in unnecessary calls to componentWillReceiveProps.
  // This may trigger infinite loops if componentWillReceiveProps calls setState.
  const instance = workInProgress.stateNode;
  if (
    instance &&
    instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext
  ) {
    return instance.__reactInternalMemoizedMaskedChildContext;
  }

  const context = {};
  for (let key in contextTypes) {
    context[key] = unmaskedContext[key];
  }

  if (__DEV__) {
    const name = getComponentName(type) || 'Unknown';
    checkPropTypes(
      contextTypes,
      context,
      'context',
      name,
      getCurrentFiberStackInDev,
    );
  }

  // Cache unmasked context so we can avoid recreating masked context unless necessary.
  // Context is created before the class component is instantiated so check for instance.
  if (instance) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return context;
}
```

出于性能优化的考虑，React 会使用 `instance.__reactInternalMemoizedUnmaskedChildContext` 缓存 unmaskedContext，使用 `instance.__reactInternalMemoizedMaskedChildContext` 缓存 maskedContext 的结果：

```js
// packages/react-reconciler/src/ReactFiberContext.js
function cacheContext(
  workInProgress: Fiber,
  unmaskedContext: Object,
  maskedContext: Object,
): void {
  const instance = workInProgress.stateNode;
  instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
  instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
}
```

`pushTopLevelContextObject()`/`popTopLevelContextObject()` 这两个函数只用于 HostRoot 类型的 Fiber 渲染过程中，推入弹出的是 `fiberRoot.pendingContext || fiberRoot.context`，而 FiberRoot 的为什么会有 context 呢？ReactDOM 暴露的方法中有一个标记了 `unstable_` 前缀的 `unstable_renderSubtreeIntoContainer()`：

```js
unstable_renderSubtreeIntoContainer(
  parentComponent: React$Component<any, any>,
  element: React$Element<any>,
  containerNode: DOMContainer,
  callback: ?Function,
) {
  // ...
},
```

这个方法特别之处是允许传递一个 `parentComponent` 参数，`parentComponent` 这个参数的值是一个 Class Component 实例。`unstable_renderSubtreeIntoContainer()` 调用 `legacyRenderSubtreeIntoContainer()`、`legacyRenderSubtreeIntoContainer()` 调用 `reactRoot.legacy_renderSubtreeIntoContainer()`、`reactRoot.legacy_renderSubtreeIntoContainer()` 调用 `updateContainer()`、`updateContainer()` 再调 `updateContainerAtExpirationTime()`。最终把 `parentComponent` 这个参数透传给 `updateContainerAtExpirationTime()`，`updateContainerAtExpirationTime()` 中有段代码把这个 `parentComponent` 消化掉了：

```js
export function updateContainerAtExpirationTime(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  expirationTime: ExpirationTime,
  callback: ?Function,
) {
  // ...
  const current = container.current;
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }
  // ...
}
function getContextForSubtree(
  parentComponent: ?React$Component<any, any>,
): Object {
  if (!parentComponent) {
    return emptyContextObject;
  }

  const fiber = getInstance(parentComponent);
  const parentContext = findCurrentUnmaskedContext(fiber);

  if (fiber.tag === ClassComponent) {
    const Component = fiber.type;
    if (isLegacyContextProvider(Component)) {
      return processChildContext(fiber, Component, parentContext);
    }
  }

  return parentContext;
}
```

这里面用到的 `findCurrentUnmaskedContext()`、`isLegacyContextProvider()` 和 `processChildContext()` 都是从 `packages/react-reconciler/src/ReactFiberContext.js` 这个文件中导出的函数：

- `findCurrentUnmaskedContext()`：接收一个 fiber，沿着 `fiber.return` 路径往上找，一直找到最近的一个提供 Context 的 Fiber 节点，返回这个节点的 `fiber.stateNode.__reactInternalMemoizedMergedChildContext`。（或者找到 HostRoot 节点返回 `fiber.stateNode.context`）
- `isLegacyContextProvider()`：`isContextProvider()` 的导出重命名，返回 `type.childContextTypes` 是否有值
- `processChildContext()`：调用 `fiber.stateNode.getChildContext()` 获取本节点提供的 context，和 parentContext 合并，如果存在同名 context，前者覆盖后者。

`pushContextProvider()`/`popContext()` 这两个函数只用于 ClassComponent 类型 Fiber 的渲染过程中，推入弹出的是这个节点上的 `instance.__reactInternalMemoizedMergedChildContext`：

```js
function pushContextProvider(workInProgress: Fiber): boolean {
  const instance = workInProgress.stateNode;
  // We push the context as early as possible to ensure stack integrity.
  // If the instance does not exist yet, we will push null at first,
  // and replace it on the stack later when invalidating the context.
  const memoizedMergedChildContext =
    (instance && instance.__reactInternalMemoizedMergedChildContext) ||
    emptyContextObject;

  // Remember the parent context so we can merge with it later.
  // Inherit the parent's did-perform-work value to avoid inadvertently blocking updates.
  previousContext = contextStackCursor.current;
  push(contextStackCursor, memoizedMergedChildContext, workInProgress);
  push(
    didPerformWorkStackCursor,
    didPerformWorkStackCursor.current,
    workInProgress,
  );

  return true;
}
```

这个地方需要特别注意，`pushContextProvider()` 调用发生在渲染这个节点的 beginWork 阶段，instance 实际上是没有创建或者没有更新的，因此大概率这个地方推入的是一个空的或者没有更新的 context，并且推入的 `didPerformWorkStackCursor` 还是原值，一辈子都不会变。也就是说这是一个废操作。React 之所以这么做的解释是“push the context as early as possible to ensure stack integrity”，之后再调用 `invalidateContextProvider()` 这个方法更新 `__reactInternalMemoizedMergedChildContext` 并且重设 `contextStackCursor` 和 `didPerformWorkStackCursor`：

```js
function invalidateContextProvider(
  workInProgress: Fiber,
  type: any,
  didChange: boolean,
): void {
  const instance = workInProgress.stateNode;
  invariant(
    instance,
    'Expected to have an instance by this point. ' +
      'This error is likely caused by a bug in React. Please file an issue.',
  );

  if (didChange) {
    // Merge parent and own context.
    // Skip this if we're not updating due to sCU.
    // This avoids unnecessarily recomputing memoized values.
    const mergedContext = processChildContext(
      workInProgress,
      type,
      previousContext,
    );
    instance.__reactInternalMemoizedMergedChildContext = mergedContext;

    // Replace the old (or empty) context with the new one.
    // It is important to unwind the context in the reverse order.
    pop(didPerformWorkStackCursor, workInProgress);
    pop(contextStackCursor, workInProgress);
    // Now push the new context and mark that it has changed.
    push(contextStackCursor, mergedContext, workInProgress);
    push(didPerformWorkStackCursor, didChange, workInProgress);
  } else {
    pop(didPerformWorkStackCursor, workInProgress);
    push(didPerformWorkStackCursor, didChange, workInProgress);
  }
}
```

## NewContext

老版的 Context API 在使用体验上，无论 Provider 还是 Comsumer 只能使用 Class Component 的形式，并且在 Fiber 树中的 Provider 和 Comsumer 之间可能存在一个 Fiber 节点提供的的同名 context 导致被覆盖。在渲染性能上，沿着 Fiber 树向下传递，一旦发生变更，整个子树都需要重新渲染，导致昂贵的性能开销。也这是因为这些原因，React 16 中推出新的 Context API，并在 React 17 中完全替代掉老的 Context API。

新版的 API 的用法更加灵活，可以有三种形式：

**形式一：Context Component**

```js
const React = window.React;

const ValueContext = React.createContext('');

class Parent extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  render () {
    return (
      <div style={{'margin': '100px'}}>
        <input type="text" value={this.state.value} onChange={this.handleChange}/>
        <ValueContext.Provider value={this.state.value}>
          <Child />
        </ValueContext.Provider>
      </div>
    );
  }

  handleChange = (ev) => {
    this.setState({
      value: ev.target.value
    })
  };

}

class Child extends React.Component {

  render () {
    return (
      <ValueContext.Consumer>
        {(context) => (
          <h3>Child: {context}</h3>
        )}
      </ValueContext.Consumer>
    );
  }

}

export default Parent;
```

**形式二：Class Component with static contextType**

```js
const React = window.React;

const ValueContext = React.createContext('');

class Parent extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  render () {
    return (
      <div style={{'margin': '100px'}}>
        <input type="text" value={this.state.value} onChange={this.handleChange}/>
        <ValueContext.Provider value={this.state.value}>
          <Child />
        </ValueContext.Provider>
      </div>
    );
  }

  handleChange = (ev) => {
    this.setState({
      value: ev.target.value,
    });
  };

}

class Child extends React.Component {

  static contextType = ValueContext;

  render () {
    return <h3>Child: {this.context}</h3>;
  }

}

export default Parent;
```

**形式三：useContext hook**

```js
const React = window.React;

const ValueContext = React.createContext('');

class Parent extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  render () {
    return (
      <div style={{'margin': '100px'}}>
        <input type="text" value={this.state.value} onChange={this.handleChange}/>
        <ValueContext.Provider value={this.state.value}>
          <Child />
        </ValueContext.Provider>
      </div>
    );
  }

  handleChange = (ev) => {
    this.setState({
      value: ev.target.value
    })
  };

}

function Child () {
  const context = React.useContext(ValueContext);
  return <h3>Child: {context}</h3>;
}

export default Parent;
```

在渲染上，新版 Context API 基于发布-订阅模式，context 发生更新会定点通知到指定 fiber 节点，避免了整个子树的重新渲染。新版 Context API 的代码实现在 `packages/react-reconciler/src/ReactFiberNewContext.js` 这个文件中。

首先理解一下 `React.createContext()` 这个 API：

```js
// packages/react/src/ReactContext.js
export function createContext<T>(
  defaultValue: T,
  calculateChangedBits: ?(a: T, b: T) => number,
): ReactContext<T> {
  // ...
  const context: ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    _currentValue: defaultValue,
    // ...
    Provider: (null: any),
    Consumer: (null: any),
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };

  if (__DEV__) {
    const Consumer = {
      $$typeof: REACT_CONTEXT_TYPE,
      _context: context,
      _calculateChangedBits: context._calculateChangedBits,
    };
    // Consumer 的 _currentValue/Provider 属性代理到 context 对象上
  } else {
    context.Consumer = context;
  }
  // ...
  return context;
}
```

注意 `context.Consumer` 在生产环境下和 `context` 是同一个东西，开发环境也代理了 `_currentValue`、`Provider` 属性到 context 对象上，总之 `Consumer._context` 和 `Provider._context` 是同一个 ReactContext 对象，`Consumer._context._currentValue` 和 `Provider._context._currentValue` 是同一个值。所以一个 Comsumer 需要获取最新的 context 值很简单，直接取 `Consumer._context._currentValue` 就完了，然而在 `packages/react-reconciler/src/ReactFiberNewContext.js` 中暴露的 `readContext()` 的并不这么简单：

```js
// packages/react-reconciler/src/ReactFiberNewContext.js
export function readContext<T>(
  context: ReactContext<T>,
  observedBits: void | number | boolean,
): T {
  if (lastContextWithAllBitsObserved === context) {
    // Nothing to do. We already observe everything in this context.
  } else if (observedBits === false || observedBits === 0) {
    // Do not observe any updates.
  } else {
    let resolvedObservedBits; // Avoid deopting on observable arguments or heterogeneous types.

    // 处理 resolvedObservedBits 值
    let contextItem = {
      context: ((context: any): ReactContext<mixed>),
      observedBits: resolvedObservedBits,
      next: null,
    };

    if (lastContextDependency === null) {
      //  warning 信息
      // This is the first dependency for this component. Create a new list.
      lastContextDependency = contextItem;
      currentlyRenderingFiber.contextDependencies = {
        first: contextItem,
        expirationTime: NoWork,
      };
    } else {
      // Append a new context item.
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }
  return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}
```

这个函数在 `return isPrimaryRenderer ? context._currentValue : context._currentValue2;` 之前，还在当前 Fiber 对象上添加了一个 `contextDependencies`，这个值是一个链表结构：

```js
// packages/react-reconciler/src/ReactFiberNewContext.js
export type ContextDependencyList = {
  first: ContextDependency<mixed>,
  expirationTime: ExpirationTime,
};
type ContextDependency<T> = {
  context: ReactContext<T>,
  observedBits: number,
  next: ContextDependency<mixed> | null,
};
```

也就是说这是一个当前 fiber 订阅的 context 列表。为什么一个 fiber 存在多个 context？假设这个 fiber 的类型是 ReactConsumer，或者是一个 Class Component，最多只会订阅一个 context，但是假设 fiber 类型是一个 Function Component，就可以使用 `useContext()` hook 订阅多个 context。

`Comsumer` 的订阅信息存储在 `fiber.contextDependencies` 里面，那么当 `Provider` 发生更新，怎么通知到 `Comsumer` 呢？`Provider` 在渲染时如果发生更新，会调用 `propagateContextChange()` 通知 `Consumer`：

```js
// packages/react-reconciler/src/ReactFiberNewContext.js
export function propagateContextChange(
  workInProgress: Fiber,
  context: ReactContext<mixed>,
  changedBits: number,
  renderExpirationTime: ExpirationTime,
): void {
  let fiber = workInProgress.child;
  if (fiber !== null) {
    // Set the return pointer of the child to the work-in-progress fiber.
    fiber.return = workInProgress;
  }
  while (fiber !== null) {
    let nextFiber;

    // Visit this fiber.
    const list = fiber.contextDependencies;
    if (list !== null) {
      nextFiber = fiber.child;

      let dependency = list.first;
      while (dependency !== null) {
        // Check if the context matches.
        if (
          dependency.context === context &&
          (dependency.observedBits & changedBits) !== 0
        ) {
          // Match! Schedule an update on this fiber.

          if (fiber.tag === ClassComponent) {
            // Schedule a force update on the work-in-progress.
            const update = createUpdate(renderExpirationTime);
            update.tag = ForceUpdate;
            // TODO: Because we don't have a work-in-progress, this will add the
            // update to the current fiber, too, which means it will persist even if
            // this render is thrown away. Since it's a race condition, not sure it's
            // worth fixing.
            enqueueUpdate(fiber, update);
          }

          if (fiber.expirationTime < renderExpirationTime) {
            fiber.expirationTime = renderExpirationTime;
          }
          let alternate = fiber.alternate;
          if (
            alternate !== null &&
            alternate.expirationTime < renderExpirationTime
          ) {
            alternate.expirationTime = renderExpirationTime;
          }
          // Update the child expiration time of all the ancestors, including
          // the alternates.
          let node = fiber.return;
          while (node !== null) {
            alternate = node.alternate;
            if (node.childExpirationTime < renderExpirationTime) {
              node.childExpirationTime = renderExpirationTime;
              if (
                alternate !== null &&
                alternate.childExpirationTime < renderExpirationTime
              ) {
                alternate.childExpirationTime = renderExpirationTime;
              }
            } else if (
              alternate !== null &&
              alternate.childExpirationTime < renderExpirationTime
            ) {
              alternate.childExpirationTime = renderExpirationTime;
            } else {
              // Neither alternate was updated, which means the rest of the
              // ancestor path already has sufficient priority.
              break;
            }
            node = node.return;
          }

          // Mark the expiration time on the list, too.
          if (list.expirationTime < renderExpirationTime) {
            list.expirationTime = renderExpirationTime;
          }

          // Since we already found a match, we can stop traversing the
          // dependency list.
          break;
        }
        dependency = dependency.next;
      }
    } else if (fiber.tag === ContextProvider) {
      // Don't scan deeper if this is a matching provider
      nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
    } else {
      // Traverse down.
      nextFiber = fiber.child;
    }

    if (nextFiber !== null) {
      // Set the return pointer of the child to the work-in-progress fiber.
      nextFiber.return = fiber;
    } else {
      // No child. Traverse to next sibling.
      nextFiber = fiber;
      while (nextFiber !== null) {
        if (nextFiber === workInProgress) {
          // We're back to the root of this subtree. Exit.
          nextFiber = null;
          break;
        }
        let sibling = nextFiber.sibling;
        if (sibling !== null) {
          // Set the return pointer of the sibling to the work-in-progress fiber.
          sibling.return = nextFiber.return;
          nextFiber = sibling;
          break;
        }
        // No more siblings. Traverse up.
        nextFiber = nextFiber.return;
      }
    }
    fiber = nextFiber;
  }
}
```

这个方法会遍历整棵子树，读取每个 fiber 的 `contextDependencies` 查看订阅列表里面有没有自己。对于 ClassComponent 会向 `fiber.updateQueue` 中添加一个 ForceUpdate，同时更新所有子 fiber 的 expirationTime 和 childExpirationTime，确保子 fiber 会在这个 render 阶段会更新。

`pushProvider()/popProvider()` 则是推入推出最新的 context，最新的 context 只能在子树中 Comsumer 节点访问到。

`prepareToReadContext()` 这个函数把 `contextDependencies` 清空，然后 `readContext()` 会重新建立 `contextDependencies`
