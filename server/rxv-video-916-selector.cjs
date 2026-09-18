"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SOURCE_ROOT = process.env.RXV_SOURCE_ROOT || "D:\\Pomodoro-app";
const SITE_BASE_URL = String(process.env.RXV_SITE_BASE_URL || "https://pomodoro-app-eight-rouge.vercel.app").replace(/\/$/, "");
const MIN_WIDTH = Math.max(720, Number(process.env.RXV_MIN_916_WIDTH || 900) || 900);
const MIN_HEIGHT = Math.max(1280, Number(process.env.RXV_MIN_916_HEIGHT || 1600) || 1600);
const RATIO_MIN = Number(process.env.RXV_916_RATIO_MIN || 0.54) || 0.54;
const RATIO_MAX = Number(process.env.RXV_916_RATIO_MAX || 0.59) || 0.59;

function safeFileName(value) {
  return (String(value || "item")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100) || "item");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function outputRoot() {
  const configured = String(process.env.RXV_AUTO_VIDEO_ROOT || "").trim();
  if (configured) return path.resolve(configured);
  if (process.platform === "win32") return "D:\\RXV-AutoVideo";
  return path.join(ROOT, ".local-tools", "rxv-auto-video");
}

function detectExt(url, contentType = "") {
  const type = String(contentType || "").toLowerCase();
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return ext;
  } catch {}
  return ".jpg";
}

