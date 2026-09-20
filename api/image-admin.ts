import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const MANIFEST_KEY = "catalog/images-public.json";
const CATEGORY_MANIFEST_KEY = "catalog/image-categories.json";
const CACHE_TTL_MS = 60_000;

type ManagedCategory = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

const DEFAULT_IMAGE_CATEGORIES: ManagedCategory[] = [
  { id: "real-estate", name: "房仲／房地產", sort_order: 0, is_active: true },
  { id: "hair-salon", name: "美髮／沙龍", sort_order: 1, is_active: true },
  { id: "nail-salon", name: "美甲", sort_order: 2, is_active: true },
  { id: "beauty-spa", name: "美容 SPA", sort_order: 3, is_active: true },
  { id: "dentist", name: "牙醫", sort_order: 4, is_active: true },
  { id: "pet-grooming", name: "寵物美容", sort_order: 5, is_active: true },
  { id: "car-detailing", name: "汽車美容", sort_order: 6, is_active: true },
  { id: "coloring-page", name: "著色頁", sort_order: 7, is_active: true },
  { id: "beauty-fashion", name: "美容／時尚", sort_order: 8, is_active: true },
  { id: "food-drink", name: "食物／飲品", sort_order: 9, is_active: true },
  { id: "business-office", name: "商業／辦公", sort_order: 10, is_active: true },
  { id: "product-display", name: "商品展示", sort_order: 11, is_active: true },
  { id: "home-lifestyle", name: "居家／生活", sort_order: 12, is_active: true },
  { id: "flower-plant", name: "花卉／植物", sort_order: 13, is_active: true },
  { id: "background-wallpaper", name: "背景／桌布", sort_order: 14, is_active: true },
  { id: "pet-animal", name: "寵物／動物", sort_order: 15, is_active: true },
  { id: "wedding-event", name: "婚禮／活動", sort_order: 16, is_active: true },
  { id: "travel-hotel", name: "旅遊／住宿", sort_order: 17, is_active: true },
  { id: "education", name: "教育／學習", sort_order: 18, is_active: true },
  { id: "finance", name: "金融／理財", sort_order: 19, is_active: true },
  { id: "professional-service", name: "專業服務", sort_order: 20, is_active: true },
  { id: "taiwan-local", name: "台灣在地生活", sort_order: 21, is_active: true },
  { id: "nature-landscape", name: "自然／風景", sort_order: 22, is_active: true },
  { id: "festival", name: "節慶／節日", sort_order: 23, is_active: true },
  { id: "religion-healing", name: "宗教／療癒", sort_order: 24, is_active: true },
  { id: "technology", name: "科技／數位", sort_order: 25, is_active: true },
  { id: "other", name: "其他素材", sort_order: 26, is_active: true },
];

type CatalogDocument = {
  root: any;
  images: any[];
  listField: "array" | "images" | "data" | "items";
};

let catalogCache: { expiresAt: number; doc: CatalogDocument } | null = null;

function safeText(value: any) {
  return String(value ?? "").trim();
}

