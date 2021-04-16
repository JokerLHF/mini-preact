import { diff, commitRoot } from './diff/index';
export function Component (props) {
  this.props = props;
}

Component.prototype.setState = function (update, callback) {
  let s;
  // _nextState是最新的state， 不存在就拿state
  if (this._nextState != null && this._nextState !== this.state) {
    s = this._nextState;
  } else {
    s = this._nextState = Object.assign({}, this.state);
  }

  // 函数的第一个参数拿到最新的state，调用
  if (typeof update == 'function') {
    update = update(Object.assign({}, s), this.props);
  }

  // setState采用对象写法的对象，   
  // setState函数写法，调用函数拿到函数的返回值
  if (update) {
    Object.assign(s, update);
  }

  if (update == null) return;

  // 回调函数放入组件的_renderCallbacks
  if (this._vnode) {
    if (callback) this._renderCallbacks.push(callback);
    enqueueRender(this);
  }
};


Component.prototype.forceUpdate = function (callback) {
  if (this._vnode) {
    this._force = true;
    if (callback) this._renderCallbacks.push(callback);
    enqueueRender(this);
  }
}


// 存储需要更新的组件
let rerenderQueue = [];

function renderComponent (component) {
  let vnode = component._vnode,
    oldDom = vnode._dom,
    parentDom = component._parentDom;
  if (parentDom) {
    let commitQueue = [];
    const oldVNode = Object.assign({}, vnode);

    diff(
      parentDom,
      vnode,
      oldVNode,
      commitQueue,
      oldDom,
    );
    commitRoot(commitQueue, vnode);
  }
}

// 判断是否能更新
export function enqueueRender (c) {
  if (!c._dirty &&
    (c._dirty = true) &&
    rerenderQueue.push(c) &&
    !process._rerenderCount++
  ) {
    defer(process);
  }
}

// 异步更新
const defer =
  typeof Promise == 'function'
    ? Promise.prototype.then.bind(Promise.resolve())
    : setTimeout;

// 循环更新
function process () {
  let queue;
  while ((process._rerenderCount = rerenderQueue.length)) {
    queue = rerenderQueue.sort((a, b) => a._vnode._depth - b._vnode._depth);
    rerenderQueue = [];
    queue.some(c => {
      if (c._dirty) renderComponent(c);
    });
  }
}
// 记录当前更新队列的个数
process._rerenderCount = 0;