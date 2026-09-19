import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const target = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3', 'server.mjs');
if (!fs.existsSync(target)) throw new Error(`找不到：${target}`);

const original = fs.readFileSync(target, 'utf8');
const hadCRLF = original.includes('\r\n');
let text = original.replace(/\r\n/g, '\n');

if (text.includes("'RXV-短影音輸出'") && text.includes('os.tmpdir()')) {
  console.log('已經是 v3.1 外部輸出版本，不需要再修改。');
  console.log('MP4：專案所在磁碟根目錄\\RXV-短影音輸出');
  console.log('暫存：Windows TEMP');
  process.exit(0);
}

if (!text.includes("import os from 'node:os';")) {
  const anchor = "import path from 'node:path';\n";
  if (!text.includes(anchor)) throw new Error('找不到 path import，未修改。');
  text = text.replace(anchor, anchor + "import os from 'node:os';\n");
}

const outputLine = "const OUTPUT_DIR = path.resolve(ROOT, 'output', 'rxv-small-pack-video-promoter-v3');";
const tempLine = "const TEMP_ROOT = path.resolve(TOOL_DIR, '.tmp');";

if (!text.includes(outputLine)) {
  throw new Error('找不到原本 OUTPUT_DIR 設定，未修改。');
}
if (!text.includes(tempLine)) {
  throw new Error('找不到原本 TEMP_ROOT 設定，未修改。');
}

text = text.replace(
  tempLine,
  "const PROJECT_DRIVE_ROOT = path.parse(ROOT).root || ROOT;\nconst TEMP_ROOT = path.join(os.tmpdir(), 'rxv-small-pack-video-promoter-v3');"
);

text = text.replace(
  outputLine,
  "const OUTPUT_DIR = process.env.RXV_PROMO_OUTPUT_DIR\n  ? path.resolve(process.env.RXV_PROMO_OUTPUT_DIR)\n  : path.join(PROJECT_DRIVE_ROOT, 'RXV-短影音輸出');"
);

const backupDir = path.join(ROOT, 'backup', 'rxv-video-promoter-v3-2');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `server.mjs.${stamp}.bak`);
fs.writeFileSync(backup, original, 'utf8');

if (hadCRLF) text = text.replace(/\n/g, '\r\n');
fs.writeFileSync(target, text, 'utf8');

console.log('RXV 小包短影音推廣器 v3.2 已套用。');
console.log('MP4 輸出已移出專案：D:\\RXV-短影音輸出（依目前專案所在磁碟自動決定）');
console.log('暫存圖片已移到 Windows TEMP。');
console.log(`備份：${backup}`);
console.log('沒有修改正式網站、APP、R2 或 catalog。');