function getRuntimeConfig() {
  const cfg = {
    adminKey: safeText(process.env.RXV_IMAGE_ADMIN_KEY),
    accountId: safeText(process.env.R2_ACCOUNT_ID),
    accessKeyId: safeText(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: safeText(process.env.R2_SECRET_ACCESS_KEY),
    privateBucket: safeText(process.env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging"),
    publicBucket: safeText(process.env.R2_PUBLIC_BUCKET_NAME || "rxv-healing-images-public"),
    publicAssetUrl: safeText(process.env.R2_PUBLIC_ASSET_URL || process.env.VITE_PUBLIC_R2_URL),
  };

  const missing = Object.entries({
    RXV_IMAGE_ADMIN_KEY: cfg.adminKey,
    R2_ACCOUNT_ID: cfg.accountId,
    R2_ACCESS_KEY_ID: cfg.accessKeyId,
    R2_SECRET_ACCESS_KEY: cfg.secretAccessKey,
  }).filter(([, value]) => !value).map(([key]) => key);

  if (missing.length) throw new Error(`IMAGE_ADMIN_ENV_MISSING:${missing.join(",")}`);
  return cfg;
}

function getClient() {
  const cfg = getRuntimeConfig();
  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

function getHeader(req: any, name: string) {
  const headers = req?.headers || {};
  return safeText(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()]);
}

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function requireAdmin(req: any) {
  const cfg = getRuntimeConfig();
  const provided = getHeader(req, "x-rxv-image-admin-key");
  if (!provided) {
    const e: any = new Error("IMAGE_ADMIN_KEY_REQUIRED");
    e.statusCode = 401;
    throw e;
  }
  if (!secureEqual(provided, cfg.adminKey)) {
    const e: any = new Error("IMAGE_ADMIN_KEY_INVALID");
    e.statusCode = 403;
    throw e;
  }
}

function sendJson(res: any, status: number, payload: any) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(payload);
  }
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function bodyToText(body: any): Promise<string> {
  if (!body) throw new Error("R2_PUBLIC_MANIFEST_BODY_EMPTY");
  if (typeof body.transformToString === "function") return await body.transformToString("utf-8");

  if (typeof body.getReader === "function") {
    const reader = body.getReader();
    const chunks: Buffer[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks).toString("utf8");
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as any) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function parseCatalog(parsed: any): CatalogDocument {
  if (Array.isArray(parsed)) return { root: parsed, images: parsed, listField: "array" };
  if (Array.isArray(parsed?.images)) return { root: parsed, images: parsed.images, listField: "images" };
  if (Array.isArray(parsed?.data)) return { root: parsed, images: parsed.data, listField: "data" };
  if (Array.isArray(parsed?.items)) return { root: parsed, images: parsed.items, listField: "items" };
  throw new Error("R2_PUBLIC_MANIFEST_FORMAT_INVALID");
}

async function readCatalog(force = false): Promise<CatalogDocument> {
  if (!force && catalogCache && catalogCache.expiresAt > Date.now()) return catalogCache.doc;

  const cfg = getRuntimeConfig();
  let lastError: any;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await getClient().send(new GetObjectCommand({
        Bucket: cfg.publicBucket,
        Key: MANIFEST_KEY,
      }));
      const text = await bodyToText(result.Body);
      const doc = parseCatalog(JSON.parse(text));
      catalogCache = { expiresAt: Date.now() + CACHE_TTL_MS, doc };
      return doc;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }

  const e: any = new Error("R2_PUBLIC_MANIFEST_READ_FAILED");
  e.cause = lastError;
  throw e;
}

function rebuildCatalog(doc: CatalogDocument, images: any[]) {
  if (doc.listField === "array") return images;
  const next = { ...(doc.root || {}) };
  next[doc.listField] = images;
  if (Object.prototype.hasOwnProperty.call(next, "count")) next.count = images.length;
  if (Object.prototype.hasOwnProperty.call(next, "total")) next.total = images.length;
  next.updated_at = new Date().toISOString();
  return next;
}

async function writeCatalog(doc: CatalogDocument, images: any[]) {
  const cfg = getRuntimeConfig();
  const payload = rebuildCatalog(doc, images);
  await getClient().send(new PutObjectCommand({
    Bucket: cfg.publicBucket,
    Key: MANIFEST_KEY,
    Body: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
    ContentType: "application/json; charset=utf-8",
    CacheControl: "public, max-age=60, s-maxage=60",
  }));
  catalogCache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    doc: parseCatalog(payload),
  };
}

function normalizeManagedCategories(value: any): ManagedCategory[] {
  const rows = Array.isArray(value) ? value : Array.isArray(value?.categories) ? value.categories : [];
  const seen = new Set<string>();
  return rows.flatMap((row: any, index: number) => {
    const id = safeText(row?.id);
    const name = safeText(row?.name);
    if (!id || !name || seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      name,
      sort_order: Number.isFinite(Number(row?.sort_order)) ? Number(row.sort_order) : index,
      is_active: row?.is_active !== false,
    }];
  }).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "zh-Hant"));
}

async function readManagedCategories(doc?: CatalogDocument): Promise<ManagedCategory[]> {
  const cfg = getRuntimeConfig();
  try {
    const result = await getClient().send(new GetObjectCommand({
      Bucket: cfg.publicBucket,
      Key: CATEGORY_MANIFEST_KEY,
    }));
    const text = await bodyToText(result.Body);
    const rows = normalizeManagedCategories(JSON.parse(text));
    if (rows.length) return rows;
  } catch (error: any) {
    const status = Number(error?.$metadata?.httpStatusCode || 0);
    const name = safeText(error?.name || error?.Code || error?.code);
    if (status !== 404 && !/NoSuchKey|NotFound/i.test(name)) throw error;
  }

  const catalog = doc || await readCatalog(false);
  const map = new Map<string, ManagedCategory>();
  for (const category of DEFAULT_IMAGE_CATEGORIES) map.set(category.id, { ...category });
  for (const image of catalog.images) {
    const id = safeText(image?.category_id);
    const name = safeText(image?.category_name || image?.category || id);
    if (id && name && !map.has(id)) {
      map.set(id, { id, name, sort_order: map.size, is_active: true });
    }
  }
  return [...map.values()];
}

