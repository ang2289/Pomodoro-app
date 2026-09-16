import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const v37 = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-7.mjs');
const v38 = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-8.mjs');
const backupDir = path.join(ROOT, 'backup', 'rxv-video-promoter-v3-8-chain-fix-v3');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

function mustFile(file) {
  if (!fs.existsSync(file)) throw new Error('找不到：' + file);
}

function backup(file) {
  const out = path.join(backupDir, path.basename(file) + '.' + stamp + '.bak');
  fs.copyFileSync(file, out);
  return out;
}

mustFile(v37);
mustFile(v38);
const backup37 = backup(v37);
const backup38 = backup(v38);

let t37 = fs.readFileSync(v37, 'utf8');
let fixes37 = 0;

// 1) CTA 模板內的 product.* 是產生後前端執行時才存在，builder 階段不可展開。
for (const expr of ['product.count', 'product.price']) {
  const re = new RegExp('(?<!\\\\)\\$\\{' + expr.replace('.', '\\.') + '\\}', 'g');
  const before = t37;
  t37 = t37.replace(re, () => '\\${' + expr + '}');
  if (t37 !== before) fixes37 += 1;
}

// 2) 輸出資訊區塊中的 data / esc 也是產生後前端執行時才存在。
const infoStartMarker = 'if (html.includes(infoNeedle)) {';
const infoEndMarker = '\n}\n\nfs.writeFileSync';
const infoStart = t37.indexOf(infoStartMarker);
if (infoStart < 0) throw new Error('找不到 v3.7 info 區塊起點。');
const infoEnd = t37.indexOf(infoEndMarker, infoStart);
if (infoEnd < 0) throw new Error('找不到 v3.7 info 區塊終點。');
let infoBlock = t37.slice(infoStart, infoEnd);
const escapedInfoBlock = infoBlock.replace(/(?<!\\)\$\{/g, () => '\\${');
if (escapedInfoBlock !== infoBlock) {
  t37 = t37.slice(0, infoStart) + escapedInfoBlock + t37.slice(infoEnd);
  fixes37 += 1;
}

fs.writeFileSync(v37, t37, 'utf8');

// 3) v3.8 builder 本身的 catalog template literal，改成普通字串串接，避免外層 builder 誤展開。
let t38 = fs.readFileSync(v38, 'utf8');
let fixes38 = 0;
const fixes = [
  [
    "  const response = await fetch(`${CATALOG_URL}${joiner}t=${Date.now()}`, { cache: 'no-store' });",
    "  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });"
  ],
  [
    "  if (!response.ok) throw new Error(`CATALOG_HTTP_${response.status}`);",
    "  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);"
  ]
];
for (const [from, to] of fixes) {
  if (t38.includes(from)) {
    t38 = t38.replace(from, to);
    fixes38 += 1;
  } else if (!t38.includes(to)) {
    throw new Error('v3.8 builder 找不到預期 catalog 修正區塊。');
  }
}
fs.writeFileSync(v38, t38, 'utf8');

console.log('OK: RXV v3.7 -> v3.8 建立鏈 v3 已修正。');
console.log('v3.7 修正項目：' + fixes37);
console.log('v3.8 修正項目：' + fixes38);
console.log('v3.7 備份：' + backup37);
console.log('v3.8 備份：' + backup38);
console.log('下一步：node scripts/build-rxv-small-pack-video-promoter-v3-8.mjs');
