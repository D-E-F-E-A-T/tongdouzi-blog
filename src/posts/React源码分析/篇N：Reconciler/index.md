---
title: Rect 源码分析篇N：Reconciler
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## renderRoot

`flushPassiveEffects();`
`isWorking = true;`

是不是在一个新鲜的栈
是的话一系列 reset 栈的操作：
  nextRenderExpirationTime = root.nextExpirationTimeToWorkOn；
  nextRoot = root;
  nextUnitOfWork = createWorkInProgress(nextRoot.current, null, nextRenderExpirationTime);
  root.pendingCommitExpirationTime = NoWork;

```js
do {
  try {
    workLoop(isYieldy);
  } catch (thrownValue) {
    // 各种错误处理
  }
  break;
} while (true);

isWorking = false;
// 各种处理
```

## workLoop

`performUnitOfWork(nextUnitOfWork);`
  `next = beginWork(current$$1, workInProgress, nextRenderExpirationTime);`
  `next === null && next = completeUnitOfWork(workInProgress)`
`completeUnitOfWork(nextUnitOfWork)`

---
- `current.memoizedProps;` 老的 props
- `workInProgress.pendingProps;` 新的 props
- `workInProgress.memoizedState` 老的 state
- `workInProgress.memoizedState.element` 来的 children
- `didReceiveUpdate = didPerformWorkStackCursor.current` context 是不是有所改变
---

## beginWork

看看本节点有没有 work：
  - 没有，bailoutOnAlreadyFinishedWork()
    自节点有没有需要执行的 work？
      没有：return null，这个分支不需要处理了，直接 complete 这个节点就可以了
      有：cloneChildFibers()，直接拷贝/创建子 fiber，本节点仍然用 workInProgress，return workInProgress.child

根据 fiber.tag 分发处理：`switch (workInProgress.tag)`

不同的 fiber.tag 处理更新的方式不同，但是第一件事大概率都是做入栈操作

`updateHostRoot(current, workInProgress, renderExpirationTime)`
    `pushHostRootContext()` context 和 container 信息入栈
    `processUpdateQueue()` 计算出一个新的 state，挂载在 `workInProgress.memoizedState` 上。计算规则是：
        > 初始 `prevState = queue.baseState`
        `UpdateState` 类型的 update：`Object.assign(prevState, update.payload)`
        `ReplaceState` 类型的 update：`update.payload`
        `ForceUpdate` 类型的 update：`prevState`，额外标记 `hasForceUpdate` 为 `true`
        `CaptureUpdate` 类型的 update：`prevState` 额外修改了一下 workInProgress.effectTag
        如果 update.callback 不是空，还需要设置  queue 的 effect 链和 queue `workInProgress.effectTag |= Callback;`
    判断 prevState.element 和 nextStata.element 是不是一样，注意只是 `===` 比较。那意思就是说 HostRoot 类型的 Fiber，只有 `UpdateState` 类型的 update
    如果相等，可能的情况是，renderRoot 早了，nextRenderExpirationTime 比所有 update.expirationTime 都大，因此直接 bailout 就完事了。bailout 的意思就是，看看子节点有没有优先级比 nextRenderExpirationTime 高的更新，如果有克隆并返回子 fiber，没有直接返回 null，反正本节点不进行后续处理了。
    这个地方根据 root.hydrate 分开处理，需要水合则调用  `workInProgress.child = mountChildFibers()`，不需要水合则调用 `workInProgress.child = reconcileChildFibers() <=> reconcileChildFibers()`。

## completeWork

```js
switch (workInProgress.tag) {
  // 处理
}
return null;
```

只有个 SuspenseComponent 才会返回值，其他都是返回 null
根据 fiber.tag 分发处理：`switch (workInProgress.tag)`
