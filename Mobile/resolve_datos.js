const fs = require('fs');

const path = 'C:/Users/braya/Trabajo/roosmobileadmin/Mobile/src/services/datos.ts';
let content = fs.readFileSync(path, 'utf8');

// We want to keep HEAD (our local changes) for ALL conflicts.
// The regex finds the conflict block and replaces it with the HEAD portion.
const conflictRegex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> [a-f0-9]+\r?\n/g;

const newContent = content.replace(conflictRegex, '$1');

fs.writeFileSync(path, newContent, 'utf8');
console.log('Merge conflicts resolved in datos.ts by keeping HEAD');
