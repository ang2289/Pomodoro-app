/**
 * Local-only image catalogue classifier.
 *
 * Reads thumbnail objects from R2, runs a free local CLIP zero-shot model,
 * and writes only local catalog/review files. It does not call Supabase or any
 * paid AI API, and it never reads or changes original images.
 *
 * Run: node scripts/classify-image-catalog-local.mjs
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
const reviewThumbnailsDir = path.join(privateDir, "category-review-thumbnails");
const publicPath = path.join(root, "public", "data", "images-public.json");
const modelCacheDir = path.join(root, ".local-tools", "image-classifier", "model-cache");

function loadEnv(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return;
  for (const sourceLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = sourceLine.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value && !process.env[match[1]]) process.env[match[1]] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const required = ["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`R2_ENV_MISSING:${missing.join(",")}`);
if (!fs.existsSync(masterPath)) throw new Error("MASTER_CATALOG_MISSING");

const categories = [
  ["food-drink", "食物／飲品", "food and drinks"],
  ["business-office", "商業／辦公", "business office workspace"],
  ["product-display", "商品展示", "product display advertising"],
  ["beauty-fashion", "美容／時尚", "beauty fashion cosmetics"],
  ["home-lifestyle", "居家／生活", "home lifestyle interior living"],
  ["education", "教育／學習", "education learning school"],
  ["pet-animal", "寵物／動物", "pet animal"],
  ["wedding-event", "婚禮／活動", "wedding party event"],
  ["travel-hotel", "旅遊／住宿", "travel hotel tourism"],
  ["finance", "金融／理財", "finance banking investment money"],
  ["professional-service", "專業服務", "professional service healthcare legal"],
  ["taiwan-local", "台灣在地生活", "Taiwan local life street food"],
  ["flower-plant", "花卉／植物", "flowers plants botanical"],
  ["nature-landscape", "自然／風景", "nature landscape scenery"],
  ["background-wallpaper", "背景／桌布", "abstract background wallpaper texture"],
  ["festival", "節慶／節日", "festival holiday celebration"],
  ["religion-healing", "宗教／療癒", "religion spiritual healing meditation"],
  ["technology", "科技／數位", "technology digital devices"],
  ["other", "其他素材", "other miscellaneous image"],
];
const categoryById = new Map(categories.map(([id, name]) => [id, { id, name }]));
const categoryLabels = categories.map(([, , prompt]) => prompt);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  maxAttempts: 5,
});

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bodyToBuffer(body) {
  if (body?.transformToByteArray) return Buffer.from(await body.transformToByteArray());
  const chunks = [];
  for await (const chunk of Readable.from(body)) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function getThumbnail(key) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const result = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
      const body = await bodyToBuffer(result.Body);
      if (!body.length) throw new Error("THUMBNAIL_EMPTY");
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await pause(attempt * 900);
    }
  }
  throw lastError;
}

function thumbnailFileName(image) {
  return `${image.id}.webp`;
}

function localReviewThumbnail(image) {
  return `category-review-thumbnails/${thumbnailFileName(image)}`;
}

function categoryFromLabel(label) {
  const index = categoryLabels.indexOf(label);
  const [id, name] = categories[index];
  return { id, name };
}

const localToolRequire = createRequire(path.join(root, ".local-tools", "image-classifier", "package.json"));
const transformerModule = await import(pathToFileURL(localToolRequire.resolve("@huggingface/transformers")).href);
const { pipeline, env, RawImage } = transformerModule.default || transformerModule;
env.cacheDir = modelCacheDir;
env.allowLocalModels = false;
env.useBrowserCache = false;

const classifier = await pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32", {
  dtype: "q8",
});

const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
if (!Array.isArray(master.images) || master.images.length !== 1583) {
  throw new Error(`MASTER_COUNT_UNEXPECTED:${Array.isArray(master.images) ? master.images.length : "invalid"}`);
}

fs.mkdirSync(reviewThumbnailsDir, { recursive: true });
const review = [];
let highConfidence = 0;
const batchSize = 16;

for (let start = 0; start < master.images.length; start += batchSize) {
  const batch = master.images.slice(start, start + batchSize);
  const thumbnailBuffers = [];
  for (const image of batch) {
    if (!image.thumbnail_key) throw new Error(`THUMBNAIL_KEY_MISSING:${image.id}`);
    thumbnailBuffers.push(await getThumbnail(image.thumbnail_key));
  }
  const rawImages = await Promise.all(thumbnailBuffers.map((thumbnail) => RawImage.fromBlob(new Blob([thumbnail], { type: "image/webp" }))));
  const rankedBatch = await classifier(rawImages, categoryLabels, { hypothesis_template: "a photo of {}" });

  for (let batchIndex = 0; batchIndex < batch.length; batchIndex += 1) {
  const image = batch[batchIndex];
  const thumbnail = thumbnailBuffers[batchIndex];
  const ranked = rankedBatch[batchIndex];
  const first = ranked[0];
  const second = ranked[1];
  const suggested = categoryFromLabel(first.label);
  const runnerUp = categoryFromLabel(second.label);
  const confidence = Number(first.score.toFixed(4));
  const secondConfidence = Number(second.score.toFixed(4));
  const needsReview = confidence < 0.38 || confidence - secondConfidence < 0.08 || suggested.id === "other";

  image.suggested_category_id = suggested.id;
  image.suggested_category_name = suggested.name;
  image.confidence = confidence;
  image.second_category_id = runnerUp.id;
  image.second_confidence = secondConfidence;
  image.needs_review = needsReview;
  image.category = needsReview ? "other" : suggested.id;
  image.category_name = categoryById.get(image.category).name;
  image.title = `${image.category_name}素材`;
  image.plan_type = "bundle";

  if (needsReview) {
    const reviewFile = path.join(privateDir, localReviewThumbnail(image));
    fs.writeFileSync(reviewFile, thumbnail);
    review.push({
      id: image.id,
      suggested_category_id: suggested.id,
      suggested_category_name: suggested.name,
      confidence,
      second_category_id: runnerUp.id,
      second_category_name: runnerUp.name,
      second_confidence: secondConfidence,
      needs_review: true,
      thumbnail_file: localReviewThumbnail(image),
    });
  } else {
    highConfidence += 1;
  }

  }

  if (start + batch.length === master.images.length || (start + batch.length) % 80 === 0) {
    console.log(`CLASSIFIED ${start + batch.length}/${master.images.length}`);
  }
}

const countByCategory = Object.fromEntries(categories.map(([id, name]) => [id, { name, count: 0 }]));
for (const image of master.images) countByCategory[image.category].count += 1;

master.version = 2;
master.generated_at = new Date().toISOString();
master.total = master.images.length;
fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`);
fs.writeFileSync(reviewPath, `${JSON.stringify({ version: 1, generated_at: master.generated_at, total: review.length, images: review }, null, 2)}\n`);

const publicImages = master.images.map((image) => ({
  id: image.id,
  title: image.title,
  category: image.category,
  thumbnail_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`,
  preview_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`,
  plan_type: "bundle",
}));
fs.writeFileSync(publicPath, `${JSON.stringify(publicImages, null, 2)}\n`);

console.log(JSON.stringify({
  total_classified: master.images.length,
  high_confidence: highConfidence,
  needs_review: review.length,
  other_count: countByCategory.other.count,
  category_counts: Object.fromEntries(Object.entries(countByCategory).map(([id, value]) => [id, value.count])),
}, null, 2));
