import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const srcDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-4');
const dstDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-5');
const srcServer = path.join(srcDir, 'server.mjs');
const srcIndex = path.join(srcDir, 'index.html');

if (!fs.existsSync(srcServer) || !fs.existsSync(srcIndex)) {
  throw new Error('找不到 v3.4 工具本體，請先確認 tools/rxv-small-pack-video-promoter-v3-4 已存在。');
}

fs.mkdirSync(dstDir, { recursive: true });
let server = fs.readFileSync(srcServer, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(srcIndex, 'utf8').replace(/\r\n/g, '\n');

server = server
  .replaceAll('rxv-small-pack-video-promoter-v3-4', 'rxv-small-pack-video-promoter-v3-5')
  .replaceAll('v3.4', 'v3.5')
  .replace(
`  realEstate: {
    short: '房仲', name: 'RXV 房仲帶看宣傳圖片包', count: '83 張', price: 99,
    pain: '每天發房仲貼文，還在花時間找圖？',
    uses: ['帶看宣傳', '賀成交', '交屋紀錄', '社區公設', '生活機能', '房仲社群貼文'],
  },`,
`  realEstate: {
    short: '房仲', name: 'RXV 房仲帶看宣傳圖片包', count: '83 張', price: 99,
    pain: '每天發房仲貼文，還在花時間找圖？',
    uses: ['帶看宣傳', '賀成交', '交屋紀錄', '社區公設', '生活機能', '房仲社群貼文'],
    benefits: ['帶看宣傳更省時間', '成交賀圖快速完成', '交屋貼文直接套用', '社區特色更好呈現', '生活機能貼文不缺圖', '社群經營每天都有素材'],
  },`)
  .replace(
`  hair: {
    short: '美髮', name: 'RXV 美髮沙龍職業圖片包', count: '多場景', price: 99,
    pain: '每天發美髮貼文，還在到處找圖片？',
    uses: ['剪髮', '染燙', '洗護', '髮型諮詢', '完成造型', '預約宣傳', '沙龍日常'],
  },`,
`  hair: {
    short: '美髮', name: 'RXV 美髮沙龍職業圖片包', count: '多場景', price: 99,
    pain: '每天發美髮貼文，還在到處找圖片？',
    uses: ['剪髮', '染燙', '洗護', '髮型諮詢', '完成造型', '預約宣傳', '沙龍日常'],
    benefits: ['剪髮作品快速發文', '染燙服務更有質感', '洗護內容不用再找圖', '諮詢情境直接套用', '完成造型展示更方便', '預約宣傳快速完成', '沙龍日常持續有素材'],
  },`);

const oldFrame = `function getFrameCopy(product, template, index, total) {
  const last = index === total - 1;
  if (template === 'price') {
    if (index === 0) return { top: \`NT$\${product.price}\`, bottom: \`\${product.name}｜一次整理好\` };
    if (last) return { top: '不用每天重新找素材', bottom: \`\${product.count}｜NT$\${product.price}｜RXV 圖片包\` };
    return { top: product.uses[(index - 1) % product.uses.length], bottom: \`\${product.short}常用情境圖\` };
  }
  if (template === 'showcase') {
    if (index === 0) return { top: \`\${product.short}常用情境一次看\`, bottom: \`\${product.count} 圖片包\` };
    if (last) return { top: product.name, bottom: \`NT$\${product.price}｜省下每天找圖時間\` };
    return { top: product.uses[(index - 1) % product.uses.length], bottom: '直接拿來做社群貼文與宣傳' };
  }
  if (index === 0) return { top: product.pain, bottom: '別再每天重新找素材' };
  if (last) return { top: \`\${product.count} \${product.short}常用圖片\`, bottom: \`NT$\${product.price}｜一次整理好\` };
  return { top: product.uses[(index - 1) % product.uses.length], bottom: \`\${product.short}日常宣傳情境\` };
}`;

const newFrame = `function getFrameCopy(product, template, index, total) {
  const useIndex = Math.max(0, index - 1) % product.uses.length;
  const use = product.uses[useIndex];
  const benefit = product.benefits?.[useIndex % product.benefits.length] || '直接拿來做社群貼文與宣傳';
  if (index === 0) {
    if (template === 'price') return { top: \`NT$\${product.price}\`, bottom: \`\${product.name}｜一次整理好\` };
    if (template === 'showcase') return { top: \`\${product.short}常用情境一次看\`, bottom: \`\${product.count} 圖片包\` };
    return { top: product.pain, bottom: '別再每天重新找素材' };
  }
  if (template === 'price') return { top: use, bottom: \`\${benefit}｜NT$\${product.price}\` };
  if (template === 'showcase') return { top: use, bottom: benefit };
  return { top: use, bottom: benefit };
}`;
if (!server.includes(oldFrame)) throw new Error('找不到 v3.4 getFrameCopy 區塊，停止避免誤改。');
server = server.replace(oldFrame, newFrame);

const marker = `function ffmpegConcatPath(filePath) {`;
const ctaFn = `async function makeCtaFrame(backgroundPath, outputPath, product, ctaUrl, lineId) {
  const bg = await sharp(backgroundPath).rotate()
    .resize(1080, 1920, { fit: 'cover' })
    .blur(22)
    .modulate({ brightness: 0.38, saturation: 0.85 })
    .png().toBuffer();
  const urlLines = wrapText(ctaUrl || 'pomodoro-app-eight-rouge.vercel.app/image-packs', 30);
  const lineLines = wrapText(\`LINE：\${lineId || 'ang22899'}\`, 24);
  const overlay = Buffer.from(\`
  <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <rect x="70" y="230" width="940" height="1460" rx="64" fill="#000000" fill-opacity="0.72"/>
    <text x="540" y="500" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="72" font-weight="900" fill="#ffffff">\${escapeXml(product.count)} \${escapeXml(product.short)}常用圖片</text>
    <text x="540" y="650" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="92" font-weight="900" fill="#fbbf24">NT$\${product.price}</text>
    <text x="540" y="790" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="52" font-weight="800" fill="#ffffff">不用每天重新找圖</text>
    <rect x="210" y="900" width="660" height="150" rx="75" fill="#059669"/>
    <text x="540" y="995" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="54" font-weight="900" fill="#ffffff">查看完整圖片包</text>
    \${renderTextLines(urlLines, 1190, 34, 48)}
    \${renderTextLines(lineLines, 1435, 46, 60)}
    <text x="540" y="1580" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="34" font-weight="700" fill="#fef3c7">RXV 圖片素材</text>
  </svg>\`, 'utf8');
  await sharp(bg).composite([{ input: overlay, left: 0, top: 0 }]).png().toFile(outputPath);
}

`;
if (!server.includes(marker)) throw new Error('找不到 ffmpegConcatPath 標記。');
server = server.replace(marker, ctaFn + marker);

server = server.replace(
`    const fadeMusic = String(req.body.fadeMusic || '1') !== '0';`,
`    const fadeMusic = String(req.body.fadeMusic || '1') !== '0';
    const enableCta = String(req.body.enableCta || '1') !== '0';
    const ctaUrl = String(req.body.ctaUrl || 'pomodoro-app-eight-rouge.vercel.app/image-packs').trim();
    const lineId = String(req.body.lineId || 'ang22899').trim();
    const ctaSeconds = enableCta ? 2 : 0;`);

const oldConcat = `    const frameDuration = totalSeconds / frameFiles.length;
    const concatLines = [];
    for (const frame of frameFiles) {
      concatLines.push(\`file '\${ffmpegConcatPath(frame)}'\`);
      concatLines.push(\`duration \${frameDuration.toFixed(3)}\`);
    }
    concatLines.push(\`file '\${ffmpegConcatPath(frameFiles[frameFiles.length - 1])}'\`);`;
const newConcat = `    let ctaFrame = '';
    if (enableCta) {
      ctaFrame = path.join(jobPath, 'frame-cta.png');
      await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId);
    }
    const contentSeconds = Math.max(1, totalSeconds - ctaSeconds);
    const frameDuration = contentSeconds / frameFiles.length;
    const concatLines = [];
    for (const frame of frameFiles) {
      concatLines.push(\`file '\${ffmpegConcatPath(frame)}'\`);
      concatLines.push(\`duration \${frameDuration.toFixed(3)}\`);
    }
    if (ctaFrame) {
      concatLines.push(\`file '\${ffmpegConcatPath(ctaFrame)}'\`);
      concatLines.push(\`duration \${ctaSeconds.toFixed(3)}\`);
      concatLines.push(\`file '\${ffmpegConcatPath(ctaFrame)}'\`);
    } else {
      concatLines.push(\`file '\${ffmpegConcatPath(frameFiles[frameFiles.length - 1])}'\`);
    }`;
if (!server.includes(oldConcat)) throw new Error('找不到 v3.4 concat 區塊。');
server = server.replace(oldConcat, newConcat);

server = server.replace(
`      displayMode, fullCount, containCount,`,
`      displayMode, fullCount, containCount, enableCta, ctaUrl, lineId, ctaSeconds,`);

html = html
  .replaceAll('v3.4', 'v3.5')
  .replace('智慧滿版｜9:16 直式圖自動滿版｜橫圖完整顯示｜可選 MP3＋調音量', '廣告節奏強化｜每張用途不同｜最後 2 秒成交 CTA｜智慧滿版｜MP3＋音量')
  .replace(
`  <div class="notice" style="margin-top:12px">請只使用你有權使用的 MP3。工具不會自動抓網路音樂，也不會把 MP3 複製進專案。</div>`,
`  <div class="grid g3" style="margin-top:14px">
    <div><label class="label">成交 CTA</label><label class="row" style="padding:10px 0"><input id="enableCta" type="checkbox" checked style="width:auto" /> 最後 2 秒加入成交畫面</label><div class="muted">固定顯示商品數量、NT$99、查看完整圖片包。</div></div>
    <div><label class="label">CTA 網址</label><input id="ctaUrl" value="pomodoro-app-eight-rouge.vercel.app/image-packs" /></div>
    <div><label class="label">LINE ID</label><input id="lineId" value="ang22899" /></div>
  </div>
  <div class="notice" style="margin-top:12px">請只使用你有權使用的 MP3。工具不會自動抓網路音樂，也不會把 MP3 複製進專案。</div>`);

html = html.replace(
`fd.append('fadeMusic',$('fadeMusic').checked?'1':'0');`,
`fd.append('fadeMusic',$('fadeMusic').checked?'1':'0');fd.append('enableCta',$('enableCta').checked?'1':'0');fd.append('ctaUrl',$('ctaUrl').value.trim());fd.append('lineId',$('lineId').value.trim());`);

html = html.replace(
`<br>輸出：\${esc(data.outputDir)}`,
`<br>成交 CTA：\${data.enableCta?'最後 2 秒':'關閉'}<br>LINE：\${esc(data.lineId||'')}<br>輸出：\${esc(data.outputDir)}`);

fs.writeFileSync(path.join(dstDir, 'server.mjs'), server, 'utf8');
fs.writeFileSync(path.join(dstDir, 'index.html'), html, 'utf8');

const cmd = `@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\ntitle RXV 小包短影音推廣器 v3.5\r\n\r\nif not exist "node_modules" (\r\n  echo 找不到 node_modules，請先執行 npm install\r\n  pause\r\n  exit /b 1\r\n)\r\n\r\necho 啟動 RXV 小包短影音推廣器 v3.5...\r\nnode "tools\\rxv-small-pack-video-promoter-v3-5\\server.mjs"\r\npause\r\n`;
fs.writeFileSync(path.join(ROOT, 'RXV-小包短影音推廣器-v3.5.cmd'), cmd, 'utf8');

console.log('RXV 小包短影音推廣器 v3.5 已建立。');
console.log('新增：每張圖片不同用途文案、最後 2 秒成交 CTA、網址與 LINE ID。');
console.log('保留：智慧滿版、MP3 背景音樂、音量調整、淡入淡出。');
console.log('輸出仍在 D:\\RXV-短影音輸出。');
console.log('下一步：& ".\\RXV-小包短影音推廣器-v3.5.cmd"');
