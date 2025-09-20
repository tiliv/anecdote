#!/usr/bin/env sh

PEM=docs/_includes/public.b64
if [ "$1" = "--qr" ]; then
  TARGET=docs/_includes/crypto.qr.min.js
  BASE64=docs/_includes/crypto.qr.b64
else
  TARGET=docs/_includes/crypto.min.js
  BASE64=docs/_includes/crypto.b64
fi

# Minify
npx terser docs/_data/crypto.js -c passes=3,drop_console,unsafe_arrows,booleans_as_integers \
  -m toplevel --toplevel --format wrap_iife,ecma=2020 \
  -o "$TARGET"

# Naive {% include %}, avoid / delimiter in regex because it's valid base64 too
sed -i.bak "s@{% include public\.b64 %}@$(<"$PEM")@" "$TARGET" && rm "$TARGET.bak"

# We have to replace this because we're not using a file that jekyll has rendered yet.
# We do this to avoid querying it out of the docs/_site/index.html,
# but it could be done.
if [ "$1" = "--qr" ]; then
  sed -i.bak "s@{{ site\.url }}@https://anecdote\.discoverywritten\.com@g" "$TARGET" && rm "$TARGET.bak"
fi

# Write
openssl dgst -sha256 -binary "$TARGET" | openssl base64 -A > "$BASE64"
