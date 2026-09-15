import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const target = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3', 'server.mjs');
if (!fs.existsSync(target)) throw new Error(`找不到：${target}`);

let text = fs.readFileSync(target, 'utf8');
const original = text;

if (!text.includes("import os from 'node:os';")) {
  text = text.replace("import path from 'node:path';\n", "import path from 'node:path';\nimport os from 'node:os';\n");
}

const oldBlock = `const ROOT = process.cwd();\nconst TOOL_DIR = path.resolve(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3');\nconst TEMP_ROOT = path.resolve(TOOL_DIR, '.tmp');\nconst UPLOAD_DIR = path.join(TEMP_ROOT, 'uploads');\nconst JOB_DIR = path.join(TEMP_ROOT, 'jobs');\nconst OUTPUT_DIR = path.resolve(ROOT, 'output', 'rxv-small-pack-video-promoter-v3');`;

const newBlock = `const ROOT = process.cwd();\nconst TOOL_DIR = path.resolve(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3');\nconst PROJECT_DRIVE_ROOT = path.parse(ROOT).root || ROOT;\nconst TEMP_ROOT = path.join(os.tmpdir(), 'rxv-small-pack-video-promoter-v3');\nconst UPLOAD_DIR = path.join(TEMP_ROOT, 'uploads');\nconst JOB_DIR = path.join(TEMP_ROOT, 'jobs');\nconst OUTPUT_DIR = process.env.RXV_PROMO_OUTPUT_DIR\n  ? path.resolve(process.env.RXV_PROMO_OUTPUT_DIR)\n  : path.join(PROJECT_DRIVE_ROOT, 'RXV-短影音輸出');`;

if (!text.includes(oldBlock)) {
  if (text.includes("path.resolve(ROOT, 'output', 'rxv-small-pack-video-promoter-v3')")) {
    throw new Error('找到舊輸出設定，但區塊格式不同；為避免誤改，已停止。');
  }
  if (text.includes("'RXV-短影音輸出'")) {
    console.log('已經是外部輸出版本，不需要再修改。');
    process.exit(0);
  }
  throw new Error('找不到預期的 v3 輸出設定，未修改。');
}

text = text.replace(oldBlock, newBlock);

const backupDir = path.join(ROOT, 'backup', 'rxv-video-promoter-v3-1');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `server.mjs.${stamp}.bak`);
fs.writeFileSync(backup, original, 'utf8');
fs.writeFileSync(target, text, 'utf8');

console.log('RXV 小包短影音推廣器 v3.1 已套用。');
console.log('MP4 輸出已移出專案：D:\\RXV-短影音輸出（依目前專案所在磁碟自動決定）');
console.log('暫存圖片也已移到 Windows TEMP，不會放在 Pomodoro-app。');
console.log(`備份：${backup}`);
console.log('沒有修改正式網站、APP、R2 或 catalog。');