async function writeManagedCategories(categories: ManagedCategory[]) {
  const cfg = getRuntimeConfig();
  const rows = categories
    .map((category, index) => ({
      id: safeText(category.id),
      name: safeText(category.name),
      sort_order: index,
      is_active: category.is_active !== false,
    }))
    .filter((category) => category.id && category.name);

  await getClient().send(new PutObjectCommand({
    Bucket: cfg.publicBucket,
    Key: CATEGORY_MANIFEST_KEY,
    Body: Buffer.from(JSON.stringify({ version: 1, updated_at: new Date().toISOString(), categories: rows }, null, 2), "utf8"),
    ContentType: "application/json; charset=utf-8",
    CacheControl: "no-cache",
  }));
  return rows;
}

function imageCountForCategory(doc: CatalogDocument, categoryId: string) {
  return doc.images.filter((image: any) => safeText(image?.category_id) === categoryId).length;
}

function inferPublicBase(doc: CatalogDocument) {
  const cfg = getRuntimeConfig();
  if (cfg.publicAssetUrl) return cfg.publicAssetUrl.replace(/\/$/, "");

  for (const image of doc.images) {
    const candidate = safeText(image?.thumbnail_url || image?.preview_url || image?.public_url);
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      for (const marker of ["/thumbnails/", "/previews/", "/preview/"]) {
        const i = url.pathname.indexOf(marker);
        if (i >= 0) return `${url.origin}${url.pathname.slice(0, i)}`.replace(/\/$/, "");
      }
      if (!url.hostname.endsWith(".r2.cloudflarestorage.com")) return url.origin;
    } catch {}
  }

  throw new Error("R2_PUBLIC_ASSET_URL_UNAVAILABLE");
}

function publicUrlFor(key: string, doc: CatalogDocument) {
  const base = inferPublicBase(doc);
  const encoded = key.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  return `${base}/${encoded}`;
}

function normalizeImage(base64: string, mimeHint?: string) {
  const raw = safeText(base64);
  const match = raw.match(/^data:([^;]+);base64,(.+)$/s);
  const mimeType = safeText(match?.[1] || mimeHint || "image/jpeg").toLowerCase();
  const encoded = match?.[2] || raw;
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length) throw new Error("IMAGE_UPLOAD_EMPTY");

  const ext =
    mimeType === "image/png" ? "png" :
    mimeType === "image/webp" ? "webp" :
    mimeType === "image/jpeg" || mimeType === "image/jpg" ? "jpg" : "";

  if (!ext) throw new Error("IMAGE_UPLOAD_UNSUPPORTED_MIME");
  return { buffer, mimeType: ext === "jpg" ? "image/jpeg" : mimeType, ext };
}

function cleanTitle(name: string) {
  const base = safeText(name || "RXV image").replace(/\.[^.]+$/, "");
  return base.slice(0, 180) || "RXV image";
}

async function putObject(bucket: string, key: string, body: Buffer, contentType: string, isPublic: boolean) {
  await getClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
  }));
}

