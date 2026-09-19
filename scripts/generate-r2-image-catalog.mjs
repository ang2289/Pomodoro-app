import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import sharp from "sharp";
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const root = process.cwd();

function loadEnv(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return;
  for (const raw of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const match = raw.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (value && !process.env[match[1]]) process.env[match[1]] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const required = ["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
const missingEnv = required.filter((name) => !process.env[name]);
if (missingEnv.length) throw new Error(`R2_ENV_MISSING:${missingEnv.join(",")}`);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  maxAttempts: 5,
});

const imageExtension = /\.(jpg|jpeg|png|webp)$/i;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function list(prefix) {
  let token;
  const keys = [];
  do {
    let attempt = 0;
    while (true) {
      try {
        const page = await r2.send(new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: token,
          MaxKeys: 1000,
        }));
        keys.push(...(page.Contents || []).map((object) => object.Key).filter((key) => imageExtension.test(key || "")));
        token = page.NextContinuationToken;
        break;
      } catch (error) {
        attempt += 1;
        if (attempt >= 4) throw error;
        await sleep(attempt * 800);
      }
    }
  } while (token);
  return keys;
}

function legacyOriginalFromKey(key) {
  const match = key.match(/^originals\/by-image-id\/([^/]+)\/original\.(jpg|jpeg|png|webp)$/i);
  return match ? { id: match[1], original_key: key } : null;
}

function modernOriginalFromKey(key) {
  const match = key.match(/^images\/originals\/\d{4}\/\d{2}\/([^/]+)\.(jpg|jpeg|png|webp)$/i);
  return match ? { id: match[1], original_key: key } : null;
}

function thumbnailFromKey(key) {
  let match = key.match(/^thumbnails\/by-image-id\/([^/]+)\.(jpg|jpeg|png|webp)$/i);
  if (match) return { id: match[1], thumbnail_key: key };
  match = key.match(/^thumbnails\/by-original-id\/([^/]+)\.webp$/i);
  if (match) return { id: match[1], thumbnail_key: key };
  match = key.match(/^images\/thumbnails\/\d{4}\/\d{2}\/([^/]+)\.(jpg|jpeg|png|webp)$/i);
  if (match) return { id: match[1], thumbnail_key: key };
  return null;
}

async function bodyToBuffer(body) {
  if (body?.transformToByteArray) return Buffer.from(await body.transformToByteArray());
  const chunks = [];
  for await (const chunk of Readable.from(body)) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function ensureThumbnail(image) {
  const thumbnailKey = `thumbnails/by-original-id/${image.id}.webp`;
  try {
    const existing = await r2.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: thumbnailKey }));
    if (Number(existing.ContentLength || 0) > 0) return { key: thumbnailKey, created: false };
  } catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404 && error?.name !== "NotFound") throw error;
  }

  const source = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: image.original_key }));
  const sourceBuffer = await bodyToBuffer(source.Body);
  if (!sourceBuffer.length) throw new Error(`ORIGINAL_EMPTY:${image.id}`);
  const thumbnail = await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  if (!thumbnail.length) throw new Error(`THUMBNAIL_EMPTY:${image.id}`);
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: thumbnailKey,
    Body: thumbnail,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return { key: thumbnailKey, created: true };
}

const [legacyOriginalKeys, modernOriginalKeys, legacyThumbnailKeys, modernThumbnailKeys] = await Promise.all([
  list("originals/by-image-id/"),
  list("images/originals/"),
  list("thumbnails/"),
  list("images/thumbnails/"),
]);

const originals = new Map();
for (const key of legacyOriginalKeys) {
  const record = legacyOriginalFromKey(key);
  if (!record) continue;
  if (originals.has(record.id)) throw new Error(`DUPLICATE_ORIGINAL_ID:${record.id}`);
  originals.set(record.id, record);
}
for (const key of modernOriginalKeys) {
  const record = modernOriginalFromKey(key);
  if (!record) continue;
  if (originals.has(record.id)) throw new Error(`DUPLICATE_ORIGINAL_ID:${record.id}`);
  originals.set(record.id, record);
}

const thumbnails = new Map();
for (const key of [...legacyThumbnailKeys, ...modernThumbnailKeys]) {
  const record = thumbnailFromKey(key);
  if (!record || thumbnails.has(record.id)) continue;
  thumbnails.set(record.id, record.thumbnail_key);
}

const created = [];
const failed = [];
for (const image of originals.values()) {
  if (thumbnails.has(image.id)) continue;
  try {
    const result = await ensureThumbnail(image);
    thumbnails.set(image.id, result.key);
    if (result.created) created.push(image.id);
  } catch (error) {
    failed.push({ id: image.id, error: String(error?.message || error) });
  }
}

if (failed.length) {
  console.error(JSON.stringify({ thumbnail_failed: failed }, null, 2));
  process.exitCode = 2;
} else {
  const generatedAt = new Date().toISOString();
  const images = [...originals.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((image) => ({
      id: image.id,
      title: `圖片素材 ${image.id}`,
      category: "未分類",
      original_key: image.original_key,
      thumbnail_key: thumbnails.get(image.id),
      plan_type: "bundle",
    }));
  const master = { version: 1, generated_at: generatedAt, total: images.length, images };
  const publicManifest = {
    version: 1,
    updated_at: generatedAt,
    total: images.length,
    categories: [{ id: "uncategorized", name: "未分類", slug: "uncategorized" }],
    images: images.map((image) => ({
      id: image.id,
      title: image.title,
      category: image.category,
      category_id: "uncategorized",
      category_name: "未分類",
      category_slug: "uncategorized",
      thumbnail_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`,
      preview_url: `/api/main?action=get-r2-image-thumbnail&id=${encodeURIComponent(image.id)}`,
      plan_type: image.plan_type,
    })),
  };
  const privateDir = path.join(root, "private-data");
  const publicSafeImages = publicManifest.images.map(({ id, title, category, thumbnail_url, preview_url, plan_type }) => ({
    id,
    title,
    category,
    thumbnail_url,
    preview_url,
    plan_type,
  }));
  fs.mkdirSync(privateDir, { recursive: true });
  fs.writeFileSync(path.join(privateDir, "images-master.json"), `${JSON.stringify(master, null, 2)}\n`);
  fs.mkdirSync(path.join(root, "public", "data"), { recursive: true });
  fs.writeFileSync(path.join(root, "public", "data", "images-public.json"), `${JSON.stringify(publicSafeImages, null, 2)}\n`);
  console.log(JSON.stringify({
    master_count: images.length,
    public_count: publicSafeImages.length,
    thumbnail_existing: images.length - created.length,
    thumbnail_created: created.length,
    thumbnail_failed: 0,
    original_missing: 0,
    public_original_url_leaks: false,
  }, null, 2));
}
