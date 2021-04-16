export function diffProps (dom, newProps, oldProps) {
  // 遍历oldProps, 如果newProps没有的就是没有用的，直接删除
  for (let key in oldProps) {
    if (key !== 'children' && key !== 'key' && !(key in newProps)) {
      setProperty(dom, key, null, null);
    }
  }
  // 遍历newProps
  for (let key in newProps) {
    if (key !== 'children' && key !== 'key' && newProps[key] !== oldProps[key]) {
      setProperty(dom, key, newProps[key], oldProps[key]);
    }
  }
}


function setProperty (dom, key, value, oldValue) {
  const propertyName = (key[0] === 'o' && key[1] === 'n') ? 'event' : key;
  switch (propertyName) {
    case 'style':
      handleStyle(dom, value, oldValue);
      break;
    case 'event':
      handleEvent(dom, key, value);
      break;
    default:
      dom.setAttribute(key, value);
      return;
  }
}

function setStyle (style, key, value) {
  if (value == null) {
    style[key] = '';
  } else if (typeof value != 'number') { // { 'border': '1px red solid' }
    style[key] = value;
  } else { // { 'height': 43 }
    style[key] = value + 'px';
  }
}

function handleEvent (dom, name, handler) {
  // 事件全部小写之后在dom上, onClick => onclick => click
  // 不再dom oninput => input
  if (name.toLowerCase() in dom) name = name.toLowerCase().slice(2);
  else name = name.slice(2);

  // 多个事件覆盖
  dom._listeners = dom._listeners || {};
  dom._listeners[name] = handler;

  if (handler) {
    dom.addEventListener(name, handleCallback, false);
  } else {
    dom.removeEventListener(name, handleCallback, false);
  }
}
function handleStyle (dom, value, oldValue) {
  if (typeof value === 'string') {
    dom.style.cssText = value;
  } else {
    /**
     * 1. 旧的style是string 新的style是对象
     * 2. 新旧style都是对象, 如果新的style没有直接直接删除
     */

    if (typeof oldValue == 'string') {
      dom.style.cssText = oldValue = '';
    }

    if (oldValue && value) {
      for (let name in oldValue) {
        if (!(value && name in value)) {
          setStyle(dom.style, name, '');
        }
      }
    }

    if (value) {
      for (let name in value) {
        if (!oldValue || value[name] !== oldValue[name]) {
          setStyle(dom.style, name, value[name]);
        }
      }
    }
  }
}

function handleCallback (e) {
  this._listeners[e.type](e);
}