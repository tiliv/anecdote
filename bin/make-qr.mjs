#!/usr/bin/env node

import fs from 'fs';
import QRCode from 'qrcode';

const data = fs.readFileSync('docs/_includes/index.qr.bin');
await QRCode.toFile('docs/qr.png', [{ data, mode: 'byte' }],
  {
    type: 'png',
    margin: 1,
    scale: 3,
    errorCorrectionLevel: 'M'
  }
);
