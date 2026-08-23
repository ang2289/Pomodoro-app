/** Apply human category overrides exported by private-data/category-review.html. */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const privateDir = path.join(root, "private-data");
const masterPath = path.join(privateDir, "images-master.json");
const reviewPath = path.join(privateDir, "category-review.json");
const publicPath = path.join(root, "public", "data", "images-public.json");
const freeSelectionPath = path.join(privateDir, "free-image-selection.json");
const overridePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(privateDir, "category-overrides.json");
const categories = new Map([["food-drink","食物／飲品"],["business-office","商業／辦公"],["product-display","商品展示"],["beauty-fashion","美容／時尚"],["home-lifestyle","居家／生活"],["education","教育／學習"],["pet-animal","寵物／動物"],["wedding-event","婚禮／活動"],["travel-hotel","旅遊／住宿"],["finance","金融／理財"],["professional-service","專業服務"],["taiwan-local","台灣在地生活"],["flower-plant","花卉／植物"],["nature-landscape","自然／風景"],["background-wallpaper","背景／桌布"],["festival","節慶／節日"],["religion-healing","宗教／療癒"],["technology","科技／數位"],["other","其他素材"]]);

if (!fs.existsSync(masterPath) || !fs.existsSync(reviewPath)) throw new Error("CATEGORY_CATALOG_MISSING");
if (!fs.existsSync(overridePath)) throw new Error(`OVERRIDE_FILE_MISSING:${overridePath}`);
const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const input = JSON.parse(fs.readFileSync(overridePath, "utf8"));
const overrides = Array.isArray(input) ? input : input.overrides;
if (!Array.isArray(overrides)) throw new Error("OVERRIDE_FORMAT_INVALID");
const masterIds = new Set((master.images || []).map((item) => item.id));
const validOverrides = new Map();
for (const item of overrides) {
  if (!item || typeof item.id !== "string" || typeof item.category !== "string") throw new Error("OVERRIDE_ITEM_INVALID");
  if (!masterIds.has(item.id)) throw new Error(`OVERRIDE_IMAGE_NOT_FOUND:${item.id}`);
  if (!categories.has(item.category)) throw new Error(`OVERRIDE_CATEGORY_INVALID:${item.category}`);
  validOverrides.set(item.id, item.category);
}
for (const image of master.images || []) {
  const category = validOverrides.get(image.id);
  if (!category) continue;
  image.category = category; image.category_name = categories.get(category); image.title = `${image.category_name}素材`;
  image.needs_review = false; image.reviewed_at = new Date().toISOString();
}
const selectedFreeIds = fs.existsSync(freeSelectionPath)
  ? new Set((JSON.parse(fs.readFileSync(freeSelectionPath, "utf8")).images || []).map((item) => item.id))
  : new Set();
for (const image of master.images || []) {
  if (!categories.has(image.category)) throw new Error(`MASTER_CATEGORY_INVALID:${image.id}`);
  image.category_id = image.category;
  image.category_name = categories.get(image.category);
  image.plan_type = selectedFreeIds.has(image.id) ? "free" : "bundle";
}
const remaining = (review.images || []).filter((item) => !validOverrides.has(item.id));
const counts = Object.fromEntries([...categories.entries()].map(([id, name]) => [id, { name, count: 0 }]));
for (const image of master.images || []) counts[image.category || "other"].count += 1;
master.generated_at = new Date().toISOString(); master.total = master.images.length;
fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`);
fs.writeFileSync(reviewPath, `${JSON.stringify({ version: 1, generated_at: master.generated_at, total: remaining.length, images: remaining }, null, 2)}\n`);
const publicImages = master.images.map((image) => ({ id: image.id, title: image.title, category: image.category, thumbnail_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`, preview_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`, plan_type: image.plan_type === "free" ? "free" : "bundle", ...(image.plan_type === "free" ? { download_url: `/api/main?action=get-r2-free-image-download&id=${encodeURIComponent(image.id)}` } : {}) }));
fs.writeFileSync(publicPath, `${JSON.stringify(publicImages, null, 2)}\n`);
console.log(JSON.stringify({ applied: validOverrides.size, needs_review_remaining: remaining.length, category_counts: Object.fromEntries(Object.entries(counts).map(([id, value]) => [id, value.count])) }, null, 2));
