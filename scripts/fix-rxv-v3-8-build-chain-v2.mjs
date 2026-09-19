import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const v37 = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-7.mjs');
const v38 = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-8.mjs');
const backupDir = path.join(ROOT, 'backup', 'rxv-video-promoter-v3-8-chain-fix');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

function backup(file) {
  const out = path.join(backupDir, path.basename(file) + '.' + stamp + '.bak');
  fs.copyFileSync(file, out);
  return out;
}

function mustFile(file) {
  if (!fs.existsSync(file)) throw new Error('找不到：' + file);
}

mustFile(v37);
mustFile(v38);
const b37 = backup(v37);
const b38 = backup(v38);

let t37 = fs.readFileSync(v37, 'utf8');
let c37 = 0;

// 修正 v3.7 builder：這段本來會在 builder 執行時誤讀 product 變數。
const badProduct = "$('ctaText').value=\\`${product.count}只要 NT$\\${product.price}\\`";
const goodProduct = "$('ctaText').value=\\`\\${product.count}只要 NT$\\${product.price}\\`";
if (t37.includes(badProduct)) {
  t37 = t37.replace(badProduct, goodProduct);
  c37 += 1;
} else if (!t37.includes(goodProduct)) {
  throw new Error('找不到 v3.7 CTA price runtime template 區塊。');
}

// 修正 v3.7 builder：輸出資訊的 ${...} 必須留給產生後的 HTML 執行，不能在 builder 階段求值。
const infoMarker = "html = html.replace(infoNeedle,\n`";
const infoStart = t37.indexOf(infoMarker);
if (infoStart < 0) throw new Error('找不到 v3.7 info replacement 區塊。');
const bodyStart = infoStart + infoMarker.length;
const bodyEnd = t37.indexOf('`);\n}', bodyStart);
if (bodyEnd < 0) throw new Error('找不到 v3.7 info replacement 結尾。');
let infoBody = t37.slice(bodyStart, bodyEnd);
const escapedBody = infoBody.replace(/(?<!\\)\$\{/g, '\\${');
if (escapedBody !== infoBody) {
  t37 = t37.slice(0, bodyStart) + escapedBody + t37.slice(bodyEnd);
  c37 += 1;
}

fs.writeFileSync(v37, t37, 'utf8');

// v3.8 builder：保留前一版兩個 template literal 修正，且可重複執行。
let t38 = fs.readFileSync(v38, 'utf8');
let c38 = 0;
const fixes38 = [
  [
    "  const response = await fetch(`${CATALOG_URL}${joiner}t=${Date.now()}`, { cache: 'no-store' });",
    "  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });"
  ],
  [
    "  if (!response.ok) throw new Error(`CATALOG_HTTP_${response.status}`);",
    "  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);"
  ]
];
for (const [from, to] of fixes38) {
  if (t38.includes(from)) {
    t38 = t38.replace(from, to);
    c38 += 1;
  } else if (!t38.includes(to)) {
    throw new Error('v3.8 builder 找不到預期修正區塊。');
  }
}
fs.writeFileSync(v38, t38, 'utf8');

console.log('OK: RXV v3.8 建立鏈已修正。');
console.log('v3.7 修正區塊：' + c37);
console.log('v3.8 修正區塊：' + c38);
console.log('v3.7 備份：' + b37);
console.log('v3.8 備份：' + b38);
console.log('下一步：node scripts/build-rxv-small-pack-video-promoter-v3-8.mjs');
