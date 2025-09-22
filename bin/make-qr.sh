#!/usr/bin/env sh

gzip -9 -c docs/_site_qr/index.html > docs/_includes/index.bin
qrencode -t SVG -s 1 -m 0 -l M -o docs/qr.svg < docs/_includes/index.bin
