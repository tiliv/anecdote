#!/usr/bin/env sh

bin/make-dataurl.js | qrencode -o docs/qr.png
