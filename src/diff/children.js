import { createVNode, Fragment } from '../create-element';
import { EMPTY_ARR, EMPTY_OBJ } from '../constant';
import { diff } from './index';
import { removeNode } from '../util';

export function diffChildren (
  parentDom,
  renderResult,
  newParentVNode,
  oldParentVNode,
  commitQueue,
  oldDom,
) {
  let childVNode, oldVNode, newDom, firstChildDom;
  let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR;

  newParentVNode._children = [];

  for (let i = 0; i < renderResult.length; i++) {
    childVNode = renderResult[i];
    // 1.创建子节点
    if (childVNode == null || typeof childVNode == 'boolean') {
      childVNode = newParentVNode._children[i] = null;
    } else if (
      typeof childVNode == 'string' ||
      typeof childVNode == 'number' ||
      typeof childVNode == 'bigint'
    ) {
      childVNode = newParentVNode._children[i] = createVNode(
        null,
        childVNode,
        null,
      );
    } else if (Array.isArray(childVNode)) {
      childVNode = newParentVNode._children[i] = createVNode(
        Fragment,
        { children: childVNode },
        null,
      );
    } else if (childVNode._depth > 0) {
      // VNode is already in use, clone it. This can happen in the following
      // scenario:
      //   const reuse = <div />
      //   <div>{reuse}<span />{reuse}</div>
      childVNode = newParentVNode._children[i] = createVNode(
        childVNode.type,
        childVNode.props,
        childVNode.key,
      );
    } else {
      childVNode = newParentVNode._children[i] = childVNode;
    }

    if (childVNode == null) {
      continue;
    }

    childVNode._parent = newParentVNode;
    childVNode._depth = newParentVNode._depth + 1;

    oldVNode = oldChildren[i];
    // 2.新旧子节点key对比
    if (!oldVNode ||
      (oldVNode &&
        oldVNode.type === childVNode.type &&
        oldVNode.key === childVNode.key
      )
    ) {
      oldChildren[i] = undefined;
    } else {
      for (let i = 0; i < oldChildren.length; i++) {
        oldVNode = oldChildren[i];
        if (oldVNode &&
          oldVNode.type === childVNode.type &&
          oldVNode.key === childVNode.key
        ) {
          oldChildren[i] = undefined;
          break;
        }
        oldVNode = null;
      }
    }
    oldVNode = oldVNode || EMPTY_OBJ;

    // 3.diff对比子节点
    diff(
      parentDom,
      childVNode,
      oldVNode,
      commitQueue,
      oldDom,
    );

    // 4.dom替换
    newDom = childVNode._dom;
    if (newDom) {
      firstChildDom = firstChildDom || newDom;
      if (
        typeof childVNode.type === 'function' &&
        childVNode._children === oldVNode._children
      ) {
        childVNode._nextDom = oldDom = reorderChildren(
          childVNode,
          oldDom,
          parentDom,
        );
      } else {
        oldDom = placeChild(
          parentDom,
          oldVNode,
          oldChildren,
          newDom,
          oldDom,
        );
      }
    }
  }

  // 5. 卸载
  for (let i = oldChildren.length - 1; i >= 0; i--) {
    if (oldChildren[i]) {
      unmount(oldChildren[i], oldChildren[i]);
    }
  }
}

export function unmount (vnode, parentVNode, skipRemove) {
  let r;

  let dom;
  if (!skipRemove && typeof vnode.type != 'function') {
    skipRemove = (dom = vnode._dom) != null;
  }

  // 执行vNode的componentWillUnmount
  if ((r = vnode._component) != null) {
    if (r.componentWillUnmount) {
      try {
        r.componentWillUnmount();
      } catch (e) {
        options._catchError(e, parentVNode);
      }
    }
    r._parentDom = null;
  }

  // 递归执行子组件的componentWillUnmount
  if ((r = vnode._children)) {
    for (let i = 0; i < r.length; i++) {
      if (r[i]) unmount(r[i], parentVNode, skipRemove);
    }
  }

  // 在dom树上移除oldChildren
  if (dom != null) removeNode(dom);
}

function reorderChildren (childVNode, oldDom, parentDom) {
  for (let i = 0; i < childVNode._children.length; i++) {
    let vnode = childVNode._children[i];
    if (vnode) {
      vnode._parent = childVNode;
      if (typeof vnode.type == 'function') {
        oldDom = reorderChildren(vnode, oldDom, parentDom);
      } else {
        oldDom = placeChild(
          parentDom,
          vnode,
          childVNode._children,
          vnode._dom,
          oldDom
        );
      }
    }
  }
}

function placeChild (
  parentDom,
  oldVNode,
  oldChildren,
  newDom,
  oldDom
) {
  let nextDom;
  if (
    oldVNode == null ||
    newDom != oldDom ||
    newDom.parentNode == null
  ) {
    // 首次渲染或者新增节点oldDom是不存在  但是可能是交换节点所以要保证父节点不一样
    outer: if (oldDom == null || oldDom.parentNode !== parentDom) {
      parentDom.appendChild(newDom);
      nextDom = null;
    }

    // 主要对应上文key复用旧节点，主要是交换节点的逻辑
    else {
      // 当前兄弟节点是否找到newDom节点，若找到，中断执行。
      // todo：不知道为什么是j+=2
      for (
        let sibDom = oldDom, j = 0;
        (sibDom = sibDom.nextSibling) && j < oldChildren.length;
        j += 2
      ) {
        if (sibDom == newDom) {
          break outer;
        }
      }
      parentDom.insertBefore(newDom, oldDom);
      nextDom = oldDom;
    }
  }

  // 返回dom的下一个节点
  oldDom = nextDom || newDom.nextSibling;
  return oldDom;
}