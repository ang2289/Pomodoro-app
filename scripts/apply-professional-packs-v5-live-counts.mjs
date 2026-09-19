import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const imagesFile = path.join(ROOT, 'src', 'pages', 'images', 'index.tsx');
const packsFile = path.join(ROOT, 'src', 'pages', 'ImagePacksPage.tsx');
const backupDir = path.join(ROOT, 'backup', 'professional-packs-v5-live-counts');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

function mustFile(file) {
  if (!fs.existsSync(file)) throw new Error('找不到：' + file);
}
function backup(file) {
  const out = path.join(backupDir, path.basename(file) + '.' + stamp + '.bak');
  fs.copyFileSync(file, out);
  return out;
}
function replaceBetween(text, start, end, replacement, label) {
  const a = text.indexOf(start);
  const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error('找不到 ' + label + ' 區塊，未修改。');
  return text.slice(0, a) + replacement + text.slice(b);
}

mustFile(imagesFile);
mustFile(packsFile);
const imagesBackup = backup(imagesFile);
const packsBackup = backup(packsFile);

let images = fs.readFileSync(imagesFile, 'utf8').replace(/\r\n/g, '\n');
let packs = fs.readFileSync(packsFile, 'utf8').replace(/\r\n/g, '\n');

// 1) /images：加入 5 個專業小包即時張數（直接使用已載入的 manifest / categories）。
const totalStateNeedle = '  const [totalImages, setTotalImages] = useState<number | null>(null);';
const countBlock = `  const [totalImages, setTotalImages] = useState<number | null>(null);\n\n  // RXV_PRO_PACK_LIVE_COUNTS：由目前網站 manifest 已載入資料即時計算，不另外打 API。\n  const getProfessionalPackCount = (aliases: string[], fallback: number) => {\n    if (allImages.length === 0 || categories.length === 0) return fallback;\n    const categoryIds = new Set(\n      categories\n        .filter((category) => aliases.includes(String(category.name || '').trim()))\n        .map((category) => category.id),\n    );\n    if (categoryIds.size === 0) return fallback;\n    const count = allImages.filter(\n      (image) => image.category_id && categoryIds.has(image.category_id),\n    ).length;\n    return count > 0 ? count : fallback;\n  };\n\n  const professionalPackCounts = {\n    realEstate: getProfessionalPackCount(['房仲／房地產', '房仲/房地產'], 115),\n    hairSalon: getProfessionalPackCount(['美髮／沙龍', '美髮/沙龍'], 133),\n    manicure: getProfessionalPackCount(['美甲'], 133),\n    beautySpa: getProfessionalPackCount(['美容SPA', '美容 SPA', '美容／SPA'], 135),\n    dental: getProfessionalPackCount(['牙醫'], 104),\n  };`;
if (!images.includes('RXV_PRO_PACK_LIVE_COUNTS')) {
  if (!images.includes(totalStateNeedle)) throw new Error('找不到 /images totalImages state。');
  images = images.replace(totalStateNeedle, countBlock);
}

const sectionStart = '        {/* RXV_PRO_PACK_ENTRY */}';
const sectionEnd = '        {/* 分類篩選：手機版改成橫向滑動，避免按鈕全部擠在一起。 */}';
const newSection = `        {/* RXV_PRO_PACK_ENTRY */}\n        <section className="mb-6 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">\n          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">\n            <div>\n              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1.5 text-sm font-black text-violet-800">專業職業主題包｜NT$99／包</span>\n              <h2 className="mt-3 text-2xl font-black text-slate-950">只買自己行業真正會用到的圖</h2>\n              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">房仲、美髮、美甲、美容 SPA、牙醫等職業情境另外整理成專業小包，檔名直接標示用途。專業小包為獨立商品，不包含在 NT$199 綜合素材庫方案內。</p>\n              <div className="mt-4 flex flex-wrap gap-2">\n                <span className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-800">房仲帶看宣傳圖片包｜{professionalPackCounts.realEstate} 張｜NT$99</span>\n                <span className="rounded-full border border-fuchsia-200 bg-white px-3 py-2 text-sm font-black text-fuchsia-800">美髮沙龍職業圖片包｜{professionalPackCounts.hairSalon} 張｜NT$99</span>\n                <span className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm font-black text-rose-800">美甲職業圖片包｜{professionalPackCounts.manicure} 張｜NT$99</span>\n                <span className="rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-black text-amber-800">美容 SPA 職業圖片包｜{professionalPackCounts.beautySpa} 張｜NT$99</span>\n                <span className="rounded-full border border-sky-200 bg-white px-3 py-2 text-sm font-black text-sky-800">牙醫職業圖片包｜{professionalPackCounts.dental} 張｜NT$99</span>\n              </div>\n            </div>\n            <Link\n              to="/image-packs"\n              className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-700"\n              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n            >\n              查看 5 款 NT$99 專業圖片包\n            </Link>\n          </div>\n        </section>\n\n`;
images = replaceBetween(images, sectionStart, sectionEnd, newSection + sectionEnd, '/images 專業小包');

