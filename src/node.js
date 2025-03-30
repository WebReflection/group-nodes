import {
  NP,
  defineProperties,
  detach,
  helper,
  start,
  target,
  appendChild,
  compareDocumentPosition,
  contains,
  insertBefore,
  removeChild,
  replaceChild,
} from './utils.js';

import { asGroupNodes, isGroupNodes } from './group-nodes.js';

defineProperties(NP, {
  appendChild: {
    value(child) {
      return appendChild.call(this, asGroupNodes(child));
    }
  },
  compareDocumentPosition: {
    value(node) {
      return compareDocumentPosition.call(this, target(node));
    }
  },
  contains: {
    value(node) {
      return contains.call(this, target(node));
    }
  },
  insertBefore: {
    value(newNode, referenceNode) {
      return insertBefore.call(this, asGroupNodes(newNode), target(referenceNode));
    }
  },
  removeChild: {
    value(child) {
      return isGroupNodes(child) ? detach(child) : removeChild.call(this, child);
    }
  },
  replaceChild: {
    value(newChild, oldChild) {
      if (isGroupNodes(oldChild)) {
        insertBefore.call(this, helper, start(oldChild));
        detach(oldChild);
        oldChild = helper;
      }
      return replaceChild.call(this, asGroupNodes(newChild), oldChild);
    }
  },
});
