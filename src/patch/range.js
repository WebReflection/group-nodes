//@ts-check

import { defineProperties, patched } from '../lib/utils.js';
import { GroupNodes } from '../lib/group-nodes.js';

if (!patched) {
  defineProperties(Range.prototype, {
    // TBD: I am not sure I like this, I prefer just `document.groups`
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
