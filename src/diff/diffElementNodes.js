import { diffChildren } from './children';
import { EMPTY_OBJ } from '../constant';
import { diffProps } from './props';

export function diffElementNodes (
  dom,
  newVNode,
  oldVNode,
  commitQueue,
) {

  let oldProps = oldVNode.props;
  let newProps = newVNode.props;
  let nodeType = newVNode.type;

  // 没有dom就去创建节点
  if (!dom) {
    dom = nodeType ? document.createElement(nodeType, newProps) :
      document.createTextNode(newProps)
  }

  // 在children.js 对比文本节点的不同会先创建新的文本节点的vNode，type===null 
  // 对于文本节点直接修改data从而实现dom的复用修改
  if (!nodeType) {
    if (oldProps !== newProps && dom.data !== newProps) {
      dom.data = newProps;
    }
  } else {
    oldProps = oldVNode.props || EMPTY_OBJ;

    diffProps(dom, newProps, oldProps);

    const children = newVNode.props.children;
    diffChildren(
      dom,
      Array.isArray(children) ? children : [children],
      newVNode,
      oldVNode,
      commitQueue,
      dom.firstChild,  // dom是oldVNode._dom  旧节点的第一个子节点继续做比较
    );
  }

  return dom;
}