// 2) /image-packs：擴充成 5 包，並直接從同一份 public manifest 同步張數。
packs = packs.replace("import { useMemo, useState } from 'react'", "import { useEffect, useMemo, useState } from 'react'");

const typeStart = 'type Pack = {';
const typeEnd = 'const PACKS: Pack[] = [';
const newTypes = `type PackId = 'real-estate' | 'hair-salon' | 'manicure' | 'beauty-spa' | 'dental'\n\ntype Pack = {\n  id: PackId\n  category: string\n  name: string\n  amount: number\n  fallbackCount: number\n  aliases: string[]\n  badge: string\n  description: string\n  details: string[]\n  accent: 'emerald' | 'fuchsia'\n}\n\n`;
packs = replaceBetween(packs, typeStart, typeEnd, newTypes + typeEnd, 'ImagePacks type');

const packsEnd = ']\n\nconst CONTACT_EMAIL';
const newPacks = `const PACKS: Pack[] = [\n  {\n    id: 'real-estate',\n    category: '房仲／房地產',\n    name: 'RXV 房仲帶看宣傳圖片包',\n    amount: 99,\n    fallbackCount: 115,\n    aliases: ['房仲／房地產', '房仲/房地產'],\n    badge: '職業行銷素材',\n    description: '住宅帶看、成交交屋、公設社區、實務看屋驗屋與生活機能等房仲行銷情境。',\n    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明、授權與使用說明', '可加字、Logo、電話與 CTA 後商用'],\n    accent: 'emerald',\n  },\n  {\n    id: 'hair-salon',\n    category: '美髮／沙龍',\n    name: 'RXV 美髮沙龍職業圖片包',\n    amount: 99,\n    fallbackCount: 133,\n    aliases: ['美髮／沙龍', '美髮/沙龍'],\n    badge: '多場景職業素材',\n    description: '髮型諮詢、洗護、剪髮、染燙、完成造型、髮廊日常、預約宣傳與專業工具等情境。',\n    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明、授權與使用說明', '適合髮廊網站、社群、廣告與預約宣傳'],\n    accent: 'fuchsia',\n  },\n  {\n    id: 'manicure',\n    category: '美甲',\n    name: 'RXV 美甲職業圖片包',\n    amount: 99,\n    fallbackCount: 133,\n    aliases: ['美甲'],\n    badge: '美甲宣傳素材',\n    description: '凝膠美甲、手部保養、款式展示、色系提案、預約宣傳與美甲日常等情境。',\n    details: ['適合社群貼文與預約宣傳', '可加入品牌 Logo、電話與 CTA', '小店家可直接挑圖使用'],\n    accent: 'emerald',\n  },\n  {\n    id: 'beauty-spa',\n    category: '美容SPA',\n    name: 'RXV 美容 SPA 職業圖片包',\n    amount: 99,\n    fallbackCount: 135,\n    aliases: ['美容SPA', '美容 SPA', '美容／SPA'],\n    badge: '美容芳療素材',\n    description: '臉部保養、身體按摩、芳療、療程介紹、環境氛圍與預約宣傳等情境。',\n    details: ['適合美容工作室與 SPA', '可做療程介紹、社群與廣告', '可加入品牌資訊後商用'],\n    accent: 'fuchsia',\n  },\n  {\n    id: 'dental',\n    category: '牙醫',\n    name: 'RXV 牙醫職業圖片包',\n    amount: 99,\n    fallbackCount: 104,\n    aliases: ['牙醫'],\n    badge: '診所宣傳素材',\n    description: '看診情境、牙齒衛教、設備消毒、醫病溝通、診所環境與預約宣傳等情境。',\n    details: ['適合診所網站與衛教貼文', '可做預約、設備與服務介紹', '可加入診所品牌資訊後使用'],\n    accent: 'emerald',\n  },\n]\n\nconst CONTACT_EMAIL`;
packs = replaceBetween(packs, 'const PACKS: Pack[] = [', packsEnd, newPacks, 'ImagePacks PACKS');

