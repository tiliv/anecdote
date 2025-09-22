#!/usr/bin/env sh

qrencode -8 -s 3 -m 1 -l M -o docs/qr.png < docs/_includes/index.bin
