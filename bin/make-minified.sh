#!/usr/bin/env sh

npx terser docs/index.crypto.js -c passes=3,drop_console,unsafe_arrows,booleans_as_integers \
  -m toplevel --toplevel --format wrap_iife,ecma=2020 \
  -o docs/_includes/crypto.js
