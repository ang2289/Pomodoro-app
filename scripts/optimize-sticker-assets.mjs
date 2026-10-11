/**
 * Optimize sticker showcase assets locally. Called by npm predev/prebuild.
 * All sources are preserved; no remote services, uploads or API requests.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const showcaseNames = [
  'breakfast-sticker', 'dessert-commercial', 'nail-sticker',
  'drink-promo', 'shop-support-sticker', 'florist-sticker',
];
const demoNames = ['demo-prompt', 'demo-result', 'demo-pack'];
const productDemoNames = ['demo-dessert', 'demo-drink', 'demo-ecommerce', 'demo-food'];
const jobs = [
  ...showcaseNames.flatMap((name) => [
    { source: `images/showcase/${name}.png`, target: `images/showcase/${name}-preview.webp`, width: 540, quality: 70 },
    { source: `images/showcase/${name}.png`, target: `images/showcase/${name}-detail.webp`, width: 1200, quality: 82 },
  ]),
  ...demoNames.map((name) => ({
    source: `images/sticker-prompt-demo/${name}.png`,
    target: `images/sticker-prompt-demo/${name}-preview.webp`,
    width: 820,
    quality: 72,
  })),
  ...productDemoNames.flatMap((name) => [
    { source: `images/product-demo/${name}.png`, target: `images/product-demo/${name}-preview.webp`, width: 640, quality: 76 },
    { source: `images/product-demo/${name}.png`, target: `images/product-demo/${name}-detail.webp`, width: 1360, quality: 84 },
  ]),
];
async function statOrNull(file) {
  try { return await fs.stat(file); }
  catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}
let totalOriginal = 0, totalOptimized = 0, created = 0;
for (const job of jobs) {
  const source = path.join(publicDir, job.source);
  const target = path.join(publicDir, job.target);
  const original = await statOrNull(source);
  if (!original) throw new Error(`[rxv-images] Missing original: ${job.source}`);
  totalOriginal += original.size;
  let optimized = await statOrNull(target);
  if (!optimized || optimized.mtimeMs < original.mtimeMs) {
    await sharp(source, { failOn: 'error' })
      .rotate()
      .resize({ width: job.width, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: job.quality, effort: 5, alphaQuality: 90 })
      .toFile(target);
    optimized = await fs.stat(target);
    created++;
  }
  totalOptimized += optimized.size;
  console.log(`[rxv-images] ${job.target}: ${(optimized.size / 1024).toFixed(1)} KB`);
}
// Create a small, valid ICO with embedded 48px PNG. Replacing the oversized
// public/favicon.ico is important: browsers/bots may request it directly even
// when index.html points to favicon-small.ico.
const primaryIcon = path.join(publicDir, 'icon.png');
const faviconSource = (await statOrNull(primaryIcon))
  ? primaryIcon : path.join(publicDir, 'icons/icon-192.png');
const faviconStat = await statOrNull(faviconSource);
if (!faviconStat) throw new Error('[rxv-images] Missing icon.png/icon-192.png');
const iconTarget = path.join(publicDir, 'favicon-small.ico');
const previousIcon = await statOrNull(iconTarget);
if (!previousIcon || previousIcon.mtimeMs < faviconStat.mtimeMs) {
  const png = await sharp(faviconSource)
    .resize(48, 48, { fit: 'contain', background: '#ffffff' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = 48; header[7] = 48;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  await fs.writeFile(iconTarget, Buffer.concat([header, png]));
  created++;
}
// Keep a one-time local backup of the legacy 1.43MB favicon outside public/.
// Browser requests to /favicon.ico then receive the same small valid ICO.
const legacyIcon = path.join(publicDir, 'favicon.ico');
const currentLegacy = await statOrNull(legacyIcon);
const iconBytes = await fs.readFile(iconTarget);
if (!currentLegacy || currentLegacy.size !== iconBytes.length) {
  if (currentLegacy && currentLegacy.size > 50_000) {
    const backupDir = path.join(root, '.rxv-image-opt-backup');
    await fs.mkdir(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, 'favicon-original.ico');
    if (!await statOrNull(backupFile)) await fs.copyFile(legacyIcon, backupFile);
  }
  await fs.writeFile(legacyIcon, iconBytes);
  created++;
}
const iconSize = iconBytes.length;
console.log(`[rxv-images] ${jobs.length} WebP outputs, ${created} updated; originals ${(totalOriginal / 1048576).toFixed(2)} MiB, previews/details ${(totalOptimized / 1048576).toFixed(2)} MiB; favicon ${(iconSize / 1024).toFixed(1)} KB.`);
