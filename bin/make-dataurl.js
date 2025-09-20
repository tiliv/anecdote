#!/usr/bin/env node

const fs = require('fs');
const b = Buffer.from(fs.readFileSync('docs/_site/index.html'),'utf8').toString('base64');
console.log('data:text/html;base64,'+b);
