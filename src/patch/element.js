//@ts-check

import { defineProperties, patched } from '../lib/utils.js';

import { asChildren, asGroupNodes, asTarget } from '../lib/group-nodes.js';

const EP = Element.prototype;

const {
  after,
  append,
  before,
  insertAdjacentElement,
  prepend,
  replaceChildren,
  replaceWith,
  //@ts-ignore
  moveBefore,
} = EP;

if (!patched) {
  defineProperties(EP, {
    after: {
      /** @type {typeof Element.prototype.after} */
      value(...nodes) {
        after.apply(this, asChildren(nodes));
      }
    },
    append: {
      /** @type {typeof Element.prototype.append} */
      value(...nodes) {
        append.apply(this, asChildren(nodes));
      }
    },
    before: {
      /** @type {typeof Element.prototype.before} */
      value(...nodes) {
        before.apply(this, asChildren(nodes));
      }
    },
    insertAdjacentElement: {
      /** @type {typeof Element.prototype.insertAdjacentElement} */
      value(position, element) {
        return insertAdjacentElement.call(this, position, asGroupNodes(element));
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
      /** @type {typeof Element.prototype.prepend} */
      value(...nodes) {
        prepend.apply(this, asChildren(nodes));
      }
    },
    replaceChildren: {
      /** @type {typeof Element.prototype.replaceChildren} */
      value(...nodes) {
        replaceChildren.apply(this, asChildren(nodes));
      }
    },
    replaceWith: {
      /** @type {typeof Element.prototype.replaceWith} */
      value(...nodes) {
        replaceWith.apply(this, asChildren(nodes));
      }
    },
  });
}
