import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const v35Dir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-5');
const v36Dir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-6');
const v35Server = path.join(v35Dir, 'server.mjs');
const v35Index = path.join(v35Dir, 'index.html');
const v35Builder = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-5.mjs');

async function ensureV35() {
  if (fs.existsSync(v35Server) && fs.existsSync(v35Index)) return;
  if (!fs.existsSync(v35Builder)) {
    throw new Error('找不到 v3.5 工具，也找不到 v3.5 建立腳本。請先取得 scripts/build-rxv-small-pack-video-promoter-v3-5.mjs');
  }
  console.log('尚未找到 v3.5，本腳本先自動建立 v3.5...');
  await import(`${pathToFileURL(v35Builder).href}?run=${Date.now()}`);
  if (!fs.existsSync(v35Server) || !fs.existsSync(v35Index)) {
    throw new Error('自動建立 v3.5 後仍找不到工具本體，已停止。');
  }
}

await ensureV35();
fs.mkdirSync(v36Dir, { recursive: true });

let server = fs.readFileSync(v35Server, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(v35Index, 'utf8').replace(/\r\n/g, '\n');

server = server
  .replaceAll('rxv-small-pack-video-promoter-v3-5', 'rxv-small-pack-video-promoter-v3-6')
  .replaceAll('v3.5', 'v3.6');
html = html.replaceAll('v3.5', 'v3.6');

if (!server.includes("import QRCode from 'qrcode';")) {
  server = server.replace("import sharp from 'sharp';\n", "import sharp from 'sharp';\nimport QRCode from 'qrcode';\n");
}

const ctaStart = server.indexOf('async function makeCtaFrame(');
const ctaEndMarker = '\nfunction ffmpegConcatPath(filePath) {';
const ctaEnd = server.indexOf(ctaEndMarker, ctaStart);
if (ctaStart < 0 || ctaEnd < 0) {
  throw new Error('找不到 v3.5 CTA 函式區塊，停止避免誤改。');
}

const newCtaBlock = `function normalizeQrUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\\/\\//i.test(raw)) return raw;
  return \`https://\${raw}\`;
}

async function makeCtaFrame(backgroundPath, outputPath, product, ctaUrl, lineId, qrOptions = {}) {
  const {
    enableQr = true,
    qrUrl = '',
    qrPosition = 'center',
    ctaText = '掃碼立即查看',
  } = qrOptions;

  const bg = await sharp(backgroundPath).rotate()
    .resize(1080, 1920, { fit: 'cover' })
    .blur(22)
    .modulate({ brightness: 0.38, saturation: 0.85 })
    .png().toBuffer();

  const finalQrUrl = normalizeQrUrl(qrUrl || ctaUrl || 'pomodoro-app-eight-rouge.vercel.app/images');
  const urlLines = wrapText(finalQrUrl.replace(/^https?:\\/\\//i, ''), 31);
  const lineLines = wrapText(\`LINE：\${lineId || 'ang22899'}\`, 24);
  const qrSize = 300;
  const qrX = qrPosition === 'left' ? 120 : qrPosition === 'right' ? 660 : 390;
  const qrY = 1020;

  let qrBuffer = null;
  if (enableQr && finalQrUrl) {
    qrBuffer = await QRCode.toBuffer(finalQrUrl, {
      type: 'png',
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    });
  }

  const qrPanel = qrBuffer
    ? \`<rect x="\${qrX - 18}" y="\${qrY - 18}" width="\${qrSize + 36}" height="\${qrSize + 36}" rx="24" fill="#ffffff"/>\`
    : '';

  const overlay = Buffer.from(\`
  <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <rect x="70" y="190" width="940" height="1540" rx="64" fill="#000000" fill-opacity="0.74"/>
    <text x="540" y="430" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="68" font-weight="900" fill="#ffffff">\${escapeXml(product.count)} \${escapeXml(product.short)}常用圖片</text>
    <text x="540" y="585" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="94" font-weight="900" fill="#fbbf24">NT$\${product.price}</text>
    <text x="540" y="715" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="50" font-weight="800" fill="#ffffff">不用每天重新找圖</text>
    <rect x="205" y="790" width="670" height="135" rx="68" fill="#059669"/>
    <text x="540" y="877" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="48" font-weight="900" fill="#ffffff">\${escapeXml(ctaText || '掃碼立即查看')}</text>
    \${qrPanel}
    \${enableQr ? renderTextLines(urlLines, 1415, 31, 44) : renderTextLines(urlLines, 1170, 36, 48)}
    \${renderTextLines(lineLines, 1560, 42, 56)}
    <text x="540" y="1660" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="32" font-weight="700" fill="#fef3c7">RXV 圖片素材</text>
  </svg>\`, 'utf8');

  const composites = [{ input: overlay, left: 0, top: 0 }];
  if (qrBuffer) composites.push({ input: qrBuffer, left: qrX, top: qrY });
  await sharp(bg).composite(composites).png().toFile(outputPath);

  return { finalQrUrl, qrPosition, hasQr: Boolean(qrBuffer) };
}
`;
server = server.slice(0, ctaStart) + newCtaBlock + server.slice(ctaEnd);

const lineIdNeedle = "    const lineId = String(req.body.lineId || 'ang22899').trim();";
if (!server.includes(lineIdNeedle)) throw new Error('找不到 v3.5 LINE ID 設定區塊。');
server = server.replace(lineIdNeedle, `${lineIdNeedle}\n    const enableQr = String(req.body.enableQr || '1') !== '0';\n    const qrUrl = String(req.body.qrUrl || ctaUrl || '').trim();\n    const qrPosition = ['left', 'center', 'right'].includes(String(req.body.qrPosition || '')) ? String(req.body.qrPosition) : 'center';\n    const ctaText = String(req.body.ctaText || '掃碼立即查看').trim().slice(0, 20);`);

const oldCtaCall = "      await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId);";
if (!server.includes(oldCtaCall)) throw new Error('找不到 v3.5 CTA 產生呼叫。');
server = server.replace(oldCtaCall, `      const ctaResult = await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId, { enableQr, qrUrl, qrPosition, ctaText });\n      req._rxvCtaResult = ctaResult;`);

const responseNeedle = '      displayMode, fullCount, containCount, enableCta, ctaUrl, lineId, ctaSeconds,';
if (!server.includes(responseNeedle)) throw new Error('找不到 v3.5 回傳 CTA 欄位。');
server = server.replace(responseNeedle, `      displayMode, fullCount, containCount, enableCta, ctaUrl, lineId, ctaSeconds,\n      enableQr, qrUrl: req._rxvCtaResult?.finalQrUrl || normalizeQrUrl(qrUrl), qrPosition, ctaText,`);

html = html.replace(
  '廣告節奏強化｜每張用途不同｜最後 2 秒成交 CTA｜智慧滿版｜MP3＋音量',
  'QR 成交版｜最後 2 秒自動 QR Code｜CTA｜智慧滿版｜MP3＋音量'
);

const noticeNeedle = '  <div class="notice" style="margin-top:12px">請只使用你有權使用的 MP3。工具不會自動抓網路音樂，也不會把 MP3 複製進專案。</div>';
if (!html.includes(noticeNeedle)) throw new Error('找不到 v3.5 MP3 提示區塊。');
const qrUi = `  <div class="grid g4" style="margin-top:14px">
    <div><label class="label">QR Code</label><label class="row" style="padding:10px 0"><input id="enableQr" type="checkbox" checked style="width:auto" /> 最後 CTA 顯示 QR Code</label><div class="muted">取消勾選就只顯示網址與 LINE。</div></div>
    <div><label class="label">QR Code 網址</label><input id="qrUrl" value="https://pomodoro-app-eight-rouge.vercel.app/images" /><div class="muted">可改成商品頁、LINE 加好友或其他網址。</div></div>
    <div><label class="label">QR 位置</label><select id="qrPosition"><option value="center" selected>下方中央</option><option value="right">右下</option><option value="left">左下</option></select></div>
    <div><label class="label">CTA 文字</label><input id="ctaText" value="掃碼立即查看" maxlength="20" /></div>
  </div>
  <div class="good" style="margin-top:10px">QR Code 使用專案既有 qrcode 套件在本機產生，不使用外部 API，也不會把 QR 圖檔存進專案。</div>
`;
html = html.replace(noticeNeedle, qrUi + noticeNeedle);

const postNeedle = "fd.append('lineId',$('lineId').value.trim());";
if (!html.includes(postNeedle)) throw new Error('找不到 v3.5 前端 LINE 傳送欄位。');
html = html.replace(postNeedle, `${postNeedle}fd.append('enableQr',$('enableQr').checked?'1':'0');fd.append('qrUrl',$('qrUrl').value.trim());fd.append('qrPosition',$('qrPosition').value);fd.append('ctaText',$('ctaText').value.trim());`);

const infoNeedle = "<br>成交 CTA：${data.enableCta?'最後 2 秒':'關閉'}<br>LINE：${esc(data.lineId||'')}<br>輸出：${esc(data.outputDir)}";
if (!html.includes(infoNeedle)) throw new Error('找不到 v3.5 輸出資訊區塊。');
const infoReplacement = "<br>成交 CTA：${data.enableCta?'最後 2 秒':'關閉'}<br>QR Code：${data.enableQr?'開啟':'關閉'}<br>QR 網址：${esc(data.qrUrl||'')}<br>QR 位置：${esc(data.qrPosition||'')}<br>LINE：${esc(data.lineId||'')}<br>輸出：${esc(data.outputDir)}";
html = html.replace(infoNeedle, infoReplacement);

fs.writeFileSync(path.join(v36Dir, 'server.mjs'), server, 'utf8');
fs.writeFileSync(path.join(v36Dir, 'index.html'), html, 'utf8');

const cmd = `@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\ntitle RXV 小包短影音推廣器 v3.6\r\n\r\nif not exist "node_modules" (\r\n  echo 找不到 node_modules，請先執行 npm install\r\n  pause\r\n  exit /b 1\r\n)\r\n\r\necho 啟動 RXV 小包短影音推廣器 v3.6...\r\nnode "tools\\rxv-small-pack-video-promoter-v3-6\\server.mjs"\r\npause\r\n`;
fs.writeFileSync(path.join(ROOT, 'RXV-小包短影音推廣器-v3.6.cmd'), cmd, 'utf8');

console.log('RXV 小包短影音推廣器 v3.6 已建立。');
console.log('新增：最後 2 秒 QR Code、QR 網址、QR 位置、CTA 文字。');
console.log('保留：智慧滿版、不同用途文案、MP3 背景音樂、音量、淡入淡出、LINE ID。');
console.log('QR Code 完全本機產生，不使用外部 API。');
console.log('MP4 仍輸出到 D:\\RXV-短影音輸出。');
console.log('下一步：& ".\\RXV-小包短影音推廣器-v3.6.cmd"');
