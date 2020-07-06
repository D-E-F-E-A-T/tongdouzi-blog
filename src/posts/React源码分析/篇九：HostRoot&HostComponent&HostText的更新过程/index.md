---
title: Rect 源码分析篇九：HostRoot、HostComponent、HostText 的更新过程
date: 2020-04-03
categories:
  - 技术
tags:
  - react
featureImage: ../react源码.png
---

## HostRoot 渲染过程

### beginWork

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
  case HostRoot:
    return updateHostRoot(current, workInProgress, renderExpirationTime);
  // ...
  }
  // ...
}
// ...
function updateHostRoot(current, workInProgress, renderExpirationTime) {
  // 顶层 LegacyContext 入栈、顶层 HostContext 入站
  pushHostRootContext(workInProgress);
  // 基于 nextProps 和 prevState，根据 updateQueue 计算出 nextState
  const updateQueue = workInProgress.updateQueue; // updateQueue.firstUpdate.tag 永远是 UpdateState
  const nextProps = workInProgress.pendingProps;  // HostRoot 的 pendingProps 永远是 null
  const prevState = workInProgress.memoizedState; // HostRoot 的 memoizedState 只有 element 一个属性
  const prevChildren = prevState !== null ? prevState.element : null; // 初次渲染是 null
  processUpdateQueue(
    workInProgress,
    updateQueue,
    nextProps,
    null,
    renderExpirationTime,
  );
  const nextState = workInProgress.memoizedState; // 新的 state 已经更新到 workInProgress.memoizedState
  const nextChildren = nextState.element;
  // 比较更新之后的 memoizedState.element 有没有发生变化
  if (nextChildren === prevChildren) {
    // 如果没有变化，走 bailout 流程，复用上次 finishedWork
    // 因为存在 prevChildren，所以必不是初次渲染，需要清空 hudrate 状态
    resetHydrationState();
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }
  // 如果发生变化，走 recocile 流程
  const root: FiberRoot = workInProgress.stateNode;
  if (
    (current === null || current.child === null) &&
    root.hydrate &&
    // enterHydrationState() 函数返回的是渲染环境支不支持水合 - supportsHydration
    // 在 DOM 环境的 ReactDOMHostConfig 中值为 true
    // 如果支持，会初始化一些水合过程需要用到的变量：
    // nextHydratableInstance、hydrationParentFiber、isHydrating
    enterHydrationState(workInProgress)
  ) {
    // 初次渲染并且需要水合，直接调用 mountChildFibers()
    // mountChildFibers() 函数在新创建的 fiber 节点不会设置 Placement effectTag
    // 设置了 Placement effectTag 的 fiber 在提交阶段会创建新的 DOM 并插入到父 DOM 中
    // 因为水合过程需要复用已经存在的 DOM 节点，所以不能设置 Placement effectTag

    // isMounted() 这个 API 依赖于 fiber 节点及其父 fiber 上有没有设置 Placement effectTag 来判断是不是 mounting 状态
    // 而水合过程所有新创建的 fiber 都不会设置 Placement effectTag
    // 所以这里在 rootFiber 上设置 Placement effectTag
    // 使得 isMounted() 这个 API 能够正常工作
    workInProgress.effectTag |= Placement;

    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    // 正常渲染过程、该插入节点就设置 Placement effectTag

    // reconcileChildren() 函数实际上会根据 current 是不是空选择调用 mountChildFibers() 或 reconcileChildFibers()
    // hostRoot 节点 current 必不为空，所以这个地方实际上调用的总是 reconcileChildFibers()
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
    // 清空 hudrate 状态，重置水合过程用到的变量：
    // nextHydratableInstance、hydrationParentFiber、isHydrating
    resetHydrationState();
  }
  return workInProgress.child;
}
function pushHostRootContext(workInProgress) {
  const root = (workInProgress.stateNode: FiberRoot);
  // 顶层 LegacyContext 入栈
  // 顶层 LegactContext 来源于 fiberRoot.context || fiberRoot.pendingContext
  // fiberRoot.context || fiberRoot.pendingContext 来源于 parentComponent
  if (root.pendingContext) {
    pushTopLevelContextObject(
      workInProgress,
      root.pendingContext,
      root.pendingContext !== root.context,
    );
  } else if (root.context) {
    pushTopLevelContextObject(workInProgress, root.context, false);
  }
  // 顶层 HostContext 入站
  pushHostContainer(workInProgress, root.containerInfo);
}
```

### completeWork

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
    case HostRoot: {
      // 顶层 HostContext 出栈
      popHostContainer(workInProgress);
      // 顶层 LegacyContext 出栈
      popTopLevelLegacyContextObject(workInProgress);
      // fiberRoot.pendingContext 已经消化完了，放到 fiberRoot.context 上去
      const fiberRoot = (workInProgress.stateNode: FiberRoot);
      if (fiberRoot.pendingContext) {
        fiberRoot.context = fiberRoot.pendingContext;
        fiberRoot.pendingContext = null;
      }
      if (current === null || current.child === null) {
        // 与 hydrate 过程相关
        popHydrationState(workInProgress);
        // 清除 hostRoot 上的 Placement effectTag，以使 isMounted() API 返回 true
        workInProgress.effectTag &= ~Placement;
      }
      updateHostContainer(workInProgress);
      break;
    }
    // ...
  }
  return null;
}
// ...
// supportsMutation 在 DOM 环境为 true
if (supportsMutation) {
  // Mutation mode
  updateHostContainer = function(workInProgress: Fiber) {
    // Noop
  };
} else {
  updateHostContainer = function(workInProgress: Fiber) {
    // ...
  };
}
```

