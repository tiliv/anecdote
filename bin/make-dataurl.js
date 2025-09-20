#!/usr/bin/env node

const fs = require('fs');
const b = Buffer.from(fs.readFileSync('docs/_site_qr/index.html'),'utf8').toString('base64');
process.stdout.write('data:text/html;base64,'+b);