function getManifestSource() {
  const base = String(process.env.VITE_PUBLIC_R2_URL || process.env.R2_PUBLIC_ASSET_URL || "").replace(/\/$/, "");
  if (base && /^https?:\/\//i.test(base)) return base + "/catalog/images-public.json";
  const explicit = String(process.env.VITE_IMAGE_MANIFEST_URL || "").trim();
  if (/^https?:\/\//i.test(explicit)) return explicit;
  return "";
}

async function loadPublicManifest() {
  const source = getManifestSource();
  if (!source) return { images: [], categories: [] };
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) throw new Error("R2 圖片清單讀取失敗：HTTP " + response.status);
  const raw = await response.json();
  return Array.isArray(raw) ? { images: raw, categories: [] } : (raw || { images: [], categories: [] });
}

function normalizeManifestImages(manifest) {
  const categories = Array.isArray(manifest.categories) ? manifest.categories : [];
  const categoryMap = new Map();
  for (const c of categories) {
    const id = String(c && c.id || "").trim();
    if (id) categoryMap.set(id, String(c && c.name || id).trim());
  }
  return (Array.isArray(manifest.images) ? manifest.images : []).map((img) => {
    const id = String(img && img.id || "").trim();
    const categoryId = String(img && (img.category_id || img.category_slug || img.category_name || img.category) || "").trim();
    const category = String(img && (img.category_name || img.category) || categoryMap.get(categoryId) || categoryId || "其他素材").trim();
    const title = String(img && img.title || category || "圖片素材").trim();
    const imageUrl = String(img && (img.preview_url || img.thumbnail_url || img.download_url) || "").trim();
    return { image_id: id, id, title, category, category_id: categoryId, image_url: imageUrl };
  }).filter((img) => img.id && img.category !== "本機 WebP 測試");
}

function categoryMatcher(label) {
  const text = String(label || "").trim();
  if (/房仲|房地產|不動產/.test(text)) return /房仲|房地產|不動產/;
  if (/美髮|髮型|沙龍/.test(text)) return /美髮|髮型|沙龍/;
  if (/美甲/.test(text)) return /美甲/;
  if (/美容|SPA|芳療/i.test(text)) return /美容|SPA|芳療/i;
  if (/牙醫|牙科/.test(text)) return /牙醫|牙科/;
  if (/寵物美容|寵物|動物/.test(text)) return /寵物美容|寵物|動物/;
  if (/佛|宗教|觀音|地藏|阿彌陀|療癒/.test(text)) return /佛|宗教|觀音|地藏|阿彌陀|療癒/;
  return null;
}

function candidatePriority(image) {
  const text = String((image && image.title) || "") + " " + String((image && image.id) || "");
  let score = 100;
  if (/9[:：]?16|9x16|直式|短影音|tiktok|shorts?/i.test(text)) score -= 60;
  if (/手機|mobile|story|reel/i.test(text)) score -= 20;
  return score;
}

function openMetadataDb() {
  let DatabaseSync = null;
  try { ({ DatabaseSync } = require("node:sqlite")); } catch {}
  if (!DatabaseSync) return null;
  const dbPath = path.join(ROOT, "data", "rxv-image-publisher.db");
  ensureDir(path.dirname(dbPath));
  const db = new DatabaseSync(dbPath);
  db.exec(
    "CREATE TABLE IF NOT EXISTS rxv_image_metadata (" +
    " image_id TEXT PRIMARY KEY," +
    " image_url TEXT NOT NULL DEFAULT ''," +
    " width INTEGER NOT NULL DEFAULT 0," +
    " height INTEGER NOT NULL DEFAULT 0," +
    " ratio REAL NOT NULL DEFAULT 0," +
    " is_916 INTEGER NOT NULL DEFAULT 0," +
    " is_high_res_916 INTEGER NOT NULL DEFAULT 0," +
    " original_path TEXT NOT NULL DEFAULT ''," +
    " checked_at TEXT NOT NULL DEFAULT ''" +
    ");" +
    "CREATE TABLE IF NOT EXISTS rxv_video_916_usage (" +
    " video_id TEXT NOT NULL," +
    " image_id TEXT NOT NULL," +
    " used_at TEXT NOT NULL," +
    " PRIMARY KEY(video_id,image_id)" +
    ");" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_video_916_usage_image ON rxv_video_916_usage(image_id);"
  );
  return db;
}

function tableExists(db, name) {
  try {
    return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=? LIMIT 1").get(name);
  } catch {
    return false;
  }
}

function readPreviouslyUsedImageIds(db) {
  const used = new Set();
  if (!db) return used;
  try {
    if (tableExists(db, "rxv_image_publish")) {
      const rows = db.prepare("SELECT image_id FROM rxv_image_publish WHERE status IN ('draft','scheduled','published')").all();
      for (const row of rows) if (row && row.image_id) used.add(String(row.image_id));
    }
  } catch {}
  try {
    if (tableExists(db, "rxv_video_job_images")) {
      const rows = db.prepare("SELECT image_id FROM rxv_video_job_images").all();
      for (const row of rows) if (row && row.image_id) used.add(String(row.image_id));
    }
  } catch {}
  try {
    if (tableExists(db, "rxv_video_916_usage")) {
      const rows = db.prepare("SELECT image_id FROM rxv_video_916_usage").all();
      for (const row of rows) if (row && row.image_id) used.add(String(row.image_id));
    }
  } catch {}
  return used;
}

function readCachedMetadata(db, imageId) {
  if (!db) return null;
  try {
    const row = db.prepare("SELECT * FROM rxv_image_metadata WHERE image_id=? LIMIT 1").get(String(imageId));
    if (!row) return null;
    const originalPath = String(row.original_path || "");
    if (!originalPath || !fs.existsSync(originalPath)) return null;
    return row;
  } catch {
    return null;
  }
}

function saveCachedMetadata(db, data) {
  if (!db || !data || !data.imageId) return;
  try {
    db.prepare(
      "INSERT INTO rxv_image_metadata(image_id,image_url,width,height,ratio,is_916,is_high_res_916,original_path,checked_at) " +
      "VALUES(?,?,?,?,?,?,?,?,?) " +
      "ON CONFLICT(image_id) DO UPDATE SET image_url=excluded.image_url,width=excluded.width,height=excluded.height,ratio=excluded.ratio,is_916=excluded.is_916,is_high_res_916=excluded.is_high_res_916,original_path=excluded.original_path,checked_at=excluded.checked_at"
    ).run(
      String(data.imageId),
      String(data.imageUrl || ""),
      Number(data.width || 0),
      Number(data.height || 0),
      Number(data.ratio || 0),
      data.is916 ? 1 : 0,
      data.isHighRes916 ? 1 : 0,
      String(data.originalPath || ""),
      new Date().toISOString()
    );
  } catch {}
}

function orientedSize(meta) {
  let width = Number(meta && meta.width || 0);
  let height = Number(meta && meta.height || 0);
  const orientation = Number(meta && meta.orientation || 1);
  if ([5, 6, 7, 8].includes(orientation)) {
    const tmp = width;
    width = height;
    height = tmp;
  }
  return { width, height };
}

function is916Size(width, height) {
  const w = Number(width || 0);
  const h = Number(height || 0);
  if (!w || !h || h <= w) return false;
  const ratio = w / h;
  return ratio >= RATIO_MIN && ratio <= RATIO_MAX;
}

function isHighRes916Size(width, height) {
  return is916Size(width, height) && Number(width) >= MIN_WIDTH && Number(height) >= MIN_HEIGHT;
}

async function requestOriginalDownloadUrl(imageId) {
  const endpoint = SITE_BASE_URL + "/api/main?action=download-image";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageId: String(imageId || "") }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data || !data.downloadUrl) {
    throw new Error("無法取得原圖：" + String((data && data.error) || ("HTTP " + response.status)));
  }
  return String(data.downloadUrl);
}