### 总结

HostRoot fiber 节点渲染之后只有可能设置 Callback effectTag，这个 effectTag 在 `processUpdateQueue()` 这个函数中设置。这个 effect 会回调 `legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback)` 函数中的 `callback` 参数，也就是 `ReactDOM.render(element, container, callback)` 中的 `callback`。`Callback` 在 commit 阶段的 `commitAllLifeCycles` 过程中会执行。

## HostComponent 的渲染过程

### beginWork

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
   case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime);
  // ...
  }
  // ...
}
function updateHostComponent(current, workInProgress, renderExpirationTime) {
  // HostContext 入栈
  pushHostContext(workInProgress);
  // 水合相关
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  // fiber 的 type，也就是 element 的 type，HostComponent fiber 的 type 是 'div'、'span' 等字符串
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  // 是不是直接文本子节点：由 type 和 props 共同决定
  // 例如 textarea、option、noscript 这些只能有直接文本子节点
  // props.children 是文本或者数字，则子节点只能是直接文本子节点
  // 还有 props.danagerousSetInnerHTML 这种场景
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    // 直接文本子节点场景特殊处理，不额外创建 HostText fiber
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // 上一次渲染结果只有直接文本子节点，这次不是直接文本子节点
    // 这个 fiber 上需要设置 ContentReset effectTag，这样文本才能填充进去
    workInProgress.effectTag |= ContentReset;
  }
  // workInProgress.ref 发生变更，设置 Ref effectTag
  markRef(current, workInProgress);

  if (
    // renderExpirationTime 还会是  Never 吗？
    renderExpirationTime !== Never &&
    // 工作在 ConcurrentMode 下
    workInProgress.mode & ConcurrentMode &&
    // 翻译过来就是 “应该取消子树优先级？”
    // DOM 环境下就返回 !!props.hidden
    shouldDeprioritizeSubtree(type, nextProps)
  ) {
    // 取消子树优先级，Never 优先级称为 offscreen/hidden 优先级
    workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
    return null;
  }
  // 调协子节点
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}
```

### completeWork

```js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // ...
    case HostComponent: {
      // HostContext 出栈
      popHostContext(workInProgress);
      // HostRoot 或者 HostPortal 节点对应的 DOM
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null) {
        // 不是初次渲染：update
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        );
        // 标记 Ref effectTag
        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        // 是初次渲染：挂载
        if (!newProps) {
          // 正常情况下不会发生
          // 即使是没有任何 props 的 workInProgress 也有一个空的 workInProgress.pendingProps
          // `<span />` => `{props: {}, ...}`
          break;
        }
        // 当前 HostContext，其实就是 namespace
        const currentHostContext = getHostContext();
        // TODO: Move createInstance to beginWork and keep it on a context
        // "stack" as the parent. Then append children as we go in beginWork
        // or completeWork depending on we want to add then top->down or
        // bottom->up. Top->down is faster in IE11.
        let wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          // TODO: Move this and createInstance step into the beginPhase
          // to consolidate.
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            // If changes to the hydrated node needs to be applied at the
            // commit-phase we mark this as such.
            markUpdate(workInProgress);
          }
        } else {
          // 创建 dom 对象
          let instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
          // 找到子树中所有应该挂载到 instance 上的所有 DOM
          // 并挂载到 instance 上
          appendAllChildren(instance, workInProgress, false, false);

          if (
            // 这个方法很重要，会把 props 中的属性、文本设置到 DOM 节点上去
            // 然后，返回这个 DOM 节点要不要自动聚焦 shouldAutoFocusHostComponent(type, props)
            finalizeInitialChildren(
              // DOM
              instance,
              // 因为是 HostComponent fiber，type 就是表签名，如 'div'
              type,
              newProps,
              // 容器 DOM 节点
              rootContainerInstance,
              // document.createElementNS() 用的命名空间
              currentHostContext,
            )
          ) {
            // 标记 Update effectTag
            markUpdate(workInProgress);
          }
          // 设置 stateNode
          workInProgress.stateNode = instance;
        }

        if (workInProgress.ref !== null) {
          // 标记 Ref effectTag
          markRef(workInProgress);
        }
      }
      break;
    }
    // ...
  }
  return null;
}

