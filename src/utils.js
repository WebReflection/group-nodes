const {
  create,
  defineProperties,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  setPrototypeOf,
} = Object;

export {
  create,
  defineProperties,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  setPrototypeOf,
};

const NLP = NodeList.prototype;
export const DFP = DocumentFragment.prototype;
export const NP = Node.prototype;
export const EP = Element.prototype;
export const RP = Range.prototype;

const handler = { get: (proto, name) => getOwnPropertyDescriptor(proto, name).get };

const { appendChild, compareDocumentPosition, contains, insertBefore, removeChild, replaceChild } = NP;
export { appendChild, compareDocumentPosition, contains, insertBefore, removeChild, replaceChild };

const { append, moveBefore, prepend, replaceChildren } = DFP;
export { append, moveBefore, prepend, replaceChildren };

export const comments = new WeakMap;
export const helper = document.createComment('');

export const getters = proto => new Proxy(proto, handler);
const { nextSibling, previousSibling } = getters(NP);
export { nextSibling, previousSibling };

export const asChildNodes = ({ start, end }) => {
  const nodes = [];
  while ((start = nextSibling.call(start)) !== end) nodes.push(start);
  return nodes;
};

export const asContent = (groupNodes, boundaries = comments.get(groupNodes)) => {
  if (attached(boundaries)) {
    replaceChildren.call(
      groupNodes,
      boundaries.start,
      ...asChildNodes(boundaries),
      boundaries.end,
    );
  }
  else {
    prepend.call(groupNodes, boundaries.start);
    append.call(groupNodes, boundaries.end);
  }
  return groupNodes;
};

export const asNodeList = nodes => setPrototypeOf(nodes, NLP);

export const attached = ({ start, end }) => {
  const { parentNode } = start;
  const result = parentNode != null;
  if (
    parentNode !== end.parentNode ||
    (result && compareDocumentPosition.call(start, end) !== 4)
  ) {
    throw new RangeError('Invalid GroupNodes boundaries');
  }
  return result;
};

export const detach = (groupNodes, boundaries = comments.get(groupNodes)) => {
  const childNodes = asChildNodes(boundaries);
  boundaries.start.remove();
  replaceChildren.apply(groupNodes, childNodes);
  boundaries.end.remove();
  return groupNodes;
};

export const start = node => comments.get(node).start;
