---
title: Rect 源码分析篇十：ClassComponent 更新过程
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## ClassComponent 渲染过程

**beginWork**

```js
// packages/react-reconciler/src/ReactFiberBeginWork.js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  // ...
  switch (workInProgress.tag) {
   // ...
    case ClassComponent: {
      // 就是 element.type，也就是类组件
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      // 一般情况下 workInProgress.elementType === workInProgress.type 是同一个东西
      // 只有在 workInProgress.elementType.$$typeof === REACT_LAZY_TYPE 时就不是同一个东西了
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      );
    }
  // ...
  }
  // ...
}
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps,
  renderExpirationTime: ExpirationTime,
) {

  // 老版 Context API 相关
  let hasContext;
  // Component.childContextTypes 不为空，则表示这是老版 Context 的提供者
  if (isLegacyContextProvider(Component)) {
    hasContext = true;
    // legacyContext 入栈
    pushLegacyContextProvider(workInProgress);
  } else {
    hasContext = false;
  }
  // 新版本 Context API 相关
  // 初始化 readContext 需要用到的变量，currentlyRenderingFiber、lastContextDependency、lastContextWithAllBitsObserved
  // 如果 workInProgress.contextDependencies 存在并且优先级大于或者等于渲染优先级，设置 didReceiveUpdate 为 true
  // 然后 workInProgress.contextDependencies 设置为 null
  prepareToReadContext(workInProgress, renderExpirationTime);

  const instance = workInProgress.stateNode;
  let shouldUpdate;
  if (instance === null) {
    // 创建组件实例
    if (current !== null) {
      // An class component without an instance only mounts if it suspended
      // inside a non- concurrent tree, in an inconsistent state. We want to
      // tree it like a new mount, even though an empty version of it already
      // committed. Disconnect the alternate pointers.
      current.alternate = null;
      workInProgress.alternate = null;
      // Since this is conceptually a new fiber, schedule a Placement effect
      workInProgress.effectTag |= Placement;
    }
    // In the initial pass we might need to construct the instance.
    constructClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
    mountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
    shouldUpdate = true;
  } else if (current === null) {
    // 挂起之后恢复渲染
    // In a resume, we'll already have an instance we can reuse.
    shouldUpdate = resumeMountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
  } else {
    // 更新
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
  }
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderExpirationTime,
  );
  return nextUnitOfWork;
}
function finishClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  shouldUpdate: boolean,
  hasContext: boolean,
  renderExpirationTime: ExpirationTime,
) {
  // 标记 Ref effectTag，即使 shouldComponentUpdate 返回 false，refs 也需要更新
  markRef(current, workInProgress);

  // 捕获到错误？
  const didCaptureError = (workInProgress.effectTag & DidCapture) !== NoEffect;

  if (!shouldUpdate && !didCaptureError) {
    // Context providers should defer to sCU for rendering
    if (hasContext) {
      invalidateContextProvider(workInProgress, Component, false);
    }
bailoutOnAlreadyFinishedWork
    return (
      current,
      workInProgress,
      renderExpirationTime,
    );
  }

  const instance = workInProgress.stateNode;

  // Rerender
  ReactCurrentOwner.current = workInProgress;
  let nextChildren;
  if (
    didCaptureError &&
    typeof Component.getDerivedStateFromError !== 'function'
  ) {
    // If we captured an error, but getDerivedStateFrom catch is not defined,
    // unmount all the children. componentDidCatch will schedule an update to
    // re-render a fallback. This is temporary until we migrate everyone to
    // the new API.
    // TODO: Warn in a future release.
    nextChildren = null;
  } else {
    // 调用 render 获取 children，是一个 React element
    nextChildren = instance.render();
  }

  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;
  if (current !== null && didCaptureError) {
    // If we're recovering from an error, reconcile without reusing any of
    // the existing children. Conceptually, the normal children and the children
    // that are shown on error are two different sets, so we shouldn't reuse
    // normal children even if their identities match.
    forceUnmountCurrentAndReconcile(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    // 调协子节点
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
  }

  // workInProgress.memoizedState 记住 state
  workInProgress.memoizedState = instance.state;

  // The context might have changed so we need to recalculate it.
  if (hasContext) {
    invalidateContextProvider(workInProgress, Component, true);
  }

  return workInProgress.child;
}
```

