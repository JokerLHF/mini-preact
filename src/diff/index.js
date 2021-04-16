import { Component } from '../component';
import { diffChildren } from './children';
import { diffElementNodes } from './diffElementNodes';
import { Fragment } from '../create-element';

export function diff (
  parentDom,
  newVNode,
  oldVNode,
  commitQueue,
  oldDom,
) {

  const newType = newVNode.type;
  try {
    let c, isNew, oldProps, oldState;
    let newProps = newVNode.props;

    outer: if (typeof newType === 'function') {
      if (oldVNode._component) {
        newVNode._component = c = oldVNode._component;
      } else {
        if ('prototype' in newType && newType.prototype.render) {
          newVNode._component = c = new newType(newProps);
        } else {
          newVNode._component = c = new Component(newProps);
          c.constructor = newType;
          c.render = doRender;
        }
        // 初始化数据
        c.props = newProps;
        c.state = c.state || {};
        c._renderCallbacks = [];
        isNew = c._dirty = true;
      }

      // 复制一份作为最新数据，一份作为旧数据
      c._nextState = c._nextState || Object.assign({}, c.state);
      oldProps = c.props;
      oldState = c.state;

      // 执行生命周期
      if (newType.getDerivedStateFromProps) {
        Object.assign(
          c._nextState,
          newType.getDerivedStateFromProps(newProps, c._nextState),
        )
      }

      if (isNew) {
        if (c.componentDidMount) {
          c._renderCallbacks.push(c.componentDidMount);
        }
      } else {
        if (
          !c._force &&
          c.shouldComponentUpdate &&
          c.shouldComponentUpdate(newProps, c._nextState) === false
        ) {
          c.props = newProps;
          c.state = c._nextState;
          c._vnode = newVNode;

          newVNode._dom = oldVNode._dom;
          newVNode._children = oldVNode._children;
          newVNode._children.forEach(vnode => {
            if (vnode) vnode._parent = newVNode;
          });
          if (c._renderCallbacks.length) {
            commitQueue.push(c);
          }
          break outer;
        }

        if (c.componentDidUpdate) {
          c._renderCallbacks.push(() => {
            c.componentDidUpdate(oldProps, oldState);
          });
        }
      }

      // 将最新的赋值到c的属性上
      c.props = newProps;
      c.state = c._nextState;
      c._vnode = newVNode;
      c._parentDom = parentDom;

      let tmp = c.render(c.props, c.state);

      if (!isNew && c.getSnapshotBeforeUpdate) {
        c.getSnapshotBeforeUpdate(oldProps, oldState);
      }

      let isTopLevelFragment =
        tmp && tmp.type === Fragment && tmp.key == null;
      let renderResult = isTopLevelFragment ? tmp.props.children : tmp;

      // 对比子节点
      diffChildren(
        parentDom,
        Array.isArray(renderResult) ? renderResult : [renderResult],
        newVNode,
        oldVNode,
        commitQueue,
        oldDom,
      );

      if (c._renderCallbacks.length) {
        commitQueue.push(c);
      }

      c._dirty = false;
      c._force = false;

    } else {
      newVNode._dom = diffElementNodes(
        oldVNode._dom,
        newVNode,
        oldVNode,
        commitQueue,
      );
    }
  } catch (err) {
    console.log('err', err);
  }
}



export function commitRoot (commitQueue) {
  commitQueue.some(c => {
    commitQueue = c._renderCallbacks;
    c._renderCallbacks = [];
    commitQueue.some(cb => {
      cb.call(c);
    });
  });
}


function doRender (props, state) {
  return this.constructor(props);
}



// export interface Component<P = {}, S = {}> extends minReact.Component {
//   state: S;
//   props: P;
//   _dirty: boolean;
//   _force: boolean;
//   _renderCallbacks: Array<() => void>; // Only class components
//   _vnode: VNode<P> | null;
//   _nextState: S | null; // Only class components
//   _prevState: S | null;
//   _parentDom: MinReactElement | null;
// }

// export interface VNode<P = {}> {
//   type: string | ComponentType;
//   props: Props<P>;
//   key: Key;

//   _children: ComponentChildren;
//   _parent: VNode | null;
//   _dom: MinReactElement | null;
//   _nextDom: MinReactElement | null;

//   _component: Component | null;
//   _depth: number;
// }