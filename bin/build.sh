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
if [ "$1" = "--dev" ]; then
  _build _config_dev.yml $1
else
  _build
fi

echo "Building QR site scaffold..."
_build _config_qr.yml --qr

echo "Signing manifest..."
bin/sign-manifest.js

echo "Encoding index.html..."
gzip -9 -c docs/_site_qr/index.html > docs/_includes/index.qr.bin

echo "Building Aztec..."
bin/make-permatank.mjs

echo "Building QR..."
bin/make-qr.sh
