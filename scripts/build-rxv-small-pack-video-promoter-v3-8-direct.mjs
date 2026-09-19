import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const srcDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-6');
const dstDir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-8');
const srcServer = path.join(srcDir, 'server.mjs');
const srcIndex = path.join(srcDir, 'index.html');

function mustFile(file) {
  if (!fs.existsSync(file)) throw new Error('找不到：' + file + '\n請先確認目前可用的 v3.6 工具還在本機。');
}
function replaceBetween(text, start, end, replacement, label) {
  const a = text.indexOf(start);
  const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error('找不到 ' + label + ' 區塊，未修改。');
  return text.slice(0, a) + replacement + text.slice(b);
}
function insertBefore(text, marker, insertion, label) {
  const i = text.indexOf(marker);
  if (i < 0) throw new Error('找不到 ' + label + ' 標記，未修改。');
  return text.slice(0, i) + insertion + text.slice(i);
}

mustFile(srcServer);
mustFile(srcIndex);
fs.mkdirSync(dstDir, { recursive: true });

let server = fs.readFileSync(srcServer, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(srcIndex, 'utf8').replace(/\r\n/g, '\n');
server = server.replaceAll('rxv-small-pack-video-promoter-v3-6', 'rxv-small-pack-video-promoter-v3-8').replaceAll('v3.6', 'v3.8');
html = html.replaceAll('v3.6', 'v3.8');

const serverProducts = [
"const PRODUCTS = {",
"  realEstate: { short: '房仲', slug: 'real-estate', catalogKey: 'realEstate', name: 'RXV 房仲帶看宣傳圖片包', count: '83 張', price: 99, pain: '每天發房仲貼文，還在花時間找圖？', uses: ['帶看宣傳','賀成交','交屋紀錄','社區公設','生活機能','房仲社群貼文'], benefits: ['帶看宣傳更省時間','成交賀圖快速完成','交屋貼文直接套用','社區特色更好呈現','生活機能貼文不缺圖','社群經營每天都有素材'] },",
"  hair: { short: '美髮', slug: 'hair', catalogKey: 'hair', name: 'RXV 美髮沙龍職業圖片包', count: '133 張', price: 99, pain: '每天發美髮貼文，還在到處找圖片？', uses: ['剪髮','染燙','洗護','髮型諮詢','完成造型','預約宣傳','沙龍日常'], benefits: ['剪髮作品快速發文','染燙服務更有質感','洗護內容不用再找圖','諮詢情境直接套用','完成造型展示更方便','預約宣傳快速完成','沙龍日常持續有素材'] },",
"  manicure: { short: '美甲', slug: 'manicure', catalogKey: 'manicure', name: 'RXV 美甲職業圖片包', count: '133 張', price: 99, pain: '每天發美甲貼文，還在花時間找素材？', uses: ['凝膠美甲','手部保養','款式展示','色系提案','預約宣傳','美甲日常'], benefits: ['作品展示快速完成','手部保養內容更好發','款式靈感直接套用','色系提案不缺圖','預約宣傳更省時間','社群每天都有素材'] },",
"  spa: { short: '美容SPA', slug: 'beauty-spa', catalogKey: 'spa', name: 'RXV 美容SPA職業圖片包', count: '135 張', price: 99, pain: '美容 SPA 每天要發文，還在重新找圖？', uses: ['臉部保養','身體按摩','芳療','療程介紹','環境氛圍','預約宣傳'], benefits: ['保養服務更好呈現','按摩情境直接使用','芳療貼文快速完成','療程介紹不缺圖','質感環境更吸睛','預約宣傳更省時間'] },",
"  dental: { short: '牙醫', slug: 'dental', catalogKey: 'dental', name: 'RXV 牙醫職業圖片包', count: '104 張', price: 99, pain: '牙醫診所做衛教與宣傳，還在到處找圖片？', uses: ['看診情境','牙齒衛教','設備消毒','醫病溝通','診所環境','預約宣傳'], benefits: ['看診內容快速發文','衛教貼文更容易理解','專業設備情境可直接用','溝通情境更自然','診所形象更完整','預約宣傳更省時間'] },",
"};",
"",
].join('\n');
server = replaceBetween(server, 'const PRODUCTS = {', 'const TEMPLATES =', serverProducts + 'const TEMPLATES =', 'server PRODUCTS');

const catalogHelper = [
"const CATALOG_URL = process.env.RXV_PUBLIC_CATALOG_URL || 'https://pub-ebdb1fc3a20543dca4f4df036cedd868.r2.dev/catalog/images-public.json';",
"const CATALOG_CATEGORY_MAP = {",
"  realEstate: ['房仲／房地產','房仲/房地產'],",
"  hair: ['美髮／沙龍','美髮/沙龍'],",
"  manicure: ['美甲'],",
"  spa: ['美容SPA','美容 SPA','美容／SPA'],",
"  dental: ['牙醫'],",
"};",
"function rxvCatalogItems(payload) {",
"  if (Array.isArray(payload)) return payload;",
"  if (Array.isArray(payload?.images)) return payload.images;",
"  if (Array.isArray(payload?.data)) return payload.data;",
"  if (Array.isArray(payload?.items)) return payload.items;",
"  return [];",
"}",
"async function getCatalogStats() {",
"  const joiner = CATALOG_URL.includes('?') ? '&' : '?';",
"  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });",
"  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);",
"  const items = rxvCatalogItems(await response.json());",
"  const counts = { realEstate:0, hair:0, manicure:0, spa:0, dental:0 };",
"  for (const item of items) {",
"    const category = String(item?.category_name || item?.category || '').trim();",
"    for (const [key, aliases] of Object.entries(CATALOG_CATEGORY_MAP)) {",
"      if (aliases.some((name) => name === category)) counts[key] += 1;",
"    }",
"  }",
"  return { ok:true, total:items.length, counts, checkedAt:new Date().toISOString() };",
"}",
"",
].join('\n');

if (server.includes('const AUTO_RATIO_TOLERANCE = 0.08;')) {
  server = server.replace('const AUTO_RATIO_TOLERANCE = 0.08;', 'const AUTO_RATIO_TOLERANCE = 0.08;\n\n' + catalogHelper);
} else {
  server = insertBefore(server, 'async function makeVerticalFrame(', catalogHelper, 'catalog helper');
}

const productLine = "    const product = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;";
if (!server.includes(productLine)) throw new Error('找不到 render product 設定，未修改。');
server = server.replace(productLine, [
"    const baseProduct = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;",
"    let product = { ...baseProduct };",
"    try {",
"      const liveStats = await getCatalogStats();",
"      const liveCount = Number(liveStats.counts?.[baseProduct.catalogKey] || 0);",
"      if (liveCount > 0) product.count = String(liveCount) + ' 張';",
"    } catch (catalogError) {",
"      console.warn('[RXV v3.8 catalog stats]', catalogError?.message || catalogError);",
"    }",
].join('\n'));

const oldSafe = "    const safeProduct = product.short === '美髮' ? 'hair' : 'real-estate';";
if (server.includes(oldSafe)) server = server.replace(oldSafe, "    const safeProduct = product.slug || 'image-pack';");

const renderMarker = "app.post('/api/render', upload.fields([";
const statsRoute = [
"app.get('/api/catalog-stats', async (_req, res) => {",
"  try {",
"    res.setHeader('Cache-Control', 'no-store');",
"    res.json(await getCatalogStats());",
"  } catch (error) {",
"    res.status(502).json({ ok:false, error:error instanceof Error ? error.message : String(error) });",
"  }",
"});",
"",
].join('\n');
server = insertBefore(server, renderMarker, statsRoute, 'render route');

const htmlProducts = [
"const PRODUCTS={",
"realEstate:{short:'房仲',name:'RXV 房仲帶看宣傳圖片包',count:'83 張',price:99,pain:'每天發房仲貼文，還在花時間找圖？',uses:'帶看、成交、交屋、公設、生活機能、社群貼文'},",
"hair:{short:'美髮',name:'RXV 美髮沙龍職業圖片包',count:'133 張',price:99,pain:'每天發美髮貼文，還在到處找圖片？',uses:'剪髮、染燙、洗護、造型、預約宣傳、沙龍日常'},",
"manicure:{short:'美甲',name:'RXV 美甲職業圖片包',count:'133 張',price:99,pain:'每天發美甲貼文，還在花時間找素材？',uses:'凝膠美甲、手部保養、款式展示、色系提案、預約宣傳'},",
"spa:{short:'美容SPA',name:'RXV 美容SPA職業圖片包',count:'135 張',price:99,pain:'美容 SPA 每天要發文，還在重新找圖？',uses:'臉部保養、身體按摩、芳療、療程介紹、環境氛圍、預約宣傳'},",
"dental:{short:'牙醫',name:'RXV 牙醫職業圖片包',count:'104 張',price:99,pain:'牙醫診所做衛教與宣傳，還在到處找圖片？',uses:'看診情境、牙齒衛教、設備消毒、醫病溝通、診所環境、預約宣傳'}",
"};",
].join('\n');
html = replaceBetween(html, 'const PRODUCTS={', 'const PLATFORMS=', htmlProducts + '\nconst PLATFORMS=', 'frontend PRODUCTS');

const selectRe = /<select id="product">[\s\S]*?<\/select>/;
if (!selectRe.test(html)) throw new Error('找不到商品選單，未修改。');
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
"async function syncCatalogStats(){",
"  const status=$('catalogStatus');",
"  try{",
"    status.textContent='正在同步網站最新數量…';",
"    const r=await fetch('/api/catalog-stats?t='+Date.now(),{cache:'no-store'});",
"    const data=await r.json();",
"    if(!r.ok||!data.ok)throw new Error(data.error||'同步失敗');",
"    const labelMap={realEstate:'房仲圖片包',hair:'美髮沙龍圖片包',manicure:'美甲圖片包',spa:'美容SPA圖片包',dental:'牙醫圖片包'};",
"    for(const [key,raw] of Object.entries(data.counts||{})){",
"      const count=Number(raw||0);",
"      if(!PRODUCTS[key]||count<=0)continue;",
"      PRODUCTS[key].count=count+' 張';",
"      const option=$('product').querySelector('option[value=\"'+key+'\"]');",
"      if(option)option.textContent=labelMap[key]+'｜'+count+' 張｜NT$99';",
"    }",
"    status.textContent='網站即時數量：房仲 '+(data.counts?.realEstate||0)+'｜美髮 '+(data.counts?.hair||0)+'｜美甲 '+(data.counts?.manicure||0)+'｜美容SPA '+(data.counts?.spa||0)+'｜牙醫 '+(data.counts?.dental||0);",
"    renderCaptions();",
"  }catch(error){",
"    status.textContent='網站數量同步失敗，暫用工具內備用數量。';",
"    console.warn('[RXV v3.8 catalog]',error);",
"  }",
"}",
"",
].join('\n');
html = insertBefore(html, copyMarker, syncJs, 'copyText');

