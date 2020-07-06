---
title: React 源码分析篇四：FiberRoot
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## Fiber

FiberRoot 对象结构

```js
// packages/react-reconciler/src/ReactFiberRoot.js
type BaseFiberRootProperties = {|
  // 容器 DOM
  containerInfo: any,
  // 只在持久化更新 - persistent updates 中用到
  pendingChildren: any,
  // 当前活动的 fiber 树的 root fiber
  current: Fiber,
  // 准备提交的 fiber 树的 root fiber
  finishedWork: Fiber | null,

  // The following priority levels are used to distinguish between 1)
  // uncommitted work, 2) uncommitted work that is suspended, and 3) uncommitted
  // work that may be unsuspended. We choose not to track each individual
  // pending level, trading granularity for performance.
  //
  // The earliest and latest priority levels that are suspended from committing.
  earliestSuspendedTime: ExpirationTime,
  latestSuspendedTime: ExpirationTime,
  // The earliest and latest priority levels that are not known to be suspended.
  // `markPendingPriorityLevel()` 函数中设置
  earliestPendingTime: ExpirationTime,
  latestPendingTime: ExpirationTime,
  // The latest priority level that was pinged by a resolved promise and can
  // be retried.
  latestPingedTime: ExpirationTime,

  pingCache:
    | WeakMap<Thenable, Set<ExpirationTime>>
    | Map<Thenable, Set<ExpirationTime>>
    | null,

  // If an error is thrown, and there are no more updates in the queue, we try
  // rendering from the root one more time, synchronously, before handling
  // the error.
  didError: boolean,

  pendingCommitExpirationTime: ExpirationTime,

  // Timeout handle returned by setTimeout. Used to cancel a pending timeout, if
  // it's superseded by a new one.
  timeoutHandle: TimeoutHandle | NoTimeout,
  // 顶层 context 对象，在调用 `ReactDOM.unstable_renderSubtreeIntoContainer()` 并且传递了 parentComponent 时有值
  context: Object | null,
  pendingContext: Object | null,
  // 初次渲染 - 挂载的时候是不是需要“水合”已经存在的节点
  +hydrate: boolean,
  // Remaining expiration time on this root.
  // TODO: Lift this into the renderer
  nextExpirationTimeToWorkOn: ExpirationTime,
  // 当前 FiberRoot 被调度的优先级/过期时间，在
  expirationTime: ExpirationTime,
  // List of top-level batches. This list indicates whether a commit should be
  // deferred. Also contains completion callbacks.
  // TODO: Lift this into the renderer
  firstBatch: Batch | null,
  // 下一个被调度的 FiberRoot
  // 在 packages/react-reconciler/src/ReactFiberScheduler.js 文件中
  // 模块内变量 firstScheduledRoot 指向第一个被调度的 FiberRoot
  // 模块内变量 lastScheduledRoot 指向最后一个被调度的 FiberRoot
  // 配合 fiberRoot.nextScheduledRoot 最终形成一个所有被调度的 FiberRoot 链表
  nextScheduledRoot: FiberRoot | null,
|};

// The following attributes are only used by interaction tracing builds.
// They enable interactions to be associated with their async work,
// And expose interaction metadata to the React DevTools Profiler plugin.
// Note that these attributes are only defined when the enableSchedulerTracing flag is enabled.
type ProfilingOnlyFiberRootProperties = {|
  interactionThreadID: number,
  memoizedInteractions: Set<Interaction>,
  pendingInteractionMap: PendingInteractionMap,
|};

// Exported FiberRoot type includes all properties,
// To avoid requiring potentially error-prone :any casts throughout the project.
// Profiling properties are only safe to access in profiling builds (when enableSchedulerTracing is true).
// The types are defined separately within this file to ensure they stay in sync.
// (We don't have to use an inline :any cast when enableSchedulerTracing is disabled.)
export type FiberRoot = {
  ...BaseFiberRootProperties,
  ...ProfilingOnlyFiberRootProperties,
};
```

Fiber 对象的结构：

