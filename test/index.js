import { GroupNodes } from '../src/index.js';

document.body.innerHTML = document.body.innerHTML.trim();
const { firstChild, lastChild } = document.body;

const hydrated = GroupNodes.from(firstChild, lastChild);

console.assert(hydrated.hasChildNodes());
console.assert(hydrated.childNodes.length === 3);
console.assert(document.body.contains(hydrated));

try {
  GroupNodes.from(firstChild, lastChild);
  console.assert(false);
}
catch ({ message }) {
  console.log('ℹ️', message);
}

const clone = hydrated.cloneNode(true);
console.assert(clone.hasChildNodes());
console.assert(clone.parentNode === null);
console.assert(clone.parentElement === null);

document.body.appendChild(clone);
console.assert(clone.parentNode === document.body);
console.assert(clone.parentElement === document.body);

const another = new GroupNodes;
console.assert(!another.hasChildNodes());
another.append(document.createElement('hr'), document.createElement('hr'));

document.body.insertBefore(another, clone);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><hr><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

another.append(hydrated);
console.assert(document.body.outerHTML === '<body><!--<>--><hr><hr><!--<>-->a<hr>b<!--</>--><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

clone.prepend(another);
console.assert(document.body.outerHTML === '<body><!--<>--><!--<>--><hr><hr><!--<>-->a<hr>b<!--</>--><!--</>-->a<hr>b<!--</>--></body>');

clone.append(another);
document.body.append(another, hydrated);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><hr><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

document.body.removeChild(another);
another.removeChild(another.firstChild);
hydrated.append(another);
document.body.removeChild(hydrated);
console.assert(hydrated.parentNode === null);
console.assert(hydrated.parentElement === null);
console.assert(another.parentNode === hydrated);
console.assert(another.parentElement === null);
document.body.append(another, hydrated);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><!--</>--><!--<>-->a<hr>b<!--</>--></body>');

another.remove();
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>-->a<hr>b<!--</>--></body>');

const p = document.createElement('p');
p.textContent = '!';

hydrated.replaceWith(p);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><p>!</p></body>');

clone.before(another);
console.assert(document.body.outerHTML === '<body><!--<>--><hr><!--</>--><!--<>-->a<hr>b<!--</>--><p>!</p></body>');

clone.after(another);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><!--</>--><p>!</p></body>');

p.after(another);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><p>!</p><!--<>--><hr><!--</>--></body>');

console.assert(clone.isConnected);
console.assert(another.isConnected);
console.assert(!hydrated.isConnected);

hydrated.replaceChildren(p);
console.assert(document.body.outerHTML === '<body><!--<>-->a<hr>b<!--</>--><!--<>--><hr><!--</>--></body>');

clone.replaceChildren(p);
console.assert(document.body.outerHTML === '<body><!--<>--><p>!</p><!--</>--><!--<>--><hr><!--</>--></body>');

console.assert(!hydrated.hasChildNodes());
hydrated.replaceChildren(clone);
console.assert(hydrated.contains(clone));
console.assert(document.body.outerHTML === '<body><!--<>--><hr><!--</>--></body>');

another.replaceChildren(hydrated);
console.assert(document.body.outerHTML === '<body><!--<>--><!--<>--><!--<>--><p>!</p><!--</>--><!--</>--><!--</>--></body>');

document.body.replaceChildren(hydrated, clone, another);
console.assert(document.body.outerHTML === '<body><!--<>--><!--</>--><!--<>--><p>!</p><!--</>--><!--<>--><!--</>--></body>');
