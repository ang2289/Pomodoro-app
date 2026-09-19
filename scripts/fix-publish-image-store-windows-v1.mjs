import fs from 'fs';
import path from 'path';

const target = path.resolve('scripts/publish-image-store-main-v1.mjs');
if (!fs.existsSync(target)) throw new Error(`File not found: ${target}`);

const original = fs.readFileSync(target, 'utf8');
const backup = `${target}.before-windows-fix.bak`;

const oldLine = "  run('npm.cmd', ['run', 'build'], releaseDir);";
const newLine = "  run('cmd.exe', ['/d', '/s', '/c', 'npm run build'], releaseDir);";

if (original.includes(newLine)) {
  console.log('Windows build fix is already applied.');
  process.exit(0);
}

if (!original.includes(oldLine)) {
  throw new Error('Expected npm.cmd build line was not found. No file was changed.');
}

fs.writeFileSync(backup, original, 'utf8');
fs.writeFileSync(target, original.replace(oldLine, newLine), 'utf8');

console.log('OK: Windows build launcher fix applied.');
console.log('Changed only the temporary publish script build command.');
console.log(`Backup: ${backup}`);
console.log('Next: node scripts/publish-image-store-main-v1.mjs');
