#!/usr/bin/env sh

gzip -9 -c docs/_site_qr/index.html > docs/_includes/index.bin
qrencode -s 3 -m 1 -l M -o docs/qr.png < docs/_includes/index.bin
