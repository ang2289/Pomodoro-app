"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
let sharpForPinterest = null;
try { sharpForPinterest = require("sharp"); } catch {}

let DatabaseSync = null;
try { ({ DatabaseSync } = require("node:sqlite")); } catch {}

const ROOT = path.resolve(__dirname, "..");
const HOST = "127.0.0.1";
const PORT = Number(process.env.RXV_IMAGE_PUBLISHER_V2_PORT || 3018);
const DB_PATH = path.join(ROOT, "data", "rxv-image-publisher.db");
const SALES_URL = "https://pomodoro-app-eight-rouge.vercel.app/images";
const PLATFORM = "tiktok";
const SMALL_PRICE = 99;
const ALL_PRICE = 199;
const HIDDEN_PUBLIC_CATEGORY_NAMES = new Set(["本機 WebP 測試"]);

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const text = fs.readFileSync(filePath, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    console.warn("[RXV v2] env load warning:", error && error.message ? error.message : error);
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const { buildVideo, listMp3Files, resolveFfmpeg, outputRoot } = require("./rxv-video-builder-v2.cjs");
const { createTikTokOfficialApi } = require("./tiktok-official-api.cjs");
const tiktokOfficial = createTikTokOfficialApi();

function nowIso() { return new Date().toISOString(); }
function randomId(prefix = "rxv") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

function getManifestSource() {
  const base = String(process.env.VITE_PUBLIC_R2_URL || process.env.R2_PUBLIC_ASSET_URL || "").replace(/\/$/, "");
  if (base) return { type: "url", value: base + "/catalog/images-public.json" };
  const explicit = String(process.env.VITE_IMAGE_MANIFEST_URL || "").trim();
  if (/^https?:\/\//i.test(explicit)) return { type: "url", value: explicit };
  return { type: "file", value: path.join(ROOT, "public", "data", "images-public.json") };
}

function ensureDbSchema(db) {
  db.exec(
    "PRAGMA journal_mode = WAL;\n" +
    "PRAGMA synchronous = NORMAL;\n" +
    "CREATE TABLE IF NOT EXISTS rxv_image_publish (" +
    " image_id TEXT NOT NULL, platform TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft'," +
    " title TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', plan_type TEXT NOT NULL DEFAULT ''," +
    " image_url TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', publish_id TEXT NOT NULL DEFAULT ''," +
    " post_url TEXT NOT NULL DEFAULT '', drafted_at TEXT, published_at TEXT, updated_at TEXT NOT NULL," +
    " PRIMARY KEY (image_id, platform));" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_image_publish_platform_status ON rxv_image_publish(platform, status);" +
    "CREATE TABLE IF NOT EXISTS rxv_video_jobs (" +
    " video_id TEXT PRIMARY KEY, platform TEXT NOT NULL DEFAULT 'tiktok', status TEXT NOT NULL DEFAULT 'draft'," +
    " category_key TEXT NOT NULL DEFAULT '', category_label TEXT NOT NULL DEFAULT '', pack_label TEXT NOT NULL DEFAULT ''," +
    " pack_count INTEGER NOT NULL DEFAULT 0, site_total INTEGER NOT NULL DEFAULT 0, image_count INTEGER NOT NULL DEFAULT 0," +
    " caption TEXT NOT NULL DEFAULT '', pain_lines_json TEXT NOT NULL DEFAULT '[]', mp3_choice TEXT NOT NULL DEFAULT 'auto'," +
    " mp3_path TEXT NOT NULL DEFAULT '', video_path TEXT NOT NULL DEFAULT '', duration_sec REAL NOT NULL DEFAULT 0," +
    " publish_mode TEXT NOT NULL DEFAULT '', publish_id TEXT NOT NULL DEFAULT '', post_url TEXT NOT NULL DEFAULT ''," +
    " error_message TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, rendered_at TEXT, published_at TEXT, updated_at TEXT NOT NULL);" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_video_jobs_status ON rxv_video_jobs(platform, status, created_at);" +
    "CREATE TABLE IF NOT EXISTS rxv_video_job_images (" +
    " video_id TEXT NOT NULL, image_id TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT ''," +
    " image_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0," +
    " PRIMARY KEY(video_id, image_id));" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_video_job_images_image ON rxv_video_job_images(image_id);" +
    "CREATE TABLE IF NOT EXISTS rxv_fb_image_posts (" +
    " id INTEGER PRIMARY KEY AUTOINCREMENT, image_id TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT ''," +
    " image_fingerprint TEXT NOT NULL DEFAULT '', title TEXT NOT NULL DEFAULT '', category_key TEXT NOT NULL DEFAULT ''," +
    " category_label TEXT NOT NULL DEFAULT '', is_free INTEGER NOT NULL DEFAULT 0, platform TEXT NOT NULL DEFAULT 'facebook'," +
    " target_type TEXT NOT NULL DEFAULT 'personal', target_name TEXT NOT NULL DEFAULT '', copy_mode TEXT NOT NULL DEFAULT 'strict'," +
    " allow_link INTEGER NOT NULL DEFAULT 0, post_text TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'posted'," +
    " created_at TEXT NOT NULL, posted_at TEXT, updated_at TEXT NOT NULL);" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_fb_image_posts_target ON rxv_fb_image_posts(target_type, target_name, status, image_fingerprint);" +
    "CREATE TABLE IF NOT EXISTS rxv_pinterest_posts (" +
    " id INTEGER PRIMARY KEY AUTOINCREMENT, image_id TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT ''," +
    " image_fingerprint TEXT NOT NULL DEFAULT '', title TEXT NOT NULL DEFAULT '', category_key TEXT NOT NULL DEFAULT ''," +
    " category_label TEXT NOT NULL DEFAULT '', pin_title TEXT NOT NULL DEFAULT '', pin_description TEXT NOT NULL DEFAULT ''," +
    " destination_url TEXT NOT NULL DEFAULT '', board_name TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'prepared'," +
    " created_at TEXT NOT NULL, posted_at TEXT, updated_at TEXT NOT NULL);" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_pinterest_posts_status ON rxv_pinterest_posts(status, image_fingerprint);"
  );
}

function requireDb() {
  if (!DatabaseSync) throw new Error("目前 Node.js 不支援 node:sqlite。請使用 Node 22+ 執行。");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  ensureDbSchema(db);
  return db;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function text(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error("REQUEST_TOO_LARGE"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error("JSON_FORMAT_ERROR")); }
    });
    req.on("error", reject);
  });
}

const CATEGORY_RULES = [
  {
    key: "real-estate", label: "房仲", packLabel: "房仲常用圖片", aliases: ["房仲／房地產", "房仲/房地產", "房仲", "房地產"], test: /房仲|房地產|不動產/,
    painLines: [
      "房仲每天發文還在花時間找圖嗎？",
      "帶看、成交、交屋素材不用再一張張找",
      "發文直接挑圖，社群更新更省時間",
      "房仲小包 NT$99｜全部素材 NT$199",
    ],
    hashtags: "#房仲 #房地產 #房仲素材 #社群素材 #圖片素材 #RXV夢想創作工作室",
  },
  {
    key: "hair", label: "美髮", packLabel: "美髮常用圖片", aliases: ["美髮／沙龍", "美髮/沙龍", "美髮", "沙龍"], test: /美髮|沙龍|髮型/,
    painLines: [
      "美髮每天發文還在一直找素材嗎？",
      "預約、染燙、造型、沙龍宣傳一次整理",
      "不用每次臨時找圖，直接挑圖就能發",
      "美髮小包 NT$99｜全部素材 NT$199",
    ],
    hashtags: "#美髮 #髮型師 #沙龍 #美髮素材 #社群素材 #圖片素材",
  },
  {
    key: "nail", label: "美甲", packLabel: "美甲常用圖片", aliases: ["美甲"], test: /美甲|指甲/,
    painLines: [
      "美甲發文總是少一張好看的圖嗎？",
      "預約、款式、形象宣傳素材一次整理",
      "不用每次重新找圖，社群更新更快",
      "美甲小包 NT$99｜全部素材 NT$199",
    ],
    hashtags: "#美甲 #美甲師 #美甲素材 #社群素材 #圖片素材",
  },
  {
    key: "beauty-spa", label: "美容 SPA", packLabel: "美容 SPA 常用圖片", aliases: ["美容SPA", "美容 SPA", "美容／SPA", "美容/SPA"], test: /美容|SPA|芳療/,
    painLines: [
      "美容 SPA 發文還在臨時找吸睛圖片嗎？",
      "療程、放鬆、服務情境素材一次整理",
      "不用每天重新找圖，社群更有一致感",
      "美容 SPA 小包 NT$99｜全部素材 NT$199",
    ],
    hashtags: "#美容SPA #美容師 #芳療 #社群素材 #圖片素材",
  },
  {
    key: "dental", label: "牙醫", packLabel: "牙醫常用圖片", aliases: ["牙醫", "牙科"], test: /牙醫|牙科/,
    painLines: [
      "牙醫診所衛教宣傳，還在到處找圖片嗎？",
      "看診、設備、衛教情境素材快速發文",
      "專業素材讓診所內容更容易持續更新",
      "牙醫小包 NT$99｜全部素材 NT$199",
    ],
    hashtags: "#牙醫 #牙科 #診所行銷 #牙醫素材 #社群素材 #圖片素材",
  },
  {
    key: "pet", label: "寵物", packLabel: "寵物常用圖片", aliases: ["寵物／動物", "寵物/動物", "寵物", "動物"], test: /寵物|動物|毛孩/,
    painLines: [
      "寵物店每天發文還在花時間找圖嗎？",
      "毛孩、服務、宣傳情境素材一次整理",
      "直接挑圖發文，省下重複找素材時間",
      "職業小包 NT$99｜全部素材 NT$199",
    ],
    hashtags: "#寵物 #毛孩 #寵物素材 #社群素材 #圖片素材",
  },
  {
    key: "buddha", label: "佛像", packLabel: "佛像圖片", test: /宗教|佛|觀音|地藏|阿彌陀|療癒/,
    painLines: [
      "願見者平安順心、福慧增長",
      "佛像與靜心圖片持續分享",
      "更多圖片可到網站查看",
      "掃 QR Code 立即查看",
    ],
    hashtags: "#佛像 #佛教 #祈福 #靜心 #免費圖片",
    freeStyle: true,
  },
];

const GENERIC_RULE = {
  key: "other", label: "其他素材", packLabel: "專業圖片素材", test: /.*/,
  painLines: [
    "每天發文還在花時間找圖片嗎？",
    "常用情境素材一次整理",
    "直接挑圖使用，省下重複找素材時間",
    "小包 NT$99｜全部素材 NT$199",
  ],
  hashtags: "#圖片素材 #社群素材 #商業素材 #RXV夢想創作工作室",
};

function categoryMatchesRule(rule, category) {
  const name = String(category || "").trim();
  if (!name) return false;
  const aliases = Array.isArray(rule && rule.aliases) ? rule.aliases : [];
  if (aliases.includes(name)) return true;
  return Boolean(rule && rule.test && rule.test.test(name));
}

function ruleForCategory(category) {
  const name = String(category || "").trim();
  return CATEGORY_RULES.find((rule) => categoryMatchesRule(rule, name)) || GENERIC_RULE;
}

