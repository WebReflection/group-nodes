import { GroupNodes } from '../src/index.js';

document.body.innerHTML = document.body.innerHTML.trim();
const { firstChild, lastChild } = document.body;

const hydrated = GroupNodes.from(firstChild, lastChild);

console.assert(hydrated.childNodes.length === 3);

try {
  GroupNodes.from(firstChild, lastChild);
  console.assert(false);
}
catch ({ message }) {
  console.log('ℹ️', message);
}

const clone = hydrated.cloneNode(true);

document.body.append(clone);

const another = new GroupNodes;
another.append(document.createElement('hr'), document.createElement('hr'));

document.body.insertBefore(another, clone);

