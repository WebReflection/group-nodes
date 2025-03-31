import { defineProperties, target } from './utils.js';

import { asChildren, asGroupNodes } from './group-nodes.js';

const EP = Element.prototype;

const {
  after,
  append,
  before,
  insertAdjacentElement,
  moveBefore,
  prepend,
  replaceChildren,
  replaceWith,
} = EP;

defineProperties(EP, {
  after: {
    value(...children) {
      after.apply(this, asChildren(children));
    }
  },
  append: {
    value(...children) {
      append.apply(this, asChildren(children));
    }
  },
  before: {
    value(...children) {
      before.apply(this, asChildren(children));
    }
  },
  insertAdjacentElement: {
    value(position, element) {
      insertAdjacentElement.call(this, position, asGroupNodes(element));
      return element;
    }
  },
  moveBefore: {
    value(liveNode, referenceNode) {
      return moveBefore.call(
        this,
        asGroupNodes(liveNode),
        target(referenceNode),
      );
    }
  },
  prepend: {
    value(...children) {
      prepend.apply(this, asChildren(children));
    }
  },
  replaceChildren: {
    value(...children) {
      replaceChildren.apply(this, asChildren(children));
    }
  },
  replaceWith: {
    value(...children) {
      replaceWith.apply(this, asChildren(children));
    }
  },
});
