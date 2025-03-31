
import {
  DFP,
  defineProperties,
  append,
  moveBefore,
  prepend,
  replaceChildren,
} from './utils.js';

import { asGroupNodes, asChildren, asTarget } from './group-nodes.js';

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
        asTarget(referenceNode),
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
