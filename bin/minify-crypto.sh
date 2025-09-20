#!/usr/bin/env sh

TARGET=docs/_includes/crypto.min.js
PEM=docs/_includes/public.b64
BASE64=docs/_includes/crypto.b64

# Minify
npx terser docs/_data/crypto.js -c passes=3,drop_console,unsafe_arrows,booleans_as_integers \
  -m toplevel --toplevel --format wrap_iife,ecma=2020 \
  -o "$TARGET"

# Naive {% include %}, avoid / delimiter in regex because it's valid base64 too
sed -i.bak "s@{% include public\.b64 %}@$(<"$PEM")@" "$TARGET" && rm "$TARGET.bak"

# Write
openssl dgst -sha256 -binary "$TARGET" | openssl base64 -A > "$BASE64"
