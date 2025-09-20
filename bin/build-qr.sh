#!/usr/bin/env sh

echo "Using _config_qr.yml..."
bin/build-local.sh --qr

echo "Generating data uri..."
bin/make-dataurl.js > docs/_includes/qr.b64

echo "Generating QR..."
qrencode -r docs/_includes/qr.b64 -o docs/qr.png