async function loadManifest() {
  const source = getManifestSource();
  let raw;
  if (source.type === "url") {
    const response = await fetch(source.value, { cache: "no-store" });
    if (!response.ok) throw new Error("R2 圖片清單讀取失敗：HTTP " + response.status);
    raw = await response.json();
  } else {
    if (!fs.existsSync(source.value)) throw new Error("找不到圖片清單，請確認 VITE_PUBLIC_R2_URL。");
    raw = JSON.parse(fs.readFileSync(source.value, "utf8"));
  }

  const manifest = Array.isArray(raw) ? { images: raw, categories: [] } : raw || {};
  const categories = Array.isArray(manifest.categories) ? manifest.categories : [];
  const categoryMap = new Map();
  for (const c of categories) {
    const id = String(c && c.id || "").trim();
    const name = String(c && c.name || id).trim();
    if (id) categoryMap.set(id, name);
  }

  const images = (Array.isArray(manifest.images) ? manifest.images : [])
    .map((img) => {
      const id = String(img && img.id || "").trim();
      const categoryId = String(img && (img.category_id || img.category_slug || img.category_name || img.category) || "").trim();
      const rawCategory = String(img && img.category || "").trim();
      const category = String(
        img && img.category_name ||
        categoryMap.get(categoryId) ||
        categoryMap.get(rawCategory) ||
        rawCategory ||
        categoryId ||
        "其他素材"
      ).trim();
      const title = String(img && img.title || category || "圖片素材").trim();
      const imageUrl = String(img && (img.preview_url || img.thumbnail_url || img.download_url) || "").trim();
      const rawPlan = String(img && (img.price_type || img.plan_type) || "bundle").toLowerCase();
      const planType = rawPlan === "free" ? "free" : "bundle";
      return { id, title, categoryId, category, imageUrl, planType };
    })
    .filter((img) => img.id && img.imageUrl && !HIDDEN_PUBLIC_CATEGORY_NAMES.has(img.category));

  const stats = {};
  for (const rule of CATEGORY_RULES) stats[rule.key] = images.filter((img) => categoryMatchesRule(rule, img.category)).length;

  return {
    source,
    total: images.length,
    updatedAt: String(manifest.updated_at || ""),
    images,
    stats,
  };
}

function categoryOptions(manifest) {
  return CATEGORY_RULES
    .map((rule) => ({ key: rule.key, label: rule.label, count: Number(manifest.stats[rule.key] || 0) }))
    .filter((item) => item.count > 0);
}

