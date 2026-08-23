/**
 * Local-only second pass for unresolved catalogue entries.
 * Uses balanced multilingual CLIP prompt ensembles; no Supabase or paid API.
 */
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const root = process.cwd();
const privateDir = path.join(root, "private-data");
const masterPath = path.join(privateDir, "images-master.json");
const reviewPath = path.join(privateDir, "category-review.json");
const overridesPath = path.join(privateDir, "category-overrides.json");
const publicPath = path.join(root, "public", "data", "images-public.json");
const modelCacheDir = path.join(root, ".local-tools", "image-classifier", "model-cache");
const dryRun = process.argv.includes("--dry-run");

function loadEnv(file) {
  const filePath = path.join(root, file); if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/); if (!match) continue;
    let value = match[2].trim(); if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (value && !process.env[match[1]]) process.env[match[1]] = value;
  }
}
loadEnv(".env.local"); loadEnv(".env");
const required = ["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
const missing = required.filter((name) => !process.env[name]); if (missing.length) throw new Error(`R2_ENV_MISSING:${missing.join(",")}`);

const profiles = {
  "food-drink": ["food and drink", "coffee dessert beverage", "restaurant Taiwanese food", "bakery cake meal", "美食 飲料 甜點 咖啡", "餐廳 食物 點心"],
  "business-office": ["office workplace", "business meeting corporate", "professional desk workspace", "company office interior", "商業 辦公 會議", "企業 工作 空間"],
  "product-display": ["product photography", "commercial product display", "ecommerce product packaging", "product mockup advertising", "商品 展示 攝影", "電商 包裝 廣告"],
  "beauty-fashion": ["beauty cosmetics skincare", "fashion clothing accessories", "makeup salon beauty", "stylish fashion portrait", "美容 化妝 保養", "時尚 服飾 配件"],
  "home-lifestyle": ["home lifestyle interior", "living room home decor", "daily life household", "kitchen home living", "居家 生活 室內", "家居 日常 空間"],
  "education": ["education learning school", "books study classroom", "teaching student learning", "academic school supplies", "教育 學習 書本", "學校 課堂 文具"],
  "pet-animal": ["pet dog cat", "animal wildlife", "cute animal aquarium", "animal portrait", "寵物 狗 貓 動物", "野生 動物 水族"],
  "wedding-event": ["wedding ceremony", "party event celebration", "banquet event decor", "birthday celebration", "婚禮 活動 派對", "慶典 宴會 生日"],
  "travel-hotel": ["travel hotel tourism", "hotel room resort", "vacation destination", "travel accommodation", "旅遊 住宿 飯店", "觀光 度假 行程"],
  "finance": ["finance banking investment", "money savings wealth", "financial business chart", "insurance accounting", "金融 理財 投資", "銀行 金錢 保險"],
  "professional-service": ["professional service", "healthcare clinic service", "legal consulting service", "repair maintenance service", "專業 服務 醫療", "法律 顧問 維修"],
  "taiwan-local": ["Taiwan local life", "Taiwan street food", "Taiwan city street", "local Taiwanese culture", "台灣 在地 生活", "台灣 街景 小吃"],
  "flower-plant": ["flower floral plant", "botanical garden bouquet", "blossom leaves nature", "floral arrangement", "花卉 植物 園藝", "花束 開花 葉子"],
  "nature-landscape": ["nature landscape scenery", "mountain ocean lake", "forest sunset outdoor", "natural scenery travel", "自然 風景 山 海", "森林 湖泊 日落"],
  "background-wallpaper": ["abstract background wallpaper", "texture decorative pattern", "gradient background", "minimal wallpaper design", "背景 桌布 紋理", "抽象 漸層 圖案"],
  "festival": ["festival holiday celebration", "Christmas New Year holiday", "seasonal festival decoration", "traditional holiday event", "節慶 節日 慶祝", "新年 聖誕 假日"],
  "religion-healing": ["religion spiritual healing", "meditation wellness spiritual", "temple Buddhist religious", "relaxation healing", "宗教 療癒 靜心", "寺廟 佛教 靈性"],
  "technology": ["technology digital devices", "computer smartphone electronics", "AI data digital technology", "software internet screen", "科技 數位 電腦", "手機 電子 人工智慧"],
  "other": ["miscellaneous image", "general illustration", "unclassified visual", "other subject", "其他 素材", "未分類 圖片"],
};
const categoryNames = new Map([["food-drink","食物／飲品"],["business-office","商業／辦公"],["product-display","商品展示"],["beauty-fashion","美容／時尚"],["home-lifestyle","居家／生活"],["education","教育／學習"],["pet-animal","寵物／動物"],["wedding-event","婚禮／活動"],["travel-hotel","旅遊／住宿"],["finance","金融／理財"],["professional-service","專業服務"],["taiwan-local","台灣在地生活"],["flower-plant","花卉／植物"],["nature-landscape","自然／風景"],["background-wallpaper","背景／桌布"],["festival","節慶／節日"],["religion-healing","宗教／療癒"],["technology","科技／數位"],["other","其他素材"]]);
const candidateLabels = Object.entries(profiles).flatMap(([category, prompts]) => prompts.map((prompt, index) => `${category}::${index}::${prompt}`));
const labelCategory = new Map(candidateLabels.map((label) => [label, label.split("::")[0]]));

const r2 = new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY }, maxAttempts: 5 });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function toBuffer(body) { if (body?.transformToByteArray) return Buffer.from(await body.transformToByteArray()); const chunks = []; for await (const chunk of Readable.from(body)) chunks.push(Buffer.from(chunk)); return Buffer.concat(chunks); }
async function getThumbnail(key) { let last; for (let attempt = 1; attempt <= 4; attempt += 1) { try { const result = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })); const body = await toBuffer(result.Body); if (!body.length) throw new Error("THUMBNAIL_EMPTY"); return body; } catch (error) { last = error; if (attempt < 4) await sleep(attempt * 900); } } throw last; }

