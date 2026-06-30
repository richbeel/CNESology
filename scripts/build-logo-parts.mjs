import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const SOURCE = join(__dirname, 'assets/cnes-source-logo.png');

const MARK_BOUNDS = { left: 4, top: 7, width: 191, height: 71 };

async function removeBackground(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 210 && data[i + 1] > 210 && data[i + 2] > 210) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function tightMark(cnesCore) {
  const { data, info } = await sharp(cnesCore).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 10) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return sharp(cnesCore)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .extend({
      top: 8,
      bottom: 4,
      left: 6,
      right: 2,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  const bgFree = await removeBackground(SOURCE);
  const { width: srcW, height: srcH } = await sharp(bgFree).metadata();

  const cnesCore = await sharp(bgFree)
    .extract({
      left: MARK_BOUNDS.left,
      top: MARK_BOUNDS.top,
      width: Math.min(MARK_BOUNDS.width, srcW - MARK_BOUNDS.left),
      height: Math.min(MARK_BOUNDS.height, srcH - MARK_BOUNDS.top),
    })
    .png()
    .toBuffer();

  const cnesMark = await tightMark(cnesCore);
  await sharp(cnesMark).toFile(join(publicDir, 'cnes-mark.png'));

  const m = await sharp(cnesMark).metadata();
  console.log('cnes-mark', m.width, m.height);
}

main().catch(console.error);