if (supportsMutation) {
  // ...
  appendAllChildren = function(
    parent: Instance,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean,
  ) {
    // 主要目的就是把所有子 DOM 节点都挂载到父 DOM 节点上
    // fiber.child 可能是 ClassComponent 等类型，所以要往 fiber.child 方向上找
    // 直到找到第一个 HostComponent 或者 HostText，然后把 fiber.stateNode 挂载上
    let node = workInProgress.child;
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        // 将 node.stateNode 挂载到 parent 上
        appendInitialChild(parent, node.stateNode);
      } else if (node.tag === HostPortal) {
        // 不做任何处理
      } else if (node.child !== null) {
        // child.return 从 current 换成 workInProgress
        // 不知道这里为什么要重置一些 child.return？
        // 讲道理通过 reconcileChildFibers()/mountChildFibers() 之后
        // 所有的 return 都应该指向了 workInProgress
        node.child.return = node;
        // 沿着 child 找，直到找到 HostComponent 或者 HostText
        node = node.child;
        continue;
      }
      if (node === workInProgress) {
        return;
      }
      // 往回倒
      while (node.sibling === null) {
        if (node.return === null || node.return === workInProgress) {
          // 所有子 fiber 遍历完了
          return;
        }
        node = node.return;
      }
      // 沿着 sibling 找
      node.sibling.return = node.return;
      node = node.sibling;
    }
  };
  updateHostComponent = function(
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
  ) {
    const oldProps = current.memoizedProps;
    if (oldProps === newProps) {
      // props 没有任何变化，直接跳过
      // HostComponent 没有任何 context
      return;
    }
    const instance: Instance = workInProgress.stateNode;
    const currentHostContext = getHostContext();
    // diff lastProps 和 nextProps，生成一个补丁
    // 这个 updatePayload 的格式是 ['a', null, 'b', null, 'a', '1', 'c', '3']
    // 表示 a 属性的值更新为 '1'， b 属性值没有更新，增加 c 属性并且值为 '3'
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
      currentHostContext,
    );
    // 这个 updateQueue 和 biginWork 阶段的 updateQueue 已经不是一个意义了
    workInProgress.updateQueue = (updatePayload: any);
    if (updatePayload) {
      // 有更新，标记 Update effectTag
      markUpdate(workInProgress);
    }
  };
  // ...
} else {
  // ...
}
```

```js
// packages/react-dom/src/client/ReactDOMHostConfig.js
export function appendInitialChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  // 挂载子 DOM 节点到父 DOM 节点
  parentInstance.appendChild(child);
}
export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): Instance {
  let parentNamespace: string;
  if (__DEV__) {
    // ...
  } else {
    parentNamespace = ((hostContext: any): HostContextProd);
  }
  const domElement: Instance = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  );
  // domElement.__reactInternalInstance$xxx = internalInstanceHandle
  // internalInstanceHandle 就是 workInProgress
  precacheFiberNode(internalInstanceHandle, domElement);
  // domElement.__reactEventHandlers$xxx = props
  // props 就是 workInProgress.pendingProps
  updateFiberProps(domElement, props);
  return domElement;
}
export function prepareUpdate(
  domElement: Instance,
  type: string,
  oldProps: Props,
  newProps: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
): null | Array<mixed> {
  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
  );
}
```

```js
// packages/react-dom/src/client/ReactDOMComponent.js
export function createElement(
  type: string,
  props: Object,
  rootContainerElement: Element | Document,
  parentNamespace: string,
): Element {
  let isCustomComponentTag;
  // 一般直接取 container.ownerDocument
  // 容器就是 document 对象的情况下，container.ownerDocument 是 null，因此需要直接取 container
  const ownerDocument: Document = getOwnerDocumentFromRootContainer(
    rootContainerElement,
  );
  let domElement: Element;
  let namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    // 一般直接取 HTML_NAMESPACE
    // `svg` 和 `<math>` 特殊处理
    namespaceURI = getIntrinsicNamespace(type);
  }
  if (namespaceURI === HTML_NAMESPACE) {
    if (type === 'script') {
      // Create the script via .innerHTML so its "parser-inserted" flag is
      // set to true and it does not execute
      const div = ownerDocument.createElement('div');
      div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
      // This is guaranteed to yield a script element.
      const firstChild = ((div.firstChild: any): HTMLScriptElement);
      domElement = div.removeChild(firstChild);
    } else if (typeof props.is === 'string') {
      // Web Components 组件有 is prop
      // $FlowIssue `createElement` should be updated for Web Components
      domElement = ownerDocument.createElement(type, {is: props.is});
    } else {
      // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
      // See discussion in https://github.com/facebook/react/pull/6896
      // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
      domElement = ownerDocument.createElement(type);
      // 一般 DOM 的属性是在 `setInitialDOMProperties()` 函数中去设置的
      // 然后 `select` 的 `multiple` 属性需要在插入前就设置好
      // 所以这个地方特殊处理一下
      if (type === 'select' && props.multiple) {
        const node = ((domElement: any): HTMLSelectElement);
        node.multiple = true;
      }
    }
  } else {
    // SVG_NAMESPACE、MATH_NAMESPACE
    domElement = ownerDocument.createElementNS(namespaceURI, type);
  }
  return domElement;
}
function finalizeInitialChildren(domElement, type, props, rootContainerInstance, hostContext) {
  // 把属性设置到 domElement 上去
  setInitialProperties(domElement, type, props, rootContainerInstance);
  // 返回要不要自动聚焦
  return shouldAutoFocusHostComponent(type, props);
}
function shouldAutoFocusHostComponent(type: string, props: Props): boolean {
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
  }
  return false;
}
export function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: Object,
  nextRawProps: Object,
  rootContainerElement: Element | Document,
): null | Array<mixed> {
  let updatePayload: null | Array<any> = null;

  // 根据 tag 整理一下 props
  let lastProps: Object;
  let nextProps: Object;
  switch (tag) {
    case 'input':
      lastProps = ReactDOMInputGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMInputGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'option':
      lastProps = ReactDOMOptionGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMOptionGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'select':
      lastProps = ReactDOMSelectGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMSelectGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'textarea':
      lastProps = ReactDOMTextareaGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMTextareaGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      if (
        typeof lastProps.onClick !== 'function' &&
        typeof nextProps.onClick === 'function'
      ) {
        // TODO: This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(((domElement: any): HTMLElement));
      }
      break;
  }
  assertValidProps(tag, nextProps);

  let propKey;
  let styleName;
  let styleUpdates = null;
  // 原来已经存在的属性，key 和 null 推到 updatePayload 里面去，如 ['foo', null, 'bar', null]
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue;
    }
    // style 属性整理
    if (propKey === STYLE) {
      // style 属性特殊处理，值是一个对象
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          styleUpdates[styleName] = '';
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
      // Noop. This is handled by the clear text mechanism.
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
    } else if (propKey === AUTOFOCUS) {
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (!updatePayload) {
        updatePayload = [];
      }
    } else {
      // 推一个 key 和一个 null
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    }
    if (propKey === STYLE) {
      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = '';
          }
        }
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          updatePayload.push(propKey, styleUpdates);
        }
        styleUpdates = nextProp;
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined;
      const lastHtml = lastProp ? lastProp[HTML] : undefined;
      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, '' + nextHtml);
        }
      } else {
      }
    } else if (propKey === CHILDREN) {
      if (
        lastProp !== nextProp &&
        (typeof nextProp === 'string' || typeof nextProp === 'number')
      ) {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
      }
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
      // Noop
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey);
      }
      if (!updatePayload && lastProp !== nextProp) {
        updatePayload = [];
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}
```

### 总结

HostComponent fiber 在渲染时：

1. beginWork 阶段不管三七二十一先标记一个 Ref effectTag，completeWork 阶段发现 ref 有改变，又再上去标上一个 Ref effectTag。是不是 HostComponent fiber 渲染一定会被标记上 Ref effectTag？？？
2. 对 children 直接文本子节点的情况做了特殊处理。是直接文本子节点，如`<span>hello</span>`，不会额外创建一个 HostText 子节点；非直接文本子节点，则在 `reconcileChildren()` 中会创建这个 HostText 子节点
3. 上次渲染是直接文本子节点，而这次不是，标记 ContentReset 标记
4. 初次渲染，创建 DOM 节点，并将所有的子 DOM 节点挂载到这个 DOM 上，如果 DOM 需要自动聚焦，还需要标记一个 Update effectTag
5. 初次渲染还要考虑 hydration 的情况？？？
6. 非初次渲染，diff 本次 props 和上次渲染的 props，diff 结果放到 updateQueue 中，并标记一个 Update effectTag

## HostText 渲染过程

### beginWork

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
    case HostText:
      return updateHostText(current, workInProgress);
  // ...
  }
  // ...
}
function updateHostText(current, workInProgress) {
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  // Nothing to do here. This is terminal. We'll do the completion step
  // immediately after.
  return null;
}
```
### completeWork

