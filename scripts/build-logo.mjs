import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

const SOURCE = join(__dirname, 'assets/cnes-source-logo.png');
const REFERENCE = join(__dirname, 'assets/cnesology-reference.png');

const NAVY = '#1a2b5f';

async function removeBackground(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 205 && g > 205 && b > 205) {
      data[i + 3] = 0;
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function buildFromReference() {
  const png = await removeBackground(REFERENCE);
  return sharp(png).trim().png().toBuffer();
}

async function buildFromSource() {
  const bgFree = await removeBackground(SOURCE);
  const trimmed = await sharp(bgFree).trim().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();

  const cnesRow = await sharp(trimmed)
    .extract({ left: 0, top: 0, width, height: Math.round(height * 0.34) })
    .trim()
    .toBuffer();

  const tagline = await sharp(trimmed)
    .extract({ left: 0, top: Math.round(height * 0.72), width, height: height - Math.round(height * 0.72) })
    .trim()
    .toBuffer();

  const cnesMeta = await sharp(cnesRow).metadata();
  const tagMeta = await sharp(tagline).metadata();
  const rowH = cnesMeta.height;
  const visionSize = Math.round(rowH * 0.4);

  const visionSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="${rowH}" viewBox="0 0 110 ${rowH}">
    <text x="0" y="${rowH - 1}" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="${visionSize}" fill="${NAVY}">vision</text>
  </svg>`;

  const vision = await sharp(Buffer.from(visionSvg)).png().trim().toBuffer();
  const visionMeta = await sharp(vision).metadata();
  const rowW = cnesMeta.width + visionMeta.width;

  const titleRow = await sharp({
    create: { width: rowW, height: rowH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: cnesRow, left: 0, top: 0 },
      { input: vision, left: cnesMeta.width - 2, top: rowH - visionMeta.height },
    ])
    .png()
    .toBuffer();

  const totalH = rowH + 10 + tagMeta.height;
  return sharp({
    create: { width: rowW, height: totalH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: titleRow, left: 0, top: 0 },
      { input: tagline, left: Math.round((rowW - tagMeta.width) / 2), top: rowH + 10 },
    ])
    .png()
    .trim()
    .toBuffer();
}

async function buildLogo() {
  await mkdir(publicDir, { recursive: true });

  let final;
  try {
    final = await buildFromReference();
    console.log('Použit referenční náhled (firemní ČNES + vision)');
  } catch {
    final = await buildFromSource();
    console.log('Sestaveno ze zdrojového loga');
  }

  const meta = await sharp(final).metadata();
  await sharp(final).toFile(join(publicDir, 'cnes-vision-logo.png'));
  await sharp(final)
    .resize(Math.round(meta.width * 2), Math.round(meta.height * 2))
    .toFile(join(publicDir, 'cnes-vision-logo@2x.png'));

  console.log(`Logo ${meta.width}×${meta.height}px`);
  console.log(`Image props: width={${meta.width}} height={${meta.height}}`);
}

buildLogo().catch((err) => {
  console.error(err);
  process.exit(1);
});
