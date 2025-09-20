#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const manifest = fs.readFileSync('docs/.well-known/manifest.json');
const privPem = fs.readFileSync('local/private.pem');

const sign = crypto.createSign('sha256');
sign.update(manifest);
sign.end();
const signature = sign.sign({
  key: privPem,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  saltLength: 32
});

fs.writeFileSync('docs/.well-known/manifest.sig', signature.toString('base64'));
console.log('manifest.sig written (base64)');
