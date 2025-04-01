//@ts-check

import {
  DFP,
  defineProperties,
  append,
  moveBefore,
  prepend,
  replaceChildren,
} from '../lib/utils.js';

import { asGroupNodes, asChildren, asTarget } from '../lib/group-nodes.js';

defineProperties(DFP, {
  append: {
    /** @type {typeof DocumentFragment.prototype.append} */
    value(...nodes) {
      append.apply(this, asChildren(nodes));
    }
  },
  moveBefore: {
    /**
     * @template {Node} T
     * @param {T} movedNode
     * @param {Node | null} referenceNode
     * @returns {T}
     */
    value(movedNode, referenceNode) {
      return moveBefore.call(
        this,
        asGroupNodes(movedNode),
        asTarget(referenceNode),
      );
    }
  },
  prepend: {
    /** @type {typeof DocumentFragment.prototype.prepend} */
    value(...nodes) {
      prepend.apply(this, asChildren(nodes));
    }
  },
  replaceChildren: {
    /** @type {typeof DocumentFragment.prototype.replaceChildren} */
    value(...nodes) {
      replaceChildren.apply(this, asChildren(nodes));
    }
  },
});
