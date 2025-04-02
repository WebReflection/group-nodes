//@ts-check

import {
  asChildNodes,
  asContent,
  asNodeList,
  fragments,
  attached,
  detach,
  groups,
  helper,
  appendChild,
  insertBefore,
  removeChild,
  replaceChild,
  replaceChildren,
  start,
  symbol,
  patched,
} from './utils.js';

const apprepend = (children, target) => {
  const { parentNode } = target;
  insertBefore.call(parentNode, helper, target);
  for (const child of children)
    insertBefore.call(parentNode, child, helper);
  removeChild.call(parentNode, helper);
};

/** @typedef {Boundaries} IBoundaries */

class Boundaries {
  /**
   * @param {Comment} start
   * @param {Comment} end
   */
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

/**
 * @param {Node|Comment|Element|IGroupNodes} node
 * @returns
 */
const children = ({ nodeType }) => nodeType === 1;

/**
 * @param {IBoundaries} boundaries
 * @returns
 */
const hasChildNodes = ({ start, end }) => start.nextSibling !== end;

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
 * @template T
 * @param {T} node
 * @returns {T is IGroupNodes}
 */
export const isGroupNodes = node => node instanceof GroupNodes;

/**
 * @template T
 * @param {T} node
 * @returns
 */
export const asGroupNodes = node => isGroupNodes(node) ?
  asContent(/** @type {IGroupNodes} */(node)) :
  node
;

/**
 * @param {(string|Node|IGroupNodes)[]} children
 * @param {boolean} [patch=false]
 * @returns
 */
export const asChildren = (children, patch = false) => {
  for (let i = 0; i < children.length; i++) {
    if (isGroupNodes(children[i]))
      children[i] = asContent(/** @type {IGroupNodes} */(children[i]));
    else if (patch)
      children[i] = document.createTextNode(/** @type {string} */(children[i]));
  }
  return children;
};

/**
 * @param {(Node|IGroupNodes)?} node
 * @returns {Node?}
 */
export const asTarget = node => isGroupNodes(node) ?
  start(/** @type {IGroupNodes} */(node)) :
  /** @type {Node?} */(node)
;

/** @type {WeakMap<Comment, WeakRef<IGroupNodes>>} */
const references = new WeakMap;

let fromComments = null;

/** @typedef {GroupNodes} IGroupNodes */

class GroupNodes extends DocumentFragment {
  #name = '';

  /**
   * ℹ️ hydration related
   * Create a GroupNodes reference from 2 live comments as long
   * as these are not already owned by another instance.
   * Reason: GroupNodes should be unique just like ShadowRoots per each node.
   * @param {Comment} start
   * @param {Comment} end
   * @returns {IGroupNodes}
   */
  static from(start, end) {
    const name = start.data.slice(1, -1);
    validate(start, `<${name}>`);
    validate(end, `</${name}>`);
    // TBD: should this throw or should it return the same group?
    if (references.has(start) || references.has(end))
      throw new Error('Boundaries can be used only once per GroupNodes');
    const comments = new Boundaries(start, end);
    attached(comments);
    fromComments = comments;
    try { return new this(name) }
    finally { fromComments = null }
  }

  /**
   * @param {string} name the group name
   */
  constructor(name = '') {
    //@ts-ignore
    super().#name = name;

    const comments = fromComments || new Boundaries(
      document.createComment(`<${name}>`),
      document.createComment(`</${name}>`),
    );
    fragments.set(this, comments);

    const ref = new WeakRef(this);
    references.set(comments.start, ref);
    references.set(comments.end, ref);

    if (name && !groups.has(name)) groups.set(name, ref);
  }

  // accessors
  get [Symbol.toStringTag]() {
    return `GroupNodes<${this.#name}>`;
  }

  /** @type {number} */
  get childElementCount() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      asChildNodes(comments).filter(children).length :
      super.childElementCount
    ;
  }

