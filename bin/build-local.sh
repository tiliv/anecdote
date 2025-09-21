QR_REPR=docs/_includes/qr.b64
QR_OUT=docs/qr.png

function _build {
  echo "Minifying crypto.js for inlining..."
  CONFIG=$1
  bin/minify-crypto.sh "$2"

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

echo "Building QR site serialization..."
bin/make-dataurl.js > $QR_REPR

echo "Encoding QR..."
qrencode -r $QR_REPR -o $QR_OUT
