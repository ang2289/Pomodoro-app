import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const target = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-6.mjs');
if (!fs.existsSync(target)) throw new Error(`找不到：${target}`);

let text = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');

const start = text.indexOf('const infoNeedle = ');
const end = text.indexOf('\n\nfs.writeFileSync(path.join(v36Dir, \'server.mjs\')', start);
if (start < 0 || end < 0) throw new Error('找不到 v3.6 輸出資訊修改區塊，未修改。');

const fixed = `const infoNeedle = "<br>成交 CTA：\${data.enableCta?'最後 2 秒':'關閉'}<br>LINE：\${esc(data.lineId||'')}<br>輸出：\${esc(data.outputDir)}";
if (!html.includes(infoNeedle)) throw new Error('找不到 v3.5 輸出資訊區塊。');
const infoReplacement = "<br>成交 CTA：\${data.enableCta?'最後 2 秒':'關閉'}<br>QR Code：\${data.enableQr?'開啟':'關閉'}<br>QR 網址：\${esc(data.qrUrl||'')}<br>QR 位置：\${esc(data.qrPosition||'')}<br>LINE：\${esc(data.lineId||'')}<br>輸出：\${esc(data.outputDir)}";
html = html.replace(infoNeedle, infoReplacement);`;

text = text.slice(0, start) + fixed + text.slice(end);
fs.writeFileSync(target, text, 'utf8');
console.log('OK: v3.6 builder 已修正 data is not defined 問題。');
console.log('下一步：node scripts/build-rxv-small-pack-video-promoter-v3-6.mjs');
