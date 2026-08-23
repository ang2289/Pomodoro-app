/** Select 37 diverse free images from confirmed (non-review) categories. */
import fs from "node:fs";
import path from "node:path";
const root = process.cwd(); const privateDir = path.join(root, "private-data");
const masterPath = path.join(privateDir, "images-master.json"); const publicPath = path.join(root, "public", "data", "images-public.json"); const selectionPath = path.join(privateDir, "free-image-selection.json"); const target = 37;
const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const confirmed = (master.images || []).filter((image) => !image.needs_review && image.category && image.category !== "other");
const byCategory = new Map(); for (const image of confirmed) { if (!byCategory.has(image.category)) byCategory.set(image.category, []); byCategory.get(image.category).push(image); }
for (const list of byCategory.values()) list.sort((a, b) => (b.confidence || 0) - (a.confidence || 0) || a.id.localeCompare(b.id));
const selected = []; const used = new Set(); const orderedCategories = [...byCategory.keys()].sort((a, b) => byCategory.get(b).length - byCategory.get(a).length || a.localeCompare(b));
for (const category of orderedCategories) for (const image of byCategory.get(category).slice(0, 2)) { if (selected.length < target) { selected.push(image); used.add(image.id); } }
while (selected.length < target) { let added = false; for (const category of orderedCategories) { const next = byCategory.get(category).find((image) => !used.has(image.id)); if (!next) continue; selected.push(next); used.add(next.id); added = true; if (selected.length >= target) break; } if (!added) break; }
if (selected.length !== target) throw new Error(`FREE_SELECTION_INSUFFICIENT:${selected.length}`);
const selectedIds = new Set(selected.map((image) => image.id)); for (const image of master.images || []) image.plan_type = selectedIds.has(image.id) ? "free" : "bundle";
master.generated_at = new Date().toISOString(); fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`);
fs.writeFileSync(selectionPath, `${JSON.stringify({ version: 1, generated_at: master.generated_at, total: selected.length, images: selected.map((image) => ({ id: image.id, category: image.category, confidence: image.confidence })) }, null, 2)}\n`);
const publicImages = master.images.map((image) => ({ id: image.id, title: image.title, category: image.category, thumbnail_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`, preview_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`, plan_type: image.plan_type, ...(image.plan_type === "free" ? { download_url: `/api/main?action=get-r2-free-image-download&id=${encodeURIComponent(image.id)}` } : {}) }));
fs.writeFileSync(publicPath, `${JSON.stringify(publicImages, null, 2)}\n`);
const distribution = Object.fromEntries([...byCategory.keys()].sort().map((category) => [category, selected.filter((image) => image.category === category).length]).filter(([, count]) => count));
console.log(JSON.stringify({ free_image_count: selected.length, free_category_distribution: distribution }, null, 2));
