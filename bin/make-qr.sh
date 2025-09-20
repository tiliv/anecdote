#!/usr/bin/env sh

# Warning: this relies on `$npm run localbuild` rendering of docs/_site/index.html

bin/make-dataurl.js > docs/_includes/html.b64
qrencode docs/_includes/html.b64 -o docs/qr.png
