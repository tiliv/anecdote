#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const private = process.argv[2] || "local/private.pem";
const manifest = fs.readFileSync(`docs/_site/.well-known/manifest.json`);
console.log(`Signing manifest with ${private} ...`);
const privPem = fs.readFileSync(private);

const sign = crypto.createSign('sha256');
sign.update(manifest);
sign.end();
const signature = sign.sign({
  key: privPem,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  saltLength: 32
});

const b64 = signature.toString('base64');
fs.writeFileSync('docs/.well-known/manifest.sig', b64);
console.log(b64);
