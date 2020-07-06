## 规划

### 第一篇

方法论

### 第二篇

React Element 和 JSX
Virtual DOM 和真实 DOM
还有组件

只关心怎么描述页面结构

### 第三篇

组件是给定 state 和 props，返回一个 React Elements 树
下次 state 或者 props 更新，返回一个新的 React Elements 树

显然直接用新树替代老树很低效并且暴力，所以 React 要在新旧两棵树之间，找到从旧树转换成新树最小、最高效的更新操作。这个过程叫做 diff。

两颗树之间的 diff 有现成通用的算法，但是这个算法的复杂度是 O(n^3)，也就是说假如这棵树有 1000 个节点，需要经过 1000 * 1000 * 1000 次比对操作，这在浏览器端太昂贵了。React 在传统 diff 算法的基础上，结合 Web 端场景下现实情况，做了两个假设，将 diff 算法的复杂度降到了浏览器端可以接受的 O(n)，也就是说这棵树有 1000 个节点，做 1000 次比对就可以了。

这两条假设是：

- Two elements of different types will produce different trees.
- The developer can hint at which child elements may be stable across different renders with a key prop.


React then needs to figure out how to efficiently update the UI to match the most recent tree.

There are some generic solutions to this algorithmic problem of generating the minimum number of operations to transform one tree into another. However, the state of the art algorithms have a complexity in the order of O(n3) where n is the number of elements in the tree.


fiber 结构

### 第四篇

哈哈哈

<!-- ```js
it('render with plain javascript object', () => {
  expect(() => {
    const container = document.createElement('div');
    ReactDOM.render({ $$typeof: Symbol ? Symbol.for('react.element') : 0xeac7, ref: null, type: 'span', props: { children: '1' } }, container)
  }).not.toThrowError();
});
``` -->

## 源码解读


Fiber 的结构：

https://juejin.im/post/5dd94dd7f265da7e29432ca4


Developer->ReactDOM.render():ReactDOM.render(element,container)
ReactDOM.render()->legacyRenderSubtreeIntoContainer():legacyRenderSubtreeIntoContainer(null,element,container,false,callback)
legacyRenderSubtreeIntoContainer()->legacyCreateRootFromDOMContainer():legacyCreateRootFromDOMContainer(container,false)
legacyCreateRootFromDOMContainer()->ReactRoot:new ReactRoot(container,false,false)
ReactRoot-->legacyCreateRootFromDOMContainer():return reactRoot
legacyCreateRootFromDOMContainer()->legacyRenderSubtreeIntoContainer():return reactRoot
legacyRenderSubtreeIntoContainer()->ReactRoot:reactRoot.render(children,callback)
ReactRoot-->legacyRenderSubtreeIntoContainer():return reactWork
legacyRenderSubtreeIntoContainer()->getPublicRootInstance():getPublicRootInstance(reactRoot._internalRoot)
getPublicRootInstance()-->legacyRenderSubtreeIntoContainer():return publicRootInstance
legacyRenderSubtreeIntoContainer()-->ReactDOM.render():return publicRootInstance
ReactDOM.render()-->Developer:return publicRootInstance


Developer->ReactDOM.render():ReactDOM.render()
ReactDOM.render()->legacyRenderSubtreeIntoContainer():legacyRenderSubtreeIntoContainer()
legacyRenderSubtreeIntoContainer()->legacyCreateRootFromDOMContainer():legacyCreateRootFromDOMContainer()
legacyCreateRootFromDOMContainer()->ReactRoot:new ReactRoot()
ReactRoot-->legacyCreateRootFromDOMContainer():return reactRoot
legacyCreateRootFromDOMContainer()->legacyRenderSubtreeIntoContainer():return reactRoot
legacyRenderSubtreeIntoContainer()->ReactRoot:reactRoot.render()
ReactRoot-->legacyRenderSubtreeIntoContainer():return reactWork
legacyRenderSubtreeIntoContainer()->getPublicRootInstance():getPublicRootInstance()
getPublicRootInstance()-->legacyRenderSubtreeIntoContainer():return publicRootInstance
legacyRenderSubtreeIntoContainer()-->ReactDOM.render():return publicRootInstance
ReactDOM.render()-->Developer:return publicRootInstance

recieveComponent 应该改名叫 recieveElement
FiberRoot 的 context 和 pendingContext 是从 parentComponent 计算得来的，Context API 的时候要研究以下


- commit-time effects
- side effects

bailout 流程 - 相当于打游戏跳过关卡
unwind 流程 - 相当于飞车游戏、重置位置，发生异常了直接重置状态
