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

## API

  * `new GroupNodes(name = '')` creates a new reference with weakly attached boundaries that represent such *GroupNodes* name. A name doesn't have to be unique, it can be even omitted (empty string as default) but it's suggested to give groups a meaningful name for both debugging purposes and possible future *hydration*.
  * `GroupNodes.from(start, end)` creates *once* a *GroupNodes* reference out of its unique boundaries. If boundaries where somehow *owned* by an already created *GroupNodes* reference, it **currently** (TBD) throws an error because 2 boundaries can only have a single *GroupNodes* attached.
  * `Range.prototype.groupNodes()` is the only addition to DOM standard APIs' prototypes. Given a range that has a *comment* starting boundary and a *comment* ending boundary selected within such range, it returns *once* the uniquely associated *GroupNodes* reference. Remember: 2 boundaries can handle only a single reference just like a node can attach only a single *ShadowDOM* root. Trying to group 2 nodes out of already known boundaries will result into an error.
  * `document.groups[groupName]` returns the first *GroupNodes* associated to that name. *GroupNodes* with no name will be ignored and/or not registered as such and if two groups have the same name the first one will be returned (it's like *querySelector`). If not found, it returns `null`.
