export function createElement (type, props, ...children) {
  const normalizedProps = { ...props };

  if (children) {
    normalizedProps.children = children;
  }

  return createVNode(type, normalizedProps, normalizedProps.key);
}


export function createVNode (type, props, key) {
  return {
    type,
    props,
    key,
    _children: null,
    _parent: null,
    _dom: null,
    _nextDom: null,
    _component: null,
    _depth: 0,
  }
}

export function Fragment (props) {
  return props.children;
}