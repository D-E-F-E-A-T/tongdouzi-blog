---
title: React 源码分析篇七：reconcileChildren
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## 哈哈哈

这里将到 reconcileChildren

`packages/react-reconciler/src/ReactFiberBeginWork.js`

```js
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderExpirationTime: ExpirationTime,
) {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    );
  }
}
```

`packages/react-reconciler/src/ReactChildFiber.js`


```js
// packages/react-reconciler/src/ReactChildFiber.js
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
```

---

四个 `updateXxx()`，总体原则是同类复用，异类建新。但是判断是不是同类的标准不一样：

- `updateTextNode()`：oldFiber !== null && oldFiber.tag === HostText
- `updateElement()`：oldFiber !== null && oldFiber.elementType === newChild.type
- `updatePortal()`：oldFiber !== null && oldFiber.tag === HostPortal && oldFiber.stateNode.containerInfo === newChild.containerInfo && oldFiber.stateNode.implementation
- `updateFragment()`：oldFiber !== null && oldFiber.tag === Fragment

判定为同类的话，会调用 `useFiber()` 复用老 fiber，调用 `createWorkInProgress()` 对老 fiber 进行克隆的。
判定为异类的话，会调用 `createFiberFromXxx()` 创建新 fiber。
因此从返回结果是看，`newFiber.alternate` 存在表示这是复用的老 fiber，否则就是创建的新 fiber。

---

`updateSlot()` 总体原则是 key 匹配则 update 并返回 update 之后的 fiber（这个节点可能是新创建的 fiber，也有可能是复用老的 fiber）；key 不匹配则返回 null

```js
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
```

`shouldTrackSideEffects` 表示是否存在节点？？？

`placeChild()`：

- oldIndex 小于 placeIndex：老节点右移了，可能是之前增加了节点，设置 Placement effectTag。
- oldIndex 等于 placeIndex：老节点没有移动。
- oldIndex 大于 placeIndex：老节点左移了，可能是之前删除了节点。返回 oldIndex 在老索引之后在去操作
- 没有 oldIndex：新插入的节点，设置 Placement effectTag。

1. 设置了 fiber.index 为节点在 newChildren 中的索引
2. Placement effectTag 设置

`deleteChild()`：情感咨询师

`deleteRemainingChildren()`：

`createChild()`

---

`reconcileChildrenArray()`


fast path 按照默认的排序
slow path 额外准备一个 map

---

