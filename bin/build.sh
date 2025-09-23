#!/usr/bin/env bash

set -Eeuo pipefail

_build() {
  echo "Minifying integrity.js for inlining..."
  CONFIG=${1-}
  bin/minify-payload.sh "${2-}"

  cd docs
  echo "Building site ${CONFIG:-_config.yml} ..."
  bundle exec jekyll build -q --config "_config.yml${CONFIG:+,${CONFIG}}"
  cd ..
}

echo "Building standard site scaffold..."
if [ "${1-}" = "--dev" ]; then
  _build _config_dev.yml "$1"
else
  _build
fi

echo "Building QR site scaffold..."
_build _config_qr.yml --qr

if [ "${PRIVATE_PEM-}" ] || [ -f local/private.pem ]; then
  echo "Signing manifest..."
  bin/sign-manifest.js
else
  echo "! Skipping manifest signing, no private key available"
fi

echo "Encoding index.html..."
gzip -9 -c docs/_site_qr/index.html > docs/_includes/index.qr.bin

echo "Building Aztec..."
bin/make-permatank.mjs

echo "Building QR..."
bin/make-qr.mjs
