import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'pages', 'ImagePacksPage.tsx');
if (!fs.existsSync(file)) throw new Error('找不到 src/pages/ImagePacksPage.tsx');

const backupDir = path.join(process.cwd(), 'backup', 'professional-packs-v5-contact-fix');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `ImagePacksPage.tsx.${stamp}.bak`);
fs.copyFileSync(file, backup);

let text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const before = text;

// 修正 apply-professional-packs-v5-live-counts.mjs 產生的尾端重複：
// const CONTACT_EMAIL]
// const CONTACT_EMAIL = '...'
text = text.replace(/const CONTACT_EMAIL\]\s*\n\s*const CONTACT_EMAIL/g, 'const CONTACT_EMAIL');

if (text === before) {
  throw new Error('沒有找到 const CONTACT_EMAIL] 重複片段；未修改檔案。');
}

fs.writeFileSync(file, text, 'utf8');
console.log('SUCCESS: ImagePacksPage.tsx 的 CONTACT_EMAIL 語法已修正。');
console.log('備份：' + backup);
console.log('下一步：npm run build');
