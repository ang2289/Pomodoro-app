import fs from 'fs';
import path from 'path';

const target = path.resolve('src/pages/images/index.tsx');
if (!fs.existsSync(target)) throw new Error(`找不到檔案：${target}`);

const original = fs.readFileSync(target, 'utf8');
const backupDir = path.resolve('backup/image-preview-price-199');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `index.tsx.${stamp}.bak`);
fs.writeFileSync(backup, original, 'utf8');

const replacements = [
  [
    '完整版素材，可預覽；高畫質原圖包含於 NT$399 完整素材庫',
    '完整版素材，可預覽；高畫質原圖包含於 NT$199 完整素材庫',
  ],
  [
    '取得 NT$399 完整素材庫',
    '取得 NT$199 完整素材庫',
  ],
];

let next = original;
let changed = 0;
for (const [from, to] of replacements) {
  if (next.includes(from)) {
    next = next.replace(from, to);
    changed += 1;
  }
}

if (changed !== replacements.length) {
  fs.writeFileSync(target, original, 'utf8');
  throw new Error(`預期修改 ${replacements.length} 處，實際找到 ${changed} 處；已還原，未修改程式。`);
}

fs.writeFileSync(target, next, 'utf8');

console.log('RXV 圖片預覽價格已更新為 NT$199。');
console.log('已修改：');
console.log('1. 預覽說明：NT$399 → NT$199');
console.log('2. 按鈕文字：NT$399 → NT$199');
console.log(`備份：${backup}`);
console.log('未修改付款流程、R2、catalog 或手機 APP。');
console.log('下一步：npm run dev，確認後再 git add / commit / push。');