```js
// packages/react-reconciler/src/ReactFiber.js
// A Fiber is work on a Component that needs to be done or was done. There can
// be more than one per component.
export type Fiber = {|
  // fiber 的类型标记
  // 各种 WorkTag 在 packages/shared/ReactWorkTags.js 这个文件中有明确定义：
  // const FunctionComponent = 0; 函数形式的自定义组件
  // const ClassComponent = 1;  类形式的自定义组件
  // const IndeterminateComponent = 2; 待定，确定之后会变成 FunctionComponent 或 ClassComponent
  // const HostRoot = 3; 整棵 fiber 树的根，但是也可能嵌套在另一个 fiber 树中，应该是指定了 parentComponent 的场景吧？
  // const HostPortal = 4; 子 fiber 树，进入另一个 renderer 或者同一个 renderer 的另一个渲染点的入口
  // const HostComponent = 5; 宿主环境原生组件，如 'div'
  // const HostText = 6; 宿主环境原生文本组件
  // const Fragment = 7; React 片段
  // const Mode = 8;
  // const ContextConsumer = 9; React NewContext 中的 Consumer
  // const ContextProvider = 10; React NewContext 中的 Provider
  // const ForwardRef = 11;
  // const Profiler = 12;
  // const SuspenseComponent = 13;
  // const MemoComponent = 14;
  // const SimpleMemoComponent = 15;
  // const LazyComponent = 16;
  // const IncompleteClassComponent = 17;
  tag: WorkTag,

  // Unique identifier of this child.
  key: null | string,

  // The value of element.type which is used to preserve the identity during
  // reconciliation of this child.
  // element.type 的值
  // 对于 Host Component，是一个字符串，如 'div'
  // 对于 自定义 Component，是一个函数、或者一个类
  // 对于其他 React 内置组件，如 React.Fragment，则是一个带有 `$$typeof` 属性的对象
  elementType: any,

  // 大部分情况下跟 elementType 是相同的
  // 但是在使用 `const OtherComponent = React.lazy(() => import('./OtherComponent'));` 时
  // 在 OtherComponent._ctor fullfilled 之前，type 的值是 null
  // 在 OtherComponent._ctor fullfield 之后，type 的值就是 OtherComponent._ctor resolve 的值
  type: any,

  // 跟这个 fiber 关联的本地实例，这个实例会记录一些渲染过程中用到的状态
  // HostComponent/HostText 类型 fiber 的 stateNode 是宿主环境 DOM 实例
  // ClassComponent 类型的 fiber 的 stateNode 是这个类的实例
  stateNode: any,

  // Conceptual aliases
  // parent : Instance -> return The parent happens to be the same as the
  // return fiber since we've merged the fiber and instance.

  // Remaining fields belong to Fiber

  // The Fiber to return to after finishing processing this one.
  // This is effectively the parent, but there can be multiple parents (two)
  // so this is only the parent of the thing we're currently processing.
  // It is conceptually the same as the return address of a stack frame.
  return: Fiber | null,

  // Singly Linked List Tree Structure.
  child: Fiber | null,
  sibling: Fiber | null,
  index: number,

  // The ref last used to attach this node.
  // I'll avoid adding an owner field for prod and model that as functions.
  ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,

  // Input is the data coming into process this fiber. Arguments. Props.
  pendingProps: any, // This type will be more specific once we overload the tag.
  memoizedProps: any, // The props used to create the output.

  // A queue of state updates and callbacks.
  updateQueue: UpdateQueue<any> | null,

  // The state used to create the output
  memoizedState: any,

  // A linked-list of contexts that this fiber depends on
  contextDependencies: ContextDependencyList | null,

  // 是一些这个 fiber 节点的标记
  // 新创建的节点默认继承父节点的 mode、可以在创建时增加其他的标记
  // 节点创建之后整个生命周期内不发生改变
  // NoContext、ConcurrentMode、StrictMode、ProfileMode 四种标记
  // ConcurrentMode 表示是否默认异步渲染，`React.render()` 方法中创建的传统 HostRoot 不会设置这个
  mode: TypeOfMode,

  // Effect
  effectTag: SideEffectTag,

  // Singly linked list fast path to the next fiber with side-effects.
  nextEffect: Fiber | null,

  // The first and last fiber with side-effect within this subtree. This allows
  // us to reuse a slice of the linked list when we reuse the work done within
  // this fiber.
  firstEffect: Fiber | null,
  lastEffect: Fiber | null,

  // Represents a time in the future by which this work should be completed.
  // Does not include work found in its subtree.
  expirationTime: ExpirationTime,

  // This is used to quickly determine if a subtree has no pending changes.
  childExpirationTime: ExpirationTime,

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: Fiber | null,

  // Time spent rendering this Fiber and its descendants for the current update.
  // This tells us how well the tree makes use of sCU for memoization.
  // It is reset to 0 each time we render and only updated when we don't bailout.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualDuration?: number,

  // If the Fiber is currently active in the "render" phase,
  // This marks the time at which the work began.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualStartTime?: number,

  // Duration of the most recent render time for this Fiber.
  // This value is not updated when we bailout for memoization purposes.
  // This field is only set when the enableProfilerTimer flag is enabled.
  selfBaseDuration?: number,

  // Sum of base times for all descedents of this Fiber.
  // This value bubbles up during the "complete" phase.
  // This field is only set when the enableProfilerTimer flag is enabled.
  treeBaseDuration?: number,

  // Conceptual aliases
  // workInProgress : Fiber ->  alternate The alternate used for reuse happens
  // to be the same as work in progress.
  // __DEV__ only
  _debugID?: number,
  _debugSource?: Source | null,
  _debugOwner?: Fiber | null,
  _debugIsCurrentlyTiming?: boolean,
|};
```