function buildCaption(rule, packCount, siteTotal) {
  if (rule.freeStyle) {
    return [
      "🙏 免費佛像圖片分享",
      "",
      "願見者平安順心、福慧增長。",
      "更多佛像與圖片素材可到網站查看。",
      "",
      "🖼️ 查看圖片：",
      SALES_URL,
      "",
      rule.hashtags,
    ].join("\n");
  }

  const detailByKey = {
    "real-estate": "包含帶看、成交、交屋、公設、生活機能、社群宣傳等情境，買一次即可重複使用，之後要發文直接挑圖，不用每次重新找素材。",
    hair: "包含預約、染燙、造型、沙龍宣傳等常用情境，買一次即可重複使用，社群更新不用每次重新找素材。",
    nail: "包含預約、款式展示、作品分享、形象宣傳等常用情境，買一次即可重複使用。",
    "beauty-spa": "包含療程、服務、放鬆氛圍、預約宣傳等常用情境，買一次即可重複使用。",
    dental: "包含看診、醫病溝通、牙科衛教、設備與診所宣傳等情境，買一次即可重複使用。",
    pet: "包含毛孩、洗護、服務與社群宣傳等常用情境，買一次即可重複使用。",
  };
  const audienceByKey = {
    "real-estate": "房仲業務｜房地產從業人員｜FB｜IG｜LINE 社群｜短影音宣傳",
    hair: "美髮師｜髮廊｜沙龍｜FB｜IG｜LINE 社群｜短影音宣傳",
    nail: "美甲師｜美甲工作室｜FB｜IG｜LINE 社群｜短影音宣傳",
    "beauty-spa": "美容師｜SPA／芳療工作室｜FB｜IG｜LINE 社群｜短影音宣傳",
    dental: "牙醫診所｜牙科團隊｜衛教社群｜FB｜IG｜LINE｜短影音宣傳",
    pet: "寵物店｜寵物美容｜毛孩社群｜FB｜IG｜LINE｜短影音宣傳",
  };
  const averageLine = packCount > SMALL_PRICE
    ? "平均一張不到 NT$1"
    : (packCount > 0 ? `平均每張約 NT$${(SMALL_PRICE / packCount).toFixed(1)}` : "");

  return [
    `🏠 ${rule.label}每天發文還在花時間找圖嗎？`,
    "",
    `📦 ${rule.label}專用圖片素材包｜共 ${packCount} 張`,
    `💰 限時價 NT$${SMALL_PRICE}`,
    averageLine,
    "",
    detailByKey[rule.key] || "買一次即可重複使用，之後要發文直接挑圖，不用每次重新找素材。",
    "",
    "適合：",
    audienceByKey[rule.key] || "商家社群｜FB｜IG｜LINE 社群｜短影音宣傳",
    "",
    "🔗 查看圖片／購買：",
    SALES_URL,
    "",
    "另外還有：",
    "✂️ 美髮｜💅 美甲｜💆 美容 SPA｜🦷 牙醫 等專業圖片素材。",
    "",
    `🔥 想一次取得全部圖片？完整素材庫共 ${siteTotal} 張，限時 NT$${ALL_PRICE}，包含目前全部職業圖片與其他素材。`,
    "",
    rule.hashtags,
  ].filter(Boolean).join("\n");
}

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    u.search = "";
    u.hash = "";
    return u.toString().toLowerCase();
  } catch {
    return raw.replace(/[?#].*$/, "").toLowerCase();
  }
}

function imageFingerprint(img) {
  const raw = String(img && (img.imageUrl || img.image_url) || "").trim();
  const clean = normalizeImageUrl(raw);
  if (!clean) return String(img && (img.id || img.image_id) || "").trim().toLowerCase();
  try {
    const u = new URL(clean);
    const p = decodeURIComponent(u.pathname || "").replace(/\\/g, "/").replace(/\/+/g, "/").toLowerCase();
    return p || clean;
  } catch {
    return clean;
  }
}

function emptyImageKeySet() {
  return { ids: new Set(), urls: new Set(), fingerprints: new Set() };
}

function addUsedImage(used, img) {
  const id = String(img && (img.id || img.image_id) || "").trim();
  const url = normalizeImageUrl(img && (img.imageUrl || img.image_url));
  const fp = imageFingerprint(img);
  if (id) used.ids.add(id);
  if (url) used.urls.add(url);
  if (fp) used.fingerprints.add(fp);
}

function isImageUsed(used, img) {
  const id = String(img && (img.id || img.image_id) || "").trim();
  const url = normalizeImageUrl(img && (img.imageUrl || img.image_url));
  const fp = imageFingerprint(img);
  return Boolean(
    (id && used.ids.has(id)) ||
    (url && used.urls.has(url)) ||
    (fp && used.fingerprints.has(fp))
  );
}

function filterUniqueUnused(images, used) {
  const seen = {
    ids: new Set(used.ids),
    urls: new Set(used.urls),
    fingerprints: new Set(used.fingerprints),
  };
  const out = [];
  for (const img of images) {
    if (isImageUsed(seen, img)) continue;
    out.push(img);
    addUsedImage(seen, img);
  }
  return out;
}

function getUsedImageKeys(db) {
  const used = emptyImageKeySet();
  try {
    const oldRows = db.prepare(
      "SELECT image_id, image_url FROM rxv_image_publish WHERE platform=? AND status IN ('draft','scheduled','published')"
    ).all(PLATFORM);
    for (const row of oldRows) addUsedImage(used, row);
  } catch {}
  const rows = db.prepare(
    "SELECT i.image_id, i.image_url FROM rxv_video_job_images i JOIN rxv_video_jobs j ON j.video_id=i.video_id " +
    "WHERE j.platform=? AND j.status IN ('draft','rendering','ready','publishing','scheduled','published','failed')"
  ).all(PLATFORM);
  for (const row of rows) addUsedImage(used, row);
  return used;
}

function listJobs(db, limit = 30) {
  const n = Math.max(1, Math.min(100, Number(limit || 30)));
  const jobs = db.prepare("SELECT * FROM rxv_video_jobs WHERE platform=? ORDER BY created_at DESC LIMIT ?").all(PLATFORM, n);
  const imageStmt = db.prepare("SELECT * FROM rxv_video_job_images WHERE video_id=? ORDER BY sort_order ASC");
  return jobs.map((job) => ({
    ...job,
    pain_lines: JSON.parse(String(job.pain_lines_json || "[]")),
    images: imageStmt.all(job.video_id),
  }));
}

function pickRule(manifest, requestedKey, used, imagesPerVideo) {
  if (requestedKey && requestedKey !== "auto") {
    const exact = CATEGORY_RULES.find((r) => r.key === requestedKey);
    if (exact) return exact;
  }
  for (const rule of CATEGORY_RULES) {
    const matching = manifest.images.filter((img) => categoryMatchesRule(rule, img.category));
    const available = filterUniqueUnused(matching, used);
    if (available.length >= imagesPerVideo) return rule;
  }
  return GENERIC_RULE;
}

async function generateVideoJobs({ count = 1, categoryKey = "auto", imagesPerVideo = 4, mp3Choice = "auto" } = {}) {
  const manifest = await loadManifest();
  const db = requireDb();
  try {
    const used = getUsedImageKeys(db);
    const jobsToCreate = Math.max(1, Math.min(5, Number(count || 1)));
    const perVideo = Math.max(2, Math.min(6, Number(imagesPerVideo || 4)));
    const created = [];

    for (let jobIndex = 0; jobIndex < jobsToCreate; jobIndex += 1) {
      const rule = pickRule(manifest, categoryKey, used, perVideo);
      const available = filterUniqueUnused(
        manifest.images.filter((img) => categoryMatchesRule(rule, img.category)),
        used
      ).sort((a, b) => a.id.localeCompare(b.id, "zh-Hant"));
      if (available.length < perVideo) break;

      const selected = available.slice(0, perVideo);
      const packCount = manifest.images.filter((img) => categoryMatchesRule(rule, img.category)).length;
      const videoId = randomId(rule.key);
      const now = nowIso();
      const caption = buildCaption(rule, packCount, manifest.total);

      db.prepare(
        "INSERT INTO rxv_video_jobs (video_id, platform, status, category_key, category_label, pack_label, pack_count, site_total, image_count, caption, pain_lines_json, mp3_choice, created_at, updated_at) " +
        "VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        videoId, PLATFORM, rule.key, rule.label, rule.packLabel, packCount, manifest.total, selected.length,
        caption, JSON.stringify(rule.painLines), String(mp3Choice || "auto"), now, now
      );

      const insertImage = db.prepare(
        "INSERT INTO rxv_video_job_images (video_id, image_id, title, category, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
      );
      selected.forEach((img, index) => {
        insertImage.run(videoId, img.id, img.title, img.category, img.imageUrl, index + 1);
        addUsedImage(used, img);
      });
      created.push(videoId);
    }

    return {
      ok: true,
      created: created.length,
      videoIds: created,
      siteTotal: manifest.total,
      manifestSource: manifest.source.value,
      manifestUpdatedAt: manifest.updatedAt,
    };
  } finally {
    db.close();
  }
}

async function renderVideoJob(videoId, overrides = {}) {
  const db = requireDb();
  let job;
  let images;
  try {
    job = db.prepare("SELECT * FROM rxv_video_jobs WHERE video_id=? LIMIT 1").get(videoId);
    images = db.prepare("SELECT * FROM rxv_video_job_images WHERE video_id=? ORDER BY sort_order ASC").all(videoId);
    if (!job) throw new Error("找不到影片任務");
    db.prepare("UPDATE rxv_video_jobs SET status='rendering', error_message='', updated_at=? WHERE video_id=?").run(nowIso(), videoId);
  } finally {
    db.close();
  }

  try {
    const result = await buildVideo({
      videoId,
      images,
      categoryLabel: job.category_label,
      packLabel: job.pack_label,
      packCount: job.pack_count,
      siteTotal: job.site_total,
      painLines: JSON.parse(String(job.pain_lines_json || "[]")),
      mp3Choice: String(overrides.mp3Choice || job.mp3_choice || "auto"),
      secondsPerImage: Number(overrides.secondsPerImage || 2.25),
      ctaSeconds: 3,
      salesUrl: SALES_URL,
      smallPrice: SMALL_PRICE,
      allPrice: ALL_PRICE,
    });

    const db2 = requireDb();
    try {
      db2.prepare(
        "UPDATE rxv_video_jobs SET status='ready', video_path=?, duration_sec=?, mp3_path=?, mp3_choice=?, rendered_at=?, updated_at=?, error_message='' WHERE video_id=?"
      ).run(result.videoPath, result.durationSec, result.mp3Path || "", String(overrides.mp3Choice || job.mp3_choice || "auto"), nowIso(), nowIso(), videoId);
    } finally { db2.close(); }
    return { ok: true, videoId, ...result };
  } catch (error) {
    const db3 = requireDb();
    try {
      db3.prepare("UPDATE rxv_video_jobs SET status='failed', error_message=?, updated_at=? WHERE video_id=?")
        .run(String(error && error.message || error), nowIso(), videoId);
    } finally { db3.close(); }
    throw error;
  }
}

async function publishVideoJob(videoId, editedCaption = "", tiktokOptions = {}) {
  const db = requireDb();
  let job;
  try {
    job = db.prepare("SELECT * FROM rxv_video_jobs WHERE video_id=? LIMIT 1").get(videoId);
    if (!job) throw new Error("找不到影片任務");
    if (!job.video_path || !fs.existsSync(job.video_path)) throw new Error("尚未產生 MP4，請先按『產生 MP4』");
    db.prepare("UPDATE rxv_video_jobs SET status='publishing', caption=?, error_message='', updated_at=? WHERE video_id=?")
      .run(String(editedCaption || job.caption || ""), nowIso(), videoId);
  } finally { db.close(); }

  try {
    const caption = String(editedCaption || job.caption || "").trim();
    const result = await tiktokOfficial.publishPublisherJob({
      row: { video_path: job.video_path, duration_sec: Number(job.duration_sec || 0) },
      payload: { platforms: { tiktok: { caption, publishText: caption, body: caption, hashtags: "" } } },
      publishText: caption,
      source: "manual",
      postOptions: tiktokOptions,
    });

    const needsManualAction = Boolean(result && result.needsManualAction);
    const processing = Boolean(result && result.processing);
    const published = !needsManualAction && !processing;
    const providerMode = String(result && result.providerResponse && result.providerResponse.mode || "");
    const status = published ? "published" : needsManualAction ? "scheduled" : "publishing";

    const db2 = requireDb();
    try {
      db2.prepare(
        "UPDATE rxv_video_jobs SET status=?, caption=?, publish_mode=?, publish_id=?, post_url=?, published_at=?, updated_at=?, error_message='' WHERE video_id=?"
      ).run(
        status, caption, providerMode, String(result && result.remotePostId || ""), String(result && result.publishedUrl || ""),
        published ? nowIso() : null, nowIso(), videoId
      );
    } finally { db2.close(); }

    return {
      ok: true,
      videoId,
      published,
      needsManualAction,
      processing,
      publishMode: providerMode,
      publishId: String(result && result.remotePostId || ""),
      postUrl: String(result && result.publishedUrl || ""),
      message: String(result && result.message || ""),
      providerStatus: String(result && result.providerResponse && result.providerResponse.status && result.providerResponse.status.status || (published ? "PUBLISH_COMPLETE" : needsManualAction ? "SEND_TO_USER_INBOX" : processing ? "PROCESSING_UPLOAD" : "")),
      providerResponse: result && result.providerResponse || null,
    };
  } catch (error) {
    const db3 = requireDb();
    try {
      db3.prepare("UPDATE rxv_video_jobs SET status='ready', error_message=?, updated_at=? WHERE video_id=?")
        .run(String(error && error.message || error), nowIso(), videoId);
    } finally { db3.close(); }
    throw error;
  }
}

async function checkTikTokStatus(videoId) {
  const db = requireDb();
  let job;
  try { job = db.prepare("SELECT * FROM rxv_video_jobs WHERE video_id=? LIMIT 1").get(videoId); }
  finally { db.close(); }
  if (!job) throw new Error("找不到影片任務");
  if (!job.publish_id) throw new Error("這支影片還沒有 TikTok publish_id");

  const provider = await tiktokOfficial.fetchPublishStatus(job.publish_id);
  const providerStatus = String(provider && provider.status || "");
  if (providerStatus === "FAILED") throw new Error(String(provider && provider.fail_reason || "TikTok 發布失敗"));

  if (providerStatus === "PUBLISH_COMPLETE") {
    const db2 = requireDb();
    try {
      db2.prepare("UPDATE rxv_video_jobs SET status='published', published_at=?, updated_at=?, error_message='' WHERE video_id=?")
        .run(nowIso(), nowIso(), videoId);
    } finally { db2.close(); }
  }
  return { ok: true, videoId, providerStatus, provider };
}

function cancelJob(videoId) {
  const db = requireDb();
  try {
    const job = db.prepare("SELECT status FROM rxv_video_jobs WHERE video_id=? LIMIT 1").get(videoId);
    if (!job) throw new Error("找不到影片任務");
    if (["published", "scheduled", "publishing"].includes(String(job.status))) throw new Error("已送到 TikTok 的任務不能直接取消");
    db.prepare("UPDATE rxv_video_jobs SET status='cancelled', updated_at=? WHERE video_id=?").run(nowIso(), videoId);
    return { ok: true };
  } finally { db.close(); }
}

async function statusPayload() {
  const manifest = await loadManifest();
  const db = requireDb();
  try {
    const rows = db.prepare("SELECT status, COUNT(*) AS count FROM rxv_video_jobs WHERE platform=? GROUP BY status").all(PLATFORM);
    const jobs = {};
    for (const row of rows) jobs[String(row.status)] = Number(row.count || 0);
    const usedKeys = getUsedImageKeys(db);
    const used = manifest.images.filter((img) => isImageUsed(usedKeys, img)).length;
    const tk = tiktokOfficial.publicStatus();
    const pinRows = db.prepare("SELECT status, COUNT(*) AS count FROM rxv_pinterest_posts GROUP BY status").all();
    const pinterest = {};
    for (const row of pinRows) pinterest[String(row.status)] = Number(row.count || 0);
    return {
      ok: true,
      total: manifest.total,
      remaining: Math.max(0, manifest.total - used),
      categories: categoryOptions(manifest),
      jobs,
      published: Number(jobs.published || 0),
      draftReady: Number(jobs.draft || 0) + Number(jobs.ready || 0) + Number(jobs.failed || 0),
      pinterestPrepared: Number(pinterest.prepared || 0),
      pinterestPublished: Number(pinterest.posted || 0),
      manifestSource: manifest.source.value,
      manifestUpdatedAt: manifest.updatedAt,
      dbPath: DB_PATH,
      outputRoot: outputRoot(),
      ffmpeg: resolveFfmpeg() || "",
      mp3: listMp3Files(),
      tiktok: {
        configured: Boolean(tk.configured),
        authorized: Boolean(tk.authorized),
        postMode: String(tk.postMode || ""),
        audited: Boolean(tk.audited),
        scopesGranted: Array.isArray(tk.scopesGranted) ? tk.scopesGranted : [],
      },
    };
  } finally { db.close(); }
}


function boolOption(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function normalizeFacebookTarget(targetType, targetName) {
  const type = ["personal", "page", "group"].includes(String(targetType || "")) ? String(targetType) : "personal";
  const name = type === "personal" ? "" : String(targetName || "").trim();
  if (type === "group" && !name) throw new Error("請輸入 Facebook 社團名稱，才能分開記錄防重複。");
  return { targetType: type, targetName: name };
}

function facebookAlreadyPosted(db, img, targetType, targetName) {
  const fp = imageFingerprint(img);
  const url = String(img && (img.imageUrl || img.image_url) || "").trim();
  const id = String(img && (img.id || img.image_id) || "").trim();
  const row = db.prepare(
    "SELECT id FROM rxv_fb_image_posts WHERE status='posted' AND target_type=? AND target_name=? " +
    "AND (image_fingerprint=? OR image_url=? OR image_id=?) LIMIT 1"
  ).get(targetType, targetName, fp, url, id);
  return Boolean(row);
}

function buildFacebookShareText(img, options = {}) {
  const copyMode = String(options.copyMode || "strict") === "general" ? "general" : "strict";
  const allowLink = boolOption(options.allowLink, false);
  const rule = ruleForCategory(img.category);
  const label = rule && rule.label ? rule.label : String(img.category || "圖片");
  const freePrefix = img.planType === "free" ? "免費分享" : "圖片分享";
  if (copyMode === "strict") {
    const lines = [
      freePrefix + "｜" + label + "社群圖片",
      "",
      "適合 " + label + " 日常社群貼文使用，有需要可以先收藏。",
    ];
    if (allowLink) {
      lines.push("", "更多職業圖片素材：", SALES_URL);
    }
    return lines.join("\n");
  }
  return [
    freePrefix + "一張 " + label + " 社群圖片，適合日常發文與社群內容使用。",
    "",
    "更多房仲、美髮、美甲、美容 SPA、牙醫、寵物等職業圖片：",
    SALES_URL,
    "",
    rule && rule.hashtags ? rule.hashtags : "#圖片素材 #社群素材",
  ].join("\n");
}

function categoryRuleByKey(key) {
  return CATEGORY_RULES.find((rule) => rule.key === key) || null;
}

async function pickFacebookImage(options = {}) {
  const manifest = await loadManifest();
  const categoryKey = String(options.categoryKey || "auto");
  const freeOnly = boolOption(options.freeOnly, true);
  const unpostedOnly = boolOption(options.unpostedOnly, true);
  const copyMode = String(options.copyMode || "strict") === "general" ? "general" : "strict";
  const allowLink = boolOption(options.allowLink, false);
  const target = normalizeFacebookTarget(options.targetType, options.targetName);
  const rule = categoryRuleByKey(categoryKey);

  let pool = manifest.images.filter((img) => !freeOnly || img.planType === "free");
  if (rule) pool = pool.filter((img) => categoryMatchesRule(rule, img.category));
  let excluded = new Set();
  try {
    const parsed = JSON.parse(String(options.excludeFingerprints || "[]"));
    if (Array.isArray(parsed)) excluded = new Set(parsed.map(String).slice(0, 200));
  } catch {}
  if (excluded.size) pool = pool.filter((img) => !excluded.has(imageFingerprint(img)));
  pool = filterUniqueUnused(pool, emptyImageKeySet()).sort((a, b) => a.id.localeCompare(b.id, "zh-Hant"));

  const db = requireDb();
  try {
    if (unpostedOnly) {
      pool = pool.filter((img) => !facebookAlreadyPosted(db, img, target.targetType, target.targetName));
    }
    if (!pool.length) {
      return {
        ok: true,
        found: false,
        message: freeOnly ? "目前沒有符合條件、尚未在此位置發過的免費圖片。" : "目前沒有符合條件、尚未在此位置發過的圖片。",
        remainingForTarget: 0,
      };
    }
    const img = pool[0];
    return {
      ok: true,
      found: true,
      image: {
        id: img.id,
        title: img.title,
        category: img.category,
        categoryKey: ruleForCategory(img.category).key,
        imageUrl: img.imageUrl,
        planType: img.planType,
        isFree: img.planType === "free",
        fingerprint: imageFingerprint(img),
      },
      postText: buildFacebookShareText(img, { copyMode, allowLink }),
      remainingForTarget: pool.length,
      targetType: target.targetType,
      targetName: target.targetName,
    };
  } finally {
    db.close();
  }
}

function buildFacebookCopyFromBody(body = {}) {
  const raw = body.image || {};
  const img = {
    id: String(raw.id || raw.image_id || ""),
    title: String(raw.title || "圖片素材"),
    category: String(raw.category || "其他素材"),
    imageUrl: String(raw.imageUrl || raw.image_url || ""),
    planType: raw.planType === "free" || raw.isFree === true ? "free" : "bundle",
  };
  return {
    ok: true,
    postText: buildFacebookShareText(img, {
      copyMode: body.copyMode,
      allowLink: body.allowLink,
    }),
  };
}

function markFacebookImage(body = {}) {
  const raw = body.image || {};
  const imageUrl = String(raw.imageUrl || raw.image_url || "").trim();
  const imageId = String(raw.id || raw.image_id || "").trim();
  if (!imageUrl || !imageId) throw new Error("缺少圖片資料，請重新按「抓 1 張」。");
  const target = normalizeFacebookTarget(body.targetType, body.targetName);
  const status = String(body.status || "posted") === "skipped" ? "skipped" : "posted";
  const copyMode = String(body.copyMode || "strict") === "general" ? "general" : "strict";
  const category = String(raw.category || "其他素材");
  const rule = ruleForCategory(category);
  const img = { id: imageId, imageUrl, category, planType: raw.planType === "free" || raw.isFree === true ? "free" : "bundle" };
  const now = nowIso();
  const db = requireDb();
  try {
    db.prepare(
      "INSERT INTO rxv_fb_image_posts (" +
      "image_id,image_url,image_fingerprint,title,category_key,category_label,is_free,platform,target_type,target_name,copy_mode,allow_link,post_text,status,created_at,posted_at,updated_at" +
      ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    ).run(
      imageId,
      imageUrl,
      imageFingerprint(img),
      String(raw.title || ""),
      String(raw.categoryKey || rule.key || ""),
      String(category),
      img.planType === "free" ? 1 : 0,
      "facebook",
      target.targetType,
      target.targetName,
      copyMode,
      boolOption(body.allowLink, false) ? 1 : 0,
      String(body.postText || ""),
      status,
      now,
      status === "posted" ? now : null,
      now
    );
    return { ok: true, status };
  } finally {
    db.close();
  }
}

function listFacebookPosts(db, limit = 60) {
  const n = Math.max(1, Math.min(200, Number(limit || 60)));
  return db.prepare(
    "SELECT id,image_id,title,category_label,is_free,target_type,target_name,copy_mode,status,created_at,posted_at " +
    "FROM rxv_fb_image_posts ORDER BY id DESC LIMIT ?"
  ).all(n);
}


const rxvPinterestQueue = [];
const rxvPinterestJobs = new Map();

function pinterestAlreadyPosted(db, img) {
  const fp = imageFingerprint(img);
  const url = String(img && (img.imageUrl || img.image_url) || "").trim();
  const id = String(img && (img.id || img.image_id) || "").trim();
  const row = db.prepare(
    "SELECT id FROM rxv_pinterest_posts WHERE status='posted' " +
    "AND (image_fingerprint=? OR image_url=? OR image_id=?) LIMIT 1"
  ).get(fp, url, id);
  return Boolean(row);
}

function pinterestBoardForRule(rule) {
  const key = String(rule && rule.key || "");
  if (key === "buddha" || key === "pet") return "療癒圖片";
  if (key === "real-estate") return "房仲素材";
  if (key === "hair") return "美髮素材";
  if (key === "nail") return "美甲素材";
  if (key === "beauty-spa") return "美容 SPA 素材";
  if (key === "dental") return "牙醫素材";
  return "療癒圖片";
}

function buildPinterestCopy(img = {}) {
  const category = String(img.category || "圖片素材").trim();
  const title = String(img.title || category || "圖片素材").trim();
  const rule = ruleForCategory(category);
  const label = String(rule && rule.label || category || "圖片素材");
  const isFree = String(img.planType || "") === "free" || img.isFree === true;
  let pinTitle = "";
  let description = "";

  if (rule && rule.key === "buddha") {
    pinTitle = (title + "｜唯美療癒佛像圖片").slice(0, 100);
    description = [
      "唯美療癒佛像圖片分享。",
      "",
      "溫暖柔和的光影與莊嚴氛圍，適合收藏、靜心欣賞與手機桌布。",
      "",
      "想看更多療癒圖片與免費圖片素材，可到 RxV 圖片專區查看。",
      "",
      "#佛像 #佛教 #療癒圖片 #靜心 #免費圖片"
    ].join("\n");
  } else if (rule && ["real-estate","hair","nail","beauty-spa","dental","pet"].includes(rule.key)) {
    pinTitle = (label + "圖片素材｜社群發文素材").slice(0, 100);
    description = [
      label + "每天發文還在花時間找圖片嗎？",
      "",
      "RxV 已整理常用情境圖片，發文時直接挑圖使用，省下重複找素材的時間。",
      "",
      isFree ? "這張可作為免費圖片分享與導流素材。" : "另有職業圖片素材小包與完整素材庫可查看。",
      "",
      "更多圖片：",
      SALES_URL,
      "",
      String(rule.hashtags || "#圖片素材 #社群素材")
    ].join("\n");
  } else {
    pinTitle = (title + "｜RxV 圖片分享").slice(0, 100);
    description = [
      "圖片素材分享。",
      "",
      "適合收藏、社群貼文、手機桌布與設計靈感。",
      "",
      "更多不同主題圖片可到 RxV 圖片專區查看。",
      "",
      "#圖片分享 #圖片素材 #療癒圖片 #RxV"
    ].join("\n");
  }

  return {
    title: pinTitle.slice(0, 100),
    description: description.slice(0, 800),
    destinationUrl: SALES_URL,
    boardName: pinterestBoardForRule(rule),
  };
}

async function pickPinterestImage(options = {}) {
  const manifest = await loadManifest();
  const categoryKey = String(options.categoryKey || "auto");
  const rule = categoryRuleByKey(categoryKey);
  let pool = manifest.images.slice();
  if (rule) pool = pool.filter((img) => categoryMatchesRule(rule, img.category));
  pool = filterUniqueUnused(pool, emptyImageKeySet()).sort((a, b) => a.id.localeCompare(b.id, "zh-Hant"));

  const db = requireDb();
  try {
    pool = pool.filter((img) => !pinterestAlreadyPosted(db, img));
    if (!pool.length) {
      return { ok: true, found: false, message: "目前沒有符合條件、尚未發布到 Pinterest 的圖片。", remaining: 0 };
    }
    const img = pool[0];
    return {
      ok: true,
      found: true,
      image: {
        id: img.id,
        title: img.title,
        category: img.category,
        categoryKey: ruleForCategory(img.category).key,
        imageUrl: img.imageUrl,
        planType: img.planType,
        isFree: img.planType === "free",
        fingerprint: imageFingerprint(img),
      },
      copy: buildPinterestCopy(img),
      remaining: pool.length,
    };
  } finally {
    db.close();
  }
}

async function stagePinterestImage(imageUrl) {
  const url = String(imageUrl || "").trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("Pinterest 圖片網址無效");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Pinterest 圖片下載失敗：HTTP " + response.status);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error("Pinterest 圖片檔案是空的");
  if (buffer.length > 30 * 1024 * 1024) throw new Error("Pinterest 圖片超過 30MB");
  if (!sharpForPinterest) throw new Error("PINTEREST_IMAGE_RESIZE_UNAVAILABLE");

  const dir = path.join(ROOT, "data", "pinterest-staging");
  fs.mkdirSync(dir, { recursive: true });

  const metadata = await sharpForPinterest(buffer, { failOn: "none" }).metadata();
  let width = Number(metadata.width || 0);
  let height = Number(metadata.height || 0);

  // EXIF orientation 5-8 swaps display width/height after auto-rotation.
  const orientation = Number(metadata.orientation || 1);
  if (orientation >= 5 && orientation <= 8) {
    const t = width; width = height; height = t;
  }

  if (!width || !height) throw new Error("PINTEREST_IMAGE_DIMENSIONS_UNKNOWN");

  // Pinterest rejects images smaller than 200x300.
  // Use a safer 400x600 floor while preserving aspect ratio.
  const scale = Math.max(1, 400 / width, 600 / height);
  const safeWidth = Math.max(400, Math.round(width * scale));
  const safeHeight = Math.max(600, Math.round(height * scale));

  const filePath = path.join(dir, randomId("pin-safe") + ".jpg");

  await sharpForPinterest(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: safeWidth,
      height: safeHeight,
      fit: "fill",
      withoutEnlargement: false,
    })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toFile(filePath);

  const outStat = fs.statSync(filePath);
  if (!outStat.size) throw new Error("PINTEREST_SAFE_IMAGE_EMPTY");
  if (outStat.size > 20 * 1024 * 1024) throw new Error("PINTEREST_SAFE_IMAGE_OVER_20MB");

  return filePath;
}

function publicPinterestJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    queueSource: "pinterest-3018",
    platform: "pinterest",
    targetUrl: "https://www.pinterest.com/pin-creation-tool/",
    imagePath: job.imagePath,
    imageId: job.imageId,
    imageUrl: job.imageUrl,
    publishTitle: job.publishTitle,
    publishDescription: job.publishDescription,
    publishText: job.publishDescription,
    destinationUrl: job.destinationUrl,
    boardName: job.boardName,
    aiDisclosureRequested: Boolean(job.aiDisclosureRequested),
    recordId: Number(job.recordId || 0),
    finalPublishMode: "manual",
    status: job.status,
    error: job.error || "",
    debug: job.debug || null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

async function queuePinterestJob(body = {}) {
  const raw = body.image || {};
  const imageId = String(raw.id || raw.image_id || "").trim();
  const imageUrl = String(raw.imageUrl || raw.image_url || "").trim();
  if (!imageId || !imageUrl) throw new Error("請先按「自動準備 1 張」。");

  const img = {
    id: imageId,
    title: String(raw.title || ""),
    category: String(raw.category || "其他素材"),
    imageUrl,
    planType: raw.planType === "free" || raw.isFree === true ? "free" : "bundle",
  };
  const fallback = buildPinterestCopy(img);
  const publishTitle = String(body.pinTitle || fallback.title).trim().slice(0, 100);
  const publishDescription = String(body.pinDescription || fallback.description).trim().slice(0, 800);
  const destinationUrl = String(body.destinationUrl || fallback.destinationUrl || SALES_URL).trim();
  const boardName = String(body.boardName || fallback.boardName || "療癒圖片").trim();
  const aiDisclosureRequested = body.aiDisclosureRequested === true;
  const imagePath = await stagePinterestImage(imageUrl);
  const now = nowIso();

  const db = requireDb();
  let recordId = 0;
  try {
    const result = db.prepare(
      "INSERT INTO rxv_pinterest_posts (" +
      "image_id,image_url,image_fingerprint,title,category_key,category_label,pin_title,pin_description,destination_url,board_name,status,created_at,updated_at" +
      ") VALUES (?,?,?,?,?,?,?,?,?,?,'prepared',?,?)"
    ).run(
      imageId,
      imageUrl,
      imageFingerprint(img),
      String(img.title || ""),
      String(raw.categoryKey || ruleForCategory(img.category).key || ""),
      String(img.category || ""),
      publishTitle,
      publishDescription,
      destinationUrl,
      boardName,
      now,
      now
    );
    recordId = Number(result.lastInsertRowid || 0);
  } finally {
    db.close();
  }

  while (rxvPinterestQueue.length) {
    const oldId = rxvPinterestQueue.shift();
    const oldJob = rxvPinterestJobs.get(oldId);
    if (oldJob && oldJob.status === "pending") {
      oldJob.status = "failed";
      oldJob.error = "REPLACED_BY_NEW_PINTEREST_JOB";
      oldJob.updatedAt = Date.now();
    }
  }

  const job = {
    id: randomId("pinterest"),
    imageId,
    imageUrl,
    imagePath,
    publishTitle,
    publishDescription,
    destinationUrl,
    boardName,
    aiDisclosureRequested,
    recordId,
    status: "pending",
    error: "",
    debug: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  rxvPinterestJobs.set(job.id, job);
  rxvPinterestQueue.push(job.id);
  return { ok: true, queued: true, recordId, job: publicPinterestJob(job), queueDepth: rxvPinterestQueue.length };
}

function servePinterestJobFile(res, id) {
  const jobId = String(id || "").trim();
  const job = rxvPinterestJobs.get(jobId);
  if (!job) return json(res, 404, { ok: false, error: "PINTEREST_JOB_NOT_FOUND" });

  const filePath = String(job.imagePath || "");
  if (!filePath || !fs.existsSync(filePath)) {
    return json(res, 404, { ok: false, error: "PINTEREST_IMAGE_FILE_NOT_FOUND" });
  }

  const ext = path.extname(filePath).toLowerCase();
  const type =
    ext === ".png" ? "image/png" :
    ext === ".webp" ? "image/webp" :
    ext === ".gif" ? "image/gif" :
    "image/jpeg";

  res.statusCode = 200;
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Length", String(fs.statSync(filePath).size));
  res.setHeader("X-RXV-Filename", path.basename(filePath));
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(filePath).pipe(res);
}

function getPinterestJobStatus(id) {
  const jobId = String(id || "").trim();
  if (!jobId) return { ok: false, error: "PINTEREST_JOB_ID_REQUIRED" };
  const job = rxvPinterestJobs.get(jobId);
  if (!job) return { ok: false, error: "PINTEREST_JOB_NOT_FOUND" };
  return { ok: true, job: publicPinterestJob(job) };
}

function nextPinterestJob() {
  while (rxvPinterestQueue.length) {
    const id = rxvPinterestQueue.shift();
    const job = rxvPinterestJobs.get(id);
    if (!job || job.status !== "pending") continue;
    job.status = "processing";
    job.updatedAt = Date.now();
    return { ok: true, job: publicPinterestJob(job) };
  }
  return { ok: true, job: null };
}

function finishPinterestJob(body = {}, failed = false) {
  const id = String(body.id || "").trim();
  const job = rxvPinterestJobs.get(id);
  if (!job) return { ok: false, error: "PINTEREST_JOB_NOT_FOUND" };
  job.status = failed ? "failed" : (String(body.status || "") === "published" ? "published" : "prepared");
  job.error = String(body.error || "");
  job.debug = body.debug || null;
  job.updatedAt = Date.now();
  return { ok: true, job: publicPinterestJob(job) };
}

function markPinterestPosted(body = {}) {
  const recordId = Number(body.recordId || 0);
  const now = nowIso();
  const db = requireDb();
  try {
    let result;
    if (recordId) {
      result = db.prepare("UPDATE rxv_pinterest_posts SET status='posted', posted_at=?, updated_at=? WHERE id=?").run(now, now, recordId);
    } else {
      const raw = body.image || {};
      const fp = imageFingerprint({ id: raw.id || raw.image_id, imageUrl: raw.imageUrl || raw.image_url });
      result = db.prepare(
        "UPDATE rxv_pinterest_posts SET status='posted', posted_at=?, updated_at=? " +
        "WHERE id=(SELECT id FROM rxv_pinterest_posts WHERE image_fingerprint=? ORDER BY id DESC LIMIT 1)"
      ).run(now, now, fp);
    }
    return { ok: true, updated: Number(result.changes || 0) };
  } finally {
    db.close();
  }
}

function listPinterestPosts(db, limit = 60) {
  const n = Math.max(1, Math.min(200, Number(limit || 60)));
  return db.prepare(
    "SELECT id,image_id,title,category_label,pin_title,board_name,status,created_at,posted_at " +
    "FROM rxv_pinterest_posts ORDER BY id DESC LIMIT ?"
  ).all(n);
}

function dashboardHtml() {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RXV 圖片自動推廣器 v3｜Pinterest</title>
<style>
body{font-family:system-ui,-apple-system,"Segoe UI","Microsoft JhengHei",sans-serif;margin:0;background:#f5f7fb;color:#172033}.wrap{max-width:1240px;margin:auto;padding:22px}.hero,.card,.stat,.panel{background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 7px 22px #0000000a}.hero{padding:22px}.muted{color:#64748b}.small{font-size:12px;color:#64748b}.controls{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin-top:16px}.field{display:flex;flex-direction:column;gap:5px}.field label{font-size:12px;font-weight:800;color:#475569}.field select{min-width:150px;padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff}.btn{border:0;border-radius:10px;padding:11px 15px;font-weight:850;cursor:pointer;background:#2563eb;color:#fff}.btn.gray{background:#475569}.btn.green{background:#059669}.btn.red{background:#dc2626}.btn.light{background:#e2e8f0;color:#1e293b}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}.stat{padding:14px}.stat b{display:block;font-size:27px;margin-top:4px}.statusline{margin-top:12px;padding:10px 12px;background:#f8fafc;border-radius:10px}.jobs{display:grid;grid-template-columns:1fr;gap:14px}.card{padding:15px}.row{display:flex;gap:14px}.thumbs{display:flex;gap:5px;flex-wrap:wrap;width:250px}.thumbs img{width:112px;height:150px;object-fit:cover;border-radius:10px;background:#eee}.jobmain{flex:1;min-width:0}.tag{display:inline-block;background:#eef2ff;color:#3730a3;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:800}.status{display:inline-block;margin-left:6px;background:#ecfdf5;color:#047857;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:800}textarea{width:100%;min-height:210px;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit;resize:vertical}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.cats{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.cat{background:#f1f5f9;border-radius:999px;padding:5px 9px;font-size:12px}.error{color:#b91c1c;font-size:13px;margin-top:8px}.video{width:220px;max-height:390px;border-radius:12px;background:#111}@media(max-width:800px){.stats{grid-template-columns:repeat(2,1fr)}.row{flex-direction:column}.thumbs{width:100%}.thumbs img{width:92px;height:120px}}
</style>
</head>
<body><div class="wrap">
<div class="hero">
<h1 style="margin:0">RXV 圖片自動推廣器 v3</h1>
<p class="muted">多張圖片 → 痛點字幕 → QR Code → 可選 MP3 → 本機 MP4 → TikTok 官方 API。MP4 只放本機，不送 Vercel。</p>
<div class="controls">
<div class="field"><label>要推廣的分類</label><select id="category"><option value="auto">自動選分類</option></select></div>
<div class="field"><label>每支影片圖片數</label><select id="imageCount"><option value="4" selected>4 張</option><option value="5">5 張</option><option value="6">6 張</option></select></div>
<div class="field"><label>背景 MP3</label><select id="mp3"><option value="auto">自動選第一首</option><option value="none">不加音樂</option></select></div>
<button class="btn" onclick="createJobs(1)">自動建立 1 支</button>
<button class="btn light" onclick="createJobs(3)">建立 3 支待發</button>
<button class="btn gray" onclick="refreshAll()">同步最新數量</button>
</div>
<div id="msg" class="statusline small">載入中…</div>
<div id="sys" class="small" style="margin-top:8px"></div>
<div id="cats" class="cats"></div>
</div>
<section id="rxvPinterestPanel" class="card" style="margin-top:16px;border:2px solid #fecaca;background:#fff7f7">
<h2 style="margin:0 0 6px;color:#b91c1c">📌 Pinterest 一鍵填入</h2>
<div class="small" style="margin-bottom:12px">選 1 張圖片後，自動準備標題、說明、導流網址與圖版；按一次由 Edge 擴充開啟或重用唯一一個 Pinterest 分頁並自動填入。低於 Pinterest 安全尺寸的圖片會先建立本機放大副本，不修改網站原圖；最後「發布／儲存」由你自己按。</div>
<div class="controls">
  <div class="field"><label>分類</label><select id="rxvPinCategory"><option value="auto">自動選分類</option></select></div>
  <button class="btn red" onclick="rxvPinPick()">自動準備 1 張</button>
  <button class="btn light" onclick="rxvPinRegenerate()">重新產生文案</button>
</div>
<div id="rxvPinBody" style="display:none;margin-top:14px">
  <div class="row">
    <div style="width:220px;max-width:100%"><img id="rxvPinImage" alt="Pinterest 圖片" style="width:100%;max-height:330px;object-fit:contain;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0"></div>
    <div class="jobmain">
      <div class="field"><label>標題（最多 100 字）</label><input id="rxvPinTitle" maxlength="100" style="padding:10px;border:1px solid #cbd5e1;border-radius:10px;font:inherit"></div>
      <div class="field" style="margin-top:8px"><label>說明（最多 800 字）</label><textarea id="rxvPinDescription" maxlength="800" style="min-height:150px"></textarea></div>
      <div class="controls" style="margin-top:8px">
        <div class="field" style="flex:1;min-width:260px"><label>導流網址</label><input id="rxvPinLink" value="https://pomodoro-app-eight-rouge.vercel.app/images" style="padding:10px;border:1px solid #cbd5e1;border-radius:10px;font:inherit"></div>
        <div class="field" style="min-width:220px"><label>Pinterest 圖版</label><input id="rxvPinBoard" placeholder="例如：療癒圖片" style="padding:10px;border:1px solid #cbd5e1;border-radius:10px;font:inherit"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:14px">
        <input id="rxvPinAi" type="checkbox" checked>
        此圖片為 AI 生成／AI 修飾（自動開啟 Pinterest AI 標示）
      </label>
      <div class="actions">
        <button id="rxvPinOpenButton" class="btn red" onclick="rxvPinOpenAndQueue(this)">開啟 Pinterest 並自動填入</button>
        <button class="btn light" onclick="rxvPinCopyAll()">複製全部內容</button>
        <button class="btn green" onclick="rxvPinMarkPosted()">我已發布，記錄完成</button>
      </div>
      <div id="rxvPinMsg" class="statusline small">尚未選圖片。</div>
    </div>
  </div>
</div>
</section>
<div class="stats">
<div class="stat">網站公開圖片<b id="total">-</b></div>
<div class="stat">尚未使用<b id="remaining">-</b></div>
<div class="stat">待處理影片<b id="pending">-</b></div>
<div class="stat">TikTok 已發布<b id="published">-</b></div>
<div class="stat">Pinterest 已準備<b id="rxvPinPrepared">-</b></div>
<div class="stat">Pinterest 已發布<b id="rxvPinPublished">-</b></div>
</div>
<h2>影片任務</h2><div id="jobs" class="jobs"></div>
</div>
<script>
async function api(url,opts){const r=await fetch(url,opts);const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||d.error||('HTTP '+r.status));return d}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function setMsg(s){document.getElementById('msg').textContent=s||''}
function actionPost(url,body){return api(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})})}
let rxvPinCurrent=null;
let rxvPinRecordId=0;
let rxvPinJobId='';
function rxvPinMessage(s){const el=document.getElementById('rxvPinMsg');if(el)el.textContent=s||''}
async function rxvPinPick(){
  try{
    rxvPinMessage('⏳ 正在挑選尚未發布到 Pinterest 的圖片…');
    const key=document.getElementById('rxvPinCategory').value||'auto';
    const d=await api('/api/pinterest/pick?categoryKey='+encodeURIComponent(key));
    if(!d.found){rxvPinCurrent=null;document.getElementById('rxvPinBody').style.display='none';rxvPinMessage(d.message||'沒有可用圖片');return}
    rxvPinCurrent=d.image;rxvPinRecordId=0;
    document.getElementById('rxvPinBody').style.display='block';
    document.getElementById('rxvPinImage').src=d.image.imageUrl;
    document.getElementById('rxvPinTitle').value=d.copy.title||'';
    document.getElementById('rxvPinDescription').value=d.copy.description||'';
    document.getElementById('rxvPinLink').value=d.copy.destinationUrl||'https://pomodoro-app-eight-rouge.vercel.app/images';
    const saved=localStorage.getItem('rxvPinterestBoard');
    document.getElementById('rxvPinBoard').value=saved||d.copy.boardName||'療癒圖片';
    rxvPinMessage('✅ 已準備：'+(d.image.title||d.image.category)+'｜此分類尚有 '+d.remaining+' 張可用');
  }catch(e){rxvPinMessage('❌ 準備失敗：'+e.message)}
}
async function rxvPinRegenerate(){
  try{
    if(!rxvPinCurrent){rxvPinMessage('請先按「自動準備 1 張」。');return}
    const d=await actionPost('/api/pinterest/copy',{image:rxvPinCurrent});
    document.getElementById('rxvPinTitle').value=d.copy.title||'';
    document.getElementById('rxvPinDescription').value=d.copy.description||'';
    if(!document.getElementById('rxvPinBoard').value)document.getElementById('rxvPinBoard').value=d.copy.boardName||'療癒圖片';
    rxvPinMessage('✅ 文案已重新產生');
  }catch(e){rxvPinMessage('❌ 重新產生失敗：'+e.message)}
}
window.addEventListener('message',function(event){
  if(event.source!==window)return;
  if(!event.data||event.data.type!=='RXV_PIN_WAKE_RESULT')return;
  const r=event.data.result||{};
  if(r&&r.ok===false){
    const err=(r.jobResult&&r.jobResult.error)||r.error||'擴充處理失敗';
    rxvPinMessage('❌ Edge 擴充回報：'+err);
  }
});

