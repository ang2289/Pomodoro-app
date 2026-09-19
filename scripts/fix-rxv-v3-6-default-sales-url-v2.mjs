import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const builder = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-6.mjs');
const generatedHtml = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-6', 'index.html');
const generatedServer = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-6', 'server.mjs');

const OLD_ABS = 'https://pomodoro-app-eight-rouge.vercel.app/image-packs';
const NEW_ABS = 'https://pomodoro-app-eight-rouge.vercel.app/images';
const OLD_HOST = 'pomodoro-app-eight-rouge.vercel.app/image-packs';
const NEW_HOST = 'pomodoro-app-eight-rouge.vercel.app/images';

function patchFile(file) {
  if (!fs.existsSync(file)) return false;
  const original = fs.readFileSync(file, 'utf8');
  let next = original
    .replaceAll(OLD_ABS, NEW_ABS)
    .replaceAll(OLD_HOST, NEW_HOST);
  if (next === original) return false;
  const backupDir = path.join(ROOT, 'backup', 'rxv-video-promoter-v3-6-url');
  fs.mkdirSync(backupDir, { recursive: true });
  const safeName = path.basename(file) + '.' + new Date().toISOString().replace(/[:.]/g, '-') + '.bak';
  fs.writeFileSync(path.join(backupDir, safeName), original, 'utf8');
  fs.writeFileSync(file, next, 'utf8');
  return true;
}

const changed = [];
if (patchFile(builder)) changed.push(builder);
if (patchFile(generatedHtml)) changed.push(generatedHtml);
if (patchFile(generatedServer)) changed.push(generatedServer);

console.log('OK: v3.6 預設購買網址已改為全部圖片頁。');
console.log('CTA / QR 預設網址：' + NEW_ABS);
console.log('已修改檔案：' + (changed.length ? changed.length : 0));
console.log('沒有修改 APP、R2、catalog 或正式網站程式。');
console.log('下一步：重新執行 v3.6 builder，再啟動工具。');
