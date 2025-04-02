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
export const boundaries = new WeakMap;

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
 * @param {IBoundaries} [comments]
 * @returns
 */
export const asContent = (groupNodes, comments = boundaries.get(groupNodes)) => {
  if (attached(comments)) {
    replaceChildren.call(
      groupNodes,
      comments.start,
      ...asChildNodes(comments),
      comments.end,
    );
  }
  else {
    prepend.call(groupNodes, comments.start);
    append.call(groupNodes, comments.end);
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
    invalidBoundaries();
  }
  return result;
};

/**
 * @param {IGroupNodes} groupNodes
 * @param {IBoundaries} [comments]
 * @returns
 */
export const detach = (groupNodes, comments = boundaries.get(groupNodes)) => {
  const childNodes = asChildNodes(comments);
  comments.start.remove();
  replaceChildren.apply(groupNodes, childNodes);
  comments.end.remove();
  return groupNodes;
};

export const invalidBoundaries = () => {
  throw new Error('Invalid GroupNodes boundary');
};

/**
 * @param {IGroupNodes} groupNodes
 * @returns {Comment}
 */
export const start = groupNodes => boundaries.get(groupNodes).start;
