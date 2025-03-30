
import {
  DFP,
  defineProperties,
  target,
  append,
  moveBefore,
  prepend,
  replaceChildren,
} from './utils.js';

import { asGroupNodes, asChildren } from './group-nodes.js';

defineProperties(DFP, {
  append: {
    value(...children) {
      append.apply(this, asChildren(children));
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
});
