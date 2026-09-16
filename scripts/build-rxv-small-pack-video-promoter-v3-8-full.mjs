import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const srcDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-6');
const dstDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-8');
const srcServer = path.join(srcDir, 'server.mjs');
const srcIndex = path.join(srcDir, 'index.html');
const dstServer = path.join(dstDir, 'server.mjs');
const dstIndex = path.join(dstDir, 'index.html');

function mustFile(file) {
  if (!fs.existsSync(file)) throw new Error('找不到：' + file + '\n請先確認 v3.6 工具仍在本機。');
}
function replaceOnce(text, from, to, label, optional = false) {
  if (text.includes(to)) return text;
  if (!text.includes(from)) {
    if (optional) return text;
    throw new Error('找不到修改位置：' + label);
  }
  return text.replace(from, to);
}
function replaceBetween(text, start, end, replacement, label) {
  const a = text.indexOf(start);
  const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error('找不到區塊：' + label);
  return text.slice(0, a) + replacement + text.slice(b);
}
function insertBefore(text, marker, insertion, label) {
  const i = text.indexOf(marker);
  if (i < 0) throw new Error('找不到標記：' + label);
  return text.slice(0, i) + insertion + text.slice(i);
}

mustFile(srcServer);
mustFile(srcIndex);
fs.rmSync(dstDir, { recursive: true, force: true });
fs.mkdirSync(dstDir, { recursive: true });

