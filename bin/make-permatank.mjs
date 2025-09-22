#!/usr/bin/env node

// make-aztec-bundle.mjs
import { deflateRaw } from 'pako';
import { encode as cborEncode, decode as cborDecode } from 'cbor-x';
import crypto from 'node:crypto';
import fss from 'node:fs';
import fs from 'node:fs/promises';
import bwipjs from 'bwip-js';

// tiny CRC32 (IEEE)
function crc32(buf) {
  const table = crc32.table ||= new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    return c >>> 0;
  });
  let c = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}

// Try to render an Aztec; on failure, caller reduces chunk size.
async function renderAztec(bin, { scale = 1 } = {}) {
  // bwip-js accepts Buffer for binary payloads.
  const text = Buffer.from(bin).toString('latin1');
  const png = await bwipjs.toBuffer({
    bcid: 'azteccode',        // Aztec Code
    text,
    binarytext: true,
    scale,
    // eclevel: 33,  // % of error correction (approx target)
  });
  return png;
}

// Split into N parts that actually fit as Aztec symbols.
// Start optimistic and back off if a render throws.
async function splitForAztec(bin, { maxParts = 32, tryBytes = 1800 } = {}) {
  // Heuristic: start with `tryBytes`, shrink until render passes.
  // Then compute part count from that working size.
  let partSize = tryBytes;
  // Probe until one succeeds
  while (true) {
    try {
      await renderAztec(bin.subarray(0, Math.min(partSize, bin.length)));
      break;
    } catch {
      partSize = Math.max(64, Math.floor(partSize * 0.85));
      if (partSize <= 64) break;
    }
  }
  const parts = Math.ceil(bin.length / partSize);
  if (parts > maxParts) {
    // If you truly need more, raise maxParts or add a second “deck” (multi-bundle).
    throw new Error(`Needs ${parts} symbols; exceeds maxParts=${maxParts}. Lower eclevel or raise maxParts.`);
  }
  return { partSize, parts };
}

function makeFrames(id, bin, parts, partSize) {
  const frames = [];
  for (let idx = 0; idx < parts; idx++) {
    const start = idx * partSize;
    const slice = bin.subarray(start, Math.min(bin.length, start + partSize));
    // App-layer header; CBOR keeps it compact and binary-safe.
    const payload = {
      t: 'azbundle/1',          // type tag
      id,                       // 16-byte bundle id (hex)
      idx,                      // 0-based index
      parts,                    // total
      crc: crc32(slice),        // per-chunk CRC
      data: slice,              // the actual bytes
    };
    frames.push(cborEncode(payload));
  }
  return frames;
}

export async function encodeToAztecSeries(utf8Text) {
  const raw = Buffer.from(utf8Text, 'utf8');
  const deflated = Buffer.from(deflateRaw(raw));   // raw DEFLATE (no zlib header)
  const id = crypto.randomBytes(8).toString('hex'); // 16-hex char bundle id

  // const svgQR = await QRCode.toString(utf8Text, {
  //   type: 'svg',
  //   errorCorrectionLevel: 'M',   // L/M/Q/H — lower = more capacity
  //   margin: 0,
  // });
  // fss.writeFileSync('docs/qr.svg', svgQR);

  const { partSize, parts } = await splitForAztec(deflated, { maxParts: 32, tryBytes: 1800 });

  const frames = makeFrames(id, deflated, parts, partSize);

  const files = [];
  for (let i = 0; i < frames.length; i++) {
    // If a particular frame fails (too dense), you can lower eclevel or scale and retry.
    const png = await renderAztec(frames[i], { scale: 4 });
    const fname = `docs/az${String(i + 1)}.png`;
    await fs.writeFile(fname, png);
    files.push(fname);
  }
  return { id, parts, files, bytesIn: raw.length, bytesDeflated: deflated.length, partSize };
}

const html = fss.readFileSync('docs/_site_qr/index.html', 'utf8');
const dataUri = 'data:text/html,' + encodeURIComponent(html);
encodeToAztecSeries(dataUri).then(info => {
  console.log(info);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