## 关于 fiberRoot 上的各种 `*ExpirationTimeWork`

在 `packages/react-reconciler/src/ReactFiberPendingPriority.js` 文件中对外暴露四个函数：

`markPendingPriorityLevel()` 中会更新 `root.latestPendingTime`、`root.earliestPendingTime`
`markCommittedPriorityLevels()` 中会更新 `root.earliestPendingTime `、`root.latestPendingTime`、`root.earliestSuspendedTime`、`root.latestSuspendedTime`、`root.latestPingedTime`
`markPingedPriorityLevel()` 中会更新 `root.latestPingedTime`
`markSuspendedPriorityLevel()` 中会更新 `root.earliestPendingTime`、`root.latestPendingTime`、`root.earliestSuspendedTime`、`root.latestSuspendedTime`

这四个方法都会调用 `findNextExpirationTimeToWorkOn()` 函数，这个函数按照 `root.earliestPendingTime`、`root.latestPingedTime`、`root.latestSuspendedTime`、`root.earliestSuspendedTime` 的顺序寻找下一次工作的优先级，然后更新到 root 上：

```js
root.nextExpirationTimeToWorkOn = nextExpirationTimeToWorkOn;
root.expirationTime = expirationTime;
```

TODO: 关于 pendingWork、suspendedWork 和 pingedWork


---

```js
// packages/react-reconciler/src/ReactFiber.js

// 这是创建 Fiber 的构造函数
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.contextDependencies = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null;
}

// 这是创建 Fiber 的工厂函数
const createFiber = function(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
): Fiber {
  return new FiberNode(tag, pendingProps, key, mode);
};
```

Fiber 的构造函数和工厂函数只在这个文件中使用，不对外进行暴露。在外面使用以下一些方法创建 Fiber：

- `function createWorkInProgress(current: Fiber, pendingProps: any, expirationTime: ExpirationTime): Fiber`
- `function createHostRootFiber(isConcurrent: boolean): Fiber`
- `function createFiberFromTypeAndProps(type: any, key: null | string, pendingProps: any, owner: null | Fiber, mode: TypeOfMode, expirationTime: ExpirationTime ): Fiber`
- `function createFiberFromElement(element: ReactElement, mode: TypeOfMode, expirationTime: ExpirationTime): Fiber`
- `function createFiberFromFragment(elements: ReactFragment, mode: TypeOfMode, expirationTime: ExpirationTime, key: null | string): Fiber`
- `function createFiberFromSuspense(pendingProps: any, mode: TypeOfMode, expirationTime: ExpirationTime, key: null | string): Fiber`
- `function createFiberFromText(content: string, mode: TypeOfMode, expirationTime: ExpirationTime): Fiber`
- `function createFiberFromHostInstanceForDeletion(): Fiber`
- `function createFiberFromPortal(portal: ReactPortal, mode: TypeOfMode, expirationTime: ExpirationTime): Fiber`

fiber.elementType 和 fiber.type 通常是一个东西。但是在 `createFiberFromTypeAndProps()` 这个函数在处理 `type.$$typeof === REACT_LAZY_TYPE` 时：

```js
fiber.elementType = type; // 一个 Promise
fiber.type = resolvedType; // 刚创建时是 null
```

```js
const OtherComponent = React.lazy(() => import('./OtherComponent'));
```

还有一种特殊的的情况：`createFiberFromHostInstanceForDeletion()` 这个函数中：

```js
fiber.elementType = 'DELETED';
fiber.type = 'DELETED';
```

这个 fiber 创建的目的就是为了在提交阶段删除多余的子 DOM，这个 fiber 只会添加到 effect list 中，通过 parent.child、fiber.sibling、fiber.return 遍历 fiber 树时，永远不会遍历到这个 fiber
