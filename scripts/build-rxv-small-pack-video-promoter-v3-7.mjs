import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const srcDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-6');
const dstDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-7');
const srcServer = path.join(srcDir, 'server.mjs');
const srcIndex = path.join(srcDir, 'index.html');

if (!fs.existsSync(srcServer) || !fs.existsSync(srcIndex)) {
  throw new Error('找不到 v3.6 工具本體。請先確認 RXV 小包短影音推廣器 v3.6 已成功建立。');
}

fs.mkdirSync(dstDir, { recursive: true });
let server = fs.readFileSync(srcServer, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(srcIndex, 'utf8').replace(/\r\n/g, '\n');

server = server
  .replaceAll('rxv-small-pack-video-promoter-v3-6', 'rxv-small-pack-video-promoter-v3-7')
  .replaceAll('v3.6', 'v3.7');
html = html.replaceAll('v3.6', 'v3.7');

// 1) CTA 停留時間：2 / 3 / 4 秒，預設 3 秒
const oldCtaSeconds = "    const ctaSeconds = enableCta ? 2 : 0;";
if (!server.includes(oldCtaSeconds)) throw new Error('找不到 v3.6 CTA 秒數設定。');
server = server.replace(oldCtaSeconds,
`    const requestedCtaSeconds = Math.max(2, Math.min(4, Number(req.body.ctaSeconds || 3)));
    const ctaSeconds = enableCta ? requestedCtaSeconds : 0;`);

// 2) QR 大小可調，預設 340px
const qrDestructureNeedle = "    ctaText = '掃碼立即查看',\n  } = qrOptions;";
if (!server.includes(qrDestructureNeedle)) throw new Error('找不到 v3.6 QR options 區塊。');
server = server.replace(qrDestructureNeedle,
`    ctaText = '掃碼立即查看',
    qrSize = 340,
  } = qrOptions;`);

const oldQrSize = '  const qrSize = 300;';
if (!server.includes(oldQrSize)) throw new Error('找不到 v3.6 QR 尺寸設定。');
server = server.replace(oldQrSize,
`  const qrPixelSize = Math.max(260, Math.min(420, Number(qrSize || 340)));`);
server = server
  .replace("  const qrX = qrPosition === 'left' ? 120 : qrPosition === 'right' ? 660 : 390;",
`  const qrX = qrPosition === 'left'
    ? 120
    : qrPosition === 'right'
      ? 1080 - 120 - qrPixelSize
      : Math.round((1080 - qrPixelSize) / 2);`)
  .replace("      width: qrSize,", "      width: qrPixelSize,")
  .replace('width="${qrSize + 36}" height="${qrSize + 36}"', 'width="${qrPixelSize + 36}" height="${qrPixelSize + 36}"');

const ctaTextParse = "    const ctaText = String(req.body.ctaText || '掃碼立即查看').trim().slice(0, 20);";
if (!server.includes(ctaTextParse)) throw new Error('找不到 v3.6 CTA 文字設定。');
server = server.replace(ctaTextParse,
`${ctaTextParse}
    const qrSize = [300, 340, 380].includes(Number(req.body.qrSize)) ? Number(req.body.qrSize) : 340;
    const transition = String(req.body.transition || '1') !== '0';`);

const oldCtaCall = '      const ctaResult = await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId, { enableQr, qrUrl, qrPosition, ctaText });';
if (!server.includes(oldCtaCall)) throw new Error('找不到 v3.6 CTA 呼叫。');
server = server.replace(oldCtaCall,
`      const ctaResult = await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId, { enableQr, qrUrl, qrPosition, ctaText, qrSize });`);

// 3) 輕柔轉場：使用 3 張中間混合影格，不需要改用複雜 xfade
const helperMarker = 'function ffmpegConcatPath(filePath) {';
if (!server.includes(helperMarker)) throw new Error('找不到 ffmpegConcatPath 標記。');
const blendHelper = `async function makeBlendFrame(firstPath, secondPath, outputPath, alpha) {
  const overlay = await sharp(secondPath)
    .removeAlpha()
    .ensureAlpha(Math.max(0, Math.min(1, alpha)))
    .png()
    .toBuffer();
  await sharp(firstPath)
    .composite([{ input: overlay, left: 0, top: 0, blend: 'over' }])
    .png()
    .toFile(outputPath);
}

`;
server = server.replace(helperMarker, blendHelper + helperMarker);

const concatStart = server.indexOf("    let ctaFrame = '';");
const concatEnd = server.indexOf("    const concatFile = path.join(jobPath, 'frames.txt');", concatStart);
if (concatStart < 0 || concatEnd < 0) throw new Error('找不到 v3.6 影片串接區塊。');
const oldConcatBlock = server.slice(concatStart, concatEnd);
const newConcatBlock = `    let ctaFrame = '';
    if (enableCta) {
      ctaFrame = path.join(jobPath, 'frame-cta.png');
      const ctaResult = await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId, { enableQr, qrUrl, qrPosition, ctaText, qrSize });
      req._rxvCtaResult = ctaResult;
    }

    const contentSeconds = Math.max(1, totalSeconds - ctaSeconds);
    const transitionSteps = transition ? 3 : 0;
    const transitionStepSeconds = transition ? 0.06 : 0;
    const transitionTotal = Math.max(0, frameFiles.length - 1) * transitionSteps * transitionStepSeconds;
    const frameDuration = Math.max(0.16, (contentSeconds - transitionTotal) / frameFiles.length);
    const concatLines = [];

    for (let i = 0; i < frameFiles.length; i += 1) {
      concatLines.push(\`file '\${ffmpegConcatPath(frameFiles[i])}'\`);
      concatLines.push(\`duration \${frameDuration.toFixed(3)}\`);

      if (transition && i < frameFiles.length - 1) {
        for (let step = 1; step <= transitionSteps; step += 1) {
          const alpha = step / (transitionSteps + 1);
          const blendPath = path.join(jobPath, \`blend-\${String(i + 1).padStart(2, '0')}-\${step}.png\`);
          await makeBlendFrame(frameFiles[i], frameFiles[i + 1], blendPath, alpha);
          concatLines.push(\`file '\${ffmpegConcatPath(blendPath)}'\`);
          concatLines.push(\`duration \${transitionStepSeconds.toFixed(3)}\`);
        }
      }
    }

    if (ctaFrame) {
      concatLines.push(\`file '\${ffmpegConcatPath(ctaFrame)}'\`);
      concatLines.push(\`duration \${ctaSeconds.toFixed(3)}\`);
      concatLines.push(\`file '\${ffmpegConcatPath(ctaFrame)}'\`);
    } else {
      concatLines.push(\`file '\${ffmpegConcatPath(frameFiles[frameFiles.length - 1])}'\`);
    }
`;
server = server.slice(0, concatStart) + newConcatBlock + server.slice(concatEnd);

// 回傳新增設定
const responseNeedle = '      enableQr, qrUrl: req._rxvCtaResult?.finalQrUrl || normalizeQrUrl(qrUrl), qrPosition, ctaText,';
if (!server.includes(responseNeedle)) throw new Error('找不到 v3.6 QR 回傳欄位。');
server = server.replace(responseNeedle,
`      enableQr, qrUrl: req._rxvCtaResult?.finalQrUrl || normalizeQrUrl(qrUrl), qrPosition, ctaText,
      qrSize, transition,`);

// 前端標題
html = html.replace(
  'QR 成交版｜最後 2 秒自動 QR Code｜CTA｜智慧滿版｜MP3＋音量',
  '實用版｜CTA 2/3/4 秒｜QR 大小｜輕柔轉場｜音量模式｜智慧滿版'
);

// 音量預設改 40%，新增音量模式
html = html
  .replace('id="musicVolume" type="range" min="0" max="50" step="1" value="15"', 'id="musicVolume" type="range" min="0" max="60" step="1" value="40"')
  .replace('id="musicVolumeNumber" type="number" min="0" max="50" value="15"', 'id="musicVolumeNumber" type="number" min="0" max="60" value="40"')
  .replace('建議 10～20%。若只是背景陪襯，15% 通常較合適。', '預設 40%。無旁白建議 40～45%；未來若加旁白可降到 15～25%。');

const volumeLabel = '<div><label class="label">背景音樂音量</label><div class="range-row">';
if (!html.includes(volumeLabel)) throw new Error('找不到背景音樂音量區塊。');
html = html.replace(volumeLabel,
`<div><label class="label">背景音樂音量</label>
      <select id="musicPreset" style="margin-bottom:8px">
        <option value="20">柔和 20%</option>
        <option value="40" selected>一般 40%</option>
        <option value="45">強一點 45%</option>
        <option value="custom">自訂</option>
      </select>
      <div class="range-row">`);

// v3.7 額外控制：CTA 秒數、QR 大小、CTA 模板、轉場
const qrGood = '<div class="good" style="margin-top:10px">QR Code 使用專案既有 qrcode 套件在本機產生，不使用外部 API，也不會把 QR 圖檔存進專案。</div>';
if (!html.includes(qrGood)) throw new Error('找不到 v3.6 QR 說明區塊。');
const extraUi = `${qrGood}
  <div class="grid g4" style="margin-top:14px">
    <div><label class="label">最後 CTA 停留</label><select id="ctaSeconds"><option value="2">2 秒</option><option value="3" selected>3 秒（建議）</option><option value="4">4 秒</option></select></div>
    <div><label class="label">QR Code 大小</label><select id="qrSize"><option value="300">標準 300px</option><option value="340" selected>加大 340px（建議）</option><option value="380">更大 380px</option></select></div>
    <div><label class="label">CTA 文案模板</label><select id="ctaTemplate"><option value="scan" selected>掃碼立即查看</option><option value="price">價格強調</option><option value="save">省時間</option><option value="custom">自訂</option></select></div>
    <div><label class="label">圖片轉場</label><label class="row" style="padding:10px 0"><input id="transition" type="checkbox" checked style="width:auto" /> 輕柔淡化轉場</label><div class="muted">只做輕微淡化，不做花俏特效。</div></div>
  </div>`;
html = html.replace(qrGood, extraUi);

// JS：音量模式與 CTA 模板
const volumeJsNeedle = "$('musicVolume').oninput=()=>{$('musicVolumeNumber').value=$('musicVolume').value};$('musicVolumeNumber').oninput=()=>{const v=Math.max(0,Math.min(50,Number($('musicVolumeNumber').value||0)));$('musicVolume').value=v;$('musicVolumeNumber').value=v};$('product').onchange=renderCaptions;";
if (!html.includes(volumeJsNeedle)) throw new Error('找不到 v3.6 音量 JS。');
html = html.replace(volumeJsNeedle,
`$('musicVolume').oninput=()=>{$('musicVolumeNumber').value=$('musicVolume').value;$('musicPreset').value='custom'};
$('musicVolumeNumber').oninput=()=>{const v=Math.max(0,Math.min(60,Number($('musicVolumeNumber').value||0)));$('musicVolume').value=v;$('musicVolumeNumber').value=v;$('musicPreset').value='custom'};
$('musicPreset').onchange=()=>{if($('musicPreset').value==='custom')return;const v=Number($('musicPreset').value);$('musicVolume').value=v;$('musicVolumeNumber').value=v};
function applyCtaTemplate(){const product=p();const type=$('ctaTemplate').value;if(type==='custom')return;if(type==='price')$('ctaText').value=\`${product.count}只要 NT$\${product.price}\`;else if(type==='save')$('ctaText').value='不用每天重新找圖';else $('ctaText').value='掃碼立即查看'}
$('ctaTemplate').onchange=applyCtaTemplate;
$('product').onchange=()=>{renderCaptions();applyCtaTemplate()};`);

// POST 新欄位
const postNeedle = "fd.append('ctaText',$('ctaText').value.trim());";
if (!html.includes(postNeedle)) throw new Error('找不到 v3.6 CTA POST 欄位。');
html = html.replace(postNeedle,
`${postNeedle}fd.append('ctaSeconds',$('ctaSeconds').value);fd.append('qrSize',$('qrSize').value);fd.append('transition',$('transition').checked?'1':'0');`);

// 預設音量 fallback 從 15 改 40
html = html.replace("Number($('musicVolumeNumber').value||15)/100", "Number($('musicVolumeNumber').value||40)/100");

// 輸出資訊補充
const infoNeedle = "<br>QR 位置：${esc(data.qrPosition||'')}<br>LINE：${esc(data.lineId||'')}<br>輸出：${esc(data.outputDir)}";
if (html.includes(infoNeedle)) {
  html = html.replace(infoNeedle,
`<br>QR 位置：${esc(data.qrPosition||'')}<br>QR 大小：${esc(data.qrSize||'')}px<br>CTA 停留：${esc(data.ctaSeconds||'')} 秒<br>淡化轉場：${data.transition?'開啟':'關閉'}<br>LINE：${esc(data.lineId||'')}<br>輸出：${esc(data.outputDir)}`);
}

fs.writeFileSync(path.join(dstDir, 'server.mjs'), server, 'utf8');
fs.writeFileSync(path.join(dstDir, 'index.html'), html, 'utf8');

const cmd = `@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\ntitle RXV 小包短影音推廣器 v3.7\r\n\r\nif not exist "node_modules" (\r\n  echo 找不到 node_modules，請先執行 npm install\r\n  pause\r\n  exit /b 1\r\n)\r\n\r\necho 啟動 RXV 小包短影音推廣器 v3.7...\r\nnode "tools\\rxv-small-pack-video-promoter-v3-7\\server.mjs"\r\npause\r\n`;
fs.writeFileSync(path.join(ROOT, 'RXV-小包短影音推廣器-v3.7.cmd'), cmd, 'utf8');

console.log('RXV 小包短影音推廣器 v3.7 已建立。');
console.log('新增：CTA 2/3/4 秒、QR 300/340/380px、CTA 文案模板、輕柔淡化轉場。');
console.log('背景音樂新增：柔和 20%、一般 40%（預設）、強一點 45%、自訂。');
console.log('保留：智慧滿版、QR Code、LINE、MP3、淡入淡出、各平台文案。');
console.log('MP4 仍輸出到 D:\\RXV-短影音輸出，不進專案備份。');
console.log('下一步：& ".\\RXV-小包短影音推廣器-v3.7.cmd"');
