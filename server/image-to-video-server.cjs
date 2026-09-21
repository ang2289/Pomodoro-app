try {
  require("dotenv").config();
} catch (e) {}
console.log("[ENV_CHECK]", {
  endpoint: (
    process.env.RXV_VIDEO_SCRIPT_ENDPOINT ||
    process.env.VIDEO_SCRIPT_ENDPOINT ||
    process.env.VIDEO_SCRIPT_URL ||
    ""
  ).trim(),
  hasAnon: !!String(process.env.SUPABASE_ANON_KEY || "").trim(),
  hasAuth: !!String(process.env.VIDEO_SCRIPT_AUTH || "").trim(),
});

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");
const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");
const { spawn, execFile } = require("node:child_process");
const axios = require("axios");
const express = require("express");
const { registerRxvV403Helper } = require("./rxv-v40-3-helper.cjs");
const { createTikTokOfficialApi } = require("./tiktok-official-api.cjs");
let DatabaseSync = null;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch (error) {
  console.error("[affiliate-db] node:sqlite unavailable", error?.message || error);
}

const PORT = Number(process.env.PORT || 3006);
const BUILD = "RXV_VIDEO_SERVER_V40_3_TIKTOK_AUTO_SCHEDULE_SHOPEE_MOBILE";
const ROOT = process.cwd();


const RXV_BROWSER_PROFILE_DIR = normalizeEnvString(
  process.env.RXV_BROWSER_PROFILE_DIR ||
    path.join(path.parse(ROOT).root || ROOT, "rxv-browser-profile"),
);
const RXV_BROWSER_HEADLESS =
  String(process.env.RXV_BROWSER_HEADLESS || "0") === "1";
const RXV_FACEBOOK_PAGE_NAME = String(
  process.env.RXV_FACEBOOK_PAGE_NAME || "RXV 好物分享",
).trim();
const RXV_BROWSER_DEBUG_DIR = normalizeEnvString(
  process.env.RXV_BROWSER_DEBUG_DIR ||
    path.join(path.parse(ROOT).root || ROOT, "out_mp4", "_browser_debug"),
);
const RXV_BROWSER_CACHE_LIMIT_MB = Math.max(
  64,
  Number(process.env.RXV_BROWSER_CACHE_LIMIT_MB || 256),
);
const RXV_BROWSER_SUPPORTED_PLATFORMS = new Set([
  "facebook",
  "instagram",
  "tiktok",
  "threads",
  "x",
]);

const RXV_PUBLISHER_EXTENSION_SUPPORTED = new Set([
  "facebook",
]);
const RXV_PUBLISHER_EXTENSION_DIR = path.join(
  ROOT,
  "browser-extension",
  "rxv-publisher",
);
const RXV_PUBLISHER_EXTENSION_HEARTBEAT_TTL_MS = Math.max(
  15000,
  Number(process.env.RXV_PUBLISHER_EXTENSION_HEARTBEAT_TTL_MS || 45000),
);
const RXV_PUBLISHER_EXTENSION_LEASE_MS = Math.max(
  30000,
  Number(process.env.RXV_PUBLISHER_EXTENSION_LEASE_MS || 180000),
);
const RXV_PUBLISHER_EXTENSION_JOB_TIMEOUT_MS = Math.max(
  60000,
  Number(process.env.RXV_PUBLISHER_EXTENSION_JOB_TIMEOUT_MS || 240000),
);

function normalizeEnvString(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "");
}

function toProjectUrl(value) {
  const raw = normalizeEnvString(value);
  if (!raw) return "";
  return raw
    .replace(/\/functions\/v1\/.*$/i, "")
    .replace(/\/storage\/v1\/.*$/i, "")
    .replace(/\/$/, "");
}

const PUBLIC_SITE_URL = normalizeEnvString(
  process.env.PUBLIC_SITE_URL || "http://localhost:3005",
).replace(/\/$/, "");
const DEFAULT_GOODS_PATH = normalizeEnvString(
  process.env.DEFAULT_GOODS_PATH || "/goods/share",
);
const PUBLIC_VIDEO_BASE_URL = normalizeEnvString(
  process.env.PUBLIC_VIDEO_BASE_URL || `http://localhost:${PORT}`,
).replace(/\/$/, "");
const SUPABASE_PROJECT_URL = toProjectUrl(
  process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL,
);
const SUPABASE_SERVICE_ROLE_KEY = normalizeEnvString(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const SUPABASE_STORAGE_BUCKET = normalizeEnvString(
  process.env.SUPABASE_STORAGE_BUCKET || "shopee-videos",
);
const VIDEO_SCRIPT_ENDPOINT = normalizeEnvString(
  process.env.RXV_VIDEO_SCRIPT_ENDPOINT ||
    process.env.VIDEO_SCRIPT_ENDPOINT ||
    process.env.VIDEO_SCRIPT_URL ||
    "",
);
const VIDEO_SCRIPT_KEY = normalizeEnvString(
  process.env.RXV_VIDEO_SCRIPT_KEY ||
    process.env.VIDEO_SCRIPT_AUTH ||
    process.env.SUPABASE_ANON_KEY ||
    "",
);
const AI_DEBUG = String(process.env.RXV_AI_DEBUG || "1") === "1";

const META_GRAPH_VERSION =
  normalizeEnvString(process.env.META_GRAPH_VERSION || "v26.0") || "v26.0";
const META_PAGE_ID = normalizeEnvString(process.env.META_PAGE_ID || "");
const META_PAGE_ACCESS_TOKEN = normalizeEnvString(
  process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    "",
);
const META_IG_USER_ID = normalizeEnvString(
  process.env.META_IG_USER_ID ||
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
    "",
);

const RXV_R2_ACCOUNT_ID = normalizeEnvString(
  process.env.RXV_R2_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    "",
);
const RXV_R2_ACCESS_KEY_ID = normalizeEnvString(
  process.env.RXV_R2_ACCESS_KEY_ID ||
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
    "",
);
const RXV_R2_SECRET_ACCESS_KEY = normalizeEnvString(
  process.env.RXV_R2_SECRET_ACCESS_KEY ||
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
    "",
);
const RXV_R2_BUCKET = normalizeEnvString(
  process.env.RXV_R2_BUCKET ||
    process.env.CLOUDFLARE_R2_BUCKET ||
    "",
);
const RXV_R2_PUBLIC_BASE_URL = normalizeEnvString(
  process.env.RXV_R2_PUBLIC_BASE_URL ||
    process.env.CLOUDFLARE_R2_PUBLIC_URL ||
    process.env.R2_PUBLIC_URL ||
    "",
).replace(/\/$/, "");

const META_STAGING_PREFIX =
  normalizeEnvString(
    process.env.META_STAGING_PREFIX || "meta-publisher",
  ).replace(/^\/+|\/+$/g, "") || "meta-publisher";

const META_HTTP_TIMEOUT_MS = Math.max(
  10000,
  Number(process.env.META_HTTP_TIMEOUT_MS || 120000),
);

const YOUTUBE_CLIENT_ID = normalizeEnvString(process.env.YOUTUBE_CLIENT_ID || "");
const YOUTUBE_CLIENT_SECRET = normalizeEnvString(process.env.YOUTUBE_CLIENT_SECRET || "");
const YOUTUBE_REDIRECT_URI = normalizeEnvString(
  process.env.YOUTUBE_REDIRECT_URI || "http://localhost:3006/youtube/oauth/callback",
);
const YOUTUBE_UPLOAD_PRIVACY = ["private", "unlisted", "public"].includes(
  String(process.env.YOUTUBE_UPLOAD_PRIVACY || "private").toLowerCase(),
)
  ? String(process.env.YOUTUBE_UPLOAD_PRIVACY || "private").toLowerCase()
  : "private";
const YOUTUBE_HTTP_TIMEOUT_MS = Math.max(
  15000,
  Number(process.env.YOUTUBE_HTTP_TIMEOUT_MS || 180000),
);
const YOUTUBE_TOKEN_DIR = path.join(
  process.env.USERPROFILE || os.homedir(),
  ".rxv",
);
const YOUTUBE_TOKEN_FILE = path.join(YOUTUBE_TOKEN_DIR, "youtube-oauth.json");
const YOUTUBE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
];


function maskSecret(value) {
  const s = String(value || "").trim();
  if (!s) return "(empty)";
  if (s.length <= 8) return `${s.slice(0, 2)}***${s.slice(-2)}`;
  return `${s.slice(0, 4)}***${s.slice(-4)}`;
}

function debugAi(...args) {
  if (AI_DEBUG) console.log(...args);
}
const TMP_ROOT = path.join(ROOT, "output", "tmp-render");
const DEFAULT_OUTPUT_DIR =
  process.platform === "win32"
    ? path.resolve(normalizeEnvString(process.env.RXV_OUTPUT_DIR) || "D:/out_mp4")
    : path.resolve(normalizeEnvString(process.env.RXV_OUTPUT_DIR) || path.join(ROOT, "out_mp4"));
const DATA_DIR = path.join(ROOT, "data");
const AFFILIATE_DB_PATH = path.join(DATA_DIR, "affiliate-publish.db");
const AFFILIATE_DB_BACKUP_DIR = path.join(ROOT, "backup", "affiliate-db");
const AFFILIATE_DB_RETENTION = 30;
const OPENCLAW_NATIVE_BASE_URL = normalizeEnvString(
  process.env.RXV_OPENCLAW_BASE_URL || "http://127.0.0.1:18789",
).replace(/\/$/, "");
const OPENCLAW_NATIVE_RESPONSES_URL =
  `${OPENCLAW_NATIVE_BASE_URL}/v1/responses`;
const OPENCLAW_NATIVE_MODELS_URL =
  `${OPENCLAW_NATIVE_BASE_URL}/v1/models`;
const OPENCLAW_CONFIG_FILE = path.join(
  process.env.USERPROFILE || os.homedir(),
  ".openclaw",
  "openclaw.json",
);
const OPENCLAW_AGENT_ID =
  normalizeEnvString(process.env.RXV_OPENCLAW_AGENT_ID || "main") || "main";

const GEMINI_API_BASE = normalizeEnvString(
  process.env.RXV_GEMINI_API_BASE ||
    "https://generativelanguage.googleapis.com/v1beta",
).replace(/\/$/, "");

const RXV_CSV_COPY_ONLY = true; // V40.5.7: Shopee video copy/script comes from imported CSV.

const GEMINI_MODELS = [
  normalizeEnvString(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
  normalizeEnvString(process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash"),
].filter((model, index, arr) => Boolean(model) && arr.indexOf(model) === index);

function readGeminiApiKey() {
  return normalizeEnvString(
    process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY_SUMMARY ||
      "",
  );
}


function sqliteNow() {
  return new Date().toISOString();
}

function normalizeShopeeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    u.hash = "";
    u.search = "";
    return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return raw.split(/[?#]/)[0].replace(/\/+$/, "");
  }
}

function parseShopeeProductIdentity(productUrl) {
  const normalizedUrl = normalizeShopeeUrl(productUrl);
  const match = normalizedUrl.match(/\/product\/(\d+)\/(\d+)/i);
  if (match) {
    return {
      key: `${match[1]}:${match[2]}`,
      shopId: match[1],
      productId: match[2],
      normalizedUrl,
    };
  }
  const hash = crypto
    .createHash("sha1")
    .update(normalizedUrl || String(productUrl || ""))
    .digest("hex");
  return {
    key: `url:${hash}`,
    shopId: "",
    productId: "",
    normalizedUrl,
  };
}

function backupAffiliateDbBeforeOpen() {
  try {
    if (!fs.existsSync(AFFILIATE_DB_PATH)) return;
    ensureDirSync(AFFILIATE_DB_BACKUP_DIR);
    const date = new Date().toISOString().slice(0, 10);
    const backupFile = path.join(
      AFFILIATE_DB_BACKUP_DIR,
      `affiliate-publish-${date}.db`,
    );
    if (!fs.existsSync(backupFile)) {
      fs.copyFileSync(AFFILIATE_DB_PATH, backupFile);
      console.log("[affiliate-db] backup", backupFile);
    }

    const backups = fs
      .readdirSync(AFFILIATE_DB_BACKUP_DIR)
      .filter((name) => /^affiliate-publish-\d{4}-\d{2}-\d{2}\.db$/i.test(name))
      .sort()
      .reverse();

    for (const oldName of backups.slice(AFFILIATE_DB_RETENTION)) {
      try {
        fs.unlinkSync(path.join(AFFILIATE_DB_BACKUP_DIR, oldName));
      } catch {}
    }
  } catch (error) {
    console.warn("[affiliate-db] backup failed", error?.message || error);
  }
}

let affiliateDb = null;


function ensureAffiliateColumn(db, columnName, definition) {
  const rows = db.prepare("PRAGMA table_info(affiliate_products)").all();
  const exists = rows.some((row) => String(row?.name || "") === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE affiliate_products ADD COLUMN ${columnName} ${definition}`);
    console.log("[affiliate-db] migrated column", columnName);
  }
}

function migrateAffiliateDbV373(db) {
  const columns = [
    ["youtube_shorts_title", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_shorts_description", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_video_title", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_video_description", "TEXT NOT NULL DEFAULT ''"],
    ["threads_post", "TEXT NOT NULL DEFAULT ''"],
    ["x_post", "TEXT NOT NULL DEFAULT ''"],

    ["facebook_hashtags", "TEXT NOT NULL DEFAULT ''"],
    ["instagram_hashtags", "TEXT NOT NULL DEFAULT ''"],
    ["tiktok_hashtags", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_hashtags", "TEXT NOT NULL DEFAULT ''"],

    ["facebook_status", "TEXT NOT NULL DEFAULT 'not_published'"],
    ["instagram_status", "TEXT NOT NULL DEFAULT 'not_published'"],
    ["tiktok_status", "TEXT NOT NULL DEFAULT 'not_published'"],
    ["youtube_shorts_status", "TEXT NOT NULL DEFAULT 'not_published'"],
    ["youtube_video_status", "TEXT NOT NULL DEFAULT 'not_published'"],
    ["threads_status", "TEXT NOT NULL DEFAULT 'not_published'"],
    ["x_status", "TEXT NOT NULL DEFAULT 'not_published'"],

    ["youtube_shorts_url", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_video_url", "TEXT NOT NULL DEFAULT ''"],
    ["threads_url", "TEXT NOT NULL DEFAULT ''"],
    ["x_url", "TEXT NOT NULL DEFAULT ''"],

    ["facebook_error", "TEXT NOT NULL DEFAULT ''"],
    ["instagram_error", "TEXT NOT NULL DEFAULT ''"],
    ["tiktok_error", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_shorts_error", "TEXT NOT NULL DEFAULT ''"],
    ["youtube_video_error", "TEXT NOT NULL DEFAULT ''"],
    ["threads_error", "TEXT NOT NULL DEFAULT ''"],
    ["x_error", "TEXT NOT NULL DEFAULT ''"],

    ["facebook_published_at", "TEXT"],
    ["instagram_published_at", "TEXT"],
    ["tiktok_published_at", "TEXT"],
    ["youtube_shorts_published_at", "TEXT"],
    ["youtube_video_published_at", "TEXT"],
    ["threads_published_at", "TEXT"],
    ["x_published_at", "TEXT"],

    // V37.13: final structured payload used by V38 publishers.
    ["publish_payload_json", "TEXT NOT NULL DEFAULT '{}'"],
    ["publish_payload_version", "TEXT NOT NULL DEFAULT ''"],
    ["publish_ready", "INTEGER NOT NULL DEFAULT 0"],
    ["publish_payload_created_at", "TEXT"],
  ];

  for (const [name, definition] of columns) {
    ensureAffiliateColumn(db, name, definition);
  }
}

function materializeAffiliatePlaceholder(value, affiliateUrl) {
  const text = String(value || "").trim();
  const link = String(affiliateUrl || "").trim();
  if (!text) return "";
  return text.replace(/\[affiliateUrl\]/g, link);
}

const RXV_SUPPORTED_PLATFORMS = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube_shorts",
  "youtube_video",
  "threads",
  "x",
];

function normalizeRequestedPlatforms(value) {
  const input = Array.isArray(value) ? value : [];
  const normalized = [];

  for (const raw of input) {
    const platform = normalizePlatformName(raw);
    if (
      platform &&
      RXV_SUPPORTED_PLATFORMS.includes(platform) &&
      !normalized.includes(platform)
    ) {
      normalized.push(platform);
    }
  }

  return normalized.length ? normalized : [...RXV_SUPPORTED_PLATFORMS];
}

function queueSelectedPlatforms(productUrl, platforms) {
  const identity = parseShopeeProductIdentity(productUrl);
  const selected = normalizeRequestedPlatforms(platforms);
  const db = getAffiliateDb();
  const now = sqliteNow();

  const safetyRecord = getAffiliateRecord(productUrl);
  if (!safetyRecord || Number(safetyRecord.publish_ready || 0) !== 1) {
    for (const platform of selected) {
      const columns = PLATFORM_COLUMNS[platform];
      if (!columns) continue;
      db.prepare(
        `UPDATE affiliate_products
         SET ${columns.status} = 'not_published',
             ${columns.error} = 'PUBLISH_SAFETY_BLOCKED',
             updated_at = ?
         WHERE product_key = ?`,
      ).run(now, identity.key);
    }
    db.prepare(
      `UPDATE affiliate_products
       SET publish_status = 'not_published', updated_at = ?
       WHERE product_key = ?`,
    ).run(now, identity.key);
    return getAffiliateRecord(productUrl);
  }

  for (const platform of selected) {
    const columns = PLATFORM_COLUMNS[platform];
    if (!columns) continue;
    db.prepare(
      `UPDATE affiliate_products
       SET ${columns.status} = 'queued',
           ${columns.error} = '',
           updated_at = ?
       WHERE product_key = ?`,
    ).run(now, identity.key);
  }

  let record = getAffiliateRecord(productUrl);
  if (!record) return null;
  const aggregateStatus = computeAggregatePublishStatus(record);
  db.prepare(
    `UPDATE affiliate_products
     SET publish_status = ?, updated_at = ?
     WHERE product_key = ?`,
  ).run(aggregateStatus, now, identity.key);
  return getAffiliateRecord(productUrl);
}


function rxvStripPlatformLinks(value, affiliateUrl = "") {
  let text = String(value || "");
  const link = String(affiliateUrl || "").trim();

  text = text.replace(/\[affiliateUrl\]/g, "");
  if (link) {
    text = text.split(link).join("");
  }
  text = text.replace(/https?:\/\/\S+/g, "");
  return rxvCleanChinesePunctuation(text)
    .replace(/\s+([，。！？])/g, "$1")
    .trim();
}

function rxvEnsurePlatformCta(value, cta) {
  const text = String(value || "").trim();
  const target = String(cta || "").trim();
  if (!target) return text;
  if (
    text.includes("個人檔案") ||
    text.includes("頻道首頁") ||
    text.includes("商品連結") ||
    text.includes("商品資訊看")
  ) {
    return text;
  }
  return `${text}${text ? " " : ""}${target}`.trim();
}


function rxvStripInlineHashtags(value = "") {
  return String(value || "")
    .replace(/#[\p{L}\p{N}_-]+/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function rxvRemoveUnsupportedPublishEffects(value = "") {
  return String(value || "")
    .replace(/，?日常使用更輕鬆/g, "")
    .replace(/，?使用起來更輕鬆/g, "")
    .replace(/，?讓日常使用更輕鬆/g, "")
    .replace(/，?讓生活更方便/g, "")
    .replace(/體驗不一樣的/g, "帶有不同的")
    .replace(/體驗獨特的/g, "帶有")
    .replace(/體驗不同的/g, "帶有不同的")
    .replace(/感受開心果可可脂風味/g, "開心果可可脂風味")
    .replace(/感受([^，。！？\n]{1,20})(風味|口感|特色)/g, "$1$2")
    .replace(/體驗([^，。！？\n]{1,20})(風味|口感|特色)/g, "看看$1$2")
    .replace(/體驗/g, "看看")
    .replace(/感受/g, "看看")
    .trim();
}

function rxvCleanFinalPublishText(value = "") {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) =>
      rxvCleanChinesePunctuation(
        rxvStripInlineHashtags(
          rxvRemoveUnsupportedPublishEffects(line),
        ),
      ),
    )
    .filter(Boolean);

  return lines.join("\n").trim();
}

function rxvNormalizeHashtagText(value = "") {
  const seen = new Set();
  const tags = [];

  for (const raw of String(value || "").split(/\s+/)) {
    let tag = raw.trim();
    if (!tag) continue;
    if (!tag.startsWith("#")) tag = `#${tag}`;
    tag = tag.replace(/[，。！？、；：,.!?;:]+$/g, "");
    if (!/^#[\p{L}\p{N}_-]+$/u.test(tag)) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }

  return tags.join(" ");
}

function rxvComposePublishText(body = "", hashtags = "") {
  const cleanBody = rxvCleanFinalPublishText(body);
  const cleanTags = rxvNormalizeHashtagText(hashtags);
  return [cleanBody, cleanTags].filter(Boolean).join("\n\n").trim();
}


function rxvEnsureTikTokAffiliateLink(value = "", affiliateUrl = "") {
  const link = String(affiliateUrl || "").trim();
  let text = String(value || "").trim();

  // TikTok description is rebuilt from clean body text. Inline hashtags are
  // intentionally removed here and appended again by rxvEnsureTikTokPublishText.
  text = text
    .replace(/商品資訊看個人檔案[／/](?:商品)?連結。?/g, "")
    .replace(/商品資訊看個人檔案連結。?/g, "")
    .replace(/商品資訊看個人檔案。?/g, "")
    .trim();

  text = rxvCleanFinalPublishText(text);

  if (!link) {
    return text;
  }

  const disclosure = "部分連結為分潤連結";

  if (!text.includes(link)) {
    text = [text, `商品連結：${link}`]
      .filter(Boolean)
      .join("\n\n");
  }

  if (!text.includes(disclosure)) {
    text = [text, disclosure]
      .filter(Boolean)
      .join("\n");
  }

  return text.trim();
}


function rxvEnsureTikTokPublishText({
  value = "",
  affiliateUrl = "",
  hashtags = "",
  title = "",
} = {}) {
  const sourceText = String(value || "");
  const sourceInlineTags =
    (sourceText.match(/#[\p{L}\p{N}_-]+/gu) || [])
      .join(" ");

  const text = rxvEnsureTikTokAffiliateLink(
    sourceText,
    affiliateUrl,
  );

  let tags = rxvNormalizeHashtagText(
    [hashtags, sourceInlineTags]
      .filter(Boolean)
      .join(" "),
  );

  if (!tags) {
    tags = rxvNormalizeHashtagText(
      rxvBuildGroundedHashtags(title),
    );
  }

  // IMPORTANT: do not pass the final string through rxvCleanFinalPublishText,
  // because that helper deliberately strips hashtags. V39.7 did exactly that,
  // so prepareTikTok() stopped at TIKTOK_HASHTAGS_MISSING before it ever tried
  // to select the MP4 or fill the description.
  return [text, tags]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function rxvBuildVoiceTextFromNaturalPlan(plan = {}) {
  const parts = [
    String(plan?.hookTitle || "").trim(),
    String(plan?.hookSub || "").trim(),
    String(plan?.featureTitle || "").trim(),
    String(plan?.featureSub || "").trim(),
    String(plan?.ctaTitle || "").trim(),
    String(plan?.ctaSub || "").trim(),
  ].filter(Boolean);

  if (!parts.length) return "";

  return parts
    .map((part, index) => {
      if (/[。！？!?]$/.test(part)) return part;
      if (index === 1 || index === 3 || index === 5) return `${part}。`;
      return `${part}，`;
    })
    .join("")
    .replace(/，。/g, "。")
    .replace(/。{2,}/g, "。")
    .trim();
}


function rxvExtractSimpleBrand(title = "") {
  const source = String(title || "").trim();
  const match = source.match(/^([A-Za-z][A-Za-z0-9._-]{1,20})(?=[\s【\[]|$)/);
  return match ? match[1] : "";
}

function rxvBuildGroundedHashtags(title = "") {
  const source = String(title || "");
  const angle = buildSafePainAngle(source);
  const tags = [];
  const push = (tag) => {
    const clean = String(tag || "").trim().replace(/^#+/, "");
    if (!clean) return;
    const out = `#${clean}`;
    if (!tags.includes(out)) tags.push(out);
  };

  if (angle.category === "sleep") {
    if (/水洗|可水洗/.test(source)) push("可水洗枕");
    if (/涼感|天絲/.test(source)) push("涼感天絲");
    if (/石墨烯/.test(source)) push("石墨烯");
    if (/獨立筒/.test(source)) push("獨立筒枕");
    push("枕頭");
  } else if (angle.category === "food") {
    if (/迪拜風格|迪拜風味/.test(source)) push("迪拜風格");
    if (/開心果/.test(source)) push("開心果巧克力");
    if (/千絲酥/.test(source)) push("千絲酥");
    if (/夾心/.test(source)) push("夾心巧克力");
    if (/拉絲/.test(source)) push("拉絲巧克力");
    if (!tags.length) push("零食分享");
  } else if (angle.category === "rainwear") {
    push("雨衣");
    if (/防水/.test(source)) push("防水雨衣");
    if (/側開|側穿/.test(source)) push("側開雨衣");
    if (/秒穿/.test(source)) push("秒穿雨衣");
    if (/背包|加大/.test(source)) push("背包雨衣");
  } else if (angle.category === "storage") {
    push("收納");
    if (/大容量|加大/.test(source)) push("大容量");
    if (/背包/.test(source)) push("背包");
  } else if (angle.category === "electronics") {
    if (/快充/.test(source)) push("快充");
    if (/行動電源/.test(source)) push("行動電源");
    if (/充電/.test(source)) push("充電");
  } else {
    push("商品分享");
  }

  return tags.slice(0, 5).join(" ");
}

function rxvBuildGroundedPublishProfile(title = "", affiliateUrl = "") {
  const source = String(title || "");
  const link = String(affiliateUrl || "").trim();
  const angle = buildSafePainAngle(source);
  const plan = buildNaturalSceneSuggestions(source, angle);
  const brand = rxvExtractSimpleBrand(source);
  const hashtags = rxvBuildGroundedHashtags(source);

  let shortTitle = "";
  let hook = "";
  let feature = "";
  let proof = "";
  const cta = "點連結看完整商品資訊。";

  if (angle.category === "sleep") {
    const titleParts = [];
    if (/水洗|可水洗/.test(source)) titleParts.push("可水洗");
    if (/涼感|天絲/.test(source)) titleParts.push("涼感天絲");
    if (/石墨烯/.test(source)) titleParts.push("石墨烯");
    if (/獨立筒/.test(source)) titleParts.push("獨立筒枕");
    shortTitle =
      `${brand ? `${brand} ` : ""}${titleParts.join("") || "枕頭"}`.trim();

    hook =
      plan.hookTitle && plan.hookSub
        ? `${plan.hookTitle}${plan.hookSub}`
        : "枕頭天天用，清潔真的麻煩？想找能水洗的款式？";

    const features = [];
    if (/水洗|可水洗/.test(source)) features.push("可水洗");
    if (/涼感|天絲/.test(source)) features.push("涼感天絲");
    if (/石墨烯/.test(source)) features.push("石墨烯");
    if (/獨立筒/.test(source)) features.push("獨立筒設計");

    feature = features.length
      ? `這款商品名稱標示${features.join("、")}。`
      : "可以先看商品頁標示的材質與設計。";

    if (/一年保固|1年保固/.test(source)) {
      proof = "另提供一年保固。";
    }
  } else if (angle.category === "food") {
    const titleParts = [];
    if (/迪拜風格|迪拜風味/.test(source)) titleParts.push("迪拜風格");
    if (/開心果/.test(source)) titleParts.push("開心果");
    if (/巧克力/.test(source)) titleParts.push("巧克力");
    if (/千絲酥/.test(source)) titleParts.push("千絲酥");
    shortTitle = titleParts.join("") || "零食分享";

    hook =
      plan.hookTitle && plan.hookSub
        ? `${plan.hookTitle}${plan.hookSub}`
        : "一般零食吃膩了？想換點不同口感？";

    const features = [];
    if (/迪拜風格|迪拜風味/.test(source)) features.push("迪拜風格");
    if (/開心果/.test(source)) features.push("開心果");
    if (/千絲酥/.test(source)) features.push("千絲酥");
    if (/夾心/.test(source)) features.push("夾心");
    if (/拉絲/.test(source)) features.push("拉絲口感");

    feature = features.length
      ? `商品名稱標示${features.join("、")}特色。`
      : "可以先看商品頁標示的口味與內容。";
  } else if (angle.category === "rainwear") {
    shortTitle = "雨衣商品資訊";
    hook = plan.hookTitle || "突然下雨，雨具準備好了嗎？";

    const features = [];
    if (/側開|側穿/.test(source)) features.push("側開／側穿");
    if (/秒穿/.test(source)) features.push("秒穿");
    if (/背包|加大/.test(source)) features.push("加大／背包");
    if (/防水/.test(source)) features.push("防水");

    feature = features.length
      ? `商品名稱標示${features.join("、")}設計。`
      : "可以先看商品頁標示的雨衣設計。";
  } else if (angle.category === "storage") {
    shortTitle = /背包/.test(source)
      ? "大容量背包商品資訊"
      : "收納商品資訊";
    hook = plan.hookTitle || "東西越帶越多，空間總是不夠？";
    feature = /大容量|加大/.test(source)
      ? "商品名稱標示大容量／加大設計。"
      : "可以先看商品頁標示的收納設計。";
  } else if (angle.category === "electronics") {
    shortTitle = /行動電源/.test(source)
      ? "行動電源商品資訊"
      : "充電商品資訊";
    hook = plan.hookTitle || "臨時要用電，最怕充電速度跟不上。";
    feature = /快充/.test(source)
      ? "商品名稱標示快充設計。"
      : "可以先看商品頁標示的充電規格。";
  } else {
    return null;
  }

  const body = `${hook}${feature}${proof}`.trim();
  const direct = `${body}${cta}${link ? `\n${link}` : ""}`.trim();
  const instagram = `${body}商品資訊看個人檔案連結。`.trim();
  const tiktok = rxvEnsureTikTokAffiliateLink(
    body,
    link,
  );
  const shorts = `${body}商品資訊看頻道首頁或說明。`.trim();

  return {
    category: angle.category,
    shortTitle,
    shortDescription: `${body}${cta}${link ? ` ${link}` : ""}`.trim(),
    fullPost: direct,
    keywords: hashtags.replace(/#/g, "").replace(/\s+/g, ","),
    hashtags,
    facebookPost: direct,
    instagramCaption: instagram,
    tiktokCaption: tiktok,
    youtubeShortsTitle: shortTitle || plan.hookTitle || "",
    youtubeShortsDescription: shorts,
    youtubeVideoTitle: shortTitle || "",
    youtubeVideoDescription: direct,
    threadsPost: direct,
    xPost: direct,
  };
}

function rxvFinalPublishGuardText(value = "", title = "", affiliateUrl = "") {
  const source = String(title || "");
  const link = String(affiliateUrl || "").trim();

  let text = String(value || "")
    .replace(/\[affiliateUrl\]/gi, link)
    .replace(/\{\{\s*affiliateUrl\s*\}\}/gi, link)
    .replace(/\$\{\s*affiliateUrl\s*\}/gi, link);

  text = rxvSafeClaimReplace(text, source);

  const socialProofRules = [
    /很多人最怕/g,
    /很多人(?:都)?(?:推薦|喜歡|選擇|購買|使用)/g,
    /大家(?:都)?(?:推薦|喜歡|選擇|購買|使用)/g,
    /網友(?:都)?(?:推薦|激推)/g,
  ];
  for (const rule of socialProofRules) {
    text = text.replace(rule, "");
  }

  if (!/(優惠|折扣|特價|促銷|優惠券|折價)/.test(source)) {
    text = text
      .replace(/規格與優惠/g, "完整商品資訊")
      .replace(/優惠資訊/g, "商品資訊")
      .replace(/優惠/g, "");
  }

  if (/(枕|枕頭|寢具|床墊|睡眠|護頸)/.test(source)) {
    text = text
      .replace(/睡眠好物[｜|]*/g, "")
      .replace(/舒適支撐先看\d+項/g, "")
      .replace(/睡感更舒適/g, "")
      .replace(/睡起來更舒適/g, "")
      .replace(/支撐更穩定/g, "")
      .replace(/更穩定的支撐/g, "")
      .replace(/支撐力更好/g, "");
  }

  text = rxvRemoveUnsupportedPublishEffects(text);
  text = rxvCleanFinalPublishText(text);

  return text
    .replace(/\s{2,}/g, " ")
    .replace(/。{2,}/g, "。")
    .replace(/，。/g, "。")
    .replace(/^[｜|，。；：\s]+/g, "")
    .trim();
}

function rxvValidatePublishPayload(payload = {}, title = "") {
  const source = String(title || "");
  const haystack = JSON.stringify(payload || {});
  const issues = [];

  const rules = [
    [
      "PLACEHOLDER_LEFT",
      /\[affiliateUrl\]|\{\{\s*affiliateUrl\s*\}\}|\$\{\s*affiliateUrl\s*\}/i,
    ],
    [
      "UNSUPPORTED_SOCIAL_PROOF",
      /很多人(?:都)?(?:推薦|喜歡|選擇|購買|使用)|大家(?:都)?(?:推薦|喜歡|選擇|購買|使用)|大家都在|網友(?:都)?(?:推薦|激推)/,
    ],
    [
      "UNSUPPORTED_SLEEP_EFFECT",
      /睡感更舒適|睡起來更舒適|支撐更穩定|改善睡眠|提升睡眠品質|支撐肩頸|肩頸痠痛/,
    ],
    [
      "UNSUPPORTED_HYPE",
      /爆款|超夯|很夯|銷量第一|保證好吃|一吃上癮|立即搶購|手刀下單/,
    ],
  ];

  for (const [code, pattern] of rules) {
    if (pattern.test(haystack)) issues.push(code);
  }

  if (
    !/(優惠|折扣|特價|促銷|優惠券|折價)/.test(source) &&
    /優惠/.test(haystack)
  ) {
    issues.push("UNSUPPORTED_PROMOTION");
  }

  return {
    ok: issues.length === 0,
    guardVersion: "v37.14",
    issues: [...new Set(issues)],
  };
}

function rxvBuildPublishPayload({
  title,
  videoPath,
  affiliateUrl,
  platformCopy,
  selectedPlatforms,
}) {
  const selected = normalizeRequestedPlatforms(selectedPlatforms);
  const genericHashtags = rxvNormalizeHashtagText(
    platformCopy?.genericHashtags || "",
  );

  const facebookTags = rxvNormalizeHashtagText(
    platformCopy?.facebookHashtags || genericHashtags,
  );
  const instagramTags = rxvNormalizeHashtagText(
    platformCopy?.instagramHashtags || genericHashtags,
  );
  const tiktokTags = rxvNormalizeHashtagText(
    platformCopy?.tiktokHashtags || genericHashtags,
  );
  const youtubeTags = rxvNormalizeHashtagText(
    platformCopy?.youtubeHashtags || genericHashtags,
  );

  const payload = {
    version: "v37.14",
    generatedAt: sqliteNow(),
    productTitle: String(title || "").trim(),
    affiliateUrl: String(affiliateUrl || "").trim(),
    videoPath: String(videoPath || ""),
    videoFilename: path.basename(String(videoPath || "")),
    selectedPlatforms: selected,
    copySource: String(platformCopy?.copySource || ""),
    platforms: {
      facebook: {
        enabled: selected.includes("facebook"),
        body: rxvCleanFinalPublishText(platformCopy?.facebookPost || ""),
        hashtags: facebookTags,
        publishText: rxvComposePublishText(
          platformCopy?.facebookPost || "",
          facebookTags,
        ),
        affiliateLinkMode: "direct",
      },
      instagram: {
        enabled: selected.includes("instagram"),
        caption: rxvCleanFinalPublishText(
          platformCopy?.instagramCaption || "",
        ),
        hashtags: instagramTags,
        publishText: rxvComposePublishText(
          platformCopy?.instagramCaption || "",
          instagramTags,
        ),
        affiliateLinkMode: "profile",
      },
      tiktok: {
        enabled: selected.includes("tiktok"),
        caption: rxvEnsureTikTokPublishText({
          value:
            platformCopy?.tiktokCaption || "",
          affiliateUrl,
          hashtags: tiktokTags,
          title,
        }),
        hashtags: tiktokTags,
        publishText: rxvEnsureTikTokPublishText({
          value:
            platformCopy?.tiktokCaption || "",
          affiliateUrl,
          hashtags: tiktokTags,
          title,
        }),
        affiliateLinkMode: "direct_text",
      },
      youtube_shorts: {
        enabled: selected.includes("youtube_shorts"),
        title: rxvCleanFinalPublishText(
          platformCopy?.youtubeShortsTitle || "",
        ),
        description: rxvCleanFinalPublishText(
          platformCopy?.youtubeShortsDescription || "",
        ),
        hashtags: youtubeTags,
        publishDescription: rxvComposePublishText(
          platformCopy?.youtubeShortsDescription || "",
          youtubeTags,
        ),
        affiliateLinkMode: "channel_home_or_description",
      },
      youtube_video: {
        enabled: selected.includes("youtube_video"),
        title: rxvCleanFinalPublishText(
          platformCopy?.youtubeVideoTitle || "",
        ),
        description: rxvCleanFinalPublishText(
          platformCopy?.youtubeVideoDescription || "",
        ),
        hashtags: youtubeTags,
        publishDescription: rxvComposePublishText(
          platformCopy?.youtubeVideoDescription || "",
          youtubeTags,
        ),
        affiliateLinkMode: "direct",
      },
      threads: {
        enabled: selected.includes("threads"),
        body: rxvCleanFinalPublishText(platformCopy?.threadsPost || ""),
        hashtags: genericHashtags,
        publishText: rxvComposePublishText(
          platformCopy?.threadsPost || "",
          genericHashtags,
        ),
        affiliateLinkMode: "direct",
      },
      x: {
        enabled: selected.includes("x"),
        body: rxvCleanFinalPublishText(platformCopy?.xPost || ""),
        hashtags: genericHashtags,
        publishText: rxvComposePublishText(
          platformCopy?.xPost || "",
          genericHashtags,
        ),
        affiliateLinkMode: "direct",
      },
    },
  };

  payload.safety = rxvValidatePublishPayload(payload, title);
  return payload;
}


function materializePlatformCopy(script, affiliateUrl, title = "") {
  const grounded = rxvBuildGroundedPublishProfile(title, affiliateUrl);
  const hashtags = rxvNormalizeHashtagText(
    firstNonEmpty(script?.hashtags, rxvBuildGroundedHashtags(title)),
  );
  const facebookHashtags = rxvNormalizeHashtagText(
    firstNonEmpty(script?.facebookHashtags, hashtags),
  );
  const instagramHashtags = rxvNormalizeHashtagText(
    firstNonEmpty(script?.instagramHashtags, hashtags),
  );
  const tiktokHashtags = rxvNormalizeHashtagText(
    firstNonEmpty(script?.tiktokHashtags, hashtags),
  );
  const youtubeHashtags = rxvNormalizeHashtagText(
    firstNonEmpty(script?.youtubeHashtags, hashtags),
  );

  if (grounded) {
    return {
      facebookPost: rxvFinalPublishGuardText(
        grounded.facebookPost,
        title,
        affiliateUrl,
      ),
      instagramCaption: rxvFinalPublishGuardText(
        grounded.instagramCaption,
        title,
        "",
      ),
      tiktokCaption: rxvEnsureTikTokAffiliateLink(
        rxvFinalPublishGuardText(
          grounded.tiktokCaption,
          title,
          affiliateUrl,
        ),
        affiliateUrl,
      ),
      youtubeShortsTitle: rxvFinalPublishGuardText(
        grounded.youtubeShortsTitle,
        title,
        "",
      ),
      youtubeShortsDescription: rxvFinalPublishGuardText(
        grounded.youtubeShortsDescription,
        title,
        "",
      ),
      youtubeVideoTitle: rxvFinalPublishGuardText(
        grounded.youtubeVideoTitle,
        title,
        "",
      ),
      youtubeVideoDescription: rxvFinalPublishGuardText(
        grounded.youtubeVideoDescription,
        title,
        affiliateUrl,
      ),
      threadsPost: rxvFinalPublishGuardText(
        grounded.threadsPost,
        title,
        affiliateUrl,
      ),
      xPost: rxvFinalPublishGuardText(
        grounded.xPost,
        title,
        affiliateUrl,
      ),
      facebookHashtags,
      instagramHashtags,
      tiktokHashtags,
      youtubeHashtags,
      genericHashtags: hashtags,
      copySource: "grounded-title-profile",
    };
  }

  const instagramCaption = rxvEnsurePlatformCta(
    rxvStripPlatformLinks(script?.instagramCaption, affiliateUrl),
    "商品資訊看個人檔案連結。",
  );
  const tiktokCaption = rxvEnsureTikTokAffiliateLink(
    materializeAffiliatePlaceholder(
      script?.tiktokCaption,
      affiliateUrl,
    ),
    affiliateUrl,
  );
  const shortsDescription = rxvEnsurePlatformCta(
    rxvStripPlatformLinks(script?.youtubeShortsDescription, affiliateUrl),
    "商品資訊看頻道首頁或說明。",
  );

  return {
    facebookPost: rxvFinalPublishGuardText(
      materializeAffiliatePlaceholder(script?.facebookPost, affiliateUrl),
      title,
      affiliateUrl,
    ),
    instagramCaption: rxvFinalPublishGuardText(
      instagramCaption,
      title,
      "",
    ),
    tiktokCaption: rxvEnsureTikTokAffiliateLink(
      rxvFinalPublishGuardText(
        tiktokCaption,
        title,
        affiliateUrl,
      ),
      affiliateUrl,
    ),
    youtubeShortsTitle: rxvFinalPublishGuardText(
      script?.youtubeShortsTitle || "",
      title,
      "",
    ),
    youtubeShortsDescription: rxvFinalPublishGuardText(
      shortsDescription,
      title,
      "",
    ),
    youtubeVideoTitle: rxvFinalPublishGuardText(
      script?.youtubeVideoTitle || "",
      title,
      "",
    ),
    youtubeVideoDescription: rxvFinalPublishGuardText(
      materializeAffiliatePlaceholder(
        script?.youtubeVideoDescription,
        affiliateUrl,
      ),
      title,
      affiliateUrl,
    ),
    threadsPost: rxvFinalPublishGuardText(
      materializeAffiliatePlaceholder(script?.threadsPost, affiliateUrl),
      title,
      affiliateUrl,
    ),
    xPost: rxvFinalPublishGuardText(
      materializeAffiliatePlaceholder(script?.xPost, affiliateUrl),
      title,
      affiliateUrl,
    ),
    facebookHashtags,
    instagramHashtags,
    tiktokHashtags,
    youtubeHashtags,
    genericHashtags: hashtags,
    copySource: "ai-final-guarded",
  };
}


const PLATFORM_COLUMNS = {
  facebook: {
    status: "facebook_status",
    url: "facebook_url",
    error: "facebook_error",
    publishedAt: "facebook_published_at",
  },
  instagram: {
    status: "instagram_status",
    url: "instagram_url",
    error: "instagram_error",
    publishedAt: "instagram_published_at",
  },
  tiktok: {
    status: "tiktok_status",
    url: "tiktok_url",
    error: "tiktok_error",
    publishedAt: "tiktok_published_at",
  },
  youtube_shorts: {
    status: "youtube_shorts_status",
    url: "youtube_shorts_url",
    error: "youtube_shorts_error",
    publishedAt: "youtube_shorts_published_at",
  },
  youtube_video: {
    status: "youtube_video_status",
    url: "youtube_video_url",
    error: "youtube_video_error",
    publishedAt: "youtube_video_published_at",
  },
  threads: {
    status: "threads_status",
    url: "threads_url",
    error: "threads_error",
    publishedAt: "threads_published_at",
  },
  x: {
    status: "x_status",
    url: "x_url",
    error: "x_error",
    publishedAt: "x_published_at",
  },
};

function normalizePlatformName(value) {
  const raw = String(value || "").trim().toLowerCase();
  const aliases = {
    fb: "facebook",
    facebook: "facebook",
    ig: "instagram",
    instagram: "instagram",
    reels: "instagram",
    tiktok: "tiktok",
    tik_tok: "tiktok",
    ytshorts: "youtube_shorts",
    youtube_shorts: "youtube_shorts",
    "youtube-shorts": "youtube_shorts",
    shorts: "youtube_shorts",
    youtube: "youtube_video",
    youtube_video: "youtube_video",
    "youtube-video": "youtube_video",
    youtubelong: "youtube_video",
    threads: "threads",
    thread: "threads",
    x: "x",
    twitter: "x",
  };
  return aliases[raw] || "";
}

function getPlatformStatuses(record) {
  if (!record) return {};
  const result = {};
  for (const [platform, columns] of Object.entries(PLATFORM_COLUMNS)) {
    result[platform] = String(record?.[columns.status] || "not_published");
  }
  return result;
}

function computeAggregatePublishStatus(record) {
  const statuses = Object.values(getPlatformStatuses(record));
  if (!statuses.length) return "not_published";
  if (statuses.every((x) => x === "published")) return "published";
  if (statuses.some((x) => x === "publishing")) return "publishing";
  if (statuses.some((x) => x === "queued")) return "queued";
  if (
    statuses.some((x) => x === "published") &&
    statuses.some((x) => x !== "published")
  ) {
    return "partial";
  }
  if (statuses.some((x) => x === "failed")) return "failed";
  return "not_published";
}



const metaConnectionCache = {
  verifiedAt: "",
  facebook: {
    connected: false,
    pageId: "",
    pageName: "",
    error: "",
  },
  instagram: {
    connected: false,
    igUserId: "",
    username: "",
    error: "",
  },
};

const publisherDispatchLocks = new Set();
let publisherSchedulerTicking = false;

function hasMetaFacebookConfig() {
  return Boolean(META_PAGE_ID && META_PAGE_ACCESS_TOKEN);
}

function hasR2MetaConfig() {
  return Boolean(
    RXV_R2_ACCOUNT_ID &&
      RXV_R2_ACCESS_KEY_ID &&
      RXV_R2_SECRET_ACCESS_KEY &&
      RXV_R2_BUCKET &&
      RXV_R2_PUBLIC_BASE_URL,
  );
}

function hasMetaInstagramConfig() {
  return Boolean(
    META_PAGE_ACCESS_TOKEN &&
      (META_IG_USER_ID || META_PAGE_ID),
  );
}

function sanitizeExternalError(error) {
  const status = Number(
    error?.response?.status ||
      error?.status ||
      0,
  );
  const data = error?.response?.data;
  const metaError = data?.error;
  const message = String(
    metaError?.message ||
      data?.message ||
      error?.message ||
      "Unknown external API error",
  )
    .replace(META_PAGE_ACCESS_TOKEN, "[TOKEN]")
    .replace(RXV_R2_SECRET_ACCESS_KEY, "[R2_SECRET]")
    .slice(0, 1500);

  const code = String(
    metaError?.code ||
      metaError?.error_subcode ||
      error?.code ||
      "",
  );

  return {
    status,
    code,
    message,
  };
}

function metaGraphUrl(pathname = "") {
  const clean = String(pathname || "").replace(/^\/+/, "");
  return `https://graph.facebook.com/${META_GRAPH_VERSION}/${clean}`;
}

async function metaGraphGet(pathname, params = {}) {
  return axios.get(metaGraphUrl(pathname), {
    params: {
      ...params,
      access_token: META_PAGE_ACCESS_TOKEN,
    },
    timeout: META_HTTP_TIMEOUT_MS,
    maxRedirects: 3,
  });
}

async function metaGraphPost(pathname, fields = {}) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields || {})) {
    if (value == null) continue;
    body.set(key, String(value));
  }
  body.set("access_token", META_PAGE_ACCESS_TOKEN);

  return axios.post(metaGraphUrl(pathname), body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: META_HTTP_TIMEOUT_MS,
    maxRedirects: 3,
  });
}

async function resolveMetaInstagramIdentity() {
  if (META_IG_USER_ID) {
    try {
      const response = await metaGraphGet(META_IG_USER_ID, {
        fields: "id,username",
      });
      return {
        id: String(response?.data?.id || META_IG_USER_ID),
        username: String(response?.data?.username || ""),
      };
    } catch {
      return {
        id: META_IG_USER_ID,
        username: "",
      };
    }
  }

  if (!META_PAGE_ID) {
    return { id: "", username: "" };
  }

  const response = await metaGraphGet(META_PAGE_ID, {
    fields: "instagram_business_account{id,username}",
  });
  const ig = response?.data?.instagram_business_account || {};
  return {
    id: String(ig?.id || ""),
    username: String(ig?.username || ""),
  };
}

async function verifyMetaConnections() {
  const result = {
    ok: true,
    graphVersion: META_GRAPH_VERSION,
    verifiedAt: sqliteNow(),
    facebook: {
      configured: hasMetaFacebookConfig(),
      connected: false,
      pageId: META_PAGE_ID,
      pageName: "",
      error: "",
    },
    instagram: {
      configured: hasMetaInstagramConfig(),
      connected: false,
      igUserId: META_IG_USER_ID,
      username: "",
      r2Configured: false,
      uploadMode: "meta-resumable-local",
      cloudStagingUsed: false,
      error: "",
    },
  };

  if (hasMetaFacebookConfig()) {
    try {
      const page = await metaGraphGet(META_PAGE_ID, {
        fields: "id,name",
      });
      result.facebook.connected = Boolean(page?.data?.id);
      result.facebook.pageId = String(page?.data?.id || META_PAGE_ID);
      result.facebook.pageName = String(page?.data?.name || "");
    } catch (error) {
      const safe = sanitizeExternalError(error);
      result.ok = false;
      result.facebook.error = safe.message;
    }
  }

  if (hasMetaInstagramConfig()) {
    try {
      const ig = await resolveMetaInstagramIdentity();
      if (!ig.id) {
        throw new Error(
          "找不到 Instagram 專業帳號 ID。請確認 Facebook Page 已連結 Instagram 專業帳號，或設定 META_IG_USER_ID。",
        );
      }

      const profile = await metaGraphGet(ig.id, {
        fields: "id,username",
      });

      result.instagram.connected = Boolean(profile?.data?.id);
      result.instagram.igUserId = String(profile?.data?.id || ig.id);
      result.instagram.username = String(
        profile?.data?.username || ig.username || "",
      );
    } catch (error) {
      const safe = sanitizeExternalError(error);
      result.ok = false;
      result.instagram.error = safe.message;
    }
  }

  metaConnectionCache.verifiedAt = result.verifiedAt;
  metaConnectionCache.facebook = {
    connected: result.facebook.connected,
    pageId: result.facebook.pageId,
    pageName: result.facebook.pageName,
    error: result.facebook.error,
  };
  metaConnectionCache.instagram = {
    connected: result.instagram.connected,
    igUserId: result.instagram.igUserId,
    username: result.instagram.username,
    error: result.instagram.error,
  };

  return result;
}

function metaPublicStatus() {
  return {
    graphVersion: META_GRAPH_VERSION,
    secretsExposed: false,
    facebook: {
      configured: hasMetaFacebookConfig(),
      connected: Boolean(metaConnectionCache.facebook.connected),
      pageId: META_PAGE_ID || metaConnectionCache.facebook.pageId || "",
      pageName: metaConnectionCache.facebook.pageName || "",
      token: META_PAGE_ACCESS_TOKEN ? "present-not-exposed" : "missing",
      error: metaConnectionCache.facebook.error || "",
    },
    instagram: {
      configured: hasMetaInstagramConfig(),
      connected: Boolean(metaConnectionCache.instagram.connected),
      igUserId:
        META_IG_USER_ID ||
        metaConnectionCache.instagram.igUserId ||
        "",
      username: metaConnectionCache.instagram.username || "",
      r2Configured: false,
      uploadMode: "meta-resumable-local",
      cloudStagingUsed: false,
      error: metaConnectionCache.instagram.error || "",
    },
    r2: {
      configured: false,
      usedByInstagram: false,
      mode: "disabled-zero-cost",
      note:
        "V38.4.11 Instagram 預設直接上傳 Meta resumable API，不使用 R2 暫存。",
    },
    verifiedAt: metaConnectionCache.verifiedAt || "",
  };
}

function hmacSha256(key, data, encoding = undefined) {
  return crypto
    .createHmac("sha256", key)
    .update(data)
    .digest(encoding);
}

function encodeR2KeyPath(key) {
  return String(key || "")
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function r2SignedRequest({
  method,
  objectKey,
  body = Buffer.alloc(0),
  contentType = "",
}) {
  if (!hasR2MetaConfig()) {
    throw new Error("R2_META_CONFIG_MISSING");
  }

  const host =
    `${RXV_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri =
    `/${encodeURIComponent(RXV_R2_BUCKET)}/${encodeR2KeyPath(objectKey)}`;

  const now = new Date();
  const amzDate = now
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = crypto
    .createHash("sha256")
    .update(body)
    .digest("hex");

  const signedHeaderNames = contentType
    ? "content-type;host;x-amz-content-sha256;x-amz-date"
    : "host;x-amz-content-sha256;x-amz-date";

  const canonicalHeaders = contentType
    ? `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
    : `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaderNames,
    payloadHash,
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope =
    `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto
      .createHash("sha256")
      .update(canonicalRequest)
      .digest("hex"),
  ].join("\n");

  const kDate = hmacSha256(
    Buffer.from(`AWS4${RXV_R2_SECRET_ACCESS_KEY}`, "utf8"),
    dateStamp,
  );
  const kRegion = hmacSha256(kDate, "auto");
  const kService = hmacSha256(kRegion, "s3");
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = hmacSha256(
    kSigning,
    stringToSign,
    "hex",
  );

  const authorization =
    `${algorithm} Credential=${RXV_R2_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaderNames}, Signature=${signature}`;

  const headers = {
    Host: host,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
    Authorization: authorization,
  };
  if (contentType) headers["Content-Type"] = contentType;
  if (method === "PUT") {
    headers["Content-Length"] = String(body.length);
  }

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        method,
        hostname: host,
        path: canonicalUri,
        headers,
        timeout: META_HTTP_TIMEOUT_MS,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          const statusCode = Number(response.statusCode || 0);
          if (statusCode >= 200 && statusCode < 300) {
            resolve({
              ok: true,
              statusCode,
              body: responseBody,
            });
            return;
          }
          reject(
            new Error(
              `R2_${method}_FAILED_${statusCode}: ${responseBody.slice(0, 500)}`,
            ),
          );
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("R2_REQUEST_TIMEOUT"));
    });
    request.on("error", reject);

    if (body.length) request.write(body);
    request.end();
  });
}

async function uploadVideoToR2ForMeta(videoPath) {
  const data = await fsp.readFile(videoPath);
  const day = new Date().toISOString().slice(0, 10);
  const objectKey =
    `${META_STAGING_PREFIX}/${day}/${Date.now()}-` +
    `${crypto.randomUUID()}.mp4`;

  await r2SignedRequest({
    method: "PUT",
    objectKey,
    body: data,
    contentType: "video/mp4",
  });

  const publicUrl =
    `${RXV_R2_PUBLIC_BASE_URL}/${encodeR2KeyPath(objectKey)}`;

  return {
    objectKey,
    publicUrl,
    size: data.length,
  };
}

async function deleteR2MetaObject(objectKey) {
  if (!objectKey || !hasR2MetaConfig()) return;
  await r2SignedRequest({
    method: "DELETE",
    objectKey,
    body: Buffer.alloc(0),
  });
}

function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function publishFacebookReel({
  videoPath,
  publishText,
}) {
  if (!hasMetaFacebookConfig()) {
    throw new Error("META_FACEBOOK_CONFIG_MISSING");
  }

  const stat = await fsp.stat(videoPath);
  if (!stat.isFile() || stat.size <= 0) {
    throw new Error("VIDEO_FILE_INVALID");
  }

  const startResponse = await metaGraphPost(
    `${META_PAGE_ID}/video_reels`,
    {
      upload_phase: "start",
    },
  );

  const videoId = String(
    startResponse?.data?.video_id || "",
  );
  const uploadUrl = String(
    startResponse?.data?.upload_url || "",
  );
  if (!videoId || !uploadUrl) {
    throw new Error("META_FACEBOOK_REELS_START_FAILED");
  }

  await axios.post(uploadUrl, fs.createReadStream(videoPath), {
    headers: {
      Authorization: `OAuth ${META_PAGE_ACCESS_TOKEN}`,
      offset: "0",
      file_size: String(stat.size),
      "Content-Type": "application/octet-stream",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: META_HTTP_TIMEOUT_MS,
    maxRedirects: 3,
  });

  const finishResponse = await metaGraphPost(
    `${META_PAGE_ID}/video_reels`,
    {
      upload_phase: "finish",
      video_id: videoId,
      video_state: "PUBLISHED",
      description: String(publishText || "").trim(),
    },
  );

  if (finishResponse?.data?.success !== true) {
    throw new Error("META_FACEBOOK_REELS_FINISH_FAILED");
  }

  let permalink = "";
  try {
    await sleepMs(2500);
    const detail = await metaGraphGet(videoId, {
      fields: "id,permalink_url,status",
    });
    permalink = String(detail?.data?.permalink_url || "");
  } catch {}

  return {
    remotePostId: videoId,
    publishedUrl: permalink,
    providerResponse: {
      success: true,
      videoId,
    },
  };
}

async function waitForInstagramContainer(containerId) {
  const deadline = Date.now() + 5 * 60 * 1000;
  let last = null;

  while (Date.now() < deadline) {
    const response = await metaGraphGet(containerId, {
      fields: "id,status_code,status",
    });
    last = response?.data || {};
    const code = String(last?.status_code || "").toUpperCase();

    if (code === "FINISHED" || code === "PUBLISHED") {
      return last;
    }
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(
        `INSTAGRAM_CONTAINER_${code}: ${String(last?.status || "")}`,
      );
    }
    await sleepMs(5000);
  }

  throw new Error(
    `INSTAGRAM_CONTAINER_TIMEOUT: ${JSON.stringify(last || {})}`,
  );
}

async function uploadInstagramVideoResumable({
  creationId,
  uploadUri,
  videoPath,
}) {
  const stat = await fsp.stat(videoPath);
  if (!stat.isFile() || stat.size <= 0) {
    throw new Error("VIDEO_FILE_INVALID");
  }

  const uri =
    String(uploadUri || "").trim() ||
    `https://rupload.facebook.com/ig-api-upload/${META_GRAPH_VERSION}/${creationId}`;

  const response = await axios.post(
    uri,
    fs.createReadStream(videoPath),
    {
      headers: {
        Authorization: `OAuth ${META_PAGE_ACCESS_TOKEN}`,
        offset: "0",
        file_size: String(stat.size),
        "Content-Type": "application/octet-stream",
        "Content-Length": String(stat.size),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: META_HTTP_TIMEOUT_MS,
      maxRedirects: 3,
    },
  );

  const ok =
    response?.status >= 200 &&
    response?.status < 300 &&
    response?.data?.success !== false;

  if (!ok) {
    throw new Error("INSTAGRAM_RESUMABLE_UPLOAD_FAILED");
  }

  return {
    ok: true,
    size: stat.size,
    uploadUri: uri,
  };
}

async function publishInstagramReel({
  videoPath,
  publishText,
}) {
  if (!hasMetaInstagramConfig()) {
    throw new Error("META_INSTAGRAM_CONFIG_MISSING");
  }

  const ig = await resolveMetaInstagramIdentity();
  if (!ig.id) {
    throw new Error("META_IG_USER_ID_NOT_FOUND");
  }

  const createResponse = await metaGraphPost(
    `${ig.id}/media`,
    {
      media_type: "REELS",
      upload_type: "resumable",
      caption: String(publishText || "").trim(),
      share_to_feed: "true",
    },
  );

  const creationId = String(
    createResponse?.data?.id || "",
  );
  const uploadUri = String(
    createResponse?.data?.uri || "",
  );

  if (!creationId) {
    throw new Error(
      "INSTAGRAM_REELS_RESUMABLE_CONTAINER_CREATE_FAILED",
    );
  }

  await uploadInstagramVideoResumable({
    creationId,
    uploadUri,
    videoPath,
  });

  await waitForInstagramContainer(creationId);

  const publishResponse = await metaGraphPost(
    `${ig.id}/media_publish`,
    {
      creation_id: creationId,
    },
  );

  const mediaId = String(
    publishResponse?.data?.id || "",
  );
  if (!mediaId) {
    throw new Error("INSTAGRAM_REELS_PUBLISH_FAILED");
  }

  let permalink = "";
  try {
    const detail = await metaGraphGet(mediaId, {
      fields: "id,permalink,media_type,media_product_type",
    });
    permalink = String(detail?.data?.permalink || "");
  } catch {}

  return {
    remotePostId: mediaId,
    publishedUrl: permalink,
    providerResponse: {
      success: true,
      mediaId,
      igUserId: ig.id,
      uploadMode: "meta-resumable-local",
      cloudStagingUsed: false,
    },
  };
}


function publisherDayStartIso() {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  return start.toISOString();
}

function getPublisherRateGuard(platform) {
  const db = getAffiliateDb();
  const setting = db
    .prepare(
      "SELECT * FROM publisher_settings WHERE platform = ?",
    )
    .get(platform);

  if (!setting || Number(setting.enabled || 0) !== 1) {
    return {
      allowed: false,
      reason: "PLATFORM_DISABLED",
      nextAllowedAt: "",
    };
  }

  const todayCount = Number(
    db.prepare(`
      SELECT COUNT(*) AS count
      FROM publisher_jobs
      WHERE platform = ?
        AND status = 'published'
        AND published_at >= ?
    `).get(platform, publisherDayStartIso())?.count || 0,
  );

  const dailyLimit = Math.min(
    platform === "tiktok" ? 14 : Number.MAX_SAFE_INTEGER,
    Math.max(
      1,
      Number(setting.daily_limit || 1),
    ),
  );
  if (todayCount >= dailyLimit) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 5, 0);
    return {
      allowed: false,
      reason: "DAILY_LIMIT_GUARD",
      nextAllowedAt: tomorrow.toISOString(),
      todayCount,
      dailyLimit,
    };
  }

  const lastPublished = String(
    setting.last_published_at || "",
  );
  const minIntervalMinutes = Math.max(
    5,
    Number(setting.min_interval_minutes || 5),
  );

  if (lastPublished) {
    const lastMs = Date.parse(lastPublished);
    if (Number.isFinite(lastMs)) {
      const nextMs =
        lastMs + minIntervalMinutes * 60 * 1000;
      if (Date.now() < nextMs) {
        return {
          allowed: false,
          reason: "MIN_INTERVAL_GUARD",
          nextAllowedAt: new Date(nextMs).toISOString(),
          todayCount,
          dailyLimit,
        };
      }
    }
  }

  return {
    allowed: true,
    reason: "",
    nextAllowedAt: "",
    todayCount,
    dailyLimit,
  };
}

function markAffiliatePlatformPublished(
  productKey,
  platform,
  publishedUrl,
) {
  const columns = PLATFORM_COLUMNS[platform];
  if (!columns) return;

  const now = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE affiliate_products
    SET ${columns.status} = 'published',
        ${columns.url} = ?,
        ${columns.error} = '',
        ${columns.publishedAt} = ?,
        updated_at = ?
    WHERE product_key = ?
  `).run(
    String(publishedUrl || ""),
    now,
    now,
    productKey,
  );

  const row = getAffiliateDb()
    .prepare(
      "SELECT * FROM affiliate_products WHERE product_key = ?",
    )
    .get(productKey);

  if (row) {
    getAffiliateDb().prepare(`
      UPDATE affiliate_products
      SET publish_status = ?, updated_at = ?
      WHERE product_key = ?
    `).run(
      computeAggregatePublishStatus(row),
      now,
      productKey,
    );
  }
}

async function dispatchApiPublisherJob(
  jobId,
  { source = "manual" } = {},
) {
  const numericId = Number(jobId || 0);
  if (!numericId) {
    return {
      ok: false,
      error: "PUBLISHER_JOB_ID_REQUIRED",
    };
  }

  if (publisherDispatchLocks.has(numericId)) {
    return {
      ok: false,
      error: "PUBLISHER_JOB_ALREADY_RUNNING",
    };
  }

  const row = getPublisherJobById(numericId);
  if (!row) {
    return {
      ok: false,
      error: "PUBLISHER_JOB_NOT_FOUND",
    };
  }

  const platform = String(row.platform || "");
  if (!["facebook", "instagram", "tiktok", "youtube_shorts", "youtube_video"].includes(platform)) {
    return {
      ok: false,
      error: "PUBLISHER_ADAPTER_NOT_CONNECTED",
      platform,
    };
  }

  const payload = safeParsePublishPayload(row);
  if (
    Number(row.publish_ready || 0) !== 1 ||
    payload?.safety?.ok !== true
  ) {
    return {
      ok: false,
      error: "PUBLISH_SAFETY_BLOCKED",
    };
  }

  const platformPayload =
    payload?.platforms?.[platform] || {};
  const publishText = String(
    platformPayload?.publishText ||
      platformPayload?.publishDescription ||
      platformPayload?.body ||
      platformPayload?.caption ||
      "",
  ).trim();

  const videoPath = String(row.video_path || "");
  if (!videoPath || !fs.existsSync(videoPath)) {
    return {
      ok: false,
      error: "VIDEO_FILE_NOT_FOUND",
    };
  }

  if (
    platform === "facebook" &&
    !hasMetaFacebookConfig()
  ) {
    return {
      ok: false,
      error: "META_FACEBOOK_CONFIG_MISSING",
    };
  }
  if (
    platform === "instagram" &&
    !hasMetaInstagramConfig()
  ) {
    return {
      ok: false,
      error: "META_INSTAGRAM_CONFIG_MISSING",
    };
  }
  if (["youtube_shorts", "youtube_video"].includes(platform) && !hasYouTubeClientConfig()) {
    return { ok: false, error: "YOUTUBE_CLIENT_CONFIG_MISSING" };
  }
  if (["youtube_shorts", "youtube_video"].includes(platform) && !hasYouTubeStoredAuthorization()) {
    return { ok: false, error: "YOUTUBE_OAUTH_REQUIRED" };
  }
  if (platform === "tiktok" && !tiktokOfficial.hasClientConfig()) {
    return { ok: false, error: "TIKTOK_CLIENT_CONFIG_MISSING" };
  }
  if (platform === "tiktok" && !tiktokOfficial.hasStoredAuthorization()) {
    return { ok: false, error: "TIKTOK_OAUTH_REQUIRED" };
  }
  if (platform === "tiktok" && String(source || "") !== "manual") {
    return {
      ok: false,
      deferred: true,
      error: "TIKTOK_EXPLICIT_CONSENT_REQUIRED",
      message: "TikTok 官方 Content Posting API 預設只由使用者手動按立即發布觸發。",
    };
  }

  const guard = getPublisherRateGuard(platform);
  const rotationYouTubeShorts =
    platform === "youtube_shorts" &&
    String(source || "") === "rotation";
  const bypassMinInterval =
    rotationYouTubeShorts &&
    guard.reason === "MIN_INTERVAL_GUARD";

  if (!guard.allowed && !bypassMinInterval) {
    const now = sqliteNow();
    if (guard.nextAllowedAt) {
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET next_attempt_at = ?, updated_at = ?
        WHERE id = ?
      `).run(guard.nextAllowedAt, now, numericId);
    }
    return {
      ok: false,
      deferred: true,
      error: guard.reason,
      nextAllowedAt: guard.nextAllowedAt,
      todayCount: guard.todayCount,
      dailyLimit: guard.dailyLimit,
    };
  }

  publisherDispatchLocks.add(numericId);
  const now = sqliteNow();

  try {
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'publishing',
          attempt_count = attempt_count + 1,
          last_error = '',
          updated_at = ?
      WHERE id = ?
    `).run(now, numericId);

    setAffiliatePlatformStatusByProductKey(
      row.product_key,
      platform,
      "publishing",
      "",
    );

    let published = null;
    if (platform === "facebook") {
      published = await publishFacebookReel({ videoPath, publishText });
    } else if (platform === "instagram") {
      published = await publishInstagramReel({ videoPath, publishText });
    } else if (platform === "tiktok") {
      published = await tiktokOfficial.publishPublisherJob({
        row,
        payload,
        publishText,
        source,
      });
    } else {
      published = await uploadYouTubeVideo({ row, platform });
    }


    if (platform === "tiktok" && published?.needsManualAction) {
      const manualAt = sqliteNow();
      const message = String(published?.message || "TIKTOK_UPLOAD_DRAFT_READY");
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET status = 'needs_manual_action',
            remote_post_id = ?,
            published_url = '',
            last_error = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        String(published?.remotePostId || ""),
        message,
        manualAt,
        numericId,
      );
      setAffiliatePlatformStatusByProductKey(
        row.product_key,
        platform,
        "queued",
        message,
      );
      return {
        ok: false,
        needsManualAction: true,
        source,
        platform,
        error: "TIKTOK_UPLOAD_DRAFT_READY",
        message,
        remotePostId: String(published?.remotePostId || ""),
        providerResponse: published?.providerResponse || null,
        job: publisherJobToApi(getPublisherJobById(numericId)),
      };
    }

    if (platform === "tiktok" && published?.processing) {
      const processingAt = sqliteNow();
      const message = String(published?.message || "TIKTOK_PROCESSING");
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET status = 'publishing',
            remote_post_id = ?,
            last_error = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        String(published?.remotePostId || ""),
        message,
        processingAt,
        numericId,
      );
      setAffiliatePlatformStatusByProductKey(
        row.product_key,
        platform,
        "publishing",
        message,
      );
      return {
        ok: false,
        deferred: true,
        source,
        platform,
        error: "TIKTOK_PROCESSING",
        message,
        remotePostId: String(published?.remotePostId || ""),
        providerResponse: published?.providerResponse || null,
        job: publisherJobToApi(getPublisherJobById(numericId)),
      };
    }
    const publishedAt = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'published',
          remote_post_id = ?,
          published_url = ?,
          last_error = '',
          published_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      String(published?.remotePostId || ""),
      String(published?.publishedUrl || ""),
      publishedAt,
      publishedAt,
      numericId,
    );

    getAffiliateDb().prepare(`
      UPDATE publisher_settings
      SET last_published_at = ?, updated_at = ?
      WHERE platform = ?
    `).run(
      publishedAt,
      publishedAt,
      platform,
    );

    markAffiliatePlatformPublished(
      row.product_key,
      platform,
      String(published?.publishedUrl || ""),
    );

    return {
      ok: true,
      source,
      platform,
      remotePostId: String(
        published?.remotePostId || "",
      ),
      publishedUrl: String(
        published?.publishedUrl || "",
      ),
      job: publisherJobToApi(
        getPublisherJobById(numericId),
      ),
    };
  } catch (error) {
    const safe = sanitizeExternalError(error);
    const failedAt = sqliteNow();

    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'failed',
          last_error = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      `${safe.code ? `${safe.code}: ` : ""}${safe.message}`,
      failedAt,
      numericId,
    );

    setAffiliatePlatformStatusByProductKey(
      row.product_key,
      platform,
      "failed",
      safe.message,
    );

    return {
      ok: false,
      error: platform === "tiktok" ? "TIKTOK_PUBLISH_FAILED" : platform.startsWith("youtube_") ? "YOUTUBE_PUBLISH_FAILED" : "META_PUBLISH_FAILED",
      platform,
      providerStatus: safe.status,
      providerCode: safe.code,
      message: safe.message,
      job: publisherJobToApi(
        getPublisherJobById(numericId),
      ),
    };
  } finally {
    publisherDispatchLocks.delete(numericId);
  }
}


async function dispatchPublisherJob(jobId, options = {}) {
  const row = getPublisherJobById(jobId);
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  const setting = getPublisherSettingRow(row.platform) || {};
  const adapterMode = String(
    setting.adapter_mode || browserSettingDefault(row.platform).adapterMode,
  ).toLowerCase();

  if (adapterMode === "off") {
    return { ok: false, error: "PUBLISHER_ADAPTER_DISABLED", platform: row.platform };
  }
  if (adapterMode === "extension") {
    return dispatchPublisherExtensionJob(jobId, options);
  }
  if (adapterMode === "browser") {
    return dispatchBrowserPublisherJob(jobId, options);
  }
  return dispatchApiPublisherJob(jobId, options);
}

async function runPublisherSchedulerTick() {
  if (publisherSchedulerTicking) return;
  publisherSchedulerTicking = true;

  try {
    syncPublisherJobsFromAffiliateDb();
    const db = getAffiliateDb();
    const nowIso = new Date().toISOString();

    const scheduled = db.prepare(`
      SELECT id, platform, product_key
      FROM publisher_jobs
      WHERE status = 'scheduled'
        AND platform IN ('facebook', 'instagram', 'tiktok', 'youtube_shorts', 'youtube_video', 'threads', 'x')
        AND scheduled_at IS NOT NULL
        AND scheduled_at <= ?
      ORDER BY scheduled_at ASC
      LIMIT 4
    `).all(nowIso);

    for (const item of scheduled) {
      if (String(item.platform || "") === "tiktok") {
        const dueAt = sqliteNow();
        const dueMessage = "TIKTOK_SCHEDULE_DUE_CONFIRM_REQUIRED";
        db.prepare(`
          UPDATE publisher_jobs
          SET status = 'needs_manual_action',
              next_attempt_at = NULL,
              last_error = ?,
              updated_at = ?
          WHERE id = ? AND status = 'scheduled'
        `).run(dueMessage, dueAt, item.id);
        setAffiliatePlatformStatusByProductKey(
          item.product_key,
          "tiktok",
          "queued",
          "排程時間已到，請按立即發布確認送出。",
        );
        continue;
      }

      const result = await dispatchPublisherJob(
        item.id,
        { source: "scheduled" },
      );

      if (result?.deferred && result?.nextAllowedAt) {
        db.prepare(`
          UPDATE publisher_jobs
          SET scheduled_at = ?,
              next_attempt_at = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          result.nextAllowedAt,
          result.nextAllowedAt,
          sqliteNow(),
          item.id,
        );
      }
    }

    const autoSettings = db.prepare(`
      SELECT platform
      FROM publisher_settings
      WHERE enabled = 1
        AND auto_publish = 1
        AND platform IN ('facebook', 'instagram', 'tiktok', 'youtube_shorts', 'youtube_video', 'threads', 'x')
        AND (adapter_mode != 'browser' OR browser_final_confirm = 0)
      ORDER BY platform
    `).all();

    for (const setting of autoSettings) {
      const platform = String(setting.platform || "");
      const blocked = db.prepare(`
        SELECT COUNT(*) AS count
        FROM publisher_jobs
        WHERE platform = ?
          AND status IN ('needs_manual_action', 'publishing')
      `).get(platform);

      if (Number(blocked?.count || 0) > 0) {
        continue;
      }

      const next = db.prepare(`
        SELECT id
        FROM publisher_jobs
        WHERE platform = ?
          AND status = 'queued'
        ORDER BY updated_at ASC
        LIMIT 1
      `).get(platform);

      if (next?.id) {
        await dispatchPublisherJob(
          next.id,
          { source: "auto" },
        );
      }
    }
  } catch (error) {
    console.warn(
      "[publisher-scheduler]",
      sanitizeExternalError(error),
    );
  } finally {
    publisherSchedulerTicking = false;
  }
}


const youtubeOauthStates = new Map();
const youtubeConnectionCache = {
  verifiedAt: "",
  authorized: false,
  channelId: "",
  channelTitle: "",
  error: "",
};

function hasYouTubeClientConfig() {
  return Boolean(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET && YOUTUBE_REDIRECT_URI);
}

function readYouTubeTokenStore() {
  try {
    if (!fs.existsSync(YOUTUBE_TOKEN_FILE)) return {};
    const parsed = JSON.parse(fs.readFileSync(YOUTUBE_TOKEN_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeYouTubeTokenStore(tokens = {}) {
  ensureDirSync(YOUTUBE_TOKEN_DIR);
  const safe = {
    access_token: String(tokens.access_token || ""),
    refresh_token: String(tokens.refresh_token || ""),
    token_type: String(tokens.token_type || "Bearer"),
    scope: String(tokens.scope || ""),
    expiry_date: Number(tokens.expiry_date || 0),
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(YOUTUBE_TOKEN_FILE, JSON.stringify(safe, null, 2), "utf8");
}

function clearYouTubeTokenStore() {
  try { if (fs.existsSync(YOUTUBE_TOKEN_FILE)) fs.unlinkSync(YOUTUBE_TOKEN_FILE); } catch {}
  youtubeConnectionCache.verifiedAt = "";
  youtubeConnectionCache.authorized = false;
  youtubeConnectionCache.channelId = "";
  youtubeConnectionCache.channelTitle = "";
  youtubeConnectionCache.error = "";
}

function hasYouTubeStoredAuthorization() {
  const store = readYouTubeTokenStore();
  return Boolean(
    store.refresh_token ||
      (store.access_token && Number(store.expiry_date || 0) > Date.now() + 30000),
  );
}

async function exchangeYouTubeOAuthCode(code) {
  const body = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    code: String(code || ""),
    grant_type: "authorization_code",
    redirect_uri: YOUTUBE_REDIRECT_URI,
  });
  const response = await axios.post(
    "https://oauth2.googleapis.com/token",
    body.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: YOUTUBE_HTTP_TIMEOUT_MS },
  );
  const prior = readYouTubeTokenStore();
  const data = response?.data || {};
  const store = {
    ...prior,
    access_token: String(data.access_token || ""),
    refresh_token: String(data.refresh_token || prior.refresh_token || ""),
    token_type: String(data.token_type || "Bearer"),
    scope: String(data.scope || prior.scope || ""),
    expiry_date: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  writeYouTubeTokenStore(store);
  return store;
}

async function refreshYouTubeAccessToken() {
  const prior = readYouTubeTokenStore();
  if (!prior.refresh_token) throw new Error("YOUTUBE_REFRESH_TOKEN_MISSING");
  const body = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    client_secret: YOUTUBE_CLIENT_SECRET,
    refresh_token: String(prior.refresh_token),
    grant_type: "refresh_token",
  });
  const response = await axios.post(
    "https://oauth2.googleapis.com/token",
    body.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: YOUTUBE_HTTP_TIMEOUT_MS },
  );
  const data = response?.data || {};
  const store = {
    ...prior,
    access_token: String(data.access_token || ""),
    token_type: String(data.token_type || prior.token_type || "Bearer"),
    scope: String(data.scope || prior.scope || ""),
    expiry_date: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  writeYouTubeTokenStore(store);
  return store;
}

async function getYouTubeAccessToken() {
  if (!hasYouTubeClientConfig()) throw new Error("YOUTUBE_CLIENT_CONFIG_MISSING");
  let store = readYouTubeTokenStore();
  if (store.access_token && Number(store.expiry_date || 0) > Date.now() + 60000) {
    return String(store.access_token);
  }
  store = await refreshYouTubeAccessToken();
  if (!store.access_token) throw new Error("YOUTUBE_ACCESS_TOKEN_MISSING");
  return String(store.access_token);
}

function buildYouTubeOAuthUrl() {
  if (!hasYouTubeClientConfig()) throw new Error("YOUTUBE_CLIENT_CONFIG_MISSING");
  const state = crypto.randomBytes(24).toString("hex");
  youtubeOauthStates.set(state, Date.now() + 10 * 60 * 1000);
  for (const [key, expiresAt] of youtubeOauthStates.entries()) {
    if (expiresAt < Date.now()) youtubeOauthStates.delete(key);
  }
  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: "code",
    scope: YOUTUBE_OAUTH_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function youtubeApiGet(pathname, params = {}) {
  const accessToken = await getYouTubeAccessToken();
  return axios.get(`https://www.googleapis.com/youtube/v3/${String(pathname || "").replace(/^\/+/, "")}`, {
    params,
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: YOUTUBE_HTTP_TIMEOUT_MS,
  });
}

async function verifyYouTubeConnection() {
  const result = {
    ok: true,
    configured: hasYouTubeClientConfig(),
    authorized: hasYouTubeStoredAuthorization(),
    redirectUri: YOUTUBE_REDIRECT_URI,
    privacyStatus: YOUTUBE_UPLOAD_PRIVACY,
    channelId: "",
    channelTitle: "",
    verifiedAt: new Date().toISOString(),
    error: "",
  };
  if (!result.configured) { result.ok = false; result.error = "YOUTUBE_CLIENT_CONFIG_MISSING"; return result; }
  if (!result.authorized) { result.ok = false; result.error = "YOUTUBE_OAUTH_REQUIRED"; return result; }
  try {
    const response = await youtubeApiGet("channels", { part: "id,snippet", mine: "true", maxResults: 1 });
    const channel = Array.isArray(response?.data?.items) ? response.data.items[0] : null;
    if (!channel?.id) throw new Error("YOUTUBE_CHANNEL_NOT_FOUND");
    result.channelId = String(channel.id);
    result.channelTitle = String(channel?.snippet?.title || "");
    youtubeConnectionCache.verifiedAt = result.verifiedAt;
    youtubeConnectionCache.authorized = true;
    youtubeConnectionCache.channelId = result.channelId;
    youtubeConnectionCache.channelTitle = result.channelTitle;
    youtubeConnectionCache.error = "";
  } catch (error) {
    const safe = sanitizeExternalError(error);
    result.ok = false;
    result.authorized = false;
    result.error = safe.message;
    youtubeConnectionCache.verifiedAt = result.verifiedAt;
    youtubeConnectionCache.authorized = false;
    youtubeConnectionCache.error = safe.message;
  }
  return result;
}

function youtubePublicStatus() {
  return {
    configured: hasYouTubeClientConfig(),
    authorized: hasYouTubeStoredAuthorization() && Boolean(youtubeConnectionCache.authorized),
    storedAuthorization: hasYouTubeStoredAuthorization(),
    clientId: YOUTUBE_CLIENT_ID ? "present-not-exposed" : "missing",
    clientSecret: YOUTUBE_CLIENT_SECRET ? "present-not-exposed" : "missing",
    redirectUri: YOUTUBE_REDIRECT_URI,
    privacyStatus: YOUTUBE_UPLOAD_PRIVACY,
    tokenStorage: "local-user-profile",
    tokenFile: YOUTUBE_TOKEN_FILE,
    cloudStagingUsed: false,
    channelId: youtubeConnectionCache.channelId || "",
    channelTitle: youtubeConnectionCache.channelTitle || "",
    verifiedAt: youtubeConnectionCache.verifiedAt || "",
    error: youtubeConnectionCache.error || "",
  };
}

function normalizeYouTubeTags(value = "") {
  return [...new Set(String(value || "").split(/\\s+/).map((x) => x.replace(/^#/, "").trim()).filter(Boolean))].slice(0, 15);
}

function buildYouTubeMetadata(row, payload, platform) {
  const p = payload?.platforms?.[platform] || {};
  const title = String(p?.title || row?.product_title || "RxV 商品短影音").trim().slice(0, 95);
  const description = String(p?.publishDescription || p?.description || p?.publishText || "").trim();
  return {
    snippet: {
      title: title || "RxV 商品短影音",
      description,
      tags: normalizeYouTubeTags(p?.hashtags || ""),
      categoryId: "22",
      defaultLanguage: "zh-TW",
      defaultAudioLanguage: "zh-TW",
    },
    status: {
      privacyStatus: YOUTUBE_UPLOAD_PRIVACY,
      selfDeclaredMadeForKids: false,
    },
  };
}

async function uploadYouTubeVideo({ row, platform }) {
  const accessToken = await getYouTubeAccessToken();
  const videoPath = String(row.video_path || "");
  if (!videoPath || !fs.existsSync(videoPath)) throw new Error("VIDEO_FILE_NOT_FOUND");
  const stat = await fsp.stat(videoPath);
  if (!stat.isFile() || stat.size <= 0) throw new Error("VIDEO_FILE_INVALID");
  const payload = safeParsePublishPayload(row);
  const metadata = buildYouTubeMetadata(row, payload, platform);
  const session = await axios.post(
    "https://www.googleapis.com/upload/youtube/v3/videos",
    metadata,
    {
      params: { uploadType: "resumable", part: "snippet,status" },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(stat.size),
        "X-Upload-Content-Type": "video/mp4",
      },
      timeout: YOUTUBE_HTTP_TIMEOUT_MS,
      validateStatus: (s) => s >= 200 && s < 400,
    },
  );
  const uploadUrl = String(session?.headers?.location || "");
  if (!uploadUrl) throw new Error("YOUTUBE_RESUMABLE_SESSION_MISSING_LOCATION");
  const uploaded = await axios.put(uploadUrl, fs.createReadStream(videoPath), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: YOUTUBE_HTTP_TIMEOUT_MS,
    validateStatus: (s) => s >= 200 && s < 500,
  });
  if (uploaded.status < 200 || uploaded.status >= 300) {
    const err = new Error(uploaded?.data?.error?.message || `YOUTUBE_UPLOAD_HTTP_${uploaded.status}`);
    err.response = uploaded;
    throw err;
  }
  const videoId = String(uploaded?.data?.id || "");
  if (!videoId) throw new Error("YOUTUBE_VIDEO_ID_MISSING");
  return {
    remotePostId: videoId,
    publishedUrl: `https://youtu.be/${videoId}`,
    providerResponse: {
      success: true,
      videoId,
      privacyStatus: YOUTUBE_UPLOAD_PRIVACY,
      platform,
      cloudStagingUsed: false,
    },
  };
}


let rxvBrowserContext = null;
let rxvBrowserStartedAt = "";
let rxvBrowserLastError = "";
let rxvBrowserLaunchPromise = null;
const rxvBrowserJobLocks = new Set();
const rxvBrowserPlatformLocks = new Set();

function loadPlaywrightCore() {
  try {
    return require("playwright-core");
  } catch (error) {
    const err = new Error(
      "PLAYWRIGHT_CORE_MISSING: 請重新執行 RUN_UPDATE_V38_4.bat，更新程式會自動安裝免費的 playwright-core。",
    );
    err.cause = error;
    throw err;
  }
}

function findEdgeExecutable() {
  const candidates = [
    normalizeEnvString(process.env.RXV_EDGE_EXE || ""),
    process.env["PROGRAMFILES(X86)"]
      ? path.join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe")
      : "",
    process.env.PROGRAMFILES
      ? path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe")
      : "",
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "Application", "msedge.exe")
      : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {}
  }
  return "";
}

function browserSettingDefault(platform) {
  if (["youtube_shorts", "youtube_video"].includes(platform)) {
    return { adapterMode: "api", browserFinalConfirm: true, browserVisibility: "private" };
  }

  if (platform === "tiktok") {
    return { adapterMode: "api", browserFinalConfirm: true, browserVisibility: "private" };
  }

  if (platform === "facebook") {
    return { adapterMode: "extension", browserFinalConfirm: true, browserVisibility: "private" };
  }

  if (["instagram", "threads", "x"].includes(platform)) {
    return { adapterMode: "browser", browserFinalConfirm: true, browserVisibility: "private" };
  }

  return { adapterMode: "off", browserFinalConfirm: true, browserVisibility: "private" };
}

function ensurePublisherBrowserColumns(db) {
  const columns = new Set(
    db.prepare("PRAGMA table_info(publisher_settings)").all().map((row) => String(row.name || "")),
  );
  const add = [];
  if (!columns.has("adapter_mode")) {
    add.push("ALTER TABLE publisher_settings ADD COLUMN adapter_mode TEXT NOT NULL DEFAULT 'api'");
  }
  if (!columns.has("browser_final_confirm")) {
    add.push("ALTER TABLE publisher_settings ADD COLUMN browser_final_confirm INTEGER NOT NULL DEFAULT 1");
  }
  if (!columns.has("browser_visibility")) {
    add.push("ALTER TABLE publisher_settings ADD COLUMN browser_visibility TEXT NOT NULL DEFAULT 'private'");
  }
  for (const sql of add) db.exec(sql);

  // V38.4.11 Hybrid routing:
  // YouTube must use official OAuth/API because Google blocks automated browser sign-in.
  for (const platform of ["youtube_shorts", "youtube_video"]) {
    db.prepare(`
      UPDATE publisher_settings
      SET adapter_mode = 'api',
          browser_final_confirm = 1,
          updated_at = ?
      WHERE platform = ?
    `).run(sqliteNow(), platform);
  }

  // V39: normal-Edge extension pilot for Facebook/TikTok.
  for (const platform of ["facebook"]) {
    db.prepare(`
      UPDATE publisher_settings
      SET adapter_mode = 'extension',
          updated_at = ?
      WHERE platform = ?
    `).run(sqliteNow(), platform);
  }

  // Keep Playwright only for the remaining browser adapters during the pilot.
  for (const platform of ["instagram", "threads", "x"]) {
    db.prepare(`
      UPDATE publisher_settings
      SET adapter_mode = 'browser',
          updated_at = ?
      WHERE platform = ?
    `).run(sqliteNow(), platform);
  }

  // One-time V38.4.11 migration for Facebook:
  // - Browser adapter
  // - AI disclosure will be required by the automation flow
  // - Auto publish ON
  // - Final manual-confirm OFF
  // - 5-minute minimum interval
  //
  // Use a local migration marker so later manual UI changes are not
  // overwritten on every server restart.
  db.exec(`
    CREATE TABLE IF NOT EXISTS publisher_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const fbAuto5MigrationKey = "v38.4.11-facebook-ai-auto5";
  const migrationDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(fbAuto5MigrationKey);

  if (!migrationDone) {
    const now = sqliteNow();
    db.prepare(`
      UPDATE publisher_settings
      SET adapter_mode = 'browser',
          browser_final_confirm = 0,
          min_interval_minutes = 5,
          auto_publish = 1,
          enabled = 1,
          updated_at = ?
      WHERE platform = 'facebook'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, 'done', ?)
    `).run(fbAuto5MigrationKey, now);
  }

  const finalPublishMigrationKey =
    "v38.4.11-facebook-final-publish-auto";
  const finalPublishMigrationDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(finalPublishMigrationKey);

  if (!finalPublishMigrationDone) {
    const now = sqliteNow();
    db.prepare(`
      UPDATE publisher_settings
      SET adapter_mode = 'browser',
          browser_final_confirm = 0,
          min_interval_minutes = 5,
          auto_publish = 1,
          enabled = 1,
          updated_at = ?
      WHERE platform = 'facebook'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, 'done', ?)
    `).run(finalPublishMigrationKey, now);
  }

  const reelVerifierResetKey =
    "v38.4.11-facebook-reel-identity-verifier-reset";
  const reelVerifierResetDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(reelVerifierResetKey);

  if (!reelVerifierResetDone) {
    const now = sqliteNow();
    const v46Migration = db.prepare(
      "SELECT updated_at FROM publisher_meta WHERE key = ?"
    ).get(fbAuto5MigrationKey);
    const cutoff = String(v46Migration?.updated_at || "");

    const suspectRows = db.prepare(`
      SELECT id, product_key
      FROM publisher_jobs
      WHERE platform = 'facebook'
        AND status = 'published'
        AND (
          ? = ''
          OR COALESCE(published_at, updated_at) >= ?
        )
    `).all(cutoff, cutoff);

    for (const suspect of suspectRows) {
      db.prepare(`
        UPDATE publisher_jobs
        SET status = 'needs_manual_action',
            remote_post_id = '',
            published_url = '',
            published_at = NULL,
            last_error = 'FACEBOOK_V38_4_6_REVERIFY_REQUIRED',
            updated_at = ?
        WHERE id = ?
      `).run(now, Number(suspect.id || 0));

      setAffiliatePlatformStatusByProductKey(
        String(suspect.product_key || ""),
        "facebook",
        "queued",
        "FACEBOOK_V38_4_6_REVERIFY_REQUIRED",
      );
    }

    db.prepare(`
      UPDATE publisher_settings
      SET last_published_at = NULL,
          updated_at = ?
      WHERE platform = 'facebook'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, ?, ?)
    `).run(
      reelVerifierResetKey,
      `reset:${suspectRows.length}`,
      now,
    );
  }

  // V38.5 Fast Monetization Mode:
  // Facebook is semi-auto assisted publishing:
  // RxV prepares everything, user clicks Facebook's final blue Publish.
  const fastMonetizationKey =
    "v38.5-fast-monetization-facebook-assist";
  const fastMonetizationDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(fastMonetizationKey);

  if (!fastMonetizationDone) {
    const now = sqliteNow();

    db.prepare(`
      UPDATE publisher_settings
      SET adapter_mode = 'browser',
          browser_final_confirm = 1,
          auto_publish = 0,
          enabled = 1,
          updated_at = ?
      WHERE platform = 'facebook'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, 'done', ?)
    `).run(
      fastMonetizationKey,
      now,
    );
  }

  // V38.6: one-video cross-platform rotation owns the sequence,
  // so scheduler Auto is disabled for the six rotation platforms.
  const rotationMigrationKey = "v38.6-cross-platform-rotation";
  const rotationMigrationDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(rotationMigrationKey);

  if (!rotationMigrationDone) {
    const now = sqliteNow();
    for (const platform of RXV_ROTATION_PLATFORMS) {
      db.prepare(`
        UPDATE publisher_settings
        SET auto_publish = 0,
            enabled = 1,
            browser_final_confirm = CASE
              WHEN ? = 'youtube_shorts' THEN browser_final_confirm
              ELSE 1
            END,
            updated_at = ?
        WHERE platform = ?
      `).run(platform, now, platform);
    }
    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (key, value, updated_at)
      VALUES (?, 'done', ?)
    `).run(rotationMigrationKey, now);
  }

  // V38.6.1: Instagram is temporarily paused because the account cannot log in.
  // Keep its jobs/data intact, but prevent manual/auto publishing until the user
  // chooses to re-enable Instagram later.
  const skipInstagramKey =
    "v38.6.1-skip-instagram-login";
  const skipInstagramDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(skipInstagramKey);

  if (!skipInstagramDone) {
    const now = sqliteNow();
    db.prepare(`
      UPDATE publisher_settings
      SET enabled = 0,
          auto_publish = 0,
          updated_at = ?
      WHERE platform = 'instagram'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, 'done', ?)
    `).run(skipInstagramKey, now);
  }

  // V39.0: TikTok is temporarily paused because Google blocks sign-in
  // inside the automation-controlled Edge profile. Keep jobs/data intact,
  // but disable publishing until the user chooses to restore TikTok later.
  const skipTikTokKey =
    "v38.6.3-skip-tiktok-google-login";
  const skipTikTokDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(skipTikTokKey);

  if (!skipTikTokDone) {
    const now = sqliteNow();
    db.prepare(`
      UPDATE publisher_settings
      SET enabled = 0,
          auto_publish = 0,
          updated_at = ?
      WHERE platform = 'tiktok'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, 'done', ?)
    `).run(skipTikTokKey, now);
  }

  // V39.0: normal Edge + extension. TikTok can be enabled again because
  // login happens in the user's ordinary Edge profile, not webdriver Edge.
  const publisherExtensionPilotKey =
    "v39.0-publisher-extension-facebook-tiktok";
  const publisherExtensionPilotDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(publisherExtensionPilotKey);

  if (!publisherExtensionPilotDone) {
    const now = sqliteNow();
    for (const platform of ["facebook"]) {
      db.prepare(`
        UPDATE publisher_settings
        SET enabled = 1,
            auto_publish = 0,
            adapter_mode = 'extension',
            browser_final_confirm = 1,
            updated_at = ?
        WHERE platform = ?
      `).run(now, platform);
    }

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (
        key, value, updated_at
      )
      VALUES (?, 'done', ?)
    `).run(publisherExtensionPilotKey, now);
  }

  // V40.0: TikTok official API replaces the Publisher Extension.
  // Keep auto_publish OFF because TikTok Content Posting requires explicit consent.
  const tiktokOfficialApiKey = "v40.0-tiktok-official-api";
  const tiktokOfficialApiDone = db.prepare(
    "SELECT value FROM publisher_meta WHERE key = ?"
  ).get(tiktokOfficialApiKey);

  if (!tiktokOfficialApiDone) {
    const now = sqliteNow();
    db.prepare(`
      UPDATE publisher_settings
      SET enabled = 1,
          auto_publish = 0,
          adapter_mode = 'api',
          browser_final_confirm = 1,
          updated_at = ?
      WHERE platform = 'tiktok'
    `).run(now);

    db.prepare(`
      INSERT OR REPLACE INTO publisher_meta (key, value, updated_at)
      VALUES (?, 'done', ?)
    `).run(tiktokOfficialApiKey, now);
  }
}

function getPublisherSettingRow(platform) {
  return getAffiliateDb()
    .prepare("SELECT * FROM publisher_settings WHERE platform = ?")
    .get(String(platform || "")) || null;
}

function isBrowserPlatformSupported(platform) {
  return RXV_BROWSER_SUPPORTED_PLATFORMS.has(String(platform || ""));
}

function browserProfileCachePaths() {
  const names = [
    ["Default", "Cache"],
    ["Default", "Code Cache"],
    ["Default", "GPUCache"],
    ["Default", "Media Cache"],
    ["Default", "Service Worker", "CacheStorage"],
    ["GrShaderCache"],
    ["ShaderCache"],
  ];
  return names.map((parts) => path.join(RXV_BROWSER_PROFILE_DIR, ...parts));
}

function removeDirSafe(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function cleanupBrowserCaches() {
  if (rxvBrowserContext) {
    return { ok: false, error: "BROWSER_MUST_BE_CLOSED_FOR_CACHE_CLEANUP" };
  }
  let removed = 0;
  for (const target of browserProfileCachePaths()) {
    if (fs.existsSync(target) && removeDirSafe(target)) removed += 1;
  }
  return { ok: true, removed, profileDir: RXV_BROWSER_PROFILE_DIR };
}

async function ensureBrowserContext() {
  if (rxvBrowserContext) return rxvBrowserContext;
  if (rxvBrowserLaunchPromise) return rxvBrowserLaunchPromise;

  rxvBrowserLaunchPromise = (async () => {
    const edgeExe = findEdgeExecutable();
    if (!edgeExe) throw new Error("EDGE_EXECUTABLE_NOT_FOUND");
    const { chromium } = loadPlaywrightCore();
    ensureDirSync(RXV_BROWSER_PROFILE_DIR);
    ensureDirSync(RXV_BROWSER_DEBUG_DIR);

    const context = await chromium.launchPersistentContext(
      RXV_BROWSER_PROFILE_DIR,
      {
        executablePath: edgeExe,
        headless: RXV_BROWSER_HEADLESS,
        viewport: null,
        acceptDownloads: true,
        args: [
          "--start-maximized",
          `--disk-cache-size=${RXV_BROWSER_CACHE_LIMIT_MB * 1024 * 1024}`,
          `--media-cache-size=${Math.floor(RXV_BROWSER_CACHE_LIMIT_MB / 2) * 1024 * 1024}`,
          "--disable-background-networking",
        ],
      },
    );

    context.setDefaultTimeout(12000);
    context.setDefaultNavigationTimeout(45000);
    context.on("close", () => {
      rxvBrowserContext = null;
      rxvBrowserStartedAt = "";
    });
    rxvBrowserContext = context;
    rxvBrowserStartedAt = sqliteNow();
    rxvBrowserLastError = "";
    return context;
  })();

  try {
    return await rxvBrowserLaunchPromise;
  } catch (error) {
    rxvBrowserLastError = String(error?.message || error);
    throw error;
  } finally {
    rxvBrowserLaunchPromise = null;
  }
}

async function getBrowserPage(targetUrl = "") {
  const context = await ensureBrowserContext();
  let page = context.pages().find((item) => !item.isClosed());
  if (!page) page = await context.newPage();
  if (targetUrl) {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  }
  return page;
}


async function getFreshFacebookComposerPage() {
  const context = await ensureBrowserContext();

  // The RxV browser profile is dedicated to automation. Close only old
  // Facebook Reel composer/editor tabs so a failed draft cannot leak state
  // into the next job. Leave unrelated tabs alone.
  for (const oldPage of context.pages()) {
    try {
      const url = String(oldPage.url() || "");
      const isFacebookComposer =
        /facebook\.com\/(?:reels\/create|reel\/\d+)/i.test(url);

      if (isFacebookComposer && !oldPage.isClosed()) {
        await oldPage.close({ runBeforeUnload: false }).catch(() => {});
      }
    } catch {}
  }

  const page = await context.newPage();
  await page.goto(
    "https://www.facebook.com/reels/create/",
    {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    },
  );

  return page;
}

function sanitizeFacebookDebugUrl(value = "") {
  try {
    const url = new URL(String(value || ""));
    // Never persist query strings because they can contain opaque/session data.
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(value || "").split("?")[0];
  }
}

function extractFacebookErrorMessages(value, out = [], depth = 0) {
  if (depth > 5 || out.length >= 20) return out;

  if (typeof value === "string") {
    const text = value.trim();
    if (
      text &&
      text.length <= 600 &&
      /(error|failed|failure|invalid|upload|publish|reel|video|權限|失敗|錯誤|無法|影片|發佈|發布)/i.test(
        text,
      )
    ) {
      out.push(text);
    }
    return out;
  }

  if (Array.isArray(value)) {
    for (const item of value.slice(0, 20)) {
      extractFacebookErrorMessages(item, out, depth + 1);
    }
    return out;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value).slice(0, 40)) {
      if (
        /(error|message|reason|description|summary|title|status)/i.test(
          key,
        )
      ) {
        extractFacebookErrorMessages(item, out, depth + 1);
      } else if (depth < 2) {
        extractFacebookErrorMessages(item, out, depth + 1);
      }
    }
  }

  return out;
}

function startFacebookPublishDiagnostics(page) {
  const events = [];
  const push = (event) => {
    events.push({
      at: new Date().toISOString(),
      ...event,
    });
    if (events.length > 80) events.shift();
  };

  const onResponse = async (response) => {
    try {
      const url = String(response.url() || "");
      if (!/facebook\.com/i.test(url)) return;

      const status = Number(response.status() || 0);
      const interesting =
        status >= 400 ||
        /graphql|reel|video|upload|publish/i.test(url);

      if (!interesting) return;

      const item = {
        type: "response",
        status,
        url: sanitizeFacebookDebugUrl(url),
      };

      if (status >= 400) {
        try {
          const contentType = String(
            response.headers()?.["content-type"] || "",
          );

          if (/json|javascript|text/i.test(contentType)) {
            const body = await response.text().catch(() => "");
            if (body && body.length <= 200000) {
              try {
                const parsed = JSON.parse(body);
                item.messages = [
                  ...new Set(
                    extractFacebookErrorMessages(parsed, []),
                  ),
                ].slice(0, 12);
              } catch {
                const safe = body
                  .replace(/access_token=[^&\s"]+/gi, "access_token=[redacted]")
                  .replace(/"access_token"\s*:\s*"[^"]+"/gi, '"access_token":"[redacted]"')
                  .slice(0, 1200);
                item.text = safe;
              }
            }
          }
        } catch {}
      }

      push(item);
    } catch {}
  };

  const onConsole = (msg) => {
    try {
      const type = String(msg.type() || "");
      if (!["error", "warning"].includes(type)) return;
      push({
        type: "console",
        level: type,
        text: String(msg.text() || "").slice(0, 800),
      });
    } catch {}
  };

  const onPageError = (error) => {
    push({
      type: "pageerror",
      text: String(error?.message || error || "").slice(0, 800),
    });
  };

  page.on("response", onResponse);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  return {
    events,
    stop() {
      page.off("response", onResponse);
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
    },
  };
}

async function facebookComposerResetToUpload(page) {
  try {
    const body = String(
      await page.locator("body").innerText().catch(() => ""),
    );

    const hasUploadText =
      /新增影片|上傳影片|拖放至此|影片預覽|upload video/i.test(
        body,
      );

    const visibleFileInput = await page
      .locator('input[type="file"]')
      .first()
      .isVisible({ timeout: 250 })
      .catch(() => false);

    // Facebook often keeps a hidden file input in later steps, so visible
    // upload UI text is the stronger signal.
    return hasUploadText && (visibleFileInput || /新增影片|上傳影片|影片預覽/i.test(body));
  } catch {
    return false;
  }
}

async function writeFacebookPublishDebug({
  jobId,
  page,
  diagnostics,
  reason,
  extra = {},
}) {
  try {
    ensureDirSync(RXV_BROWSER_DEBUG_DIR);
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const base =
      `${jobId}-facebook-publish-${stamp}`;

    const screenshot = path.join(
      RXV_BROWSER_DEBUG_DIR,
      `${base}.png`,
    );
    await page
      .screenshot({
        path: screenshot,
        fullPage: true,
      })
      .catch(() => {});

    const bodyText = String(
      await page
        .locator("body")
        .innerText()
        .catch(() => ""),
    ).slice(0, 6000);

    const debugJson = path.join(
      RXV_BROWSER_DEBUG_DIR,
      `${base}.json`,
    );

    await fsp.writeFile(
      debugJson,
      JSON.stringify(
        {
          build: BUILD,
          jobId,
          reason,
          pageUrl: sanitizeFacebookDebugUrl(page.url()),
          bodyText,
          events: diagnostics?.events || [],
          ...extra,
        },
        null,
        2,
      ),
      "utf8",
    );

    return {
      screenshot,
      debugJson,
    };
  } catch {
    return {
      screenshot: "",
      debugJson: "",
    };
  }
}

async function browserScreenshot(page, jobId, platform, suffix = "error") {
  try {
    ensureDirSync(RXV_BROWSER_DEBUG_DIR);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(
      RXV_BROWSER_DEBUG_DIR,
      `${jobId}-${platform}-${suffix}-${stamp}.png`,
    );
    await page.screenshot({ path: file, fullPage: true });
    return file;
  } catch {
    return "";
  }
}

async function browserDetectManualBlock(page, platform) {
  const url = String(page.url() || "");
  if (/accounts\.google\.com|login|checkpoint|challenge/i.test(url)) {
    return "LOGIN_OR_VERIFICATION_REQUIRED";
  }

  const text = await page.locator("body").innerText().catch(() => "");
  const patterns = [
    /captcha/i,
    /驗證碼/,
    /安全性檢查/,
    /確認你的身分/,
    /verify (?:it'?s )?you/i,
    /unusual activity/i,
    /登入以繼續/,
  ];
  for (const pattern of patterns) {
    if (pattern.test(text)) return "LOGIN_OR_VERIFICATION_REQUIRED";
  }

  if (platform === "youtube_shorts" || platform === "youtube_video") {
    if (/Sign in/i.test(text) && !/YouTube Studio/i.test(text)) {
      return "YOUTUBE_LOGIN_REQUIRED";
    }
  }
  return "";
}

async function clickFirstVisible(page, selectors = []) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 1500 })) {
        await locator.click();
        return true;
      }
    } catch {}
  }
  return false;
}


async function waitAndClickFirstEnabled(
  page,
  selectors = [],
  timeoutMs = 120000,
  pollMs = 750,
) {
  const deadline = Date.now() + Math.max(1000, Number(timeoutMs || 0));

  while (Date.now() < deadline) {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector).first();
        if (!(await locator.isVisible({ timeout: 300 }))) {
          continue;
        }

        const disabled = await locator.isDisabled().catch(() => false);
        const ariaDisabled = String(
          (await locator.getAttribute("aria-disabled").catch(() => "")) || "",
        ).toLowerCase();

        if (disabled || ariaDisabled === "true") {
          continue;
        }

        await locator.scrollIntoViewIfNeeded().catch(() => {});
        await locator.click({ timeout: 3000 });
        return true;
      } catch {}
    }

    await page.waitForTimeout(pollMs);
  }

  return false;
}

async function facebookCaptionBoxVisible(page) {
  const selectors = [
    'div[role="textbox"][contenteditable="true"]',
    'textarea[placeholder*="Reel" i]',
    'textarea[placeholder*="說明"]',
    'textarea',
  ];

  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 300 })) {
        return true;
      }
    } catch {}
  }
  return false;
}


async function ensureFacebookAiLabelOn(page) {
  const labelTexts = [
    "新增 AI 標籤",
    "新增 AI 标签",
    "Add AI label",
    "AI label",
  ];

  let label = null;
  for (const text of labelTexts) {
    try {
      const candidate = page.getByText(text, {
        exact: false,
      }).first();
      if (await candidate.isVisible({ timeout: 600 })) {
        label = candidate;
        break;
      }
    } catch {}
  }

  if (!label) {
    return {
      ok: false,
      reason: "FACEBOOK_AI_LABEL_NOT_FOUND",
    };
  }

  await label.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(250);

  const labelBox = await label.boundingBox().catch(() => null);
  const switches = page.locator(
    '[role="switch"], input[type="checkbox"]',
  );

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < (await switches.count()); i += 1) {
    const item = switches.nth(i);
    try {
      if (!(await item.isVisible({ timeout: 150 }))) continue;
      const box = await item.boundingBox();
      if (!box) continue;

      let score = i;
      if (labelBox) {
        const labelY = labelBox.y + labelBox.height / 2;
        const toggleY = box.y + box.height / 2;
        const vertical = Math.abs(toggleY - labelY);
        const horizontalPenalty =
          box.x < labelBox.x ? 1000 : 0;
        score = vertical + horizontalPenalty;
      }

      if (score < bestScore) {
        best = item;
        bestScore = score;
      }
    } catch {}
  }

  if (!best) {
    return {
      ok: false,
      reason: "FACEBOOK_AI_LABEL_SWITCH_NOT_FOUND",
    };
  }

  const role = String(
    (await best.getAttribute("role").catch(() => "")) || "",
  ).toLowerCase();
  const tagName = await best.evaluate(
    (el) => String(el.tagName || "").toLowerCase(),
  ).catch(() => "");

  let isOn = false;

  if (role === "switch") {
    isOn =
      String(
        (await best.getAttribute("aria-checked").catch(() => "")) ||
          "",
      ).toLowerCase() === "true";
  } else if (tagName === "input") {
    isOn = await best.isChecked().catch(() => false);
  } else {
    const ariaChecked = String(
      (await best.getAttribute("aria-checked").catch(() => "")) ||
        "",
    ).toLowerCase();
    isOn = ariaChecked === "true";
  }

  if (!isOn) {
    try {
      if (tagName === "input") {
        await best.check({ timeout: 3000 });
      } else {
        await best.click({ timeout: 3000 });
      }
      await page.waitForTimeout(350);
    } catch {
      return {
        ok: false,
        reason: "FACEBOOK_AI_LABEL_TOGGLE_FAILED",
      };
    }
  }

  let confirmedOn = false;
  if (role === "switch") {
    confirmedOn =
      String(
        (await best.getAttribute("aria-checked").catch(() => "")) ||
          "",
      ).toLowerCase() === "true";
  } else if (tagName === "input") {
    confirmedOn = await best.isChecked().catch(() => false);
  } else {
    confirmedOn =
      String(
        (await best.getAttribute("aria-checked").catch(() => "")) ||
          "",
      ).toLowerCase() === "true";
  }

  if (!confirmedOn) {
    return {
      ok: false,
      reason: "FACEBOOK_AI_LABEL_NOT_CONFIRMED_ON",
    };
  }

  return {
    ok: true,
    enabled: true,
  };
}

function extractFacebookReelUrl(value = "") {
  const text = String(value || "");
  const match = text.match(
    /https?:\/\/(?:www\.)?facebook\.com\/reel\/(\d+)/i,
  );
  return match
    ? `https://www.facebook.com/reel/${match[1]}`
    : "";
}

function normalizeFacebookVerifyText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#＃][^\s#＃]+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

function buildFacebookContentMarkers(row, publishText = "") {
  const candidates = [
    String(row?.product_title || ""),
    String(publishText || ""),
  ];

  const markers = [];
  for (const raw of candidates) {
    const normalized = normalizeFacebookVerifyText(raw);
    if (!normalized) continue;

    for (const length of [18, 14, 10]) {
      if (normalized.length >= length) {
        markers.push(normalized.slice(0, length));
        break;
      }
    }
  }

  return [...new Set(markers)].filter(
    (value) => value.length >= 8,
  );
}

async function facebookPageLooksUnavailable(page) {
  const text = String(
    await page.locator("body").innerText().catch(() => ""),
  ).toLowerCase();

  const badMarkers = [
    "此頁面目前無法顯示",
    "這個內容目前無法使用",
    "無法顯示",
    "this content isn't available",
    "this page isn't available",
    "page isn't available",
  ];

  return badMarkers.some((marker) =>
    text.includes(marker.toLowerCase()),
  );
}

async function findFacebookPublishedReelCandidate(
  page,
  prePublishReelUrl = "",
) {
  const explicitLabels = [
    "查看貼文",
    "查看 Reel",
    "查看Reel",
    "View reel",
    "View Reel",
    "View post",
    "View Post",
  ];

  for (const labelText of explicitLabels) {
    try {
      const locator = page.getByText(labelText, {
        exact: false,
      }).first();

      if (!(await locator.isVisible({ timeout: 400 }))) {
        continue;
      }

      const href = await locator.evaluate((el) => {
        const direct = el.getAttribute?.("href") || "";
        const parent = el.closest?.("a");
        return direct || parent?.href || "";
      }).catch(() => "");

      const candidate = extractFacebookReelUrl(href);
      if (candidate) {
        return {
          url: candidate,
          source: "explicit-view-action",
        };
      }
    } catch {}
  }

  const current = extractFacebookReelUrl(page.url());
  if (
    current &&
    current !== String(prePublishReelUrl || "")
  ) {
    return {
      url: current,
      source: "post-publish-navigation",
    };
  }

  return {
    url: "",
    source: "",
  };
}

async function verifyFacebookReelPublished({
  sourcePage,
  row,
  publishText,
  prePublishReelUrl = "",
  timeoutMs = 90000,
}) {
  const context = sourcePage.context();
  const deadline =
    Date.now() + Math.max(15000, Number(timeoutMs || 0));

  const contentMarkers =
    buildFacebookContentMarkers(row, publishText);
  const expectedPageName =
    normalizeFacebookVerifyText(
      RXV_FACEBOOK_PAGE_NAME,
    );

  let candidateUrl = "";
  let candidateSource = "";

  while (Date.now() < deadline) {
    const candidate =
      await findFacebookPublishedReelCandidate(
        sourcePage,
        prePublishReelUrl,
      );

    if (candidate.url) {
      candidateUrl = candidate.url;
      candidateSource = candidate.source;
      break;
    }

    await sourcePage.waitForTimeout(1200);
  }

  if (!candidateUrl) {
    return {
      ok: false,
      reason: "FACEBOOK_REEL_URL_NOT_FOUND",
      publishedUrl: "",
    };
  }

  const verifyPage = await context.newPage();
  try {
    while (Date.now() < deadline) {
      await verifyPage.goto(candidateUrl, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      }).catch(() => {});

      await verifyPage.waitForTimeout(2500);

      const unavailable =
        await facebookPageLooksUnavailable(verifyPage);

      if (unavailable) {
        await verifyPage.waitForTimeout(3000);
        continue;
      }

      const videoCount = await verifyPage
        .locator("video")
        .count()
        .catch(() => 0);

      if (videoCount <= 0) {
        await verifyPage.waitForTimeout(2500);
        continue;
      }

      const bodyText = String(
        await verifyPage
          .locator("body")
          .innerText()
          .catch(() => ""),
      );
      const normalizedBody =
        normalizeFacebookVerifyText(bodyText);

      const publisherMatches =
        !expectedPageName ||
        normalizedBody.includes(expectedPageName);

      const contentMatches =
        contentMarkers.length > 0 &&
        contentMarkers.some((marker) =>
          normalizedBody.includes(marker),
        );

      if (publisherMatches && contentMatches) {
        return {
          ok: true,
          verified: true,
          publishedUrl: candidateUrl,
          candidateSource,
          matchedPublisher: RXV_FACEBOOK_PAGE_NAME,
          matchedContent: true,
        };
      }

      return {
        ok: false,
        reason: !publisherMatches
          ? "FACEBOOK_REEL_WRONG_PUBLISHER"
          : "FACEBOOK_REEL_WRONG_CONTENT",
        publishedUrl: "",
        candidateSource,
      };
    }

    return {
      ok: false,
      reason: "FACEBOOK_REEL_NOT_VERIFIED",
      publishedUrl: "",
      candidateSource,
    };
  } finally {
    await verifyPage.close().catch(() => {});
  }
}


async function fillFacebookReelCaption(page, publishText = "") {
  const text = String(publishText || "").trim();
  if (!text) {
    return { ok: false, reason: "FACEBOOK_CAPTION_EMPTY" };
  }

  const selectors = [
    '[aria-label*="介紹你的 Reel"]',
    '[aria-label*="介紹你的Reel"]',
    '[placeholder*="介紹你的 Reel"]',
    '[placeholder*="介紹你的Reel"]',
    'div[data-lexical-editor="true"][contenteditable="true"]',
    'div[role="textbox"][contenteditable="true"]',
    'div[contenteditable="true"]',
    'textarea',
  ];

  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (!(await locator.isVisible({ timeout: 500 }))) continue;

      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await locator.click({ timeout: 2000 }).catch(() => {});
      await locator.press("Control+A").catch(() => {});
      await locator.press("Backspace").catch(() => {});

      let wrote = false;
      try {
        await locator.fill(text);
        wrote = true;
      } catch {}

      if (!wrote) {
        try {
          await page.keyboard.insertText(text);
          wrote = true;
        } catch {}
      }

      if (!wrote) continue;
      await page.waitForTimeout(300);

      let current = "";
      try {
        current = await locator.inputValue();
      } catch {
        current = await locator.innerText().catch(() => "");
      }

      const have = normalizeFacebookVerifyText(current);
      const want = normalizeFacebookVerifyText(text).slice(0, 12);

      if (want && have.includes(want)) {
        return { ok: true, selector };
      }
    } catch {}
  }

  return { ok: false, reason: "FACEBOOK_CAPTION_NOT_FILLED" };
}

async function clickFacebookFinalPublish(page, timeoutMs = 45000) {
  const deadline =
    Date.now() + Math.max(5000, Number(timeoutMs || 0));

  while (Date.now() < deadline) {
    for (const name of [
      /^發佈$/,
      /^發布$/,
      /^Publish$/i,
      /^Share reel$/i,
      /^分享 Reel$/,
    ]) {
      try {
        const button = page.getByRole("button", { name }).first();
        if (!(await button.isVisible({ timeout: 250 }))) continue;

        const disabled = await button.isDisabled().catch(() => false);
        const ariaDisabled = String(
          (await button.getAttribute("aria-disabled").catch(() => "")) || "",
        ).toLowerCase();

        if (disabled || ariaDisabled === "true") continue;

        await button.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await button.click({ timeout: 3000 });
        } catch {
          const box = await button.boundingBox().catch(() => null);
          if (!box) throw new Error("FACEBOOK_PUBLISH_BUTTON_NO_BOX");
          await page.mouse.click(
            box.x + box.width / 2,
            box.y + box.height / 2,
          );
        }
        return { ok: true, method: "role" };
      } catch {}
    }

    for (const selector of [
      '[aria-label="發佈"]',
      '[aria-label="發布"]',
      '[aria-label="Publish"]',
      'button:has-text("發佈")',
      'button:has-text("發布")',
      'div[role="button"]:has-text("發佈")',
      'div[role="button"]:has-text("發布")',
      'button:has-text("Publish")',
      'div[role="button"]:has-text("Publish")',
    ]) {
      try {
        const locator = page.locator(selector).first();
        if (!(await locator.isVisible({ timeout: 250 }))) continue;

        const disabled = await locator.isDisabled().catch(() => false);
        const ariaDisabled = String(
          (await locator.getAttribute("aria-disabled").catch(() => "")) || "",
        ).toLowerCase();

        if (disabled || ariaDisabled === "true") continue;

        await locator.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await locator.click({ timeout: 3000 });
        } catch {
          const box = await locator.boundingBox().catch(() => null);
          if (!box) throw new Error("FACEBOOK_PUBLISH_BUTTON_NO_BOX");
          await page.mouse.click(
            box.x + box.width / 2,
            box.y + box.height / 2,
          );
        }
        return { ok: true, method: "selector" };
      } catch {}
    }

    // Exact text fallback for Facebook UI variants where the visible
    // blue publish control is not exposed with a stable ARIA role.
    for (const exactText of ["發佈", "發布", "Publish"]) {
      try {
        const textNode = page.getByText(exactText, {
          exact: true,
        }).last();

        if (await textNode.isVisible({ timeout: 250 })) {
          const clickable = textNode.locator(
            'xpath=ancestor-or-self::*[@role="button" or self::button][1]',
          );

          const target =
            (await clickable.count()) > 0
              ? clickable.first()
              : textNode;

          const box = await target.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.click(
              box.x + box.width / 2,
              box.y + box.height / 2,
            );
            return {
              ok: true,
              method: "exact-text-mouse",
            };
          }
        }
      } catch {}
    }

    try {
      const clicked = await page.evaluate(() => {
        const wanted = new Set([
          "發佈",
          "發布",
          "Publish",
          "Share reel",
          "分享 Reel",
        ]);

        const nodes = Array.from(
          document.querySelectorAll(
            'button,[role="button"],[aria-label]',
          ),
        );

        for (const el of nodes) {
          const text = String(
            el.innerText ||
              el.textContent ||
              el.getAttribute("aria-label") ||
              "",
          ).trim();

          if (!wanted.has(text)) continue;

          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const visible =
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden";
          const disabled =
            el.hasAttribute("disabled") ||
            el.getAttribute("aria-disabled") === "true";

          if (!visible || disabled) continue;
          el.click();
          return true;
        }

        return false;
      });

      if (clicked) return { ok: true, method: "dom" };
    } catch {}

    await page.waitForTimeout(600);
  }

  return {
    ok: false,
    reason: "FACEBOOK_FINAL_BUTTON_NOT_CLICKED",
  };
}

async function waitFacebookPublishActionTaken(
  page,
  timeoutMs = 30000,
) {
  const deadline =
    Date.now() + Math.max(3000, Number(timeoutMs || 0));
  let absentChecks = 0;

  while (Date.now() < deadline) {
    const body = String(
      await page.locator("body").innerText().catch(() => ""),
    ).toLowerCase();

    const successText = [
      "reel 已發佈",
      "reel 已发布",
      "your reel is published",
      "your reel was published",
      "查看貼文",
      "查看 reel",
      "view reel",
      "view post",
    ].some((marker) =>
      body.includes(marker.toLowerCase()),
    );

    if (successText) return true;

    let finalVisible = false;
    for (const label of ["發佈", "發布", "Publish"]) {
      try {
        const node = page.getByText(label, {
          exact: true,
        }).last();
        if (await node.isVisible({ timeout: 150 })) {
          finalVisible = true;
          break;
        }
      } catch {}
    }

    if (!finalVisible) {
      absentChecks += 1;
      if (absentChecks >= 2) return true;
    } else {
      absentChecks = 0;
    }

    await page.waitForTimeout(700);
  }

  return false;
}


async function prepareFacebookBrowserPublish({ row, setting }) {
  const payload = safeParsePublishPayload(row);
  const p = payload?.platforms?.facebook || {};
  const publishText = String(
    p?.publishText || p?.body || "",
  );
  const videoPath = String(row.video_path || "");

  // V38.5 Fast Monetization:
  // automate the repetitive work only.
  // Do NOT automate Facebook's final blue Publish button.
  const page =
    await getFreshFacebookComposerPage();

  await page.waitForTimeout(1200);

  const block =
    await browserDetectManualBlock(
      page,
      "facebook",
    );

  if (block) {
    return {
      ok: false,
      needsManualAction: true,
      reason: block,
      page,
    };
  }

  const fileInputs =
    page.locator('input[type="file"]');

  if ((await fileInputs.count()) === 0) {
    return {
      ok: false,
      needsManualAction: true,
      reason:
        "FACEBOOK_FILE_INPUT_NOT_FOUND",
      page,
    };
  }

  await fileInputs
    .first()
    .setInputFiles(videoPath);

  const firstContinue =
    await waitAndClickFirstEnabled(
      page,
      [
        'button:has-text("繼續")',
        'div[role="button"]:has-text("繼續")',
        'button:has-text("Continue")',
        'div[role="button"]:has-text("Continue")',
        'button:has-text("下一步")',
        'div[role="button"]:has-text("下一步")',
        'button:has-text("Next")',
        'div[role="button"]:has-text("Next")',
      ],
      90000,
      500,
    );

  if (!firstContinue) {
    return {
      ok: false,
      needsManualAction: true,
      reason:
        "FACEBOOK_CONTINUE_NOT_READY",
      page,
    };
  }

  await page.waitForTimeout(700);

  // Pass only non-publish navigation pages.
  for (
    let step = 0;
    step < 3;
    step += 1
  ) {
    const blockAfterStep =
      await browserDetectManualBlock(
        page,
        "facebook",
      );

    if (blockAfterStep) {
      return {
        ok: false,
        needsManualAction: true,
        reason: blockAfterStep,
        page,
      };
    }

    if (
      await facebookCaptionBoxVisible(page)
    ) {
      break;
    }

    const advanced =
      await waitAndClickFirstEnabled(
        page,
        [
          'button:has-text("繼續")',
          'div[role="button"]:has-text("繼續")',
          'button:has-text("Continue")',
          'div[role="button"]:has-text("Continue")',
          'button:has-text("下一步")',
          'div[role="button"]:has-text("下一步")',
          'button:has-text("Next")',
          'div[role="button"]:has-text("Next")',
        ],
        12000,
        400,
      );

    if (!advanced) break;

    await page.waitForTimeout(650);
  }

  const captionReady =
    await facebookCaptionBoxVisible(page);

  const captionResult =
    await fillFacebookReelCaption(
      page,
      publishText,
    );

  if (!captionResult.ok) {
    return {
      ok: false,
      needsManualAction: true,
      reason:
        captionResult.reason ||
        "FACEBOOK_CAPTION_NOT_FILLED",
      page,
      prepared: false,
    };
  }

  // These RxV product videos use AI/TTS, so keep the disclosure ON.
  const aiLabel =
    await ensureFacebookAiLabelOn(page);

  if (!aiLabel.ok) {
    return {
      ok: false,
      needsManualAction: true,
      reason:
        aiLabel.reason ||
        "FACEBOOK_AI_LABEL_FAILED",
      page,
      prepared: false,
    };
  }

  // Stable intentional stop point:
  // user clicks Facebook's final blue Publish button.
  return {
    ok: false,
    needsManualAction: true,
    prepared: true,
    reason:
      "FAST_MODE_READY_TO_PUBLISH",
    page,
    aiLabelOn: true,
    captionFilled: true,
  };
}


async function setFirstFileInput(page, videoPath, selectors = []) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if ((await locator.count()) > 0) {
        await locator.setInputFiles(videoPath);
        return true;
      }
    } catch {}
  }
  return false;
}

async function fillContentEditableFirst(page, selectors = [], value = "") {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 1500 })) {
        await locator.click();
        await locator.fill(String(value || "")).catch(async () => {
          await locator.press("Control+A").catch(() => {});
          await locator.press("Backspace").catch(() => {});
          await locator.type(String(value || ""), { delay: 5 });
        });
        return true;
      }
    } catch {}
  }
  return false;
}

async function prepareInstagramBrowserPublish({ row, setting }) {
  const payload = safeParsePublishPayload(row);
  const p = payload?.platforms?.instagram || {};
  const publishText = String(p?.publishText || p?.caption || "");
  const videoPath = String(row.video_path || "");
  const page = await getBrowserPage("https://www.instagram.com/");
  await page.waitForTimeout(3000);

  const block = await browserDetectManualBlock(page, "instagram");
  if (block) return { ok: false, needsManualAction: true, reason: block, page };

  let opened = await clickFirstVisible(page, [
    'a[href="#"]:has-text("Create")',
    'a[href="#"]:has-text("建立")',
    'div[role="button"]:has-text("Create")',
    'div[role="button"]:has-text("建立")',
    'svg[aria-label="New post"]',
    'svg[aria-label="新增貼文"]',
  ]);

  if (!opened) {
    opened = await clickFirstVisible(page, [
      'text="Create"',
      'text="建立"',
    ]);
  }

  await page.waitForTimeout(800);

  const fileSet = await setFirstFileInput(page, videoPath, [
    'input[type="file"][accept*="video"]',
    'input[type="file"]',
  ]);
  if (!fileSet) {
    return { ok: false, needsManualAction: true, reason: "INSTAGRAM_FILE_INPUT_NOT_FOUND", page };
  }

  await page.waitForTimeout(3500);

  for (let i = 0; i < 2; i += 1) {
    const nextClicked = await clickFirstVisible(page, [
      'div[role="button"]:has-text("Next")',
      'div[role="button"]:has-text("下一步")',
      'button:has-text("Next")',
      'button:has-text("下一步")',
    ]);
    if (!nextClicked) break;
    await page.waitForTimeout(700);
  }

  await fillContentEditableFirst(page, [
    'textarea[aria-label*="caption" i]',
    'textarea[placeholder*="caption" i]',
    'textarea',
    'div[role="textbox"][contenteditable="true"]',
  ], publishText);

  if (Number(setting?.browser_final_confirm ?? 1) === 1) {
    return { ok: false, needsManualAction: true, reason: "READY_FOR_FINAL_CONFIRM", page, prepared: true };
  }

  const shared = await clickFirstVisible(page, [
    'div[role="button"]:has-text("Share")',
    'div[role="button"]:has-text("分享")',
    'button:has-text("Share")',
    'button:has-text("分享")',
  ]);
  if (!shared) {
    return { ok: false, needsManualAction: true, reason: "INSTAGRAM_FINAL_BUTTON_NOT_FOUND", page };
  }

  await page.waitForTimeout(3500);
  return { ok: true, page, publishedUrl: String(page.url() || "") };
}

async function prepareTikTokBrowserPublish({ row, setting }) {
  const payload = safeParsePublishPayload(row);
  const p = payload?.platforms?.tiktok || {};
  const publishText = String(p?.publishText || p?.caption || "");
  const videoPath = String(row.video_path || "");
  const page = await getBrowserPage("https://www.tiktok.com/tiktokstudio/upload");
  await page.waitForTimeout(3500);

  const block = await browserDetectManualBlock(page, "tiktok");
  if (block) return { ok: false, needsManualAction: true, reason: block, page };

  const fileSet = await setFirstFileInput(page, videoPath, [
    'input[type="file"][accept*="video"]',
    'input[type="file"]',
  ]);
  if (!fileSet) {
    return { ok: false, needsManualAction: true, reason: "TIKTOK_FILE_INPUT_NOT_FOUND", page };
  }

  await page.waitForTimeout(4500);

  const captionFilled = await fillContentEditableFirst(page, [
    'div[contenteditable="true"][data-e2e*="caption"]',
    'div[contenteditable="true"]',
    'textarea[placeholder*="caption" i]',
    'textarea',
  ], publishText);

  if (!captionFilled) {
    return { ok: false, needsManualAction: true, reason: "TIKTOK_CAPTION_BOX_NOT_FOUND", page };
  }

  if (Number(setting?.browser_final_confirm ?? 1) === 1) {
    return { ok: false, needsManualAction: true, reason: "READY_FOR_FINAL_CONFIRM", page, prepared: true };
  }

  const posted = await clickFirstVisible(page, [
    'button[data-e2e*="post"]',
    'button:has-text("Post")',
    'button:has-text("發布")',
  ]);
  if (!posted) {
    return { ok: false, needsManualAction: true, reason: "TIKTOK_FINAL_BUTTON_NOT_FOUND", page };
  }

  await page.waitForTimeout(4000);
  return { ok: true, page, publishedUrl: String(page.url() || "") };
}

async function prepareThreadsBrowserPublish({ row, setting }) {
  const payload = safeParsePublishPayload(row);
  const p = payload?.platforms?.threads || {};
  const publishText = String(p?.publishText || p?.body || "");
  const videoPath = String(row.video_path || "");
  const page = await getBrowserPage("https://www.threads.net/");
  await page.waitForTimeout(3000);

  const block = await browserDetectManualBlock(page, "threads");
  if (block) return { ok: false, needsManualAction: true, reason: block, page };

  await clickFirstVisible(page, [
    'button:has-text("Start a thread")',
    'div[role="button"]:has-text("Start a thread")',
    'button:has-text("開始串文")',
    'div[role="button"]:has-text("開始串文")',
    'text="Start a thread"',
  ]);
  await page.waitForTimeout(700);

  const textFilled = await fillContentEditableFirst(page, [
    'div[role="textbox"][contenteditable="true"]',
    'textarea',
  ], publishText);

  if (!textFilled) {
    return { ok: false, needsManualAction: true, reason: "THREADS_COMPOSER_NOT_FOUND", page };
  }

  const fileSet = await setFirstFileInput(page, videoPath, [
    'input[type="file"][accept*="video"]',
    'input[type="file"]',
  ]);
  if (!fileSet) {
    return { ok: false, needsManualAction: true, reason: "THREADS_FILE_INPUT_NOT_FOUND", page };
  }

  await page.waitForTimeout(2500);

  if (Number(setting?.browser_final_confirm ?? 1) === 1) {
    return { ok: false, needsManualAction: true, reason: "READY_FOR_FINAL_CONFIRM", page, prepared: true };
  }

  const posted = await clickFirstVisible(page, [
    'button:has-text("Post")',
    'div[role="button"]:has-text("Post")',
    'button:has-text("發布")',
    'div[role="button"]:has-text("發布")',
  ]);
  if (!posted) {
    return { ok: false, needsManualAction: true, reason: "THREADS_FINAL_BUTTON_NOT_FOUND", page };
  }

  await page.waitForTimeout(3500);
  return { ok: true, page, publishedUrl: String(page.url() || "") };
}

async function prepareXBrowserPublish({ row, setting }) {
  const payload = safeParsePublishPayload(row);
  const p = payload?.platforms?.x || {};
  const publishText = String(p?.publishText || p?.body || "");
  const videoPath = String(row.video_path || "");
  const page = await getBrowserPage("https://x.com/compose/post");
  await page.waitForTimeout(3000);

  const block = await browserDetectManualBlock(page, "x");
  if (block) return { ok: false, needsManualAction: true, reason: block, page };

  const textFilled = await fillContentEditableFirst(page, [
    'div[data-testid="tweetTextarea_0"][contenteditable="true"]',
    'div[role="textbox"][contenteditable="true"]',
  ], publishText);

  if (!textFilled) {
    return { ok: false, needsManualAction: true, reason: "X_COMPOSER_NOT_FOUND", page };
  }

  const fileSet = await setFirstFileInput(page, videoPath, [
    'input[data-testid="fileInput"]',
    'input[type="file"][accept*="video"]',
    'input[type="file"]',
  ]);
  if (!fileSet) {
    return { ok: false, needsManualAction: true, reason: "X_FILE_INPUT_NOT_FOUND", page };
  }

  await page.waitForTimeout(3000);

  if (Number(setting?.browser_final_confirm ?? 1) === 1) {
    return { ok: false, needsManualAction: true, reason: "READY_FOR_FINAL_CONFIRM", page, prepared: true };
  }

  const posted = await clickFirstVisible(page, [
    'button[data-testid="tweetButton"]',
    'button[data-testid="tweetButtonInline"]',
    'button:has-text("Post")',
    'button:has-text("發佈")',
  ]);
  if (!posted) {
    return { ok: false, needsManualAction: true, reason: "X_FINAL_BUTTON_NOT_FOUND", page };
  }

  await page.waitForTimeout(3500);
  return { ok: true, page, publishedUrl: String(page.url() || "") };
}

function browserMarkNeedsManual(row, jobId, reason, screenshot = "") {
  const now = sqliteNow();
  const message = ["NEEDS_MANUAL_ACTION", reason, screenshot].filter(Boolean).join(": ");
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'needs_manual_action',
        last_error = ?,
        updated_at = ?
    WHERE id = ?
  `).run(message, now, jobId);
  setAffiliatePlatformStatusByProductKey(
    row.product_key,
    row.platform,
    "queued",
    message,
  );
}

async function dispatchBrowserPublisherJob(jobId, { source = "manual" } = {}) {
  const numericId = Number(jobId || 0);
  if (!numericId) return { ok: false, error: "PUBLISHER_JOB_ID_REQUIRED" };
  if (rxvBrowserJobLocks.has(numericId)) {
    return { ok: false, error: "PUBLISHER_JOB_ALREADY_RUNNING" };
  }

  const row = getPublisherJobById(numericId);
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  const platform = String(row.platform || "");
  if (!isBrowserPlatformSupported(platform)) {
    return { ok: false, error: "BROWSER_ADAPTER_NOT_SUPPORTED", platform };
  }

  if (rxvBrowserPlatformLocks.has(platform)) {
    return {
      ok: false,
      deferred: true,
      error: "BROWSER_PLATFORM_BUSY",
    };
  }

  const payload = safeParsePublishPayload(row);
  if (Number(row.publish_ready || 0) !== 1 || payload?.safety?.ok !== true) {
    return { ok: false, error: "PUBLISH_SAFETY_BLOCKED" };
  }
  const videoPath = String(row.video_path || "");
  if (!videoPath || !fs.existsSync(videoPath)) {
    return { ok: false, error: "VIDEO_FILE_NOT_FOUND" };
  }

  const setting = getPublisherSettingRow(platform) || {};
  const quickFacebookManual =
    platform === "facebook" &&
    String(source || "") === "manual";
  const rotationBrowserAssist =
    RXV_ROTATION_BROWSER_PLATFORMS.has(platform) &&
    String(source || "") === "rotation";

  const guard = getPublisherRateGuard(platform);
  const bypassMinInterval =
    (quickFacebookManual || rotationBrowserAssist) &&
    guard.reason === "MIN_INTERVAL_GUARD";

  if (!guard.allowed && !bypassMinInterval) {
    return {
      ok: false,
      deferred: true,
      error: guard.reason,
      nextAllowedAt: guard.nextAllowedAt,
      todayCount: guard.todayCount,
      dailyLimit: guard.dailyLimit,
    };
  }

  rxvBrowserJobLocks.add(numericId);
  rxvBrowserPlatformLocks.add(platform);
  try {
    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'publishing',
          attempt_count = attempt_count + 1,
          last_error = '',
          updated_at = ?
      WHERE id = ?
    `).run(now, numericId);
    setAffiliatePlatformStatusByProductKey(row.product_key, platform, "publishing", "");

    let result = null;
    if (platform === "facebook") {
      result = await prepareFacebookBrowserPublish({ row, setting });
    } else if (platform === "instagram") {
      result = await prepareInstagramBrowserPublish({ row, setting });
    } else if (platform === "tiktok") {
      result = await prepareTikTokBrowserPublish({ row, setting });
    } else if (platform === "threads") {
      result = await prepareThreadsBrowserPublish({ row, setting });
    } else if (platform === "x") {
      result = await prepareXBrowserPublish({ row, setting });
    } else {
      return { ok: false, error: "BROWSER_ADAPTER_NOT_SUPPORTED", platform };
    }

    if (result?.needsManualAction) {
      const shot = result.page
        ? await browserScreenshot(result.page, numericId, platform, "manual")
        : "";
      browserMarkNeedsManual(row, numericId, result.reason || "MANUAL_ACTION_REQUIRED", shot);
      return {
        ok: false,
        needsManualAction: true,
        prepared: Boolean(result.prepared),
        error: result.reason || "MANUAL_ACTION_REQUIRED",
        screenshot: shot,
        source,
        job: publisherJobToApi(getPublisherJobById(numericId)),
      };
    }

    if (!result?.ok) {
      throw new Error(result?.reason || "BROWSER_PUBLISH_FAILED");
    }

    const browserUrl = String(result?.publishedUrl || "");

    // Facebook V38.4.11 has a stricter verification path:
    // AI label ON -> click final publish -> open the Reel URL -> confirm
    // the Reel page contains a video and is not "page unavailable".
    // Only then is it safe to auto-mark published and start the 5-min guard.
    if (
      platform === "facebook" &&
      result?.verified === true &&
      browserUrl
    ) {
      const publishedAt = sqliteNow();

      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET status = 'published',
            published_url = ?,
            last_error = '',
            published_at = ?,
            next_attempt_at = NULL,
            updated_at = ?
        WHERE id = ?
      `).run(
        browserUrl,
        publishedAt,
        publishedAt,
        numericId,
      );

      getAffiliateDb().prepare(`
        UPDATE publisher_settings
        SET last_published_at = ?,
            updated_at = ?
        WHERE platform = ?
      `).run(
        publishedAt,
        publishedAt,
        platform,
      );

      markAffiliatePlatformPublished(
        row.product_key,
        platform,
        browserUrl,
      );

      return {
        ok: true,
        verified: true,
        aiLabelOn: Boolean(result?.aiLabelOn),
        source,
        adapterMode: "browser",
        platform,
        publishedUrl: browserUrl,
        job: publisherJobToApi(
          getPublisherJobById(numericId),
        ),
      };
    }

    // Other browser platforms still require explicit user confirmation.
    browserMarkNeedsManual(
      row,
      numericId,
      "VERIFY_PLATFORM_PUBLISH_RESULT",
      "",
    );
    if (browserUrl) {
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET published_url = ?,
            updated_at = ?
        WHERE id = ?
      `).run(browserUrl, sqliteNow(), numericId);
    }
    return {
      ok: false,
      needsManualAction: true,
      prepared: true,
      error: "VERIFY_PLATFORM_PUBLISH_RESULT",
      source,
      adapterMode: "browser",
      platform,
      browserUrl,
      job: publisherJobToApi(getPublisherJobById(numericId)),
    };
  } catch (error) {
    let page = null;
    try {
      page = rxvBrowserContext?.pages()?.find((item) => !item.isClosed()) || null;
    } catch {}
    const shot = page ? await browserScreenshot(page, numericId, platform, "error") : "";
    const message = String(error?.message || error);
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'failed',
          last_error = ?,
          updated_at = ?
      WHERE id = ?
    `).run([message, shot].filter(Boolean).join(" | "), sqliteNow(), numericId);
    setAffiliatePlatformStatusByProductKey(row.product_key, platform, "failed", message);
    rxvBrowserLastError = message;
    return {
      ok: false,
      error: "BROWSER_PUBLISH_FAILED",
      message,
      screenshot: shot,
      browserStatus: browserStatusPayload(),
      adapterMode: "browser",
      platform,
      job: publisherJobToApi(getPublisherJobById(numericId)),
    };
  } finally {
    rxvBrowserJobLocks.delete(numericId);
    rxvBrowserPlatformLocks.delete(platform);
  }
}

function browserStatusPayload() {
  let dependencyAvailable = true;
  try { loadPlaywrightCore(); } catch { dependencyAvailable = false; }
  return {
    build: BUILD,
    dependencyAvailable,
    edgeExecutable: findEdgeExecutable(),
    profileDir: RXV_BROWSER_PROFILE_DIR,
    debugDir: RXV_BROWSER_DEBUG_DIR,
    contextOpen: Boolean(rxvBrowserContext),
    startedAt: rxvBrowserStartedAt,
    lastError: rxvBrowserLastError,
    headless: RXV_BROWSER_HEADLESS,
    cloudStagingUsed: false,
    aiClicksUsed: false,
    supportedPlatforms: [...RXV_BROWSER_SUPPORTED_PLATFORMS],
    note: "V39.1 TikTok 說明會直接帶蝦皮分潤網址；Instagram 暫停；目前只跑 Facebook、YouTube Shorts、Threads、X。TikTok 因 Google 擋自動化 Edge 登入而停用，既有工作與資料保留。",
  };
}

const RXV_ROTATION_PLATFORMS = [
  "facebook",
  "tiktok",
  "youtube_shorts",
  "threads",
  "x",
];

const RXV_ROTATION_BROWSER_PLATFORMS = new Set([
  "facebook",
  "tiktok",
  "threads",
  "x",
]);

const PUBLISHER_DEFAULT_SETTINGS = {
  facebook: { dailyLimit: 8, minIntervalMinutes: 5 },
  instagram: { dailyLimit: 6, minIntervalMinutes: 120 },
  tiktok: { dailyLimit: 14, minIntervalMinutes: 60 },
  youtube_shorts: { dailyLimit: 8, minIntervalMinutes: 120 },
  youtube_video: { dailyLimit: 2, minIntervalMinutes: 360 },
  threads: { dailyLimit: 12, minIntervalMinutes: 60 },
  x: { dailyLimit: 10, minIntervalMinutes: 75 },
};

function initPublisherTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS publisher_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_key TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      scheduled_at TEXT,
      next_attempt_at TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      remote_post_id TEXT NOT NULL DEFAULT '',
      published_url TEXT NOT NULL DEFAULT '',
      last_error TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,
      UNIQUE(product_key, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_pub_jobs_status
      ON publisher_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_pub_jobs_schedule
      ON publisher_jobs(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_pub_jobs_platform_status
      ON publisher_jobs(platform, status);

    CREATE TABLE IF NOT EXISTS publisher_settings (
      platform TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 1,
      daily_limit INTEGER NOT NULL DEFAULT 8,
      min_interval_minutes INTEGER NOT NULL DEFAULT 90,
      auto_publish INTEGER NOT NULL DEFAULT 0,
      last_published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const now = sqliteNow();
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO publisher_settings (
      platform, enabled, daily_limit, min_interval_minutes,
      auto_publish, created_at, updated_at
    )
    VALUES (?, 1, ?, ?, 0, ?, ?)
  `);

  for (const platform of RXV_SUPPORTED_PLATFORMS) {
    const defaults =
      PUBLISHER_DEFAULT_SETTINGS[platform] ||
      { dailyLimit: 8, minIntervalMinutes: 90 };
    insertSetting.run(
      platform,
      defaults.dailyLimit,
      defaults.minIntervalMinutes,
      now,
      now,
    );
  }

  ensurePublisherBrowserColumns(db);
}

function safeParsePublishPayload(record) {
  try {
    const payload = JSON.parse(record?.publish_payload_json || "{}");
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

function syncPublisherJobsFromAffiliateDb() {
  const db = getAffiliateDb();
  const rows = db.prepare(`
    SELECT *
    FROM affiliate_products
    WHERE video_status = 'completed'
      AND publish_ready = 1
      AND publish_payload_version = 'v37.14'
    ORDER BY updated_at ASC
  `).all();

  const now = sqliteNow();
  let created = 0;
  let updated = 0;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO publisher_jobs (
      product_key, platform, status,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  const updatePublished = db.prepare(`
    UPDATE publisher_jobs
    SET status = 'published',
        published_url = ?,
        published_at = COALESCE(published_at, ?),
        updated_at = ?
    WHERE product_key = ? AND platform = ?
  `);

  const updateFailed = db.prepare(`
    UPDATE publisher_jobs
    SET status = CASE
          WHEN status IN ('scheduled', 'cancelled') THEN status
          ELSE 'failed'
        END,
        last_error = CASE
          WHEN status IN ('scheduled', 'cancelled') THEN last_error
          ELSE ?
        END,
        updated_at = ?
    WHERE product_key = ? AND platform = ?
  `);

  for (const record of rows) {
    const payload = safeParsePublishPayload(record);
    const safetyOk = payload?.safety?.ok === true;
    if (!safetyOk) continue;

    const selected = normalizeRequestedPlatforms(
      payload?.selectedPlatforms || [],
    );

    for (const platform of selected) {
      const columns = PLATFORM_COLUMNS[platform];
      if (!columns) continue;

      const sourceStatus = String(
        record?.[columns.status] || "queued",
      );
      const initialStatus =
        sourceStatus === "published"
          ? "published"
          : sourceStatus === "failed"
            ? "failed"
            : sourceStatus === "publishing"
              ? "publishing"
              : "queued";

      const result = insert.run(
        record.product_key,
        platform,
        initialStatus,
        now,
        now,
      );
      if (Number(result?.changes || 0) > 0) created += 1;

      if (sourceStatus === "published") {
        const result2 = updatePublished.run(
          String(record?.[columns.url] || ""),
          String(record?.[columns.publishedAt] || now),
          now,
          record.product_key,
          platform,
        );
        updated += Number(result2?.changes || 0);
      } else if (sourceStatus === "failed") {
        const result2 = updateFailed.run(
          String(record?.[columns.error] || ""),
          now,
          record.product_key,
          platform,
        );
        updated += Number(result2?.changes || 0);
      }
    }
  }

  return {
    scannedProducts: rows.length,
    created,
    updated,
  };
}

function getPublisherSettings() {
  const db = getAffiliateDb();
  return db.prepare(`
    SELECT
      platform,
      enabled,
      daily_limit,
      min_interval_minutes,
      auto_publish,
      adapter_mode,
      browser_final_confirm,
      browser_visibility,
      last_published_at,
      created_at,
      updated_at
    FROM publisher_settings
    ORDER BY platform
  `).all().map((row) => ({
    platform: String(row.platform || ""),
    enabled: Number(row.enabled || 0) === 1,
    dailyLimit: Number(row.daily_limit || 0),
    minIntervalMinutes: Number(row.min_interval_minutes || 0),
    autoPublish: Number(row.auto_publish || 0) === 1,
    adapterMode: String(row.adapter_mode || browserSettingDefault(row.platform).adapterMode),
    browserFinalConfirm: Number(row.browser_final_confirm ?? 1) === 1,
    browserVisibility: String(row.browser_visibility || "private"),
    lastPublishedAt: String(row.last_published_at || ""),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  }));
}

function getPublisherJobCounts() {
  const db = getAffiliateDb();
  const read = (status) =>
    Number(
      db.prepare(
        "SELECT COUNT(*) AS count FROM publisher_jobs WHERE status = ?",
      ).get(status)?.count || 0,
    );

  return {
    total: Number(
      db.prepare("SELECT COUNT(*) AS count FROM publisher_jobs").get()?.count || 0,
    ),
    queued: read("queued"),
    scheduled: read("scheduled"),
    publishing: read("publishing"),
    published: read("published"),
    failed: read("failed"),
    needsManualAction: read("needs_manual_action"),
    cancelled: read("cancelled"),
  };
}

function getPublisherConnections() {
  const result = {};
  for (const platform of RXV_SUPPORTED_PLATFORMS) {
    result[platform] = {
      configured: false,
      connected: false,
      adapterReady: false,
      message: "尚未接平台 API。",
    };
  }

  result.facebook = {
    configured: hasMetaFacebookConfig(),
    connected: Boolean(metaConnectionCache.facebook.connected),
    adapterReady: true,
    message: hasMetaFacebookConfig()
      ? "Facebook Reels 發布器已安裝；可測試 Meta 連線。"
      : "請先執行 SET_META_CONFIG.bat 設定 Page ID 與 Page Access Token。",
  };

  result.instagram = {
    configured: hasMetaInstagramConfig(),
    connected: Boolean(metaConnectionCache.instagram.connected),
    adapterReady: true,
    message: hasMetaInstagramConfig()
      ? "Instagram Reels 發布器已安裝；影片直接從本機送到 Meta resumable upload。"
      : "Instagram 需要 Meta Token／IG 專業帳號；V38.4.11 不需要 R2。",
  };

  const youtubeConfigured = hasYouTubeClientConfig();
  const youtubeConnected = hasYouTubeStoredAuthorization() && Boolean(youtubeConnectionCache.authorized);

  result.youtube_shorts = {
    configured: youtubeConfigured,
    connected: youtubeConnected,
    adapterReady: true,
    message: youtubeConnected
      ? "YouTube OAuth 已授權；Shorts 可直接從本機上傳。"
      : youtubeConfigured
        ? "YouTube Publisher 已安裝；請完成 Google OAuth 授權。"
        : "請先執行 SET_YOUTUBE_CONFIG.bat 設定 OAuth Client。",
  };
  result.youtube_video = { ...result.youtube_shorts };

  result.facebook = {
    ...result.facebook,
    extensionSupported: true,
    extensionOnline: isPublisherExtensionOnline(),
  };
  const tiktokPublic = tiktokOfficial.publicStatus();
  result.tiktok = {
    configured: Boolean(tiktokPublic.configured),
    connected: Boolean(tiktokPublic.authorized),
    adapterReady: true,
    extensionSupported: false,
    officialApi: true,
    postMode: String(tiktokPublic.postMode || "upload"),
    message: tiktokPublic.authorized
      ? `TikTok 官方 API 已授權（${tiktokPublic.postMode}）；影片直接從本機 FILE_UPLOAD 傳送。`
      : tiktokPublic.configured
        ? "TikTok 官方 API 已設定；請完成 OAuth 授權。"
        : "請先執行 SET_TIKTOK_CONFIG.cmd 設定 TikTok Developer Client Key / Secret。",
  };

  return result;
}

function getPublisherJobById(id) {
  return (
    getAffiliateDb()
      .prepare(`
        SELECT j.*, a.*
        FROM publisher_jobs j
        JOIN affiliate_products a
          ON a.product_key = j.product_key
        WHERE j.id = ?
      `)
      .get(Number(id)) || null
  );
}

function publisherJobToApi(row) {
  const payload = safeParsePublishPayload(row);
  const platform = String(row?.platform || "");
  const platformPayload =
    payload?.platforms?.[platform] &&
    typeof payload.platforms[platform] === "object"
      ? payload.platforms[platform]
      : {};

  const videoPath = String(row?.video_path || "");
  let videoExists = false;
  try {
    videoExists = Boolean(videoPath && fs.existsSync(videoPath));
  } catch {}

  return {
    id: Number(row?.id || 0),
    productKey: String(row?.product_key || ""),
    productTitle: String(row?.product_title || ""),
    productUrl: String(row?.product_url || ""),
    affiliateUrl: String(row?.affiliate_url || ""),
    platform,
    status: String(row?.status || "queued"),
    scheduledAt: String(row?.scheduled_at || ""),
    nextAttemptAt: String(row?.next_attempt_at || ""),
    attemptCount: Number(row?.attempt_count || 0),
    maxAttempts: Number(row?.max_attempts || 3),
    remotePostId: String(row?.remote_post_id || ""),
    publishedUrl: String(row?.published_url || ""),
    lastError: String(row?.last_error || ""),
    createdAt: String(row?.created_at || ""),
    updatedAt: String(row?.updated_at || ""),
    publishedAt: String(row?.published_at || ""),
    videoPath,
    videoFilename: String(row?.video_filename || ""),
    videoExists,
    publishReady: Number(row?.publish_ready || 0) === 1,
    payloadVersion: String(row?.publish_payload_version || ""),
    safety: payload?.safety || null,
    platformPayload,
  };
}

function setAffiliatePlatformStatusByProductKey(
  productKey,
  platform,
  status,
  errorMessage = "",
) {
  const columns = PLATFORM_COLUMNS[platform];
  if (!columns) return;

  const now = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE affiliate_products
    SET ${columns.status} = ?,
        ${columns.error} = ?,
        updated_at = ?
    WHERE product_key = ?
  `).run(status, errorMessage, now, productKey);

  const row = getAffiliateDb()
    .prepare("SELECT * FROM affiliate_products WHERE product_key = ?")
    .get(productKey);

  if (row) {
    const aggregate = computeAggregatePublishStatus(row);
    getAffiliateDb().prepare(`
      UPDATE affiliate_products
      SET publish_status = ?, updated_at = ?
      WHERE product_key = ?
    `).run(aggregate, now, productKey);
  }
}

function normalizePublisherSchedule(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_SCHEDULE_TIME");
  }
  return date.toISOString();
}

function initAffiliateDb() {
  if (affiliateDb) return affiliateDb;
  if (!DatabaseSync) throw new Error("NODE_SQLITE_UNAVAILABLE");

  ensureDirSync(DATA_DIR);
  backupAffiliateDbBeforeOpen();

  affiliateDb = new DatabaseSync(AFFILIATE_DB_PATH);
  affiliateDb.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS affiliate_products (
      product_key TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL DEFAULT '',
      product_id TEXT NOT NULL DEFAULT '',
      product_title TEXT NOT NULL DEFAULT '',
      product_url TEXT NOT NULL DEFAULT '',
      affiliate_url TEXT NOT NULL DEFAULT '',

      video_path TEXT NOT NULL DEFAULT '',
      video_filename TEXT NOT NULL DEFAULT '',
      video_build TEXT NOT NULL DEFAULT '',
      video_status TEXT NOT NULL DEFAULT 'pending',

      publish_status TEXT NOT NULL DEFAULT 'not_published',
      script_source TEXT NOT NULL DEFAULT '',
      short_title TEXT NOT NULL DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      full_post TEXT NOT NULL DEFAULT '',

      facebook_post TEXT NOT NULL DEFAULT '',
      instagram_caption TEXT NOT NULL DEFAULT '',
      tiktok_caption TEXT NOT NULL DEFAULT '',
      youtube_shorts_title TEXT NOT NULL DEFAULT '',
      youtube_shorts_description TEXT NOT NULL DEFAULT '',
      youtube_video_title TEXT NOT NULL DEFAULT '',
      youtube_video_description TEXT NOT NULL DEFAULT '',
      threads_post TEXT NOT NULL DEFAULT '',
      x_post TEXT NOT NULL DEFAULT '',

      facebook_hashtags TEXT NOT NULL DEFAULT '',
      instagram_hashtags TEXT NOT NULL DEFAULT '',
      tiktok_hashtags TEXT NOT NULL DEFAULT '',
      youtube_hashtags TEXT NOT NULL DEFAULT '',
      hashtags TEXT NOT NULL DEFAULT '',

      image_urls_json TEXT NOT NULL DEFAULT '[]',
      image_hashes_json TEXT NOT NULL DEFAULT '[]',

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      video_created_at TEXT,
      published_at TEXT,

      facebook_status TEXT NOT NULL DEFAULT 'not_published',
      instagram_status TEXT NOT NULL DEFAULT 'not_published',
      tiktok_status TEXT NOT NULL DEFAULT 'not_published',
      youtube_shorts_status TEXT NOT NULL DEFAULT 'not_published',
      youtube_video_status TEXT NOT NULL DEFAULT 'not_published',
      threads_status TEXT NOT NULL DEFAULT 'not_published',
      x_status TEXT NOT NULL DEFAULT 'not_published',

      facebook_url TEXT NOT NULL DEFAULT '',
      instagram_url TEXT NOT NULL DEFAULT '',
      tiktok_url TEXT NOT NULL DEFAULT '',
      youtube_shorts_url TEXT NOT NULL DEFAULT '',
      youtube_video_url TEXT NOT NULL DEFAULT '',
      threads_url TEXT NOT NULL DEFAULT '',
      x_url TEXT NOT NULL DEFAULT '',

      facebook_error TEXT NOT NULL DEFAULT '',
      instagram_error TEXT NOT NULL DEFAULT '',
      tiktok_error TEXT NOT NULL DEFAULT '',
      youtube_shorts_error TEXT NOT NULL DEFAULT '',
      youtube_video_error TEXT NOT NULL DEFAULT '',
      threads_error TEXT NOT NULL DEFAULT '',
      x_error TEXT NOT NULL DEFAULT '',

      facebook_published_at TEXT,
      instagram_published_at TEXT,
      tiktok_published_at TEXT,
      youtube_shorts_published_at TEXT,
      youtube_video_published_at TEXT,
      threads_published_at TEXT,
      x_published_at TEXT,

      retry_count INTEGER NOT NULL DEFAULT 0,
      generation_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_aff_video_status
      ON affiliate_products(video_status);
    CREATE INDEX IF NOT EXISTS idx_aff_publish_status
      ON affiliate_products(publish_status);
    CREATE INDEX IF NOT EXISTS idx_aff_updated_at
      ON affiliate_products(updated_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_aff_shop_product
      ON affiliate_products(shop_id, product_id)
      WHERE shop_id <> '' AND product_id <> '';
  `);

  migrateAffiliateDbV373(affiliateDb);
  initPublisherTables(affiliateDb);

  console.log("[affiliate-db] ready", {
    path: AFFILIATE_DB_PATH,
    schema: "v38.1-meta-publisher",
  });
  return affiliateDb;
}

function getAffiliateDb() {
  return affiliateDb || initAffiliateDb();
}

function getAffiliateRecord(productUrl) {
  const identity = parseShopeeProductIdentity(productUrl);
  return (
    getAffiliateDb()
      .prepare("SELECT * FROM affiliate_products WHERE product_key = ?")
      .get(identity.key) || null
  );
}

function canReuseAffiliateRecord(record) {
  if (!record || record.video_status !== "completed") return false;
  if (String(record.publish_payload_version || "") !== "v37.14") {
    return false;
  }
  if (Number(record.publish_ready || 0) !== 1) {
    return false;
  }
  const videoPath = String(record.video_path || "").trim();
  if (!videoPath) return false;
  try {
    return fs.existsSync(videoPath);
  } catch {
    return false;
  }
}

function affiliateRecordToResult(record, fallbackTitle = "") {
  const output = String(record?.video_path || "");
  const affiliateUrl = String(record?.affiliate_url || "");
  const publicVideoUrl = output ? buildPublicVideoUrl(output) : "";
  const publicPageUrl = buildPublicPageUrl({
    title: record?.short_title || "",
    desc: record?.short_description || "",
    link: affiliateUrl,
    video: publicVideoUrl,
    image: "",
  });

  return {
    ok: true,
    skipped: true,
    alreadyGenerated: true,
    reason: "SQLITE_ALREADY_GENERATED",
    build: BUILD,
    title: record?.product_title || fallbackTitle || "",
    output,
    publicVideoUrl,
    publicPageUrl,
    affiliateUrl,
    shortTitle: record?.short_title || "",
    shortDescription: record?.short_description || "",
    fullPost: record?.full_post || "",
    facebookPost: record?.facebook_post || "",
    facebookHashtags: record?.facebook_hashtags || "",
    instagramCaption: record?.instagram_caption || "",
    instagramHashtags: record?.instagram_hashtags || "",
    tiktokCaption: record?.tiktok_caption || "",
    tiktokHashtags: record?.tiktok_hashtags || "",
    youtubeShortsTitle: record?.youtube_shorts_title || "",
    youtubeShortsDescription:
      record?.youtube_shorts_description || "",
    youtubeVideoTitle: record?.youtube_video_title || "",
    youtubeVideoDescription:
      record?.youtube_video_description || "",
    youtubeHashtags: record?.youtube_hashtags || "",
    threadsPost: record?.threads_post || "",
    xPost: record?.x_post || "",
    platformStatuses: getPlatformStatuses(record),
    publishReady: Number(record?.publish_ready || 0) === 1,
    publishPayloadVersion: record?.publish_payload_version || "",
    publishSafety: (() => {
      try {
        return JSON.parse(record?.publish_payload_json || "{}")?.safety || null;
      } catch {
        return null;
      }
    })(),
    publishPayload: (() => {
      try {
        return JSON.parse(record?.publish_payload_json || "{}");
      } catch {
        return {};
      }
    })(),
    aiSource: record?.script_source || "",
    videoStatus: record?.video_status || "",
    publishStatus: record?.publish_status || "",
    videoCreatedAt: record?.video_created_at || "",
    productKey: record?.product_key || "",
  };
}

function markAffiliateProcessing(item, title) {
  const productUrl = String(item?.productUrl || "").trim();
  if (!productUrl) return;

  const identity = parseShopeeProductIdentity(productUrl);
  const now = sqliteNow();

  getAffiliateDb().prepare(`
    INSERT INTO affiliate_products (
      product_key, shop_id, product_id,
      product_title, product_url, affiliate_url,
      video_status, publish_status,
      created_at, updated_at, last_error
    )
    VALUES (?, ?, ?, ?, ?, ?, 'processing', 'not_published', ?, ?, '')
    ON CONFLICT(product_key) DO UPDATE SET
      shop_id = excluded.shop_id,
      product_id = excluded.product_id,
      product_title = excluded.product_title,
      product_url = excluded.product_url,
      affiliate_url = CASE
        WHEN excluded.affiliate_url <> '' THEN excluded.affiliate_url
        ELSE affiliate_products.affiliate_url
      END,
      video_status = 'processing',
      updated_at = excluded.updated_at,
      last_error = ''
  `).run(
    identity.key,
    identity.shopId,
    identity.productId,
    String(title || item?.title || "").trim(),
    identity.normalizedUrl || productUrl,
    String(item?.promoUrl || item?.affiliateUrl || "").trim(),
    now,
    now,
  );
}

function saveAffiliateCompleted({
  item,
  title,
  outputFile,
  imageUrls,
  imageHashes,
  mergedScript,
  publishCopy,
  platformCopy,
  publishPayload,
  affiliateUrl,
}) {
  const productUrl = String(item?.productUrl || "").trim();
  if (!productUrl) return null;

  const identity = parseShopeeProductIdentity(productUrl);
  const now = sqliteNow();

  getAffiliateDb().prepare(`
    INSERT INTO affiliate_products (
      product_key, shop_id, product_id,
      product_title, product_url, affiliate_url,
      video_path, video_filename, video_build, video_status,
      publish_status, script_source,
      short_title, short_description, full_post,
      facebook_post, instagram_caption, tiktok_caption,
      youtube_shorts_title, youtube_shorts_description,
      youtube_video_title, youtube_video_description,
      threads_post, x_post,
      facebook_hashtags, instagram_hashtags, tiktok_hashtags, youtube_hashtags,
      hashtags,
      publish_payload_json, publish_payload_version,
      publish_ready, publish_payload_created_at,
      image_urls_json, image_hashes_json,
      created_at, updated_at, video_created_at,
      retry_count, generation_count, last_error
    )
    VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 'completed',
      'not_published', ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      0, 1, ''
    )
    ON CONFLICT(product_key) DO UPDATE SET
      shop_id = excluded.shop_id,
      product_id = excluded.product_id,
      product_title = excluded.product_title,
      product_url = excluded.product_url,
      affiliate_url = excluded.affiliate_url,
      video_path = excluded.video_path,
      video_filename = excluded.video_filename,
      video_build = excluded.video_build,
      video_status = 'completed',
      script_source = excluded.script_source,
      short_title = excluded.short_title,
      short_description = excluded.short_description,
      full_post = excluded.full_post,
      facebook_post = excluded.facebook_post,
      instagram_caption = excluded.instagram_caption,
      tiktok_caption = excluded.tiktok_caption,
      youtube_shorts_title = excluded.youtube_shorts_title,
      youtube_shorts_description = excluded.youtube_shorts_description,
      youtube_video_title = excluded.youtube_video_title,
      youtube_video_description = excluded.youtube_video_description,
      threads_post = excluded.threads_post,
      x_post = excluded.x_post,
      facebook_hashtags = excluded.facebook_hashtags,
      instagram_hashtags = excluded.instagram_hashtags,
      tiktok_hashtags = excluded.tiktok_hashtags,
      youtube_hashtags = excluded.youtube_hashtags,
      hashtags = excluded.hashtags,
      publish_payload_json = excluded.publish_payload_json,
      publish_payload_version = excluded.publish_payload_version,
      publish_ready = excluded.publish_ready,
      publish_payload_created_at = excluded.publish_payload_created_at,
      image_urls_json = excluded.image_urls_json,
      image_hashes_json = excluded.image_hashes_json,
      updated_at = excluded.updated_at,
      video_created_at = excluded.video_created_at,
      retry_count = 0,
      generation_count = affiliate_products.generation_count + 1,
      last_error = ''
  `).run(
    identity.key,
    identity.shopId,
    identity.productId,
    String(title || "").trim(),
    identity.normalizedUrl || productUrl,
    String(affiliateUrl || "").trim(),
    String(outputFile || ""),
    path.basename(String(outputFile || "")),
    BUILD,
    String(mergedScript?.source || ""),
    String(publishCopy?.shortTitle || ""),
    String(publishCopy?.shortDescription || ""),
    String(publishCopy?.fullPost || ""),
    String(platformCopy?.facebookPost || ""),
    String(platformCopy?.instagramCaption || ""),
    String(platformCopy?.tiktokCaption || ""),
    String(platformCopy?.youtubeShortsTitle || ""),
    String(platformCopy?.youtubeShortsDescription || ""),
    String(platformCopy?.youtubeVideoTitle || ""),
    String(platformCopy?.youtubeVideoDescription || ""),
    String(platformCopy?.threadsPost || ""),
    String(platformCopy?.xPost || ""),
    String(platformCopy?.facebookHashtags || ""),
    String(platformCopy?.instagramHashtags || ""),
    String(platformCopy?.tiktokHashtags || ""),
    String(platformCopy?.youtubeHashtags || ""),
    String(mergedScript?.hashtags || mergedScript?.keywords || ""),
    JSON.stringify(publishPayload || {}),
    "v37.14",
    publishPayload?.safety?.ok === true ? 1 : 0,
    now,
    JSON.stringify(Array.isArray(imageUrls) ? imageUrls : []),
    JSON.stringify(Array.isArray(imageHashes) ? imageHashes : []),
    now,
    now,
    now,
  );

  return getAffiliateRecord(productUrl);
}

function saveAffiliateFailed(item, title, error) {
  const productUrl = String(item?.productUrl || "").trim();
  if (!productUrl) return;

  const identity = parseShopeeProductIdentity(productUrl);
  const now = sqliteNow();
  const message = String(error?.message || error || "UNKNOWN_ERROR").slice(0, 2000);

  getAffiliateDb().prepare(`
    INSERT INTO affiliate_products (
      product_key, shop_id, product_id,
      product_title, product_url, affiliate_url,
      video_status, publish_status,
      created_at, updated_at,
      retry_count, last_error
    )
    VALUES (?, ?, ?, ?, ?, ?, 'failed', 'not_published', ?, ?, 1, ?)
    ON CONFLICT(product_key) DO UPDATE SET
      product_title = excluded.product_title,
      product_url = excluded.product_url,
      affiliate_url = CASE
        WHEN excluded.affiliate_url <> '' THEN excluded.affiliate_url
        ELSE affiliate_products.affiliate_url
      END,
      video_status = 'failed',
      updated_at = excluded.updated_at,
      retry_count = affiliate_products.retry_count + 1,
      last_error = excluded.last_error
  `).run(
    identity.key,
    identity.shopId,
    identity.productId,
    String(title || item?.title || "").trim(),
    identity.normalizedUrl || productUrl,
    String(item?.promoUrl || item?.affiliateUrl || "").trim(),
    now,
    now,
    message,
  );
}

function getAffiliateDbSummary() {
  const db = getAffiliateDb();
  const readCount = (sql) => Number(db.prepare(sql).get()?.count || 0);
  const platformCounts = {};
  for (const [platform, columns] of Object.entries(PLATFORM_COLUMNS)) {
    platformCounts[platform] = {
      notPublished: readCount(
        `SELECT COUNT(*) AS count FROM affiliate_products WHERE ${columns.status} = 'not_published'`,
      ),
      queued: readCount(
        `SELECT COUNT(*) AS count FROM affiliate_products WHERE ${columns.status} = 'queued'`,
      ),
      publishing: readCount(
        `SELECT COUNT(*) AS count FROM affiliate_products WHERE ${columns.status} = 'publishing'`,
      ),
      published: readCount(
        `SELECT COUNT(*) AS count FROM affiliate_products WHERE ${columns.status} = 'published'`,
      ),
      failed: readCount(
        `SELECT COUNT(*) AS count FROM affiliate_products WHERE ${columns.status} = 'failed'`,
      ),
    };
  }

  return {
    total: readCount("SELECT COUNT(*) AS count FROM affiliate_products"),
    completed: readCount(
      "SELECT COUNT(*) AS count FROM affiliate_products WHERE video_status = 'completed'",
    ),
    failed: readCount(
      "SELECT COUNT(*) AS count FROM affiliate_products WHERE video_status = 'failed'",
    ),
    pendingPublish: readCount(
      "SELECT COUNT(*) AS count FROM affiliate_products WHERE video_status = 'completed' AND publish_status <> 'published'",
    ),
    published: readCount(
      "SELECT COUNT(*) AS count FROM affiliate_products WHERE publish_status = 'published'",
    ),
    platformCounts,
  };
}

function detectChineseFontFile() {
  const envFont = normalizeEnvString(process.env.RXV_FONT_FILE);
  const candidates = [
    envFont,
    "C:/Windows/Fonts/kaiu.ttf",
    "C:/Windows/Fonts/NotoSansTC-Regular.otf",
    "C:/Windows/Fonts/NotoSansCJKtc-Regular.otf",
    "C:/Windows/Fonts/msjh.ttc",
    "C:/Windows/Fonts/msjhbd.ttc",
    "C:/Windows/Fonts/mingliu.ttc",
  ].filter(Boolean);
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return file;
    } catch {}
  }
  return envFont || "C:/Windows/Fonts/msjh.ttc";
}

const FONT_FILE = detectChineseFontFile();
const FFMPEG_BIN = process.env.FFMPEG_PATH || require("ffmpeg-static");
const EDGE_TTS_VOICE =
  process.env.RXV_EDGE_TTS_VOICE || "zh-TW-HsiaoChenNeural";
const EDGE_TTS_RATE =
  normalizeEnvString(process.env.RXV_EDGE_TTS_RATE) || "-8%";

function summarizeAiErrorText(value, maxLen = 500) {
  const text =
    typeof value === "string"
      ? value
      : value == null
        ? ""
        : JSON.stringify(value);
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
}

function extractGeminiOutputText(data) {
  const parts =
    data?.candidates?.[0]?.content?.parts &&
    Array.isArray(data.candidates[0].content.parts)
      ? data.candidates[0].content.parts
      : [];

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizeGeminiUsage(data) {
  const usage = data?.usageMetadata || {};
  return {
    input_tokens: Number(usage.promptTokenCount || 0),
    output_tokens: Number(usage.candidatesTokenCount || 0),
    total_tokens: Number(
      usage.totalTokenCount ||
        Number(usage.promptTokenCount || 0) +
          Number(usage.candidatesTokenCount || 0),
    ),
  };
}

async function probeGeminiDirect() {
  if (RXV_CSV_COPY_ONLY) {
    return {
      ok: true,
      configured: false,
      connected: false,
      disabled: true,
      primaryModel: "",
      fallbackModel: "",
      error: "V40.5.7 CSV_ONLY_GEMINI_PROBE_DISABLED",
    };
  }
  const apiKey = readGeminiApiKey();

  if (!apiKey) {
    return {
      ok: true,
      configured: false,
      connected: false,
      primaryModel: GEMINI_MODELS[0] || "",
      fallbackModel: GEMINI_MODELS[1] || "",
      error: "GEMINI_API_KEY_NOT_SET",
    };
  }

  const modelResults = [];

  for (const model of GEMINI_MODELS) {
    try {
      const response = await axios.get(
        `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}?key=${encodeURIComponent(apiKey)}`,
        {
          timeout: 8000,
          validateStatus: () => true,
        },
      );

      modelResults.push({
        model,
        ok: response.status >= 200 && response.status < 300,
        httpStatus: response.status,
        error:
          response.status >= 200 && response.status < 300
            ? ""
            : summarizeAiErrorText(
                response?.data?.error?.message ||
                  response?.data?.error ||
                  response?.data,
              ),
      });
    } catch (error) {
      modelResults.push({
        model,
        ok: false,
        httpStatus: 0,
        error: error?.message || "GEMINI_PROBE_FAILED",
      });
    }
  }

  return {
    ok: modelResults.some((item) => item.ok),
    configured: true,
    connected: modelResults.some((item) => item.ok),
    primaryModel: GEMINI_MODELS[0] || "",
    fallbackModel: GEMINI_MODELS[1] || "",
    models: modelResults,
    error: modelResults.some((item) => item.ok)
      ? ""
      : "GEMINI_MODELS_NOT_AVAILABLE",
  };
}

async function getGeminiScript(title, productUrl, promoUrl, item = {}) {
  const apiKey = readGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_NOT_SET");
  }

  const prompt = buildOpenClawCopyPrompt({
    title,
    productUrl,
    promoUrl,
    item,
  });

  const finalPrompt = [
    prompt.instructions,
    "",
    prompt.input,
  ].join("\n");

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: finalPrompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const failures = [];

  for (const model of GEMINI_MODELS) {
    const url =
      `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}` +
      `:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await axios.post(url, payload, {
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
        timeout: 75000,
        validateStatus: () => true,
      });

      if (response.status === 429) {
        failures.push(`${model}:429`);
        console.warn("[gemini-direct] rate limited", { model });
        continue;
      }

      if (response.status < 200 || response.status >= 300) {
        const detail = summarizeAiErrorText(
          response?.data?.error?.message ||
            response?.data?.error ||
            response?.data,
        );
        failures.push(`${model}:${response.status}:${detail}`);
        console.warn("[gemini-direct] http failed", {
          model,
          status: response.status,
          detail,
        });
        continue;
      }

      const outputText = extractGeminiOutputText(response.data);
      if (!outputText) {
        failures.push(`${model}:empty`);
        continue;
      }

      let parsed;
      try {
        parsed = parseJsonObjectFromText(outputText);
      } catch (error) {
        failures.push(
          `${model}:parse:${error?.message || "GEMINI_OUTPUT_NOT_JSON"}`,
        );
        continue;
      }

      const usage = normalizeGeminiUsage(response.data);
      const normalized = normalizeAiResponse(
        {
          ...parsed,
          source: `gemini-direct-${model}`,
          usage,
        },
        title,
      );

      console.log("[gemini-direct] copy ok", {
        model,
        title: cleanProductTitle(title).slice(0, 50),
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.total_tokens,
      });

      return {
        ...normalized,
        aiProvider: "gemini",
        aiModel: model,
        aiFallbackChain: failures,
      };
    } catch (error) {
      failures.push(`${model}:fetch:${error?.message || "UNKNOWN"}`);
      console.warn("[gemini-direct] request failed", {
        model,
        error: error?.message || String(error),
      });
    }
  }

  const error = new Error(
    `GEMINI_ALL_MODELS_FAILED: ${failures.join(" | ") || "unknown"}`,
  );
  error.failures = failures;
  throw error;
}

function resolveOpenClawConfigSecret(value) {
  const raw = normalizeEnvString(value || "");
  if (!raw) return "";

  const envMatch = raw.match(/^\$\{([A-Z0-9_]+)\}$/i);
  if (envMatch) {
    return normalizeEnvString(process.env[envMatch[1]] || "");
  }

  return raw;
}

function readOpenClawGatewayToken() {
  const envToken = normalizeEnvString(
    process.env.RXV_OPENCLAW_GATEWAY_TOKEN ||
      process.env.OPENCLAW_GATEWAY_TOKEN ||
      "",
  );
  if (envToken) return envToken;

  try {
    const raw = fs.readFileSync(OPENCLAW_CONFIG_FILE, "utf8");
    const config = JSON.parse(raw);
    return resolveOpenClawConfigSecret(config?.gateway?.auth?.token);
  } catch (error) {
    console.warn(
      "[openclaw-native] token read failed",
      error?.message || error,
    );
    return "";
  }
}

function openClawTokenStatus() {
  try {
    if (!fs.existsSync(OPENCLAW_CONFIG_FILE)) {
      return {
        configFound: false,
        tokenFound: false,
      };
    }
    return {
      configFound: true,
      tokenFound: !!readOpenClawGatewayToken(),
    };
  } catch {
    return {
      configFound: false,
      tokenFound: false,
    };
  }
}

function extractOpenClawOutputText(data) {
  const output = Array.isArray(data?.output) ? data.output : [];
  const pieces = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part?.text === "string") {
        pieces.push(part.text);
      }
    }
  }

  return pieces.join("\n").trim();
}

function parseJsonObjectFromText(text) {
  let raw = String(text || "").trim();
  if (!raw) {
    throw new Error("OPENCLAW_EMPTY_OUTPUT");
  }

  raw = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(raw);
  } catch {}

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(raw.slice(first, last + 1));
    } catch {}
  }

  throw new Error("OPENCLAW_OUTPUT_NOT_JSON");
}

async function probeOpenClawNative() {
  const token = readOpenClawGatewayToken();
  const tokenStatus = openClawTokenStatus();

  if (!token) {
    return {
      ok: false,
      connected: false,
      ...tokenStatus,
      error: "OPENCLAW_GATEWAY_TOKEN_NOT_FOUND",
    };
  }

  try {
    const response = await axios.get(OPENCLAW_NATIVE_MODELS_URL, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      timeout: 6000,
      validateStatus: () => true,
    });

    const models = Array.isArray(response?.data?.data)
      ? response.data.data
          .map((x) => String(x?.id || "").trim())
          .filter(Boolean)
      : [];

    if (response.status < 200 || response.status >= 300) {
      return {
        ok: false,
        connected: false,
        ...tokenStatus,
        httpStatus: response.status,
        error:
          response?.data?.error?.message ||
          response?.data?.error ||
          `OPENCLAW_HTTP_${response.status}`,
      };
    }

    return {
      ok: true,
      connected: true,
      ...tokenStatus,
      httpStatus: response.status,
      models,
    };
  } catch (error) {
    return {
      ok: false,
      connected: false,
      ...tokenStatus,
      error: error?.message || "OPENCLAW_NATIVE_PROBE_FAILED",
    };
  }
}


function buildSafePainAngle(title = "") {
  const source = String(title || "");
  const has = (pattern) => pattern.test(source);

  const angle = {
    category: "general",
    pain: "網購選擇多，最怕看不出差別",
    hook: "同類商品很多，不知道怎麼挑？",
    benefit: "先看商品名稱裡明示的設計與特色",
    cta: "點連結看完整商品資訊",
    evidence: [],
  };

  if (has(/枕|枕頭|寢具|床墊|護頸/)) {
    angle.category = "sleep";
    if (has(/水洗|可水洗/)) {
      angle.pain = "枕頭天天用，清潔整理最麻煩";
      angle.hook = "枕頭天天用，最怕不好清潔？";
      angle.benefit = "這款商品名稱明示可水洗";
      angle.evidence.push("可水洗");
    } else if (has(/涼感|冰涼|天絲/)) {
      angle.pain = "天氣悶熱時，枕頭材質也會影響使用感受";
      angle.hook = "天氣熱，枕頭材質也想挑清爽一點？";
      angle.benefit = "商品名稱明示涼感／天絲材質";
      angle.evidence.push("涼感/天絲");
    } else if (has(/獨立筒/)) {
      angle.pain = "枕頭款式很多，結構差異不容易一眼看懂";
      angle.hook = "枕頭款式很多，結構差在哪？";
      angle.benefit = "這款主打獨立筒設計";
      angle.evidence.push("獨立筒");
    }
    if (has(/一年保固|1年保固/)) angle.evidence.push("一年保固");
    if (has(/石墨烯/)) angle.evidence.push("石墨烯");
  } else if (has(/雨衣|防水|雨具/)) {
    angle.category = "rainwear";
    if (has(/側開|側穿|秒穿/)) {
      angle.pain = "突然下雨時，最怕雨衣穿脫花時間";
      angle.hook = "突然下雨，還在手忙腳亂穿雨衣？";
      angle.benefit = "商品名稱明示側開／側穿／秒穿設計";
      angle.evidence.push("側開/側穿/秒穿");
    } else if (has(/背包|加大/)) {
      angle.pain = "騎車遇雨，還要顧後背包最麻煩";
      angle.hook = "下雨騎車，背包也怕一起淋濕？";
      angle.benefit = "商品名稱明示加大／背包雨衣設計";
      angle.evidence.push("加大/背包");
    } else {
      angle.pain = "突然下雨時，最怕臨時找不到合適雨具";
      angle.hook = "突然下雨，雨具準備好了嗎？";
      angle.benefit = "先看商品頁的雨衣設計與尺寸資訊";
    }
  } else if (has(/巧克力|餅乾|零食|甜點|糖果|食品|千絲酥|拉絲/)) {
    angle.category = "food";
    if (has(/夾心|拉絲|千絲酥|酥/)) {
      angle.pain = "一般零食吃膩了，會想換點不同口感";
      angle.hook = "一般巧克力吃膩了？想換點不同口感？";
      angle.benefit = "商品名稱明示夾心／千絲酥／拉絲等口感特色";
      angle.evidence.push("夾心/千絲酥/拉絲");
    } else if (has(/開心果/)) {
      angle.pain = "想換口味時，最怕看半天還是不知道差在哪";
      angle.hook = "想換個不同口味的甜點？";
      angle.benefit = "商品名稱明示開心果口味";
      angle.evidence.push("開心果");
    } else {
      angle.pain = "零食選擇很多，最怕買到不是自己想要的口感";
      angle.hook = "零食選擇那麼多，先看口味特色？";
      angle.benefit = "先看商品名稱明示的口味與內容";
    }
    if (has(/迪拜風格|迪拜風味/)) angle.evidence.push("迪拜風格/迪拜風味");
  } else if (has(/收納|大容量|容量|背包|包包/)) {
    angle.category = "storage";
    if (has(/大容量|加大/)) {
      angle.pain = "東西一多，最怕空間不夠裝";
      angle.hook = "東西越帶越多，空間總是不夠？";
      angle.benefit = "商品名稱明示大容量／加大設計";
      angle.evidence.push("大容量/加大");
    }
  } else if (has(/清潔|拖把|吸塵|洗|刷|抹布/)) {
    angle.category = "cleaning";
    angle.pain = "日常清潔最怕步驟多、整理起來麻煩";
    angle.hook = "清潔用品很多，最怕越用越麻煩？";
    angle.benefit = "先看商品名稱明示的清潔設計與用途";
  } else if (has(/充電|電池|行動電源|快充/)) {
    angle.category = "electronics";
    if (has(/快充/)) {
      angle.pain = "臨時要用電，最怕充電速度跟不上";
      angle.hook = "急著補電時，最怕充太慢？";
      angle.benefit = "商品名稱明示快充設計";
      angle.evidence.push("快充");
    }
  }

  return angle;
}

function isWeakPainHook(value = "") {
  const text = String(value || "").trim();
  if (!text) return true;

  const weak = [
    "尋找合適",
    "正在找",
    "找這款",
    "來看看這款",
    "挑選真猶豫",
    "不知道怎麼選",
    "商品介紹",
    "商品資訊",
    "看看這款",
    "想了解這款",
  ];

  return weak.some((item) => text.includes(item));
}


function rxvNormalizeCompareText(value = "") {
  return String(value || "")
    .replace(/[，。！？、；：,.!?;:\s]/g, "")
    .trim();
}

function rxvLinesTooSimilar(a = "", b = "") {
  const x = rxvNormalizeCompareText(a);
  const y = rxvNormalizeCompareText(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 6 && y.includes(x)) return true;
  if (y.length >= 6 && x.includes(y)) return true;
  return false;
}

function buildNaturalSceneSuggestions(title = "", angle = {}) {
  const source = String(title || "");
  const category = String(angle?.category || "general");
  const has = (pattern) => pattern.test(source);

  const plan = {
    hookTitle: angle?.hook || "這個使用情境你也遇過嗎？",
    hookSub: angle?.pain || "先看看商品特色是不是你在找的",
    featureTitle: "",
    featureSub: "",
    ctaTitle: "還想看看完整內容？",
    ctaSub: "點連結看完整商品資訊",
  };

  if (category === "sleep") {
    if (has(/水洗|可水洗/)) {
      plan.hookTitle = "枕頭天天用，清潔真的麻煩？";
      plan.hookSub = "想找能水洗的款式？";
    } else if (has(/涼感|天絲/)) {
      plan.hookTitle = "天氣熱，枕頭也想挑清爽一點？";
      plan.hookSub = "先看看材質與設計差異";
    }

    if (has(/水洗|可水洗/) && has(/涼感|天絲/)) {
      plan.featureTitle = "可水洗＋涼感天絲";
    } else if (has(/水洗|可水洗/)) {
      plan.featureTitle = "主打可水洗設計";
    } else if (has(/涼感|天絲/)) {
      plan.featureTitle = "主打涼感天絲材質";
    }

    if (has(/石墨烯/) && has(/獨立筒/)) {
      plan.featureSub = "石墨烯獨立筒設計";
    } else if (has(/獨立筒/)) {
      plan.featureSub = "採用獨立筒設計";
    } else if (has(/石墨烯/)) {
      plan.featureSub = "商品名稱標示石墨烯";
    }

    if (has(/一年保固|1年保固/)) {
      plan.ctaTitle = "還提供一年保固";
    } else {
      plan.ctaTitle = "還想看看商品細節？";
    }
    plan.ctaSub = "點連結看完整商品資訊";
  }

  if (category === "food") {
    if (has(/巧克力/)) {
      plan.hookTitle = "一般巧克力吃膩了？";
      plan.hookSub = "想換點不同口感？";
    } else {
      plan.hookTitle = "一般零食吃膩了？";
      plan.hookSub = "想換點不同口感？";
    }

    if (has(/開心果/) && has(/千絲酥|夾心/)) {
      plan.featureTitle = "開心果＋千絲酥夾心";
    } else if (has(/千絲酥|夾心/)) {
      plan.featureTitle = "千絲酥＋夾心口感";
    } else if (has(/開心果/)) {
      plan.featureTitle = "主打開心果口味";
    }

    if (has(/拉絲/)) {
      plan.featureSub = "還有拉絲口感特色";
    } else if (has(/迪拜風格|迪拜風味/)) {
      plan.featureSub = "迪拜風格口味選擇";
    }

    plan.ctaTitle = "下午茶想換個新口味？";
    plan.ctaSub = "點連結看完整商品資訊";
  }

  if (category === "rainwear") {
    if (has(/側開|側穿|秒穿/)) {
      plan.hookTitle = "突然下雨，穿雨衣還在手忙腳亂？";
      plan.hookSub = "通勤趕時間更麻煩";
      plan.featureTitle = "側開／秒穿設計";
    } else {
      plan.hookTitle = "突然下雨，雨具準備好了嗎？";
      plan.hookSub = "通勤騎車先看實用設計";
    }

    if (has(/背包|加大/)) {
      plan.featureSub = "加大空間可顧到背包";
    }

    plan.ctaTitle = "想看看完整款式資訊？";
    plan.ctaSub = "點連結看完整商品資訊";
  }

  if (category === "storage") {
    plan.hookTitle = "東西越帶越多，空間總是不夠？";
    plan.hookSub = "收納最怕一下就塞滿";
    if (has(/大容量|加大/)) {
      plan.featureTitle = "主打大容量／加大設計";
    }
    plan.ctaTitle = "想看看實際商品細節？";
    plan.ctaSub = "點連結看完整商品資訊";
  }

  if (category === "electronics") {
    if (has(/快充/)) {
      plan.hookTitle = "急著補電時，最怕充太慢？";
      plan.hookSub = "臨時要用更容易焦急";
      plan.featureTitle = "商品名稱明示快充";
    }
    plan.ctaTitle = "想看看完整商品資訊？";
    plan.ctaSub = "點連結看商品詳情";
  }

  return plan;
}

function rxvNaturalizeVideoScript(script, title = "") {
  if (!script || typeof script !== "object") return script;

  const safe = { ...script };
  const angle = buildSafePainAngle(title);
  const plan = buildNaturalSceneSuggestions(title, angle);

  const titles = Array.isArray(safe.sceneTitles)
    ? [...safe.sceneTitles]
    : [];
  const subs = Array.isArray(safe.sceneSubtitles)
    ? [...safe.sceneSubtitles]
    : [];

  const mechanical = /(查看|詳細|商品資訊|商品詳情|完整規格|來看看商品|點擊連結)/;
  const overpromise = /(不再是困擾|不再麻煩|徹底解決|完全解決|一次解決)/;

  const forcePlanCategories = new Set([
    "sleep",
    "food",
    "rainwear",
    "storage",
    "electronics",
  ]);
  const forcePlan = forcePlanCategories.has(
    String(angle?.category || ""),
  );

  if (forcePlan) {
    // V37.12: the plan is already built from title-supported evidence.
    // Use it directly so Gemini cannot replace it later with weaker or
    // unsupported effect wording.
    if (plan.hookTitle) titles[0] = plan.hookTitle;
    if (plan.hookSub) subs[0] = plan.hookSub;
    if (plan.featureTitle) titles[1] = plan.featureTitle;
    if (plan.featureSub) subs[1] = plan.featureSub;
    if (plan.ctaTitle) titles[2] = plan.ctaTitle;
    if (plan.ctaSub) subs[2] = plan.ctaSub;
  } else {
    if (!titles[0] || isWeakPainHook(titles[0])) {
      titles[0] = plan.hookTitle;
    }

    if (
      !subs[0] ||
      isWeakPainHook(subs[0]) ||
      overpromise.test(subs[0]) ||
      rxvLinesTooSimilar(titles[0], subs[0])
    ) {
      subs[0] = plan.hookSub;
    }

    if ((!titles[1] || isWeakPainHook(titles[1])) && plan.featureTitle) {
      titles[1] = plan.featureTitle;
    }
    if (
      (!subs[1] ||
        isWeakPainHook(subs[1]) ||
        rxvLinesTooSimilar(titles[1], subs[1])) &&
      plan.featureSub
    ) {
      subs[1] = plan.featureSub;
    }

    if (!titles[2] || mechanical.test(titles[2])) {
      titles[2] = plan.ctaTitle;
    }
    if (
      !subs[2] ||
      mechanical.test(subs[2]) ||
      rxvLinesTooSimilar(titles[2], subs[2])
    ) {
      subs[2] = plan.ctaSub;
    }
  }

  safe.sceneTitles = titles.slice(0, 3);
  safe.sceneSubtitles = subs.slice(0, 3);

  if (forcePlan) {
    const planVoiceText = rxvBuildVoiceTextFromNaturalPlan(plan);
    if (planVoiceText) {
      safe.voiceText = planVoiceText;
    }
  }

  // Clean a few mechanical phrases across the text output.
  const naturalizeText = (value) =>
    String(value || "")
      .replace(/日常清潔不再是困擾/g, "可水洗，日常清潔更方便")
      .replace(/查看完整商品資訊與規格/g, "還想看看完整內容？")
      .replace(/點連結查看詳細規格/g, "點連結看完整商品資訊")
      .replace(/來看看商品詳細資訊/g, "還想看看商品細節？")
      .replace(/點擊連結查看詳情/g, "點連結看完整商品資訊")
      .replace(/參考這款/g, "可以看看這款")
      .replace(/詳情見連結/g, "商品資訊看連結")
      .replace(/，?日常使用更輕鬆/g, "")
      .replace(/，?使用起來更輕鬆/g, "")
      .replace(/，?讓生活更方便/g, "")
      .replace(/，?清潔不再是困擾/g, "，可水洗設計方便日常整理")
      .trim();

  const textFields = [
    "voiceText",
    "shortDescription",
    "fullPost",
    "facebookPost",
    "instagramCaption",
    "tiktokCaption",
    "youtubeShortsTitle",
    "youtubeShortsDescription",
    "youtubeVideoTitle",
    "youtubeVideoDescription",
    "threadsPost",
    "xPost",
  ];

  for (const key of textFields) {
    if (typeof safe[key] === "string") {
      safe[key] = naturalizeText(safe[key]);
    }
  }

  safe.naturalScenePlan = plan;
  return safe;
}

function enhanceWithSafePainAngle(script, title = "") {
  if (!script || typeof script !== "object") return script;

  const safe = { ...script };
  const angle = buildSafePainAngle(title);

  // Pain/hook should be attention-grabbing, but only based on title-supported features.
  if (isWeakPainHook(safe.pain)) {
    safe.pain = angle.pain;
  }
  if (isWeakPainHook(safe.hook)) {
    safe.hook = angle.hook;
  }

  const titles = Array.isArray(safe.sceneTitles)
    ? [...safe.sceneTitles]
    : [];
  const subs = Array.isArray(safe.sceneSubtitles)
    ? [...safe.sceneSubtitles]
    : [];

  if (!titles[0] || isWeakPainHook(titles[0])) {
    titles[0] = angle.hook;
  }
  if (!subs[0] || isWeakPainHook(subs[0])) {
    subs[0] = angle.pain;
  }

  // Keep the last scene informational.
  if (!titles[2] || /下單|搶購|一定要買|手刀|快點|趕快/.test(titles[2])) {
    titles[2] = angle.cta;
  }
  if (!subs[2] || /下單|搶購|一定要買|手刀|快點|趕快/.test(subs[2])) {
    subs[2] = "查看商品詳情";
  }

  safe.sceneTitles = titles.slice(0, 3);
  safe.sceneSubtitles = subs.slice(0, 3);
  safe.safePainCategory = angle.category;
  safe.safePainEvidence = angle.evidence;
  safe.safePainAngle = angle;

  return safe;
}

function buildOpenClawCopyPrompt({
  title,
  productUrl,
  promoUrl,
  item,
}) {
  const selectedPlatforms = normalizeRequestedPlatforms(
    item?.selectedPlatforms,
  );

  const safePainAngle = buildSafePainAngle(title);

  const facts = {
    productTitle: cleanProductTitle(title),
    productUrl: String(productUrl || "").trim(),
    affiliateUrl: String(promoUrl || "").trim(),
    price: String(item?.price || "").trim(),
    reviewRating: String(item?.reviewRating || "").trim(),
    reviewCount: String(item?.reviewCount || "").trim(),
    reviewSummary: String(item?.reviewSummary || "").trim(),
    selectedPlatforms,
    safePainAngle,
  };

  return {
    instructions: [
      "你是 RXV 的台灣 Shopee 分潤短影音文案專員。",
      "你只負責文字，不使用瀏覽器、搜尋、檔案、程式或其他工具。",
      "一次 API 呼叫完成 15 秒影片文案與使用者勾選的平台文案。",
      "未勾選的平台欄位回空字串或空陣列，不要為它額外寫文案。",
      "只能使用提供的商品名稱、價格、評價摘要與網址中已明示的資訊。",
      "不得捏造材質、認證、療效、保固、銷量、折扣、尺寸、功能、產地、進口來源、人氣、爆款、激推、原廠、官方、品牌授權、熱門、很多人討論、大家都在看、大家都在買、大家都在用、很多人都在看、網路上很紅或使用者評價。",
      "所有文字使用自然繁體中文、台灣口吻，不要 SEO 關鍵字堆疊，不要誇大。",
      "價格會變動：sceneTitles、sceneSubtitles、voiceText 一律不要寫死價格。",
      "若商品屬於枕頭、寢具、保健、美容、身體用品：除非來源明示，不得寫改善睡眠、好睡、肩頸痠痛、治療、療效、支撐肩頸、適合側睡/仰睡、改善疲勞、舒緩、修復、抗老等效果。",
      "若商品屬於食品：除非來源明示，不得寫爆款、激推、正宗、進口、來自某國、一吃上癮、保證好吃、最夯、銷量第一、大家都在討論、很多人討論、大家都在看、大家都在買、大家都在用、很多人都在看、網路上很紅、近期熱門、話題商品等宣稱。",
      "若商品名稱只寫『迪拜風格／迪拜風味』，只能沿用『迪拜風格／迪拜風味』，不可改寫成『來自迪拜／正宗迪拜／迪拜進口』。",
      "CTA 要自然、中性，優先使用『點連結看商品資訊』『查看完整規格』『看看商品詳情』；不要使用『手刀下單』『立即搶購』『一定要買』。",
      "第三幕以資訊型 CTA 為主，不要硬推購買。",
      "若來源只寫『一年保固』，文案只能寫『一年保固／提供一年保固』，不可自行加『原廠／官方／品牌保固』。",
      "若來源沒有提供尺寸、規格數值、認證或產地，不得自行寫這些具體資訊；CTA 改成『查看完整商品資訊』。",
      "15 秒影片：生活痛點 Hook → 商品名稱可確認的賣點/解法 → 中性 CTA。",
      "文案不能只做商品介紹；第一幕一定要讓觀眾感覺『這正是我的困擾／情境』。",
      "可以把商品名稱中明示的特色反推成生活痛點，例如：可水洗→清潔麻煩、涼感→悶熱使用感、側開秒穿→穿脫麻煩、大容量→東西裝不下、夾心/拉絲→一般口感吃膩。",
      "但痛點只能從 safePainAngle 與商品名稱明示特色延伸，不得自行創造疾病、療效、誇張結果或不存在的功能。",
      "第一幕優先使用 safePainAngle.hook / safePainAngle.pain 的方向，不要寫成『尋找合適商品嗎』『來看看這款』『商品介紹』這種沒有吸引力的句子。",
      "voiceText 約 45～68 個中文字。",
      "sceneTitles 必須剛好 3 個，每個盡量 16 字內。",
      "sceneSubtitles 必須剛好 3 個，每個盡量 14 字內。",
      "每一幕上下兩句要分工：上句抓情境／重點，下句補充另一個資訊；不要同義重複。",
      "字幕要像真人短影音口吻，不要像網站按鈕或產品規格表。",
      "第二行不得寫『不再是困擾／徹底解決／完全解決』這種保證結果。",
      "第三幕上句可用自然問句或降低疑慮的資訊，例如『還提供一年保固』『下午茶想換個新口味？』『還想看看商品細節？』；下句再放 CTA。",
      "對 sleep、food、rainwear、storage、electronics 類別，後端會以 naturalScenePlan 為影片字幕最終版本；你的平台文案也應盡量沿用同一痛點與賣點，不要自行添加效果宣稱。",
      "fullPost 是通用備援貼文，保留 [affiliateUrl] 連結佔位符。",
      "hashtags 使用 #Hashtag 並以空格分隔，不使用逗號。",
      "只為 selectedPlatforms 中的平台產文案：",
      "facebook：第一句用生活痛點 Hook，再接商品可確認賣點；CTA 可直接放 [affiliateUrl]，連結放文末。",
      "instagram：Reels 情境口吻，第一句先寫生活痛點；不要在文案內塞裸網址，CTA 寫『商品資訊看個人檔案連結』。",
      "tiktok：約 30～90 字，前一句直接用生活痛點 Hook，第二句帶商品特色；不要塞裸網址，CTA 寫『商品資訊看個人檔案／商品連結』。",
      "youtube_shorts：標題盡量 45 字內，以痛點/情境為主；Shorts 說明不要塞裸網址，CTA 寫『商品資訊看頻道首頁或說明』。",
      "youtube_video：標題盡量 60 字內，說明 180～450 字；可在商品資訊段落放 [affiliateUrl]。",
      "各平台正文不要自行塞 #Hashtag；Hashtag 只放到對應 hashtags 欄位，後端會在發布時組合一次。",
      "平台正文避免『體驗、感受、更輕鬆、讓生活更方便』等來源無法直接證明的結果式語句，改寫成商品名稱可確認的材質、結構、口感或使用情境。",
      "不得使用『很多人最怕／很多人推薦／大家都推薦』等未提供證據的社會證明句。",
      "來源沒有優惠、折扣、特價、促銷資訊時，任何平台都不得寫『優惠』。",
      "Hashtag 不得從長商品名直接截斷；後端會依商品名稱中明示的類別與特色建立安全 Hashtag。",
      "最終發布 payload 不允許殘留 [affiliateUrl] 等佔位符。",
      "threads：真人分享感，60～180 字，可自然放 [affiliateUrl]。",
      "x：精簡，260 個中文字內，可自然放 [affiliateUrl]。",
      "只輸出一個合法 JSON 物件，不要 Markdown，不要解釋。",
    ].join("\\n"),
    input: JSON.stringify(
      {
        task: "rxv_shopee_affiliate_copywriter",
        lang: "zh-TW",
        facts,
        requiredJsonSchema: {
          pain: "string",
          benefit: "string",
          proof: "string",
          cta: "string",
          sceneTitles: ["string", "string", "string"],
          sceneSubtitles: ["string", "string", "string"],
          voiceText: "string",
          shortTitle: "string",
          shortDescription: "string",
          fullPost: "string",
          keywords: ["string"],
          hashtags: ["string"],
          facebookPost: "string",
          facebookHashtags: ["string"],
          instagramCaption: "string",
          instagramHashtags: ["string"],
          tiktokCaption: "string",
          tiktokHashtags: ["string"],
          youtubeShortsTitle: "string",
          youtubeShortsDescription: "string",
          youtubeVideoTitle: "string",
          youtubeVideoDescription: "string",
          youtubeHashtags: ["string"],
          threadsPost: "string",
          xPost: "string",
        },
      },
      null,
      2,
    ),
  };
}

console.log("[video-quality]", {
  build: BUILD,
  fontFile: FONT_FILE,
  ttsVoice: EDGE_TTS_VOICE,
  ttsRate: EDGE_TTS_RATE,
  outputDir: DEFAULT_OUTPUT_DIR,
  geminiDirect: {
    csvCopyOnly: RXV_CSV_COPY_ONLY,
    primaryModel: GEMINI_MODELS[0] || "",
    fallbackModel: GEMINI_MODELS[1] || "",
    apiKeyFound: !!readGeminiApiKey(),
  },
  openClawFallback: {
    baseUrl: OPENCLAW_NATIVE_BASE_URL,
    agentId: OPENCLAW_AGENT_ID,
    configFile: OPENCLAW_CONFIG_FILE,
    tokenFound: !!readOpenClawGatewayToken(),
  },
});

const app = express();

try {
  initAffiliateDb();
} catch (error) {
  console.error("[affiliate-db] init failed", error?.message || error);
}
app.use(express.json({ limit: "20mb" }));

const ALLOWED_ORIGINS = ["http://localhost:3005", "http://127.0.0.1:3005"];

function isAllowedLocalOrigin(origin) {
  const value = String(origin || "");
  return (
    ALLOWED_ORIGINS.includes(value) ||
    /^chrome-extension:\/\/[a-p]{32}$/i.test(value) ||
    /^edge-extension:\/\/[a-p]{32}$/i.test(value)
  );
}

function isTikTokPublisherVideoBridgeOrigin(origin) {
  const value = String(origin || "");
  return /^https:\/\/(?:www\.)?tiktok\.com$/i.test(value);
}

function isPublisherVideoBridgeRequest(req) {
  return /^\/publisher-extension\/video-file\//i.test(String(req.path || ""));
}

function applyRxvCors(req, res) {
  const origin = String(req.headers.origin || "");
  const publisherVideoBridge = isPublisherVideoBridgeRequest(req);
  const allowed =
    isAllowedLocalOrigin(origin) ||
    (publisherVideoBridge && isTikTokPublisherVideoBridgeOrigin(origin));

  if (!allowed) return;

  res.set("Access-Control-Allow-Origin", origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Credentials", "true");

  if (publisherVideoBridge) {
    res.set("Access-Control-Allow-Private-Network", "true");
  }
}

app.use((req, res, next) => {
  applyRxvCors(req, res);
  next();
});

app.options("*", (req, res) => {
  applyRxvCors(req, res);
  res.sendStatus(200);
});


// V40.0: official TikTok Login Kit + Content Posting API.
// This replaces TikTok Studio DOM/file-input automation.
const tiktokOfficial = createTikTokOfficialApi();
tiktokOfficial.registerRoutes(app);


// V40.3: TikTok one-click scheduling + Shopee mobile publishing assistant.
registerRxvV403Helper(app, { root: ROOT, dbPath: AFFILIATE_DB_PATH });

function ensureDirSync(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeName(input) {
  return (
    String(input || "video")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "video"
  );
}

function escapeText(input) {
  return String(input || "")
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\n/g, " ");
}

function cleanProductTitle(input = "") {
  return String(input || "")
    .replace(/現貨隔日達🚀/g, "")
    .replace(/💛\s*當天發貨\+隔日達\s*💛/g, "")
    .replace(/現貨隔日達/g, "")
    .replace(/當天發貨\+隔日達/g, "")
    .replace(/[🚀💛]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSafeOutput(expectedOutput, title) {
  const baseDir = path.isAbsolute(expectedOutput || "")
    ? path.dirname(expectedOutput)
    : DEFAULT_OUTPUT_DIR;
  ensureDirSync(baseDir);
  if (expectedOutput && path.extname(expectedOutput).toLowerCase() === ".mp4") {
    return expectedOutput;
  }
  const file = `${sanitizeName(title)}_${Date.now()}.mp4`;
  return path.join(baseDir, file);
}

function makeSafeStorageName(ext = ".mp4") {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}_${rand}${ext}`;
}

function slugifyTitle(input = "") {
  return (
    String(input || "")
      .replace(/[🚀💛]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "item"
  );
}

function buildPublicVideoUrl(outputFile) {
  return `${PUBLIC_VIDEO_BASE_URL}/public-video/${encodeURIComponent(path.basename(outputFile || "video.mp4"))}`;
}

function buildPublicPageUrl({ title, desc, link, video, image }) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (desc) params.set("desc", desc);
  if (link) params.set("link", link);
  if (video) params.set("video", video);
  if (image) params.set("image", image);
  return `${PUBLIC_SITE_URL}${DEFAULT_GOODS_PATH}?${params.toString()}`;
}

async function uploadVideoToSupabase(localFilePath, filename) {
  if (
    !SUPABASE_PROJECT_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !SUPABASE_STORAGE_BUCKET
  ) {
    return { ok: false, error: "SUPABASE_STORAGE_ENV_MISSING" };
  }

  const fileBuffer = await fsp.readFile(localFilePath);
  const ext =
    path.extname(filename || localFilePath || "").toLowerCase() || ".mp4";
  const safeStorageName = makeSafeStorageName(ext);
  const objectPath = `videos/${safeStorageName}`;
  const uploadUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${objectPath}`;

  try {
    const res = await axios.post(uploadUrl, fileBuffer, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "video/mp4",
        "x-upsert": "true",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      return {
        ok: false,
        error:
          typeof res.data === "string"
            ? res.data
            : JSON.stringify(res.data || {}),
        status: res.status,
      };
    }

    const publicUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${objectPath}`;
    return { ok: true, objectPath, publicUrl };
  } catch (error) {
    return { ok: false, error: error?.message || "UPLOAD_FAILED" };
  }
}

function extFromContentType(contentType) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("png")) return ".png";
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  if (ct.includes("gif")) return ".gif";
  return ".img";
}

async function fetchBuffer(rawUrl) {
  const u = new URL(rawUrl);
  const mod = u.protocol === "https:" ? https : http;
  const rejectUnauthorized =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0" ? false : true;

  return await new Promise((resolve, reject) => {
    const req = mod.get(
      rawUrl,
      {
        headers: {
          "user-agent": "Mozilla/5.0 RxV/1.0",
          accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
        ...(u.protocol === "https:" ? { rejectUnauthorized } : {}),
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          resolve(
            fetchBuffer(new URL(res.headers.location, rawUrl).toString()),
          );
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`IMAGE_HTTP_${res.statusCode}`));
            return;
          }
          resolve({
            buffer: buf,
            contentType: res.headers["content-type"] || "",
            finalUrl: rawUrl,
          });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("IMAGE_TIMEOUT")));
  });
}

async function downloadImages(imageUrls, workDir) {
  const files = [];
  const hashes = [];
  const seenHash = new Set();

  for (const url of imageUrls) {
    if (!url) continue;
    const { buffer, contentType } = await fetchBuffer(url);
    const hash = crypto.createHash("sha1").update(buffer).digest("hex");
    if (seenHash.has(hash)) continue;
    seenHash.add(hash);
    const ext = extFromContentType(contentType);
    const file = path.join(
      workDir,
      `raw_${String(files.length + 1).padStart(2, "0")}${ext}`,
    );
    await fsp.writeFile(file, buffer);
    files.push(file);
    hashes.push(hash);
    console.log(
      `[render-from-images] image file=${file} sha1=${hash} size=${buffer.length}`,
    );
    if (files.length >= 3) break;
  }

  if (files.length < 3) {
    throw new Error(`NEED_3_IMAGES_ONLY_GOT_${files.length}`);
  }
  return { files, hashes };
}

function ffprobeDuration(file) {
  return new Promise((resolve) => {
    execFile(
      FFMPEG_BIN,
      ["-i", file],
      { windowsHide: true },
      (err, _stdout, stderr) => {
        const match = String(stderr || "").match(
          /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/,
        );
        if (!match) return resolve(0);
        const hh = Number(match[1] || 0);
        const mm = Number(match[2] || 0);
        const ss = Number(match[3] || 0);
        resolve(hh * 3600 + mm * 60 + ss);
      },
    );
  });
}

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    const ps = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      {
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stdout = "";
    let stderr = "";
    ps.stdout.on("data", (c) => (stdout += String(c)));
    ps.stderr.on("data", (c) => (stderr += String(c)));
    ps.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || stdout || `POWERSHELL_EXIT_${code}`));
    });
  });
}

function createSilentVoiceWav(file, seconds) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `anullsrc=r=44100:cl=stereo`,
      "-t",
      String(seconds),
      "-acodec",
      "pcm_s16le",
      file,
    ];
    const ff = spawn(FFMPEG_BIN, args, {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });
    let err = "";
    ff.stderr.on("data", (c) => (err += String(c)));
    ff.on("close", (code) =>
      code === 0
        ? resolve(file)
        : reject(new Error(err || "SILENT_WAV_FAILED")),
    );
  });
}

function createSilentBgmWav(file, seconds) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `anullsrc=r=44100:cl=stereo`,
      "-t",
      String(seconds),
      "-acodec",
      "pcm_s16le",
      file,
    ];
    const ff = spawn(FFMPEG_BIN, args, {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });
    let err = "";
    ff.stderr.on("data", (c) => (err += String(c)));
    ff.on("close", (code) =>
      code === 0
        ? resolve(file)
        : reject(new Error(err || "SILENT_BGM_FAILED")),
    );
  });
}


function smoothVoiceText(value) {
  let text = String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[|｜]/g, "，")
    .replace(/[,;]/g, "，")
    .replace(/[!！]{2,}/g, "！")
    .replace(/[?？]{2,}/g, "？")
    .trim();
  if (!text) return "";
  text = text
    .replace(/([，。！？])(?=[^\s])/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/[。！？]$/.test(text)) text += "。";
  return text;
}

function compactVoiceText(value, maxChars = 72) {
  const normalized = smoothVoiceText(value);
  if (!normalized) return "";
  const chars = Array.from(normalized);
  if (chars.length <= maxChars) return normalized;
  const clipped = chars.slice(0, maxChars).join("");
  const lastBreak = Math.max(
    clipped.lastIndexOf("。"),
    clipped.lastIndexOf("！"),
    clipped.lastIndexOf("？"),
    clipped.lastIndexOf("，"),
  );
  const base = lastBreak >= Math.floor(maxChars * 0.6)
    ? clipped.slice(0, lastBreak + 1)
    : clipped;
  return /[。！？]$/.test(base) ? base : `${base}。`;
}

async function synthesizeVoice(voiceText, workDir) {
  const trimmed = smoothVoiceText(voiceText);
  const wavPath = path.join(workDir, "voice.wav");
  const mp3Path = path.join(workDir, "voice.mp3");
  const txtPath = path.join(workDir, "voice.txt");

  if (!trimmed) {
    await createSilentVoiceWav(wavPath, 12);
    return { voiceFile: wavPath, source: "silent" };
  }

  await fsp.writeFile(txtPath, trimmed, "utf8");

  try {
    await new Promise((resolve, reject) => {
      const cp = spawn(
        "edge-tts",
        [
          "--voice",
          EDGE_TTS_VOICE,
          `--rate=${EDGE_TTS_RATE}`,
          "--pitch=-2Hz",
          "--text",
          trimmed,
          "--write-media",
          mp3Path,
        ],
        {
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let stderr = "";
      cp.stderr.on("data", (c) => (stderr += String(c)));
      cp.on("close", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(stderr || `EDGE_TTS_EXIT_${code}`)),
      );
    });

    await new Promise((resolve, reject) => {
      const ff = spawn(
        FFMPEG_BIN,
        ["-y", "-i", mp3Path, "-ac", "2", "-ar", "44100", wavPath],
        {
          stdio: ["ignore", "ignore", "pipe"],
          windowsHide: true,
        },
      );
      let err = "";
      ff.stderr.on("data", (c) => (err += String(c)));
      ff.on("close", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(err || "EDGE_TTS_CONVERT_FAILED")),
      );
    });

    return { voiceFile: wavPath, source: "edge-tts" };
  } catch (edgeError) {
    try {
      const ps = `
Add-Type -AssemblyName System.Speech;
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$zh = $voice.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo } | Where-Object { $_.Culture.Name -match 'zh-(TW|HK|CN)' } | Select-Object -First 1;
if ($zh) { $voice.SelectVoice($zh.Name); }
$voice.Rate = -1;
$voice.Volume = 100;
$voice.SetOutputToWaveFile('${wavPath.replace(/\\/g, "\\\\")}');
$voice.Speak('${trimmed.replace(/'/g, "''")}');
$voice.Dispose();
`;
      await runPowerShell(ps);
      return { voiceFile: wavPath, source: "windows-sapi" };
    } catch {
      await createSilentVoiceWav(wavPath, 12);
      return { voiceFile: wavPath, source: "silent-fallback" };
    }
  }
}

function spawnFfmpeg(args) {
  return new Promise((resolve, reject) => {
    console.log(
      "[render-from-images] ffmpeg start",
      ["ffmpeg", ...args].join(" "),
    );
    const ff = spawn(FFMPEG_BIN, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    ff.stdout.on("data", (c) => (stdout += String(c)));
    ff.stderr.on("data", (c) => (stderr += String(c)));
    ff.on("close", (code) => {
      console.log("[render-from-images] ffmpeg close", { code });
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || stdout || `FFMPEG_EXIT_${code}`));
    });
  });
}

function getScene(arr, idx, fallback) {
  if (Array.isArray(arr) && arr[idx]) return String(arr[idx]).trim();
  return fallback;
}

function sanitizeSubtitleText(input, maxLen = 18) {
  let text = String(input || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, "")
    .replace(/[|｜]/g, "，")
    .replace(/[_*#`~^\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  text = text.replace(/[^\p{Script=Han}\p{L}\p{N}\s，。！？、,.!?：:；;（）()「」『』《》%％＋+\-]/gu, "");
  const chars = Array.from(text);
  return chars.length > maxLen ? chars.slice(0, maxLen).join("") : text;
}

function ffmpegTextfilePath(file) {
  let p = path.resolve(file).replace(/\\/g, "/");
  p = p.replace(/^([A-Za-z]):\//, "$1\\:/");
  return p.replace(/'/g, "\\'");
}

function prepareOverlayTextFiles(workDir, sceneTitles, sceneSubtitles) {
  const dir = path.join(workDir, "overlay-text");
  ensureDirSync(dir);
  const titles = [0, 1, 2].map((i) =>
    sanitizeSubtitleText(getScene(sceneTitles, i, ["先看痛點", "重點整理", "查看詳情"][i]), 16),
  );
  const subs = [0, 1, 2].map((i) =>
    sanitizeSubtitleText(getScene(sceneSubtitles, i, ["先看需求", "特色快速看", "點連結看規格"][i]), 14),
  );
  const titleFiles = titles.map((text, i) => {
    const file = path.join(dir, `title_${i + 1}.txt`);
    fs.writeFileSync(file, text, { encoding: "utf8" });
    return file;
  });
  const subFiles = subs.map((text, i) => {
    const file = path.join(dir, `sub_${i + 1}.txt`);
    fs.writeFileSync(file, text, { encoding: "utf8" });
    return file;
  });
  return { titles, subs, titleFiles, subFiles };
}

function buildFilterComplex(
  sceneTitles,
  sceneSubtitles,
  clipDur,
  totalDuration,
  overlayTextFiles,
) {
  const overlay = overlayTextFiles || {};
  const titleFiles = overlay.titleFiles || [];
  const subFiles = overlay.subFiles || [];
  const fontFile = ffmpegTextfilePath(FONT_FILE);
  const titlePath = (i) => ffmpegTextfilePath(titleFiles[i] || "");
  const subPath = (i) => ffmpegTextfilePath(subFiles[i] || "");

  const t0 = 0;
  const t1 = clipDur;
  const t2 = clipDur * 2;
  const t3 = clipDur * 3;
  const padDur = Math.max(0, totalDuration - t3);

  return [
    `[0:v]split=2[bg0][fg0];`,
    `[bg0]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=22:2[bgf0];`,
    `[fg0]scale=920:920:force_original_aspect_ratio=decrease[fgf0];`,
    `[bgf0][fgf0]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v0];`,
    `[1:v]split=2[bg1][fg1];`,
    `[bg1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=22:2[bgf1];`,
    `[fg1]scale=920:920:force_original_aspect_ratio=decrease[fgf1];`,
    `[bgf1][fgf1]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v1];`,
    `[2:v]split=2[bg2][fg2];`,
    `[bg2]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=22:2[bgf2];`,
    `[fg2]scale=920:920:force_original_aspect_ratio=decrease[fgf2];`,
    `[bgf2][fgf2]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v2];`,
    `[v0][v1][v2]concat=n=3:v=1:a=0[vcat];`,
    padDur > 0
      ? `[vcat]tpad=stop_mode=clone:stop_duration=${padDur.toFixed(3)}[vpad];`
      : `[vcat]copy[vpad];`,
    `[vpad]drawbox=x=80:y=56:w=920:h=160:color=black@0.78:t=fill[topbox];`,
    `[topbox]drawbox=x=80:y=h-390:w=920:h=210:color=black@0.72:t=fill[bottombox];`,
    `[bottombox]drawtext=fontfile='${fontFile}':textfile='${titlePath(0)}':reload=0:expansion=none:fontsize=72:fontcolor=white:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=108:enable='between(t,${t0.toFixed(3)},${t1.toFixed(3)})'[vt1];`,
    `[vt1]drawtext=fontfile='${fontFile}':textfile='${titlePath(1)}':reload=0:expansion=none:fontsize=72:fontcolor=white:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=108:enable='between(t,${t1.toFixed(3)},${t2.toFixed(3)})'[vt2];`,
    `[vt2]drawtext=fontfile='${fontFile}':textfile='${titlePath(2)}':reload=0:expansion=none:fontsize=72:fontcolor=white:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=108:enable='between(t,${t2.toFixed(3)},${totalDuration.toFixed(3)})'[vt3];`,
    `[vt3]drawtext=fontfile='${fontFile}':textfile='${subPath(0)}':reload=0:expansion=none:fontsize=52:fontcolor=#FFD400:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=h-315:enable='between(t,${t0.toFixed(3)},${t1.toFixed(3)})'[vs1];`,
    `[vs1]drawtext=fontfile='${fontFile}':textfile='${subPath(1)}':reload=0:expansion=none:fontsize=52:fontcolor=#FFD400:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=h-315:enable='between(t,${t1.toFixed(3)},${t2.toFixed(3)})'[vs2];`,
    `[vs2]drawtext=fontfile='${fontFile}':textfile='${subPath(2)}':reload=0:expansion=none:fontsize=52:fontcolor=#FFD400:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=h-315:enable='between(t,${t2.toFixed(3)},${totalDuration.toFixed(3)})'[vout];`,
    `[3:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=1.35[voice];`,
    `[4:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.10[bgm];`,
    `[voice][bgm]amix=inputs=2:duration=longest:dropout_transition=2[aout]`,
  ].join("");
}

function shortText(input, maxLen = 12) {
  const s = String(input || "")
    .replace(/\s+/g, "")
    .trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function normalizeKeywordList(input, title) {
  if (Array.isArray(input)) {
    return input
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .join(",");
  }
  const text = String(input || "")
    .replace(/[、|\n]/g, ",")
    .trim();
  if (text) return text;
  const core = shortText(title, 14);
  return [
    core,
    `${core}推薦`,
    `${core}開箱`,
    `${core}評價`,
    `${core}哪裡買`,
    `${core}蝦皮`,
  ]
    .filter(Boolean)
    .join(",");
}

function buildFallbackScript(title) {
  const rawTitle = String(title || "").trim();
  const base = shortText(cleanProductTitle(rawTitle), 14) || "熱門好物";
  const keywords = normalizeKeywordList("", rawTitle || base);

  let category = "general";
  let hook = "網購最怕買到不適合？";
  let pain = "選商品之前先看重點整理";
  let benefit = "特色、用途一次看懂";
  let proof = "三張商品圖快速整理重點";
  let cta = "看完直接點連結了解更多";
  let sceneTitles = [
    "網購最怕買到不適合？",
    "先把特色用途快速看懂",
    "有興趣再點連結看細節",
  ];
  let sceneSubtitles = [
    "挑選前先看真正需求",
    "三張圖快速整理重點",
    "快速查看商品資訊",
  ];
  let voiceText =
    "網購最怕買到不適合，挑選前先看真正需求。" +
    "三張商品圖幫你快速整理特色和用途。" +
    "有興趣再點連結看細節。";

  if (/雨衣|暴雨|側開|後背包|雨具|防水|騎車|通勤|風衣/.test(rawTitle)) {
    category = "rainwear";
    hook = "突然下大雨，背包也怕淋濕？";
    pain = "通勤最怕穿雨衣還要顧包包";
    benefit = "側開秒穿，後背包也能一起罩住";
    proof = "側開設計，加大空間更好穿脫";
    cta = "點連結看款式與尺寸";
    sceneTitles = [
      "突然下雨，背包也怕淋濕？",
      "側開秒穿，後背包也能罩住",
      "通勤騎車，穿脫更省事",
    ];
    sceneSubtitles = [
      "雨衣難穿還要顧包包",
      "加大空間更好穿脫",
      "點連結看款式尺寸",
    ];
    voiceText =
      "突然下雨，最怕背包和衣服一起淋濕。" +
      "側開秒穿，加大空間連後背包也能罩住。" +
      "通勤騎車更省事，點連結看尺寸。";
  } else if (/枕|護頸枕|午睡枕|乳膠枕|飯店枕|石墨烯|涼感|獨立筒|床墊|寢具|睡眠|天絲/.test(rawTitle)) {
    category = "sleep";
    hook = "枕頭太悶太塌，越睡越痠？";
    pain = "很多人最怕沒支撐又悶熱";
    benefit = "涼感天絲加獨立筒支撐";
    proof = "睡感更舒適，支撐更穩定";
    cta = "點連結看規格與優惠";
    sceneTitles = [
      "枕頭悶又塌，睡醒容易痠？",
      "涼感天絲加獨立筒支撐",
      "午睡日常睡眠更輕鬆",
    ];
    sceneSubtitles = [
      "最怕悶熱又沒支撐",
      "睡感舒適，支撐更穩",
      "點連結看規格優惠",
    ];
    voiceText =
      "枕頭太悶太塌，睡醒容易痠。" +
      "涼感天絲搭配獨立筒支撐，睡感更舒服。" +
      "午睡和日常睡眠都適合，點連結看規格。";
  } else if (/巧克力|零食|夾心|拉絲|開心果|迪拜|餅乾|甜點|糖果|食品|蛋糕|堅果/.test(rawTitle)) {
    category = "food";
    hook = "想買這類零食，最怕踩雷？";
    pain = "口感不對，買了容易失望";
    benefit = "重點是風味與層次感";
    proof = "開心果香氣、口感更有記憶點";
    cta = "想看細節，直接點連結";
    sceneTitles = [
      "熱門零食，最怕買到踩雷？",
      "先看風味和口感層次",
      "有興趣再點連結看細節",
    ];
    sceneSubtitles = [
      "口感不對最容易失望",
      "香氣層次是挑選重點",
      "快速查看商品資訊",
    ];
    voiceText =
      "熱門零食最怕買到踩雷，口感和想像不同。" +
      "挑選時先看風味和層次感，再決定適不適合。" +
      "有興趣就點連結看細節。";
  }

  sceneTitles = sceneTitles.map((x) => sanitizeSubtitleText(x, 18));
  sceneSubtitles = sceneSubtitles.map((x) => sanitizeSubtitleText(x, 16));
  voiceText = smoothVoiceText(voiceText);

  const shortTitleByCategory = {
    rainwear: "雨天通勤｜穿脫重點先看3項",
    sleep: "睡眠好物｜舒適支撐先看3項",
    food: "熱門零食｜怕踩雷先看3項",
    general: "網購好物｜下單前先看3項",
  };
  const shortTitle =
    shortTitleByCategory[category] || shortTitleByCategory.general;
  const shortDescription = `${pain}。${benefit}，${proof}。${cta}。`;

  return {
    source: `pain-template-v36.9-${category}`,
    category,
    hook,
    pain,
    benefit,
    proof,
    cta,
    sceneTitles,
    sceneSubtitles,
    voiceText,
    shortTitle,
    keywords,
    titleWithKeywords: `${shortTitle}\n\n${keywords}`,
    shortDescription,
    fullPost: `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]`,
  };
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function isWeakCopy(value) {
  const s = String(value || "").trim();
  if (!s) return true;
  const weakPatterns = [
    "使用方便",
    "立即查看",
    "實用又方便",
    "日常好物",
    "推薦商品",
    "重點一眼看懂",
    "適合日常使用",
    "商品介紹",
    "商品特色",
    "好用款式",
    "居家必備",
    "立即下單",
    "現貨速出",
  ];
  return weakPatterns.some((x) => s.includes(x));
}

function preferAi(aiValue, manualValue, fallbackValue) {
  if (manualValue && !isWeakCopy(manualValue))
    return String(manualValue).trim();
  if (aiValue && !isWeakCopy(aiValue)) return String(aiValue).trim();
  if (manualValue) return String(manualValue).trim();
  if (aiValue) return String(aiValue).trim();
  return String(fallbackValue || "").trim();
}

function pickRootData(raw) {
  if (!raw || typeof raw !== "object") return {};
  if (raw.data && typeof raw.data === "object") return raw.data;
  if (raw.result && typeof raw.result === "object") return raw.result;
  if (raw.script && typeof raw.script === "object") return raw.script;
  return raw;
}


function rxvCleanChinesePunctuation(value) {
  return String(value || "")
    .replace(/[ \t]+([，。！？、；：])/g, "$1")
    .replace(/([，。！？、；：])[ \t]+/g, "$1")
    .replace(/，。/g, "。")
    .replace(/。,/g, "。")
    .replace(/，,/g, "，")
    .replace(/。。+/g, "。")
    .replace(/！！+/g, "！")
    .replace(/？？+/g, "？")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function rxvSafeClaimReplace(value, title = "") {
  let text = rxvCleanChinesePunctuation(value);
  const source = String(title || "");
  const isSleep =
    /(枕|枕頭|寢具|床墊|睡眠|護頸)/.test(source);
  const isBeautyHealth =
    /(保健|美容|保養|精華|面膜|按摩|瘦身|體態|藥|療)/.test(source);
  const isFood =
    /(巧克力|餅乾|零食|食品|甜點|糖果|飲料|咖啡|茶|堅果|果乾|麵|肉乾)/.test(source);

  if (isSleep || isBeautyHealth) {
    const guarded = [
      ["改善睡眠", /改善睡眠/g, "日常使用"],
      ["提升睡眠品質", /提升睡眠品質/g, "日常使用體驗"],
      ["肩頸痠痛", /肩頸(?:痠痛|酸痛|疲憊)/g, "使用感受"],
      ["支撐肩頸", /支撐肩頸/g, "獨立筒設計"],
      ["適合側睡或仰睡", /適合側睡或仰睡/g, "可依個人使用習慣評估"],
      ["舒緩", /舒緩/g, "日常使用"],
      ["治療", /治療/g, "使用"],
      ["療效", /療效/g, "效果"],
    ];
    for (const [sourcePhrase, pattern, replacement] of guarded) {
      if (!source.includes(sourcePhrase)) {
        text = text.replace(pattern, replacement);
      }
    }

    if (!source.includes("不好睡")) {
      text = text.replace(/告別不好睡的夜晚/g, "想找日常更好整理的用品？");
    }
    if (!source.includes("醒來都好累")) {
      text = text.replace(/每天醒來都好累[？?]?/g, "日常使用想更省心？");
    }
    if (!source.includes("好睡")) {
      text = text.replace(/好睡又/g, "好整理又");
    }
    if (!source.includes("給肩頸剛好的支撐")) {
      text = text.replace(
        /給肩頸剛好的支撐/g,
        "商品主打獨立筒設計",
      );
    }
    if (!source.includes("不論側睡或仰睡都很適合")) {
      text = text.replace(
        /不論側睡或仰睡都很適合/g,
        "實際使用感受依個人習慣而異",
      );
    }
  }

  if (isFood) {
    if (!source.includes("爆款")) {
      text = text.replace(/網紅爆款/g, "特色").replace(/爆款/g, "特色");
    }
    if (!source.includes("激推")) {
      text = text.replace(/網紅激推/g, "分享").replace(/激推/g, "分享");
    }
    if (!source.includes("一吃上癮")) {
      text = text.replace(/一吃上癮/g, "口感有特色");
    }
    if (!source.includes("正宗迪拜")) {
      text = text.replace(/正宗迪拜/g, "迪拜風格");
    }
    if (!source.includes("迪拜進口")) {
      text = text.replace(/迪拜進口/g, "迪拜風格");
    }
    if (!source.includes("來自迪拜")) {
      text = text.replace(/來自迪拜/g, "迪拜風格");
    }
    if (!source.includes("絕對能滿足")) {
      text = text.replace(
        /絕對能滿足你的味蕾/g,
        "可以先看看商品介紹",
      );
    }
  }

  if (!source.includes("原廠")) {
    text = text
      .replace(/原廠一年保固/g, "一年保固")
      .replace(/原廠保固/g, "保固");
  }
  if (!source.includes("官方")) {
    text = text
      .replace(/官方一年保固/g, "一年保固")
      .replace(/官方保固/g, "保固");
  }

  const popularityRules = [
    ["大家都在討論", /大家都在討論/g, "有興趣可以看看"],
    ["很多人討論", /很多人討論/g, "有興趣可以看看"],
    ["大家都在看", /大家都在看/g, "想了解這款"],
    ["大家都在買", /大家都在買/g, "想了解這款"],
    ["大家都在用", /大家都在用/g, "想了解這款"],
    ["很多人都在看", /很多人都在看/g, "想了解這款"],
    ["很多人都在買", /很多人都在買/g, "想了解這款"],
    ["很多人都在用", /很多人都在用/g, "想了解這款"],
    ["網路上很紅", /網路上很紅/g, "網路上常見"],
    ["近期熱門", /近期熱門/g, "近期常見"],
    ["話題商品", /話題商品/g, "特色商品"],
    ["超夯", /超夯/g, "特色"],
    ["很夯", /很夯/g, "特色"],
    ["熱門商品", /熱門商品/g, "商品"],
  ];
  for (const [sourcePhrase, pattern, replacement] of popularityRules) {
    if (!source.includes(sourcePhrase)) {
      text = text.replace(pattern, replacement);
    }
  }

  if (!/(尺寸|cm|公分|規格|容量|ml|公升|kg|公斤|g|克)/i.test(source)) {
    text = text
      .replace(/詳細規格、尺寸或其他資訊/g, "完整商品資訊")
      .replace(/詳細規格與尺寸/g, "完整商品資訊")
      .replace(/完整規格與尺寸/g, "完整商品資訊")
      .replace(/詳細尺寸/g, "商品資訊");
  }

  text = text
    .replace(/手刀下單(?:試試看)?/g, "點連結看商品資訊")
    .replace(/立即搶購/g, "查看商品詳情")
    .replace(/趕快下單/g, "有興趣可以看看")
    .replace(/一定要買/g, "可以先看看")
    .replace(/立即品嚐/g, "查看商品資訊")
    .replace(/快點連結看商品資訊/g, "點連結看商品資訊")
    .replace(/快查看完整商品資訊/g, "查看完整商品資訊")
    .replace(/快查看商品資訊/g, "查看商品資訊")
    .replace(/趕快查看完整商品資訊/g, "查看完整商品資訊")
    .replace(/趕快查看商品資訊/g, "查看商品資訊")
    .replace(/趕快點商品連結/g, "點商品連結")
    .replace(/趕快點連結/g, "點連結")
    .replace(/快來看看/g, "有興趣可以看看")
    .replace(/快點進來看看/g, "有興趣可以看看");

  return rxvCleanChinesePunctuation(text);
}

function rxvSafeCopyObject(obj, title = "") {
  if (!obj || typeof obj !== "object") return obj;

  const safe = { ...obj };
  const fields = [
    "hook",
    "pain",
    "problem",
    "benefit",
    "solution",
    "proof",
    "reason",
    "sellPoint",
    "cta",
    "callToAction",
    "voice",
    "voiceText",
    "script",
    "narration",
    "shortTitle",
    "shortDescription",
    "fullPost",
    "facebookPost",
    "instagramCaption",
    "tiktokCaption",
    "youtubeShortsTitle",
    "youtubeShortsDescription",
    "youtubeVideoTitle",
    "youtubeVideoDescription",
    "threadsPost",
    "xPost",
  ];

  for (const key of fields) {
    if (typeof safe[key] === "string") {
      safe[key] = rxvSafeClaimReplace(safe[key], title);
    }
  }

  for (const key of ["sceneTitles", "sceneSubtitles", "bullets", "badges"]) {
    if (Array.isArray(safe[key])) {
      safe[key] = safe[key].map((item) =>
        typeof item === "string"
          ? rxvSafeClaimReplace(item, title)
          : item,
      );
    }
  }

  return safe;
}

function normalizeSocialHashtags(value, title = "") {
  let items = [];
  if (Array.isArray(value)) {
    items = value;
  } else {
    items = String(value || "")
      .split(/[\s,，、;；]+/)
      .filter(Boolean);
  }

  const clean = [];
  for (const item of items) {
    let tag = String(item || "").trim();
    if (!tag) continue;
    tag = tag.replace(/^#+/, "").replace(/[^\p{L}\p{N}_-]/gu, "");
    if (!tag) continue;
    const out = `#${tag}`;
    if (!clean.includes(out)) clean.push(out);
  }

  if (!clean.length) {
    const base = cleanProductTitle(title)
      .replace(/[^\p{L}\p{N}]/gu, "")
      .slice(0, 12);
    if (base) clean.push(`#${base}`);
  }

  return clean.slice(0, 8).join(" ");
}

function normalizeAiResponse(raw, title) {
  const obj = rxvNaturalizeVideoScript(
    enhanceWithSafePainAngle(
      rxvSafeCopyObject(pickRootData(raw), title),
      title,
    ),
    title,
  );
  const fallback = buildFallbackScript(title);
  const bullets = Array.isArray(obj.bullets) ? obj.bullets : [];
  const badges = Array.isArray(obj.badges) ? obj.badges : [];
  const pain = firstNonEmpty(
    obj.pain,
    obj.problem,
    obj.hook,
    bullets[0],
    fallback.pain,
  );
  const benefit = firstNonEmpty(
    obj.benefit,
    obj.solution,
    bullets[1],
    fallback.benefit,
  );
  const proof = firstNonEmpty(
    obj.proof,
    obj.reason,
    obj.sellPoint,
    badges[0],
    bullets[2],
    fallback.proof,
  );
  const cta = firstNonEmpty(obj.cta, obj.callToAction, badges[1], fallback.cta);
  const voiceText = firstNonEmpty(
    obj.voice,
    obj.voiceText,
    obj.script,
    obj.narration,
    fallback.voiceText,
  );
  const shortTitle = firstNonEmpty(
    obj.shortTitle,
    obj.title,
    obj.videoTitle,
    fallback.shortTitle,
  );
  const shortDescription = firstNonEmpty(
    obj.shortDescription,
    obj.description,
    obj.videoDescription,
    obj.desc,
    fallback.shortDescription,
  );
  const keywords = normalizeKeywordList(
    obj.keywords || obj.tags || obj.searchKeywords,
    title,
  );
  const titleWithKeywords = firstNonEmpty(
    obj.titleWithKeywords,
    `${shortTitle}\n\n${keywords}`,
  );
  const hook = firstNonEmpty(
    obj.hook,
    obj.pain,
    obj.problem,
    bullets[0],
    fallback.pain,
  );
  const fullPost = firstNonEmpty(
    obj.fullPost,
    `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]`,
  );

  const sourceSceneTitles = Array.isArray(obj.sceneTitles)
    ? obj.sceneTitles
    : [];
  const sourceSceneSubtitles = Array.isArray(obj.sceneSubtitles)
    ? obj.sceneSubtitles
    : [];
  const hashtags = normalizeSocialHashtags(
    obj.hashtags || obj.socialHashtags || "",
    title,
  );

  return {
    source: obj.source || raw?.source || "supabase",
    raw,
    usage: raw?.usage || obj?.usage || null,
    hook,
    pain,
    benefit,
    proof,
    cta,
    sceneTitles: [0, 1, 2].map((idx) =>
      sanitizeSubtitleText(
        firstNonEmpty(
          sourceSceneTitles[idx],
          [pain, benefit, cta][idx],
        ),
        18,
      ),
    ),
    sceneSubtitles: [0, 1, 2].map((idx) =>
      sanitizeSubtitleText(
        firstNonEmpty(
          sourceSceneSubtitles[idx],
          [benefit, proof, cta][idx],
        ),
        16,
      ),
    ),
    voiceText: String(voiceText).trim(),
    shortTitle: String(shortTitle).trim(),
    keywords: String(keywords).trim(),
    hashtags: String(hashtags).trim(),
    titleWithKeywords: String(titleWithKeywords).trim(),
    shortDescription: String(shortDescription).trim(),
    fullPost: String(fullPost).trim(),
    facebookPost: firstNonEmpty(obj.facebookPost, obj.facebook, ""),
    instagramCaption: firstNonEmpty(
      obj.instagramCaption,
      obj.instagram,
      "",
    ),
    tiktokCaption: firstNonEmpty(obj.tiktokCaption, obj.tiktok, ""),

    youtubeShortsTitle: firstNonEmpty(
      obj.youtubeShortsTitle,
      obj.shortsTitle,
      shortTitle,
    ),
    youtubeShortsDescription: firstNonEmpty(
      obj.youtubeShortsDescription,
      obj.shortsDescription,
      shortDescription,
    ),
    youtubeVideoTitle: firstNonEmpty(
      obj.youtubeVideoTitle,
      obj.youtubeTitle,
      shortTitle,
    ),
    youtubeVideoDescription: firstNonEmpty(
      obj.youtubeVideoDescription,
      obj.youtubeDescription,
      fullPost,
    ),
    threadsPost: firstNonEmpty(obj.threadsPost, obj.threads, fullPost),
    xPost: firstNonEmpty(obj.xPost, obj.twitterPost, obj.x, fullPost),

    facebookHashtags: normalizeSocialHashtags(
      obj.facebookHashtags || obj.facebookTags || obj.hashtags || "",
      title,
    ),
    instagramHashtags: normalizeSocialHashtags(
      obj.instagramHashtags || obj.instagramTags || obj.hashtags || "",
      title,
    ),
    tiktokHashtags: normalizeSocialHashtags(
      obj.tiktokHashtags || obj.tiktokTags || obj.hashtags || "",
      title,
    ),
    youtubeHashtags: normalizeSocialHashtags(
      obj.youtubeHashtags || obj.youtubeTags || obj.hashtags || "",
      title,
    ),
  };
}


async function getOpenClawScript(title, productUrl, promoUrl, item = {}) {
  const token = readOpenClawGatewayToken();
  if (!token) {
    throw new Error("OPENCLAW_GATEWAY_TOKEN_NOT_FOUND");
  }

  const prompt = buildOpenClawCopyPrompt({
    title,
    productUrl,
    promoUrl,
    item,
  });

  const payload = {
    model: "openclaw",
    instructions: prompt.instructions,
    input: prompt.input,
    max_output_tokens: 800,
  };

  const response = await axios.post(
    OPENCLAW_NATIVE_RESPONSES_URL,
    payload,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
        "x-openclaw-agent-id": OPENCLAW_AGENT_ID,
      },
      timeout: 90000,
      validateStatus: () => true,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    const detail =
      response?.data?.error?.message ||
      response?.data?.error ||
      `OPENCLAW_HTTP_${response.status}`;
    throw new Error(String(detail));
  }

  if (response?.data?.status && response.data.status !== "completed") {
    throw new Error(
      `OPENCLAW_RESPONSE_${String(response.data.status).toUpperCase()}`,
    );
  }

  const outputText = extractOpenClawOutputText(response.data);
  const parsed = parseJsonObjectFromText(outputText);

  const normalized = normalizeAiResponse(
    {
      ...parsed,
      source: `openclaw-fallback-${OPENCLAW_AGENT_ID}`,
      usage: response?.data?.usage || null,
    },
    title,
  );

  console.log("[openclaw-native] copy ok", {
    title: cleanProductTitle(title).slice(0, 50),
    inputTokens: Number(response?.data?.usage?.input_tokens || 0),
    outputTokens: Number(response?.data?.usage?.output_tokens || 0),
    totalTokens: Number(response?.data?.usage?.total_tokens || 0),
  });

  return normalized;
}

async function getAiScript(title, productUrl, promoUrl, item = {}) {
  if (RXV_CSV_COPY_ONLY) {
    console.log("[V40.5.7] CSV_ONLY_AI_CHAIN_DISABLED", {
      title: cleanProductTitle(title).slice(0, 50),
    });
    return {
      ...buildFallbackScript(title),
      source: "csv-manual",
      aiProvider: "",
      aiModel: "",
      aiFallbackChain: [],
      aiError: "",
    };
  }
  const chainErrors = [];

  try {
    const gemini = await getGeminiScript(
      title,
      productUrl,
      promoUrl,
      item,
    );
    if (gemini) {
      return {
        ...gemini,
        aiError: "",
      };
    }
  } catch (error) {
    const msg = error?.message || "GEMINI_DIRECT_FAILED";
    chainErrors.push(msg);
    console.warn("[AI chain] Gemini failed, trying OpenClaw", msg);
  }

  try {
    const openClaw = await getOpenClawScript(
      title,
      productUrl,
      promoUrl,
      item,
    );

    if (openClaw) {
      return {
        ...openClaw,
        aiProvider: "openclaw",
        aiModel: "openclaw",
        aiFallbackChain: chainErrors,
        aiError: chainErrors.join(" | "),
      };
    }
  } catch (error) {
    const msg = error?.message || "OPENCLAW_FALLBACK_FAILED";
    chainErrors.push(msg);
  }

  throw new Error(
    `AI_CHAIN_FAILED: ${chainErrors.join(" | ") || "NO_AI_AVAILABLE"}`,
  );
}

function mergeScript(item, aiScript, title) {
  const fallback = buildFallbackScript(title);
  const manualSceneTitles = Array.isArray(item.sceneTitles)
    ? item.sceneTitles
    : [];
  const manualSceneSubtitles = Array.isArray(item.sceneSubtitles)
    ? item.sceneSubtitles
    : [];
  const manualVoice = String(item.voiceText || "").trim();
  const manualShortTitle = String(item.shortTitle || "").trim();
  const manualKeywords = String(item.keywords || "").trim();
  const manualTitleWithKeywords = String(item.titleWithKeywords || "").trim();
  const manualShortDescription = String(item.shortDescription || "").trim();
  const manualFullPost = String(item.fullPost || "").trim();
  const manualFacebookPost = String(item.facebookPost || manualFullPost).trim();
  const manualInstagramCaption = String(item.instagramCaption || manualShortDescription).trim();
  const manualTiktokCaption = String(item.tiktokCaption || manualShortDescription).trim();
  const manualYoutubeShortsTitle = String(item.youtubeShortsTitle || manualShortTitle).trim();
  const manualYoutubeShortsDescription = String(item.youtubeShortsDescription || manualShortDescription).trim();
  const manualYoutubeVideoTitle = String(item.youtubeVideoTitle || manualShortTitle).trim();
  const manualYoutubeVideoDescription = String(item.youtubeVideoDescription || manualFullPost).trim();
  const manualThreadsPost = String(item.threadsPost || manualFullPost).trim();
  const manualXPost = String(item.xPost || manualFullPost).trim();
  const manualHashtags = String(item.hashtags || "").trim();
  const manualFacebookHashtags = String(item.facebookHashtags || manualHashtags).trim();
  const manualInstagramHashtags = String(item.instagramHashtags || manualHashtags).trim();
  const manualTiktokHashtags = String(item.tiktokHashtags || manualHashtags).trim();
  const manualYoutubeHashtags = String(item.youtubeHashtags || manualHashtags).trim();

  const merged = {
    source: aiScript?.source || "fallback",
    aiProvider: aiScript?.aiProvider || "",
    aiModel: aiScript?.aiModel || "",
    aiFallbackChain: Array.isArray(aiScript?.aiFallbackChain)
      ? aiScript.aiFallbackChain
      : [],
    sceneTitles: [0, 1, 2].map((idx) =>
      preferAi(
        aiScript?.sceneTitles?.[idx],
        manualSceneTitles[idx],
        fallback.sceneTitles[idx],
      ),
    ),
    sceneSubtitles: [0, 1, 2].map((idx) =>
      preferAi(
        aiScript?.sceneSubtitles?.[idx],
        manualSceneSubtitles[idx],
        fallback.sceneSubtitles[idx],
      ),
    ),
    voiceText: preferAi(aiScript?.voiceText, manualVoice, fallback.voiceText),
    shortTitle: preferAi(
      aiScript?.shortTitle,
      manualShortTitle,
      fallback.shortTitle,
    ),
    keywords: preferAi(aiScript?.keywords, manualKeywords, fallback.keywords),
    titleWithKeywords: preferAi(
      aiScript?.titleWithKeywords,
      manualTitleWithKeywords,
      fallback.titleWithKeywords,
    ),
    shortDescription: preferAi(
      aiScript?.shortDescription,
      manualShortDescription,
      fallback.shortDescription,
    ),
    fullPost: preferAi(aiScript?.fullPost, manualFullPost, fallback.fullPost),
    pain: firstNonEmpty(aiScript?.pain, fallback.pain),
    benefit: firstNonEmpty(aiScript?.benefit, fallback.benefit),
    proof: firstNonEmpty(aiScript?.proof, fallback.proof),
    cta: firstNonEmpty(aiScript?.cta, fallback.cta),
    hashtags: firstNonEmpty(
      manualHashtags,
      aiScript?.hashtags,
      manualKeywords,
      aiScript?.keywords,
      "",
    ),
    facebookPost: firstNonEmpty(
      manualFacebookPost,
      aiScript?.facebookPost,
      manualFullPost,
      aiScript?.fullPost,
      "",
    ),
    instagramCaption: firstNonEmpty(
      manualInstagramCaption,
      aiScript?.instagramCaption,
      manualShortDescription,
      aiScript?.shortDescription,
      "",
    ),
    tiktokCaption: firstNonEmpty(
      manualTiktokCaption,
      aiScript?.tiktokCaption,
      manualShortDescription,
      aiScript?.shortDescription,
      "",
    ),
    youtubeShortsTitle: firstNonEmpty(
      manualYoutubeShortsTitle,
      aiScript?.youtubeShortsTitle,
      manualShortTitle,
      aiScript?.shortTitle,
      "",
    ),
    youtubeShortsDescription: firstNonEmpty(
      manualYoutubeShortsDescription,
      aiScript?.youtubeShortsDescription,
      manualShortDescription,
      aiScript?.shortDescription,
      "",
    ),
    youtubeVideoTitle: firstNonEmpty(
      manualYoutubeVideoTitle,
      aiScript?.youtubeVideoTitle,
      manualShortTitle,
      aiScript?.shortTitle,
      "",
    ),
    youtubeVideoDescription: firstNonEmpty(
      manualYoutubeVideoDescription,
      aiScript?.youtubeVideoDescription,
      manualFullPost,
      aiScript?.fullPost,
      "",
    ),
    threadsPost: firstNonEmpty(
      manualThreadsPost,
      aiScript?.threadsPost,
      manualFullPost,
      aiScript?.fullPost,
      "",
    ),
    xPost: firstNonEmpty(
      manualXPost,
      aiScript?.xPost,
      manualFullPost,
      aiScript?.fullPost,
      "",
    ),
    facebookHashtags: firstNonEmpty(
      manualFacebookHashtags,
      aiScript?.facebookHashtags,
      manualHashtags,
      "",
    ),
    instagramHashtags: firstNonEmpty(
      manualInstagramHashtags,
      aiScript?.instagramHashtags,
      manualHashtags,
      "",
    ),
    tiktokHashtags: firstNonEmpty(
      manualTiktokHashtags,
      aiScript?.tiktokHashtags,
      manualHashtags,
      "",
    ),
    youtubeHashtags: firstNonEmpty(
      manualYoutubeHashtags,
      aiScript?.youtubeHashtags,
      manualHashtags,
      "",
    ),
    aiUsage: aiScript?.usage || null,
  };

  if (!merged.titleWithKeywords) {
    merged.titleWithKeywords =
      `${merged.shortTitle}\n\n${merged.keywords}`.trim();
  }
  if (!merged.fullPost) {
    merged.fullPost =
      `${merged.shortTitle}\n\n${merged.shortDescription}\n\n[affiliateUrl]`.trim();
  }
  return rxvNaturalizeVideoScript(
    enhanceWithSafePainAngle(
      rxvSafeCopyObject(merged, title),
      title,
    ),
    title,
  );
}

async function resolveBgmPath(item, workDir, totalDuration) {
  const preferred =
    item.bgmPath && fs.existsSync(item.bgmPath)
      ? item.bgmPath
      : path.join(ROOT, "assets", "bgm.mp3");

  if (preferred && fs.existsSync(preferred)) return preferred;

  const silentBgm = path.join(workDir, "silent-bgm.wav");
  await createSilentBgmWav(silentBgm, totalDuration);
  return silentBgm;
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "image-to-video-server",
    port: PORT,
    build: BUILD,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "image-to-video-server",
    port: PORT,
    build: BUILD,
    outputDir: DEFAULT_OUTPUT_DIR,
    affiliateDbPath: AFFILIATE_DB_PATH,
    aiChain: [
      GEMINI_MODELS[0] || "gemini-3.5-flash-lite",
      GEMINI_MODELS[1] || "gemini-2.5-flash",
      `openclaw:${OPENCLAW_AGENT_ID}`,
    ],
    geminiDirect: {
      primaryModel: GEMINI_MODELS[0] || "",
      fallbackModel: GEMINI_MODELS[1] || "",
      apiKeyFound: !!readGeminiApiKey(),
    },
    openClawFallback: {
      baseUrl: OPENCLAW_NATIVE_BASE_URL,
      agentId: OPENCLAW_AGENT_ID,
      tokenFound: !!readOpenClawGatewayToken(),
    },
  });
});

app.get("/public-video/:filename", async (req, res) => {
  try {
    const filename = path.basename(String(req.params.filename || ""));
    const fullPath = path.join(DEFAULT_OUTPUT_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send("NOT_FOUND");
    }
    const ext = path.extname(filename).toLowerCase();
    res.setHeader("Content-Type", ext === ".gif" ? "image/gif" : "video/mp4");
    res.setHeader("Cache-Control", "public, max-age=3600");
    fs.createReadStream(fullPath).pipe(res);
  } catch (error) {
    res.status(500).send(error?.message || "PUBLIC_VIDEO_FAILED");
  }
});



function parseMultipartForm(req, maxBytes = 80 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const contentType = String(req.headers['content-type'] || '');
    const boundaryMatch = contentType.match(/boundary=(?:(?:"([^"]+)")|([^;]+))/i);
    if (!boundaryMatch) {
      reject(new Error('MULTIPART_BOUNDARY_MISSING'));
      return;
    }
    const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy(new Error('UPLOAD_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const fields = {};
        const files = {};
        let start = body.indexOf(boundary);
        while (start !== -1) {
          start += boundary.length;
          if (body[start] === 45 && body[start + 1] === 45) break; // --
          if (body[start] === 13 && body[start + 1] === 10) start += 2; // CRLF
          const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), start);
          if (headerEnd === -1) break;
          const headerText = body.slice(start, headerEnd).toString('utf8');
          let dataStart = headerEnd + 4;
          let next = body.indexOf(boundary, dataStart);
          if (next === -1) break;
          let dataEnd = next;
          if (dataEnd >= 2 && body[dataEnd - 2] === 13 && body[dataEnd - 1] === 10) dataEnd -= 2;
          const disposition = headerText.match(/content-disposition:\s*form-data;([^\r\n]+)/i);
          const name = disposition && disposition[1].match(/name="([^"]+)"/i);
          const filename = disposition && disposition[1].match(/filename="([^"]*)"/i);
          const contentTypePart = (headerText.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || '';
          if (name) {
            const fieldName = name[1];
            const value = body.slice(dataStart, dataEnd);
            if (filename && filename[1]) {
              const fileObj = {
                filename: path.basename(filename[1]),
                contentType: contentTypePart.trim(),
                buffer: value,
              };
              if (files[fieldName]) {
                if (Array.isArray(files[fieldName])) files[fieldName].push(fileObj);
                else files[fieldName] = [files[fieldName], fileObj];
              } else {
                files[fieldName] = fileObj;
              }
            } else {
              fields[fieldName] = value.toString('utf8');
            }
          }
          start = next;
        }
        resolve({ fields, files });
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getVideoSizeFromRatio(ratio, resolution) {
  const is4k = String(resolution || '').toLowerCase() === '4k';
  const map1080 = {
    '9:16': [1080, 1920],
    '16:9': [1920, 1080],
    '1:1': [1080, 1080],
    '4:5': [1080, 1350],
  };
  const map4k = {
    '9:16': [2160, 3840],
    '16:9': [3840, 2160],
    '1:1': [2160, 2160],
    '4:5': [2160, 2700],
  };
  return (is4k ? map4k : map1080)[ratio] || map1080['16:9'];
}

function safeNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}


function getFirstFile(files, name) {
  const value = files?.[name];
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function getFileArray(files, name) {
  const value = files?.[name];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeUploadedImages(files) {
  const multi = getFileArray(files, 'images').filter((x) => x?.buffer?.length);
  if (multi.length > 0) return multi.slice(0, 30);
  const single = getFirstFile(files, 'image');
  return single?.buffer?.length ? [single] : [];
}

function extFromUpload(file) {
  const fromType = extFromContentType(file?.contentType);
  if (fromType && fromType !== '.img') return fromType;
  const fromName = path.extname(file?.filename || '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromName) ? fromName : '.jpg';
}

function escDrawText(input) {
  return escapeText(String(input || '').slice(0, 40));
}

function buildAudioLavfi(audioPreset) {
  const preset = String(audioPreset || 'none');
  if (preset === 'soft_bgm') return { source: 'sine=frequency=392:sample_rate=44100', volume: '0.045' };
  if (preset === 'upbeat_bgm') return { source: 'sine=frequency=523:sample_rate=44100', volume: '0.04' };
  if (preset === 'sparkle') return { source: 'sine=frequency=1046:sample_rate=44100', volume: '0.025' };
  if (preset === 'cute_pop') return { source: 'sine=frequency=880:sample_rate=44100', volume: '0.025' };
  return { source: 'anullsrc=r=44100:cl=stereo', volume: '1' };
}

function buildStillVf({ w, h, fps, seconds, effect, titleText, subtitleText }) {
  const frames = Math.max(1, Math.round(seconds * fps));
  let vf = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
  if (effect === 'zoom_in') {
    vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},zoompan=z='min(zoom+0.0008,1.08)':d=${frames}:s=${w}x${h}:fps=${fps}`;
  } else if (effect === 'zoom_out') {
    vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},zoompan=z='max(1.08-0.0008*on,1.0)':d=${frames}:s=${w}x${h}:fps=${fps}`;
  } else if (['pan_left', 'pan_right', 'pan_up', 'pan_down', 'drift'].includes(effect)) {
    vf = `scale=${Math.ceil(w * 1.12)}:${Math.ceil(h * 1.12)}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1`;
  }

  const filters = [vf];
  if (titleText) {
    filters.push(`drawbox=x=60:y=60:w=${w - 120}:h=120:color=black@0.42:t=fill`);
    filters.push(`drawtext=fontfile='${FONT_FILE}':text='${escDrawText(titleText)}':fontsize=${Math.max(38, Math.round(w * 0.055))}:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=92`);
  }
  if (subtitleText) {
    filters.push(`drawbox=x=60:y=h-170:w=${w - 120}:h=96:color=black@0.38:t=fill`);
    filters.push(`drawtext=fontfile='${FONT_FILE}':text='${escDrawText(subtitleText)}':fontsize=${Math.max(30, Math.round(w * 0.038))}:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h-142`);
  }
  filters.push('format=yuv420p');
  return filters.join(',');
}

function buildMultiFilter({ count, w, h, titleText, subtitleText, stickerMode }) {
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    if (stickerMode === 'sticker_pop') {
      parts.push(`[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`);
    } else {
      parts.push(`[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`);
    }
  }
  parts.push(`${Array.from({ length: count }, (_, i) => `[v${i}]`).join('')}concat=n=${count}:v=1:a=0[vcat]`);
  let last = 'vcat';
  if (titleText) {
    parts.push(`[${last}]drawbox=x=60:y=60:w=${w - 120}:h=120:color=black@0.42:t=fill,drawtext=fontfile='${FONT_FILE}':text='${escDrawText(titleText)}':fontsize=${Math.max(38, Math.round(w * 0.055))}:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=92[vt]`);
    last = 'vt';
  }
  if (subtitleText) {
    parts.push(`[${last}]drawbox=x=60:y=h-170:w=${w - 120}:h=96:color=black@0.38:t=fill,drawtext=fontfile='${FONT_FILE}':text='${escDrawText(subtitleText)}':fontsize=${Math.max(30, Math.round(w * 0.038))}:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h-142[vs]`);
    last = 'vs';
  }
  parts.push(`[${last}]format=yuv420p[vout]`);
  return parts.join(';');
}


function normalizeUploadedVideos(files) {
  const multi = getFileArray(files, 'videos').filter((x) => x?.buffer?.length);
  return multi.slice(0, 6);
}

function extFromVideoUpload(file) {
  const fromName = path.extname(file?.filename || '').toLowerCase();
  if (['.mp4', '.mov', '.webm', '.mkv', '.m4v'].includes(fromName)) return fromName;
  const type = String(file?.contentType || '').toLowerCase();
  if (type.includes('quicktime')) return '.mov';
  if (type.includes('webm')) return '.webm';
  return '.mp4';
}

function extFromAudioUpload(file) {
  const fromName = path.extname(file?.filename || '').toLowerCase();
  if (['.mp3', '.m4a', '.aac', '.wav', '.ogg'].includes(fromName)) return fromName;
  const type = String(file?.contentType || '').toLowerCase();
  if (type.includes('mpeg')) return '.mp3';
  if (type.includes('wav')) return '.wav';
  if (type.includes('aac')) return '.aac';
  if (type.includes('ogg')) return '.ogg';
  return '.mp3';
}

function getVoiceConfig(mode, rateValue) {
  const m = String(mode || 'none');
  const rate = Math.max(0.65, Math.min(Number(rateValue || 0.92), 1.25));
  const pct = Math.round((rate - 1) * 100);
  const rateText = `${pct >= 0 ? '+' : ''}${pct}%`;
  if (m === 'female') return { voice: 'zh-TW-HsiaoChenNeural', rateText };
  // warm_male / natural_male both use Taiwan male voice; warm is controlled by rate.
  return { voice: 'zh-TW-YunJheNeural', rateText };
}

async function synthesizeVoiceAdvanced({ voiceText, voiceMode, voiceRate, workDir }) {
  const trimmed = String(voiceText || '').trim();
  if (!trimmed || String(voiceMode || 'none') === 'none') {
    return { voiceFile: '', source: 'none' };
  }
  const wavPath = path.join(workDir, `voice_${Date.now()}.wav`);
  const mp3Path = path.join(workDir, `voice_${Date.now()}.mp3`);
  const { voice, rateText } = getVoiceConfig(voiceMode, voiceRate);

  try {
    await new Promise((resolve, reject) => {
      const cp = spawn('edge-tts', [
        '--voice', voice,
        `--rate=${rateText}`,  // edge-tts 在 Windows 遇到 -8% 這種負值時，必須用 --rate=-8% 形式，不能拆成兩個參數。
        '--text', trimmed,
        '--write-media', mp3Path,
      ], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      cp.stderr.on('data', (c) => (stderr += String(c)));
      cp.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr || `EDGE_TTS_EXIT_${code}`)));
    });

    await spawnFfmpeg(['-y', '-i', mp3Path, '-ac', '2', '-ar', '44100', wavPath]);
    return { voiceFile: wavPath, source: 'edge-tts', voice, rateText };
  } catch (error) {
    throw new Error(`自然口白產生失敗：請先安裝 edge-tts。原始錯誤：${error?.message || error}`);
  }
}


function srtTime(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const ms = Math.floor((s - Math.floor(s)) * 1000);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function splitSubtitleLines(text) {
  const raw = String(text || '').replace(/\r/g, '\n').split('\n').map((x) => x.trim()).filter(Boolean);
  if (raw.length) return raw.slice(0, 24);
  return [];
}

function ffmpegFilterPath(file) {
  let p = path.resolve(file).replace(/\\/g, '/');
  p = p.replace(/^([A-Za-z]):\//, '$1\\:/');
  return p.replace(/'/g, "\\'");
}

function getReadableFontFile() {
  const candidates = [
    process.env.RXV_FONT_FILE,
    FONT_FILE,
    'C:/Windows/Fonts/msjh.ttc',
    'C:/Windows/Fonts/msjhbd.ttc',
    'C:/Windows/Fonts/mingliu.ttc',
    'C:/Windows/Fonts/kaiu.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ].filter(Boolean);
  for (const item of candidates) {
    try {
      if (fs.existsSync(item)) return item;
    } catch {}
  }
  return candidates[0] || FONT_FILE;
}

function escapeDrawTextText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/%/g, '\\%')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,');
}

function getDrawTextY(position) {
  const p = String(position || 'bottom');
  if (p === 'top') return '120';
  if (p === 'middle') return '(h-text_h)/2';
  return 'h-text_h-120';
}

function buildDrawTextFilter({ lines, duration, subtitlePosition }) {
  const fontFile = ffmpegFilterPath(getReadableFontFile());
  const segment = duration / Math.max(lines.length, 1);
  const y = getDrawTextY(subtitlePosition);
  return lines.map((line, index) => {
    const start = Math.max(0, index * segment);
    const end = index === lines.length - 1 ? duration : Math.max(start + 0.1, (index + 1) * segment);
    const text = escapeDrawTextText(line);
    // 用 drawtext 取代 subtitles 濾鏡：Windows 上比較不會卡在 SRT/libass 路徑或字型問題。
    return [
      `drawtext=fontfile='${fontFile}'`,
      `text='${text}'`,
      'fontcolor=white',
      'fontsize=54',
      'borderw=5',
      'bordercolor=black',
      'shadowx=2',
      'shadowy=2',
      'shadowcolor=black@0.45',
      'x=(w-text_w)/2',
      `y=${y}`,
      `enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'`,
    ].join(':');
  }).join(',');
}

async function burnSubtitlesToVideo({ inputVideo, outputVideo, subtitleText, subtitlePosition, workDir }) {
  const lines = splitSubtitleLines(subtitleText);
  if (!lines.length) {
    await spawnFfmpeg(['-y', '-i', inputVideo, '-an', '-c:v', 'copy', '-movflags', '+faststart', outputVideo]);
    return { outputVideo, subtitleCount: 0 };
  }

  const duration = Math.max(await ffprobeDuration(inputVideo), 1);
  const drawFilter = buildDrawTextFilter({ lines, duration, subtitlePosition });
  await spawnFfmpeg([
    '-y',
    '-i', inputVideo,
    '-vf', drawFilter,
    '-an',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-movflags', '+faststart',
    outputVideo,
  ]);
  return { outputVideo, subtitleCount: lines.length };
}

async function muxVoiceAndBgmToVideo({ inputVideo, outputVideo, voiceText, voiceMode, voiceRate, voiceVolume, audioPreset, bgmFile, bgmVolume, workDir }) {
  const voice = await synthesizeVoiceAdvanced({ voiceText, voiceMode, voiceRate, workDir });
  const preset = String(audioPreset || 'none');
  const hasPresetBgm = preset !== 'none';
  const hasUploadBgm = !!bgmFile;
  const voiceVol = Math.max(0.1, Math.min(Number(voiceVolume || 1), 2));
  const userBgmVol = Math.max(0, Math.min(Number(bgmVolume ?? 0.18), 1));

  if (!voice.voiceFile && !hasPresetBgm && !hasUploadBgm) {
    await spawnFfmpeg(['-y', '-i', inputVideo, '-an', '-c:v', 'copy', '-movflags', '+faststart', outputVideo]);
    return { outputVideo, voiceSource: 'none', audioPreset: 'none', bgmSource: 'none' };
  }

  const args = ['-y', '-i', inputVideo];
  let voiceIndex = -1;
  let bgmIndex = -1;
  if (voice.voiceFile) {
    args.push('-i', voice.voiceFile);
    voiceIndex = 1;
  }
  if (hasUploadBgm) {
    args.push('-stream_loop', '-1', '-i', bgmFile);
    bgmIndex = voice.voiceFile ? 2 : 1;
  } else if (hasPresetBgm) {
    const audio = buildAudioLavfi(preset);
    args.push('-f', 'lavfi', '-i', audio.source);
    bgmIndex = voice.voiceFile ? 2 : 1;
  }

  const filters = [];
  const mixInputs = [];
  if (voiceIndex >= 0) {
    filters.push(`[${voiceIndex}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${voiceVol},apad[voice]`);
    mixInputs.push('[voice]');
  }
  if (bgmIndex >= 0) {
    const bgmVol = hasUploadBgm ? userBgmVol : Math.min(userBgmVol, 0.25);
    filters.push(`[${bgmIndex}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${bgmVol},apad[bgm]`);
    mixInputs.push('[bgm]');
  }

  if (mixInputs.length === 1) {
    filters.push(`${mixInputs[0]}anull[aout]`);
  } else {
    filters.push(`${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=longest:dropout_transition=2[aout]`);
  }

  args.push(
    '-filter_complex', filters.join(';'),
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    '-movflags', '+faststart',
    outputVideo,
  );
  await spawnFfmpeg(args);
  return { outputVideo, voiceSource: voice.source || 'none', audioPreset: preset, bgmSource: hasUploadBgm ? 'upload' : (hasPresetBgm ? preset : 'none') };
}

async function concatenateVideosToSilentBase({ inputFiles, outputFile, w = 1080, h = 1920, workDir }) {
  if (inputFiles.length === 1) {
    // 重新封裝並移除原音，避免 Flow 產生的奇怪人聲被帶進去。
    await spawnFfmpeg(['-y', '-i', inputFiles[0], '-an', '-vf', `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outputFile]);
    return outputFile;
  }
  const args = ['-y'];
  inputFiles.forEach((file) => args.push('-i', file));
  const parts = [];
  for (let i = 0; i < inputFiles.length; i += 1) {
    parts.push(`[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[v${i}]`);
  }
  parts.push(`${Array.from({ length: inputFiles.length }, (_, i) => `[v${i}]`).join('')}concat=n=${inputFiles.length}:v=1:a=0[vout]`);
  args.push('-filter_complex', parts.join(';'), '-map', '[vout]', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outputFile);
  await spawnFfmpeg(args);
  return outputFile;
}

app.post('/generate-video', async (req, res) => {
  ensureDirSync(TMP_ROOT);
  ensureDirSync(DEFAULT_OUTPUT_DIR);
  const workDir = path.join(TMP_ROOT, crypto.randomUUID());
  ensureDirSync(workDir);
  try {
    const { fields, files } = await parseMultipartForm(req, 160 * 1024 * 1024);
    const uploadedImages = normalizeUploadedImages(files);
    if (uploadedImages.length === 0) {
      return res.status(400).json({ ok: false, error: 'IMAGE_REQUIRED' });
    }

    const ratio = String(fields.ratio || '16:9');
    const resolution = String(fields.resolution || '1080p');
    const seconds = safeNumber(fields.seconds, 10, 1, 21600);
    const fps = safeNumber(fields.fps, 30, 12, 60);
    const effect = String(fields.effect || 'static');
    const stickerMode = String(fields.stickerMode || (uploadedImages.length > 1 ? 'multi_slideshow' : 'single_motion'));
    const secondsPerImage = safeNumber(fields.secondsPerImage, Math.max(0.8, seconds / Math.max(1, uploadedImages.length)), 0.5, 8);
    const titleText = String(fields.titleText || '').trim();
    const subtitleText = String(fields.subtitleText || '').trim();
    const audioPreset = String(fields.audioPreset || 'none');
    const voiceMode = String(fields.voiceMode || 'none');
    const voiceText = String(fields.voiceText || '').trim();
    const voiceRate = safeNumber(fields.voiceRate, voiceMode === 'warm_male' ? 0.88 : 0.95, 0.65, 1.25);
    const voiceVolume = safeNumber(fields.voiceVolume, 1, 0.1, 2);
    const outputFormat = String(fields.outputFormat || 'mp4').toLowerCase() === 'gif' ? 'gif' : 'mp4';
    const [w, h] = getVideoSizeFromRatio(ratio, resolution);
    const safeExt = outputFormat === 'gif' ? '.gif' : '.mp4';
    let outputFile = path.join(DEFAULT_OUTPUT_DIR, `sticker_video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`);

    const inputFiles = [];
    for (let i = 0; i < uploadedImages.length; i += 1) {
      const file = uploadedImages[i];
      const ext = extFromUpload(file);
      const inputFile = path.join(workDir, `input_${String(i + 1).padStart(2, '0')}${ext}`);
      await fsp.writeFile(inputFile, file.buffer);
      inputFiles.push(inputFile);
    }

    const totalDuration = uploadedImages.length > 1
      ? Math.max(seconds, secondsPerImage * uploadedImages.length)
      : seconds;

    if (outputFormat === 'gif') {
      const gifFps = Math.min(fps, 20);
      if (inputFiles.length === 1) {
        const vf = buildStillVf({ w, h, fps: gifFps, seconds: totalDuration, effect, titleText, subtitleText })
          .replace(',format=yuv420p', ',fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse');
        const args = ['-y', '-loop', '1', '-i', inputFiles[0], '-t', String(totalDuration), '-vf', vf, outputFile];
        await spawnFfmpeg(args);
      } else {
        const args = ['-y'];
        inputFiles.forEach((file) => args.push('-loop', '1', '-t', String(secondsPerImage), '-i', file));
        const baseFilter = buildMultiFilter({ count: inputFiles.length, w, h, titleText, subtitleText, stickerMode });
        const filter = `${baseFilter};[vout]fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[gifout]`;
        args.push('-filter_complex', filter, '-map', '[gifout]', outputFile);
        await spawnFfmpeg(args);
      }
    } else if (inputFiles.length === 1) {
      const audio = buildAudioLavfi(audioPreset);
      const vf = buildStillVf({ w, h, fps, seconds: totalDuration, effect, titleText, subtitleText });
      const args = [
        '-y',
        '-loop', '1',
        '-i', inputFiles[0],
        '-f', 'lavfi',
        '-i', audio.source,
        '-t', String(totalDuration),
        '-vf', vf,
        '-af', `volume=${audio.volume}`,
        '-r', String(fps),
        '-shortest',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-movflags', '+faststart',
        outputFile,
      ];
      await spawnFfmpeg(args);
    } else {
      const audio = buildAudioLavfi(audioPreset);
      const args = ['-y'];
      inputFiles.forEach((file) => args.push('-loop', '1', '-t', String(secondsPerImage), '-i', file));
      args.push('-f', 'lavfi', '-i', audio.source);
      const audioIndex = inputFiles.length;
      const filter = buildMultiFilter({ count: inputFiles.length, w, h, titleText, subtitleText, stickerMode });
      args.push(
        '-filter_complex', filter,
        '-map', '[vout]',
        '-map', `${audioIndex}:a`,
        '-af', `volume=${audio.volume}`,
        '-t', String(totalDuration),
        '-r', String(fps),
        '-shortest',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-movflags', '+faststart',
        outputFile,
      );
      await spawnFfmpeg(args);
    }

    if (outputFormat === 'mp4' && voiceMode !== 'none' && voiceText) {
      const voicedOutput = path.join(DEFAULT_OUTPUT_DIR, `sticker_video_voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`);
      await muxVoiceAndBgmToVideo({
        inputVideo: outputFile,
        outputVideo: voicedOutput,
        voiceText,
        voiceMode,
        voiceRate,
        voiceVolume,
        audioPreset,
        workDir,
      });
      outputFile = voicedOutput;
    }

    const videoUrl = buildPublicVideoUrl(outputFile);
    return res.json({
      ok: true,
      build: BUILD,
      videoUrl,
      downloadUrl: videoUrl,
      output: outputFile,
      ratio,
      resolution,
      seconds: totalDuration,
      fps,
      effect,
      stickerMode,
      imageCount: inputFiles.length,
      secondsPerImage,
      titleText,
      subtitleText,
      audioPreset,
      voiceMode,
      voiceText,
      voiceRate,
      voiceVolume,
      outputFormat,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'GENERATE_VIDEO_FAILED',
      message: error?.message || String(error),
      build: BUILD,
    });
  } finally {
    try { await fsp.rm(workDir, { recursive: true, force: true }); } catch {}
  }
});

function parseShopeeProductIds(productUrl) {
  const url = String(productUrl || "").trim();
  const productMatch = url.match(/\/product\/(\d+)\/(\d+)/);
  if (productMatch) return { shopId: productMatch[1], itemId: productMatch[2] };

  const iMatch = url.match(/[?&]i\.(\d+)\.(\d+)/);
  if (iMatch) return { shopId: iMatch[1], itemId: iMatch[2] };

  const plainMatch = url.match(/i\.(\d+)\.(\d+)/);
  if (plainMatch) return { shopId: plainMatch[1], itemId: plainMatch[2] };

  return { shopId: "", itemId: "" };
}

function normalizeShopeeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw.split("?")[0];

  const cleaned = raw.replace(/^\/+/g, "");
  if (cleaned.includes("/file/")) return `https://${cleaned}`.split("?")[0];

  return `https://down-tw.img.susercontent.com/file/${cleaned}`.split("?")[0];
}

function pickShopeeImagesFromPayload(payload) {
  const tierImagesA =
    payload?.data?.item?.tier_variations?.flatMap?.((x) => x?.images || []) ||
    [];
  const tierImagesB =
    payload?.item?.tier_variations?.flatMap?.((x) => x?.images || []) || [];
  const candidates = [
    payload?.data?.item?.images,
    tierImagesA,
    payload?.item?.images,
    tierImagesB,
  ].flat();

  return [
    ...new Set(candidates.map(normalizeShopeeImageUrl).filter(Boolean)),
  ].slice(0, 3);
}


let shopeeBrowserPromise = null;

async function getShopeeBrowser() {
  if (!shopeeBrowserPromise) {
    shopeeBrowserPromise = Promise.resolve()
      .then(() => require("playwright").chromium.launch({ headless: true }))
      .catch((error) => {
        shopeeBrowserPromise = null;
        throw error;
      });
  }
  return shopeeBrowserPromise;
}

async function fetchShopeeImagesWithBrowser(productUrl) {
  let context;
  try {
    const browser = await getShopeeBrowser();
    context = await browser.newContext({ locale: "zh-TW" });
    const page = await context.newPage();
    const response = await page.goto(productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const finalUrl = page.url();
    if (/\/verify\/(?:captcha|traffic)/i.test(finalUrl)) {
      console.warn("[shopee-images] verification required", { productUrl, finalUrl });
      return { images: [], source: "browser", error: "NEEDS_VERIFICATION", finalUrl };
    }

    if (response && !response.ok()) {
      console.warn("[shopee-images] browser response not ok", {
        status: response.status(),
        productUrl,
      });
    }

    await page
      .waitForSelector(".stardust-carousel__item-inner-wrapper", {
        timeout: 7000,
      })
      .catch(() => null);

    // Recovery rule from the earlier working UI flow:
    // media item #1 may be video, so take carousel items #2, #3, #4.
    const candidates = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(".stardust-carousel__item-inner-wrapper"),
      )
        .slice(1, 4)
        .map((item) => {
          const image = item.querySelector("img");
          return image?.currentSrc || image?.src || "";
        }),
    );

    const images = [
      ...new Set(candidates.map(normalizeShopeeImageUrl).filter(Boolean)),
    ]
      .filter((url) => /(?:img\.susercontent\.com|cf\.shopee\.tw)\/file\//i.test(url))
      .slice(0, 3);

    console.log("[shopee-images] recovery browser carousel", {
      productUrl,
      finalUrl,
      imageCount: images.length,
    });

    return {
      images,
      source: "browser-carousel-2-4",
      error: images.length ? "" : "NO_CAROUSEL_IMAGES",
      finalUrl,
    };
  } catch (error) {
    console.warn(
      "[shopee-images] recovery browser failed",
      error?.message || error,
    );
    return {
      images: [],
      source: "browser-carousel-2-4",
      error: error?.message || "BROWSER_FAILED",
      finalUrl: "",
    };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

async function fetchShopeeImagesByProductUrl(productUrl) {
  const { shopId, itemId } = parseShopeeProductIds(productUrl);
  if (!shopId || !itemId) return [];

  const apiUrl = `https://shopee.tw/api/v4/pdp/get_pc?shop_id=${encodeURIComponent(
    shopId,
  )}&item_id=${encodeURIComponent(
    itemId,
  )}&tz_offset_minutes=480&detail_level=0`;

  const headers = {
    accept: "application/json,text/plain,*/*",
    "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
    referer: productUrl,
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  };

  try {
    const response = await axios.get(apiUrl, {
      headers,
      timeout: 15000,
      validateStatus: () => true,
    });
    if (response.status >= 200 && response.status < 300) {
      const images = pickShopeeImagesFromPayload(response.data);
      if (images.length) return images;
    }
    console.warn("[shopee-images] api no images", {
      status: response.status,
      productUrl,
    });
  } catch (error) {
    console.warn("[shopee-images] api failed", error?.message || error);
  }

  try {
    const response = await axios.get(productUrl, {
      headers,
      timeout: 15000,
      validateStatus: () => true,
    });
    if (response.status >= 200 && response.status < 300) {
      const html = String(response.data || "");
      const ids = [...html.matchAll(/"images"\s*:\s*\[([^\]]+)\]/g)]
        .flatMap((match) =>
          [...String(match[1]).matchAll(/"([^"]+)"/g)].map((x) => x[1]),
        );
      const htmlImages = [...new Set(ids.map(normalizeShopeeImageUrl).filter(Boolean))].slice(
        0,
        3,
      );
      if (htmlImages.length) return htmlImages;
      console.warn("[shopee-images] html no images", {
        status: response.status,
        productUrl,
      });
    } else {
      console.warn("[shopee-images] html blocked, falling through to browser", {
        status: response.status,
        productUrl,
      });
    }
  } catch (error) {
    console.warn("[shopee-images] html fallback failed", error?.message || error);
  }

  const browserResult = await fetchShopeeImagesWithBrowser(productUrl);
  return browserResult.images;
}


// -----------------------------------------------------------------------------
// V39.0: normal Edge publisher extension queue.
// Mirrors the proven Shopee helper pattern: the local server creates a job,
// the extension running in the user's ordinary logged-in Edge claims it,
// prepares the post, and reports READY_TO_PUBLISH. No login automation.
// -----------------------------------------------------------------------------
const publisherExtensionJobs = new Map();
const publisherExtensionQueue = [];
let publisherExtensionLastHeartbeat = 0;
let publisherExtensionInfo = {};
let publisherExtensionLastEnqueue = null;
let publisherExtensionLastClaim = null;

function isPublisherExtensionOnline() {
  return (
    Date.now() - publisherExtensionLastHeartbeat <=
    RXV_PUBLISHER_EXTENSION_HEARTBEAT_TTL_MS
  );
}

function releaseExpiredPublisherExtensionLeases() {
  const now = Date.now();
  for (const job of publisherExtensionJobs.values()) {
    if (
      job.status === "processing" &&
      job.leasedAt &&
      now - job.leasedAt > RXV_PUBLISHER_EXTENSION_LEASE_MS
    ) {
      job.status = "pending";
      job.leasedAt = 0;
      job.updatedAt = now;
      if (!publisherExtensionQueue.includes(job.id)) {
        publisherExtensionQueue.push(job.id);
      }
    }
  }
}

function makePublisherExtensionJob(row) {
  const platform = String(row.platform || "");
  const payload = safeParsePublishPayload(row);
  const p = payload?.platforms?.[platform] || {};
  const rawPublishText = String(
    p?.publishText ||
      p?.publishDescription ||
      p?.body ||
      p?.caption ||
      "",
  ).trim();

  const publishText =
    platform === "tiktok"
      ? rxvEnsureTikTokPublishText({
          value: rawPublishText,
          affiliateUrl:
            row.affiliate_url,
          hashtags:
            p?.hashtags ||
            row.tiktok_hashtags ||
            row.hashtags ||
            "",
          title:
            row.product_title || "",
        })
      : rawPublishText;

  const targetUrl =
    platform === "facebook"
      ? "https://www.facebook.com/reels/create/"
      : platform === "tiktok"
        ? "https://www.tiktok.com/tiktokstudio/upload"
        : "";

  const job = {
    id: crypto.randomUUID(),
    publisherJobId: Number(row.id || 0),
    productKey: String(row.product_key || ""),
    productTitle: String(row.product_title || ""),
    platform,
    targetUrl,
    videoPath: String(row.video_path || ""),
    videoFilename: String(row.video_filename || ""),
    publishText,
    hashtags:
      platform === "tiktok"
        ? (publishText.match(/#[^\s#]+/g) || []).join(" ")
        : "",
    affiliateUrl: String(row.affiliate_url || ""),
    aiDisclosureRequested: platform === "facebook",
    finalPublishMode:
      platform === "tiktok"
        ? "auto"
        : "manual",
    status: "pending",
    error: "",
    debug: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    leasedAt: 0,
    attempts: 0,
  };

  publisherExtensionJobs.set(job.id, job);
  publisherExtensionQueue.push(job.id);
  return job;
}

function publicPublisherExtensionJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    publisherJobId: job.publisherJobId,
    productKey: job.productKey,
    productTitle: job.productTitle,
    platform: job.platform,
    targetUrl: job.targetUrl,
    videoPath: job.videoPath,
    videoFilename: job.videoFilename,
    publishText: job.publishText,
    hashtags: job.hashtags || "",
    affiliateUrl: job.affiliateUrl,
    aiDisclosureRequested: Boolean(job.aiDisclosureRequested),
    finalPublishMode: job.finalPublishMode,
    status: job.status,
    error: job.error || "",
    debug: job.debug || null,
    attempts: Number(job.attempts || 0),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

async function waitForPublisherExtensionJob(id) {
  const startedAt = Date.now();
  while (
    Date.now() - startedAt < RXV_PUBLISHER_EXTENSION_JOB_TIMEOUT_MS
  ) {
    const job = publisherExtensionJobs.get(id);
    if (!job) {
      return { status: "failed", error: "PUBLISHER_EXTENSION_JOB_LOST" };
    }
    if (["prepared", "published", "failed", "login_required"].includes(job.status)) {
      return job;
    }
    await helperSleep(350);
  }

  const job = publisherExtensionJobs.get(id);
  if (job && !["prepared", "published", "failed", "login_required"].includes(job.status)) {
    job.status = "failed";
    job.error = "PUBLISHER_EXTENSION_JOB_TIMEOUT";
    job.updatedAt = Date.now();
  }
  return job || { status: "failed", error: "PUBLISHER_EXTENSION_JOB_TIMEOUT" };
}

async function dispatchPublisherExtensionJob(
  jobId,
  { source = "manual" } = {},
) {
  const numericId = Number(jobId || 0);
  if (!numericId) {
    return { ok: false, error: "PUBLISHER_JOB_ID_REQUIRED" };
  }

  const row = getPublisherJobById(numericId);
  if (!row) {
    return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  }

  const platform = String(row.platform || "");
  if (!RXV_PUBLISHER_EXTENSION_SUPPORTED.has(platform)) {
    return {
      ok: false,
      error: "PUBLISHER_EXTENSION_PLATFORM_NOT_SUPPORTED",
      platform,
    };
  }

  const payload = safeParsePublishPayload(row);
  if (
    Number(row.publish_ready || 0) !== 1 ||
    payload?.safety?.ok !== true
  ) {
    return { ok: false, error: "PUBLISH_SAFETY_BLOCKED" };
  }

  const videoPath = String(row.video_path || "");
  if (!videoPath || !fs.existsSync(videoPath)) {
    return { ok: false, error: "VIDEO_FILE_NOT_FOUND" };
  }

  const guard = getPublisherRateGuard(platform);
  const rotationAssist = String(source || "") === "rotation";
  const bypassMinInterval =
    rotationAssist && guard.reason === "MIN_INTERVAL_GUARD";

  if (!guard.allowed && !bypassMinInterval) {
    return {
      ok: false,
      deferred: true,
      error: guard.reason,
      nextAllowedAt: guard.nextAllowedAt,
      todayCount: guard.todayCount,
      dailyLimit: guard.dailyLimit,
    };
  }

  if (!isPublisherExtensionOnline()) {
    return {
      ok: false,
      needsManualAction: true,
      prepared: false,
      error: "PUBLISHER_EXTENSION_OFFLINE",
      platform,
      job: publisherJobToApi(row),
    };
  }

  const now = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'publishing',
        attempt_count = attempt_count + 1,
        last_error = '',
        updated_at = ?
    WHERE id = ?
  `).run(now, numericId);
  setAffiliatePlatformStatusByProductKey(
    row.product_key,
    platform,
    "publishing",
    "",
  );

  const helperJob = makePublisherExtensionJob(row);
  const result = await waitForPublisherExtensionJob(helperJob.id);

  setTimeout(
    () => publisherExtensionJobs.delete(helperJob.id),
    10 * 60 * 1000,
  ).unref?.();

  if (result?.status === "published") {
    const publishedAt = sqliteNow();
    const publishedUrl =
      String(
        result?.debug?.publishedUrl || "",
      );

    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'published',
          published_url = ?,
          last_error = '',
          published_at = ?,
          next_attempt_at = NULL,
          updated_at = ?
      WHERE id = ?
    `).run(
      publishedUrl,
      publishedAt,
      publishedAt,
      numericId,
    );

    getAffiliateDb().prepare(`
      UPDATE publisher_settings
      SET last_published_at = ?,
          updated_at = ?
      WHERE platform = ?
    `).run(
      publishedAt,
      publishedAt,
      platform,
    );

    markAffiliatePlatformPublished(
      row.product_key,
      platform,
      publishedUrl,
    );

    return {
      ok: true,
      published: true,
      platform,
      adapterMode: "extension",
      publishedUrl,
      debug:
        result?.debug || null,
      job:
        publisherJobToApi(
          getPublisherJobById(numericId),
        ),
    };
  }

  if (result?.status === "prepared") {
    const reason = [
      "EXTENSION_READY_TO_PUBLISH",
      result?.debug?.warning || "",
    ].filter(Boolean).join(": ");

    browserMarkNeedsManual(
      row,
      numericId,
      reason,
      "",
    );

    return {
      ok: false,
      needsManualAction: true,
      prepared: true,
      platform,
      adapterMode: "extension",
      error: reason,
      extensionJobId: helperJob.id,
      debug: result?.debug || null,
      job: publisherJobToApi(
        getPublisherJobById(numericId),
      ),
    };
  }

  if (result?.status === "login_required") {
    const reason = String(
      result?.error || "EXTENSION_LOGIN_REQUIRED",
    );
    browserMarkNeedsManual(row, numericId, reason, "");
    return {
      ok: false,
      needsManualAction: true,
      prepared: false,
      platform,
      adapterMode: "extension",
      error: reason,
      debug: result?.debug || null,
      job: publisherJobToApi(
        getPublisherJobById(numericId),
      ),
    };
  }

  const errorCode = String(
    result?.error || "PUBLISHER_EXTENSION_PREPARE_FAILED",
  );
  const failedAt = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'failed',
        last_error = ?,
        updated_at = ?
    WHERE id = ?
  `).run(errorCode, failedAt, numericId);
  setAffiliatePlatformStatusByProductKey(
    row.product_key,
    platform,
    "failed",
    errorCode,
  );

  return {
    ok: false,
    error: errorCode,
    platform,
    adapterMode: "extension",
    debug: result?.debug || null,
    job: publisherJobToApi(
      getPublisherJobById(numericId),
    ),
  };
}


function publisherExtensionQueueSummary() {
  const jobs = [...publisherExtensionJobs.values()];
  return {
    pending: jobs.filter((j) => j.status === "pending").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    prepared: jobs.filter((j) => j.status === "prepared").length,
    published: jobs.filter((j) => j.status === "published").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    loginRequired: jobs.filter((j) => j.status === "login_required").length,
  };
}

function findExistingExtensionJob(publisherJobId, platform = "") {
  const id = Number(publisherJobId || 0);
  for (const job of publisherExtensionJobs.values()) {
    if (Number(job.publisherJobId || 0) !== id) continue;
    if (platform && String(job.platform || "") !== String(platform || "")) continue;

    // V39.7: only an actually runnable job may be reused.
    // A PREPARED job was the V39.6 dead-queue bug: requeue-latest returned
    // reused=true, but PREPARED is not present in publisherExtensionQueue,
    // so the popup stayed IDLE with pending=0 forever.
    if (["pending", "processing"].includes(String(job.status || ""))) {
      return job;
    }
  }
  return null;
}

function ensurePendingExtensionJobQueued(job) {
  if (!job || String(job.status || "") !== "pending") return false;
  if (publisherExtensionQueue.includes(job.id)) return false;
  publisherExtensionQueue.push(job.id);
  job.updatedAt = Date.now();
  return true;
}

function purgeTerminalExtensionJobsForPublisher(publisherJobId, platform = "") {
  const id = Number(publisherJobId || 0);
  let removed = 0;
  for (const [helperId, job] of publisherExtensionJobs.entries()) {
    if (Number(job.publisherJobId || 0) !== id) continue;
    if (platform && String(job.platform || "") !== String(platform || "")) continue;
    if (["pending", "processing"].includes(String(job.status || ""))) continue;
    publisherExtensionJobs.delete(helperId);
    removed += 1;
  }
  return removed;
}

function validateExtensionPublisherRow(row) {
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  const platform = String(row.platform || "");
  if (!RXV_PUBLISHER_EXTENSION_SUPPORTED.has(platform)) {
    return { ok: false, error: "PUBLISHER_EXTENSION_PLATFORM_NOT_SUPPORTED", platform };
  }
  const payload = safeParsePublishPayload(row);
  if (Number(row.publish_ready || 0) !== 1 || payload?.safety?.ok !== true) {
    return { ok: false, error: "PUBLISH_SAFETY_BLOCKED", platform };
  }
  const videoPath = String(row.video_path || "");
  if (!videoPath || !fs.existsSync(videoPath)) {
    return { ok: false, error: "VIDEO_FILE_NOT_FOUND", platform, videoPath };
  }
  return { ok: true, platform };
}

function enqueueExtensionPublisherJobNow(
  publisherJobId,
  source = "direct",
  { forceFresh = false } = {},
) {
  const id = Number(publisherJobId || 0);
  if (!id) return { ok: false, error: "PUBLISHER_JOB_ID_REQUIRED" };
  const row = getPublisherJobById(id);
  const valid = validateExtensionPublisherRow(row);
  if (!valid.ok) return valid;

  // Never duplicate a live claim. If an old PENDING helper exists but its
  // queue id was lost, repair the queue in-place.
  const existing = findExistingExtensionJob(id, valid.platform);
  if (existing) {
    const repairedQueue = ensurePendingExtensionJobQueued(existing);
    publisherExtensionLastEnqueue = {
      at: Date.now(),
      source,
      publisherJobId: id,
      helperJobId: String(existing.id || ""),
      platform: valid.platform,
      reused: true,
      repairedQueue,
      status: String(existing.status || ""),
    };
    return {
      ok: true,
      reused: true,
      repairedQueue,
      source,
      helperJob: publicPublisherExtensionJob(existing),
      queue: publisherExtensionQueueSummary(),
      queueDepth: publisherExtensionQueue.length,
      publisherJob: publisherJobToApi(row),
    };
  }

  // V39.7: a manual requeue must not be blocked by a stale PREPARED/FAILED
  // helper object left in the in-memory map. Remove terminal copies before
  // creating the fresh pending helper.
  const purgedTerminalJobs = forceFresh
    ? purgeTerminalExtensionJobsForPublisher(id, valid.platform)
    : 0;

  const now = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'publishing',
        scheduled_at = NULL,
        next_attempt_at = NULL,
        last_error = '',
        updated_at = ?
    WHERE id = ?
  `).run(now, id);

  setAffiliatePlatformStatusByProductKey(
    row.product_key,
    valid.platform,
    "publishing",
    "",
  );

  const fresh = getPublisherJobById(id) || row;
  const helperJob = makePublisherExtensionJob(fresh);

  publisherExtensionLastEnqueue = {
    at: Date.now(),
    source,
    publisherJobId: id,
    helperJobId: String(helperJob.id || ""),
    platform: valid.platform,
    reused: false,
    repairedQueue: false,
    purgedTerminalJobs,
    status: String(helperJob.status || ""),
  };

  return {
    ok: true,
    reused: false,
    purgedTerminalJobs,
    source,
    helperJob: publicPublisherExtensionJob(helperJob),
    queue: publisherExtensionQueueSummary(),
    queueDepth: publisherExtensionQueue.length,
    publisherJob: publisherJobToApi(getPublisherJobById(id)),
  };
}

function reconcileExtensionPublisherJob(job) {
  if (!job) return { ok: false, error: "PUBLISHER_EXTENSION_JOB_NOT_FOUND" };
  const id = Number(job.publisherJobId || 0);
  const row = getPublisherJobById(id);
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  const platform = String(row.platform || "");
  const status = String(job.status || "");

  if (status === "published") {
    const now = sqliteNow();
    const url = String(job?.debug?.publishedUrl || job?.debug?.url || "");
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'published', published_url = ?, last_error = '',
          published_at = ?, next_attempt_at = NULL, updated_at = ?
      WHERE id = ?
    `).run(url, now, now, id);
    getAffiliateDb().prepare(`
      UPDATE publisher_settings
      SET last_published_at = ?, updated_at = ?
      WHERE platform = ?
    `).run(now, now, platform);
    markAffiliatePlatformPublished(row.product_key, platform, url);
    return { ok: true, status: "published" };
  }

  if (status === "prepared") {
    browserMarkNeedsManual(row, id, "EXTENSION_READY_TO_PUBLISH", "");
    return { ok: true, status: "needs_manual_action" };
  }

  if (status === "login_required") {
    browserMarkNeedsManual(row, id, String(job.error || "EXTENSION_LOGIN_REQUIRED"), "");
    return { ok: true, status: "needs_manual_action" };
  }

  if (status === "failed") {
    const err = String(job.error || "PUBLISHER_EXTENSION_PREPARE_FAILED");
    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs SET status = 'failed', last_error = ?, updated_at = ?
      WHERE id = ?
    `).run(err, now, id);
    setAffiliatePlatformStatusByProductKey(row.product_key, platform, "failed", err);
    return { ok: true, status: "failed" };
  }

  return { ok: true, status: String(row.status || "") };
}

app.get("/publisher-extension/video-file/:helperJobId", async (req, res) => {
  try {
    const helperJobId = String(req.params?.helperJobId || "").trim();
    const job = publisherExtensionJobs.get(helperJobId);

    if (!job || String(job.platform || "") !== "tiktok") {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_EXTENSION_VIDEO_JOB_NOT_FOUND",
      });
    }

    const videoPath = String(job.videoPath || "").trim();
    if (!videoPath || !fs.existsSync(videoPath)) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_EXTENSION_VIDEO_FILE_NOT_FOUND",
      });
    }

    const stat = await fsp.stat(videoPath);
    if (!stat.isFile()) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_EXTENSION_VIDEO_NOT_A_FILE",
      });
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", String(stat.size));
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(path.basename(videoPath))}`,
    );

    fs.createReadStream(videoPath).pipe(res);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_EXTENSION_VIDEO_BRIDGE_FAILED",
      message: String(error?.message || error),
    });
  }
});

app.post("/publisher-extension/requeue-publisher-job", (req, res) => {
  try {
    const result = enqueueExtensionPublisherJobNow(Number(req.body?.jobId || 0), "website-direct", { forceFresh: true });
    if (!result.ok) return res.status(result.error === "PUBLISHER_JOB_NOT_FOUND" ? 404 : 409).json({ ...result, build: BUILD });
    return res.json({ ...result, build: BUILD, online: isPublisherExtensionOnline() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "PUBLISHER_EXTENSION_DIRECT_REQUEUE_FAILED", message: String(error?.message || error) });
  }
});

app.post("/publisher-extension/requeue-latest", (req, res) => {
  try {
    const platform = normalizePlatformName(req.body?.platform || "tiktok");
    if (!RXV_PUBLISHER_EXTENSION_SUPPORTED.has(platform)) {
      return res.status(409).json({ ok: false, error: "PUBLISHER_EXTENSION_PLATFORM_NOT_SUPPORTED", platform });
    }
    syncPublisherJobsFromAffiliateDb();
    const candidate = getAffiliateDb().prepare(`
      SELECT j.*, a.*
      FROM publisher_jobs j
      JOIN affiliate_products a ON a.product_key = j.product_key
      WHERE j.platform = ?
        AND a.video_status = 'completed'
        AND a.publish_ready = 1
        AND a.publish_payload_version = 'v37.14'
        AND j.status IN ('queued','failed','needs_manual_action','publishing')
      ORDER BY CASE j.status WHEN 'queued' THEN 0 WHEN 'failed' THEN 1 WHEN 'needs_manual_action' THEN 2 ELSE 3 END,
               j.updated_at DESC, j.id DESC
      LIMIT 1
    `).get(platform);
    if (!candidate) {
      return res.status(404).json({ ok: false, error: "NO_ELIGIBLE_PUBLISHER_JOB", platform, queue: publisherExtensionQueueSummary() });
    }
    const result = enqueueExtensionPublisherJobNow(Number(candidate.id || 0), "popup-latest", { forceFresh: true });
    if (!result.ok) return res.status(409).json({ ...result, build: BUILD });
    return res.json({
      ...result,
      build: BUILD,
      online: isPublisherExtensionOnline(),
      candidate: {
        id: Number(candidate.id || 0),
        productKey: String(candidate.product_key || ""),
        productTitle: String(candidate.product_title || ""),
        videoFilename: String(candidate.video_filename || ""),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "PUBLISHER_EXTENSION_REQUEUE_LATEST_FAILED", message: String(error?.message || error) });
  }
});

app.get("/publisher-extension/latest-eligible", (req, res) => {
  try {
    const platform = normalizePlatformName(req.query?.platform || "tiktok");
    syncPublisherJobsFromAffiliateDb();
    const candidate = getAffiliateDb().prepare(`
      SELECT j.id, j.platform, j.status, a.product_key, a.product_title, a.video_filename
      FROM publisher_jobs j
      JOIN affiliate_products a ON a.product_key = j.product_key
      WHERE j.platform = ?
        AND a.video_status = 'completed'
        AND a.publish_ready = 1
        AND a.publish_payload_version = 'v37.14'
        AND j.status IN ('queued','failed','needs_manual_action','publishing')
      ORDER BY j.updated_at DESC, j.id DESC
      LIMIT 1
    `).get(platform);
    return res.json({
      ok: true,
      build: BUILD,
      platform,
      candidate: candidate ? {
        id: Number(candidate.id || 0),
        status: String(candidate.status || ""),
        productKey: String(candidate.product_key || ""),
        productTitle: String(candidate.product_title || ""),
        videoFilename: String(candidate.video_filename || ""),
      } : null,
      queue: publisherExtensionQueueSummary(),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "PUBLISHER_EXTENSION_LATEST_ELIGIBLE_FAILED", message: String(error?.message || error) });
  }
});

app.post("/publisher-extension/ping", (req, res) => {
  publisherExtensionLastHeartbeat = Date.now();
  publisherExtensionInfo = {
    version: String(req.body?.version || ""),
    browser: String(req.body?.browser || ""),
    currentUrl: String(req.body?.currentUrl || "").split("?")[0],
    activeJobId: String(req.body?.activeJobId || ""),
  };
  releaseExpiredPublisherExtensionLeases();
  return res.json({
    ok: true,
    build: BUILD,
    online: true,
    supportedPlatforms: [...RXV_PUBLISHER_EXTENSION_SUPPORTED],
  });
});

app.get("/publisher-extension/status", (_req, res) => {
  releaseExpiredPublisherExtensionLeases();
  const jobs = [...publisherExtensionJobs.values()];
  return res.json({
    ok: true,
    build: BUILD,
    online: isPublisherExtensionOnline(),
    lastHeartbeat: publisherExtensionLastHeartbeat,
    extension: publisherExtensionInfo,
    installDir: RXV_PUBLISHER_EXTENSION_DIR,
    supportedPlatforms: [...RXV_PUBLISHER_EXTENSION_SUPPORTED],
    pending: jobs.filter((job) => job.status === "pending").length,
    processing: jobs.filter((job) => job.status === "processing").length,
    prepared: jobs.filter((job) => job.status === "prepared").length,
    published: jobs.filter((job) => job.status === "published").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    loginRequired: jobs.filter((job) => job.status === "login_required").length,
    recentJobs: jobs.slice(-10).map(publicPublisherExtensionJob),
    queue: publisherExtensionQueueSummary(),
    queueDepth: publisherExtensionQueue.length,
    queuedHelperIds: publisherExtensionQueue.slice(-10),
    lastEnqueue: publisherExtensionLastEnqueue,
    lastClaim: publisherExtensionLastClaim,
  });
});

app.get("/publisher-extension/next", (_req, res) => {
  publisherExtensionLastHeartbeat = Date.now();
  releaseExpiredPublisherExtensionLeases();

  while (publisherExtensionQueue.length) {
    const id = publisherExtensionQueue.shift();
    const job = publisherExtensionJobs.get(id);
    if (!job || job.status !== "pending") continue;
    job.status = "processing";
    job.leasedAt = Date.now();
    job.updatedAt = Date.now();
    job.attempts += 1;
    publisherExtensionLastClaim = {
      at: Date.now(),
      helperJobId: String(job.id || ""),
      publisherJobId: Number(job.publisherJobId || 0),
      platform: String(job.platform || ""),
      attempts: Number(job.attempts || 0),
    };
    return res.json({
      ok: true,
      job: publicPublisherExtensionJob(job),
    });
  }

  return res.json({ ok: true, job: null });
});

app.post("/publisher-extension/result", (req, res) => {
  publisherExtensionLastHeartbeat = Date.now();
  const id = String(req.body?.id || "").trim();
  const job = publisherExtensionJobs.get(id);
  if (!job) {
    return res.status(404).json({
      ok: false,
      error: "PUBLISHER_EXTENSION_JOB_NOT_FOUND",
    });
  }

  const status =
    String(req.body?.status || "prepared");

  job.status =
    status === "login_required"
      ? "login_required"
      : status === "published"
        ? "published"
        : "prepared";
  job.error = String(req.body?.error || "");
  job.debug = req.body?.debug || null;
  job.leasedAt = 0;
  job.updatedAt = Date.now();

  const reconcile = reconcileExtensionPublisherJob(job);
  return res.json({
    ok: true,
    job: publicPublisherExtensionJob(job),
    reconcile,
    queue: publisherExtensionQueueSummary(),
  });
});

app.post("/publisher-extension/fail", (req, res) => {
  publisherExtensionLastHeartbeat = Date.now();
  const id = String(req.body?.id || "").trim();
  const job = publisherExtensionJobs.get(id);
  if (!job) {
    return res.status(404).json({
      ok: false,
      error: "PUBLISHER_EXTENSION_JOB_NOT_FOUND",
    });
  }

  job.status = "failed";
  job.error = String(
    req.body?.error || "PUBLISHER_EXTENSION_PREPARE_FAILED",
  );
  job.debug = req.body?.debug || null;
  job.leasedAt = 0;
  job.updatedAt = Date.now();

  const reconcile = reconcileExtensionPublisherJob(job);
  return res.json({
    ok: true,
    job: publicPublisherExtensionJob(job),
    reconcile,
    queue: publisherExtensionQueueSummary(),
  });
});

app.post("/publisher-extension/open-setup", (_req, res) => {
  try {
    const edgeExe = findEdgeExecutable();
    if (edgeExe) {
      spawn(edgeExe, ["edge://extensions/"], {
        detached: true,
        stdio: "ignore",
      }).unref();
    }
    if (process.platform === "win32") {
      spawn("explorer.exe", [RXV_PUBLISHER_EXTENSION_DIR], {
        detached: true,
        stdio: "ignore",
      }).unref();
    }
    return res.json({
      ok: true,
      installDir: RXV_PUBLISHER_EXTENSION_DIR,
      edgeOpened: Boolean(edgeExe),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_EXTENSION_SETUP_OPEN_FAILED",
      message: String(error?.message || error),
    });
  }
});

// -----------------------------------------------------------------------------
// V36: normal-browser batch queue.
// The website keeps its existing /shopee-images call. A small Chrome/Edge
// extension running in the user's ordinary logged-in browser takes the jobs,
// opens each Shopee product page, clicks thumbnails 2/3/4, captures the large
// images, and posts the result back here.
// -----------------------------------------------------------------------------
const SHOPEE_HELPER_HEARTBEAT_TTL_MS = Number(
  process.env.SHOPEE_HELPER_HEARTBEAT_TTL_MS || 120000,
);
const SHOPEE_HELPER_JOB_TIMEOUT_MS = Number(
  process.env.SHOPEE_HELPER_JOB_TIMEOUT_MS || 720000,
);
const SHOPEE_HELPER_LEASE_MS = Number(
  process.env.SHOPEE_HELPER_LEASE_MS || 180000,
);
const SHOPEE_HELPER_OFFLINE_GRACE_MS = Number(
  process.env.SHOPEE_HELPER_OFFLINE_GRACE_MS || 20000,
);

const shopeeHelperJobs = new Map();
const shopeeHelperQueue = [];
let shopeeHelperLastHeartbeat = 0;
let shopeeHelperInfo = {};

function helperSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isShopeeHelperOnline() {
  return Date.now() - shopeeHelperLastHeartbeat <= SHOPEE_HELPER_HEARTBEAT_TTL_MS;
}

function makeShopeeHelperJob(item) {
  const now = Date.now();
  const job = {
    id: crypto.randomUUID(),
    index: item.index,
    productUrl: item.productUrl,
    status: "pending",
    images: [],
    error: "",
    debug: null,
    createdAt: now,
    updatedAt: now,
    leasedAt: 0,
    attempts: 0,
  };
  shopeeHelperJobs.set(job.id, job);
  shopeeHelperQueue.push(job.id);
  return job;
}

function publicShopeeHelperJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    index: job.index,
    productUrl: job.productUrl,
    status: job.status,
    images: Array.isArray(job.images) ? job.images : [],
    error: job.error || "",
    debug: job.debug || null,
    attempts: Number(job.attempts || 0),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function releaseExpiredShopeeHelperLeases() {
  const now = Date.now();
  for (const job of shopeeHelperJobs.values()) {
    if (
      job.status === "processing" &&
      job.leasedAt &&
      now - job.leasedAt > SHOPEE_HELPER_LEASE_MS
    ) {
      job.status = "pending";
      job.leasedAt = 0;
      job.updatedAt = now;
      if (!shopeeHelperQueue.includes(job.id)) shopeeHelperQueue.push(job.id);
    }
  }
}

async function waitForShopeeHelperJob(id) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < SHOPEE_HELPER_JOB_TIMEOUT_MS) {
    const job = shopeeHelperJobs.get(id);
    if (!job) {
      return { status: "failed", images: [], error: "HELPER_JOB_LOST", debug: null };
    }
    if (job.status === "done" || job.status === "failed") return job;
    await helperSleep(300);
  }
  const job = shopeeHelperJobs.get(id);
  if (job && job.status !== "done") {
    job.status = "failed";
    job.error = "HELPER_JOB_TIMEOUT";
    job.updatedAt = Date.now();
  }
  return job || { status: "failed", images: [], error: "HELPER_JOB_TIMEOUT", debug: null };
}

app.post("/shopee-extension/ping", (req, res) => {
  shopeeHelperLastHeartbeat = Date.now();
  shopeeHelperInfo = {
    version: String(req.body?.version || ""),
    browser: String(req.body?.browser || ""),
    currentUrl: String(req.body?.currentUrl || ""),
  };
  releaseExpiredShopeeHelperLeases();
  return res.json({
    ok: true,
    build: BUILD,
    online: true,
    pending: [...shopeeHelperJobs.values()].filter((job) => job.status === "pending").length,
  });
});

app.get("/shopee-extension/status", (_req, res) => {
  releaseExpiredShopeeHelperLeases();
  const jobs = [...shopeeHelperJobs.values()];
  return res.json({
    ok: true,
    build: BUILD,
    online: isShopeeHelperOnline(),
    lastHeartbeat: shopeeHelperLastHeartbeat,
    extension: shopeeHelperInfo,
    pending: jobs.filter((job) => job.status === "pending").length,
    processing: jobs.filter((job) => job.status === "processing").length,
    done: jobs.filter((job) => job.status === "done").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    recentJobs: jobs.slice(-10).map((job) => ({
      id: job.id,
      index: job.index,
      productUrl: job.productUrl,
      status: job.status,
      imageCount: Array.isArray(job.images) ? job.images.length : 0,
      error: job.error || "",
      attempts: Number(job.attempts || 0),
      debug: job.debug || null,
    })),
  });
});

app.get("/shopee-extension/next", (_req, res) => {
  shopeeHelperLastHeartbeat = Date.now();
  releaseExpiredShopeeHelperLeases();
  while (shopeeHelperQueue.length) {
    const id = shopeeHelperQueue.shift();
    const job = shopeeHelperJobs.get(id);
    if (!job || job.status !== "pending") continue;
    job.status = "processing";
    job.leasedAt = Date.now();
    job.updatedAt = Date.now();
    job.attempts += 1;
    return res.json({ ok: true, job: publicShopeeHelperJob(job) });
  }
  return res.json({ ok: true, job: null });
});

app.post("/shopee-extension/result", (req, res) => {
  shopeeHelperLastHeartbeat = Date.now();
  const id = String(req.body?.id || "").trim();
  const job = shopeeHelperJobs.get(id);
  if (!job) return res.status(404).json({ ok: false, error: "HELPER_JOB_NOT_FOUND" });

  const images = [
    ...new Set(
      (Array.isArray(req.body?.images) ? req.body.images : [])
        .map(normalizeShopeeImageUrl)
        .filter((url) => /(?:img\.susercontent\.com|cf\.shopee\.tw\/file\/)/i.test(String(url || ""))),
    ),
  ].slice(0, 3);

  job.images = images;
  job.debug = req.body?.debug || null;
  job.error = images.length >= 3 ? "" : String(req.body?.error || `ONLY_${images.length}_IMAGES`);
  job.status = images.length >= 3 ? "done" : "failed";
  job.leasedAt = 0;
  job.updatedAt = Date.now();

  return res.json({ ok: true, job: publicShopeeHelperJob(job) });
});

app.post("/shopee-extension/fail", (req, res) => {
  shopeeHelperLastHeartbeat = Date.now();
  const id = String(req.body?.id || "").trim();
  const job = shopeeHelperJobs.get(id);
  if (!job) return res.status(404).json({ ok: false, error: "HELPER_JOB_NOT_FOUND" });
  job.images = [];
  job.debug = req.body?.debug || null;
  job.error = String(req.body?.error || "HELPER_CAPTURE_FAILED");
  job.status = "failed";
  job.leasedAt = 0;
  job.updatedAt = Date.now();
  return res.json({ ok: true, job: publicShopeeHelperJob(job) });
});

async function fetchShopeeImagesViaHelper(items) {
  // V36.2: queue first, then give the normal-browser helper a short grace
  // period to wake. Never fall back immediately to the known-blocked legacy path.
  const jobs = items.map(makeShopeeHelperJob);
  console.log("[shopee-images] V36.2 queued for normal browser helper", {
    count: jobs.length,
    helperOnlineAtQueue: isShopeeHelperOnline(),
  });

  const wakeStartedAt = Date.now();
  while (!isShopeeHelperOnline() && Date.now() - wakeStartedAt < SHOPEE_HELPER_OFFLINE_GRACE_MS) {
    await helperSleep(250);
  }

  if (!isShopeeHelperOnline()) {
    for (const job of jobs) {
      if (job.status === "pending") {
        job.status = "failed";
        job.error = "HELPER_OFFLINE";
        job.updatedAt = Date.now();
      }
    }
    console.warn("[shopee-images] helper did not wake in grace period", {
      graceMs: SHOPEE_HELPER_OFFLINE_GRACE_MS,
      count: jobs.length,
    });
  }

  const settled = await Promise.all(jobs.map((job) => waitForShopeeHelperJob(job.id)));

  for (const job of jobs) {
    setTimeout(() => shopeeHelperJobs.delete(job.id), 10 * 60 * 1000).unref?.();
  }

  return settled.map((job, i) => ({
    index: items[i].index,
    productUrl: items[i].productUrl,
    ok: Array.isArray(job?.images) && job.images.length >= 3,
    images: Array.isArray(job?.images) ? job.images.slice(0, 3) : [],
    source: "normal-browser-helper-v36.2",
    error:
      Array.isArray(job?.images) && job.images.length >= 3
        ? ""
        : job?.error || "HELPER_CAPTURE_FAILED",
    debug: job?.debug || null,
  }));
}

app.post("/shopee-images", async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body?.items)
      ? req.body.items
      : req.body?.productUrl
        ? [{ index: 0, productUrl: req.body.productUrl }]
        : [];

    const items = rawItems
      .map((item, fallbackIndex) => ({
        index: Number.isFinite(Number(item?.index)) ? Number(item.index) : fallbackIndex,
        productUrl: String(item?.productUrl || item?.url || "").trim(),
      }))
      .filter((item) => item.productUrl)
      .slice(0, 50);
    // V36.2: every missing-image request goes to the normal logged-in browser
    // helper. The old fallback is known to be blocked by Shopee and caused 0/3
    // whenever the MV3 worker briefly slept.
    if (!items.length) {
      return res.json({
        ok: true,
        count: 0,
        mode: "normal-browser-helper-v36.2",
        helperOnline: isShopeeHelperOnline(),
        results: [],
      });
    }

    const results = await fetchShopeeImagesViaHelper(items);
    return res.json({
      ok: true,
      count: results.length,
      mode: "normal-browser-helper-v36.2",
      helperOnline: isShopeeHelperOnline(),
      results,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "SHOPEE_IMAGES_FAILED",
      message: error?.message || String(error),
      build: BUILD,
    });
  }
});



function materializePublishCopy(script, affiliateUrl, title = "") {
  const safeAffiliateUrl = String(affiliateUrl || "").trim();
  const grounded = rxvBuildGroundedPublishProfile(title, safeAffiliateUrl);

  if (grounded) {
    const shortTitle = rxvFinalPublishGuardText(
      grounded.shortTitle,
      title,
      "",
    );
    const shortDescription = rxvFinalPublishGuardText(
      grounded.shortDescription,
      title,
      safeAffiliateUrl,
    );
    const fullPost = rxvFinalPublishGuardText(
      grounded.fullPost,
      title,
      safeAffiliateUrl,
    );

    return {
      shortTitle,
      shortDescription,
      keywords: grounded.keywords,
      titleWithKeywords: [shortTitle, grounded.keywords]
        .filter(Boolean)
        .join("\n"),
      fullPost,
    };
  }

  const shortTitle = rxvFinalPublishGuardText(
    script?.shortTitle || "",
    title,
    "",
  );
  const keywords = String(script?.keywords || "").trim();

  let shortDescription = String(script?.shortDescription || "").trim();
  let fullPost = String(
    script?.fullPost ||
      `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]`,
  ).trim();

  shortDescription = shortDescription.replace(
    /\[affiliateUrl\]/gi,
    safeAffiliateUrl,
  );
  fullPost = fullPost.replace(
    /\[affiliateUrl\]/gi,
    safeAffiliateUrl,
  );

  if (safeAffiliateUrl && !fullPost.includes(safeAffiliateUrl)) {
    fullPost = `${fullPost}\n\n${safeAffiliateUrl}`.trim();
  }

  return {
    shortTitle,
    shortDescription: rxvFinalPublishGuardText(
      shortDescription,
      title,
      safeAffiliateUrl,
    ),
    keywords,
    titleWithKeywords:
      rxvFinalPublishGuardText(
        String(script?.titleWithKeywords || "").trim(),
        title,
        "",
      ) ||
      [shortTitle, keywords].filter(Boolean).join("\n"),
    fullPost: rxvFinalPublishGuardText(
      fullPost,
      title,
      safeAffiliateUrl,
    ),
  };
}


app.get("/gemini/status", async (_req, res) => {
  const status = await probeGeminiDirect();
  return res.status(status.configured && !status.connected ? 503 : 200).json({
    ...status,
    build: BUILD,
    provider: "google-gemini-direct",
    apiBase: GEMINI_API_BASE,
    keySource: readGeminiApiKey()
      ? process.env.GEMINI_API_KEY
        ? "GEMINI_API_KEY"
        : "GEMINI_API_KEY_SUMMARY"
      : "not-set",
    apiKey: readGeminiApiKey() ? "present-not-exposed" : "missing",
  });
});

app.get("/openclaw-native/status", async (_req, res) => {
  const status = await probeOpenClawNative();
  return res.status(status.ok ? 200 : 503).json({
    ...status,
    build: BUILD,
    baseUrl: OPENCLAW_NATIVE_BASE_URL,
    responsesUrl: OPENCLAW_NATIVE_RESPONSES_URL,
    modelsUrl: OPENCLAW_NATIVE_MODELS_URL,
    agentId: OPENCLAW_AGENT_ID,
    configFile: OPENCLAW_CONFIG_FILE,
    token: status.tokenFound ? "present-not-exposed" : "missing",
  });
});




app.get("/youtube/status", async (req, res) => {
  try {
    const verify = String(req.query?.verify || "") === "1";
    const verified = verify ? await verifyYouTubeConnection() : null;
    return res.json({
      ok: true,
      build: BUILD,
      status: youtubePublicStatus(),
      verified,
      note: "V38.4.11 直接從 D:\\\\out_mp4 上傳 YouTube，不使用 R2 / Supabase Storage。",
    });
  } catch (error) {
    const safe = sanitizeExternalError(error);
    return res.status(500).json({ ok: false, error: "YOUTUBE_STATUS_FAILED", message: safe.message, status: youtubePublicStatus() });
  }
});

app.get("/youtube/oauth/start", (req, res) => {
  try {
    const url = buildYouTubeOAuthUrl();
    if (String(req.query?.format || "") === "json") return res.json({ ok: true, authUrl: url });
    return res.redirect(url);
  } catch (error) {
    return res.status(409).send(`YouTube OAuth 尚未設定：${String(error?.message || error)}`);
  }
});

app.get("/youtube/oauth/callback", async (req, res) => {
  const oauthError = String(req.query?.error || "");
  const code = String(req.query?.code || "");
  const state = String(req.query?.state || "");
  if (oauthError) return res.status(400).send("YouTube 授權未完成：" + oauthError);
  const expiresAt = youtubeOauthStates.get(state);
  youtubeOauthStates.delete(state);
  if (!state || !expiresAt || expiresAt < Date.now()) return res.status(400).send("YouTube OAuth state 無效或已過期，請回網站重新連接。");
  if (!code) return res.status(400).send("YouTube OAuth 沒有回傳授權碼。");
  try {
    await exchangeYouTubeOAuthCode(code);
    const verified = await verifyYouTubeConnection();
    if (!verified.ok) throw new Error(verified.error || "YouTube verify failed");
    const channelTitle = String(verified.channelTitle || "").replace(/[<>&"]/g, "");
    return res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:Arial,'Microsoft JhengHei';padding:32px"><h2>YouTube 已連線</h2><p>頻道：${channelTitle}</p><p>可以關閉這個視窗，回 RxV 發布中心。</p><script>if(window.opener){window.opener.postMessage({type:'rxv-youtube-oauth-success'},'http://localhost:3005');setTimeout(()=>window.close(),1200);}</script></body>`);
  } catch (error) {
    const safe = sanitizeExternalError(error);
    return res.status(500).send("YouTube 授權交換失敗：" + safe.message);
  }
});

app.post("/youtube/test", async (_req, res) => {
  try {
    const verified = await verifyYouTubeConnection();
    return res.status(verified.ok ? 200 : 409).json({ ok: verified.ok, build: BUILD, verified, status: youtubePublicStatus() });
  } catch (error) {
    const safe = sanitizeExternalError(error);
    return res.status(500).json({ ok: false, error: "YOUTUBE_CONNECTION_TEST_FAILED", message: safe.message, status: youtubePublicStatus() });
  }
});

app.post("/youtube/disconnect", (_req, res) => {
  clearYouTubeTokenStore();
  return res.json({ ok: true, status: youtubePublicStatus() });
});

app.get("/meta/status", async (req, res) => {
  try {
    const verify = String(req.query?.verify || "") === "1";
    let verified = null;
    if (verify) {
      verified = await verifyMetaConnections();
    }

    return res.json({
      ok: true,
      build: BUILD,
      status: metaPublicStatus(),
      verified,
      requirements: {
        facebook:
          "Facebook Page + Page Access Token + Page 發布影片/Reels 所需權限。",
        instagram:
          "Instagram 專業帳號連結 Facebook Page + Instagram content publishing 權限；影片直接用 Meta resumable upload，不需要 R2。",
      },
    });
  } catch (error) {
    const safe = sanitizeExternalError(error);
    return res.status(500).json({
      ok: false,
      error: "META_STATUS_FAILED",
      message: safe.message,
      status: metaPublicStatus(),
    });
  }
});

app.post("/meta/test", async (_req, res) => {
  try {
    const verified = await verifyMetaConnections();
    return res.status(verified.ok ? 200 : 409).json({
      ok: verified.ok,
      build: BUILD,
      verified,
      status: metaPublicStatus(),
    });
  } catch (error) {
    const safe = sanitizeExternalError(error);
    return res.status(500).json({
      ok: false,
      error: "META_CONNECTION_TEST_FAILED",
      message: safe.message,
      status: metaPublicStatus(),
    });
  }
});


app.get("/browser/status", (_req, res) => {
  return res.json({ ok: true, status: browserStatusPayload() });
});

app.post("/browser/open", async (req, res) => {
  try {
    const target = String(req.body?.target || "home");
    const urls = {
      home: "https://www.facebook.com/",
      facebook: "https://www.facebook.com/",
      instagram: "https://www.instagram.com/",
      tiktok: "https://www.tiktok.com/tiktokstudio/upload",
      threads: "https://www.threads.net/",
      x: "https://x.com/compose/post",
    };
    const page = await getBrowserPage(urls[target] || urls.home);
    return res.json({ ok: true, status: browserStatusPayload(), url: page.url() });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "BROWSER_OPEN_FAILED",
      message: String(error?.message || error),
      status: browserStatusPayload(),
    });
  }
});

app.post("/browser/close", async (_req, res) => {
  try {
    if (rxvBrowserContext) await rxvBrowserContext.close();
    rxvBrowserContext = null;
    return res.json({ ok: true, status: browserStatusPayload() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "BROWSER_CLOSE_FAILED", message: String(error?.message || error) });
  }
});

app.post("/browser/cleanup-cache", async (_req, res) => {
  const result = cleanupBrowserCaches();
  return res.status(result.ok ? 200 : 409).json(result);
});


app.post("/publisher/retry", async (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    if (!jobId) {
      return res.status(400).json({
        ok: false,
        error: "PUBLISHER_JOB_ID_REQUIRED",
      });
    }

    const row = getPublisherJobById(jobId);
    if (!row) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_JOB_NOT_FOUND",
      });
    }

    if (rxvBrowserJobLocks.has(jobId)) {
      return res.status(409).json({
        ok: false,
        error: "PUBLISHER_JOB_ALREADY_RUNNING",
      });
    }

    const platform = String(row.platform || "");
    const oldPublishedAt = String(row.published_at || "");
    let clearedRateGuard = false;

    // V38.4.1 could falsely mark a Browser job as published and also write
    // publisher_settings.last_published_at. That stale timestamp then caused
    // MIN_INTERVAL_GUARD / HTTP 429 even after pressing Retry.
    //
    // Clear the platform guard ONLY when it points to the same published_at
    // timestamp of the job the user explicitly chose to retry.
    if (isBrowserPlatformSupported(platform) && oldPublishedAt) {
      const setting = getPublisherSettingRow(platform) || {};
      const lastPublishedAt = String(setting.last_published_at || "");
      if (lastPublishedAt && lastPublishedAt === oldPublishedAt) {
        getAffiliateDb().prepare(`
          UPDATE publisher_settings
          SET last_published_at = NULL,
              updated_at = ?
          WHERE platform = ?
        `).run(sqliteNow(), platform);
        clearedRateGuard = true;
      }
    }

    const now = sqliteNow();

    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'queued',
          scheduled_at = NULL,
          next_attempt_at = NULL,
          remote_post_id = '',
          published_url = '',
          published_at = NULL,
          last_error = '',
          updated_at = ?
      WHERE id = ?
    `).run(now, jobId);

    setAffiliatePlatformStatusByProductKey(
      row.product_key,
      platform,
      "queued",
      "",
    );

    return res.json({
      ok: true,
      build: BUILD,
      message: "PUBLISHER_JOB_RESET_TO_QUEUED",
      clearedRateGuard,
      job: publisherJobToApi(getPublisherJobById(jobId)),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_RETRY_RESET_FAILED",
      message: String(error?.message || error),
    });
  }
});



function getRotationProgress(productKey) {
  const rows = getAffiliateDb().prepare(`
    SELECT id, platform, status, last_error, published_url
    FROM publisher_jobs
    WHERE product_key = ?
      AND platform IN ('facebook','tiktok','youtube_shorts','threads','x')
  `).all(String(productKey || ""));

  const byPlatform = new Map(rows.map((row) => [String(row.platform || ""), row]));
  const items = RXV_ROTATION_PLATFORMS.map((platform) => {
    const row = byPlatform.get(platform);
    return {
      platform,
      jobId: Number(row?.id || 0),
      status: String(row?.status || "missing"),
      lastError: String(row?.last_error || ""),
      publishedUrl: String(row?.published_url || ""),
    };
  });
  const completed = items.filter((item) => item.status === "published" || item.status === "cancelled").length;
  const published = items.filter((item) => item.status === "published").length;
  return {
    productKey: String(productKey || ""),
    total: RXV_ROTATION_PLATFORMS.length,
    completed,
    published,
    remaining: RXV_ROTATION_PLATFORMS.length - completed,
    done: completed >= RXV_ROTATION_PLATFORMS.length,
    items,
  };
}

function markRotationBrowserJobPublished(jobId) {
  const numericId = Number(jobId || 0);
  const row = getPublisherJobById(numericId);
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  const platform = String(row.platform || "");
  if (!RXV_ROTATION_BROWSER_PLATFORMS.has(platform)) {
    return { ok: false, error: "ROTATION_CONFIRM_BROWSER_ONLY" };
  }
  if (!["needs_manual_action", "publishing"].includes(String(row.status || ""))) {
    return { ok: false, error: "ROTATION_JOB_NOT_WAITING_CONFIRM" };
  }

  let currentUrl = "";
  try {
    const matchers = {
      facebook: /facebook\.com/i,
      instagram: /instagram\.com/i,
      threads: /threads\.net/i,
      x: /(?:^|\/\/)(?:www\.)?x\.com/i,
    };
    for (const page of rxvBrowserContext?.pages?.() || []) {
      if (page.isClosed()) continue;
      const url = String(page.url() || "");
      if (matchers[platform]?.test(url)) currentUrl = url.split("?")[0];
    }
  } catch {}

  const publishedAt = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'published', published_url = ?, last_error = '',
        published_at = ?, next_attempt_at = NULL, updated_at = ?
    WHERE id = ?
  `).run(currentUrl, publishedAt, publishedAt, numericId);
  getAffiliateDb().prepare(`
    UPDATE publisher_settings
    SET last_published_at = ?, updated_at = ?
    WHERE platform = ?
  `).run(publishedAt, publishedAt, platform);
  markAffiliatePlatformPublished(row.product_key, platform, currentUrl);
  return { ok: true, row, publishedUrl: currentUrl };
}

function markRotationSkipped(jobId, reason = "ROTATION_SKIPPED_BY_USER") {
  const numericId = Number(jobId || 0);
  const row = getPublisherJobById(numericId);
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };
  const now = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'cancelled', last_error = ?, updated_at = ?
    WHERE id = ?
  `).run(String(reason), now, numericId);
  setAffiliatePlatformStatusByProductKey(row.product_key, row.platform, "failed", String(reason));
  return { ok: true, row };
}

function getRotationJob(productKey, platform) {
  return getAffiliateDb().prepare(`
    SELECT j.*, a.*
    FROM publisher_jobs j
    JOIN affiliate_products a ON a.product_key = j.product_key
    WHERE j.product_key = ? AND j.platform = ?
    LIMIT 1
  `).get(String(productKey || ""), String(platform || "")) || null;
}


function resetRotationJobForPreparation(jobId) {
  const numericId = Number(jobId || 0);
  const row = getPublisherJobById(numericId);
  if (!row) return { ok: false, error: "PUBLISHER_JOB_NOT_FOUND" };

  const now = sqliteNow();
  getAffiliateDb().prepare(`
    UPDATE publisher_jobs
    SET status = 'queued', last_error = '', scheduled_at = NULL,
        next_attempt_at = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, numericId);

  setAffiliatePlatformStatusByProductKey(
    row.product_key,
    row.platform,
    "queued",
    "",
  );

  return { ok: true, row: getPublisherJobById(numericId) };
}

function resetRotationPendingJobsForStart(productKey) {
  const key = String(productKey || "");
  const rows = getAffiliateDb().prepare(`
    SELECT id
    FROM publisher_jobs
    WHERE product_key = ?
      AND platform IN ('facebook','youtube_shorts','threads','x')
      AND status IN ('needs_manual_action','publishing','failed')
    ORDER BY id ASC
  `).all(key);

  let resetCount = 0;
  for (const item of rows) {
    const result = resetRotationJobForPreparation(Number(item.id || 0));
    if (result.ok) resetCount += 1;
  }
  return resetCount;
}

async function advanceRotation(productKey, startAfterPlatform = "") {
  const key = String(productKey || "");
  const startIndex = RXV_ROTATION_PLATFORMS.indexOf(String(startAfterPlatform || ""));
  const ordered = startIndex >= 0
    ? [...RXV_ROTATION_PLATFORMS.slice(startIndex + 1), ...RXV_ROTATION_PLATFORMS.slice(0, startIndex + 1)]
    : [...RXV_ROTATION_PLATFORMS];
  const skipped = [];

  for (const platform of ordered) {
    const row = getRotationJob(key, platform);
    if (!row) { skipped.push({ platform, reason: "ROTATION_JOB_MISSING" }); continue; }
    const status = String(row.status || "");
    if (status === "published" || status === "cancelled") continue;

    if (status === "failed") {
      const now = sqliteNow();
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET status = 'queued', last_error = '', scheduled_at = NULL,
            next_attempt_at = NULL, updated_at = ?
        WHERE id = ?
      `).run(now, Number(row.id || 0));
      setAffiliatePlatformStatusByProductKey(key, platform, "queued", "");
    }

    let current = getPublisherJobById(Number(row.id || 0));
    if (String(current?.status || "") === "needs_manual_action") {
      resetRotationJobForPreparation(Number(row.id || 0));
      current = getPublisherJobById(Number(row.id || 0));
    }

    const result = await dispatchPublisherJob(Number(row.id || 0), { source: "rotation" });
    if (result?.ok === true) continue;
    if (result?.needsManualAction) {
      return { ok: true, needsManualAction: true, prepared: Boolean(result.prepared),
        platform, error: result.error || "", job: result.job || publisherJobToApi(getPublisherJobById(Number(row.id || 0))),
        progress: getRotationProgress(key), skipped };
    }

    const errorCode = String(result?.error || result?.message || "ROTATION_PLATFORM_FAILED");
    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs SET status = 'failed', last_error = ?, updated_at = ? WHERE id = ?
    `).run(`ROTATION: ${errorCode}`, now, Number(row.id || 0));
    setAffiliatePlatformStatusByProductKey(key, platform, "failed", `ROTATION: ${errorCode}`);
    skipped.push({ platform, reason: errorCode });
  }

  return { ok: true, done: true, progress: getRotationProgress(key), skipped };
}

app.post("/publisher/rotation/start", async (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const productKey = String(req.body?.productKey || getPublisherJobById(jobId)?.product_key || "");
    if (!productKey) return res.status(400).json({ ok: false, error: "ROTATION_PRODUCT_KEY_REQUIRED" });

    const resetCount = resetRotationPendingJobsForStart(productKey);
    const result = await advanceRotation(productKey, "");

    return res.json({ ...result, ok: true, build: BUILD, productKey, resetCount });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "ROTATION_START_FAILED", message: String(error?.message || error) });
  }
});

app.post("/publisher/rotation/confirm-next", async (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const confirmed = markRotationBrowserJobPublished(jobId);
    if (!confirmed.ok) return res.status(409).json(confirmed);
    const productKey = String(confirmed.row.product_key || "");
    const platform = String(confirmed.row.platform || "");
    const result = await advanceRotation(productKey, platform);
    return res.json({ ...result, ok: true, build: BUILD, productKey, confirmedJobId: jobId, confirmedPlatform: platform });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "ROTATION_CONFIRM_NEXT_FAILED", message: String(error?.message || error) });
  }
});

app.post("/publisher/rotation/skip-next", async (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const skippedCurrent = markRotationSkipped(jobId);
    if (!skippedCurrent.ok) return res.status(404).json(skippedCurrent);
    const productKey = String(skippedCurrent.row.product_key || "");
    const platform = String(skippedCurrent.row.platform || "");
    const result = await advanceRotation(productKey, platform);
    return res.json({ ...result, ok: true, build: BUILD, productKey, skippedJobId: jobId, skippedPlatform: platform });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "ROTATION_SKIP_NEXT_FAILED", message: String(error?.message || error) });
  }
});

app.get("/publisher/rotation/status", (req, res) => {
  try {
    const productKey = String(req.query?.productKey || "");
    if (!productKey) return res.status(400).json({ ok: false, error: "ROTATION_PRODUCT_KEY_REQUIRED" });
    return res.json({ ok: true, build: BUILD, progress: getRotationProgress(productKey) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "ROTATION_STATUS_FAILED", message: String(error?.message || error) });
  }
});

app.post("/publisher/fast-confirm-next", async (req, res) => {
  try {
    const jobId =
      Number(req.body?.jobId || 0);

    const row =
      getPublisherJobById(jobId);

    if (!row) {
      return res.status(404).json({
        ok: false,
        error:
          "PUBLISHER_JOB_NOT_FOUND",
      });
    }

    if (
      String(row.platform || "") !==
      "facebook"
    ) {
      return res.status(409).json({
        ok: false,
        error:
          "FAST_MODE_FACEBOOK_ONLY",
      });
    }

    if (
      ![
        "needs_manual_action",
        "publishing",
      ].includes(
        String(row.status || ""),
      )
    ) {
      return res.status(409).json({
        ok: false,
        error:
          "FAST_MODE_JOB_NOT_READY",
      });
    }

    // User explicitly confirms that Facebook's final Publish was clicked
    // and accepted. Trust that manual confirmation; do not run slow/fragile
    // Facebook post verification in Fast Monetization Mode.
    let currentUrl = "";

    try {
      const pages =
        rxvBrowserContext?.pages?.() ||
        [];

      for (const page of pages) {
        if (page.isClosed()) continue;

        const url =
          String(page.url() || "");

        if (
          /facebook\.com\/reel\/\d+/i.test(
            url,
          )
        ) {
          currentUrl =
            extractFacebookReelUrl(url);

          if (currentUrl) break;
        }
      }
    } catch {}

    const publishedAt = sqliteNow();

    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'published',
          published_url = ?,
          last_error = '',
          published_at = ?,
          next_attempt_at = NULL,
          updated_at = ?
      WHERE id = ?
    `).run(
      currentUrl,
      publishedAt,
      publishedAt,
      jobId,
    );

    getAffiliateDb().prepare(`
      UPDATE publisher_settings
      SET last_published_at = ?,
          updated_at = ?
      WHERE platform = 'facebook'
    `).run(
      publishedAt,
      publishedAt,
    );

    markAffiliatePlatformPublished(
      row.product_key,
      "facebook",
      currentUrl,
    );

    const next =
      getAffiliateDb().prepare(`
        SELECT id, product_key
        FROM publisher_jobs
        WHERE platform = 'facebook'
          AND status = 'queued'
        ORDER BY updated_at ASC, id ASC
        LIMIT 1
      `).get();

    return res.json({
      ok: true,
      build: BUILD,
      confirmedByUser: true,
      publishedUrl:
        currentUrl,
      nextJobId:
        Number(next?.id || 0),
      nextProductKey:
        String(
          next?.product_key || "",
        ),
      job:
        publisherJobToApi(
          getPublisherJobById(jobId),
        ),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error:
        "FAST_MODE_CONFIRM_NEXT_FAILED",
      message:
        String(
          error?.message || error,
        ),
    });
  }
});

app.post("/publisher/browser-confirm", async (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const row = getPublisherJobById(jobId);
    if (!row) return res.status(404).json({ ok: false, error: "PUBLISHER_JOB_NOT_FOUND" });
    if (String(row.status || "") !== "needs_manual_action") {
      return res.status(409).json({ ok: false, error: "JOB_NOT_WAITING_FOR_MANUAL_CONFIRM" });
    }

    let currentUrl = "";
    try {
      currentUrl = rxvBrowserContext?.pages()?.find((item) => !item.isClosed())?.url() || "";
    } catch {}
    const publishedAt = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'published',
          published_url = ?,
          last_error = '',
          published_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(currentUrl, publishedAt, publishedAt, jobId);
    getAffiliateDb().prepare(`
      UPDATE publisher_settings
      SET last_published_at = ?, updated_at = ?
      WHERE platform = ?
    `).run(publishedAt, publishedAt, row.platform);
    markAffiliatePlatformPublished(row.product_key, row.platform, currentUrl);
    return res.json({ ok: true, build: BUILD, confirmedByUser: true, job: publisherJobToApi(getPublisherJobById(jobId)) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "BROWSER_CONFIRM_FAILED", message: String(error?.message || error) });
  }
});

app.get("/publisher/status", (_req, res) => {
  try {
    const sync = syncPublisherJobsFromAffiliateDb();
    const counts = getPublisherJobCounts();

    const readyProducts = Number(
      getAffiliateDb()
        .prepare(`
          SELECT COUNT(*) AS count
          FROM affiliate_products
          WHERE video_status = 'completed'
            AND publish_ready = 1
            AND publish_payload_version = 'v37.14'
        `)
        .get()?.count || 0,
    );

    return res.json({
      ok: true,
      build: BUILD,
      mode: "cross-platform-rotation-v38.6.1",
      actualPublishingEnabled: true,
      readyProducts,
      counts,
      settings: getPublisherSettings(),
      connections: getPublisherConnections(),
      browser: browserStatusPayload(),
      sync,
      note:
        "V40.0 TikTok 已切換官方 Content Posting API；YouTube 使用官方 OAuth/API；Facebook 另依目前 adapter 設定。",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_STATUS_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.get("/publisher/jobs", (req, res) => {
  try {
    syncPublisherJobsFromAffiliateDb();

    const limit = Math.max(
      1,
      Math.min(300, Number(req.query?.limit || 100)),
    );
    const platform = normalizePlatformName(req.query?.platform);
    const status = String(req.query?.status || "").trim();

    const allowedStatuses = new Set([
      "",
      "queued",
      "scheduled",
      "publishing",
      "published",
      "failed",
      "needs_manual_action",
      "cancelled",
    ]);
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_PUBLISHER_STATUS_FILTER",
      });
    }

    const where = [];
    const args = [];

    if (platform) {
      where.push("j.platform = ?");
      args.push(platform);
    }
    if (status) {
      where.push("j.status = ?");
      args.push(status);
    }

    const sql = `
      SELECT j.*, a.*
      FROM publisher_jobs j
      JOIN affiliate_products a
        ON a.product_key = j.product_key
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY
        CASE j.status
          WHEN 'scheduled' THEN 0
          WHEN 'queued' THEN 1
          WHEN 'needs_manual_action' THEN 2
          WHEN 'failed' THEN 3
          WHEN 'publishing' THEN 4
          WHEN 'published' THEN 4
          ELSE 5
        END,
        COALESCE(j.scheduled_at, j.updated_at) ASC
      LIMIT ?
    `;

    const rows = getAffiliateDb().prepare(sql).all(...args, limit);

    return res.json({
      ok: true,
      count: rows.length,
      jobs: rows.map(publisherJobToApi),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_JOBS_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/publisher/sync", (_req, res) => {
  try {
    const sync = syncPublisherJobsFromAffiliateDb();
    return res.json({
      ok: true,
      sync,
      counts: getPublisherJobCounts(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_SYNC_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/publisher/settings", (req, res) => {
  try {
    const platform = normalizePlatformName(req.body?.platform);
    if (!platform) {
      return res.status(400).json({
        ok: false,
        error: "UNSUPPORTED_PLATFORM",
      });
    }

    const existing = getAffiliateDb()
      .prepare(
        "SELECT * FROM publisher_settings WHERE platform = ?",
      )
      .get(platform);
    if (!existing) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_SETTING_NOT_FOUND",
      });
    }

    const dailyLimitMax = platform === "tiktok" ? 14 : 100;
    const dailyLimit = Math.max(
      1,
      Math.min(
        dailyLimitMax,
        Number(req.body?.dailyLimit ?? existing.daily_limit ?? 8),
      ),
    );
    const minIntervalMinutes = Math.max(
      5,
      Math.min(
        1440,
        Number(
          req.body?.minIntervalMinutes ??
            existing.min_interval_minutes ??
            90,
        ),
      ),
    );
    const enabled =
      req.body?.enabled == null
        ? Number(existing.enabled || 0) === 1
        : Boolean(req.body.enabled);
    const autoPublish =
      req.body?.autoPublish == null
        ? Number(existing.auto_publish || 0) === 1
        : Boolean(req.body.autoPublish);

    const requestedAdapter = String(
      req.body?.adapterMode ?? existing.adapter_mode ?? browserSettingDefault(platform).adapterMode,
    ).toLowerCase();
    const adapterMode = ["extension", "browser", "api", "off"].includes(requestedAdapter)
      ? requestedAdapter
      : browserSettingDefault(platform).adapterMode;
    const browserFinalConfirm =
      req.body?.browserFinalConfirm == null
        ? Number(existing.browser_final_confirm ?? 1) === 1
        : Boolean(req.body.browserFinalConfirm);
    const requestedVisibility = String(
      req.body?.browserVisibility ?? existing.browser_visibility ?? "private",
    ).toLowerCase();
    const browserVisibility = ["private", "unlisted", "public"].includes(requestedVisibility)
      ? requestedVisibility
      : "private";

    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_settings
      SET enabled = ?,
          daily_limit = ?,
          min_interval_minutes = ?,
          auto_publish = ?,
          adapter_mode = ?,
          browser_final_confirm = ?,
          browser_visibility = ?,
          updated_at = ?
      WHERE platform = ?
    `).run(
      enabled ? 1 : 0,
      dailyLimit,
      minIntervalMinutes,
      autoPublish ? 1 : 0,
      adapterMode,
      browserFinalConfirm ? 1 : 0,
      browserVisibility,
      now,
      platform,
    );

    return res.json({
      ok: true,
      settings: getPublisherSettings(),
      actualPublishingEnabled: true,
      note:
        adapterMode === "extension"
          ? "一般 Edge 擴充模式已保存；不自動登入，會在你平常的 Edge 內準備貼文並停在最後發布前。"
          : adapterMode === "browser"
            ? "Playwright Browser 模式已保存。"
            : adapterMode === "api"
              ? "API 模式設定已保存。"
              : "此平台已關閉。",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_SETTINGS_UPDATE_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/publisher/schedule", (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    if (!jobId) {
      return res.status(400).json({
        ok: false,
        error: "PUBLISHER_JOB_ID_REQUIRED",
      });
    }

    const row = getPublisherJobById(jobId);
    if (!row) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_JOB_NOT_FOUND",
      });
    }

    const payload = safeParsePublishPayload(row);
    if (
      Number(row.publish_ready || 0) !== 1 ||
      payload?.safety?.ok !== true
    ) {
      return res.status(409).json({
        ok: false,
        error: "PUBLISH_SAFETY_BLOCKED",
      });
    }

    const scheduleAt = normalizePublisherSchedule(
      req.body?.scheduledAt,
    );
    if (!scheduleAt) {
      return res.status(400).json({
        ok: false,
        error: "SCHEDULE_TIME_REQUIRED",
      });
    }

    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'scheduled',
          scheduled_at = ?,
          next_attempt_at = ?,
          last_error = '',
          updated_at = ?
      WHERE id = ?
    `).run(scheduleAt, scheduleAt, now, jobId);

    setAffiliatePlatformStatusByProductKey(
      row.product_key,
      row.platform,
      "queued",
      "",
    );

    return res.json({
      ok: true,
      job: publisherJobToApi(getPublisherJobById(jobId)),
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error:
        error?.message === "INVALID_SCHEDULE_TIME"
          ? "INVALID_SCHEDULE_TIME"
          : "PUBLISHER_SCHEDULE_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/publisher/cancel", (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const row = getPublisherJobById(jobId);
    if (!row) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_JOB_NOT_FOUND",
      });
    }

    if (String(row.status || "") === "published") {
      return res.status(409).json({
        ok: false,
        error: "PUBLISHED_JOB_CANNOT_BE_CANCELLED",
      });
    }

    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'cancelled',
          scheduled_at = NULL,
          next_attempt_at = NULL,
          updated_at = ?
      WHERE id = ?
    `).run(now, jobId);

    setAffiliatePlatformStatusByProductKey(
      row.product_key,
      row.platform,
      "not_published",
      "",
    );

    return res.json({
      ok: true,
      job: publisherJobToApi(getPublisherJobById(jobId)),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_CANCEL_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/publisher/retry", (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const row = getPublisherJobById(jobId);
    if (!row) {
      return res.status(404).json({
        ok: false,
        error: "PUBLISHER_JOB_NOT_FOUND",
      });
    }

    const payload = safeParsePublishPayload(row);
    if (
      Number(row.publish_ready || 0) !== 1 ||
      payload?.safety?.ok !== true
    ) {
      return res.status(409).json({
        ok: false,
        error: "PUBLISH_SAFETY_BLOCKED",
      });
    }

    const now = sqliteNow();
    getAffiliateDb().prepare(`
      UPDATE publisher_jobs
      SET status = 'queued',
          scheduled_at = NULL,
          next_attempt_at = NULL,
          last_error = '',
          updated_at = ?
      WHERE id = ?
    `).run(now, jobId);

    setAffiliatePlatformStatusByProductKey(
      row.product_key,
      row.platform,
      "queued",
      "",
    );

    return res.json({
      ok: true,
      job: publisherJobToApi(getPublisherJobById(jobId)),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "PUBLISHER_RETRY_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/publisher/dispatch", async (req, res) => {
  const jobId = Number(req.body?.jobId || 0);
  const result = await dispatchPublisherJob(
    jobId,
    { source: "manual" },
  );

  if (result.ok || result.needsManualAction || result.deferred) {
    // Browser manual-action and local rate-guard/deferred states are EXPECTED
    // application states. Return HTTP 200 so DevTools does not misleadingly
    // show them as server/network failures. The JSON flags still tell the UI
    // whether the action actually published.
    return res.status(200).json({
      ...result,
      ok: result.ok === true,
      build: BUILD,
    });
  }

  const status =
    result.error === "PUBLISHER_JOB_NOT_FOUND"
      ? 404
      : result.error === "PUBLISH_SAFETY_BLOCKED"
          ? 409
          : result.error === "PUBLISHER_ADAPTER_NOT_CONNECTED"
            ? 409
            : result.error === "BROWSER_ADAPTER_NOT_SUPPORTED"
              ? 409
              : result.error === "PUBLISHER_ADAPTER_DISABLED"
                ? 409
                : result.error?.includes("CONFIG_MISSING")
                  ? 409
                  : 500;

  return res.status(status).json({
    ...result,
    build: BUILD,
  });
});


app.post("/publisher/tiktok-reconcile", async (req, res) => {
  try {
    const jobId = Number(req.body?.jobId || 0);
    const row = getPublisherJobById(jobId);
    if (!row) return res.status(404).json({ ok: false, error: "PUBLISHER_JOB_NOT_FOUND" });
    if (String(row.platform || "") !== "tiktok") {
      return res.status(409).json({ ok: false, error: "NOT_TIKTOK_JOB" });
    }
    const publishId = String(row.remote_post_id || "").trim();
    if (!publishId) return res.status(409).json({ ok: false, error: "TIKTOK_PUBLISH_ID_MISSING" });

    const status = await tiktokOfficial.fetchPublishStatus(publishId);
    const providerStatus = String(status?.status || "");
    const now = sqliteNow();

    if (providerStatus === "FAILED") {
      const reason = String(status?.fail_reason || "TIKTOK_PROCESSING_FAILED");
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs SET status='failed', last_error=?, updated_at=? WHERE id=?
      `).run(reason, now, jobId);
      setAffiliatePlatformStatusByProductKey(row.product_key, "tiktok", "failed", reason);
      return res.status(409).json({ ok: false, error: reason, status, job: publisherJobToApi(getPublisherJobById(jobId)) });
    }

    if (providerStatus === "PUBLISH_COMPLETE") {
      const publicIds = Array.isArray(status?.publicaly_available_post_id)
        ? status.publicaly_available_post_id
        : [];
      const postId = publicIds.length ? String(publicIds[0]) : publishId;
      getAffiliateDb().prepare(`
        UPDATE publisher_jobs
        SET status='published', remote_post_id=?, last_error='', published_at=?, updated_at=?
        WHERE id=?
      `).run(postId, now, now, jobId);
      getAffiliateDb().prepare(`
        UPDATE publisher_settings SET last_published_at=?, updated_at=? WHERE platform='tiktok'
      `).run(now, now);
      markAffiliatePlatformPublished(row.product_key, "tiktok", String(row.published_url || ""));
      return res.json({ ok: true, published: true, status, job: publisherJobToApi(getPublisherJobById(jobId)) });
    }

    return res.json({ ok: true, published: false, processing: true, status, job: publisherJobToApi(row) });
  } catch (error) {
    const safe = sanitizeExternalError(error);
    return res.status(500).json({ ok: false, error: "TIKTOK_RECONCILE_FAILED", message: safe.message });
  }
});

app.get("/affiliate-db/status", (_req, res) => {
  try {
    return res.json({
      ok: true,
      build: BUILD,
      dbPath: AFFILIATE_DB_PATH,
      backupDir: AFFILIATE_DB_BACKUP_DIR,
      ...getAffiliateDbSummary(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "AFFILIATE_DB_STATUS_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.get("/affiliate-db/records", (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 100)));
    const rows = getAffiliateDb()
      .prepare(`
        SELECT *
        FROM affiliate_products
        ORDER BY updated_at DESC
        LIMIT ?
      `)
      .all(limit);

    return res.json({
      ok: true,
      count: rows.length,
      dbPath: AFFILIATE_DB_PATH,
      records: rows,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "AFFILIATE_DB_RECORDS_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/affiliate-db/check", (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const results = items.map((item, idx) => {
      const productUrl = String(item?.productUrl || "").trim();
      const record = productUrl ? getAffiliateRecord(productUrl) : null;
      return {
        index: Number(item?.index ?? idx),
        productUrl,
        exists: !!record,
        reusable: canReuseAffiliateRecord(record),
        record: record
          ? {
              productKey: record.product_key,
              videoStatus: record.video_status,
              publishStatus: record.publish_status,
              videoPath: record.video_path,
              videoFilename: record.video_filename,
              videoCreatedAt: record.video_created_at,
              affiliateUrl: record.affiliate_url,
              shortTitle: record.short_title,
            }
          : null,
      };
    });
    return res.json({ ok: true, count: results.length, results });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "AFFILIATE_DB_CHECK_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/affiliate-db/publish-status", (req, res) => {
  try {
    const productUrl = String(req.body?.productUrl || "").trim();
    if (!productUrl) {
      return res.status(400).json({
        ok: false,
        error: "PRODUCT_URL_REQUIRED",
      });
    }

    const existing = getAffiliateRecord(productUrl);
    if (!existing) {
      return res.status(404).json({
        ok: false,
        error: "AFFILIATE_RECORD_NOT_FOUND",
      });
    }

    const platform = normalizePlatformName(req.body?.platform);
    const columns = PLATFORM_COLUMNS[platform];

    if (!platform || !columns) {
      return res.status(400).json({
        ok: false,
        error: "UNSUPPORTED_PLATFORM",
        supportedPlatforms: Object.keys(PLATFORM_COLUMNS),
      });
    }

    const allowedStatuses = new Set([
      "not_published",
      "queued",
      "publishing",
      "published",
      "failed",
    ]);

    const requestedStatus =
      String(req.body?.publishStatus || "").trim() || "not_published";

    if (!allowedStatuses.has(requestedStatus)) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_PUBLISH_STATUS",
        allowedStatuses: [...allowedStatuses],
      });
    }

    const identity = parseShopeeProductIdentity(productUrl);
    const publishedUrl = String(req.body?.publishedUrl || "").trim();
    const errorMessage = String(req.body?.error || "").trim().slice(0, 2000);
    const now = sqliteNow();

    const sets = [
      `${columns.status} = ?`,
      `${columns.error} = ?`,
      "updated_at = ?",
    ];
    const args = [requestedStatus, errorMessage, now];

    if (publishedUrl) {
      sets.push(`${columns.url} = ?`);
      args.push(publishedUrl);
    }

    if (requestedStatus === "published") {
      sets.push(`${columns.publishedAt} = ?`);
      args.push(now);
    }

    args.push(identity.key);

    getAffiliateDb()
      .prepare(
        `UPDATE affiliate_products
         SET ${sets.join(", ")}
         WHERE product_key = ?`,
      )
      .run(...args);

    let updated = getAffiliateRecord(productUrl);
    const aggregateStatus = computeAggregatePublishStatus(updated);

    getAffiliateDb()
      .prepare(
        `UPDATE affiliate_products
         SET publish_status = ?,
             published_at = CASE
               WHEN ? = 'published' THEN COALESCE(published_at, ?)
               ELSE published_at
             END,
             updated_at = ?
         WHERE product_key = ?`,
      )
      .run(
        aggregateStatus,
        aggregateStatus,
        now,
        now,
        identity.key,
      );

    updated = getAffiliateRecord(productUrl);

    return res.json({
      ok: true,
      platform,
      platformStatus: requestedStatus,
      aggregatePublishStatus: aggregateStatus,
      platformStatuses: getPlatformStatuses(updated),
      record: updated,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "AFFILIATE_DB_PUBLISH_STATUS_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post("/render-from-images", async (req, res) => {
  const item = req.body?.item || {};
  const title = String(item.title || "").trim() || "未命名商品";
  const imageUrls = Array.isArray(item.imageUrls)
    ? item.imageUrls.filter(Boolean)
    : [];
  const outputFile = buildSafeOutput(item.expectedOutput, title);

  ensureDirSync(TMP_ROOT);
  ensureDirSync(path.dirname(outputFile));

  const workDir = path.join(TMP_ROOT, crypto.randomUUID());
  ensureDirSync(workDir);

  try {
    markAffiliateProcessing(item, title);

    if (imageUrls.length < 3) {
      throw new Error(`NEED_3_IMAGE_URLS_ONLY_GOT_${imageUrls.length}`);
    }

    // V40.5.7 render endpoint forces CSV/manual mode; no Gemini/OpenClaw call.
    const shouldUseAi = false;
    const aiScript = {
      ...buildFallbackScript(title),
      source: "csv-manual",
      aiProvider: "",
      aiModel: "",
      aiFallbackChain: [],
      aiError: "",
    };

    const mergedScript = mergeScript(item, aiScript, title);

    const { files: localImages, hashes } = await downloadImages(
      imageUrls,
      workDir,
    );
    if (new Set(hashes).size < 3) {
      throw new Error("IMAGE_HASH_DUPLICATED");
    }

    const voiceText15s = compactVoiceText(mergedScript.voiceText, 72);
    const voice = await synthesizeVoice(voiceText15s, workDir);
    const voiceDuration = await ffprobeDuration(voice.voiceFile);
    const clipDur = 5.0;
    const totalDuration = 15.0;
    console.log("[video-quality] fixed-15s", {
      voiceDuration,
      clipDur,
      totalDuration,
      voiceChars: Array.from(voiceText15s || "").length,
    });
    const bgmPath = await resolveBgmPath(item, workDir, totalDuration);
    const overlayTextFiles = prepareOverlayTextFiles(
      workDir,
      mergedScript.sceneTitles,
      mergedScript.sceneSubtitles,
    );
    const filterComplex = buildFilterComplex(
      mergedScript.sceneTitles,
      mergedScript.sceneSubtitles,
      clipDur,
      totalDuration,
      overlayTextFiles,
    );

    const args = [
      "-loop",
      "1",
      "-t",
      String(clipDur),
      "-i",
      localImages[0],
      "-loop",
      "1",
      "-t",
      String(clipDur),
      "-i",
      localImages[1],
      "-loop",
      "1",
      "-t",
      String(clipDur),
      "-i",
      localImages[2],
      "-i",
      voice.voiceFile,
      "-i",
      bgmPath,
      "-y",
      "-filter_complex",
      filterComplex,
      "-map",
      "[vout]",
      "-map",
      "[aout]",
      "-vcodec",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-movflags",
      "+faststart",
      "-t",
      totalDuration.toFixed(3),
      outputFile,
    ];

    await spawnFfmpeg(args);

    const affiliateUrl = item.promoUrl || item.affiliateUrl || "";
    const publishCopy = materializePublishCopy(mergedScript, affiliateUrl, title);
    const platformCopy = materializePlatformCopy(mergedScript, affiliateUrl, title);
    const publicVideoFallback = buildPublicVideoUrl(outputFile);
    let publicVideoUrl = publicVideoFallback;
    let uploadError = "";

    if (item.skipUpload === true) {
      console.log("[upload] skipped by local UI", { outputFile });
    } else {
      const upload = await uploadVideoToSupabase(
        outputFile,
        path.basename(outputFile),
      );
      if (upload.ok && upload.publicUrl) {
        publicVideoUrl = upload.publicUrl;
      } else if (!upload.ok) {
        uploadError = upload.error || "";
        console.error("[UPLOAD FAIL]", uploadError);
      }
    }

    const publicPageUrl = buildPublicPageUrl({
      title: publishCopy.shortTitle,
      desc: publishCopy.shortDescription,
      link: affiliateUrl,
      video: publicVideoUrl,
      image: item.imageUrls?.[0] || "",
    });

    const publishPayload = rxvBuildPublishPayload({
      title,
      videoPath: outputFile,
      affiliateUrl,
      platformCopy,
      selectedPlatforms: item?.selectedPlatforms,
    });

    let affiliateRecord = saveAffiliateCompleted({
      item,
      title,
      outputFile,
      imageUrls,
      imageHashes: hashes,
      mergedScript,
      publishCopy,
      platformCopy,
      publishPayload,
      affiliateUrl,
    });

    if (affiliateRecord && String(item?.productUrl || "").trim()) {
      affiliateRecord =
        queueSelectedPlatforms(item.productUrl, item.selectedPlatforms) ||
        affiliateRecord;
    }

    res.json({
      ok: true,
      build: BUILD,
      output: outputFile,
      publicVideoUrl,
      publicPageUrl,
      slug: slugifyTitle(title),
      usedImages: localImages,
      imageHashes: hashes,
      ttsSource: voice.source,
      aiSource: mergedScript.source,
      aiProvider: mergedScript.aiProvider || "",
      aiModel: mergedScript.aiModel || "",
      aiFallbackChain: mergedScript.aiFallbackChain || [],
      aiError: mergedScript.aiError || "",
      aiUsage: mergedScript.aiUsage || null,
      safePainCategory: mergedScript.safePainCategory || "",
      safePainEvidence: mergedScript.safePainEvidence || [],
      safePainAngle: mergedScript.safePainAngle || null,
      naturalScenePlan: mergedScript.naturalScenePlan || null,
      naturalScenePlanForced: [
        "sleep",
        "food",
        "rainwear",
        "storage",
        "electronics",
      ].includes(String(mergedScript.safePainCategory || "")),
      sceneTitles: mergedScript.sceneTitles,
      sceneSubtitles: mergedScript.sceneSubtitles,
      overlayText: overlayTextFiles ? { titles: overlayTextFiles.titles, subs: overlayTextFiles.subs } : null,
      totalDuration,
      voiceText: voiceText15s,
      shortTitle: publishCopy.shortTitle,
      keywords: publishCopy.keywords,
      titleWithKeywords: publishCopy.titleWithKeywords,
      shortDescription: publishCopy.shortDescription,
      fullPost: publishCopy.fullPost,
      pain: mergedScript.pain,
      benefit: mergedScript.benefit,
      proof: mergedScript.proof,
      cta: mergedScript.cta,
      facebookPost: platformCopy.facebookPost || "",
      facebookHashtags: platformCopy.facebookHashtags || "",
      instagramCaption: platformCopy.instagramCaption || "",
      instagramHashtags: platformCopy.instagramHashtags || "",
      tiktokCaption: platformCopy.tiktokCaption || "",
      tiktokHashtags: platformCopy.tiktokHashtags || "",

      youtubeShortsTitle: platformCopy.youtubeShortsTitle || "",
      youtubeShortsDescription:
        platformCopy.youtubeShortsDescription || "",
      youtubeVideoTitle: platformCopy.youtubeVideoTitle || "",
      youtubeVideoDescription:
        platformCopy.youtubeVideoDescription || "",
      youtubeHashtags: platformCopy.youtubeHashtags || "",

      threadsPost: platformCopy.threadsPost || "",
      xPost: platformCopy.xPost || "",

      publishReady: publishPayload?.safety?.ok === true,
      publishPayloadVersion: "v37.14",
      publishSafety: publishPayload?.safety || null,
      publishCopySource: platformCopy?.copySource || "",
      publishPayload,

      selectedPlatforms: normalizeRequestedPlatforms(
        item?.selectedPlatforms,
      ),
      platformStatuses: affiliateRecord
        ? getPlatformStatuses(affiliateRecord)
        : {},
      hashtags: mergedScript.hashtags || "",
      affiliateUrl,
      title,
      uploadError,
      affiliateDb: affiliateRecord
        ? {
            productKey: affiliateRecord.product_key,
            videoStatus: affiliateRecord.video_status,
            publishStatus: affiliateRecord.publish_status,
            generationCount: affiliateRecord.generation_count,
            publishReady: Number(affiliateRecord.publish_ready || 0) === 1,
            publishPayloadVersion:
              affiliateRecord.publish_payload_version || "",
            dbPath: AFFILIATE_DB_PATH,
          }
        : null,
    });
  } catch (error) {
    try {
      saveAffiliateFailed(item, title, error);
    } catch (dbError) {
      console.warn(
        "[affiliate-db] failed to record render error",
        dbError?.message || dbError,
      );
    }

    res.status(500).json({
      ok: false,
      error: "RENDER_FROM_IMAGES_FAILED",
      message: error?.message || String(error),
      build: BUILD,
    });
  } finally {
    try {
      await fsp.rm(workDir, { recursive: true, force: true });
    } catch {}
  }
});

app.post("/render-batch-from-ui", async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const forceRegenerate = req.body?.forceRegenerate === true;
    const results = [];
    let skippedExisting = 0;
    let renderedCount = 0;

    for (const item of items) {
      const productUrl = String(item?.productUrl || "").trim();

      if (!forceRegenerate && productUrl) {
        const existing = getAffiliateRecord(productUrl);
        if (canReuseAffiliateRecord(existing)) {
          skippedExisting += 1;
          results.push(
            affiliateRecordToResult(existing, item?.title || ""),
          );
          continue;
        }
      }

      const imageUrls = Array.isArray(item?.imageUrls)
        ? item.imageUrls.filter(Boolean)
        : [];

      if (imageUrls.length < 3) {
        results.push({
          ok: false,
          skipped: true,
          error: "NEED_3_IMAGES",
          title: item?.title || "",
          imageCount: imageUrls.length,
          message: `缺圖，略過產片：需要 3 張，目前 ${imageUrls.length} 張`,
        });
        continue;
      }

      const response = await fetch(
        `http://localhost:${PORT}/render-from-images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({ ok: false, error: "INVALID_JSON_RESPONSE" }));

      if (response.ok && data?.ok !== false) {
        renderedCount += 1;
      }

      results.push({
        ok: response.ok && data?.ok !== false,
        title: item.title || "",
        ...data,
      });
    }

    return res.json({
      ok: true,
      build: BUILD,
      count: results.length,
      renderedCount,
      skippedExisting,
      forceRegenerate,
      dbPath: AFFILIATE_DB_PATH,
      db: getAffiliateDbSummary(),
      results,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "RENDER_BATCH_FROM_UI_FAILED",
      message: error?.message || String(error),
    });
  }
});

app.post('/postprocess-video', async (req, res) => {
  ensureDirSync(TMP_ROOT);
  ensureDirSync(DEFAULT_OUTPUT_DIR);
  const workDir = path.join(TMP_ROOT, crypto.randomUUID());
  ensureDirSync(workDir);
  try {
    const { fields, files } = await parseMultipartForm(req, 800 * 1024 * 1024);
    const uploadedVideos = normalizeUploadedVideos(files);
    if (uploadedVideos.length === 0) {
      return res.status(400).json({ ok: false, error: 'VIDEO_REQUIRED', message: '請至少上傳一支 MP4／影片檔。' });
    }

    const voiceMode = String(fields.voiceMode || 'none');
    const voiceText = String(fields.voiceText || '').trim();
    const voiceRate = safeNumber(fields.voiceRate, voiceMode === 'warm_male' ? 0.88 : 0.95, 0.65, 1.25);
    const voiceVolume = safeNumber(fields.voiceVolume, 1, 0.1, 2);
    const audioPreset = String(fields.audioPreset || 'none');
    const bgmVolume = safeNumber(fields.bgmVolume, 0.18, 0, 1);
    const burnSubtitles = String(fields.burnSubtitles || '0') === '1';
    const subtitleText = String(fields.subtitleText || '').trim();
    const subtitlePosition = String(fields.subtitlePosition || 'bottom');
    const ratio = String(fields.ratio || '9:16');
    const [w, h] = getVideoSizeFromRatio(ratio, '1080p');

    let bgmInputFile = '';
    const bgmUpload = getFirstFile(files, 'bgm');
    if (bgmUpload?.buffer?.length) {
      bgmInputFile = path.join(workDir, `bgm${extFromAudioUpload(bgmUpload)}`);
      await fsp.writeFile(bgmInputFile, bgmUpload.buffer);
    }

    const inputFiles = [];
    for (let i = 0; i < uploadedVideos.length; i += 1) {
      const file = uploadedVideos[i];
      const ext = extFromVideoUpload(file);
      const inputFile = path.join(workDir, `video_${String(i + 1).padStart(2, '0')}${ext}`);
      await fsp.writeFile(inputFile, file.buffer);
      inputFiles.push(inputFile);
    }

    const baseVideo = path.join(workDir, 'merged_silent_base.mp4');
    await concatenateVideosToSilentBase({ inputFiles, outputFile: baseVideo, w, h, workDir });

    const subtitleVideo = path.join(workDir, 'merged_with_subtitles.mp4');
    let videoForAudio = baseVideo;
    let subtitleResult = { subtitleCount: 0 };
    if (burnSubtitles && subtitleText) {
      subtitleResult = await burnSubtitlesToVideo({ inputVideo: baseVideo, outputVideo: subtitleVideo, subtitleText, subtitlePosition, workDir });
      videoForAudio = subtitleVideo;
    }

    const outputFile = path.join(DEFAULT_OUTPUT_DIR, `voice_merged_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`);
    const mux = await muxVoiceAndBgmToVideo({
      inputVideo: videoForAudio,
      outputVideo: outputFile,
      voiceText,
      voiceMode,
      voiceRate,
      voiceVolume,
      audioPreset,
      bgmFile: bgmInputFile,
      bgmVolume,
      workDir,
    });

    const videoUrl = buildPublicVideoUrl(outputFile);
    return res.json({
      ok: true,
      build: BUILD,
      videoUrl,
      downloadUrl: videoUrl,
      output: outputFile,
      inputCount: inputFiles.length,
      voiceMode,
      voiceText,
      voiceRate,
      voiceVolume,
      audioPreset,
      bgmVolume,
      bgmSource: mux.bgmSource,
      burnSubtitles,
      subtitlePosition,
      subtitleCount: subtitleResult.subtitleCount || 0,
      voiceSource: mux.voiceSource,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'POSTPROCESS_VIDEO_FAILED',
      message: error?.message || String(error),
      build: BUILD,
    });
  } finally {
    try { await fsp.rm(workDir, { recursive: true, force: true }); } catch {}
  }
});

app.listen(PORT, () => {
  ensureDirSync(TMP_ROOT);
  ensureDirSync(DEFAULT_OUTPUT_DIR);
  console.log(`[ffmpeg] binary path = ${FFMPEG_BIN}`);
  console.log(`[meta] graph version = ${META_GRAPH_VERSION}`);
  console.log("[meta] config", {
    facebookConfigured: hasMetaFacebookConfig(),
    instagramConfigured: hasMetaInstagramConfig(),
    instagramUploadMode: "meta-resumable-local",
    r2Used: false,
    token: META_PAGE_ACCESS_TOKEN ? "present-not-exposed" : "missing",
  });
  console.log("[youtube] config", {
    configured: hasYouTubeClientConfig(),
    storedAuthorization: hasYouTubeStoredAuthorization(),
    privacyStatus: YOUTUBE_UPLOAD_PRIVACY,
    cloudStagingUsed: false,
    clientSecret: YOUTUBE_CLIENT_SECRET ? "present-not-exposed" : "missing",
  });
  console.log(`Image-to-video server running at http://localhost:${PORT}`);

  setTimeout(() => {
    runPublisherSchedulerTick().catch(() => {});
  }, 5000);

  setInterval(() => {
    runPublisherSchedulerTick().catch(() => {});
  }, 30000);
});