async function rxvPinWatchStatus(jobId){
  const started=Date.now();
  while(Date.now()-started<45000){
    try{
      const d=await api('/api/pinterest/job?id='+encodeURIComponent(jobId));
      const job=d.job||{};
      if(job.status==='failed'){
        rxvPinMessage('❌ Pinterest 自動填入失敗：'+(job.error||'未知錯誤'));
        return;
      }
      if(job.status==='prepared'){
        rxvPinMessage('✅ 圖片、標題、說明與連結已自動填入 Pinterest。請檢查圖版後手動按「發布／儲存」。');
        return;
      }
      if(job.status==='processing'){
        rxvPinMessage('⏳ Edge 擴充已接手，正在上傳圖片並填入 Pinterest…');
      }
    }catch(e){}
    await new Promise(function(resolve){setTimeout(resolve,1000)});
  }
  rxvPinMessage('⚠️ Pinterest 已開啟，但 45 秒內沒有完成。請查看 Pinterest 或 Edge 擴充錯誤。');
}

async function rxvPinOpenAndQueue(button){
  if(!rxvPinCurrent){
    rxvPinMessage('請先按「自動準備 1 張」。');
    return;
  }

  const board=document.getElementById('rxvPinBoard').value.trim();
  if(!board){
    rxvPinMessage('請先填 Pinterest 圖版名稱。');
    return;
  }

  const oldText=button?button.textContent:'';
  if(button){
    button.disabled=true;
    button.textContent='處理中…';
  }

  try{
    localStorage.setItem('rxvPinterestBoard',board);
    rxvPinMessage('⏳ 正在送出 Pinterest 工作；Edge 擴充會開啟或重用唯一一個 Pinterest 分頁…');

    const d=await actionPost('/api/pinterest/queue',{
      image:rxvPinCurrent,
      pinTitle:document.getElementById('rxvPinTitle').value,
      pinDescription:document.getElementById('rxvPinDescription').value,
      destinationUrl:document.getElementById('rxvPinLink').value,
      boardName:board,
      aiDisclosureRequested:document.getElementById('rxvPinAi') ? document.getElementById('rxvPinAi').checked : false
    });

    rxvPinRecordId=Number(d.recordId||0);

    window.postMessage({type:'RXV_PIN_WAKE',source:'3018'}, location.origin);

    rxvPinMessage('✅ 工作已送出；Edge 擴充正在開啟或重用 Pinterest 分頁並自動填入。最後「發布／儲存」請你自己按。');
    setTimeout(refreshAll,1500);
  }catch(e){
    rxvPinMessage('❌ Pinterest 自動填入失敗：'+e.message);
  }finally{
    if(button){
      button.disabled=false;
      button.textContent=oldText||'開啟 Pinterest 並自動填入';
    }
  }
}

