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

  * `new GroupNodes(name = '')` creates a new reference with weakly attached boundaries that represent such *GroupNodes* name. A name doesn't have to be unique, it can be even omitted (empty string as default) but it's suggested to give groups a meaningful name for both debugging purposes and possible future *hydration* via `document.groups[name]`.
  * if a group has no name, only the owner of that group can handle its lifecycle (hence retain its reference ... or leak it, if desired).
  * if a group has a name, it can be easily retrieved via `document.groups[name]` for **hydration** purposes.
  * a *GroupNode* is a *DocumentFragment* extend and it does everything that *DocumentFragment* does + convenient Element extras such as `before`, `after`, `replaceWith` and `remove`.
  * a *GroupNode* is weakly associated to its unique boundaries, where a boundary is a *Comment* node that surrounds the *GroupNode* only when appended, it is never on your way if you deal with the fragment when is detached from any parent.
  * *GroupNodes* in *GroupNodes* **just work** :tm: ... these are literally just like elements, its their boundaries that makes the difference.
  * if you edit a *GroupNode* content while it's appended (hence not detached) that edit is reflected directly within its boundaries, so `appendChild`, as example, will place the content before *boundary.end* and `prepend` right after its *boundary.start*
  * boundaries are guarded to be valid, if these are not at `compareDocumentPosition() === 4` within the same parent, when "*live*", or not both disconnected (no parent) the proposal is to fail fast so that broken layouts will have very short legs (or will simply throw at the JS level).
  * `document.groups[groupName]` returns the first *GroupNodes* associated to that name. *GroupNodes* with no name will be ignored and/or not registered as such and if two groups have the same name the first one will be returned (it's like *querySelector`). If not found, it returns `null`.
  * the **performance impact** is **minimal** per each mutation related prototype method, all vendors already need to brand check if a node is a *fragment* one, the only extra check would be if that *fragment* is the *GroupNodes* kind and act accordingly but all operations have been easily patched/polyfilled with minimal code ... eventually it's just the *GroupNodes* itself slightly slower than a fragment but if you don't need or use it, you're as good as you were before.
  * **TBD** `GroupNodes.from(start, end)` creates *once* a *GroupNodes* reference out of its unique boundaries. If boundaries where somehow *owned* by an already created *GroupNodes* reference.
  * **TBD** `Range.prototype.groupNodes()` is the only addition to DOM standard APIs' prototypes. Given a range that has a *comment* starting boundary and a *comment* ending boundary selected within such range, it returns *once* the uniquely associated *GroupNodes* reference. Remember: 2 boundaries can handle only a single reference just like a node can attach only a single *ShadowDOM* root. Trying to group 2 nodes out of already known boundaries will result into an error.
  * **no parsing changes** are needed at all, everything is 100% based on how the Web works to date without requiring fundamental changes to that status quo.
  * **no DOM API changes** are needed at all, there's just a new *DocumentFragment* extend to consider and, eventually, `range.groupNodes()` or `document.groups` which would be the only extra features but everything else should work as it did to date.

### Implenentation Details

A quick *ASCII* visualization of this concept:

```
           ───┐
┌ ─ ─ ─ ─ ─ ┐ │
│ #comment  │ │
╠═══════════╣ │
║ #fragment ║ ├──▸ <GroupNodes />
╠═══════════╣ │     │
│ #comment  │ │     ├─▸ comments do not reveal the fragment
└ ─ ─ ─ ─ ─ ┘ │     ├─▸ the fragment must know its comments
            ──┘     │   but it won't reveal these directly
                    └─▸ comments do not exists in fragment
                        these exsits only when the fragment
                        is inserted or moved + these disappear
                        once the fragment is removed
```

  * open/close boundaries can be private fields (just weakly related in here) of the fragment because these are needed to validate their current state when operating with such fragment + these need to surround the fragment when appended
  * comments should not leak the fragment reference directly (here these point internally to a WeakRef that might hold the fragment but it's not possible to retrieve it via comments)
  * the *owner* of the *GroupNodes* reference is the one deciding to leak it or not, making possible disruptive changes to it an explicit choice
  * if comments (boundaries) have a name, it is possible to retrieve that reference via `document.groups[name]` and that's still an *owner* decision, not something that happens out of the box

The reason I've shaped this proposal like this is that having a way to retrieve any group might lead to undesired results, specially if parent *DocumentFragment* methods are directly used to enforce the fragment behavior so that the usage of this special fragment should be minimally guarded to avoid breaking what's already out there based on whatever library or framework.

With this in mind, I believe such variant of the *DocumentFragment* could satisfy tons of modern Web development use cases so please contribute in the discussion section of this space to make it better, easier, faster and so on, thank you 👋