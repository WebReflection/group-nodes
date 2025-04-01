import { GroupNodes } from '../lib/group-nodes.js';

/**
 * Create an optionally named GroupNodes instance.
 * @this {Range}
 * @param {string} [name=""]
 * @returns
 */
function groupNodes(name = '') {
  const { commonAncestorContainer, startOffset, endOffset } = this;
  const { childNodes } = commonAncestorContainer;
  return GroupNodes.from(
    childNodes[startOffset],
    childNodes[endOffset - 1]
  );
};

Range.prototype.groupNodes = groupNodes;
