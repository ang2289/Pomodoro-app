import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const imagesFile = path.join(projectRoot, 'src', 'pages', 'images', 'index.tsx');
const appFile = path.join(projectRoot, 'src', 'App.tsx');
const pageFile = path.join(projectRoot, 'src', 'pages', 'ImagePacksPage.tsx');
const backupRoot = path.join(projectRoot, 'backup', 'small-image-pack-storefront-v3');

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function latestBackupDir() {
  if (!fs.existsSync(backupRoot)) return null;
  const dirs = fs.readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  return dirs.length ? path.join(backupRoot, dirs[0]) : null;
}

function restoreLatestBackup() {
  const dir = latestBackupDir();
  if (!dir) throw new Error('找不到 v3 備份，無法還原。');

  const imagesBackup = path.join(dir, 'images-index.tsx');
  const appBackup = path.join(dir, 'App.tsx');

  if (fs.existsSync(imagesBackup)) fs.copyFileSync(imagesBackup, imagesFile);
  if (fs.existsSync(appBackup)) fs.copyFileSync(appBackup, appFile);

  console.log(`已還原：${dir}`);
}

if (process.argv.includes('--restore')) {
  restoreLatestBackup();
  process.exit(0);
}

for (const file of [imagesFile, appFile, pageFile]) {
  if (!fs.existsSync(file)) throw new Error(`找不到檔案：${file}`);
}

const backupDir = path.join(backupRoot, stamp());
fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(imagesFile, path.join(backupDir, 'images-index.tsx'));
fs.copyFileSync(appFile, path.join(backupDir, 'App.tsx'));

let imagesSource = fs.readFileSync(imagesFile, 'utf8');
let appSource = fs.readFileSync(appFile, 'utf8');

// 1) 將舊靜態小包頁入口改成 React 路由，讓 MainLayout 自動提供網站表頭、語言切換、手機導航與頁尾。
imagesSource = imagesSource
  .replaceAll('/image-packs.html#products', '/image-packs#pack-products')
  .replaceAll('/image-packs.html', '/image-packs');

// 2) 若本機還沒套用 v2 區塊，只補一個最小入口，不碰既有 NT$199 方案內容。
if (!imagesSource.includes('/image-packs#pack-products')) {
  const anchor = '          <p className="text-base sm:text-lg text-gray-600">';
  const index = imagesSource.indexOf(anchor);
  if (index < 0) throw new Error('找不到 /images 插入位置，未修改任何檔案。');

  const insert = `          <section className="mb-6 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50 px-5 py-6 text-left shadow-sm">\n            <div className="text-center">\n              <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-sm font-black !text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>依行業直接買｜專業主題小包</span>\n              <h2 className="mt-3 text-2xl font-black text-slate-950">只買自己行業會用到的圖｜NT$99／包</h2>\n              <p className="mt-2 text-sm leading-relaxed text-slate-600">房仲、美髮等專業職業主題包另售；ZIP 內附使用說明與授權說明。</p>\n              <Link to="/image-packs#pack-products" className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-black !text-white shadow-sm transition hover:bg-violet-700" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>查看專業小包 NT$99</Link>\n            </div>\n          </section>\n\n`;
  imagesSource = imagesSource.slice(0, index) + insert + imagesSource.slice(index);
}

// 3) App.tsx 加入頁面 import。
const importLine = "import ImagePacksPage from './pages/ImagePacksPage'";
if (!appSource.includes(importLine)) {
  const importAnchor = "import ImagesPage from './pages/images'";
  if (!appSource.includes(importAnchor)) throw new Error('找不到 ImagesPage import，未修改 App.tsx。');
  appSource = appSource.replace(importAnchor, `${importAnchor}\n${importLine}`);
}

// 4) 加入 /image-packs 路由。此路由放在 MainLayout 巢狀路由內，所以會自動使用網站既有表頭與 SiteFooter。
const routeLine = '            <Route path="image-packs" element={<ImagePacksPage />} />';
if (!appSource.includes(routeLine)) {
  const routeAnchor = '            <Route path="images" element={<ImagesPage />} />';
  if (!appSource.includes(routeAnchor)) throw new Error('找不到 images 路由，未修改 App.tsx。');
  appSource = appSource.replace(routeAnchor, `${routeAnchor}\n${routeLine}`);
}

fs.writeFileSync(imagesFile, imagesSource, 'utf8');
fs.writeFileSync(appFile, appSource, 'utf8');

console.log('RXV 小包販售頁 v3 已套用。');
console.log('重點：/image-packs 現在使用網站原本的 MainLayout，因此會顯示既有表頭、語言切換、手機導航與頁尾。');
console.log(`備份：${backupDir}`);
console.log('圖片頁：http://localhost:3005/images');
console.log('小包頁：http://localhost:3005/image-packs');
console.log('如要還原：node scripts/apply-small-image-pack-storefront-v3.mjs --restore');
