//@ts-check

import {
  NP,
  defineProperties,
  detach,
  helper,
  start,
  appendChild,
  compareDocumentPosition,
  contains,
  insertBefore,
  removeChild,
  replaceChild,
} from './utils.js';

import { asGroupNodes, asTarget, isGroupNodes } from './group-nodes.js';

defineProperties(NP, {
  appendChild: {
    /** @type {typeof Node.prototype.appendChild} */
    value(node) {
      return appendChild.call(this, asGroupNodes(node));
    }
  },
  compareDocumentPosition: {
    /** @type {typeof Node.prototype.compareDocumentPosition} */
    value(other) {
      return compareDocumentPosition.call(this, asTarget(other));
    }
  },
  contains: {
    /** @type {typeof Node.prototype.contains} */
    value(other) {
      return contains.call(this, asTarget(other));
    }
  },
  insertBefore: {
    /** @type {typeof Node.prototype.insertBefore} */
    value(node, child) {
      return insertBefore.call(this, asGroupNodes(node), asTarget(child));
    }
  },
  removeChild: {
    /** @type {typeof Node.prototype.removeChild} */
    value(child) {
      return isGroupNodes(child) ? detach(child) : removeChild.call(this, child);
    }
  },
  replaceChild: {
    /** @type {typeof Node.prototype.replaceChild} */
    value(node, child) {
      if (isGroupNodes(child)) {
        insertBefore.call(this, helper, start(child));
        detach(child);
        //@ts-ignore
        child = helper;
      }
      return replaceChild.call(this, asGroupNodes(node), child);
    }
  },
});
