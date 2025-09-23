#!/usr/bin/env sh

IN=docs/_data/payload.js
PEM=docs/_includes/public.b64
URL="https://anecdote\.discoverywritten\.com"
if [ "$1" = "--qr" ]; then
  TARGET=docs/_includes/payload.qr.min.js
else
  TARGET=docs/_includes/payload.min.js
  if [ "$1" = "--dev" ]; then
    URL=""  # relative root, avoids CPS-illegal rewrites from jekyll
  fi
fi

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
echo "Replacing {{ site.canonical }} with manifest provider: ${URL:-<self>}"
sed -i.bak "s@{{ site\.canonical }}@$URL@g" "$TARGET" && rm "$TARGET.bak"