async function downloadOriginalById(image, cacheDir) {
  const imageId = String(image && (image.image_id || image.id) || "").trim();
  if (!imageId) throw new Error("圖片缺少 image_id");
  ensureDir(cacheDir);

  const stem = safeFileName(imageId) + ".";
  const existing = fs.readdirSync(cacheDir).find((name) => name.startsWith(stem));
  if (existing) return path.join(cacheDir, existing);

  const signedUrl = await requestOriginalDownloadUrl(imageId);
  const response = await fetch(signedUrl, { cache: "no-store" });
  if (!response.ok) throw new Error("原圖下載失敗：HTTP " + response.status);
  const ext = detectExt(signedUrl, response.headers.get("content-type") || "");
  const target = path.join(cacheDir, safeFileName(imageId) + ext);
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}

async function inspectCandidate916(sharp, db, image, cacheDir) {
  const imageId = String(image && (image.image_id || image.id) || "").trim();
  const cached = readCachedMetadata(db, imageId);
  if (cached) {
    return {
      image,
      localPath: String(cached.original_path),
      width: Number(cached.width || 0),
      height: Number(cached.height || 0),
      ratio: Number(cached.ratio || 0),
      is916: Number(cached.is_916 || 0) === 1,
      isHighRes916: Number(cached.is_high_res_916 || 0) === 1,
      fromCache: true,
    };
  }

  const localPath = await downloadOriginalById(image, cacheDir);
  const meta = await sharp(localPath).metadata();
  const size = orientedSize(meta);
  const ratio = size.width && size.height ? size.width / size.height : 0;
  const is916 = is916Size(size.width, size.height);
  const isHighRes916 = isHighRes916Size(size.width, size.height);

  saveCachedMetadata(db, {
    imageId,
    imageUrl: image.image_url || "",
    width: size.width,
    height: size.height,
    ratio,
    is916,
    isHighRes916,
    originalPath: localPath,
  });

  return {
    image,
    localPath,
    width: size.width,
    height: size.height,
    ratio,
    is916,
    isHighRes916,
    fromCache: false,
  };
}

function record916Usage(videoId, items) {
  const db = openMetadataDb();
  if (!db) return;
  try {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO rxv_video_916_usage(video_id,image_id,used_at) VALUES(?,?,?)"
    );
    const now = new Date().toISOString();
    for (const item of Array.isArray(items) ? items : []) {
      const imageId = String(item && item.image && (item.image.image_id || item.image.id) || "").trim();
      if (imageId) stmt.run(String(videoId || "video"), imageId, now);
    }
  } finally {
    try { db.close(); } catch {}
  }
}

async function prepare916Images(options, sharp, requestedCount) {
  const current = Array.isArray(options.images)
    ? options.images.filter((x) => x && (x.image_id || x.id))
    : [];
  const currentIds = new Set(current.map((x) => String(x.image_id || x.id)));
  const db = openMetadataDb();
  const used = readPreviouslyUsedImageIds(db);
  for (const id of currentIds) used.delete(id);

  const cacheDir = ensureDir(path.join(outputRoot(), "original-cache"));
  const selected = [];
  const selectedIds = new Set();

  async function tryAdd(image) {
    const id = String(image && (image.image_id || image.id) || "").trim();
    if (!id || selectedIds.has(id)) return false;
    try {
      const inspected = await inspectCandidate916(sharp, db, image, cacheDir);
      if (!inspected.isHighRes916) return false;
      selected.push(inspected);
      selectedIds.add(id);
      return true;
    } catch (error) {
      console.warn("[RXV v2.1] skip candidate", id, error && error.message ? error.message : error);
      return false;
    }
  }

  for (const image of current) {
    if (selected.length >= requestedCount) break;
    await tryAdd(image);
  }

  if (selected.length < requestedCount) {
    const manifest = await loadPublicManifest();
    const matcher = categoryMatcher(options.categoryLabel || "");
    let candidates = normalizeManifestImages(manifest);
    if (matcher) {
      candidates = candidates.filter((img) => matcher.test(String(img.category || "") + " " + String(img.title || "")));
    } else if (String(options.categoryLabel || "").trim()) {
      const label = String(options.categoryLabel || "").trim().toLowerCase();
      candidates = candidates.filter((img) =>
        (String(img.category || "") + " " + String(img.title || "")).toLowerCase().includes(label)
      );
    }
    candidates = candidates
      .filter((img) => !used.has(String(img.id)) && !selectedIds.has(String(img.id)))
      .sort((a, b) => candidatePriority(a) - candidatePriority(b));

    for (const image of candidates) {
      if (selected.length >= requestedCount) break;
      await tryAdd(image);
    }
  }

  if (db) {
    try { db.close(); } catch {}
  }

  if (selected.length < requestedCount) {
    throw new Error(
      "此分類目前只找到 " + selected.length +
      " 張符合 9:16 高畫質原圖；需要 " + requestedCount +
      " 張。請確認該分類的直式圖已上傳。"
    );
  }

  return selected.slice(0, requestedCount);
}

module.exports = {
  prepare916Images,
  record916Usage,
  is916Size,
  isHighRes916Size,
  MIN_WIDTH,
  MIN_HEIGHT,
  RATIO_MIN,
  RATIO_MAX,
};