```js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // ...
    case HostText: {
      let newText = newProps;
      if (current && workInProgress.stateNode != null) {
        // 不是首次渲染 - update 操作
        const oldText = current.memoizedProps;
        // If we have an alternate, that means this is an update and we need
        // to schedule a side-effect to do the updates.
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        // 是首次渲染 - mount 操作
        if (typeof newText !== 'string') {
          // This can happen when we abort work.
        }
        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        let wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          if (prepareToHydrateHostTextInstance(workInProgress)) {
            markUpdate(workInProgress);
          }
        } else {
          // 创建文本 DOM 节点
          workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
        }
      }
      break;
    }
    // ...
  }
  return null;
}

if (supportsMutation) {
  // ...
  updateHostText = function(
    current: Fiber,
    workInProgress: Fiber,
    oldText: string,
    newText: string,
  ) {
    // 如果新文本与老文本不一致，标记一个 Update effectTag
    if (oldText !== newText) {
      markUpdate(workInProgress);
    }
  };
  // ...
} else {
  // ...
}
```

### 总结

1. 水合???
2. 首次渲染创建文本 DOM 节点
3. 不是首次渲染，且新老文本发生变化，标记 Update effectTag

## 水合过程

**beginWork**

```js
function updateHostRoot(current, workInProgress, renderExpirationTime) {
  // ...
  const nextChildren = nextState.element;
  if (nextChildren === prevChildren) {
    // If the state is the same as before, that's a bailout because we had
    // no work that expires at this time.
    resetHydrationState();
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }
  const root: FiberRoot = workInProgress.stateNode;
  if (
    (current === null || current.child === null) &&
    root.hydrate &&
    enterHydrationState(workInProgress)
  ) {
    // mountChildFibers
  } else {
    // reconcileChildren
    resetHydrationState();
  }
  return workInProgress.child;
}

function updateHostComponent(current, workInProgress, renderExpirationTime) {
  // ...
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  // ...
}
function updateHostText(current, workInProgress) {
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  return null;
}
```

