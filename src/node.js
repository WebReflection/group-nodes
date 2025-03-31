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
    value(child) {
      return appendChild.call(this, asGroupNodes(child));
    }
  },
  compareDocumentPosition: {
    value(node) {
      return compareDocumentPosition.call(this, asTarget(node));
    }
  },
  contains: {
    value(node) {
      return contains.call(this, asTarget(node));
    }
  },
  insertBefore: {
    value(newNode, referenceNode) {
      return insertBefore.call(this, asGroupNodes(newNode), asTarget(referenceNode));
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