// Backward-compatible alias for any cached onclick.
async function rxvPinQueue(){
  return rxvPinOpenAndQueue(document.getElementById('rxvPinOpenButton'));
}
async function rxvPinCopyAll(){
  if(!rxvPinCurrent){rxvPinMessage('請先準備圖片。');return}
  const txt=[
    '標題：'+document.getElementById('rxvPinTitle').value,
    '',
    '說明：',
    document.getElementById('rxvPinDescription').value,
    '',
    '連結：'+document.getElementById('rxvPinLink').value,
    '圖版：'+document.getElementById('rxvPinBoard').value
  ].join('\\n');
  try{await navigator.clipboard.writeText(txt);rxvPinMessage('✅ Pinterest 全部內容已複製')}catch(e){rxvPinMessage('❌ 無法複製：'+e.message)}
}
async function rxvPinMarkPosted(){
  try{
    if(!rxvPinCurrent){rxvPinMessage('請先準備圖片。');return}
    await actionPost('/api/pinterest/mark',{recordId:rxvPinRecordId,image:rxvPinCurrent});
    rxvPinMessage('✅ 已記錄 Pinterest 已發布；下次不會再優先抓這張。');
    await refreshAll();
  }catch(e){rxvPinMessage('❌ 記錄失敗：'+e.message)}
}