```js
// packages/react-reconciler/src/ReactFiberClassComponent.js
function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any,
  renderExpirationTime: ExpirationTime,
): any {
  let isLegacyContextConsumer = false;
  let unmaskedContext = emptyContextObject;
  let context = null;
  const contextType = ctor.contextType;
  // newContext 和 legacyContext 不能同时使用
  // 也就是说 ClassComponent.contextType 和 ClassComponent.contextTypes 只能二选一
  if (typeof contextType === 'object' && contextType !== null) {
    // 获取 newContext
    context = readContext((contextType: any));
  } else {
    // 获取 legacyContext
    unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    const contextTypes = ctor.contextTypes;
    isLegacyContextConsumer =
      contextTypes !== null && contextTypes !== undefined;
    context = isLegacyContextConsumer
      ? getMaskedContext(workInProgress, unmaskedContext)
      : emptyContextObject;
  }

  // 构建组件实例
  const instance = new ctor(props, context);
  // 获取到组件实例的 state 并放到 fiber.memoizedState
  const state = (workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined
      ? instance.state
      : null);
  // workInProgress 和 instance 的双向关联
  // 并且 instance.updater = classComponentUpdater;
  adoptClassInstance(workInProgress, instance);

  // Cache unmasked context so we can avoid recreating masked context unless necessary.
  // ReactFiberContext usually updates this cache but can't for newly-created instances.
  if (isLegacyContextConsumer) {
    // 如果使用了传统 Context，则缓存 unmaskedContext 和 maskedContext
    // instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
    // instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return instance;
}
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  // updater 这个对象特别重要，instance.setState() 最终就是调用这个对象上的方法
  // 产生 update 并且调度任务
  instance.updater = classComponentUpdater;

  // workInProgress 和 instance 之间的双向引用
  workInProgress.stateNode = instance;
  // instance._reactInternalFiber = workInProgress
  setInstance(instance, workInProgress);
}
function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderExpirationTime: ExpirationTime,
): void {
  const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  instance.refs = emptyRefsObject;

  // 设置 instance.context
  const contextType = ctor.contextType;
  if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext(contextType);
  } else {
    const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    instance.context = getMaskedContext(workInProgress, unmaskedContext);
  }

  // 如果 updateQueue 不为空更新 instance.state
  let updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null) {
    processUpdateQueue(
      workInProgress,
      updateQueue,
      newProps,
      instance,
      renderExpirationTime,
    );
    instance.state = workInProgress.memoizedState;
  }

  // https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
  // getDerivedStateFromProps 这个 API 是在 16.3 版本中用来取代 componentWillReceiveProps 这个 API 的，为什么？
  // React 正在努力避免开发者在 UNSAFE_componentWillMount()、UNSAFE_componentWillUpdate()、UNSAFE_componentWillReceiveProps()
  // 这些 API 中调用 this.setState()，因为这可能导致 bug。
  // 而 static getDerivedStateFromProps() 是静态方法，不能够调用 this.setState()

  // UNSAFE_componentWillMount()、UNSAFE_componentWillUpdate()、UNSAFE_componentWillReceiveProps() 这些 API 标记了 UNSAFE_
  // 在 17 版本中会被删除

  // 这个 API 的使用场景只有一个，一个 state 需要根据 prop 计算得来，在 render() 之前
  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    );
    instance.state = workInProgress.memoizedState;
  }

  // 使用 react-lifecycles-compat polyfilled
  // 可以在老版本（-16.3）的 React 上使用新的 ctor.getDerivedStateFromProps、instance.getSnapshotBeforeUpdate
  // 为了在 react-lifecycles-compat 也能在 16.3 之后的版本中也能正确使用
  // 在这个类没有用到新 API 的情况下，允许使用老的 API
  // 实际上就是向后兼容
  if (
    typeof ctor.getDerivedStateFromProps !== 'function' &&
    typeof instance.getSnapshotBeforeUpdate !== 'function' &&
    (typeof instance.UNSAFE_componentWillMount === 'function' ||
      typeof instance.componentWillMount === 'function')
  ) {
    // 调用 componentWillMount() 生命周期
    // componentWillMount() 执行前后的 state 如果不一样，会 enqueue 一个 ReplaceUpdate
    callComponentWillMount(workInProgress, instance);
    // 所以要重新处理以下 updateQueue
    updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
      processUpdateQueue(
        workInProgress,
        updateQueue,
        newProps,
        instance,
        renderExpirationTime,
      );
      instance.state = workInProgress.memoizedState;
    }
  }

  // componentDidMount 生命周期不为空，标记一个 Update effectTag
  // componentDidMount 生命周期在提交阶段调用
  if (typeof instance.componentDidMount === 'function') {
    workInProgress.effectTag |= Update;
  }
}
export function applyDerivedStateFromProps(
  workInProgress: Fiber,
  ctor: any,
  getDerivedStateFromProps: (props: any, state: any) => any,
  nextProps: any,
) {
  const prevState = workInProgress.memoizedState;
  const partialState = getDerivedStateFromProps(nextProps, prevState);

  // Merge the partial state and the previous state.
  const memoizedState =
    partialState === null || partialState === undefined
      ? prevState
      : Object.assign({}, prevState, partialState);
  workInProgress.memoizedState = memoizedState;

  // Once the update queue is empty, persist the derived state onto the
  // base state.
  const updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null && workInProgress.expirationTime === NoWork) {
    updateQueue.baseState = memoizedState;
  }
}
function updateClassInstance(
  current: Fiber,
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderExpirationTime: ExpirationTime,
): boolean {
  const instance = workInProgress.stateNode;

  // 老的 props
  const oldProps = workInProgress.memoizedProps;
  // 考虑 React.lazy() resolve 了一个类组件的情形
  // instance.props 需要合并 ClassComponent 的 defaultProps
  // 但是 ClassComponent.defaultProps 一辈子不会改变
  // 所以判断一个组件的 props 有没有发生变化
  // 只需要判断 workInProgress.memoizedProps 就行了，不需要考虑 defaultProps
  instance.props =
    workInProgress.type === workInProgress.elementType
      ? oldProps
      : resolveDefaultProps(workInProgress.type, oldProps);

  // 老的 context
  const oldContext = instance.context;
  // 新的 context
  const contextType = ctor.contextType;
  let nextContext;
  if (typeof contextType === 'object' && contextType !== null) {
    nextContext = readContext(contextType);
  } else {
    const nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    nextContext = getMaskedContext(workInProgress, nextUnmaskedContext);
  }

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  const hasNewLifecycles =
    typeof getDerivedStateFromProps === 'function' ||
    typeof instance.getSnapshotBeforeUpdate === 'function';

  // 兼容老的 instance.componentWillReceiveProps 生命周期
  if (
    !hasNewLifecycles &&
    (typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
      typeof instance.componentWillReceiveProps === 'function')
  ) {
    if (oldProps !== newProps || oldContext !== nextContext) {
      callComponentWillReceiveProps(
        workInProgress,
        instance,
        newProps,
        nextContext,
      );
    }
  }

  // packages/react-reconciler/src/ReactUpdateQueue.js
  // 这个文件中的 hasForceUpdate 置为 false
  // 在 processUpdateQueue 的时候如果处理了强制更新
  // 会被置为 true
  resetHasForceUpdateBeforeProcessing();

  // oldState 和 newState
  const oldState = workInProgress.memoizedState;
  let newState = (instance.state = oldState);
  let updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null) {
    processUpdateQueue(
      workInProgress,
      updateQueue,
      newProps,
      instance,
      renderExpirationTime,
    );
    newState = workInProgress.memoizedState;
  }

  if (
    oldProps === newProps &&
    oldState === newState &&
    !hasContextChanged() &&
    // 读取 hasForceUpdate
    !checkHasForceUpdateAfterProcessing()
  ) {
    // 即使 props、state、context 都没有变化，子树可以跳过更新
    // 但是本节点还是需要执行 `componentDidUpdate` 和 `getSnapshotBeforeUpdate`
    // 为什么？
    if (typeof instance.componentDidUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Update;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Snapshot;
      }
    }
    return false;
  }

  // 执行 ctro.getDerivedStateFromProps
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    );
    newState = workInProgress.memoizedState;
  }

  // 强制更新了或者 shouldComponentUpdate 返回 true
  // ctor.prototype.isPureReactComponent 的 shouldComponentUpdate 默认返回浅比较结果
  const shouldUpdate =
    checkHasForceUpdateAfterProcessing() ||
    checkShouldComponentUpdate(
      workInProgress,
      ctor,
      oldProps,
      newProps,
      oldState,
      newState,
      nextContext,
    );

  if (shouldUpdate) {
    // 兼容 componentWillUpdate 生命周期
    if (
      !hasNewLifecycles &&
      (typeof instance.UNSAFE_componentWillUpdate === 'function' ||
        typeof instance.componentWillUpdate === 'function')
    ) {
      startPhaseTimer(workInProgress, 'componentWillUpdate');
      if (typeof instance.componentWillUpdate === 'function') {
        instance.componentWillUpdate(newProps, newState, nextContext);
      }
      if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
        instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
      }
      stopPhaseTimer();
    }
    // componentDidUpdate 存在就标记一个 Update effectTag
    if (typeof instance.componentDidUpdate === 'function') {
      workInProgress.effectTag |= Update;
    }
    // getSnapshotBeforeUpdate 存在就标记一个 Snapshot effectTag
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      workInProgress.effectTag |= Snapshot;
    }
  } else {
    // 为什么？
    if (typeof instance.componentDidUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Update;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Snapshot;
      }
    }

    // If shouldComponentUpdate returned false, we should still update the
    // memoized props/state to indicate that this work can be reused.
    workInProgress.memoizedProps = newProps;
    workInProgress.memoizedState = newState;
  }

  // Update the existing instance's state, props, and context pointers even
  // if shouldComponentUpdate returns false.
  instance.props = newProps;
  instance.state = newState;
  instance.context = nextContext;

  return shouldUpdate;
}
function checkShouldComponentUpdate(
  workInProgress,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState,
  nextContext,
) {
  const instance = workInProgress.stateNode;
  if (typeof instance.shouldComponentUpdate === 'function') {
    startPhaseTimer(workInProgress, 'shouldComponentUpdate');
    const shouldUpdate = instance.shouldComponentUpdate(
      newProps,
      newState,
      nextContext,
    );
    stopPhaseTimer();
    return shouldUpdate;
  }

  if (ctor.prototype && ctor.prototype.isPureReactComponent) {
    return (
      !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    );
  }

  return true;
}
```

```js
// 待会儿单独讲以下关于 update 的内容
const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, payload, callback) {
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);

    const update = createUpdate(expirationTime);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  },
  enqueueReplaceState(inst, payload, callback) {
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);

    const update = createUpdate(expirationTime);
    update.tag = ReplaceState;
    update.payload = payload;

    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'replaceState');
      }
      update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  },
  enqueueForceUpdate(inst, callback) {
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);

    const update = createUpdate(expirationTime);
    update.tag = ForceUpdate;

    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'forceUpdate');
      }
      update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  },
};
```

**completeWork**

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
    case ClassComponent: {
      const Component = workInProgress.type;
      // 如果是老版 Context 提供者，context 出栈
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      break;
    }
    // ...
  }
  return null;
}
```
