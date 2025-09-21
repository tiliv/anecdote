#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const manifest = fs.readFileSync('docs/_site/.well-known/manifest.json');
const sig = Buffer.from(fs.readFileSync('docs/.well-known/manifest.sig','utf8').trim(), 'base64');
const pub = fs.readFileSync('docs/public.pem');

const verifier = crypto.createVerify('sha256');
verifier.update(manifest);
verifier.end();

const ok = verifier.verify(
  { key: pub, padding: crypto.constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 },
  sig
);
console.log('Signature valid?', ok);
