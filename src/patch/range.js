//@ts-check

import { defineProperties, patched } from '../lib/utils.js';
import { GroupNodes } from '../lib/group-nodes.js';

if (!patched) {
  defineProperties(Range.prototype, {
    groupNodes: {
      configurable: true,
      enumerable: true,
      writable: true,
      value() {
        const { commonAncestorContainer, startOffset, endOffset } = this;
        const { childNodes } = commonAncestorContainer;
        return GroupNodes.from(
          childNodes[startOffset],
          childNodes[endOffset - 1]
        );
      }
    }
  });
}
