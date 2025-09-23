#!/usr/bin/env sh

IN=docs/_data/payload.js
PEM=docs/_includes/public.b64
URL="https://anecdote\.discoverywritten\.com"
if [ "$1" = "--qr" ]; then
  NAME=payload.qr.min
  TARGET=docs/_includes/$NAME.js
else
  NAME=payload.min
  TARGET=docs/_includes/$NAME.js
  URL=""
fi

B64=docs/_includes/$NAME.b64

# Minify
node_modules/.bin/terser "$IN" -c passes=3,drop_console,unsafe_arrows,booleans_as_integers \
  -m toplevel --toplevel --format wrap_iife,ecma=2020 \
  -o "$TARGET"

# Naive {% include %}, avoid / delimiter in regex because it's valid base64 too
echo "Replacing {% include public.b64 %} with key $PEM"
sed -i.bak "s@{% include public\.b64 %}@$(<"$PEM")@" "$TARGET" && rm "$TARGET.bak"

# We have to replace this because we're using a file jekyll hasn't rendered yet.
# We do this to avoid querying it out of the docs/_site/index.html tag,
# but it could be done.
echo "Replacing {{ site.remote }} with manifest provider: ${URL:-<self>}"
sed -i.bak "s@{{ site\.remote }}@$URL@g" "$TARGET" && rm "$TARGET.bak"

openssl dgst -sha256 -binary "$TARGET" | openssl base64 -A > "$B64"
