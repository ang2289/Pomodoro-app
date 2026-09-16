import fs from 'node:fs';

const path = 'src/App.tsx';
const target = "'/tools/image-to-video',";

const source = fs.readFileSync(path, 'utf8');
const lines = source.split(/\r?\n/);
const next = lines.filter((line) => line.trim() !== target);

if (next.length === lines.length) {
  console.error('NOT FOUND: maintenance entry was not found.');
  process.exit(1);
}

fs.writeFileSync(path, next.join('\n'), 'utf8');
console.log('OK: image-to-video maintenance entry removed.');