const scriptEnd = html.lastIndexOf('</script>');
if (scriptEnd < 0) throw new Error('找不到 script 結尾，未修改。');
const initJs = "\n$('refreshCatalogBtn').onclick=syncCatalogStats;\nsetTimeout(syncCatalogStats,0);\n";
html = html.slice(0, scriptEnd) + initJs + html.slice(scriptEnd);

html = html.replace('QR 成交版｜最後 2 秒自動 QR Code｜CTA｜智慧滿版｜MP3＋音量', '職業包即時版｜5 種商品｜網站數量自動同步｜QR｜MP3｜智慧滿版');
html = html.replaceAll('https://pomodoro-app-eight-rouge.vercel.app/image-packs', 'https://pomodoro-app-eight-rouge.vercel.app/images');

fs.writeFileSync(path.join(dstDir, 'server.mjs'), server, 'utf8');
fs.writeFileSync(path.join(dstDir, 'index.html'), html, 'utf8');

const cmd = [
'@echo off',
'chcp 65001 >nul',
'cd /d "%~dp0"',
'title RXV 小包短影音推廣器 v3.8',
'',
'if not exist "node_modules" (',
'  echo 找不到 node_modules，請先執行 npm install',
'  pause',
'  exit /b 1',
')',
'',
'echo 啟動 RXV 小包短影音推廣器 v3.8...',
'node "tools\\rxv-small-pack-video-promoter-v3-8\\server.mjs"',
'pause',
'',
].join('\r\n');
fs.writeFileSync(path.join(ROOT, 'RXV-小包短影音推廣器-v3.8.cmd'), cmd, 'utf8');

console.log('SUCCESS: RXV 小包短影音推廣器 v3.8 Direct 已建立。');
console.log('基底：直接使用你本機目前可運作的 v3.6，不再經過 v3.7 builder。');
console.log('商品：房仲、美髮、美甲、美容SPA、牙醫。');
console.log('數量：開啟工具與產影片時會讀取網站 R2 catalog 最新數量。');
console.log('保留 v3.6：QR Code、LINE、MP3、音量、智慧滿版、各平台文案。');
console.log('輸出仍在 D:\\RXV-短影音輸出。');
console.log('下一步：& ".\\RXV-小包短影音推廣器-v3.8.cmd"');
