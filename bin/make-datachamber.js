#!/usr/bin/env node

const { readFileSync } = require("fs");

const path = "docs/_site_qr/index.html";
const contents = readFileSync(path, "utf8");
const encoded = encodeURIComponent(contents);

console.log('data:text/html,' + encoded);
