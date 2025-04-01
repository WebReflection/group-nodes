const {
  defineProperties,
  getOwnPropertyDescriptor,
  setPrototypeOf,
} = Object;

export {
  defineProperties,
};

const NLP = NodeList.prototype;
export const DFP = DocumentFragment.prototype;
export const NP = Node.prototype;

/**
 * @param {Node[]} nodes
 * @returns {NodeList}
 */
export const asNodeList = nodes => setPrototypeOf(nodes, NLP);

const { appendChild, compareDocumentPosition, contains, insertBefore, removeChild, replaceChild } = NP;
export { appendChild, compareDocumentPosition, contains, insertBefore, removeChild, replaceChild };

const { append, moveBefore, prepend, replaceChildren } = DFP;
export { append, moveBefore, prepend, replaceChildren };

export const comments = new WeakMap;
export const helper = document.createComment('');

const nextSibling = getOwnPropertyDescriptor(NP, 'nextSibling').get;

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
