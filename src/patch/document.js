//@ts-check

import { defineProperties, invalidBoundaries, groups, patched } from '../lib/utils.js';
import { GroupNodes } from '../lib/group-nodes.js';

/** @typedef {import("../lib/group-nodes.js").IGroupNodes} IGroupNodes */

if (!patched) {
  defineProperties(document, {
    groups: {
      configurable: true,
      enumerable: true,
      value: new Proxy(groups, {
        has(map, name) {
          //@ts-ignore
          return map.has(name) || !!this.get(map, name);
        },
        get(map, name) {
          let group = map.get(name)?.deref() || null;
          name = String(name);
          if (!group && name) {
            const tw = document.createTreeWalker(document.body, 128);
            const startName = `<${name}>`;
            const endName = `</${name}>`;
            let parentNode, start, end, node;
            while ((node = tw.nextNode())) {
              if (start) {
                //@ts-ignore
                if (node.data === endName && node.parentNode === parentNode) {
                  end = node;
                  break;
                }
              }
              //@ts-ignore
              else if (node.data === startName) {
                start = node;
                parentNode = start.parentNode;
              }
            }
            if (start) {
              if (end) {
                group = GroupNodes.from(
                  /** @type {Comment} */(start),
                  /** @type {Comment} */(end),
                );
              }
              else {
                invalidBoundaries();
              }
            }
          }
          return group;
        }
      })
    }
  });
}