const localRequire = createRequire(path.join(root, ".local-tools", "image-classifier", "package.json"));
const module = await import(pathToFileURL(localRequire.resolve("@huggingface/transformers")).href);
const { pipeline, env, RawImage } = module.default || module;
env.cacheDir = modelCacheDir; env.allowLocalModels = false; env.useBrowserCache = false;
const classifier = await pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32", { dtype: "q8" });

const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
if (!Array.isArray(master.images) || master.images.length !== 1583) throw new Error("MASTER_COUNT_UNEXPECTED");
const manualOverrides = new Map();
if (fs.existsSync(overridesPath)) {
  const raw = JSON.parse(fs.readFileSync(overridesPath, "utf8")); const entries = Array.isArray(raw) ? raw : raw.overrides;
  for (const entry of entries || []) if (entry?.id && categoryNames.has(entry.category)) manualOverrides.set(entry.id, entry.category);
}
for (const image of master.images) {
  const category = manualOverrides.get(image.id); if (!category) continue;
  image.category = category; image.category_name = categoryNames.get(category); image.title = `${image.category_name}素材`; image.needs_review = false; image.reviewed_at = image.reviewed_at || new Date().toISOString();
}
const pending = master.images.filter((image) => image.needs_review && !manualOverrides.has(image.id));
const batchSize = 16; let reclassified = 0; const unresolved = [];
for (let start = 0; start < pending.length; start += batchSize) {
  const batch = pending.slice(start, start + batchSize); const buffers = [];
  for (const image of batch) { if (!image.thumbnail_key) throw new Error(`THUMBNAIL_KEY_MISSING:${image.id}`); buffers.push(await getThumbnail(image.thumbnail_key)); }
  const rawImages = await Promise.all(buffers.map((buffer) => RawImage.fromBlob(new Blob([buffer], { type: "image/webp" }))));
  const outputs = await classifier(rawImages, candidateLabels, { hypothesis_template: "a representative image of {}" });
  for (let i = 0; i < batch.length; i += 1) {
    const image = batch[i]; const scores = new Map(Object.keys(profiles).map((id) => [id, 0]));
    for (const result of outputs[i]) scores.set(labelCategory.get(result.label), scores.get(labelCategory.get(result.label)) + result.score);
    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]); const [top1, top1Score] = ranked[0]; const [top2, top2Score] = ranked[1]; const gap = top1Score - top2Score;
    image.second_pass_top1_category = top1; image.second_pass_top1_score = Number(top1Score.toFixed(4)); image.second_pass_top2_category = top2; image.second_pass_top2_score = Number(top2Score.toFixed(4)); image.second_pass_score_gap = Number(gap.toFixed(4)); image.previous_category = image.category;
    // Balanced six-prompt ensemble. These thresholds intentionally favor review over a forced class.
    const accepted = top1 !== "other" && top1Score >= 0.20 && gap >= 0.055;
    if (accepted) { image.category = top1; image.category_name = categoryNames.get(top1); image.title = `${image.category_name}素材`; image.needs_review = false; reclassified += 1; }
    else { image.category = "other"; image.category_name = categoryNames.get("other"); image.needs_review = true; unresolved.push({ id: image.id, suggested_category_id: top1, suggested_category_name: categoryNames.get(top1), confidence: Number(top1Score.toFixed(4)), second_category_id: top2, second_category_name: categoryNames.get(top2), second_confidence: Number(top2Score.toFixed(4)), score_gap: Number(gap.toFixed(4)), previous_category: image.previous_category, needs_review: true, thumbnail_file: `category-review-thumbnails/${image.id}.webp` }); }
  }
  console.log(`SECOND_PASS ${Math.min(start + batch.length, pending.length)}/${pending.length}`);
}
const counts = Object.fromEntries([...categoryNames.entries()].map(([id, name]) => [id, { name, count: 0 }])); for (const image of master.images) counts[image.category || "other"].count += 1;
if (!dryRun) {
  master.generated_at = new Date().toISOString(); master.total = master.images.length;
  fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`);
  fs.writeFileSync(reviewPath, `${JSON.stringify({ version: 2, generated_at: master.generated_at, total: unresolved.length, images: unresolved }, null, 2)}\n`);
  const publicImages = master.images.map((image) => ({ id: image.id, title: image.title, category: image.category, thumbnail_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`, preview_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`, plan_type: image.plan_type === "free" ? "free" : "bundle", ...(image.plan_type === "free" ? { download_url: `/api/main?action=get-r2-free-image-download&id=${encodeURIComponent(image.id)}` } : {}) }));
  fs.writeFileSync(publicPath, `${JSON.stringify(publicImages, null, 2)}\n`);
}
console.log(JSON.stringify({ second_pass_input: pending.length, second_pass_reclassified: reclassified, second_pass_still_review: unresolved.length, manual_overrides_preserved: true, category_counts: Object.fromEntries(Object.entries(counts).map(([id, value]) => [id, value.count])) }, null, 2));