  //@ts-ignore
  get childNodes() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      asNodeList(asChildNodes(comments)) :
      super.childNodes
    ;
  }
  //@ts-ignore
  get children() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      asNodeList(asChildNodes(comments).filter(children)) :
      super.children
    ;
  }

  /** @type {ChildNode?} */
  get firstChild() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments)) {
      const next = comments.start.nextSibling;
      return next === comments.end ? null : next;
    }
    return super.firstChild;
  }

  /** @type {Element?} */
  get firstElementChild() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      //@ts-ignore
      (asChildNodes(comments).find(children) || null) :
      super.firstElementChild
    ;
  }

  /** @type {boolean} */
  get isConnected() {
    return /** @type {IBoundaries} */(fragments.get(this)).start.isConnected;
  }

  /** @type {ChildNode?} */
  get lastChild() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments)) {
      const prev = comments.end.previousSibling;
      return prev === comments.start ? null : prev;
    }
    return super.lastChild;
  }

  /** @type {Element?} */
  get lastElementChild() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      //@ts-ignore
      (asChildNodes(comments).findLast(children) || null) :
      super.lastElementChild
    ;
  }

  get nextSibling() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      comments.end.nextSibling :
      super.nextSibling
    ;
  }

  get parentElement() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      comments.start.parentElement :
      super.parentElement
    ;
  }

  get parentNode() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      comments.start.parentNode :
      super.parentNode
    ;
  }

  get previousSibling() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      comments.start.previousSibling :
      super.previousSibling
    ;
  }

  // TBD: should this be different from #document-fragment?
  get nodeName() { return '#group-nodes' }
  // TBD: should this be different from 11?
  // get nodeType() { return super.nodeType }
  // TBD: what should this do?
  // get nodeValue() { return null }
  // TBD: what should this do?
  // get textContent() { return '' }
  // TBD: do we want/need this?
  get name() { return this.#name }

  // Node mutation methods
  /** @type {typeof DocumentFragment.prototype.appendChild} */
  appendChild(child) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'insertBefore', child, comments.end) :
      super.appendChild(child)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.cloneNode} */
  cloneNode(deep = false) {
    //@ts-ignore
    const clone = new this.constructor(this.#name);
    for (const node of this.childNodes)
      appendChild.call(clone, node.cloneNode(deep));
    return clone;
  }
  /** @type {typeof DocumentFragment.prototype.compareDocumentPosition} */
  compareDocumentPosition(other) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'compareDocumentPosition', other) :
      super.compareDocumentPosition(/** @type {Node} */(asTarget(other)))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.contains} */
  contains(child) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'contains', child) :
      super.contains(asTarget(child))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.getRootNode} */
  getRootNode(...args) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      comments.start.getRootNode(...args) :
      super.getRootNode(...args)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.hasChildNodes} */
  hasChildNodes() {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ? hasChildNodes(comments) : super.hasChildNodes();
  }
  /** @type {typeof DocumentFragment.prototype.insertBefore} */
  insertBefore(newNode, referenceNode) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'insertBefore', newNode, referenceNode) :
      //@ts-ignore
      super.insertBefore(asGroupNodes(newNode), asTarget(referenceNode))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.removeChild} */
  removeChild(child) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'removeChild', child) :
      (isGroupNodes(child) ?
        //@ts-ignore
        detach(child) :
        super.removeChild(child))
    ;
  }
  /** @type {typeof DocumentFragment.prototype.replaceChild} */
  replaceChild(newChild, oldChild) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments))
      return parent(comments, 'replaceChild', newChild, oldChild);
    if (isGroupNodes(oldChild)) {
      //@ts-ignore
      insertBefore.call(this, helper, start(oldChild));
      //@ts-ignore
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
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments)) apprepend(asChildren(children, true), comments.end);
    else super.append(...children);
  }
  /** @type {typeof DocumentFragment.prototype.getElementById} */
  getElementById(id) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'getElementById', id) :
      super.getElementById(id)
    ;
  }
  /**
   * @template T
   * @param {T} movedNode
   * @param {Node | null} referenceNode
   * @returns {T}
   */
  moveBefore(movedNode, referenceNode) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      parent(comments, 'moveBefore', movedNode, referenceNode) :
      //@ts-ignore
      super.moveBefore(movedNode, referenceNode)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.prepend} */
  prepend(...children) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments)) apprepend(asChildren(children, true), comments.start.nextSibling);
    else super.prepend(...children);
  }
  querySelector(selectors) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      //@ts-ignore
      (asChildNodes(comments).find(node => node.matches?.(selectors)) || null) :
      super.querySelector(selectors)
    ;
  }
  querySelectorAll(selectors) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    return attached(comments) ?
      //@ts-ignore
      asChildNodes(comments).filter(node => node.matches?.(selectors)) :
      super.querySelector(selectors)
    ;
  }
  /** @type {typeof DocumentFragment.prototype.replaceChildren} */
  replaceChildren(...children) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments)) {
      for (let i = 0; i < children.length; i++) {
        if (isGroupNodes(children[i])) {
          //@ts-ignore
          children[i] = asContent(children[i]);
        }
      }
      replaceChildren.apply(this, children);
      if (hasChildNodes(comments)) {
        const range = document.createRange();
        range.setStartAfter(comments.start);
        range.setEndBefore(comments.end);
        range.deleteContents();
      }
      if (children.length) {
        insertBefore.call(comments.end.parentNode, this, comments.end);
      }
    }
    else super.replaceChildren(...children);
  }

  // Extra (convenient) methods
  /** @type {typeof Element.prototype.after} */
  after(...children) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments))
      comments.end.after(...children);
  }
  /** @type {typeof Element.prototype.before} */
  before(...children) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    if (attached(comments))
      comments.start.before(...children);
  }
  /** @type {typeof Element.prototype.remove} */
  remove() {
    //@ts-ignore
    this.parentNode?.removeChild(this);
  }
  /** @type {typeof Element.prototype.replaceWith} */
  replaceWith(...children) {
    const comments = /** @type {IBoundaries} */(fragments.get(this));
    const { parentNode } = comments.start;
    if (parentNode) {
      insertBefore.call(parentNode, helper, comments.start);
      detach(this, comments);
      helper.replaceWith(...children);
    }
  }
}

const GN = /** @type {typeof GroupNodes} */(
  patched ? globalThis[symbol] : (globalThis[symbol] = GroupNodes)
);

export { GN as GroupNodes };
