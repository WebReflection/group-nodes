//@ts-check

import {
  DFP,
  asChildNodes,
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

const NLP = NodeList.prototype;

const owned = new WeakSet;
const { replaceChildren } = DFP;

const apprepend = (children, target) => {
  const { parentNode } = target;
  insertBefore.call(parentNode, helper, target);
  for (const child of children)
    insertBefore.call(parentNode, child, helper);
  removeChild.call(parentNode, helper);
};

/**
 * @param {Comment} start
 * @param {Comment} end
 * @returns
 */
const boundaries = (start, end) => ({ start, end });

/**
 * @param {Node} node
 * @returns
 */
const children = ({ nodeType }) => nodeType === 1;

/**
 * @param {{ start: Comment, end: Comment }} comment
 * @param {string} method
 * @param  {...any} args
 * @returns
 */
const parent = ({ start: { parentNode } }, method, ...args) =>
  /** @type {ParentNode} */(parentNode)[method](...args);

/**
 * @param {Comment} comment
 * @param {string} valid
 */
const validate = ({ data, nodeType }, valid) => {
  if (nodeType !== 8 || data !== valid)
    throw new Error('Invalid GroupNodes boundary');
};

/**
 * @param {Node[]} nodes
 * @returns {NodeList}
 */
const asNodeList = nodes => setPrototypeOf(nodes, NLP);

/**
 * @template T
 * @param {T} node
 * @returns {T is GroupNodes}
 */
export const isGroupNodes = node => node instanceof GroupNodes;

/**
 * @template {Node | GroupNodes} T
 * @param {T} node
 * @returns {T}
 */
export const asGroupNodes = node => isGroupNodes(node) ? asContent(node) : node;

/**
 * @param {(string | Node)[]} children
 * @param {boolean} [patch=false]
 * @returns
 */
export const asChildren = (children, patch = false) => {
  for (let i = 0; i < children.length; i++) {
    if (isGroupNodes(children[i]))
      children[i] = asContent(children[i]);
    else if (patch)
      children[i] = document.createTextNode(/** @type {string} */(children[i]));
  }
  return children;
};

/**
 * @param {Node?} node
 * @returns {Node?}
 */
export const asTarget = node => isGroupNodes(node) ? start(node) : node;

export class GroupNodes extends DocumentFragment {
  /**
   * ℹ️ hydration related
   * Create a GroupNodes reference from 2 live comments as long
   * as these are not already owned by another instance.
   * Reason: GroupNodes should be unique just like ShadowRoots per each node.
   * @param {Comment} start
   * @param {Comment} end
   * @param {string} name
   * @returns {GroupNodes}
   */
  static from(start, end, name = '') {
    validate(start, `<${name}>`);
    validate(end, `</${name}>`);
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

  /**
   * @param {string} name the group name
   */
  constructor(name = '') {
    const start = document.createComment(`<${name}>`);
    const end = document.createComment(`</${name}>`);
    owned.add(start).add(end);
    //@ts-ignore
    super().name = name;
    comments.set(this, boundaries(start, end));
  }

  // accessors
  get [Symbol.toStringTag]() {
    return `GroupNodes<${this.name}>`;
  }

  /** @type {number} */
  get childElementCount() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asChildNodes(nodes).filter(children).length :
      super.childElementCount
    ;
  }

  //@ts-ignore
  get childNodes() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asNodeList(asChildNodes(nodes)) :
      super.childNodes
    ;
  }
  //@ts-ignore
  get children() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asNodeList(asChildNodes(nodes).filter(children)) :
      super.children
    ;
  }

  /** @type {ChildNode?} */
  get firstChild() {
    const nodes = comments.get(this);
    if (attached(nodes)) {
      const next = nextSibling.call(nodes.start);
      return next === nodes.end ? null : next;
    }
    return super.firstChild;
  }

  /** @type {Element?} */
  get firstElementChild() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (asChildNodes(nodes).find(children) || null) :
      super.firstElementChild
    ;
  }

  /** @type {boolean} */
  get isConnected() {
    return comments.get(this).start.isConnected;
  }

  /** @type {ChildNode?} */
  get lastChild() {
    const nodes = comments.get(this);
    if (attached(nodes)) {
      const prev = previousSibling.call(nodes.end);
      return prev === nodes.start ? null : prev;
    }
    return super.lastChild;
  }

  /** @type {Element?} */
  get lastElementChild() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      //@ts-ignore
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
  /** @type {typeof DocumentFragment.prototype.appendChild} */
  appendChild(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'appendChild', child) :
      super.appendChild(child)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.cloneNode} */
  cloneNode(deep = false) {
    //@ts-ignore
    const clone = new this.constructor();
    for (const node of this.childNodes)
      appendChild.call(clone, node.cloneNode(deep));
    return clone;
  }
  /** @type {typeof DocumentFragment.prototype.compareDocumentPosition} */
  compareDocumentPosition(other) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'compareDocumentPosition', other) :
      super.compareDocumentPosition(/** @type {Node} */(asTarget(other)))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.contains} */
  contains(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'contains', child) :
      super.contains(asTarget(child))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.getRootNode} */
  getRootNode(...args) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      nodes.start.getRootNode(...args) :
      super.getRootNode(...args)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.hasChildNodes} */
  hasChildNodes() {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (nextSibling.call(nodes.start) !== nodes.end) :
      super.hasChildNodes()
    ;
  }
  /** @type {typeof DocumentFragment.prototype.insertBefore} */
  insertBefore(newNode, referenceNode) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'insertBefore', newNode, referenceNode) :
      super.insertBefore(asGroupNodes(newNode), asTarget(referenceNode))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.removeChild} */
  removeChild(child) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      parent(nodes, 'removeChild', child) :
      (isGroupNodes(child) ?
        detach(child) :
        super.removeChild(child))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.replaceChild} */
  replaceChild(newChild, oldChild) {
    const nodes = comments.get(this);
    if (attached(nodes))
      return parent(nodes, 'replaceChild', newChild, oldChild);
    if (isGroupNodes(oldChild)) {
      insertBefore.call(this, helper, start(oldChild));
      detach(oldChild);
      //@ts-ignore
      oldChild = helper;
    }
    return replaceChild.call(this, asGroupNodes(newChild), oldChild);
  }
  // TODO ? isEqualNode(node) {}
  // TODO ? normalize(form = 'NFC') {}

  // DocumentFragment mutation methods
  /** @type {typeof DocumentFragment.prototype.append} */
  append(...children) {
    const nodes = comments.get(this);
    if (attached(nodes)) apprepend(asChildren(children, true), nodes.end);
    else super.append(...children);
  }
  /** @type {typeof DocumentFragment.prototype.getElementById} */
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
      //@ts-ignore
      super.moveBefore(newNode, referenceNode)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.prepend} */
  prepend(...children) {
    const nodes = comments.get(this);
    if (attached(nodes)) apprepend(asChildren(children, true), nextSibling.call(nodes.start));
    else super.prepend(...children);
  }
  querySelector(selectors) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      (asChildNodes(nodes).find(node => node.matches?.(selectors)) || null) :
      super.querySelector(selectors)
    ;
  }
  querySelectorAll(selectors) {
    const nodes = comments.get(this);
    return attached(nodes) ?
      asChildNodes(nodes).filter(node => node.matches?.(selectors)) :
      super.querySelector(selectors)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.replaceChildren} */
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
  /** @type {typeof Element.prototype.after} */
  after(...children) {
    const nodes = comments.get(this);
    if (attached(nodes))
      nodes.end.after(...children);
  }
  /** @type {typeof Element.prototype.before} */
  before(...children) {
    const nodes = comments.get(this);
    if (attached(nodes))
      nodes.start.before(...children);
  }
  /** @type {typeof Element.prototype.remove} */
  remove() {
    this.parentNode?.removeChild(this);
  }
  /** @type {typeof Element.prototype.replaceWith} */
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