```js
// packages/react-reconciler/src/ReactFiberHydrationContext.js
// 水合的 HostRoot fiber
let hydrationParentFiber: null | Fiber = null;
// 下一个可以水合的 DOM
let nextHydratableInstance: null | HydratableInstance = null;
// 水合状态标记
let isHydrating: boolean = false;

// 进入水合状态
function enterHydrationState(fiber: Fiber): boolean {
  // supportsHydration 来源于 HostConfig.js
  // 在 DOM 环境下为 true
  if (!supportsHydration) {
    return false;
  }

  const parentInstance = fiber.stateNode.containerInfo;
  // 找到 parentInstance.children 中第一个 node.nodeTpe 为 1 - ELEMENT_NODE 或者 3 - TEXT_NODE 的子节点
  nextHydratableInstance = getFirstHydratableChild(parentInstance);
  hydrationParentFiber = fiber;
  isHydrating = true;
  return true;
}
// 清除水合状态
function resetHydrationState(): void {
  if (!supportsHydration) {
    return;
  }

  hydrationParentFiber = null;
  nextHydratableInstance = null;
  isHydrating = false;
}
function tryToClaimNextHydratableInstance(fiber: Fiber): void {
  if (!isHydrating) {
    return;
  }
  let nextInstance = nextHydratableInstance;
  if (!nextInstance) {
    // fiber 直接标记 Placement effectTag，在提交阶段插入 DOM
    insertNonHydratedInstance((hydrationParentFiber: any), fiber);
    // 退出水合状态
    isHydrating = false;
    hydrationParentFiber = fiber;
    return;
  }
  const firstAttemptedInstance = nextInstance;
  // 尝试水合已存在 DOM，水合成功返回 true，水合失败返回 false
  if (!tryHydrate(fiber, nextInstance)) {
    // 水合失败
    // 找到下一个 node.nodeTpe 为 1 - ELEMENT_NODE 或者 3 - TEXT_NODE 的兄弟节点
    // 只向下找一个，只允许第一个子 DOM 是多余的，依据是什么？Dan Abramov 的直觉！！！
    nextInstance = getNextHydratableSibling(firstAttemptedInstance);
    if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
      // 尝试下一个节点还是失败
      // fiber 直接标记 Placement effectTag，在提交阶段插入 DOM
      insertNonHydratedInstance((hydrationParentFiber: any), fiber);
      // 退出水合状态
      isHydrating = false;
      hydrationParentFiber = fiber;
      return;
    }
    // 下一个 DOM 水合成功，说明第一个是 DOM 是多余的，需要删除
    // 但是不能在渲染阶段删除，所以只好额外创建一个假的 fiber，并且标记 Deletion effectTag，在提交阶段删除节点
    deleteHydratableInstance(
      (hydrationParentFiber: any),
      firstAttemptedInstance,
    );
  }
  // hydrationParentFiber 置为当前水合的 fiber
  hydrationParentFiber = fiber;
  // 获取下一个可以尝试水合的 DOM
  nextHydratableInstance = getFirstHydratableChild((nextInstance: any));
}
function tryHydrate(fiber, nextInstance) {
  switch (fiber.tag) {
    case HostComponent: {
      const type = fiber.type;
      const props = fiber.pendingProps;
      // instance.nodeType 为 ELEMENT_NODE 且 type 和 instance.nodeName 相同，返回 instance；
      // 否则返回 null
      const instance = canHydrateInstance(nextInstance, type, props);
      if (instance !== null) {
        fiber.stateNode = (instance: Instance);
        return true;
      }
      return false;
    }
    case HostText: {
      const text = fiber.pendingProps;
      // nextInstance.nodeType 为 TEXT_NODE 且 text 不为 ''
      const textInstance = canHydrateTextInstance(nextInstance, text);
      if (textInstance !== null) {
        fiber.stateNode = (textInstance: TextInstance);
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}
function deleteHydratableInstance(
  returnFiber: Fiber,
  instance: HydratableInstance,
) {
  // 创建“工具” fiber
  const childToDelete = createFiberFromHostInstanceForDeletion();
  // stateNode 指向那个多余的 DOM
  childToDelete.stateNode = instance;
  // return 指向 hydrationParentFiber
  // 注意，这个地方 returnFiber.child 没有指向 childToDelete
  // 也就说，沿着 rootFiber 遍历整颗树，这个 fiber 是不存在的
  childToDelete.return = returnFiber;
  // 标记 Deletion effectTag
  childToDelete.effectTag = Deletion;

  // 将这个“工具” fiber 添加进 effect list
  if (returnFiber.lastEffect !== null) {
    returnFiber.lastEffect.nextEffect = childToDelete;
    returnFiber.lastEffect = childToDelete;
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
  }
}
function insertNonHydratedInstance(returnFiber: Fiber, fiber: Fiber) {
  fiber.effectTag |= Placement;
}
```

