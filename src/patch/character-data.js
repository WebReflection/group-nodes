//@ts-check

import { defineProperties, patched } from '../lib/utils.js';

import { asChildren } from '../lib/group-nodes.js';

if (!patched) {
  const CDP = CharacterData.prototype;

  const { after, before, replaceWith } = CDP;

  defineProperties(CDP, {
    after: {
      /** @type {typeof CharacterData.prototype.after} */
      value(...nodes) {
        after.apply(this, asChildren(nodes));
      }
    },
    before: {
      /** @type {typeof CharacterData.prototype.before} */
      value(...nodes) {
        before.apply(this, asChildren(nodes));
      }
    },
    replaceWith: {
      /** @type {typeof CharacterData.prototype.replaceWith} */
      value(...nodes) {
        replaceWith.apply(this, asChildren(nodes));
      }
    },
  });
}
