import {
  DFP,
  asChildNodes,
  asNodeList,
  asContent,
  comments,
  attached,
  setPrototypeOf,
  detach,
  helper,
  nextSibling,
  previousSibling,
  appendChild,
  insertBefore,
  removeChild,
  replaceChild,
  start,
} from './utils.js';

const OPEN = '<>';
const CLOSE = '</>';

const owned = new WeakSet;
const { replaceChildren } = DFP;

const apprepend = (children, target) => {
  const { parentNode } = target;
  insertBefore.call(parentNode, helper, target);
  for (const child of children)
    insertBefore.call(parentNode, child, helper);
  removeChild.call(parentNode, helper);
};

const boundaries = (start, end) => ({ start, end });

const children = ({ nodeType }) => nodeType === 1;

const parent = ({ start: { parentNode } }, method, ...args) => parentNode[method](...args);

const validate = ({ data, nodeType }, valid) => {
  if (nodeType !== 8 || data !== valid)
    throw new Error('Invalid GroupNodes boundary');
};

export const isGroupNodes = node => node instanceof GroupNodes;
export const asGroupNodes = node => isGroupNodes(node) ? asContent(node) : node;
export const asChildren = children => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    children[i] = child && typeof child === 'object' ?
      asGroupNodes(child) :
      document.createTextNode(child)
    ;
  }
  return children;
};

export const asTarget = node => isGroupNodes(node) ? start(node) : node;

export class GroupNodes extends DocumentFragment {
  /**
   * ℹ️ hydration related
   * Create a GroupNodes reference from 2 live comments as long
   * as these are not already owned by another instance.
   * Reason: GroupNodes should be unique just like ShadowRoots per each node.
   * @param {Comment} start
   * @param {Comment} end
   * @returns {GroupNodes}
   */
  static from(start, end) {
    validate(start, OPEN);
    validate(end, CLOSE);
    if (owned.has(start) || owned.has(end))
      throw new Error('Boundaries can be used only once per GroupNodes');
    const nodes = boundaries(start, end);
    attached(nodes);
    owned.add(start).add(end);
    const groupNodes = setPrototypeOf(
      document.createDocumentFragment(),
      this.prototype
    );
    comments.set(groupNodes, nodes);
    return groupNodes;
  }

  constructor() {
    const start = document.createComment(OPEN);
    const end = document.createComment(CLOSE);
    owned.add(start).add(end);
    comments.set(super(), boundaries(start, end));
  }