function fillStatus(s){
  document.getElementById('total').textContent=s.total;
  document.getElementById('remaining').textContent=s.remaining;
  document.getElementById('pending').textContent=s.draftReady||0;
  document.getElementById('published').textContent=s.published||0;
  const pinPrepared=document.getElementById('rxvPinPrepared');if(pinPrepared)pinPrepared.textContent=s.pinterestPrepared||0;
  const pinPublished=document.getElementById('rxvPinPublished');if(pinPublished)pinPublished.textContent=s.pinterestPublished||0;

  const catSel=document.getElementById('category');
  const current=catSel.value;
  const catOptions=(s.categories||[]).map(function(x){
    return '<option value="'+rxvFbEsc(x.key)+'">'+rxvFbEsc(x.label)+'（'+x.count+' 張）</option>';
  }).join('');
  catSel.innerHTML='<option value="auto">自動選分類</option>'+catOptions;
  if(Array.from(catSel.options).some(function(o){return o.value===current}))catSel.value=current;
  const pinCat=document.getElementById('rxvPinCategory');
  if(pinCat){
    const pinCurrent=pinCat.value;
    pinCat.innerHTML='<option value="auto">自動選分類</option>'+catOptions;
    if(Array.from(pinCat.options).some(function(o){return o.value===pinCurrent}))pinCat.value=pinCurrent;
  }

  const mp=document.getElementById('mp3');
  const mpCur=mp.value;
  const mpOptions=(s.mp3||[]).map(function(x){
    return '<option value="'+rxvFbEsc(x.id)+'">'+rxvFbEsc(x.name)+'</option>';
  }).join('');
  mp.innerHTML='<option value="auto">自動選第一首</option><option value="none">不加音樂</option>'+mpOptions;
  if(Array.from(mp.options).some(function(o){return o.value===mpCur}))mp.value=mpCur;

  document.getElementById('cats').innerHTML=(s.categories||[]).map(function(x){
    return '<span class="cat">'+rxvFbEsc(x.label)+' '+x.count+' 張</span>';
  }).join('');

  const tk=s.tiktok||{};
  const mode=tk.postMode==='direct'?'Direct Post + SELF_ONLY':(tk.postMode||'-');
  document.getElementById('sys').textContent='TikTok：'+(tk.authorized?'已授權':'未授權')+'｜模式：'+mode+'｜FFmpeg：'+(s.ffmpeg?'已找到':'未找到')+'｜MP4：'+(s.outputRoot||'-');
}
async function refreshAll(){try{setMsg('同步網站最新數量中…');const s=await api('/api/status');fillStatus(s);const j=await api('/api/jobs?limit=30');renderJobs(j.items||[]);setMsg('已同步｜網站公開圖片 '+s.total+' 張｜來源：'+s.manifestSource)}catch(e){setMsg('錯誤：'+e.message)}}
async function createJobs(n){try{setMsg('正在挑選未使用圖片並建立影片任務…');const d=await actionPost('/api/jobs/generate',{count:n,categoryKey:document.getElementById('category').value,imagesPerVideo:Number(document.getElementById('imageCount').value),mp3Choice:document.getElementById('mp3').value});setMsg('已建立 '+d.created+' 支待發影片');await refreshAll()}catch(e){setMsg('建立失敗：'+e.message)}}
function renderJobs(items){const box=document.getElementById('jobs');if(!items.length){box.innerHTML='<div class="muted">目前沒有影片任務。按「自動建立 1 支」。</div>';return}box.innerHTML=items.map(j=>{const imgs=(j.images||[]).map(i=>'<img src="'+rxvFbEsc(i.image_url)+'" title="'+rxvFbEsc(i.title)+'">').join('');const vid=j.video_path&&['ready','publishing','scheduled','published'].includes(j.status)?'<video class="video" controls preload="metadata" src="/api/video?videoId='+encodeURIComponent(j.video_id)+'"></video>':'';return '<div class="card"><div class="row"><div><div class="thumbs">'+imgs+'</div>'+vid+'</div><div class="jobmain"><span class="tag">'+rxvFbEsc(j.category_label)+'</span><span class="status">'+rxvFbEsc(j.status)+'</span><h3>'+rxvFbEsc(j.pack_label)+'｜'+j.pack_count+' 張 NT$99｜全部 '+j.site_total+' 張 NT$199</h3><textarea id="cap_'+rxvFbEsc(j.video_id)+'">'+rxvFbEsc(j.caption||'')+'</textarea><div class="small">圖片 '+j.image_count+' 張｜MP3：'+rxvFbEsc(j.mp3_path||j.mp3_choice||'auto')+(j.video_path?'｜本機：'+rxvFbEsc(j.video_path):'')+'</div>'+((j.error_message&&!/Direct Post 尚未通過 Audit[，,]工具已改用 Upload Draft/.test(j.error_message))?'<div class="error">'+rxvFbEsc(j.error_message)+'</div>':'')+'<div class="actions"><button class="btn green" data-a="render" data-id="'+encodeURIComponent(j.video_id)+'">產生 MP4</button><button class="btn" data-a="publish" data-id="'+encodeURIComponent(j.video_id)+'">確認並發布 TikTok</button>'+(j.publish_id?'<button class="btn gray" data-a="check" data-id="'+encodeURIComponent(j.video_id)+'">查 TikTok 狀態</button>':'')+'<button class="btn light" data-a="copy" data-id="'+encodeURIComponent(j.video_id)+'">複製文案</button><button class="btn red" data-a="cancel" data-id="'+encodeURIComponent(j.video_id)+'">取消任務</button></div></div></div></div>'}).join('');box.querySelectorAll('[data-a]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn.dataset.a,decodeURIComponent(btn.dataset.id||''))))}
async function handleAction(a,id){try{if(a==='copy'){const el=document.getElementById('cap_'+id);await navigator.clipboard.writeText(el.value);setMsg('文案已複製');return}if(a==='render'){setMsg('正在本機產生 MP4，約需數十秒…');await actionPost('/api/jobs/render',{videoId:id,mp3Choice:document.getElementById('mp3').value});setMsg('MP4 已完成');await refreshAll();return}if(a==='publish'){const el=document.getElementById('cap_'+id);if(!confirm('確認將這支本機 MP4 送到 TikTok 官方 API？'))return;setMsg('正在送到 TikTok，請勿關閉頁面…');const d=await actionPost('/api/jobs/publish',{videoId:id,caption:el?el.value:''});setMsg(d.published?'TikTok 已發布完成':(d.needsManualAction?'影片已傳到 TikTok 草稿／收件匣，請在 App 完成最後發布':'TikTok 正在處理'));await refreshAll();return}if(a==='check'){const d=await actionPost('/api/jobs/check',{videoId:id});setMsg('TikTok 狀態：'+d.providerStatus);await refreshAll();return}if(a==='cancel'){if(!confirm('取消這支影片任務？選到的圖片之後可再使用。'))return;await actionPost('/api/jobs/cancel',{videoId:id});await refreshAll();return}}catch(e){setMsg('錯誤：'+e.message)}}
refreshAll();
</script>
<style>
.rxvTikTokReviewDemo{margin-top:10px;padding:12px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc}.rxvTikTokReviewDemo label{display:block;margin:7px 0;font-size:13px}.rxvTikTokReviewDemo select{width:100%;padding:8px;margin-top:4px}.rxvTikTokReviewDemo .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px}.rxvTikTokReviewDemo .notice{font-size:12px;color:#475569;margin:8px 0}.rxvTikTokReviewDemo .result{white-space:pre-wrap;font-size:12px;margin-top:8px}.rxvTikTokReviewDemo .error{color:#b91c1c}
</style>
<script id="rxvTikTokReviewDemo">
(function(){
  var creator=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  async function api(url,init){var r=await fetch(url,init);var d=await r.json().catch(function(){return {}});if(!r.ok||!d.ok)throw new Error(d.message||d.error||('HTTP '+r.status));return d}
  function choice(label,key,disabled){return '<label><input type="checkbox" data-rxv="'+key+'" '+(disabled?'disabled ':'')+'> '+label+(disabled?'（TikTok 目前停用）':'')+'</label>'}
  function decorate(){document.querySelectorAll('#jobs .card').forEach(function(card){
    if(card.querySelector('.rxvTikTokReviewDemo'))return;
    var old=card.querySelector('[data-a="publish"]');if(!old)return;
    old.style.display='none';
    var video=card.querySelector('video');
    var id=decodeURIComponent(old.dataset.id||'');
    var c=creator||{};
    var options=Array.isArray(c.privacy_level_options)?c.privacy_level_options.map(String):[];
    var selfOnly=!!c.direct_self_only_test||(options.length===1&&options[0]==='SELF_ONLY');
    if(selfOnly){options=options.filter(function(x){return x==='SELF_ONLY'});if(!options.length)options=['SELF_ONLY']}
    var privacy='<option value="">請主動選擇誰可以觀看</option>'+options.map(function(x){return '<option value="'+rxvFbEsc(x)+'">'+rxvFbEsc(x)+'</option>'}).join('');
    var panel=document.createElement('section');
    panel.className='rxvTikTokReviewDemo';
    panel.innerHTML='<b>TikTok Production Review 發布確認</b>'+
      '<div class="notice">已授權帳號：'+rxvFbEsc(c.creator_username?'@'+c.creator_username:'查詢中')+'｜發布前請確認 MP4 預覽、文案與下列選項。</div>'+
      (selfOnly?'<div class="notice"><b>Sandbox 測試：</b>目前只能選 SELF_ONLY，但仍需由使用者親自選擇。</div>':'')+
      (video?'':'<div class="error">尚未產生可預覽 MP4，不能發布。</div>')+
      '<label>誰可以觀看<select data-rxv="privacy">'+privacy+'</select></label>'+
      '<div class="grid">'+choice('Allow Comment','comment',!!c.comment_disabled)+choice('Allow Duet','duet',!!c.duet_disabled)+choice('Allow Stitch','stitch',!!c.stitch_disabled)+'</div>'+
      '<div class="notice"><b>Commercial Content disclosure</b>（預設關閉；SELF_ONLY 測試時不可開啟）</div>'+
      '<div class="grid">'+choice('Promote my own brand','brandOrganic',selfOnly)+choice('Branded content','brandContent',selfOnly)+'</div>'+
      '<label><input type="checkbox" data-rxv="music"> By posting, you agree to TikTok\\'s Music Usage Confirmation</label>'+
      '<button class="btn" data-rxv="confirm" disabled>確認並發布 TikTok</button>'+
      '<div class="result" data-rxv="result"></div>';
    old.parentNode.insertBefore(panel,old);
    var privacyEl=panel.querySelector('[data-rxv="privacy"]');
    var music=panel.querySelector('[data-rxv="music"]');
    var confirmBtn=panel.querySelector('[data-rxv="confirm"]');
    function updateReady(){confirmBtn.disabled=!video||!privacyEl.value||!music.checked}
    privacyEl.addEventListener('change',updateReady);
    music.addEventListener('change',updateReady);
    updateReady();
    confirmBtn.addEventListener('click',async function(){
      var result=panel.querySelector('[data-rxv="result"]');
      if(!video){result.textContent='需要 MP4 預覽後才能發布。';return}
      if(!privacyEl.value){result.textContent='請先選擇「誰可以觀看」。';return}
      if(!music.checked){result.textContent='請先主動勾選 Music Usage Confirmation。';return}
      if(!confirm('確認以目前畫面中的文案、隱私與互動設定發布到 TikTok？'))return;
      this.disabled=true;
      result.className='result';
      result.textContent='正在依 TikTok 官方流程發布：creator_info/query → video/init → FILE_UPLOAD → status/fetch…';
      try{
        var cap=card.querySelector('textarea');
        var d=await api('/api/jobs/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          videoId:id,
          caption:cap?cap.value:'',
          tiktokOptions:{
            privacyLevel:privacyEl.value,
            allowComment:!!panel.querySelector('[data-rxv="comment"]').checked,
            allowDuet:!!panel.querySelector('[data-rxv="duet"]').checked,
            allowStitch:!!panel.querySelector('[data-rxv="stitch"]').checked,
            brandOrganic:!!panel.querySelector('[data-rxv="brandOrganic"]').checked,
            brandContent:!!panel.querySelector('[data-rxv="brandContent"]').checked
          }
        })});
        result.textContent='publish_id: '+(d.publishId||'-')+'\\nTikTok processing status: '+(d.providerStatus||'-')+'\\n'+(d.published?'PUBLISH_COMPLETE':d.processing?'PROCESSING':d.needsManualAction?'SEND_TO_USER_INBOX':'')+(d.message?'\\n'+d.message:'');
      }catch(e){
        result.className='result error';
        result.textContent='FAILED: '+e.message;
      }finally{
        updateReady();
      }
    });
  })}
  async function load(){try{var d=await api('/api/rxv-tiktok-creator-info?force=1');creator=d.creator||{};decorate()}catch(e){creator={privacy_level_options:[]};decorate();console.warn('[RXV TikTok review demo]',e.message)}}
  new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});load();
})();
</script> 
<style>
.rxvFbPanel{margin-top:22px;padding:18px;background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 7px 22px #0000000a}.rxvFbGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.rxvFbGrid label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:800;color:#475569}.rxvFbGrid select,.rxvFbGrid input[type=text]{padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff}.rxvFbChecks{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0}.rxvFbPreview{display:grid;grid-template-columns:minmax(220px,340px) 1fr;gap:16px;margin-top:14px}.rxvFbPreview img{width:100%;max-height:520px;object-fit:contain;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0}.rxvFbHistory{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}.rxvFbHistory th,.rxvFbHistory td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}.rxvFbTopNav{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.rxvFbMsg{margin-top:10px;padding:10px 12px;background:#f8fafc;border-radius:10px;font-size:13px}@media(max-width:800px){.rxvFbPreview{grid-template-columns:1fr}}
</style>
<section id="rxvFacebookV3" class="rxvFbPanel">
  <h2 style="margin-top:0">FB 圖片分享模式</h2>
  <p class="muted">直接挑網站圖片分享 Facebook，Facebook 紀錄與 TikTok 影片紀錄分開。可只抓免費圖片，並依個人／粉專／社團分開防重複。</p>
  <div class="rxvFbGrid">
    <label>圖片分類<select id="rxvFbCategory"><option value="auto">全部分類</option></select></label>
    <label>發布位置<select id="rxvFbTargetType"><option value="personal">個人 FB</option><option value="page">粉專</option><option value="group">社團</option></select></label>
    <label>粉專／社團名稱<input id="rxvFbTargetName" type="text" placeholder="社團模式請輸入社團名稱"></label>
    <label>文案輸出<input type="text" value="一次產生 2 個版本" readonly></label>
  </div>
  <div class="rxvFbChecks">
    <label><input type="checkbox" id="rxvFbFreeOnly" checked> 只抓免費圖片</label>
    <label><input type="checkbox" id="rxvFbUnposted" checked> 只抓此位置尚未發過</label>
    <label><input type="checkbox" id="rxvFbAllowLink"> 此社團／位置允許放網站連結</label>
  </div>
  <div class="actions">
    <button class="btn" onclick="rxvFbPick(false)">抓 1 張</button>
    <button class="btn light" onclick="rxvFbPick(true)">換一張</button>
    <button class="btn gray" onclick="rxvFbUpdateCopy()">更新兩版文案</button>
    <button class="btn light" onclick="rxvFbCopyImage()">複製圖片</button>
    <button class="btn light" onclick="rxvFbOpenImage()">開啟圖片</button>
    <button class="btn light" onclick="window.open('https://www.facebook.com/','_blank','noopener')">開啟 Facebook</button>
    <button class="btn green" onclick="rxvFbMark('posted')">標記已發布</button>
    <button class="btn red" onclick="rxvFbMark('skipped')">略過此圖</button>
  </div>
  <div id="rxvFbMsg" class="rxvFbMsg">載入中…</div>
  <div class="rxvFbPreview">
    <div><img id="rxvFbImage" alt="FB 圖片預覽" style="display:none"></div>
    <div>
      <div id="rxvFbMeta" class="small">尚未選圖</div>
      <div style="display:grid;grid-template-columns:1fr;gap:12px;margin-top:8px">
        <div style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#fff">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px">
            <b>版本 1｜嚴格社團版（不放連結）</b>
            <button class="btn light" type="button" onclick="rxvFbCopyText('strict')">一鍵複製此版</button>
          </div>
          <textarea id="rxvFbStrictText" placeholder="抓圖後會自動產生嚴格社團版文案"></textarea>
        </div>
        <div style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#fff">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px">
            <b>版本 2｜一般 FB 導流版</b>
            <button class="btn light" type="button" onclick="rxvFbCopyText('link')">一鍵複製此版</button>
          </div>
          <textarea id="rxvFbLinkText" placeholder="抓圖後會自動產生一般 FB 導流版文案"></textarea>
        </div>
      </div>
    </div>
  </div>
  <h3>Facebook 圖片發布紀錄</h3>
  <div style="overflow:auto"><table class="rxvFbHistory"><thead><tr><th>時間</th><th>圖片</th><th>分類</th><th>位置</th><th>模式</th><th>狀態</th></tr></thead><tbody id="rxvFbHistoryBody"></tbody></table></div>
</section>
<script id="rxvFacebookV3Script">
var rxvFbCurrent=null;
var rxvFbSessionExcluded={};
async function rxvFbApi(url,opts){var r=await fetch(url,opts);var d=await r.json().catch(function(){return {}});if(!r.ok||d.ok===false)throw new Error(d.message||d.error||('HTTP '+r.status));return d}
function rxvFbMessage(s){document.getElementById('rxvFbMsg').textContent=s||''}
function rxvFbEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
function rxvFbSettings(){
  return {
    categoryKey:document.getElementById('rxvFbCategory').value,
    targetType:document.getElementById('rxvFbTargetType').value,
    targetName:document.getElementById('rxvFbTargetName').value.trim(),
    copyMode:'strict',
    freeOnly:document.getElementById('rxvFbFreeOnly').checked,
    unpostedOnly:document.getElementById('rxvFbUnposted').checked,
    allowLink:document.getElementById('rxvFbAllowLink').checked
  };
}
async function rxvFbInit(){
  try{
    var s=await rxvFbApi('/api/status');
    var sel=document.getElementById('rxvFbCategory');
    sel.innerHTML='<option value="auto">全部分類</option>'+(s.categories||[]).map(function(x){return '<option value="'+rxvFbEsc(x.key)+'">'+rxvFbEsc(x.label)+'（'+x.count+' 張）</option>'}).join('');
    var hero=document.querySelector('.hero');
    if(hero&&!document.getElementById('rxvFbTopNav')){
      var nav=document.createElement('div');nav.id='rxvFbTopNav';nav.className='rxvFbTopNav';
      nav.innerHTML='<button class="btn light" type="button">↓ FB 圖片分享</button>';
      nav.querySelector('button').onclick=function(){document.getElementById('rxvFacebookV3').scrollIntoView({behavior:'smooth'})};
      hero.appendChild(nav);
    }
    await rxvFbHistory();
    rxvFbMessage('FB 圖片模式已就緒｜預設只抓免費、此位置未發過的圖片。');
  }catch(e){rxvFbMessage('載入失敗：'+e.message)}
}
async function rxvFbPick(nextOne){
  try{
    var s=rxvFbSettings();
    if(nextOne&&rxvFbCurrent&&rxvFbCurrent.fingerprint)rxvFbSessionExcluded[rxvFbCurrent.fingerprint]=true;
    if(s.targetType==='group'&&!s.targetName){rxvFbMessage('請先輸入 Facebook 社團名稱。');return}
    rxvFbMessage('正在挑選尚未在這個位置發過的圖片…');
    var q=new URLSearchParams();
    Object.keys(s).forEach(function(k){q.set(k,String(s[k]))});
    q.set('excludeFingerprints',JSON.stringify(Object.keys(rxvFbSessionExcluded)));
    var d=await rxvFbApi('/api/facebook/pick?'+q.toString());
    if(!d.found){rxvFbCurrent=null;document.getElementById('rxvFbImage').style.display='none';document.getElementById('rxvFbMeta').textContent='沒有符合條件的圖片';document.getElementById('rxvFbStrictText').value='';document.getElementById('rxvFbLinkText').value='';rxvFbMessage(d.message||'沒有符合條件的圖片');return}
    rxvFbCurrent=d.image;
    var img=document.getElementById('rxvFbImage');img.src=d.image.imageUrl;img.style.display='block';
    document.getElementById('rxvFbMeta').textContent=d.image.category+'｜'+d.image.title+'｜'+(d.image.isFree?'免費':'素材包')+'｜此位置尚可選 '+d.remainingForTarget+' 張';
    await rxvFbUpdateCopy();
    rxvFbMessage('已選到 1 張｜兩個 FB 文案版本已同時產生，可分別一鍵複製。');
  }catch(e){rxvFbMessage('選圖失敗：'+e.message)}
}
async function rxvFbUpdateCopy(){
  try{
    if(!rxvFbCurrent){rxvFbMessage('請先按「抓 1 張」。');return}
    var s=rxvFbSettings();
    rxvFbMessage('正在產生兩個 FB 文案版本…');
    var pair=await Promise.all([
      rxvFbApi('/api/facebook/copy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:rxvFbCurrent,copyMode:'strict',allowLink:false})}),
      rxvFbApi('/api/facebook/copy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:rxvFbCurrent,copyMode:'general',allowLink:s.allowLink})})
    ]);
    document.getElementById('rxvFbStrictText').value=pair[0].postText||'';
    document.getElementById('rxvFbLinkText').value=pair[1].postText||'';
    rxvFbMessage('兩個文案版本已更新，可各別一鍵複製。');
  }catch(e){rxvFbMessage('更新文案失敗：'+e.message)}
}
async function rxvFbCopyText(kind){
  try{
    var id=kind==='link'?'rxvFbLinkText':'rxvFbStrictText';
    var t=document.getElementById(id).value;
    if(!t){rxvFbMessage('目前沒有文案。');return}
    await navigator.clipboard.writeText(t);
    rxvFbMessage(kind==='link'?'一般 FB 導流版已複製。':'嚴格社團版已複製。');
  }catch(e){rxvFbMessage('複製文案失敗：'+e.message)}
}
async function rxvFbCopyImage(){
  try{
    if(!rxvFbCurrent){rxvFbMessage('請先按「抓 1 張」。');return}
    var r=await fetch(rxvFbCurrent.imageUrl);if(!r.ok)throw new Error('圖片讀取失敗');
    var b=await r.blob();
    if(!navigator.clipboard||!window.ClipboardItem)throw new Error('瀏覽器不支援直接複製圖片');
    await navigator.clipboard.write([new ClipboardItem({[b.type]:b})]);
    rxvFbMessage('圖片已複製，可直接到 Facebook 貼上。');
  }catch(e){rxvFbMessage('無法直接複製圖片，已幫你開啟圖片；可另存或複製後再貼到 Facebook。');rxvFbOpenImage()}
}
function rxvFbOpenImage(){if(!rxvFbCurrent){rxvFbMessage('請先按「抓 1 張」。');return}window.open(rxvFbCurrent.imageUrl,'_blank','noopener')}
async function rxvFbMark(status){
  try{
    if(!rxvFbCurrent){rxvFbMessage('請先按「抓 1 張」。');return}
    var s=rxvFbSettings();
    if(s.targetType==='group'&&!s.targetName){rxvFbMessage('請先輸入社團名稱。');return}
    var d=await rxvFbApi('/api/facebook/mark',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:rxvFbCurrent,targetType:s.targetType,targetName:s.targetName,copyMode:(s.targetType==='group'?'strict':'general'),allowLink:s.allowLink,postText:document.getElementById(s.targetType==='group'?'rxvFbStrictText':'rxvFbLinkText').value,status:status})});
    rxvFbMessage(d.status==='posted'?'已記錄為 Facebook 已發布；下次同一位置不會再抓這張。':'已記錄為略過；之後仍可再次抓到。');
    await rxvFbHistory();
    if(d.status==='posted')await rxvFbPick();
  }catch(e){rxvFbMessage('記錄失敗：'+e.message)}
}
async function rxvFbHistory(){
  try{
    var d=await rxvFbApi('/api/facebook/posts?limit=60');
    var body=document.getElementById('rxvFbHistoryBody');
    var rows=d.items||[];
    body.innerHTML=rows.length?rows.map(function(x){
      var target=x.target_type==='group'?'社團：'+(x.target_name||'-'):x.target_type==='page'?'粉專：'+(x.target_name||'-'):'個人 FB';
      return '<tr><td>'+rxvFbEsc((x.posted_at||x.created_at||'').replace('T',' ').slice(0,19))+'</td><td>'+rxvFbEsc(x.title||x.image_id)+'</td><td>'+rxvFbEsc(x.category_label||'-')+'</td><td>'+rxvFbEsc(target)+'</td><td>'+rxvFbEsc(x.copy_mode==='strict'?'嚴格':'一般')+'</td><td>'+rxvFbEsc(x.status)+'</td></tr>';
    }).join(''):'<tr><td colspan="6" class="muted">尚無 Facebook 圖片發布紀錄</td></tr>';
  }catch(e){}
}
rxvFbInit();
</script>
</body></html>`;
}

async function serveVideo(urlObj, res) {
  const videoId = String(urlObj.searchParams.get("videoId") || "").trim();
  const db = requireDb();
  let row;
  try { row = db.prepare("SELECT video_path FROM rxv_video_jobs WHERE video_id=? LIMIT 1").get(videoId); }
  finally { db.close(); }
  if (!row || !row.video_path || !fs.existsSync(row.video_path)) return text(res, 404, "VIDEO_NOT_FOUND");
  const stat = fs.statSync(row.video_path);
  res.statusCode = 200;
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Accept-Ranges", "bytes");
  fs.createReadStream(row.video_path).pipe(res);
}

async function requestHandler(req, res) {
  try {
    const urlObj = new URL(req.url || "/", `http://${HOST}:${PORT}`);
    if (req.method === "GET" && urlObj.pathname === "/") return text(res, 200, dashboardHtml(), "text/html; charset=utf-8");
    if (req.method === "GET" && urlObj.pathname === "/api/status") return json(res, 200, await statusPayload());
    if (req.method === "GET" && urlObj.pathname === "/api/jobs") {
      const db = requireDb();
      try { return json(res, 200, { ok: true, items: listJobs(db, urlObj.searchParams.get("limit")) }); }
      finally { db.close(); }
    }
    if (req.method === "GET" && urlObj.pathname === "/api/video") return await serveVideo(urlObj, res);
    if (req.method === "POST" && urlObj.pathname === "/api/jobs/generate") {
      const body = await readJsonBody(req);
      return json(res, 200, await generateVideoJobs(body));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/jobs/render") {
      const body = await readJsonBody(req);
      return json(res, 200, await renderVideoJob(String(body.videoId || "").trim(), body));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/jobs/publish") {
      const body = await readJsonBody(req);
      return json(res, 200, await publishVideoJob(String(body.videoId || "").trim(), String(body.caption || ""), body.tiktokOptions || {}));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/jobs/check") {
      const body = await readJsonBody(req);
      return json(res, 200, await checkTikTokStatus(String(body.videoId || "").trim()));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/jobs/cancel") {
      const body = await readJsonBody(req);
      return json(res, 200, cancelJob(String(body.videoId || "").trim()));
    }
    if (req.method === "GET" && urlObj.pathname === "/api/pinterest/pick") {
      return json(res, 200, await pickPinterestImage({ categoryKey: urlObj.searchParams.get("categoryKey") }));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/pinterest/copy") {
      const body = await readJsonBody(req);
      return json(res, 200, { ok: true, copy: buildPinterestCopy(body.image || {}) });
    }
    if (req.method === "POST" && urlObj.pathname === "/api/pinterest/queue") {
      const body = await readJsonBody(req);
      return json(res, 200, await queuePinterestJob(body));
    }
    if (req.method === "GET" && urlObj.pathname === "/api/pinterest/file") {
      return servePinterestJobFile(res, urlObj.searchParams.get("id"));
    }
    if (req.method === "GET" && urlObj.pathname === "/api/pinterest/job") {
      return json(res, 200, getPinterestJobStatus(urlObj.searchParams.get("id")));
    }
    if (req.method === "GET" && urlObj.pathname === "/api/pinterest/next") {
      return json(res, 200, nextPinterestJob());
    }
    if (req.method === "POST" && urlObj.pathname === "/api/pinterest/result") {
      const body = await readJsonBody(req);
      return json(res, 200, finishPinterestJob(body, false));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/pinterest/fail") {
      const body = await readJsonBody(req);
      return json(res, 200, finishPinterestJob(body, true));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/pinterest/mark") {
      const body = await readJsonBody(req);
      return json(res, 200, markPinterestPosted(body));
    }
    if (req.method === "GET" && urlObj.pathname === "/api/pinterest/posts") {
      const db = requireDb();
      try { return json(res, 200, { ok: true, items: listPinterestPosts(db, urlObj.searchParams.get("limit")) }); }
      finally { db.close(); }
    }
    if (req.method === "GET" && urlObj.pathname === "/api/facebook/pick") {
      return json(res, 200, await pickFacebookImage({
        categoryKey: urlObj.searchParams.get("categoryKey"),
        targetType: urlObj.searchParams.get("targetType"),
        targetName: urlObj.searchParams.get("targetName"),
        copyMode: urlObj.searchParams.get("copyMode"),
        freeOnly: urlObj.searchParams.get("freeOnly"),
        unpostedOnly: urlObj.searchParams.get("unpostedOnly"),
        allowLink: urlObj.searchParams.get("allowLink"),
        excludeFingerprints: urlObj.searchParams.get("excludeFingerprints"),
      }));
    }
    if (req.method === "GET" && urlObj.pathname === "/api/facebook/posts") {
      const db = requireDb();
      try { return json(res, 200, { ok: true, items: listFacebookPosts(db, urlObj.searchParams.get("limit")) }); }
      finally { db.close(); }
    }
    if (req.method === "POST" && urlObj.pathname === "/api/facebook/copy") {
      const body = await readJsonBody(req);
      return json(res, 200, buildFacebookCopyFromBody(body));
    }
    if (req.method === "POST" && urlObj.pathname === "/api/facebook/mark") {
      const body = await readJsonBody(req);
      return json(res, 200, markFacebookImage(body));
    }
    if (req.method === "GET" && urlObj.pathname === "/health") return json(res, 200, { ok: true, app: "rxv-image-publisher-v2" });
    return json(res, 404, { ok: false, message: "NOT_FOUND" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, message: String(error && error.message || error) });
  }
}

