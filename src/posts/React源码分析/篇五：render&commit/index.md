---
title: React 源码分析篇四：renderRoot
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## render

主要将 workLoop + 几个简单组件的更新

## commitRoot

围绕这 finishWork 树的 effect list

```js
function renderRoot(root: FiberRoot, isYieldy: boolean): void {
  // ...
}
```

```js
function commitRoot(root: FiberRoot, finishedWork: Fiber): void {
  isWorking = true;
  isCommitting = true;
  startCommitTimer();
  // ...
  const committedExpirationTime = root.pendingCommitExpirationTime;
  root.pendingCommitExpirationTime = NoWork;

  const updateExpirationTimeBeforeCommit = finishedWork.expirationTime;
  const childExpirationTimeBeforeCommit = finishedWork.childExpirationTime;
  // earliestRemainingTimeBeforeCommit 最大的优先级、也就是最早的过期时间
  const earliestRemainingTimeBeforeCommit =
    childExpirationTimeBeforeCommit > updateExpirationTimeBeforeCommit
      ? childExpirationTimeBeforeCommit
      : updateExpirationTimeBeforeCommit;

}
```

root.pendingCommitExpirationTime === NoWork 表示这个树是 incomplete 的

root.pendingCommitExpirationTime 这个叫做 committedExpirationTime
root.earliestPendingTime
root.latestPendingTime
root.earliestSuspendedTime
root.latestSuspendedTime
root.latestPingedTime

---

fiber 的 effect list 是一个链表，链的是所有有 effect 的子 fiber
fiber 有没有 effect 的依据是 `fiber.effectTag > PerformedWork`

fiber.firstEffect 指向第一个有 effect 的子 fiber
fiber.lastEffect 指向最后一个有 effect 的子 fiber
childFiber.nextEffect 指向下一个有 effect 的兄弟 fiber

但是 fiber list 中只包含它的子节点，不包含它自己。因此 `commitRoot()` 时，如果 root 设置了 effectTag，需要先将 root 自己添加到 root 的 effect list 当中：

```js
let firstEffect;
if (finishedWork.effectTag > PerformedWork) {
  if (finishedWork.lastEffect !== null) {
    // 存在  effect list，将自己添加到末尾
    finishedWork.lastEffect.nextEffect = finishedWork;
    firstEffect = finishedWork.firstEffect;
  } else {
    // 不存在 effect list，effect list 只有 root
    firstEffect = finishedWork;
  }
} else {
  // root 没有 effect
  firstEffect = finishedWork.firstEffect;
}
```

mutation 现场保存和恢复：

```js
prepareForCommit(root.containerInfo); // mutation 前关闭事件监听、保存文本框选中信息
// ...
resetAfterCommit(root.containerInfo); // mutation 后打开事件监听、恢复文本框选中信息
```

提交修改前 effect，如函数组件的 `getSnapshotBeforeUpdate()`

```js
nextEffect = firstEffect;
while (nextEffect !== null) {
  let didError = false;
  let error;
  try {
    commitBeforeMutationLifecycles();
  } catch (e) {
    didError = true;
    error = e;
  }
  if (didError) {
    captureCommitPhaseError(nextEffect, error);
    if (nextEffect !== null) {
      nextEffect = nextEffect.nextEffect;
    }
  }
}
```

提交宿主环境相关的 effect，如 host insertions, updates, deletions, ref unmounts：

```js
nextEffect = firstEffect;
while (nextEffect !== null) {
  let didError = false;
  let error;
  try {
    commitAllHostEffects();
  } catch (e) {
    didError = true;
    error = e;
  }
  if (didError) {
    captureCommitPhaseError(nextEffect, error);
    if (nextEffect !== null) {
      nextEffect = nextEffect.nextEffect;
    }
  }
}
```

提交剩下的 effect，如 life-cycles 和 ref callbacks

```js
nextEffect = firstEffect;
while (nextEffect !== null) {
  let didError = false;
  let error;
  try {
    commitAllLifeCycles(root, committedExpirationTime);
  } catch (e) {
    didError = true;
    error = e;
  }
  if (didError) {
    captureCommitPhaseError(nextEffect, error);
    if (nextEffect !== null) {
      nextEffect = nextEffect.nextEffect;
    }
  }
}
```

延迟提交 passive effect，如 `useEffect()`。延迟提交的目的是让浏览器尽快渲染、绘制这些更新。虽然是延迟，但是进入下次渲染前，会确保这些 effect 已经提交完成

```js
if (firstEffect !== null && rootWithPendingPassiveEffects !== null)
  let callback = commitPassiveEffects.bind(null, root, firstEffect);
  passiveEffectCallbackHandle = schedulePassiveEffects(callback);
  passiveEffectCallback = callback;
}
function commitPassiveEffects(root: FiberRoot, firstEffect: Fiber): void {
  rootWithPendingPassiveEffects = null;
  passiveEffectCallbackHandle = null;
  passiveEffectCallback = null;

  const previousIsRendering = isRendering;
  isRendering = true;

  let effect = firstEffect;
  do {
    if (effect.effectTag & Passive) {
      let didError = false;
      let error;
      try {
        commitPassiveHookEffects(effect);
      } catch (e) {
        didError = true;
        error = e;
      }
      if (didError) {
        captureCommitPhaseError(effect, error);
      }
    }
    effect = effect.nextEffect;
  } while (effect !== null);
  isRendering = previousIsRendering;

  const rootExpirationTime = root.expirationTime;
  if (rootExpirationTime !== NoWork) {
    requestWork(root, rootExpirationTime);
  }
}
```
