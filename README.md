# GroupNodes

A *DocumentPersistentFragment* alternative, solely based on a weak relation between a fragment and its *comments*' boundaries.

```js
import { GroupNodes } from 'https://esm.run/@webreflection/group-nodes';

const group = new GroupNodes;
group.append('a', document.createElement('hr'), 'b');

document.body.appendChild(group);
// body is now:
// <!--<>-->
// "a"
// <hr>
// "b"
// <!--</>-->

group.append('!');
// body is now:
// <!--<>-->
// "a"
// <hr>
// "b"
// "!"
// <!--</>-->

// live editing

// remove it later or move it or do whatever
document.body.removeChild(group);
```