async function removeObject(bucket: string, key: string) {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

function imageExtensionFromKey(key: string) {
  const match = safeText(key).match(/\.([a-z0-9]+)$/i);
  const ext = safeText(match?.[1]).toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('IMAGE_ORIGINAL_EXTENSION_INVALID');
  return ext;
}

let legacyMasterCache: any[] | null = null;
function findLegacyMasterOriginalKey(imageId: string) {
  try {
    if (!legacyMasterCache) {
      const masterPath = path.join(process.cwd(), 'private-data', 'images-master.json');
      if (!fs.existsSync(masterPath)) return '';
      const parsed = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
      legacyMasterCache = Array.isArray(parsed?.images) ? parsed.images : [];
    }
    const row = legacyMasterCache.find((item: any) => safeText(item?.id) === imageId);
    return safeText(row?.original_key);
  } catch {
    return '';
  }
}

async function findPrivateOriginalKey(imageId: string) {
  const cfg = getRuntimeConfig();
  const prefix = `originals/by-image-id/${imageId}/`;
  const listed = await getClient().send(new ListObjectsV2Command({
    Bucket: cfg.privateBucket,
    Prefix: prefix,
    MaxKeys: 10,
  }));
  const currentKey = (listed.Contents || [])
    .map((item: any) => safeText(item?.Key))
    .find((key: string) => /^original\.(?:jpg|jpeg|png|webp)$/i.test(key.slice(prefix.length)));
  if (currentKey) return currentKey;

  const legacyKey = findLegacyMasterOriginalKey(imageId);
  if (legacyKey && /\.(?:jpg|jpeg|png|webp)$/i.test(legacyKey)) return legacyKey;
  return '';
}

async function publishFreeOriginal(imageId: string, doc: CatalogDocument) {
  const cfg = getRuntimeConfig();
  const sourceKey = await findPrivateOriginalKey(imageId);
  if (!sourceKey) throw new Error(`FREE_IMAGE_ORIGINAL_NOT_FOUND:${imageId}`);
  const ext = imageExtensionFromKey(sourceKey);
  const publicKey = `free/originals/${imageId}.${ext}`;
  const copySource = `/${cfg.privateBucket}/${sourceKey.split('/').map(encodeURIComponent).join('/')}`;

  await getClient().send(new CopyObjectCommand({
    Bucket: cfg.publicBucket,
    Key: publicKey,
    CopySource: copySource,
    ContentType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
    MetadataDirective: 'REPLACE',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return { publicKey, downloadUrl: publicUrlFor(publicKey, doc) };
}

async function unpublishFreeOriginal(imageId: string) {
  const cfg = getRuntimeConfig();
  await Promise.all(
    ['jpg', 'jpeg', 'png', 'webp'].map((ext) =>
      removeObject(cfg.publicBucket, `free/originals/${imageId}.${ext}`)
    ),
  );
}

async function handlePublicCatalog(_req: any, res: any) {
  const doc = await readCatalog(false);
  return sendJson(res, 200, doc.root);
}

async function handlePublicFreeDownload(req: any, res: any) {
  const imageId = safeText(req?.query?.id);
  if (!imageId || imageId.length > 160) {
    return sendJson(res, 400, { ok: false, error: 'INVALID_IMAGE_ID' });
  }

  const doc = await readCatalog(false);
  const image = doc.images.find((item: any) => safeText(item?.id) === imageId);
  const priceType = safeText(image?.price_type || image?.plan_type).toLowerCase();
  if (!image || priceType !== 'free') {
    return sendJson(res, 404, { ok: false, error: 'FREE_IMAGE_NOT_FOUND' });
  }

  const cfg = getRuntimeConfig();
  const client = getClient();
  const candidates = new Set<string>();

  const urlKey = publicKeyFromUrl(image?.download_url);
  if (urlKey && /^free\/originals\/.+\.(?:jpg|jpeg|png|webp)$/i.test(urlKey)) {
    candidates.add(urlKey);
  }

  const listed = await client.send(new ListObjectsV2Command({
    Bucket: cfg.publicBucket,
    Prefix: `free/originals/${imageId}.`,
    MaxKeys: 10,
  }));
  for (const item of listed.Contents || []) {
    const key = safeText(item?.Key);
    if (/^free\/originals\/.+\.(?:jpg|jpeg|png|webp)$/i.test(key)) candidates.add(key);
  }

  for (const key of candidates) {
    try {
      const object = await client.send(new GetObjectCommand({
        Bucket: cfg.publicBucket,
        Key: key,
      }));
      const ext = imageExtensionFromKey(key);
      res.status(200);
      res.setHeader('Content-Type', object.ContentType || (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`));
      if (object.ContentLength != null) res.setHeader('Content-Length', String(object.ContentLength));
      res.setHeader('Content-Disposition', `attachment; filename="RXV-${imageId}.${ext}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      return (object.Body as any).pipe(res);
    } catch {
      // Try the next compatible public free-original key.
    }
  }

  // 若是後來批次改成免費的圖片，原圖可能仍只存在原始儲存區。
  // 前面已確認 catalog 狀態為 free，因此這裡可透過同源 API 串流原圖。
  try {
    const prefix = `originals/by-image-id/${imageId}/`;
    const listedPrivate = await client.send(new ListObjectsV2Command({
      Bucket: cfg.privateBucket,
      Prefix: prefix,
      MaxKeys: 10,
    }));
    const privateKey = (listedPrivate.Contents || [])
      .map((item: any) => safeText(item?.Key))
      .find((key: string) =>
        /^original\.(?:jpg|jpeg|png|webp)$/i.test(key.slice(prefix.length)),
      );

    if (privateKey) {
      const object = await client.send(new GetObjectCommand({
        Bucket: cfg.privateBucket,
        Key: privateKey,
      }));
      const ext = imageExtensionFromKey(privateKey);
      res.status(200);
      res.setHeader('Content-Type', object.ContentType || (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`));
      if (object.ContentLength != null) res.setHeader('Content-Length', String(object.ContentLength));
      res.setHeader('Content-Disposition', `attachment; filename="RXV-${imageId}.${ext}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      return (object.Body as any).pipe(res);
    }
  } catch {
    // 無法讀取新式原圖時，再回傳乾淨的 not found。
  }

  return sendJson(res, 404, { ok: false, error: 'FREE_IMAGE_ORIGINAL_NOT_FOUND' });
}

async function handleList(req: any, res: any) {
  requireAdmin(req);
  const doc = await readCatalog(false);
  const images = doc.images.map((image: any) => ({
    ...image,
    category_id: safeText(image?.category_id),
    category_name: safeText(image?.category_name || image?.category || image?.category_id),
    plan_type: safeText(image?.plan_type || image?.price_type).toLowerCase() === "free" ? "free" : "bundle",
    price_type: safeText(image?.price_type || image?.plan_type).toLowerCase() === "free" ? "free" : "bundle",
    public_url: safeText(image?.thumbnail_url || image?.preview_url || image?.public_url),
  }));
  return sendJson(res, 200, {
    ok: true,
    success: true,
    source: "r2-public-catalog",
    total: images.length,
    images,
  });
}

async function handleCategories(req: any, res: any) {
  requireAdmin(req);
  const doc = await readCatalog(false);
  const categories = (await readManagedCategories(doc)).map((category) => ({
    ...category,
    image_count: imageCountForCategory(doc, category.id),
  }));
  return sendJson(res, 200, { ok: true, success: true, total: categories.length, categories });
}

async function handleCreateCategory(req: any, res: any, body: any) {
  requireAdmin(req);
  const name = safeText(body?.name || body?.category_name);
  if (!name) return sendJson(res, 400, { ok: false, error: "CATEGORY_NAME_REQUIRED" });

  const doc = await readCatalog(true);
  const categories = await readManagedCategories(doc);
  if (categories.some((category) => category.name === name)) {
    return sendJson(res, 409, { ok: false, error: "CATEGORY_NAME_EXISTS" });
  }

  let id = safeText(body?.id || body?.category_id);
  if (!id) id = `custom-${crypto.randomUUID().slice(0, 8)}`;
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/i.test(id)) {
    return sendJson(res, 400, { ok: false, error: "CATEGORY_ID_INVALID" });
  }
  if (categories.some((category) => category.id === id)) {
    return sendJson(res, 409, { ok: false, error: "CATEGORY_ID_EXISTS" });
  }

  const next = await writeManagedCategories([
    ...categories,
    { id, name, sort_order: categories.length, is_active: true },
  ]);
  return sendJson(res, 200, { ok: true, success: true, action: "createImageCategory", category: next.find((category) => category.id === id), total: next.length });
}

async function handleRenameCategory(req: any, res: any, body: any) {
  requireAdmin(req);
  const id = safeText(body?.id || body?.category_id);
  const name = safeText(body?.name || body?.category_name);
  if (!id || !name) return sendJson(res, 400, { ok: false, error: "CATEGORY_ID_AND_NAME_REQUIRED" });

  const doc = await readCatalog(true);
  const categories = await readManagedCategories(doc);
  if (!categories.some((category) => category.id === id)) {
    return sendJson(res, 404, { ok: false, error: "CATEGORY_NOT_FOUND" });
  }
  if (categories.some((category) => category.id !== id && category.name === name)) {
    return sendJson(res, 409, { ok: false, error: "CATEGORY_NAME_EXISTS" });
  }

  const renamed = categories.map((category) => category.id === id ? { ...category, name } : category);
  const nextImages = doc.images.map((image: any) => {
    if (safeText(image?.category_id) !== id) return image;
    return { ...image, category: name, category_name: name };
  });

  await writeCatalog(doc, nextImages);
  await writeManagedCategories(renamed);
  return sendJson(res, 200, { ok: true, success: true, action: "renameImageCategory", category_id: id, name, updated_images: imageCountForCategory({ ...doc, images: nextImages }, id) });
}

async function handleDeleteCategory(req: any, res: any, body: any) {
  requireAdmin(req);
  const id = safeText(body?.id || body?.category_id);
  if (!id) return sendJson(res, 400, { ok: false, error: "CATEGORY_ID_REQUIRED" });

  const doc = await readCatalog(true);
  const imageCount = imageCountForCategory(doc, id);
  if (imageCount > 0) {
    return sendJson(res, 409, { ok: false, error: "CATEGORY_NOT_EMPTY", image_count: imageCount });
  }

  const categories = await readManagedCategories(doc);
  if (!categories.some((category) => category.id === id)) {
    return sendJson(res, 404, { ok: false, error: "CATEGORY_NOT_FOUND" });
  }

  const next = await writeManagedCategories(categories.filter((category) => category.id !== id));
  return sendJson(res, 200, { ok: true, success: true, action: "deleteImageCategory", deleted_category_id: id, total: next.length });
}

async function handleUpload(req: any, res: any, body: any) {
  requireAdmin(req);
  const cfg = getRuntimeConfig();
  const categoryId = safeText(body?.category_id || body?.categoryId);
  const categoryName = safeText(body?.category_name || body?.categoryName || body?.category || categoryId);
  const requestedPriceType = safeText(body?.price_type || body?.plan_type).toLowerCase();
  const priceType = requestedPriceType === "free" ? "free" : "bundle";
  const base64 = body?.base64 || body?.fileDataBase64 || body?.imageBase64;

  if (!base64) return sendJson(res, 400, { ok: false, success: false, error: "IMAGE_UPLOAD_BASE64_REQUIRED" });
  if (!categoryId || !categoryName) return sendJson(res, 400, { ok: false, success: false, error: "IMAGE_UPLOAD_CATEGORY_REQUIRED" });

  const uploaded: Array<{ bucket: string; key: string }> = [];

  try {
    const catalog = await readCatalog(true);
    const { buffer, mimeType, ext } = normalizeImage(base64, body?.mime_type || body?.mimeType);
    const imageId = crypto.randomUUID();
    const now = new Date();
    const originalKey = `originals/by-image-id/${imageId}/original.${ext}`;
    const thumbnailKey = `thumbnails/by-image-id/${imageId}.webp`;

    const thumbResult = await sharp(buffer)
      .rotate()
      .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer({ resolveWithObject: true });

    await putObject(cfg.privateBucket, originalKey, buffer, mimeType, false);
    uploaded.push({ bucket: cfg.privateBucket, key: originalKey });

    await putObject(cfg.publicBucket, thumbnailKey, thumbResult.data, "image/webp", true);
    uploaded.push({ bucket: cfg.publicBucket, key: thumbnailKey });

    let freeDownloadUrl = "";
    if (priceType === "free") {
      const freeKey = `free/originals/${imageId}.${ext}`;
      await putObject(cfg.publicBucket, freeKey, buffer, mimeType, true);
      uploaded.push({ bucket: cfg.publicBucket, key: freeKey });
      freeDownloadUrl = publicUrlFor(freeKey, catalog);
    }

    const thumbnailUrl = publicUrlFor(thumbnailKey, catalog);
    const record = {
      id: imageId,
      title: cleanTitle(body?.file_name || body?.filename || body?.name),
      category: categoryName,
      category_id: categoryId,
      category_name: categoryName,
      thumbnail_url: thumbnailUrl,
      preview_url: thumbnailUrl,
      plan_type: priceType,
      price_type: priceType,
      is_free: priceType === "free",
      ...(priceType === "free"
        ? { download_url: freeDownloadUrl }
        : {}),
      created_at: now.toISOString(),
    };

    if (catalog.images.some((item: any) => safeText(item?.id) === imageId)) {
      throw new Error("R2_PUBLIC_MANIFEST_ID_COLLISION");
    }

    const nextImages = [...catalog.images, record];
    await writeCatalog(catalog, nextImages);

    return sendJson(res, 200, {
      ok: true,
      success: true,
      action: "uploadImage",
      image: { ...record, public_url: thumbnailUrl },
      thumbnail_url: thumbnailUrl,
      manifest_count: nextImages.length,
      storage: {
        private_original: true,
        public_thumbnail: true,
        public_original: priceType === "free",
      },
    });
  } catch (error: any) {
    if (uploaded.length) {
      await Promise.allSettled(uploaded.map((item) => removeObject(item.bucket, item.key)));
    }
    const code = safeText(error?.message || "UPLOAD_IMAGE_FAILED");
    const status =
      Number(error?.statusCode) ||
      (/^(IMAGE_UPLOAD_|R2_PUBLIC_MANIFEST_FORMAT_INVALID|R2_PUBLIC_MANIFEST_ID_COLLISION)/.test(code) ? 400 :
       code.startsWith("IMAGE_ADMIN_ENV_MISSING:") ? 503 : 500);
    return sendJson(res, status, { ok: false, success: false, error: code });
  }
}

// RXV_IMAGE_ADMIN_MANAGE_V1
function normalizeImageIds(body: any) {
  const raw = Array.isArray(body?.image_ids) ? body.image_ids : Array.isArray(body?.imageIds) ? body.imageIds : [];
  return [...new Set(raw.map((value: any) => safeText(value)).filter(Boolean))].slice(0, 300);
}

async function handleUpdateCategory(req: any, res: any, body: any) {
  requireAdmin(req);
  const imageIds = normalizeImageIds(body);
  const categoryId = safeText(body?.category_id || body?.categoryId);
  const categoryName = safeText(body?.category_name || body?.categoryName || body?.category || categoryId);
  const requestedPriceType = safeText(body?.price_type || body?.plan_type).toLowerCase();
  const priceType = requestedPriceType === "free" ? "free" : "bundle";
  if (!imageIds.length) return sendJson(res, 400, { ok: false, error: 'IMAGE_IDS_REQUIRED' });
  if (!categoryId || !categoryName) return sendJson(res, 400, { ok: false, error: 'IMAGE_CATEGORY_REQUIRED' });

  const doc = await readCatalog(true);
  const wanted = new Set(imageIds);
  let updated = 0;
  const nextImages = doc.images.map((image: any) => {
    if (!wanted.has(safeText(image?.id))) return image;
    updated += 1;
    return {
      ...image,
      category: categoryName,
      category_id: categoryId,
      category_name: categoryName,
    };
  });

  if (!updated) return sendJson(res, 404, { ok: false, error: 'IMAGE_NOT_FOUND' });
  await writeCatalog(doc, nextImages);
  return sendJson(res, 200, { ok: true, success: true, action: 'updateImageCategory', updated, manifest_count: nextImages.length });
}

async function handleUpdatePriceType(req: any, res: any, body: any) {
  requireAdmin(req);
  const imageIds = normalizeImageIds(body);
  const requestedPriceType = safeText(body?.price_type || body?.plan_type).toLowerCase();
  if (!imageIds.length) return sendJson(res, 400, { ok: false, error: 'IMAGE_IDS_REQUIRED' });
  if (requestedPriceType !== 'free' && requestedPriceType !== 'bundle') {
    return sendJson(res, 400, { ok: false, error: 'IMAGE_PRICE_TYPE_INVALID' });
  }

  const doc = await readCatalog(true);
  const wanted = new Set(imageIds);
  const targets = doc.images.filter((image: any) => wanted.has(safeText(image?.id)));
  if (!targets.length) return sendJson(res, 404, { ok: false, error: 'IMAGE_NOT_FOUND' });

  const freeUrls = new Map<string, string>();

  try {
    if (requestedPriceType === 'free') {
      for (const image of targets) {
        const id = safeText(image?.id);
        const published = await publishFreeOriginal(id, doc);
        freeUrls.set(id, published.downloadUrl);
      }
    } else {
      for (const image of targets) {
        await unpublishFreeOriginal(safeText(image?.id));
      }
    }

    const nextImages = doc.images.map((image: any) => {
      const id = safeText(image?.id);
      if (!wanted.has(id)) return image;

      const next = {
        ...image,
        plan_type: requestedPriceType,
        price_type: requestedPriceType,
        is_free: requestedPriceType === 'free',
      };

      if (requestedPriceType === 'free') {
        return {
          ...next,
          download_url: freeUrls.get(id) || safeText(image?.download_url),
        };
      }

      const { download_url: _downloadUrl, ...locked } = next;
      return locked;
    });

    await writeCatalog(doc, nextImages);
    return sendJson(res, 200, {
      ok: true,
      success: true,
      action: 'updateImagePriceType',
      updated: targets.length,
      price_type: requestedPriceType,
      manifest_count: nextImages.length,
    });
  } catch (error: any) {
    const code = safeText(error?.message || 'IMAGE_PRICE_TYPE_UPDATE_FAILED');
    return sendJson(res, 500, { ok: false, success: false, error: code });
  }
}

function publicKeyFromUrl(value: any) {
  const raw = safeText(value);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  } catch {
    return '';
  }
}

async function handleDeleteImages(req: any, res: any, body: any) {
  requireAdmin(req);
  const cfg = getRuntimeConfig();
  const imageIds = normalizeImageIds(body);
  if (!imageIds.length) return sendJson(res, 400, { ok: false, error: 'IMAGE_IDS_REQUIRED' });

  const doc = await readCatalog(true);
  const wanted = new Set(imageIds);
  const targets = doc.images.filter((image: any) => wanted.has(safeText(image?.id)));
  if (!targets.length) return sendJson(res, 404, { ok: false, error: 'IMAGE_NOT_FOUND' });

  for (const image of targets) {
    const id = safeText(image?.id);
    const publicKeys = new Set<string>();
    for (const value of [image?.thumbnail_url, image?.preview_url, image?.public_url]) {
      const key = publicKeyFromUrl(value);
      if (key) publicKeys.add(key);
    }
    if (id) publicKeys.add(`thumbnails/by-image-id/${id}.webp`);

    const tasks: Promise<any>[] = [];
    for (const key of publicKeys) tasks.push(removeObject(cfg.publicBucket, key));
    if (id) {
      for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
        tasks.push(removeObject(cfg.privateBucket, `originals/by-image-id/${id}/original.${ext}`));
      }
    }
    await Promise.allSettled(tasks);
  }

  const nextImages = doc.images.filter((image: any) => !wanted.has(safeText(image?.id)));
  await writeCatalog(doc, nextImages);
  return sendJson(res, 200, { ok: true, success: true, action: 'deleteImages', deleted: targets.length, manifest_count: nextImages.length });
}

function normalizeBody(req: any) {
  if (req?.body == null) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader?.("Allow", "GET, POST, OPTIONS");
    return sendJson(res, 200, { ok: true });
  }

  try {
    const action = safeText(req?.query?.action);
    if (action === "public-catalog") {
      if (req.method !== "GET") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handlePublicCatalog(req, res);
    }
    if (action === "public-free-download") {
      if (req.method !== "GET") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handlePublicFreeDownload(req, res);
    }
    if (action === "admin-list-images") {
      if (req.method !== "GET") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handleList(req, res);
    }
    if (action === "admin-list-image-categories") {
      if (req.method !== "GET") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handleCategories(req, res);
    }
    if (action === "createImageCategory") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handleCreateCategory(req, res, normalizeBody(req));
    }
    if (action === "renameImageCategory") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handleRenameCategory(req, res, normalizeBody(req));
    }
    if (action === "deleteImageCategory") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      return await handleDeleteCategory(req, res, normalizeBody(req));
    }
    if (action === "updateImageCategory") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, success: false, error: "Method Not Allowed" });
      return await handleUpdateCategory(req, res, normalizeBody(req));
    }
    if (action === "updateImagePriceType") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, success: false, error: "Method Not Allowed" });
      return await handleUpdatePriceType(req, res, normalizeBody(req));
    }
    if (action === "deleteImages") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, success: false, error: "Method Not Allowed" });
      return await handleDeleteImages(req, res, normalizeBody(req));
    }
    if (action === "uploadImage") {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, success: false, error: "Method Not Allowed" });
      return await handleUpload(req, res, normalizeBody(req));
    }
    return sendJson(res, 400, { ok: false, error: "Unsupported image-admin action" });
  } catch (error: any) {
    const status = Number(error?.statusCode) || (safeText(error?.message).startsWith("IMAGE_ADMIN_ENV_MISSING:") ? 503 : 500);
    return sendJson(res, status, { ok: false, success: false, error: safeText(error?.message || "IMAGE_ADMIN_FAILED") });
  }
}

