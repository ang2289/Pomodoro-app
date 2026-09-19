import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const v37Dir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-7');
const v38Dir = path.join(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-8');
const v37Server = path.join(v37Dir, 'server.mjs');
const v37Index = path.join(v37Dir, 'index.html');
const v37Builder = path.join(ROOT, 'scripts', 'build-rxv-small-pack-video-promoter-v3-7.mjs');

async function ensureV37() {
  if (fs.existsSync(v37Server) && fs.existsSync(v37Index)) return;
  if (!fs.existsSync(v37Builder)) throw new Error('找不到 v3.7 工具或 v3.7 建立腳本。');
  console.log('尚未找到 v3.7，本腳本先自動建立 v3.7...');
  await import(`${pathToFileURL(v37Builder).href}?run=${Date.now()}`);
  if (!fs.existsSync(v37Server) || !fs.existsSync(v37Index)) throw new Error('自動建立 v3.7 後仍找不到工具本體。');
}

function replaceBetween(text, start, end, replacement, label) {
  const a = text.indexOf(start);
  const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`找不到 ${label} 區塊。`);
  return text.slice(0, a) + replacement + text.slice(b);
}

await ensureV37();
fs.mkdirSync(v38Dir, { recursive: true });
let server = fs.readFileSync(v37Server, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(v37Index, 'utf8').replace(/\r\n/g, '\n');
server = server.replaceAll('rxv-small-pack-video-promoter-v3-7', 'rxv-small-pack-video-promoter-v3-8').replaceAll('v3.7', 'v3.8');
html = html.replaceAll('v3.7', 'v3.8');

const serverProducts = `const PRODUCTS = {
  realEstate: {
    short: '房仲', slug: 'real-estate', catalogKey: 'realEstate', name: 'RXV 房仲帶看宣傳圖片包', count: '83 張', price: 99,
    pain: '每天發房仲貼文，還在花時間找圖？',
    uses: ['帶看宣傳', '賀成交', '交屋紀錄', '社區公設', '生活機能', '房仲社群貼文'],
    benefits: ['帶看宣傳更省時間', '成交賀圖快速完成', '交屋貼文直接套用', '社區特色更好呈現', '生活機能貼文不缺圖', '社群經營每天都有素材'],
  },
  hair: {
    short: '美髮', slug: 'hair', catalogKey: 'hair', name: 'RXV 美髮沙龍職業圖片包', count: '133 張', price: 99,
    pain: '每天發美髮貼文，還在到處找圖片？',
    uses: ['剪髮', '染燙', '洗護', '髮型諮詢', '完成造型', '預約宣傳', '沙龍日常'],
    benefits: ['剪髮作品快速發文', '染燙服務更有質感', '洗護內容不用再找圖', '諮詢情境直接套用', '完成造型展示更方便', '預約宣傳快速完成', '沙龍日常持續有素材'],
  },
  manicure: {
    short: '美甲', slug: 'manicure', catalogKey: 'manicure', name: 'RXV 美甲職業圖片包', count: '133 張', price: 99,
    pain: '每天發美甲貼文，還在花時間找素材？',
    uses: ['凝膠美甲', '手部保養', '款式展示', '色系提案', '預約宣傳', '美甲日常'],
    benefits: ['作品展示快速完成', '手部保養內容更好發', '款式靈感直接套用', '色系提案不缺圖', '預約宣傳更省時間', '社群每天都有素材'],
  },
  spa: {
    short: '美容SPA', slug: 'beauty-spa', catalogKey: 'spa', name: 'RXV 美容SPA職業圖片包', count: '135 張', price: 99,
    pain: '美容 SPA 每天要發文，還在重新找圖？',
    uses: ['臉部保養', '身體按摩', '芳療', '療程介紹', '環境氛圍', '預約宣傳'],
    benefits: ['保養服務更好呈現', '按摩情境直接使用', '芳療貼文快速完成', '療程介紹不缺圖', '質感環境更吸睛', '預約宣傳更省時間'],
  },
  dental: {
    short: '牙醫', slug: 'dental', catalogKey: 'dental', name: 'RXV 牙醫職業圖片包', count: '104 張', price: 99,
    pain: '牙醫診所做衛教與宣傳，還在到處找圖片？',
    uses: ['看診情境', '牙齒衛教', '設備消毒', '醫病溝通', '診所環境', '預約宣傳'],
    benefits: ['看診內容快速發文', '衛教貼文更容易理解', '專業設備情境可直接用', '溝通情境更自然', '診所形象更完整', '預約宣傳更省時間'],
  },
};

`;
server = replaceBetween(server, 'const PRODUCTS = {', 'const TEMPLATES =', serverProducts + 'const TEMPLATES =', 'server PRODUCTS');

const catalogHelperMarker = 'const AUTO_RATIO_TOLERANCE = 0.08;';
if (!server.includes(catalogHelperMarker)) throw new Error('找不到 AUTO_RATIO_TOLERANCE。');
const catalogHelpers = `

const CATALOG_URL = process.env.RXV_PUBLIC_CATALOG_URL || 'https://pub-ebdb1fc3a20543dca4f4df036cedd868.r2.dev/catalog/images-public.json';
const CATALOG_CATEGORY_MAP = {
  realEstate: ['房仲／房地產', '房仲/房地產', '房仲／房地產 '],
  hair: ['美髮／沙龍', '美髮/沙龍'],
  manicure: ['美甲'],
  spa: ['美容SPA', '美容 SPA', '美容／SPA'],
  dental: ['牙醫'],
};

function catalogItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.images)) return payload.images;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function getCatalogStats() {
  const joiner = CATALOG_URL.includes('?') ? '&' : '?';
  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });
  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);
  const items = catalogItems(await response.json());
  const counts = {};
  for (const key of Object.keys(CATALOG_CATEGORY_MAP)) counts[key] = 0;
  for (const item of items) {
    const category = String(item?.category_name || item?.category || '').trim();
    for (const [key, aliases] of Object.entries(CATALOG_CATEGORY_MAP)) {
      if (aliases.some((name) => name.trim() === category)) counts[key] += 1;
    }
  }
  return { ok: true, total: items.length, counts, source: CATALOG_URL, checkedAt: new Date().toISOString() };
}
`;
server = server.replace(catalogHelperMarker, catalogHelperMarker + catalogHelpers);

const renderProductLine = "    const product = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;";
if (!server.includes(renderProductLine)) throw new Error('找不到 render product 設定。');
server = server.replace(renderProductLine, `    const baseProduct = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;
    let product = { ...baseProduct };
    try {
      const liveStats = await getCatalogStats();
      const liveCount = Number(liveStats.counts?.[baseProduct.catalogKey] || 0);
      if (liveCount > 0) product.count = \`${'${liveCount}'} 張\`;
    } catch (catalogError) {
      console.warn('[RXV v3.8 catalog stats]', catalogError?.message || catalogError);
    }`);

const safeProductLine = "    const safeProduct = product.short === '美髮' ? 'hair' : 'real-estate';";
if (server.includes(safeProductLine)) server = server.replace(safeProductLine, "    const safeProduct = product.slug || 'image-pack';");

const renderRouteMarker = "app.post('/api/render', upload.fields([";
if (!server.includes(renderRouteMarker)) throw new Error('找不到 render route。');
server = server.replace(renderRouteMarker, `app.get('/api/catalog-stats', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await getCatalogStats());
  } catch (error) {
    res.status(502).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

${renderRouteMarker}`);

const htmlProducts = `const PRODUCTS={
realEstate:{short:'房仲',name:'RXV 房仲帶看宣傳圖片包',count:'83 張',price:99,pain:'每天發房仲貼文，還在花時間找圖？',uses:'帶看、成交、交屋、公設、生活機能、社群貼文'},
hair:{short:'美髮',name:'RXV 美髮沙龍職業圖片包',count:'133 張',price:99,pain:'每天發美髮貼文，還在到處找圖片？',uses:'剪髮、染燙、洗護、造型、預約宣傳、沙龍日常'},
manicure:{short:'美甲',name:'RXV 美甲職業圖片包',count:'133 張',price:99,pain:'每天發美甲貼文，還在花時間找素材？',uses:'凝膠美甲、手部保養、款式展示、色系提案、預約宣傳'},
spa:{short:'美容SPA',name:'RXV 美容SPA職業圖片包',count:'135 張',price:99,pain:'美容 SPA 每天要發文，還在重新找圖？',uses:'臉部保養、身體按摩、芳療、療程介紹、環境氛圍、預約宣傳'},
dental:{short:'牙醫',name:'RXV 牙醫職業圖片包',count:'104 張',price:99,pain:'牙醫診所做衛教與宣傳，還在到處找圖片？',uses:'看診情境、牙齒衛教、設備消毒、醫病溝通、診所環境、預約宣傳'}
};`;
html = replaceBetween(html, 'const PRODUCTS={', 'const PLATFORMS=', htmlProducts + '\nconst PLATFORMS=', 'frontend PRODUCTS');

html = html.replace(/<select id="product">[\s\S]*?<\/select>/, `<select id="product">
<option value="realEstate">房仲圖片包｜83 張｜NT$99</option>
<option value="hair">美髮沙龍圖片包｜133 張｜NT$99</option>
<option value="manicure">美甲圖片包｜133 張｜NT$99</option>
<option value="spa">美容SPA圖片包｜135 張｜NT$99</option>
<option value="dental">牙醫圖片包｜104 張｜NT$99</option>
</select>`);

const autoNotice = '<div class="good" style="margin-top:12px">自動判斷：接近 9:16 的直式圖會直接滿版；橫式、方形或比例差很多的圖片，才使用模糊背景並完整置中。</div>';
if (!html.includes(autoNotice)) throw new Error('找不到圖片比例提示區塊。');
html = html.replace(autoNotice, `<div class="good" style="margin-top:12px">
  <div class="row" style="justify-content:space-between"><span id="catalogStatus">正在同步網站最新上傳數量…</span><button id="refreshCatalogBtn" type="button" class="btn gray">重新同步數量</button></div>
</div>
${autoNotice}`);

const jsMarker = "async function copyText(text,button){";
if (!html.includes(jsMarker)) throw new Error('找不到 copyText JS 標記。');
const syncJs = `async function syncCatalogStats(){
  const status=$('catalogStatus');
  try{
    status.textContent='正在同步網站最新上傳數量…';
    const r=await fetch('/api/catalog-stats?t='+Date.now(),{cache:'no-store'});
    const data=await r.json();
    if(!r.ok||!data.ok)throw new Error(data.error||'同步失敗');
    const labelMap={realEstate:'房仲圖片包',hair:'美髮沙龍圖片包',manicure:'美甲圖片包',spa:'美容SPA圖片包',dental:'牙醫圖片包'};
    for(const [key,countRaw] of Object.entries(data.counts||{})){
      const count=Number(countRaw||0);
      if(!PRODUCTS[key]||count<=0)continue;
      PRODUCTS[key].count=count+' 張';
      const option=$('product').querySelector('option[value="'+key+'"]');
      if(option)option.textContent=labelMap[key]+'｜'+count+' 張｜NT$99';
    }
    status.textContent='網站即時數量：美髮 '+(data.counts?.hair||0)+'｜美甲 '+(data.counts?.manicure||0)+'｜美容SPA '+(data.counts?.spa||0)+'｜牙醫 '+(data.counts?.dental||0)+'｜房仲 '+(data.counts?.realEstate||0);
    renderCaptions();
  }catch(error){
    status.textContent='網站數量同步失敗，暫用工具內備用數量。';
    console.warn('[RXV v3.8 catalog]',error);
  }
}

`;
html = html.replace(jsMarker, syncJs + jsMarker);

const imagesMarker = "$('images').onchange=()=>{";
if (!html.includes(imagesMarker)) throw new Error('找不到 images onchange 標記。');
html = html.replace(imagesMarker, "$('refreshCatalogBtn').onclick=syncCatalogStats;\n" + imagesMarker);

const initMarker = 'renderCaptions();';
const lastInit = html.lastIndexOf(initMarker);
if (lastInit >= 0) html = html.slice(0, lastInit) + 'renderCaptions();syncCatalogStats();' + html.slice(lastInit + initMarker.length);
else throw new Error('找不到 renderCaptions 初始化。');

html = html.replace('實用版｜CTA 2/3/4 秒｜QR 大小｜輕柔轉場｜音量模式｜智慧滿版', '職業包即時版｜網站數量自動同步｜5 種商品｜CTA/QR｜MP3｜智慧滿版');

fs.writeFileSync(path.join(v38Dir, 'server.mjs'), server, 'utf8');
fs.writeFileSync(path.join(v38Dir, 'index.html'), html, 'utf8');

const cmd = `@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\ntitle RXV 小包短影音推廣器 v3.8\r\n\r\nif not exist "node_modules" (\r\n  echo 找不到 node_modules，請先執行 npm install\r\n  pause\r\n  exit /b 1\r\n)\r\n\r\necho 啟動 RXV 小包短影音推廣器 v3.8...\r\nnode "tools\\rxv-small-pack-video-promoter-v3-8\\server.mjs"\r\npause\r\n`;
fs.writeFileSync(path.join(ROOT, 'RXV-小包短影音推廣器-v3.8.cmd'), cmd, 'utf8');

console.log('RXV 小包短影音推廣器 v3.8 已建立。');
console.log('新增商品：美甲、美容SPA、牙醫；保留房仲、美髮。');
console.log('網站數量：工具開啟時會即時讀取 R2 catalog；產影片前也會重新讀取最新數量。');
console.log('目前備用數量：美髮133、美甲133、美容SPA135、牙醫104、房仲83。');
console.log('MP4 仍輸出到 D:\\RXV-短影音輸出。');
console.log('下一步：& ".\\RXV-小包短影音推廣器-v3.8.cmd"');
