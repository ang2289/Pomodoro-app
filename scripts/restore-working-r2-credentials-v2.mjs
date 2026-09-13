import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const root = process.cwd();
const source = 'D:/0--AI/備份APP/Pomodoro-app/.env.local';
const target = path.join(root, '.env.local');
const backupDir = path.join(root, 'backup', 'r2-credentials-restore');

if (!fs.existsSync(source)) {
  console.error('ERROR: source env file not found: ' + source);
  process.exit(1);
}
if (!fs.existsSync(target)) {
  console.error('ERROR: target env file not found: ' + target);
  process.exit(1);
}

const srcText = fs.readFileSync(source, 'utf8');
const dstText = fs.readFileSync(target, 'utf8');
const src = dotenv.parse(srcText);
const dst = dotenv.parse(dstText);

const keys = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
for (const key of keys) {
  if (!String(src[key] || '').trim()) {
    console.error('ERROR: missing ' + key + ' in source env file');
    process.exit(1);
  }
}

fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `.env.local.${stamp}.bak`);
fs.copyFileSync(target, backupPath);

let out = dstText;
for (const key of keys) {
  const value = src[key].trim();
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
  if (re.test(out)) {
    out = out.replace(re, `${key}=${value}`);
  } else {
    out = out.replace(/\s*$/, '') + `\n${key}=${value}\n`;
  }
}

fs.writeFileSync(target, out, 'utf8');

console.log('OK: restored working R2 credentials into .env.local');
console.log('Updated: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
console.log('Backup: ' + backupPath);
console.log('No app files, catalog files, bucket contents, or admin key were changed.');
console.log('Next: node scripts/diagnose-r2-image-admin.mjs');
