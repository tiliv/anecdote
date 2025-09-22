QR_REPR=docs/_includes/index.b64
QR_OUT=docs/qr.png

function _build {
  echo "Minifying integrity.js for inlining..."
  CONFIG=$1
  bin/minify-payload.sh "$2"

  cd docs
  echo "Building site $CONFIG ..."
  bundle exec jekyll build -q --config _config.yml,$CONFIG
  cd ..
}

echo "Building standard site scaffold..."
_build _config_dev.yml

echo "Building QR site scaffold..."
_build _config_qr.yml --qr

echo "Signing manifest..."
bin/sign-manifest.js

echo "Building Aztec..."
bin/make-permatank.mjs

echo "Building QR..."
bin/make-qr.sh
