import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator in pure Node standard library
function createPng(width, height, isMaskable = false) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.38 : 0.44);
  const cornerRadius = isMaskable ? 0 : width * 0.22; // Squircle for normal, full bleed for maskable

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Gradient background calculation
      const t = (x + y) / (width + height);
      // Linear gradient #4f46e5 (79, 70, 229) -> #7c3aed (124, 58, 237) -> #2563eb (37, 99, 235)
      let r = Math.round(79 + (124 - 79) * t);
      let g = Math.round(70 + (58 - 70) * t);
      let b = Math.round(229 + (237 - 229) * t);
      let a = 255;

      // Squircle mask for non-maskable icons
      if (!isMaskable) {
        // Distance from corner box
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > cornerRadius) {
          a = 0;
        } else if (dist > cornerRadius - 1.5) {
          a = Math.round(255 * (cornerRadius - dist) / 1.5);
        }
      }

      // Draw central rocket silhouette / symbol
      const distToCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      // Rocket body representation: rotated ellipse + nose cone
      // Transform coordinates by 45 degrees
      const angle = -Math.PI / 4;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const nx = (x - cx) * cosA - (y - cy) * sinA;
      const ny = (x - cx) * sinA + (y - cy) * cosA;

      const scale = width / 512;
      const rx = nx / scale;
      const ry = ny / scale;

      // Check if inside rocket shape
      let isRocket = false;
      let isWindow = false;
      let isFlame = false;

      // Rocket body
      if (Math.abs(rx) <= 42 && ry >= -110 && ry <= 65) {
        // Taper towards top
        const taper = ry < 0 ? (1 - Math.abs(ry) / 130) : 1;
        if (Math.abs(rx) <= 42 * taper) {
          isRocket = true;
        }
      }
      // Fins
      if (Math.abs(rx) <= 90 && Math.abs(rx) >= 30 && ry >= 25 && ry <= 80) {
        const finTaper = (ry - 25) / 55;
        if (Math.abs(rx) <= 40 + 50 * finTaper) {
          isRocket = true;
        }
      }
      // Porthole window
      if (Math.sqrt(rx * rx + (ry + 20) * (ry + 20)) <= 18) {
        isWindow = true;
      }
      // Flame
      if (Math.abs(rx) <= 28 && ry > 65 && ry <= 140) {
        const flameTaper = (140 - ry) / 75;
        if (Math.abs(rx) <= 28 * flameTaper) {
          isFlame = true;
        }
      }

      if (a > 0) {
        if (isWindow) {
          r = 56;
          g = 189;
          b = 248; // cyan
        } else if (isFlame) {
          r = 251;
          g = 191;
          b = 36; // amber flame
        } else if (isRocket) {
          r = 255;
          g = 255;
          b = 255; // white rocket
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // Helper to build chunks
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 table
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte >>>= 1;
      }
    }
    return crc ^ -1;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: width(4), height(4), bitDepth(1)=8, colorType(1)=6(RGBA), comp(1)=0, filter(1)=0, interlace(1)=0
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('✔ PWA Icons generated successfully in public/');
