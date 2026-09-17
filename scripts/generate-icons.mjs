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
// Open Graph card. og:image must be a raster format — Google, Facebook, X, LinkedIn
// and Slack all ignore an SVG og:image, so the previous public/og-default.svg
// rendered as no preview at all anywhere it mattered. Drawn procedurally with the
// same encoder as the icons so the build stays dependency-free.
function ogCard(width = 1200, height = 630) {
  const rows = [];
  const markSize = 200;
  const markX = 110;
  const markY = height / 2 - markSize / 2;
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(width * 4 + 1);
    for (let x = 0; x < width; x += 1) {
      const index = 1 + x * 4;
      // Background, then two brand accent circles, then the rounded mark tile.
      let [r, g, b] = [255, 253, 247];
      if ((x - 1010) ** 2 + (y - 120) ** 2 < 210 ** 2) [r, g, b] = [245, 216, 157];
      if ((x - 110) ** 2 + (y - 620) ** 2 < 260 ** 2) [r, g, b] = [220, 235, 225];
      const mx = x - markX;
      const my = y - markY;
      if (mx >= 0 && mx < markSize && my >= 0 && my < markSize) {
        const radius = 48;
        const cx = Math.min(Math.max(mx, radius), markSize - radius);
        const cy = Math.min(Math.max(my, radius), markSize - radius);
        if ((mx - cx) ** 2 + (my - cy) ** 2 <= radius ** 2) {
          [r, g, b] = [23, 107, 82];
          const inHome = mx > markSize * 0.3 && mx < markSize * 0.7 && my > markSize * 0.46 && my < markSize * 0.74;
          const roof = my > (-Math.abs(mx - markSize / 2) + markSize * 0.74) && my < markSize * 0.52 && mx > markSize * 0.22 && mx < markSize * 0.78;
          if (inHome || roof) [r, g, b] = [255, 255, 255];
        }
      }
      row[index] = r; row[index + 1] = g; row[index + 2] = b; row[index + 3] = 255;
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
fs.writeFileSync(path.resolve('public/og-default.png'), ogCard());

const dir = path.resolve('public/icons'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), png(192)); fs.writeFileSync(path.join(dir, 'icon-512.png'), png(512)); fs.writeFileSync(path.join(dir, 'icon-maskable-512.png'), png(512, true));
console.log('Generated PWA icons and the Open Graph card.');