**completeWork**

```js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // ...
    case HostRoot: {
      // ...
      if (current === null || current.child === null) {
        // If we hydrated, pop so that we can delete any remaining children
        // that weren't hydrated.
        popHydrationState(workInProgress);
        // ...
      }
      // ...
      break;
    }
    case HostComponent: {
      // ...
      if (current !== null && workInProgress.stateNode != null) {
        // ...
      } else {
        const currentHostContext = getHostContext();
        let wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            markUpdate(workInProgress);
          }
        } else {
          // ...
        }
        // ...
      }
      break;
    }
    case HostText: {
      let newText = newProps;
      if (current && workInProgress.stateNode != null) {
        // ...
      } else {
        // ...
        let wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          if (prepareToHydrateHostTextInstance(workInProgress)) {
            markUpdate(workInProgress);
          }
        } else {
          // ...
        }
      }
      break;
    }
    // ...
  }
  return null;
}
```

```js
// packages/react-reconciler/src/ReactFiberHydrationContext.js
function popHydrationState(fiber: Fiber): boolean {
  if (!supportsHydration) {
    return false;
  }
  if (fiber !== hydrationParentFiber) {
    // We're deeper than the current hydration context, inside an inserted
    // tree.
    return false;
  }
  if (!isHydrating) {
    // If we're not currently hydrating but we're in a hydration context, then
    // we were an insertion and now need to pop up reenter hydration of our
    // siblings.
    popToNextHostParent(fiber);
    isHydrating = true;
    return false;
  }

  const type = fiber.type;
  // 到 completeWork 这一步，说明 workInProgress 没有 child 节点了
  // 而这时候还有可以水合的节点，所以需要删除这些多余的子 DOM
  // 删除的方式，当然是创建“工具” fiber 啦
  // 忽略 head 和 body 下面多余的 DOM
  // 忽略 HostText 和只有直接文本子节点的 HostComponent，因为这些节点在提交阶段设置内容的时候会自动把多余的子 DOM 删掉
  if (
    fiber.tag !== HostComponent ||
    (type !== 'head' &&
      type !== 'body' &&
      !shouldSetTextContent(type, fiber.memoizedProps))
  ) {
    let nextInstance = nextHydratableInstance;
    while (nextInstance) {
      deleteHydratableInstance(fiber, nextInstance);
      nextInstance = getNextHydratableSibling(nextInstance);
    }
  }
  // 沿着 fiber.return 方向找到第一个 HostComponent 或者 HostRoot
  popToNextHostParent(fiber);
  // 应该不会出现 hydrationParentFiber 是 null 的情况吧？
  nextHydratableInstance = hydrationParentFiber
    ? getNextHydratableSibling(fiber.stateNode)
    : null;
  return true;
}
// 沿着 fiber.return 方向找到第一个 HostComponent 或者 HostRoot
function popToNextHostParent(fiber: Fiber): void {
  let parent = fiber.return;
  while (
    parent !== null &&
    parent.tag !== HostComponent &&
    parent.tag !== HostRoot
  ) {
    parent = parent.return;
  }
  hydrationParentFiber = parent;
}
function prepareToHydrateHostInstance(
  fiber: Fiber,
  rootContainerInstance: Container,
  hostContext: HostContext,
): boolean {
  if (!supportsHydration) {
    invariant(
      false,
      'Expected prepareToHydrateHostInstance() to never be called. ' +
        'This error is likely caused by a bug in React. Please file an issue.',
    );
  }
  // workInProgress.stateNode 在 beginWork 阶段的 tryHydrate() 调用时已经指向了水合到的 DOM
  const instance: Instance = fiber.stateNode;
  // diff lastProps 和 nextProps，生成一个补丁
  // 这个 updatePayload 的格式是 ['a', null, 'b', null, 'a', '1', 'c', '3']
  // 表示 a 属性的值更新为 '1'， b 属性值没有更新，增加 c 属性并且值为 '3'
  const updatePayload = hydrateInstance(
    instance,
    fiber.type,
    fiber.memoizedProps,
    rootContainerInstance,
    hostContext,
    fiber,
  );
  // TODO: Type this specific to this type of component.
  fiber.updateQueue = (updatePayload: any);
  // If the update payload indicates that there is a change or if there
  // is a new ref we mark this as an update.
  if (updatePayload !== null) {
    return true;
  }
  return false;
}
function prepareToHydrateHostTextInstance(fiber: Fiber): boolean {
  if (!supportsHydration) {
    invariant(
      false,
      'Expected prepareToHydrateHostTextInstance() to never be called. ' +
        'This error is likely caused by a bug in React. Please file an issue.',
    );
  }

  const textInstance: TextInstance = fiber.stateNode;
  const textContent: string = fiber.memoizedProps;
  const shouldUpdate = hydrateTextInstance(textInstance, textContent, fiber);
  return shouldUpdate;
}
```

