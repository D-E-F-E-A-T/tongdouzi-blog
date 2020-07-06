title: React 源码分析篇八：update
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## 哈哈哈

`beginWork()` 只根据 `fiber.tag` 分别调用对应的更新方法：

```js
const updateExpirationTime = workInProgress.expirationTime;
if (current !== null) {
  const oldProps = current.memoizedProps;
  const newProps = workInProgress.pendingProps;

  if (oldProps !== newProps || hasLegacyContextChanged()) {
    didReceiveUpdate = true;
  } else if (updateExpirationTime < renderExpirationTime) {
    didReceiveUpdate = false;
    switch (workInProgress.tag) {
      case HostRoot:
        pushHostRootContext(workInProgress);
        resetHydrationState();
        break;
      case HostComponent:
        pushHostContext(workInProgress);
        break;
    }
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }
} else {
  didReceiveUpdate = false;
}

// current 存在
workInProgress.expirationTime = NoWork;
switch (workInProgress.tag) {
  // ...
  case HostRoot:
    return updateHostRoot(current, workInProgress, renderExpirationTime);
  case HostComponent:
    return updateHostComponent(current, workInProgress, renderExpirationTime);
  case HostText:
    return updateHostText(current, workInProgress);
  // ...
}
```

## HostRoot 的更新

`pushHostRootContext()` 用于更新 RootHost 节点：

```js
function pushHostRootContext(workInProgress) {
  const root = (workInProgress.stateNode: FiberRoot);
  // 顶层 context 入栈，顶层 context 来源于 parentComponent
  if (root.pendingContext) {
    pushTopLevelContextObject(
      workInProgress,
      root.pendingContext,
      root.pendingContext !== root.context,
    );
  } else if (root.context) {
    pushTopLevelContextObject(workInProgress, root.context, false);
  }
  // hostContext 入栈
  pushHostContainer(workInProgress, root.containerInfo);
}

function updateHostRoot(current, workInProgress, renderExpirationTime) {
  // 顶层 context 和 hostContext 入栈
  pushHostRootContext(workInProgress);
  const updateQueue = workInProgress.updateQueue;
  invariant(
    updateQueue !== null,
    'If the root does not have an updateQueue, we should have already ' +
      'bailed out. This error is likely caused by a bug in React. Please ' +
      'file an issue.',
  );
  // 基于 nextProps 和 prevState 计算得到新的 nextState
  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;
  processUpdateQueue(
    workInProgress,
    updateQueue,
    nextProps,
    null,
    renderExpirationTime,
  );

 const nextState = workInProgress.memoizedState;
 // 根据 prevState.element 和 nextState.element 是否发生变化判断能不能走 bailoutOnAlreadyFinishedWork 流程
  const nextChildren = nextState.element;
  if (nextChildren === prevChildren) {
    resetHydrationState();
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }
  const root: FiberRoot = workInProgress.stateNode;
  // 如果是初次渲染并且需要 hydrate，设置 Placement effectTag
  // React 的 comp.isMounted() 利用 HostRoot 的 Placement effectTag 来判断 fiber 是不是已经挂载
  // fiber 已挂载的判断依据是，向上追溯能够到 HostRoot，并且中间没有任何一个节点设置了 Placement effectTag
  // 只要在 HostRoot 上设置 Placement effectTag，就能确保 comp.isMounted() 返回 false
  if (
    (current === null || current.child === null) &&
    root.hydrate &&
    enterHydrationState(workInProgress)
  ) {
    // This is a bit of a hack. We track the host root as a placement to
    // know that we're currently in a mounting state. That way isMounted
    // works as expected. We must reset this before committing.
    // TODO: Delete this when we delete isMounted and findDOMNode.
    workInProgress.effectTag |= Placement;

    // Ensure that children mount into this root without tracking
    // side-effects. This ensures that we don't store Placement effects on
    // nodes that will be hydrated.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    // Otherwise reset hydration state in case we aborted and resumed another
    // root.
    // 由于 HostRoot 节点的 current 必然存在，所以对于 HostRoot 来说，reconcileChildren() 必然调用 `reconcileChildFibers()`
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
    resetHydrationState();
  }
  return workInProgress.child;
}
```

`shouldTrackSideEffect` 确保我们在可能需要水合的 fiber 节点上设置 Placement effects

## Update & UpdateQueue

- `enqueueUpdate  enqueueCapturedUpdate()`

- `processUpdateQueue()` 在 prevState 和 nextProps 的基础上根据 update 信息计算出 nextState

消化 update 这个方法在 `updateHostRoot()` 和 `mountClassInstance()/updateClassInstance()/resumeMountClassInstance()` 中使用到

tag：


```js
export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;
```

- UpdateState 增量更新，基于 prevState 和 update.payload 合并得到 nextState
- ReplaceState 全量更新，基于 payload 全量更新
- ForceUpdate state 值依然取 prevState，同时 hasForceUpdate 置为 true
- CaptureUpdate 什么是 captureUpdate ？表示捕获性更新，也就是在更新中捕获到错误，渲染成错误状态

```js
function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
  nextProps: any,
  instance: any,
): any {
  switch (update.tag) {
    case ReplaceState: {
      const payload = update.payload;
      if (typeof payload === 'function') {
        // Updater function
        if (__DEV__) {
          enterDisallowedContextReadInDEV();
          if (
            debugRenderPhaseSideEffects ||
            (debugRenderPhaseSideEffectsForStrictMode &&
              workInProgress.mode & StrictMode)
          ) {
            payload.call(instance, prevState, nextProps);
          }
        }
        const nextState = payload.call(instance, prevState, nextProps);
        if (__DEV__) {
          exitDisallowedContextReadInDEV();
        }
        return nextState;
      }
      // State object
      return payload;
    }
    case CaptureUpdate: {
      workInProgress.effectTag =
        (workInProgress.effectTag & ~ShouldCapture) | DidCapture;
    }
    // Intentional fallthrough
    case UpdateState: {
      const payload = update.payload;
      let partialState;
      if (typeof payload === 'function') {
        // Updater function
        if (__DEV__) {
          enterDisallowedContextReadInDEV();
          if (
            debugRenderPhaseSideEffects ||
            (debugRenderPhaseSideEffectsForStrictMode &&
              workInProgress.mode & StrictMode)
          ) {
            payload.call(instance, prevState, nextProps);
          }
        }
        partialState = payload.call(instance, prevState, nextProps);
        if (__DEV__) {
          exitDisallowedContextReadInDEV();
        }
      } else {
        // Partial state object
        partialState = payload;
      }
      if (partialState === null || partialState === undefined) {
        // Null and undefined are treated as no-ops.
        return prevState;
      }
      // Merge the partial state and the previous state.
      return Object.assign({}, prevState, partialState);
    }
    case ForceUpdate: {
      hasForceUpdate = true;
      return prevState;
    }
  }
  return prevState;
}
```