const emailNeedle = "const CONTACT_EMAIL = 'rxv0227@gmail.com'";
const manifestConstants = `const PUBLIC_R2_MANIFEST_BASE = String(import.meta.env.VITE_PUBLIC_R2_URL || '').replace(/\\/$/, '')\nconst IMAGE_MANIFEST_URL = PUBLIC_R2_MANIFEST_BASE\n  ? \`${'${PUBLIC_R2_MANIFEST_BASE}'}/catalog/images-public.json\`\n  : import.meta.env.VITE_IMAGE_MANIFEST_URL || '/data/images-public.json'\n\n`;
if (!packs.includes('const IMAGE_MANIFEST_URL =')) {
  if (!packs.includes(emailNeedle)) throw new Error('找不到 ImagePacks CONTACT_EMAIL。');
  packs = packs.replace(emailNeedle, manifestConstants + emailNeedle);
}

const selectedNeedle = "  const [selectedId, setSelectedId] = useState<Pack['id'] | null>(null)";
const liveState = `${selectedNeedle}\n  const [liveCounts, setLiveCounts] = useState<Record<PackId, number>>(() =>\n    Object.fromEntries(PACKS.map((pack) => [pack.id, pack.fallbackCount])) as Record<PackId, number>,\n  )\n\n  useEffect(() => {\n    let cancelled = false\n    ;(async () => {\n      try {\n        const response = await fetch(IMAGE_MANIFEST_URL, { cache: 'no-cache' })\n        if (!response.ok) throw new Error('HTTP ' + response.status)\n        const raw = await response.json()\n        const manifest = Array.isArray(raw) ? { images: raw, categories: [] } : raw\n        const items = Array.isArray(manifest?.images) ? manifest.images : []\n        const categories = Array.isArray(manifest?.categories) ? manifest.categories : []\n        const nameById = new Map(categories.map((category: any) => [String(category?.id || ''), String(category?.name || '')]))\n        const next = Object.fromEntries(PACKS.map((pack) => [pack.id, 0])) as Record<PackId, number>\n        for (const item of items) {\n          const categoryName = String(\n            item?.category_name || item?.category || nameById.get(String(item?.category_id || '')) || '',\n          ).trim()\n          for (const pack of PACKS) {\n            if (pack.aliases.includes(categoryName)) next[pack.id] += 1\n          }\n        }\n        for (const pack of PACKS) {\n          if (next[pack.id] <= 0) next[pack.id] = pack.fallbackCount\n        }\n        if (!cancelled) setLiveCounts(next)\n      } catch (error) {\n        console.warn('專業小包張數同步失敗，使用備用數量', error)\n      }\n    })()\n    return () => { cancelled = true }\n  }, [])`;
if (!packs.includes('const [liveCounts,')) {
  if (!packs.includes(selectedNeedle)) throw new Error('找不到 ImagePacks selectedId state。');
  packs = packs.replace(selectedNeedle, liveState);
}

packs = packs.replace(
  '目前先上架房仲與美髮；之後可持續增加美甲、SPA、餐飲等職業主題。',
  '目前已上架房仲、美髮、美甲、美容 SPA、牙醫 5 款專業圖片小包；之後還可持續增加更多職業主題。',
);
packs = packs.replace(
  '{pack.badge}',
  "{liveCounts[pack.id] ?? pack.fallbackCount} 張｜{pack.badge}",
);

fs.writeFileSync(imagesFile, images, 'utf8');
fs.writeFileSync(packsFile, packs, 'utf8');

console.log('SUCCESS: 5 款 NT$99 專業圖片包已套用。');
console.log('包含：房仲、美髮、美甲、美容SPA、牙醫。');
console.log('張數：由網站 public manifest 即時統計；讀取失敗才使用備用數量。');
console.log('備用數量：房仲115、美髮133、美甲133、美容SPA135、牙醫104。');
console.log('已修改：src/pages/images/index.tsx');
console.log('已修改：src/pages/ImagePacksPage.tsx');
console.log('備份：' + imagesBackup);
console.log('備份：' + packsBackup);
console.log('下一步：npm run build');
