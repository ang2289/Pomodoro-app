import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const target = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-8.mjs');

if (!fs.existsSync(target)) {
  throw new Error(`找不到：${target}`);
}

let text = fs.readFileSync(target, 'utf8');
const backupDir = path.join(ROOT, 'backup', 'rxv-video-promoter-v3-8-builder-fix');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `build-rxv-small-pack-video-promoter-v3-8.mjs.${stamp}.bak`);
fs.copyFileSync(target, backup);

const replacements = [
  {
    from: "  const response = await fetch(`${CATALOG_URL}${joiner}t=${Date.now()}`, { cache: 'no-store' });",
    to: "  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });",
    label: 'catalog fetch template literal',
  },
  {
    from: "  if (!response.ok) throw new Error(`CATALOG_HTTP_${response.status}`);",
    to: "  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);",
    label: 'catalog HTTP error template literal',
  },
];

let changed = 0;
for (const item of replacements) {
  if (text.includes(item.from)) {
    text = text.replace(item.from, item.to);
    changed += 1;
  } else if (!text.includes(item.to)) {
    throw new Error(`找不到要修正的區塊：${item.label}`);
  }
}

fs.writeFileSync(target, text, 'utf8');

console.log('OK: RXV v3.8 builder 語法已修正。');
console.log(`修正區塊：${changed}`);
console.log(`備份：${backup}`);
console.log('下一步：node scripts/build-rxv-small-pack-video-promoter-v3-8.mjs');
