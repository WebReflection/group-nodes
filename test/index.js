import { GroupNodes } from '../src/index.js';

globalThis.GroupNodes = GroupNodes;

const assert = ok => {
  if (!ok) throw new Error('not OK');
};

document.body.innerHTML = document.body.innerHTML.trim();
const { firstChild, lastChild } = document.body;

const hydrated = GroupNodes.from(firstChild, lastChild);

assert(hydrated.hasChildNodes());
assert(hydrated.childNodes.length === 3);
assert(document.body.contains(hydrated));

assert(GroupNodes.from(firstChild, lastChild) === hydrated);

try {
  GroupNodes.from(firstChild, document.createComment(lastChild.data));
  assert(false);
}
catch ({ message }) {
  console.log('%cℹ️ expected:', 'font-weight:bold', message);
}

const clone = hydrated.cloneNode(true);
assert(clone.hasChildNodes());
assert(clone.parentNode === null);
assert(clone.parentElement === null);

document.body.appendChild(clone);
assert(clone.parentNode === document.body);
assert(clone.parentElement === document.body);

const another = new GroupNodes;
assert(!another.hasChildNodes());
another.append(document.createElement('hr'), document.createElement('hr'));

document.body.insertBefore(another, clone);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><!--<>--><hr><hr><!--</>--><!--<ok>-->a<hr>b<!--</ok>--></body>');

another.append(hydrated);
assert(document.body.outerHTML === '<body><!--<>--><hr><hr><!--<ok>-->a<hr>b<!--</ok>--><!--</>--><!--<ok>-->a<hr>b<!--</ok>--></body>');

clone.prepend(another);
assert(document.body.outerHTML === '<body><!--<ok>--><!--<>--><hr><hr><!--<ok>-->a<hr>b<!--</ok>--><!--</>-->a<hr>b<!--</ok>--></body>');

clone.append(another);
document.body.append(another, hydrated);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><!--<>--><hr><hr><!--</>--><!--<ok>-->a<hr>b<!--</ok>--></body>');

document.body.removeChild(another);
another.removeChild(another.firstChild);
hydrated.append(another);
document.body.removeChild(hydrated);
assert(hydrated.parentNode === null);
assert(hydrated.parentElement === null);
assert(another.parentNode === hydrated);
assert(another.parentElement === null);
document.body.append(another, hydrated);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><!--<>--><hr><!--</>--><!--<ok>-->a<hr>b<!--</ok>--></body>');

another.remove();
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><!--<ok>-->a<hr>b<!--</ok>--></body>');

const p = document.createElement('p');
p.textContent = '!';

hydrated.replaceWith(p);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><p>!</p></body>');

clone.before(another);
assert(document.body.outerHTML === '<body><!--<>--><hr><!--</>--><!--<ok>-->a<hr>b<!--</ok>--><p>!</p></body>');

clone.after(another);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><!--<>--><hr><!--</>--><p>!</p></body>');

p.after(another);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><p>!</p><!--<>--><hr><!--</>--></body>');

assert(clone.isConnected);
assert(another.isConnected);
assert(!hydrated.isConnected);

hydrated.replaceChildren(p);
assert(document.body.outerHTML === '<body><!--<ok>-->a<hr>b<!--</ok>--><!--<>--><hr><!--</>--></body>');

clone.replaceChildren(p);
assert(document.body.outerHTML === '<body><!--<ok>--><p>!</p><!--</ok>--><!--<>--><hr><!--</>--></body>');

assert(!hydrated.hasChildNodes());
hydrated.replaceChildren(clone);
assert(hydrated.contains(clone));
assert(document.body.outerHTML === '<body><!--<>--><hr><!--</>--></body>');

another.replaceChildren(hydrated);
assert(document.body.outerHTML === '<body><!--<>--><!--<ok>--><!--<ok>--><p>!</p><!--</ok>--><!--</ok>--><!--</>--></body>');

document.body.replaceChildren(hydrated, clone, another);
assert(document.body.outerHTML === '<body><!--<ok>--><!--</ok>--><!--<ok>--><p>!</p><!--</ok>--><!--<>--><!--</>--></body>');

const named = new GroupNodes('Named');
named.appendChild(document.createElement('hr'));

assert({}.toString.call(document.body.appendChild(named)) === '[object GroupNodes<Named>]');

document.body.innerHTML = '<!--<in>--><!--</in>--><!--<HR>--><hr><!--</HR>-->';

const { childNodes } = document.body;

const range = document.createRange();
range.setStartBefore(childNodes[0]);
range.setEndAfter(childNodes[1]);

const aGroupHasNoName = range.groupNodes();
assert({}.toString.call(aGroupHasNoName) === '[object GroupNodes<in>]');
assert(document.groups[''] === null);

range.setStartBefore(childNodes[2]);
range.setEndAfter(childNodes[4]);

const anHRGroup = range.groupNodes();
assert({}.toString.call(anHRGroup) === '[object GroupNodes<HR>]');

assert(document.groups.HR === anHRGroup);

assert(anHRGroup.nodeName === '#group-nodes');

document.body.innerHTML = 'a<!--<test>-->b<!--</test>-->c';
assert(document.groups.test instanceof GroupNodes);

document.groups.test.appendChild(document.createTextNode('!'));
assert(document.body.innerHTML === 'a<!--<test>-->b!<!--</test>-->c');

document.body.replaceChildren(document.createTextNode('<GroupNodes /> 🥳'));
document.body.classList.add('done');
