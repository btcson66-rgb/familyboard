import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buffer) => { let c = 0xffffffff; for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (name, data) => { const type = Buffer.from(name); const length = Buffer.alloc(4); length.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, data]))); return Buffer.concat([length, type, data, crc]); };
function png(size, maskable = false) {
  const rows = []; const padding = maskable ? size * .18 : 0;
  for (let y = 0; y < size; y += 1) { const row = Buffer.alloc(size * 4 + 1); for (let x = 0; x < size; x += 1) { const index = 1 + x * 4; const inHome = x > size * .24 + padding / 4 && x < size * .76 - padding / 4 && y > size * .24 && y < size * .76; const roof = y > (-Math.abs(x - size / 2) + size * .48) && y < size * .54 && x > size * .2 && x < size * .8; const white = inHome || roof; row[index] = white ? 255 : 23; row[index + 1] = white ? 253 : 107; row[index + 2] = white ? 247 : 82; row[index + 3] = 255; } rows.push(row); }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
const dir = path.resolve('public/icons'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), png(192)); fs.writeFileSync(path.join(dir, 'icon-512.png'), png(512)); fs.writeFileSync(path.join(dir, 'icon-maskable-512.png'), png(512, true));
console.log('Generated PWA icons.');