function openBrowser(url) {
  if (process.platform !== "win32") return;
  try {
    const child = spawn("cmd.exe", ["/c", "start", "", url], { detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
  } catch {}
}

async function runAutoOnce() {
  const generated = await generateVideoJobs({ count: 1, categoryKey: process.env.RXV_AUTO_CATEGORY || "auto", imagesPerVideo: Number(process.env.RXV_AUTO_IMAGES_PER_VIDEO || 4), mp3Choice: process.env.RXV_AUTO_MP3 || "auto" });
  if (!generated.videoIds.length) throw new Error("沒有足夠的未使用圖片可建立影片");
  const videoId = generated.videoIds[0];
  console.log("[RXV v2] 建立任務：", videoId);
  const rendered = await renderVideoJob(videoId, { mp3Choice: process.env.RXV_AUTO_MP3 || "auto" });
  console.log("[RXV v2] MP4：", rendered.videoPath);
  console.log(JSON.stringify({ ok: true, videoId, videoPath: rendered.videoPath, readyForManualReview: true, message: "已準備完成；請開啟 RXV UI 檢查預覽、文案、隱私與 Music Usage Confirmation 後手動發布。" }, null, 2));
}

async function main() {
  if (process.argv.includes("--auto-once")) {
    await runAutoOnce();
    return;
  }
  if (process.argv.includes("--prepare-one")) {
    const generated = await generateVideoJobs({ count: 1, categoryKey: process.env.RXV_AUTO_CATEGORY || "auto", imagesPerVideo: Number(process.env.RXV_AUTO_IMAGES_PER_VIDEO || 4), mp3Choice: process.env.RXV_AUTO_MP3 || "auto" });
    if (!generated.videoIds.length) throw new Error("沒有足夠圖片");
    const rendered = await renderVideoJob(generated.videoIds[0], { mp3Choice: process.env.RXV_AUTO_MP3 || "auto" });
    console.log(JSON.stringify(rendered, null, 2));
    return;
  }

  const server = http.createServer((req, res) => { void requestHandler(req, res); });
  server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}/`;
    console.log("RXV 圖片自動推廣器 v3 已啟動：" + url);
    console.log("SQLite：" + DB_PATH);
    console.log("本機 MP4：" + outputRoot());
    console.log("關閉此視窗即可停止。");
    setTimeout(() => openBrowser(url), 500);
  });
}

if (require.main === module || process.env.RXV_V2_BUNDLE_MAIN === "1") {
  main().catch((error) => {
    console.error("[RXV v2] 啟動失敗：", error && error.stack ? error.stack : error);
    process.exitCode = 1;
  });
}

module.exports = { loadManifest, generateVideoJobs, renderVideoJob, publishVideoJob, statusPayload };
