import { defineProperties } from './utils.js';

import { asChildren } from './group-nodes.js';

const CDP = CharacterData.prototype;

const { after, before, replaceWith } = CDP;

defineProperties(CDP, {
  after: {
    value(...children) {
      after.apply(this, asChildren(children));
    }
  },
  before: {
    value(...children) {
      before.apply(this, asChildren(children));
    }
  },
  replaceWith: {
    value(...children) {
      replaceWith.apply(this, asChildren(children));
    }
  },
});
