//@ts-check

import { defineProperties, groups, patched } from '../lib/utils.js';
import { GroupNodes } from '../lib/group-nodes.js';

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
          let group = map.get(name)?.deref(), parentNode, start, end, node;
          if (group) return group;
          name = String(name);
          const tw = document.createTreeWalker(document.body, 128);
          const startName = `<${name}>`;
          const endName = `</${name}>`;
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
          if (start && end) {
            group = GroupNodes.from(start, end);
            map.set(name, new WeakRef(group));
          }
          return group;
        }
      })
    }
  });
}