  // accessors
  get [Symbol.toStringTag]() {
    return 'GroupNodes';
  }
  get childElementCount() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asChildNodes(nodes).filter(children).length :
      super.childElementCount
    ;
  }
  get childNodes() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asNodeList(asChildNodes(nodes)) :
      super.childNodes
    ;
  }
  get children() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asNodeList(asChildNodes(nodes).filter(children)) :
      super.children
    ;
  }
  get firstChild() {
    const nodes = comments.get(this);
    if (attached(nodes)) {
      const next = nextSibling.call(nodes.start);
      return next === nodes.end ? null : next;
    }
    return super.firstChild;
  }
  get firstElementChild() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (asChildNodes(nodes).find(children) || null) :
      super.firstElementChild
    ;
  }
  get isConnected() {
    return comments.get(this).start.isConnected;
  }
  get lastChild() {
    const nodes = comments.get(this);
    if (attached(nodes)) {
      const prev = previousSibling.call(nodes.end);
      return prev === nodes.start ? null : prev;
    }
    return super.lastChild;
  }
  get lastElementChild() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (asChildNodes(nodes).findLast(children) || null) :
      super.lastElementChild
    ;
  }
  get nextSibling() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      nextSibling.call(nodes.end) :
      super.nextSibling
    ;
  }
  get parentElement() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      nodes.start.parentElement :
      super.parentElement
    ;
  }
  get parentNode() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      nodes.start.parentNode :
      super.parentNode
    ;
  }
  get previousSibling() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      previousSibling.call(nodes.start) :
      super.previousSibling
    ;
  }
  // TBD: should this be different from #document-fragment?
  // get nodeName() { return super.nodeName }
  // TBD: should this be different from 11?
  // get nodeType() { return super.nodeType }
  // TBD: what should this do?
  // get nodeValue() { return null }
  // TBD: what should this do?
  // get textContent() { return '' }

  // Node mutation methods
  appendChild(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'appendChild', child) :
      super.appendChild(child)
    ;
  }
  cloneNode(deep = false) {
    const clone = new this.constructor();
    for (const node of this.childNodes)
      appendChild.call(clone, node.cloneNode(deep));
    return clone;
  }
  compareDocumentPosition(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'compareDocumentPosition', child) :
      super.compareDocumentPosition(asTarget(child))
    ;
  }
  contains(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'contains', child) :
      super.contains(asTarget(child))
    ;
  }
  getRootNode(...args) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      nodes.start.getRootNode(...args) :
      super.getRootNode(...args)
    ;
  }
  hasChildNodes() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (nextSibling.call(nodes.start) !== nodes.end) :
      super.hasChildNodes()
    ;
  }
  insertBefore(newNode, referenceNode) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'insertBefore', newNode, referenceNode) :
      super.insertBefore(asGroupNodes(newNode), asTarget(referenceNode))
    ;
  }
  removeChild(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'removeChild', child) :
      (isGroupNodes(child) ?
        detach(child) :
        super.removeChild(child))
    ;
  }
  replaceChild(newChild, oldChild) {
    const nodes = comments.get(this);
    if (attached(nodes))
      return parent(nodes, 'replaceChild', newChild, oldChild);
    if (isGroupNodes(oldChild)) {
      insertBefore.call(this, helper, start(oldChild));
      detach(oldChild);
      oldChild = helper;
    }
    replaceChild.call(this, asGroupNodes(newChild), oldChild);
    return newChild;
  }
  // TODO ? isEqualNode(node) {}
  // TODO ? normalize(form = 'NFC') {}

  // DocumentFragment mutation methods
  append(...children) {
    const nodes = comments.get(this);
    if (attached(nodes)) apprepend(asChildren(children), nodes.end);
    else super.append(...children);
  }
  getElementById(id) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'getElementById', id) :
      super.getElementById(id)
    ;
  }
  moveBefore(newNode, referenceNode) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'moveBefore', newNode, referenceNode) :
      super.moveBefore(newNode, referenceNode)
    ;
  }
  prepend(...children) {
    const nodes = comments.get(this);
    if (attached(nodes)) apprepend(asChildren(children), nextSibling.call(nodes.start));
    else super.prepend(...children);
  }
  querySelector(selectors) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (asChildNodes(this).find(node => node.matches?.(selectors)) || null) :
      super.querySelector(selectors)
    ;
  }
  querySelectorAll(selectors) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asChildNodes(this).filter(node => node.matches?.(selectors)) :
      super.querySelector(selectors)
    ;
  }
  replaceChildren(...children) {
    const nodes = comments.get(this);
    if (attached(nodes)) {
      for (let i = 0; i < children.length; i++) {
        if (isGroupNodes(children[i]))
          children[i] = asContent(children[i]);
      }
      const range = document.createRange();
      range.setStartAfter(nodes.start);
      range.setEndBefore(nodes.end);
      range.deleteContents();
      replaceChildren.apply(this, children);
      insertBefore.call(nodes.end.parentNode, this, nodes.end);
    }
    else super.replaceChildren(...children);
  }

  // Extra (convenient) methods
  after(...children) {
    const nodes = comments.get(this);
    if (attached(nodes))
      nodes.end.after(...children);
  }
  before(...children) {
    const nodes = comments.get(this);
    if (attached(nodes))
      nodes.start.before(...children);
  }
  remove() {
    this.parentNode?.removeChild(this);
  }
  replaceWith(...children) {
    const nodes = comments.get(this);
    const { parentNode } = nodes.start;
    if (parentNode) {
      insertBefore.call(parentNode, helper, nodes.start);
      detach(this, nodes);
      helper.replaceWith(...children);
    }
  }
}