let server = fs.readFileSync(srcServer, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(srcIndex, 'utf8').replace(/\r\n/g, '\n');
server = server.replaceAll('rxv-small-pack-video-promoter-v3-6', 'rxv-small-pack-video-promoter-v3-8').replaceAll('v3.6', 'v3.8');
html = html.replaceAll('v3.6', 'v3.8');

// ---------- v3.7 功能：CTA 秒數 / QR 尺寸 / 轉場 ----------
server = replaceOnce(
  server,
  "    const ctaSeconds = enableCta ? 2 : 0;",
  "    const requestedCtaSeconds = Math.max(2, Math.min(4, Number(req.body.ctaSeconds || 3)));\n    const ctaSeconds = enableCta ? requestedCtaSeconds : 0;",
  'CTA 秒數'
);

server = replaceOnce(
  server,
  "    ctaText = '掃碼立即查看',\n  } = qrOptions;",
  "    ctaText = '掃碼立即查看',\n    qrSize = 340,\n  } = qrOptions;",
  'QR options'
);
server = replaceOnce(
  server,
  "  const qrSize = 300;",
  "  const qrPixelSize = Math.max(260, Math.min(420, Number(qrSize || 340)));",
  'QR 尺寸'
);
server = replaceOnce(
  server,
  "  const qrX = qrPosition === 'left' ? 120 : qrPosition === 'right' ? 660 : 390;",
  "  const qrX = qrPosition === 'left'\n    ? 120\n    : qrPosition === 'right'\n      ? 1080 - 120 - qrPixelSize\n      : Math.round((1080 - qrPixelSize) / 2);",
  'QR X'
);
server = replaceOnce(server, "      width: qrSize,", "      width: qrPixelSize,", 'QR buffer width');
server = replaceOnce(server, 'width="${qrSize + 36}" height="${qrSize + 36}"', 'width="${qrPixelSize + 36}" height="${qrPixelSize + 36}"', 'QR panel size');

const ctaTextParse = "    const ctaText = String(req.body.ctaText || '掃碼立即查看').trim().slice(0, 20);";
server = replaceOnce(
  server,
  ctaTextParse,
  ctaTextParse + "\n    const qrSize = [300, 340, 380].includes(Number(req.body.qrSize)) ? Number(req.body.qrSize) : 340;\n    const transition = String(req.body.transition || '1') !== '0';",
  'CTA parse'
);

const helperMarker = 'function ffmpegConcatPath(filePath) {';
const blendHelper = [
  'async function makeBlendFrame(firstPath, secondPath, outputPath, alpha) {',
  '  const overlay = await sharp(secondPath)',
  '    .removeAlpha()',
  '    .ensureAlpha(Math.max(0, Math.min(1, alpha)))',
  '    .png()',
  '    .toBuffer();',
  '  await sharp(firstPath)',
  "    .composite([{ input: overlay, left: 0, top: 0, blend: 'over' }])",
  '    .png()',
  '    .toFile(outputPath);',
  '}',
  '',
].join('\n');
if (!server.includes('async function makeBlendFrame(')) server = insertBefore(server, helperMarker, blendHelper, 'ffmpeg helper');

const concatStart = server.indexOf("    let ctaFrame = '';");
const concatEnd = server.indexOf("    const concatFile = path.join(jobPath, 'frames.txt');", concatStart);
if (concatStart < 0 || concatEnd < 0) throw new Error('找不到影片串接區塊');
const newConcatBlock = [
  "    let ctaFrame = '';",
  '    if (enableCta) {',
  "      ctaFrame = path.join(jobPath, 'frame-cta.png');",
  '      const ctaResult = await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId, { enableQr, qrUrl, qrPosition, ctaText, qrSize });',
  '      req._rxvCtaResult = ctaResult;',
  '    }',
  '',
  '    const contentSeconds = Math.max(1, totalSeconds - ctaSeconds);',
  '    const transitionSteps = transition ? 3 : 0;',
  '    const transitionStepSeconds = transition ? 0.06 : 0;',
  '    const transitionTotal = Math.max(0, frameFiles.length - 1) * transitionSteps * transitionStepSeconds;',
  '    const frameDuration = Math.max(0.16, (contentSeconds - transitionTotal) / frameFiles.length);',
  '    const concatLines = [];',
  '',
  '    for (let i = 0; i < frameFiles.length; i += 1) {',
  "      concatLines.push(`file '${ffmpegConcatPath(frameFiles[i])}'`);",
  '      concatLines.push(`duration ${frameDuration.toFixed(3)}`);',
  '      if (transition && i < frameFiles.length - 1) {',
  '        for (let step = 1; step <= transitionSteps; step += 1) {',
  '          const alpha = step / (transitionSteps + 1);',
  "          const blendPath = path.join(jobPath, `blend-${String(i + 1).padStart(2, '0')}-${step}.png`);",
  '          await makeBlendFrame(frameFiles[i], frameFiles[i + 1], blendPath, alpha);',
  "          concatLines.push(`file '${ffmpegConcatPath(blendPath)}'`);",
  '          concatLines.push(`duration ${transitionStepSeconds.toFixed(3)}`);',
  '        }',
  '      }',
  '    }',
  '',
  '    if (ctaFrame) {',
  "      concatLines.push(`file '${ffmpegConcatPath(ctaFrame)}'`);",
  '      concatLines.push(`duration ${ctaSeconds.toFixed(3)}`);',
  "      concatLines.push(`file '${ffmpegConcatPath(ctaFrame)}'`);",
  '    } else {',
  "      concatLines.push(`file '${ffmpegConcatPath(frameFiles[frameFiles.length - 1])}'`);",
  '    }',
  '',
].join('\n');
server = server.slice(0, concatStart) + newConcatBlock + server.slice(concatEnd);

const responseNeedle = '      enableQr, qrUrl: req._rxvCtaResult?.finalQrUrl || normalizeQrUrl(qrUrl), qrPosition, ctaText,';
server = replaceOnce(server, responseNeedle, responseNeedle + '\n      qrSize, transition,', 'response QR');

// ---------- v3.8：5 個商品 + 即時網站數量 ----------
const serverProducts = [
  'const PRODUCTS = {',
  "  realEstate: { short: '房仲', slug: 'real-estate', catalogKey: 'realEstate', name: 'RXV 房仲帶看宣傳圖片包', count: '83 張', price: 99, pain: '每天發房仲貼文，還在花時間找圖？', uses: ['帶看宣傳','賀成交','交屋紀錄','社區公設','生活機能','房仲社群貼文'], benefits: ['帶看宣傳更省時間','成交賀圖快速完成','交屋貼文直接套用','社區特色更好呈現','生活機能貼文不缺圖','社群經營每天都有素材'] },",
  "  hair: { short: '美髮', slug: 'hair', catalogKey: 'hair', name: 'RXV 美髮沙龍職業圖片包', count: '133 張', price: 99, pain: '每天發美髮貼文，還在到處找圖片？', uses: ['剪髮','染燙','洗護','髮型諮詢','完成造型','預約宣傳','沙龍日常'], benefits: ['剪髮作品快速發文','染燙服務更有質感','洗護內容不用再找圖','諮詢情境直接套用','完成造型展示更方便','預約宣傳快速完成','沙龍日常持續有素材'] },",
  "  manicure: { short: '美甲', slug: 'manicure', catalogKey: 'manicure', name: 'RXV 美甲職業圖片包', count: '133 張', price: 99, pain: '每天發美甲貼文，還在花時間找素材？', uses: ['凝膠美甲','手部保養','款式展示','色系提案','預約宣傳','美甲日常'], benefits: ['作品展示快速完成','手部保養內容更好發','款式靈感直接套用','色系提案不缺圖','預約宣傳更省時間','社群每天都有素材'] },",
  "  spa: { short: '美容SPA', slug: 'beauty-spa', catalogKey: 'spa', name: 'RXV 美容SPA職業圖片包', count: '135 張', price: 99, pain: '美容 SPA 每天要發文，還在重新找圖？', uses: ['臉部保養','身體按摩','芳療','療程介紹','環境氛圍','預約宣傳'], benefits: ['保養服務更好呈現','按摩情境直接使用','芳療貼文快速完成','療程介紹不缺圖','質感環境更吸睛','預約宣傳更省時間'] },",
  "  dental: { short: '牙醫', slug: 'dental', catalogKey: 'dental', name: 'RXV 牙醫職業圖片包', count: '104 張', price: 99, pain: '牙醫診所做衛教與宣傳，還在到處找圖片？', uses: ['看診情境','牙齒衛教','設備消毒','醫病溝通','診所環境','預約宣傳'], benefits: ['看診內容快速發文','衛教貼文更容易理解','專業設備情境可直接用','溝通情境更自然','診所形象更完整','預約宣傳更省時間'] },",
  '};',
  '',
].join('\n');
server = replaceBetween(server, 'const PRODUCTS = {', 'const TEMPLATES =', serverProducts, 'server PRODUCTS');

const catalogHelper = [
  "const CATALOG_URL = process.env.RXV_PUBLIC_CATALOG_URL || 'https://pub-ebdb1fc3a20543dca4f4df036cedd868.r2.dev/catalog/images-public.json';",
  'const CATALOG_CATEGORY_MAP = {',
  "  realEstate: ['房仲／房地產','房仲/房地產'],",
  "  hair: ['美髮／沙龍','美髮/沙龍'],",
  "  manicure: ['美甲'],",
  "  spa: ['美容SPA','美容 SPA','美容／SPA'],",
  "  dental: ['牙醫'],",
  '};',
  'function rxvCatalogItems(payload) {',
  '  if (Array.isArray(payload)) return payload;',
  '  if (Array.isArray(payload?.images)) return payload.images;',
  '  if (Array.isArray(payload?.data)) return payload.data;',
  '  if (Array.isArray(payload?.items)) return payload.items;',
  '  return [];',
  '}',
  'async function getCatalogStats() {',
  "  const joiner = CATALOG_URL.includes('?') ? '&' : '?';",
  "  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });",
  "  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);",
  '  const items = rxvCatalogItems(await response.json());',
  '  const counts = { realEstate:0, hair:0, manicure:0, spa:0, dental:0 };',
  '  for (const item of items) {',
  "    const category = String(item?.category_name || item?.category || '').trim();",
  '    for (const [key, aliases] of Object.entries(CATALOG_CATEGORY_MAP)) {',
  '      if (aliases.some((name) => name === category)) counts[key] += 1;',
  '    }',
  '  }',
  '  return { ok:true, total:items.length, counts, checkedAt:new Date().toISOString() };',
  '}',
  '',
].join('\n');
if (server.includes('const AUTO_RATIO_TOLERANCE = 0.08;')) {
  server = server.replace('const AUTO_RATIO_TOLERANCE = 0.08;', 'const AUTO_RATIO_TOLERANCE = 0.08;\n\n' + catalogHelper);
} else {
  server = insertBefore(server, 'async function makeVerticalFrame(', catalogHelper, 'catalog helper');
}

const productLine = "    const product = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;";
server = replaceOnce(
  server,
  productLine,
  [
    "    const baseProduct = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;",
    '    let product = { ...baseProduct };',
    '    try {',
    '      const liveStats = await getCatalogStats();',
    '      const liveCount = Number(liveStats.counts?.[baseProduct.catalogKey] || 0);',
    "      if (liveCount > 0) product.count = String(liveCount) + ' 張';",
    '    } catch (catalogError) {',
    "      console.warn('[RXV v3.8 catalog stats]', catalogError?.message || catalogError);",
    '    }',
  ].join('\n'),
  'render product'
);
server = replaceOnce(server, "    const safeProduct = product.short === '美髮' ? 'hair' : 'real-estate';", "    const safeProduct = product.slug || 'image-pack';", 'safe product', true);

const renderMarker = "app.post('/api/render', upload.fields([";
const statsRoute = [
  "app.get('/api/catalog-stats', async (_req, res) => {",
  '  try {',
  "    res.setHeader('Cache-Control', 'no-store');",
  '    res.json(await getCatalogStats());',
  '  } catch (error) {',
  '    res.status(502).json({ ok:false, error:error instanceof Error ? error.message : String(error) });',
  '  }',
  '});',
  '',
].join('\n');
server = insertBefore(server, renderMarker, statsRoute, 'catalog stats route');

// ---------- 前端 v3.7 ----------
html = html
  .replace('id="musicVolume" type="range" min="0" max="50" step="1" value="15"', 'id="musicVolume" type="range" min="0" max="60" step="1" value="40"')
  .replace('id="musicVolumeNumber" type="number" min="0" max="50" value="15"', 'id="musicVolumeNumber" type="number" min="0" max="60" value="40"')
  .replace('建議 10～20%。若只是背景陪襯，15% 通常較合適。', '預設 40%。無旁白建議 40～45%；未來若加旁白可降到 15～25%。');

const volumeLabel = '<div><label class="label">背景音樂音量</label><div class="range-row">';
const volumeUi = [
  '<div><label class="label">背景音樂音量</label>',
  '      <select id="musicPreset" style="margin-bottom:8px">',
  '        <option value="20">柔和 20%</option>',
  '        <option value="40" selected>一般 40%</option>',
  '        <option value="45">強一點 45%</option>',
  '        <option value="custom">自訂</option>',
  '      </select>',
  '      <div class="range-row">',
].join('\n');
html = replaceOnce(html, volumeLabel, volumeUi, '背景音樂 UI');

const qrGood = '<div class="good" style="margin-top:10px">QR Code 使用專案既有 qrcode 套件在本機產生，不使用外部 API，也不會把 QR 圖檔存進專案。</div>';
const extraUi = [
  qrGood,
  '  <div class="grid g4" style="margin-top:14px">',
  '    <div><label class="label">最後 CTA 停留</label><select id="ctaSeconds"><option value="2">2 秒</option><option value="3" selected>3 秒（建議）</option><option value="4">4 秒</option></select></div>',
  '    <div><label class="label">QR Code 大小</label><select id="qrSize"><option value="300">標準 300px</option><option value="340" selected>加大 340px（建議）</option><option value="380">更大 380px</option></select></div>',
  '    <div><label class="label">CTA 文案模板</label><select id="ctaTemplate"><option value="scan" selected>掃碼立即查看</option><option value="price">價格強調</option><option value="save">省時間</option><option value="custom">自訂</option></select></div>',
  '    <div><label class="label">圖片轉場</label><label class="row" style="padding:10px 0"><input id="transition" type="checkbox" checked style="width:auto" /> 輕柔淡化轉場</label><div class="muted">只做輕微淡化，不做花俏特效。</div></div>',
  '  </div>',
].join('\n');
html = replaceOnce(html, qrGood, extraUi, 'v3.7 額外控制');

const volumeJsNeedle = "$('musicVolume').oninput=()=>{$('musicVolumeNumber').value=$('musicVolume').value};$('musicVolumeNumber').oninput=()=>{const v=Math.max(0,Math.min(50,Number($('musicVolumeNumber').value||0)));$('musicVolume').value=v;$('musicVolumeNumber').value=v};$('product').onchange=renderCaptions;";
const volumeJs = [
  "$('musicVolume').oninput=()=>{$('musicVolumeNumber').value=$('musicVolume').value;$('musicPreset').value='custom'};",
  "$('musicVolumeNumber').oninput=()=>{const v=Math.max(0,Math.min(60,Number($('musicVolumeNumber').value||0)));$('musicVolume').value=v;$('musicVolumeNumber').value=v;$('musicPreset').value='custom'};",
  "$('musicPreset').onchange=()=>{if($('musicPreset').value==='custom')return;const v=Number($('musicPreset').value);$('musicVolume').value=v;$('musicVolumeNumber').value=v};",
  "function applyCtaTemplate(){const product=p();const type=$('ctaTemplate').value;if(type==='custom')return;if(type==='price')$('ctaText').value=`${product.count}只要 NT$${product.price}`;else if(type==='save')$('ctaText').value='不用每天重新找圖';else $('ctaText').value='掃碼立即查看'}",
  "$('ctaTemplate').onchange=applyCtaTemplate;",
  "$('product').onchange=()=>{renderCaptions();applyCtaTemplate()};",
].join('\n');
html = replaceOnce(html, volumeJsNeedle, volumeJs, '音量 JS');

const postNeedle = "fd.append('ctaText',$('ctaText').value.trim());";
html = replaceOnce(html, postNeedle, postNeedle + "fd.append('ctaSeconds',$('ctaSeconds').value);fd.append('qrSize',$('qrSize').value);fd.append('transition',$('transition').checked?'1':'0');", 'POST v3.7');
html = html.replace("Number($('musicVolumeNumber').value||15)/100", "Number($('musicVolumeNumber').value||40)/100");

// ---------- 前端 v3.8 ----------
const htmlProducts = [
  'const PRODUCTS={',
  "realEstate:{short:'房仲',name:'RXV 房仲帶看宣傳圖片包',count:'83 張',price:99,pain:'每天發房仲貼文，還在花時間找圖？',uses:'帶看、成交、交屋、公設、生活機能、社群貼文'},",
  "hair:{short:'美髮',name:'RXV 美髮沙龍職業圖片包',count:'133 張',price:99,pain:'每天發美髮貼文，還在到處找圖片？',uses:'剪髮、染燙、洗護、造型、預約宣傳、沙龍日常'},",
  "manicure:{short:'美甲',name:'RXV 美甲職業圖片包',count:'133 張',price:99,pain:'每天發美甲貼文，還在花時間找素材？',uses:'凝膠美甲、手部保養、款式展示、色系提案、預約宣傳'},",
  "spa:{short:'美容SPA',name:'RXV 美容SPA職業圖片包',count:'135 張',price:99,pain:'美容 SPA 每天要發文，還在重新找圖？',uses:'臉部保養、身體按摩、芳療、療程介紹、環境氛圍、預約宣傳'},",
  "dental:{short:'牙醫',name:'RXV 牙醫職業圖片包',count:'104 張',price:99,pain:'牙醫診所做衛教與宣傳，還在到處找圖片？',uses:'看診情境、牙齒衛教、設備消毒、醫病溝通、診所環境、預約宣傳'}",
  '};',
  '',
].join('\n');
html = replaceBetween(html, 'const PRODUCTS={', 'const PLATFORMS=', htmlProducts, 'frontend PRODUCTS');

const selectRe = /<select id="product">[\s\S]*?<\/select>/;
if (!selectRe.test(html)) throw new Error('找不到商品選單');
const newSelect = [
  '<select id="product">',
  '<option value="realEstate">房仲圖片包｜83 張｜NT$99</option>',
  '<option value="hair">美髮沙龍圖片包｜133 張｜NT$99</option>',
  '<option value="manicure">美甲圖片包｜133 張｜NT$99</option>',
  '<option value="spa">美容SPA圖片包｜135 張｜NT$99</option>',
  '<option value="dental">牙醫圖片包｜104 張｜NT$99</option>',
  '</select>',
  '<div id="catalogStatus" class="muted" style="margin-top:8px">正在同步網站最新數量…</div>',
  '<button id="refreshCatalogBtn" type="button" class="btn gray" style="margin-top:8px">重新同步數量</button>',
].join('\n');
html = html.replace(selectRe, newSelect);

const copyMarker = 'async function copyText(text,button){';
const syncJs = [
  'async function syncCatalogStats(){',
  "  const status=$('catalogStatus');",
  '  try{',
  "    status.textContent='正在同步網站最新數量…';",
  "    const r=await fetch('/api/catalog-stats?t='+Date.now(),{cache:'no-store'});",
  '    const data=await r.json();',
  "    if(!r.ok||!data.ok)throw new Error(data.error||'同步失敗');",
  "    const labelMap={realEstate:'房仲圖片包',hair:'美髮沙龍圖片包',manicure:'美甲圖片包',spa:'美容SPA圖片包',dental:'牙醫圖片包'};",
  '    for(const [key,raw] of Object.entries(data.counts||{})){',
  '      const count=Number(raw||0);',
  '      if(!PRODUCTS[key]||count<=0)continue;',
  "      PRODUCTS[key].count=count+' 張';",
  "      const option=$('product').querySelector('option[value=\"'+key+'\"]');",
  "      if(option)option.textContent=labelMap[key]+'｜'+count+' 張｜NT$99';",
  '    }',
  "    status.textContent='網站即時數量：房仲 '+(data.counts?.realEstate||0)+'｜美髮 '+(data.counts?.hair||0)+'｜美甲 '+(data.counts?.manicure||0)+'｜美容SPA '+(data.counts?.spa||0)+'｜牙醫 '+(data.counts?.dental||0);",
  '    renderCaptions();',
  '    applyCtaTemplate();',
  '  }catch(error){',
  "    status.textContent='網站數量同步失敗，暫用備用數量。';",
  "    console.warn('[RXV v3.8 catalog]',error);",
  '  }',
  '}',
  '',
].join('\n');
html = insertBefore(html, copyMarker, syncJs, 'catalog sync JS');

const imagesMarker = "$('images').onchange=()=>{";
html = replaceOnce(html, imagesMarker, "$('refreshCatalogBtn').onclick=syncCatalogStats;\n" + imagesMarker, 'refresh catalog button');
const initMarker = 'renderCaptions();';
const lastInit = html.lastIndexOf(initMarker);
if (lastInit < 0) throw new Error('找不到 renderCaptions 初始化');
html = html.slice(0, lastInit) + 'renderCaptions();applyCtaTemplate();syncCatalogStats();' + html.slice(lastInit + initMarker.length);

// 網址統一導向全部圖片購買頁
server = server.replaceAll('https://pomodoro-app-eight-rouge.vercel.app/image-packs', 'https://pomodoro-app-eight-rouge.vercel.app/images');
server = server.replaceAll('pomodoro-app-eight-rouge.vercel.app/image-packs', 'pomodoro-app-eight-rouge.vercel.app/images');
html = html.replaceAll('https://pomodoro-app-eight-rouge.vercel.app/image-packs', 'https://pomodoro-app-eight-rouge.vercel.app/images');
html = html.replaceAll('pomodoro-app-eight-rouge.vercel.app/image-packs', 'pomodoro-app-eight-rouge.vercel.app/images');

html = html.replace('QR 成交版｜最後 2 秒自動 QR Code｜CTA｜智慧滿版｜MP3＋音量', '完整實用版｜5 職業即時數量｜CTA 2/3/4 秒｜QR 大小｜淡化轉場｜MP3 音量模式');

fs.writeFileSync(dstServer, server, 'utf8');
fs.writeFileSync(dstIndex, html, 'utf8');

// 安全檢查：先檢查 server 語法，避免再產生壞工具
if (server.includes('const TEMPLATES =const TEMPLATES =')) throw new Error('安全檢查失敗：TEMPLATES 重複');
if (html.includes('const PLATFORMS=const PLATFORMS=')) throw new Error('安全檢查失敗：PLATFORMS 重複');
execFileSync(process.execPath, ['--check', dstServer], { stdio: 'inherit' });
for (const required of ['musicPreset','ctaSeconds','qrSize','transition','catalogStatus','refreshCatalogBtn','manicure','spa','dental']) {
  if (!html.includes(required)) throw new Error('安全檢查失敗，缺少：' + required);
}

const cmd = [
  '@echo off',
  'chcp 65001 >nul',
  'cd /d "%~dp0"',
  'title RXV 小包短影音推廣器 v3.8 完整版',
  '',
  'if not exist "node_modules" (',
  '  echo 找不到 node_modules，請先執行 npm install',
  '  pause',
  '  exit /b 1',
  ')',
  '',
  'echo 啟動 RXV 小包短影音推廣器 v3.8 完整版...',
  'node "tools\\rxv-small-pack-video-promoter-v3-8\\server.mjs"',
  'pause',
  '',
].join('\r\n');
fs.writeFileSync(path.join(ROOT, 'RXV-小包短影音推廣器-v3.8.cmd'), cmd, 'utf8');

console.log('SUCCESS: RXV 小包短影音推廣器 v3.8 完整版已建立。');
console.log('不需要先執行 v3.7；已直接把 v3.7 + v3.8 功能一起套在可用的 v3.6 上。');
console.log('包含：智慧滿版、MP3、音量模式、CTA 2/3/4 秒、QR 大小、淡化轉場、CTA 模板、5 職業、網站即時張數。');
console.log('QR/CTA 預設網址：https://pomodoro-app-eight-rouge.vercel.app/images');
console.log('MP4：D:\\RXV-短影音輸出');
console.log('下一步：& ".\\RXV-小包短影音推廣器-v3.8.cmd"');
