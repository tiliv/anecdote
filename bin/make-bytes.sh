#!/usr/bin/env sh

BYTES=docs/_includes/index.qr.bin
gzip -9 -c docs/_site_qr/index.html > $BYTES
