import { GroupNodes } from '../src/index.js';

const assert = ok => {
  if (!ok) throw new Error('not OK');
};

document.body.innerHTML = document.body.innerHTML.trim();
const { firstChild, lastChild } = document.body;

const hydrated = GroupNodes.from(firstChild, lastChild);

assert(hydrated.hasChildNodes());
assert(hydrated.childNodes.length === 3);
assert(document.body.contains(hydrated));

try {
  GroupNodes.from(firstChild, lastChild);
  assert(false);
}
catch ({ message }) {
  console.log('ℹ️', message);
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
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><hr><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

another.append(hydrated);
assert(document.body.outerHTML === '<body><!--<>--><hr><hr><!--<>-->a<hr>b<!--</>--><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

clone.prepend(another);
assert(document.body.outerHTML === '<body><!--<>--><!--<>--><hr><hr><!--<>-->a<hr>b<!--</>--><!--</>-->a<hr>b<!--</>--></body>');

clone.append(another);
document.body.append(another, hydrated);
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><hr><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

document.body.removeChild(another);
another.removeChild(another.firstChild);
hydrated.append(another);
document.body.removeChild(hydrated);
assert(hydrated.parentNode === null);
assert(hydrated.parentElement === null);
assert(another.parentNode === hydrated);
assert(another.parentElement === null);
document.body.append(another, hydrated);
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

another.remove();
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>-->a<hr>b<!--</>--></body>');

const p = document.createElement('p');
p.textContent = '!';

hydrated.replaceWith(p);
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><p>!</p></body>');

clone.before(another);
assert(document.body.outerHTML === '<body><!--<>--><hr><!--</>--><!--<>-->a<hr>b<!--</>--><p>!</p></body>');

clone.after(another);
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><!--</>--><p>!</p></body>');

p.after(another);
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><p>!</p><!--<>--><hr><!--</>--></body>');

assert(clone.isConnected);
assert(another.isConnected);
assert(!hydrated.isConnected);

hydrated.replaceChildren(p);
assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><!--</>--></body>');

clone.replaceChildren(p);
assert(document.body.outerHTML === '<body><!--<>--><p>!</p><!--</>--><!--<>--><hr><!--</>--></body>');

assert(!hydrated.hasChildNodes());
hydrated.replaceChildren(clone);
assert(hydrated.contains(clone));
assert(document.body.outerHTML === '<body><!--<>--><hr><!--</>--></body>');

another.replaceChildren(hydrated);
assert(document.body.outerHTML === '<body><!--<>--><!--<>--><!--<>--><p>!</p><!--</>--><!--</>--><!--</>--></body>');

document.body.replaceChildren(hydrated, clone, another);
assert(document.body.outerHTML === '<body><!--<>--><!--</>--><!--<>--><p>!</p><!--</>--><!--<>--><!--</>--></body>');

const named = new GroupNodes('Named');
named.appendChild(document.createElement('hr'));

assert({}.toString.call(document.body.appendChild(named)) === '[object GroupNodes<Named>]');

document.body.innerHTML = '<!--<>--><!--</>--><!--<HR>--><hr><!--</HR>-->';

const { childNodes } = document.body;

const range = document.createRange();
range.setStartBefore(childNodes[0]);
range.setEndAfter(childNodes[1]);

const aGroupHasNoName = range.groupNodes();
assert({}.toString.call(aGroupHasNoName) === '[object GroupNodes<>]');


range.setStartBefore(childNodes[2]);
range.setEndAfter(childNodes[4]);

const anHRGroup = range.groupNodes();
assert({}.toString.call(anHRGroup) === '[object GroupNodes<HR>]');

assert(anHRGroup.nodeName === '#group-nodes');

document.body.replaceChildren(document.createTextNode('<GroupNodes /> 🥳'));
document.body.classList.add('done');