---

## updateQueue

还是再等 class Component 渲染过程之后再再总结

processUpdateQueue()

```js
// packages/react-reconciler/src/ReactUpdateQueue.js
export function processUpdateQueue<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  props: any,
  instance: any,
  renderExpirationTime: ExpirationTime,
): void {
  hasForceUpdate = false;

  queue = ensureWorkInProgressQueueIsAClone(workInProgress, queue);

  // These values may change as we process the queue.
  let newBaseState = queue.baseState;
  let newFirstUpdate = null;
  let newExpirationTime = NoWork;

  // Iterate through the list of updates to compute the result.
  let update = queue.firstUpdate;
  let resultState = newBaseState;
  while (update !== null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime < renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      if (newFirstUpdate === null) {
        // This is the first skipped update. It will be the first update in
        // the new list.
        newFirstUpdate = update;
        // Since this is the first update that was skipped, the current result
        // is the new base state.
        newBaseState = resultState;
      }
      // Since this update will remain in the list, update the remaining
      // expiration time.
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime;
      }
    } else {
      // This update does have sufficient priority. Process it and compute
      // a new result.
      resultState = getStateFromUpdate(
        workInProgress,
        queue,
        update,
        resultState,
        props,
        instance,
      );
      const callback = update.callback;
      if (callback !== null) {
        workInProgress.effectTag |= Callback;
        // Set this to null, in case it was mutated during an aborted render.
        update.nextEffect = null;
        if (queue.lastEffect === null) {
          queue.firstEffect = queue.lastEffect = update;
        } else {
          queue.lastEffect.nextEffect = update;
          queue.lastEffect = update;
        }
      }
    }
    // Continue to the next update.
    update = update.next;
  }

  // Separately, iterate though the list of captured updates.
  let newFirstCapturedUpdate = null;
  update = queue.firstCapturedUpdate;
  while (update !== null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime < renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      if (newFirstCapturedUpdate === null) {
        // This is the first skipped captured update. It will be the first
        // update in the new list.
        newFirstCapturedUpdate = update;
        // If this is the first update that was skipped, the current result is
        // the new base state.
        if (newFirstUpdate === null) {
          newBaseState = resultState;
        }
      }
      // Since this update will remain in the list, update the remaining
      // expiration time.
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime;
      }
    } else {
      // This update does have sufficient priority. Process it and compute
      // a new result.
      resultState = getStateFromUpdate(
        workInProgress,
        queue,
        update,
        resultState,
        props,
        instance,
      );
      const callback = update.callback;
      if (callback !== null) {
        workInProgress.effectTag |= Callback;
        // Set this to null, in case it was mutated during an aborted render.
        update.nextEffect = null;
        if (queue.lastCapturedEffect === null) {
          queue.firstCapturedEffect = queue.lastCapturedEffect = update;
        } else {
          queue.lastCapturedEffect.nextEffect = update;
          queue.lastCapturedEffect = update;
        }
      }
    }
    update = update.next;
  }

  if (newFirstUpdate === null) {
    queue.lastUpdate = null;
  }
  if (newFirstCapturedUpdate === null) {
    queue.lastCapturedUpdate = null;
  } else {
    workInProgress.effectTag |= Callback;
  }
  if (newFirstUpdate === null && newFirstCapturedUpdate === null) {
    // We processed every update, without skipping. That means the new base
    // state is the same as the result state.
    newBaseState = resultState;
  }

  queue.baseState = newBaseState;
  queue.firstUpdate = newFirstUpdate;
  queue.firstCapturedUpdate = newFirstCapturedUpdate;

  // Set the remaining expiration time to be whatever is remaining in the queue.
  // This should be fine because the only two other things that contribute to
  // expiration time are props and context. We're already in the middle of the
  // begin phase by the time we start processing the queue, so we've already
  // dealt with the props. Context in components that specify
  // shouldComponentUpdate is tricky; but we'll have to account for
  // that regardless.
  workInProgress.expirationTime = newExpirationTime;
  workInProgress.memoizedState = resultState;
}
```


## reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime)

`switch (newChild.$$typeof)`
  `reconcileSingleElement()`
    `child = createFiberFromElement(element, returnFiber.mode, expirationTime)`
    `child.ref = coerceRef()`
    `child.return = returnFiber`
  `placeSingleChild(child)`
    `newFiber.effectTag = Placement;`
  `return child;`

=> 总结：updateHostRoot 创建了一个 child fiber 子节点

```js
nextUnitOfWork = completeWork(
    current,
    workInProgress,
    nextRenderExpirationTime,
  );
```
