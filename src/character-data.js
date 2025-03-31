//@ts-check

import { defineProperties } from './utils.js';

import { asChildren } from './group-nodes.js';

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
