import { diff, commitRoot } from './diff/index';
import { EMPTY_OBJ } from './constant';
import { createElement, Fragment } from './create-element';

export function render (vnode, parentDom) {
  const commitQueue = [];
  const oldVNode = parentDom._children;
  // 包裹一层Fragment
  vnode = parentDom._children = createElement(Fragment, null, vnode);

  diff(
    parentDom,
    vnode,
    oldVNode || EMPTY_OBJ,
    commitQueue,
    oldVNode ? oldVNode._dom : parentDom.firstChild,
  );

  commitRoot(commitQueue);
}