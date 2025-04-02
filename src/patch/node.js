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
  patched,
} from '../lib/utils.js';

import { asGroupNodes, asTarget, isGroupNodes } from '../lib/group-nodes.js';

if (!patched) {
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
        //@ts-ignore
        return isGroupNodes(child) ? detach(child) : removeChild.call(this, child);
      }
    },
    replaceChild: {
      /** @type {typeof Node.prototype.replaceChild} */
      value(node, child) {
        if (isGroupNodes(child)) {
          //@ts-ignore
          insertBefore.call(this, helper, start(child));
          //@ts-ignore
          detach(child);
          //@ts-ignore
          child = helper;
        }
        return replaceChild.call(this, asGroupNodes(node), child);
      }
    },
  });
}
