export function removeNode (node) {
  let parentNode = node.parentNode;
  if (parentNode) parentNode.removeChild(node);
}
