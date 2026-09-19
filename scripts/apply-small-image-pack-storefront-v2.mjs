import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const targetFile = path.join(projectRoot, 'src', 'pages', 'images', 'index.tsx');
const backupDir = path.join(projectRoot, 'backup', 'small-image-pack-storefront-v2');
const marker = 'RXV_SMALL_PACKS_V2_START';

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function restoreLatestBackup() {
  if (!fs.existsSync(backupDir)) {
    throw new Error('找不到備份資料夾，無法還原。');
  }
  const files = fs.readdirSync(backupDir)
    .filter((name) => name.endsWith('.tsx'))
    .sort()
    .reverse();
  if (!files.length) throw new Error('找不到可還原的 index.tsx 備份。');
  const source = path.join(backupDir, files[0]);
  fs.copyFileSync(source, targetFile);
  console.log(`已還原：${source}`);
}

if (process.argv.includes('--restore')) {
  restoreLatestBackup();
  process.exit(0);
}

if (!fs.existsSync(targetFile)) {
  throw new Error(`找不到檔案：${targetFile}`);
}

let source = fs.readFileSync(targetFile, 'utf8');
if (source.includes(marker)) {
  console.log('小包販售區 v2 已套用，不重複修改。');
  process.exit(0);
}

const startToken = '          <div className="mb-6 rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-5 py-6 text-center shadow-sm">';
const endToken = '\n\n          <p className="text-base sm:text-lg text-gray-600">';
const start = source.indexOf(startToken);
const end = source.indexOf(endToken, start);

if (start < 0 || end < 0) {
  throw new Error('找不到圖片素材庫方案區塊。程式未修改任何檔案。');
}

fs.mkdirSync(backupDir, { recursive: true });
const backupFile = path.join(backupDir, `images-index-${stamp()}.tsx`);
fs.copyFileSync(targetFile, backupFile);

const replacement = `          {/* ${marker} */}
          <div className="mb-6 rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-5 py-6 text-center shadow-sm">
            <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-sm font-black text-white">完整素材庫限時方案</span>
            <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">{libraryTotalLabel} 張高畫質圖片素材庫完整版</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              食物、花卉、商業圖、社群背景、桌布、節慶與更多分類，持續增加。適合網站、社群貼文、廣告、YouTube／短影音與商業設計使用。
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                <span className="text-lg font-bold text-slate-500 line-through">原價 NT$399</span>
                <span className="text-3xl font-black text-rose-600">限時優惠 NT$199</span>
              </div>
              <Link
                to="/payment/bank-transfer?product=image-bundle-full"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                立即取得完整素材庫
              </Link>
            </div>
            <p className="mt-3 text-sm font-bold text-rose-700">首波限時優惠 NT$199，優惠結束後恢復原價 NT$399。</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">網站保留部分圖片免費下載試用；完整版素材不可轉售、轉包或作為素材庫再次販售。</p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-amber-800">房仲、美髮等「專業職業主題包」為另外整理的商品，不包含在 NT$199 綜合素材庫方案內。</p>
          </div>

          <section className="mb-6 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50 px-5 py-6 text-left shadow-sm">
            <div className="text-center">
              <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-sm font-black !text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>依行業直接買｜專業主題小包</span>
              <h2 className="mt-3 text-2xl font-black text-slate-950">只買自己行業會用到的圖｜NT$99／包</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">小包採「用途_圖片名」命名，ZIP 內附商品介紹、使用說明與授權說明；之後可持續增加美甲、SPA、餐飲等主題。</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-emerald-700">房仲／房地產</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">房仲帶看宣傳圖片包</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">83 張｜住宅帶看、成交交屋、公設社區、驗屋與生活機能。</p>
                  </div>
                  <div className="text-2xl font-black text-rose-600">NT$99</div>
                </div>
                <a href="/image-packs.html#products" className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                  查看內容／購買 NT$99
                </a>
              </article>

              <article className="rounded-2xl border border-fuchsia-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-fuchsia-700">美容／時尚</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">美髮沙龍職業圖片包</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">接待、洗護、剪髮、染燙、完成造型、預約宣傳與專業工具等素材。</p>
                  </div>
                  <div className="text-2xl font-black text-rose-600">NT$99</div>
                </div>
                <a href="/image-packs.html#products" className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-fuchsia-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-fuchsia-700" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                  查看內容／購買 NT$99
                </a>
              </article>
            </div>
          </section>`;

source = source.slice(0, start) + replacement + source.slice(end);
source = source.replace('其餘可加入 NT$399 完整素材庫。', '其餘可加入完整素材庫方案。');
source = source.replace('先讓使用者專注瀏覽 NT$399 圖片素材庫。', '先讓使用者專注瀏覽圖片素材庫。');
fs.writeFileSync(targetFile, source, 'utf8');

console.log('RXV 小包販售區 v2 已套用。');
console.log(`修改：${targetFile}`);
console.log(`備份：${backupFile}`);
console.log('測試網址：http://localhost:3005/images');
console.log('小包頁：http://localhost:3005/image-packs.html');
console.log('如要還原：node scripts/apply-small-image-pack-storefront-v2.mjs --restore');
