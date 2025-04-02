const {
  defineProperties,
  getOwnPropertyDescriptor,
  setPrototypeOf,
} = Object;

export {
  defineProperties,
};

export const symbol = Symbol.for('group-nodes');
export const patched = symbol in globalThis;

const NLP = NodeList.prototype;
export const DFP = DocumentFragment.prototype;
export const NP = Node.prototype;

/** @typedef {import("./group-nodes").IGroupNodes} IGroupNodes */
/** @typedef {import("./group-nodes").IBoundaries} IBoundaries */

/**
 * @param {Node[]} nodes
 * @returns {NodeList}
 */
export const asNodeList = nodes => setPrototypeOf(nodes, NLP);

const { appendChild, compareDocumentPosition, contains, insertBefore, removeChild, replaceChild } = NP;
export { appendChild, compareDocumentPosition, contains, insertBefore, removeChild, replaceChild };

const { append, moveBefore, prepend, replaceChildren } = DFP;
export { append, moveBefore, prepend, replaceChildren };

/** @type {WeakMap<IGroupNodes,IBoundaries>} */
export const fragments = new WeakMap;

/** @type {Map<string | symbol, WeakRef<IGroupNodes>>} */
export const groups = new Map;

export const helper = document.createComment('');

const nextSibling = getOwnPropertyDescriptor(NP, 'nextSibling').get;

/**
 * @param {IBoundaries} boundaries
 * @returns {(Node|Comment|Element)[]}
 */
export const asChildNodes = ({ start, end }) => {
  const nodes = [];
  while ((start = nextSibling.call(start)) !== end) nodes.push(start);
  return nodes;
};

/**
 * @param {IGroupNodes} groupNodes
 * @param {IBoundaries} [boundaries]
 * @returns
 */
export const asContent = (groupNodes, boundaries = fragments.get(groupNodes)) => {
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

/**
 * @param {IBoundaries} boundaries
 * @returns
 */
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

/**
 * @param {IGroupNodes} groupNodes
 * @param {IBoundaries} [boundaries]
 * @returns
 */
export const detach = (groupNodes, boundaries = fragments.get(groupNodes)) => {
  const childNodes = asChildNodes(boundaries);
  boundaries.start.remove();
  replaceChildren.apply(groupNodes, childNodes);
  boundaries.end.remove();
  return groupNodes;
};

/**
 * @param {IGroupNodes} groupNodes
 * @returns {Comment}
 */
export const start = groupNodes => fragments.get(groupNodes).start;
