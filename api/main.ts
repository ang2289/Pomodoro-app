// 覆蓋到 D:\Pomodoro-app\api\main.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";
import dotenv from "dotenv";
import sharp from "sharp";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 圖片後台本機環境固定載入：
// Vercel Dev 可能帶入已連結專案的舊環境值，因此只要本機存在 .env.local，
// 圖片後台所需的 R2 / admin key 一律以本機 .env.local 為準。
// 只覆蓋圖片後台相關變數，不影響會員、付款、Supabase 等其他功能。
function loadLocalImageAdminEnv() {
  const candidates = [
    process.env.INIT_CWD ? path.resolve(process.env.INIT_CWD, ".env.local") : "",
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "..", ".env.local"),
    path.resolve(process.cwd(), "..", "..", ".env.local"),
    process.platform === "win32" ? String.raw`D:\Pomodoro-app\.env.local` : "",
  ].filter(Boolean);

  const envPath = Array.from(new Set(candidates)).find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });

  if (!envPath) return;

  try {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    const imageEnvNames = [
      "RXV_IMAGE_ADMIN_KEY",
      "RXV_IMAGE_BUNDLE_ADMIN_KEY",
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_PUBLIC_URL",
      "R2_PRIVATE_BUCKET_NAME",
      "R2_PUBLIC_BUCKET_NAME",
      "R2_PUBLIC_ASSET_URL",
      "VITE_PUBLIC_R2_URL",
    ];

    for (const name of imageEnvNames) {
      const value = String(parsed[name] || "").trim();
      if (value) process.env[name] = value;
    }

    console.log("[IMAGE_R2_ENV] local image-admin env loaded");
  } catch (error: any) {
    console.error("[IMAGE_R2_ENV] local env load failed", error?.message || "UNKNOWN");
  }
}

loadLocalImageAdminEnv();

const SHOPEE_JOBS_DIR = path.join(process.cwd(), "output", "shopee-jobs");
const SHOPEE_PROFILE_DIR =
  process.env.SHOPEE_PROFILE_DIR || String.raw`D:\ShopeeProfile\playwright_shopee_profile`;
const RENDER_SERVER_URL =
  process.env.RXV_VIDEO_SERVER || "http://localhost:3006/render-from-images";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

// 圖片庫 R2 雙 bucket：舊 R2_BUCKET_NAME/R2_PUBLIC_URL 保留給既有功能。
// 圖片後台最小版只在這三個新值上工作，避免把 bundle 原圖寫進 public bucket。
const R2_PRIVATE_BUCKET_NAME =
  process.env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging";
const R2_PUBLIC_BUCKET_NAME =
  process.env.R2_PUBLIC_BUCKET_NAME || "rxv-healing-images-public";
const R2_PUBLIC_ASSET_URL =
  process.env.R2_PUBLIC_ASSET_URL || process.env.VITE_PUBLIC_R2_URL || "";
const R2_PUBLIC_IMAGE_MANIFEST_KEY = "catalog/images-public.json";
const R2_RXV_STOREFRONT_DEMO_KEY = "storefronts/demo/rxv.json";
const RXV_IMAGE_ADMIN_KEY = safeText(process.env.RXV_IMAGE_ADMIN_KEY);
// NT$399 圖片素材庫販售後台改走 R2，不再依賴 Supabase session。
// 可獨立設定 RXV_IMAGE_BUNDLE_ADMIN_KEY；未設定時沿用圖片後台金鑰。
const RXV_IMAGE_BUNDLE_ADMIN_KEY = safeText(
  process.env.RXV_IMAGE_BUNDLE_ADMIN_KEY || process.env.RXV_IMAGE_ADMIN_KEY,
);

// 團購功能暫停：只隱藏／停用，不刪除既有資料。
const GROUP_BUY_ENABLED = false;

let r2Client: S3Client | null = null;
let imageCatalogR2Client: S3Client | null = null;

const SESSION_TTL_DAYS = Number(process.env.RXV_SESSION_TTL_DAYS || 30);

function jsonResponse(res: any, status: number, payload: any) {
  return res.status(status).json(payload);
}

function normalizeEmail(email: any) {
  return String(email || "").trim().toLowerCase();
}

function safeText(value: any) {
  return String(value || "").trim();
}

function escapeFilterValue(value: string) {
  return encodeURIComponent(value);
}

async function supabaseRest(pathname: string, init: any = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${pathname.replace(/^\//, "")}`;
  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...(init.headers || {}),
  };

  return fetch(url, { ...init, headers });
}

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRequestHeader(req: any, name: string) {
  const headers = req?.headers || {};
  return String(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "");
}

function secureEqualText(left: string, right: string) {
  const a = Buffer.from(String(left || ""), "utf8");
  const b = Buffer.from(String(right || ""), "utf8");
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

async function requireImageAdmin(req: any) {
  // 圖片上傳一律使用獨立金鑰；絕不回退到 Supabase session/admin 驗證。
  if (!RXV_IMAGE_ADMIN_KEY) {
    const error: any = new Error("RXV_IMAGE_ADMIN_KEY_MISSING");
    error.statusCode = 503;
    throw error;
  }

  const provided = safeText(getRequestHeader(req, "x-rxv-image-admin-key"));
  if (!provided) {
    const error: any = new Error("請輸入圖片後台管理金鑰。");
    error.statusCode = 401;
    throw error;
  }
  if (!secureEqualText(provided, RXV_IMAGE_ADMIN_KEY)) {
    const error: any = new Error("圖片後台管理金鑰不正確。");
    error.statusCode = 403;
    throw error;
  }
  return { userId: "image-admin-key", email: "image-admin-key" };
}

function getBearerToken(req: any) {
  const authHeader = getRequestHeader(req, "authorization");
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function getRequestIp(req: any) {
  const forwardedFor = getRequestHeader(req, "x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "";
  return String(req?.socket?.remoteAddress || req?.connection?.remoteAddress || "");
}

async function createUserSession(userId: string, req: any) {
  if (!userId) throw new Error("SESSION_USER_ID_MISSING");

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const res = await supabaseRest("user_sessions", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      user_agent: getRequestHeader(req, "user-agent") || null,
      ip: getRequestIp(req) || null,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SESSION_CREATE_FAILED:${res.status}:${text}`);
  }

  return { token, expiresAt };
}

export async function getUserFromAuthHeader(req: any): Promise<{ userId: string; expiresAt: string } | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const now = encodeURIComponent(new Date().toISOString());
  const res = await supabaseRest(
    `user_sessions?select=user_id,expires_at&token_hash=eq.${tokenHash}&revoked_at=is.null&expires_at=gt.${now}&limit=1`,
    { method: "GET", headers: { Prefer: "return=representation" } }
  );

  if (!res.ok) return null;

  const rows = await res.json().catch(() => []);
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!row?.user_id) return null;

  return { userId: String(row.user_id), expiresAt: String(row.expires_at || "") };
}

export async function verifySessionToken(req: any) {
  return getUserFromAuthHeader(req);
}

export async function revokeSessionToken(req: any) {
  const token = getBearerToken(req);
  if (!token) return false;

  const tokenHash = hashSessionToken(token);
  const res = await supabaseRest(`user_sessions?token_hash=eq.${tokenHash}&revoked_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });

  return res.ok;
}


function normalizeBase64Image(input: any, declaredMimeType?: any) {
  const raw = String(input || "").trim();
  const match = raw.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  const rawMimeType = match?.[1] || safeText(declaredMimeType).toLowerCase();
  const mimeType = rawMimeType.replace("image/jpg", "image/jpeg");
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error("IMAGE_UPLOAD_UNSUPPORTED_FORMAT");
  }

  const encoded = match?.[2] || raw.replace(/^data:image\/[^;]+;base64,/i, "");
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length % 4 === 1) {
    throw new Error("IMAGE_UPLOAD_INVALID_BASE64");
  }
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length) throw new Error("IMAGE_UPLOAD_INVALID_BASE64");
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return { buffer, mimeType, ext };
}

function sanitizeImageTitle(filename: any) {
  const raw = safeText(filename || "圖片素材");
  const base = raw.replace(/\.[a-z0-9]+$/i, "").replace(/[<>:"/\\|?*\x00-\x1F]/g, " ").trim();
  return base || "圖片素材";
}

async function uploadToSupabaseStorage(objectPath: string, buffer: Buffer, mimeType: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const storageUrl = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/images/${objectPath.replace(/^\/+/, "")}`;
  const uploadRes = await fetch(storageUrl, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": mimeType,
      "Cache-Control": "3600",
      "x-upsert": "false",
    },
    body: buffer as unknown as BodyInit,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(`STORAGE_UPLOAD_FAILED:${uploadRes.status}:${text}`);
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/images/${objectPath.replace(/^\/+/, "")}`;
}

function getR2Client() {
  const missingVariables = [
    ["R2_ACCOUNT_ID", R2_ACCOUNT_ID],
    ["R2_BUCKET_NAME", R2_BUCKET_NAME],
    ["R2_ACCESS_KEY_ID", R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", R2_SECRET_ACCESS_KEY],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new Error(`R2_ENV_MISSING:${missingVariables.join(",")}`);
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

function getR2PublicUrl() {
  if (!R2_PUBLIC_URL) {
    throw new Error("R2_ENV_MISSING:R2_PUBLIC_URL");
  }

  let publicUrl: URL;
  try {
    publicUrl = new URL(R2_PUBLIC_URL);
  } catch {
    throw new Error("R2_PUBLIC_URL_INVALID");
  }

  if (!/^https?:$/.test(publicUrl.protocol) || publicUrl.hostname.endsWith(".r2.cloudflarestorage.com")) {
    throw new Error("R2_PUBLIC_URL_MUST_BE_PUBLIC");
  }

  return publicUrl;
}

function buildR2PublicUrl(objectKey: string) {
  getR2Client();
  getR2PublicUrl();
  const encodedKey = objectKey
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${encodedKey}`;
}

async function uploadBufferToR2(objectKey: string, buffer: Buffer, contentType: string) {
  const client = getR2Client();
  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
}

async function deleteObjectFromR2(objectKey: string) {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  }));
}

function makePrivateImageBundleKey(filename: string) {
  const extension = path.extname(filename || "").toLowerCase() === ".zip" ? ".zip" : "";
  if (!extension) throw new Error("IMAGE_BUNDLE_FILE_MUST_BE_ZIP");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `private/image-bundles/image-bundle-full-v${date}-${crypto.randomBytes(8).toString("hex")}.zip`;
}

function isPrivateImageBundleKey(value: string) {
  return /^private\/image-bundles\/image-bundle-full-v\d{8}-[a-f0-9]{16}\.zip$/i.test(value);
}

type PublicImageCatalogDocument = {
  root: any;
  images: any[];
  listField: "array" | "images" | "data" | "items";
};

type ImageR2RuntimeConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  privateBucket: string;
  publicBucket: string;
  publicAssetUrl: string;
};

function getImageR2RuntimeConfig(): ImageR2RuntimeConfig {
  // 重要：圖片後台每次請求都即時讀取本機 .env.local。
  // 避免 vercel dev / Vite / 已連結專案的舊環境值或模組初始化快取干擾。
  const candidates = [
    process.platform === "win32" ? String.raw`D:\Pomodoro-app\.env.local` : "",
    process.env.INIT_CWD ? path.resolve(process.env.INIT_CWD, ".env.local") : "",
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "..", ".env.local"),
    path.resolve(process.cwd(), "..", "..", ".env.local"),
  ].filter(Boolean);

  let localEnv: Record<string, string> = {};
  const envPath = Array.from(new Set(candidates)).find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });

  if (envPath) {
    try {
      localEnv = dotenv.parse(fs.readFileSync(envPath, "utf8"));
    } catch (error: any) {
      console.error("[IMAGE_R2_RUNTIME_ENV] read failed", error?.message || "UNKNOWN");
    }
  }

  const pick = (name: string, fallback = "") =>
    safeText(localEnv[name] || process.env[name] || fallback);

  const config: ImageR2RuntimeConfig = {
    accountId: pick("R2_ACCOUNT_ID"),
    accessKeyId: pick("R2_ACCESS_KEY_ID"),
    secretAccessKey: pick("R2_SECRET_ACCESS_KEY"),
    privateBucket: pick("R2_PRIVATE_BUCKET_NAME", "rxv-healing-images-staging"),
    publicBucket: pick("R2_PUBLIC_BUCKET_NAME", "rxv-healing-images-public"),
    publicAssetUrl: pick("R2_PUBLIC_ASSET_URL") || pick("VITE_PUBLIC_R2_URL"),
  };

  const missing: string[] = [];
  if (!config.accountId) missing.push("R2_ACCOUNT_ID");
  if (!config.accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!config.secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!config.privateBucket) missing.push("R2_PRIVATE_BUCKET_NAME");
  if (!config.publicBucket) missing.push("R2_PUBLIC_BUCKET_NAME");

  if (missing.length) {
    throw new Error(`R2_IMAGE_CATALOG_ENV_MISSING:${missing.join(",")}`);
  }

  return config;
}

function getImageCatalogR2Client() {
  const config = getImageR2RuntimeConfig();

  // 不快取 R2 client：本機修改 .env.local 後下一個請求立即生效。
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function requireImageCatalogR2Config() {
  getImageR2RuntimeConfig();
}

function inferPublicImageAssetBaseUrl(catalog?: PublicImageCatalogDocument) {
  const runtimePublicAssetUrl = getImageR2RuntimeConfig().publicAssetUrl;
  if (runtimePublicAssetUrl) return runtimePublicAssetUrl.replace(/\/$/, "");

  for (const image of catalog?.images || []) {
    const candidate = safeText(image?.thumbnail_url || image?.preview_url);
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      const markerIndex = ["/thumbnails/", "/previews/", "/preview/"]
        .map((marker) => url.pathname.indexOf(marker))
        .find((index) => index >= 0);
      if (markerIndex != null) {
        return `${url.origin}${url.pathname.slice(0, markerIndex)}`.replace(/\/$/, "");
      }
      // Older catalog entries may not include a conventional thumbnail path.
      // Their origin is still the public R2 asset base when no prefix is present.
      if (/^https?:$/.test(url.protocol) && !url.hostname.endsWith(".r2.cloudflarestorage.com")) {
        return url.origin;
      }
    } catch {
      // Ignore malformed legacy rows and continue looking for a usable public URL.
    }
  }

  throw new Error("R2_PUBLIC_ASSET_URL_UNAVAILABLE");
}

function buildPublicImageAssetUrl(objectKey: string, catalog?: PublicImageCatalogDocument) {
  requireImageCatalogR2Config();
  const baseUrl = inferPublicImageAssetBaseUrl(catalog);
  const encodedKey = objectKey
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${baseUrl}/${encodedKey}`;
}

async function r2BodyToText(body: any): Promise<string> {
  if (!body) {
    throw new Error("R2_PUBLIC_MANIFEST_BODY_EMPTY");
  }

  if (typeof body.transformToString === "function") {
    return await body.transformToString("utf-8");
  }

  if (typeof body.getReader === "function") {
    const reader = body.getReader();
    const chunks: Buffer[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(Buffer.from(value));
      }
    }

    return Buffer.concat(chunks).toString("utf8");
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as any) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function buildRxvStorefrontDemoPayload(sampleImages: any[] = []) {
  const sampleItems = (Array.isArray(sampleImages) ? sampleImages : [])
    .filter((image: any) => safeText(image?.thumbnail_url || image?.preview_url))
    .slice(0, 3)
    .map((image: any, index: number) => ({
      id: `rxv-demo-item-${index + 1}`,
      title: safeText(image?.title) || `商品展示範例 ${index + 1}`,
      description: '此為商品展示頁範例，可放商品照片、價格、介紹與詢問連結。',
      image_url: safeText(image?.thumbnail_url || image?.preview_url),
      price_text: `NT$${(index + 1) * 100}（範例）`,
      button_label: '',
      button_url: '',
      sort_order: index + 1,
    }));

  const items = sampleItems.length
    ? sampleItems
    : [1, 2, 3].map((index) => ({
        id: `rxv-demo-item-${index}`,
        title: `商品展示範例 ${index}`,
        description: '此為商品展示頁範例，可放商品照片、價格、介紹與詢問連結。',
        image_url: '',
        price_text: `NT$${index * 100}（範例）`,
        button_label: '',
        button_url: '',
        sort_order: index,
      }));

  return {
    ok: true,
    source: 'r2-demo',
    storefront: {
      id: 'rxv-r2-demo',
      slug: 'rxv',
      page_mode: 'product_showcase',
      profile_type: 'business',
      display_name: 'RxV 商品展示頁範例',
      contact_name: null,
      job_title: null,
      bio: '這是商品展示頁功能範例，示範商品照片、價格、介紹、聯絡資訊與分享頁的呈現方式。',
      logo_url: null,
      cover_image_url: null,
      tagline: '小店家也能快速建立可分享的商品展示頁',
      line_id: null,
      address_text: null,
      map_url: null,
      business_hours_text: null,
      service_area_text: null,
      primary_cta_label: null,
      primary_cta_url: null,
      phone: null,
      line_url: null,
      email: null,
      website_url: null,
      facebook_url: null,
      instagram_url: null,
      shopee_url: null,
      delivery_url: null,
      template_id: null,
      status: 'published',
      is_public: true,
      expires_at: '2099-12-31T23:59:59.000Z',
    },
    supplierProfile: null,
    serviceItems: [
      { id: 'rxv-demo-service-1', title: '商品資訊整理', description: '集中展示照片、價格與商品介紹。', sort_order: 1 },
      { id: 'rxv-demo-service-2', title: '公開網址分享', description: '可把商品頁網址分享給 LINE、社群或客戶。', sort_order: 2 },
      { id: 'rxv-demo-service-3', title: 'QR Code 導流', description: '可搭配名片、小卡或實體宣傳物導向商品頁。', sort_order: 3 },
    ],
    portfolioItems: [],
    processSteps: [
      { id: 'rxv-demo-step-1', title: '1. 建立頁面', description: '設定店家名稱與基本介紹。', image_url: '', sort_order: 1 },
      { id: 'rxv-demo-step-2', title: '2. 加入商品', description: '放入商品照片、價格與說明。', image_url: '', sort_order: 2 },
      { id: 'rxv-demo-step-3', title: '3. 分享給客戶', description: '使用公開網址或 QR Code 分享。', image_url: '', sort_order: 3 },
    ],
    faqItems: [
      { id: 'rxv-demo-faq-1', question: '這個頁面可以放商品照片嗎？', answer: '可以，可放商品圖片、價格、介紹與相關連結。', sort_order: 1 },
      { id: 'rxv-demo-faq-2', question: '可以分享給客戶嗎？', answer: '可以，公開後會有專屬網址，可直接分享或製作 QR Code。', sort_order: 2 },
    ],
    items,
  };
}

async function writeRxvStorefrontDemoToR2(payload: any) {
  const runtimeConfig = getImageR2RuntimeConfig();
  await getImageCatalogR2Client().send(
    new PutObjectCommand({
      Bucket: runtimeConfig.publicBucket,
      Key: R2_RXV_STOREFRONT_DEMO_KEY,
      Body: Buffer.from(JSON.stringify(payload, null, 2), 'utf8'),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=60, s-maxage=300',
    }),
  );
}

async function seedRxvStorefrontDemoToR2() {
  let sampleImages: any[] = [];
  try {
    const catalog = await readPublicImageCatalogFromR2();
    sampleImages = catalog.images || [];
  } catch (error: any) {
    console.warn('R2_RXV_STOREFRONT_DEMO_SAMPLE_IMAGES_UNAVAILABLE', error?.message || error);
  }

  const payload = buildRxvStorefrontDemoPayload(sampleImages);
  try {
    await writeRxvStorefrontDemoToR2(payload);
  } catch (error: any) {
    // 範例頁不可因 R2 暫時寫入失敗而整頁掛掉；仍回傳內建範例，且完全不碰 Supabase。
    console.error('R2_RXV_STOREFRONT_DEMO_SEED_FAILED', error?.message || error);
  }
  return payload;
}

async function readRxvStorefrontDemoFromR2() {
  try {
    const runtimeConfig = getImageR2RuntimeConfig();
    const result = await getImageCatalogR2Client().send(
      new GetObjectCommand({
        Bucket: runtimeConfig.publicBucket,
        Key: R2_RXV_STOREFRONT_DEMO_KEY,
      }),
    );
    const text = await r2BodyToText(result.Body);
    const parsed = JSON.parse(text);

    if (!parsed || typeof parsed !== 'object' || safeText(parsed?.storefront?.slug) !== 'rxv') {
      throw new Error('R2_RXV_STOREFRONT_DEMO_FORMAT_INVALID');
    }

    return {
      ...parsed,
      ok: true,
      source: 'r2-demo',
      supplierProfile: parsed.supplierProfile || null,
      serviceItems: Array.isArray(parsed.serviceItems) ? parsed.serviceItems : [],
      portfolioItems: Array.isArray(parsed.portfolioItems) ? parsed.portfolioItems : [],
      processSteps: Array.isArray(parsed.processSteps) ? parsed.processSteps : [],
      faqItems: Array.isArray(parsed.faqItems) ? parsed.faqItems : [],
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (error: any) {
    const status = Number(error?.$metadata?.httpStatusCode || 0);
    const code = safeText(error?.name || error?.Code || error?.code || error?.message);
    const missing = status === 404 || /NoSuchKey|NotFound|R2_RXV_STOREFRONT_DEMO_FORMAT_INVALID/i.test(code);

    if (!missing) {
      console.error('R2_RXV_STOREFRONT_DEMO_READ_FAILED', { status, code });
    }

    // 第一次啟用時 R2 尚未有 rxv.json：自動建立一份。
    // 若 R2 暫時異常，也回傳內建範例，避免再落回 Supabase 造成 402。
    return seedRxvStorefrontDemoToR2();
  }
}

async function readPublicImageCatalogFromR2(): Promise<PublicImageCatalogDocument> {
  requireImageCatalogR2Config();

  try {
    const runtimeConfig = getImageR2RuntimeConfig();
    const result = await getImageCatalogR2Client().send(
      new GetObjectCommand({
        Bucket: runtimeConfig.publicBucket,
        Key: R2_PUBLIC_IMAGE_MANIFEST_KEY,
      }),
    );

    const text = await r2BodyToText(result.Body);
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return { root: parsed, images: parsed, listField: "array" };
    }

    if (Array.isArray(parsed?.images)) {
      return { root: parsed, images: parsed.images, listField: "images" };
    }

    if (Array.isArray(parsed?.data)) {
      return { root: parsed, images: parsed.data, listField: "data" };
    }

    if (Array.isArray(parsed?.items)) {
      return { root: parsed, images: parsed.items, listField: "items" };
    }

    throw new Error("R2_PUBLIC_MANIFEST_FORMAT_INVALID");
  } catch (error: any) {
    console.error("R2_PUBLIC_MANIFEST_READ_DETAIL", {
      name: error?.name,
      code: error?.Code || error?.code,
      message: error?.message,
      httpStatus: error?.$metadata?.httpStatusCode,
      bucket: (() => { try { return getImageR2RuntimeConfig().publicBucket; } catch { return "unknown"; } })(),
      key: R2_PUBLIC_IMAGE_MANIFEST_KEY,
    });

    if (
      /^R2_IMAGE_CATALOG_ENV_MISSING:|^R2_PUBLIC_MANIFEST_FORMAT_INVALID$|^R2_PUBLIC_MANIFEST_BODY_EMPTY$/.test(
        safeText(error?.message),
      )
    ) {
      throw error;
    }

    const wrapped: any = new Error("R2_PUBLIC_MANIFEST_READ_FAILED");
    wrapped.cause = error;
    throw wrapped;
  }
}

function rebuildPublicImageCatalogDocument(doc: PublicImageCatalogDocument, images: any[]) {
  if (doc.listField === "array") return images;
  const next = { ...(doc.root || {}) };
  next[doc.listField] = images;
  if (Object.prototype.hasOwnProperty.call(next, "count")) next.count = images.length;
  if (Object.prototype.hasOwnProperty.call(next, "total")) next.total = images.length;
  next.updated_at = new Date().toISOString();
  return next;
}

async function writePublicImageCatalogToR2(doc: PublicImageCatalogDocument, images: any[]) {
  try {
    const runtimeConfig = getImageR2RuntimeConfig();
    const payload = rebuildPublicImageCatalogDocument(doc, images);
    await getImageCatalogR2Client().send(
      new PutObjectCommand({
        Bucket: runtimeConfig.publicBucket,
        Key: R2_PUBLIC_IMAGE_MANIFEST_KEY,
        Body: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
        ContentType: "application/json; charset=utf-8",
        CacheControl: "public, max-age=60, s-maxage=60",
      }),
    );
  } catch {
    throw new Error("R2_PUBLIC_MANIFEST_WRITE_FAILED");
  }
}

async function uploadBufferToImageBucket(
  bucket: string,
  objectKey: string,
  buffer: Buffer,
  contentType: string,
  isPublic: boolean,
) {
  requireImageCatalogR2Config();
  await getImageCatalogR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
    }),
  );
}

async function deleteImageObjectFromBucket(bucket: string, objectKey: string) {
  await getImageCatalogR2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
}

function catalogCategoryName(image: any) {
  return safeText(image?.category_name || image?.category || image?.category_id || "其他素材");
}

function catalogPlanType(image: any) {
  return safeText(image?.plan_type || image?.price_type).toLowerCase() === "free" ? "free" : "bundle";
}

const R2_IMAGE_MASTER_PATH = path.join(process.cwd(), "private-data", "images-master.json");

function readR2ImageMaster() {
  if (!fs.existsSync(R2_IMAGE_MASTER_PATH)) throw new Error("R2_IMAGE_MASTER_UNAVAILABLE");
  const parsed = JSON.parse(fs.readFileSync(R2_IMAGE_MASTER_PATH, "utf8"));
  return Array.isArray(parsed?.images) ? parsed.images : [];
}

function isPublicR2ThumbnailKey(value: string) {
  return /^(thumbnails\/by-image-id\/[^/]+\.(?:jpg|jpeg|png|webp)|images\/thumbnails\/\d{4}\/\d{2}\/[^/]+\.(?:jpg|jpeg|png|webp)|thumbnails\/by-original-id\/[^/]+\.webp)$/i.test(value);
}

function isR2CatalogOriginalKey(value: string) {
  return /^(originals\/by-image-id\/[^/]+\/original\.(?:jpg|jpeg|png|webp)|images\/originals\/\d{4}\/\d{2}\/[^/]+\.(?:jpg|jpeg|png|webp))$/i.test(value);
}

async function handleGetR2ImageThumbnail(req: any, res: any) {
  if (req.method !== "GET") return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  try {
    const imageId = safeText(req?.query?.id);
    if (!imageId || imageId.length > 160) return jsonResponse(res, 400, { ok: false, error: "INVALID_IMAGE_ID" });
    const image = readR2ImageMaster().find((item: any) => safeText(item?.id) === imageId);
    const thumbnailKey = safeText(image?.thumbnail_key);
    if (!image || !isPublicR2ThumbnailKey(thumbnailKey)) return jsonResponse(res, 404, { ok: false, error: "IMAGE_THUMBNAIL_NOT_FOUND" });

    const object = await getR2Client().send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: thumbnailKey }));
    res.status(200);
    res.setHeader("Content-Type", object.ContentType || "image/webp");
    if (object.ContentLength != null) res.setHeader("Content-Length", String(object.ContentLength));
    res.setHeader("Cache-Control", "public, max-age=86400");
    return (object.Body as any).pipe(res);
  } catch (error: any) {
    const status = /R2_IMAGE_MASTER_UNAVAILABLE/.test(String(error?.message || "")) ? 503 : 500;
    return jsonResponse(res, status, { ok: false, error: "IMAGE_THUMBNAIL_UNAVAILABLE" });
  }
}

async function handleGetR2FreeImageDownload(req: any, res: any) {
  if (req.method !== "GET") return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  try {
    const imageId = safeText(req?.query?.id);
    if (!imageId || imageId.length > 160) return jsonResponse(res, 400, { ok: false, error: "INVALID_IMAGE_ID" });
    const image = readR2ImageMaster().find((item: any) => safeText(item?.id) === imageId);
    const originalKey = safeText(image?.original_key);
    if (!image || safeText(image?.plan_type) !== "free" || !isR2CatalogOriginalKey(originalKey)) {
      return jsonResponse(res, 404, { ok: false, error: "FREE_IMAGE_NOT_FOUND" });
    }

    const object = await getR2Client().send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: originalKey }));
    const extension = originalKey.split(".").pop()?.toLowerCase() || "jpg";
    res.status(200);
    res.setHeader("Content-Type", object.ContentType || `image/${extension === "jpg" ? "jpeg" : extension}`);
    if (object.ContentLength != null) res.setHeader("Content-Length", String(object.ContentLength));
    res.setHeader("Content-Disposition", `attachment; filename="RXV-${imageId}.${extension}"`);
    res.setHeader("Cache-Control", "private, no-store");
    return (object.Body as any).pipe(res);
  } catch {
    return jsonResponse(res, 500, { ok: false, error: "FREE_IMAGE_DOWNLOAD_UNAVAILABLE" });
  }
}

async function handleUploadImage(req: any, res: any, body: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return jsonResponse(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const uploadedObjects: Array<{ bucket: string; key: string }> = [];

  try {
    await requireImageAdmin(req);
    requireImageCatalogR2Config();

    const base64 = body?.base64 || body?.fileDataBase64 || body?.imageBase64;
    const categoryId = safeText(body?.category_id || body?.categoryId);
    const categoryName = safeText(body?.category_name || body?.categoryName || body?.category || categoryId);
    const originalName = safeText(body?.file_name || body?.filename || body?.name || "圖片素材");

    if (!base64) {
      return jsonResponse(res, 400, { success: false, error: "缺少圖片資料" });
    }
    if (!categoryId || !categoryName) {
      return jsonResponse(res, 400, { success: false, error: "請先選擇圖片分類" });
    }

    // 本階段刻意固定 bundle：free ↔ bundle 切換留到第二階段，避免誤公開高畫質原圖。
    const priceType = "bundle";
    const runtimeR2 = getImageR2RuntimeConfig();
    const catalog = await readPublicImageCatalogFromR2();

    const { buffer, mimeType, ext } = normalizeBase64Image(base64, body?.mime_type || body?.mimeType);

    const now = new Date();
    const imageId = crypto.randomUUID();
    const title = sanitizeImageTitle(originalName);

    // 原圖只進 private/core bucket；public bucket 只放縮圖與 public manifest。
    const originalPath = `originals/by-image-id/${imageId}/original.${ext}`;
    const thumbnailPath = `thumbnails/by-image-id/${imageId}.webp`;

    let thumbnailBuffer: Buffer;
    try {
      const result = await sharp(buffer)
        .rotate()
        .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer({ resolveWithObject: true });
      thumbnailBuffer = result.data;
    } catch {
      throw new Error("R2_THUMBNAIL_GENERATION_FAILED");
    }

    try {
      await uploadBufferToImageBucket(runtimeR2.privateBucket, originalPath, buffer, mimeType, false);
    } catch {
      throw new Error("R2_PRIVATE_ORIGINAL_UPLOAD_FAILED");
    }
    uploadedObjects.push({ bucket: runtimeR2.privateBucket, key: originalPath });

    try {
      await uploadBufferToImageBucket(runtimeR2.publicBucket, thumbnailPath, thumbnailBuffer, "image/webp", true);
    } catch {
      throw new Error("R2_PUBLIC_THUMBNAIL_UPLOAD_FAILED");
    }
    uploadedObjects.push({ bucket: runtimeR2.publicBucket, key: thumbnailPath });

    const thumbnailUrl = buildPublicImageAssetUrl(thumbnailPath, catalog);
    const publicRecord = {
      id: imageId,
      title,
      category: categoryName,
      category_id: categoryId,
      category_name: categoryName,
      thumbnail_url: thumbnailUrl,
      // 此最小版未另外建立大尺寸 preview；先以縮圖維持 Preview 功能可用。
      preview_url: thumbnailUrl,
      plan_type: priceType,
      created_at: now.toISOString(),
    };

    if (catalog.images.some((item: any) => safeText(item?.id) === imageId)) {
      throw new Error("R2_PUBLIC_MANIFEST_ID_COLLISION");
    }

    const nextImages = [...catalog.images, publicRecord];
    await writePublicImageCatalogToR2(catalog, nextImages);

    return jsonResponse(res, 200, {
      success: true,
      ok: true,
      action: "uploadImage",
      image: {
        ...publicRecord,
        public_url: thumbnailUrl,
        is_free: false,
        price_type: "bundle",
      },
      thumbnail_url: thumbnailUrl,
      manifest_count: nextImages.length,
      storage: {
        private_original: true,
        public_thumbnail: true,
        public_original: false,
      },
    });
  } catch (e: any) {
    // manifest 尚未成功寫入時，回滾本次新增的兩個 object；不碰任何既有正式圖片。
    if (uploadedObjects.length > 0) {
      const cleanupResults = await Promise.allSettled(
        uploadedObjects.map(({ bucket, key }) => deleteImageObjectFromBucket(bucket, key)),
      );
      cleanupResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            "R2_IMAGE_UPLOAD_ROLLBACK_FAILED",
            uploadedObjects[index]?.bucket,
            uploadedObjects[index]?.key,
            result.reason,
          );
        }
      });
    }
    const errorCode = safeText(e?.message) || "UPLOAD_IMAGE_FAILED";
    const status = Number(e?.statusCode) || (
      /^(IMAGE_UPLOAD_|R2_PUBLIC_MANIFEST_FORMAT_INVALID|R2_PUBLIC_MANIFEST_ID_COLLISION)/.test(errorCode) ? 400 :
      errorCode === "RXV_IMAGE_ADMIN_KEY_MISSING" ? 503 : 500
    );
    console.error("UPLOAD_IMAGE_R2_CATALOG_FAILED", errorCode);
    return jsonResponse(res, status, {
      success: false,
      ok: false,
      error: errorCode,
    });
  }
}

const IMAGE_UPLOAD_URL_TTL_SECONDS = 15 * 60;

function readImageUploadPayload(body: any) {
  const categoryId = safeText(body?.category_id || body?.categoryId);
  const categoryName = safeText(body?.category_name || body?.categoryName || body?.category || categoryId);
  const fileName = safeText(body?.file_name || body?.fileName || body?.filename || '圖片素材');
  const mimeType = safeText(body?.mime_type || body?.mimeType).toLowerCase().replace('image/jpg', 'image/jpeg');
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : '';
  if (!categoryId || !categoryName) throw new Error('IMAGE_UPLOAD_CATEGORY_REQUIRED');
  if (!extension) throw new Error('IMAGE_UPLOAD_UNSUPPORTED_FORMAT');
  return { categoryId, categoryName, fileName, mimeType, extension };
}

function imageOriginalKey(imageId: string, extension: string) {
  return `originals/by-image-id/${imageId}/original.${extension}`;
}

function imageThumbnailKey(imageId: string) {
  return `thumbnails/by-image-id/${imageId}.webp`;
}

async function handleCreateImageUploadUrl(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageAdmin(req);
    const runtime = getImageR2RuntimeConfig();
    const payload = readImageUploadPayload(body);
    const imageId = crypto.randomUUID();
    const originalKey = imageOriginalKey(imageId, payload.extension);
    const thumbnailKey = imageThumbnailKey(imageId);
    const client = getImageCatalogR2Client();
    const [originalUploadUrl, thumbnailUploadUrl] = await Promise.all([
      getSignedUrl(client, new PutObjectCommand({
        Bucket: runtime.privateBucket, Key: originalKey, ContentType: payload.mimeType, CacheControl: 'private, no-store',
      }), { expiresIn: IMAGE_UPLOAD_URL_TTL_SECONDS }),
      getSignedUrl(client, new PutObjectCommand({
        Bucket: runtime.publicBucket, Key: thumbnailKey, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable',
      }), { expiresIn: IMAGE_UPLOAD_URL_TTL_SECONDS }),
    ]);
    return jsonResponse(res, 200, {
      ok: true, success: true, imageId, originalKey, thumbnailKey, originalUploadUrl, thumbnailUploadUrl,
      expiresAt: new Date(Date.now() + IMAGE_UPLOAD_URL_TTL_SECONDS * 1000).toISOString(),
    });
  } catch (error: any) {
    const code = safeText(error?.message || 'R2_IMAGE_UPLOAD_URL_CREATE_FAILED');
    return jsonResponse(res, code === 'RXV_IMAGE_ADMIN_KEY_MISSING' ? 503 : 400, { ok: false, success: false, error: code });
  }
}

async function handleFinalizeImageUpload(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  let uploaded: Array<{ bucket: string; key: string }> = [];
  try {
    await requireImageAdmin(req);
    const runtime = getImageR2RuntimeConfig();
    const payload = readImageUploadPayload(body);
    const imageId = safeText(body?.imageId || body?.image_id);
    if (!isUuid(imageId)) throw new Error('IMAGE_UPLOAD_ID_INVALID');
    const originalKey = imageOriginalKey(imageId, payload.extension);
    const thumbnailKey = imageThumbnailKey(imageId);
    const client = getImageCatalogR2Client();
    await Promise.all([
      client.send(new HeadObjectCommand({ Bucket: runtime.privateBucket, Key: originalKey })),
      client.send(new HeadObjectCommand({ Bucket: runtime.publicBucket, Key: thumbnailKey })),
    ]);
    uploaded = [{ bucket: runtime.privateBucket, key: originalKey }, { bucket: runtime.publicBucket, key: thumbnailKey }];
    const catalog = await readPublicImageCatalogFromR2();
    if (catalog.images.some((item: any) => safeText(item?.id) === imageId)) throw new Error('R2_PUBLIC_MANIFEST_ID_COLLISION');
    const thumbnailUrl = buildPublicImageAssetUrl(thumbnailKey, catalog);
    const record = {
      id: imageId, title: sanitizeImageTitle(payload.fileName), category: payload.categoryName,
      category_id: payload.categoryId, category_name: payload.categoryName, thumbnail_url: thumbnailUrl,
      preview_url: thumbnailUrl, plan_type: 'bundle', price_type: 'bundle', created_at: new Date().toISOString(),
    };
    const nextImages = [...catalog.images, record];
    await writePublicImageCatalogToR2(catalog, nextImages);
    return jsonResponse(res, 200, { ok: true, success: true, image: record, thumbnail_url: thumbnailUrl, manifest_count: nextImages.length });
  } catch (error: any) {
    // These keys are generated for this request's UUID only; rollback cannot affect an existing catalog image.
    if (uploaded.length) await Promise.allSettled(uploaded.map(({ bucket, key }) => deleteImageObjectFromBucket(bucket, key)));
    const code = safeText(error?.message || 'R2_PUBLIC_MANIFEST_WRITE_FAILED');
    console.error('IMAGE_UPLOAD_FINALIZE_FAILED', code);
    return jsonResponse(res, /^(IMAGE_UPLOAD_|R2_PUBLIC_MANIFEST_ID_COLLISION)/.test(code) ? 400 : 500, { ok: false, success: false, error: code });
  }
}

async function handleAdminListR2Images(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageAdmin(req);
    const catalog = await readPublicImageCatalogFromR2();
    const images = catalog.images.map((image: any) => ({ ...image, public_url: safeText(image?.thumbnail_url || image?.preview_url), plan_type: catalogPlanType(image), price_type: catalogPlanType(image) }));
    return jsonResponse(res, 200, { ok: true, success: true, source: 'r2-public-catalog', total: images.length, images });
  } catch (error: any) {
    return jsonResponse(res, 500, { ok: false, success: false, error: safeText(error?.message || 'R2_PUBLIC_MANIFEST_READ_FAILED') });
  }
}

async function handleAdminListR2ImageCategories(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageAdmin(req);
    const catalog = await readPublicImageCatalogFromR2();
    const found = new Map<string, string>();
    for (const image of catalog.images) {
      const id = safeText(image?.category_id || image?.category);
      if (id && !found.has(id)) found.set(id, catalogCategoryName(image));
    }
    return jsonResponse(res, 200, { ok: true, success: true, categories: [...found].map(([id, name], sort_order) => ({ id, name, sort_order, is_active: true })) });
  } catch (error: any) {
    return jsonResponse(res, 500, { ok: false, success: false, error: safeText(error?.message || 'R2_PUBLIC_MANIFEST_READ_FAILED') });
  }
}

async function getUserByEmail(email: string) {
  const res = await supabaseRest(`users?select=*&email=eq.${escapeFilterValue(email)}&limit=1`, {
    method: "GET",
    headers: { Prefer: "return=representation" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET_USER_FAILED:${res.status}:${text}`);
  }
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

function readStoredPassword(user: any) {
  return (
    user?.password_hash ||
    user?.passwordHash ||
    user?.password ||
    user?.passwd ||
    ""
  );
}

function isBcryptHash(value: string) {
  return /^\$2[aby]\$/.test(String(value || ""));
}

async function hashPassword(password: string) {
  const bcrypt = await import("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, stored: string) {
  if (!stored) return false;
  if (stored === password) return true;

  if (isBcryptHash(stored)) {
    try {
      const bcrypt = await import("bcryptjs");
      return await bcrypt.compare(password, stored);
    } catch {
      return false;
    }
  }

  return false;
}

async function upgradePlaintextPasswordIfNeeded(user: any, password: string, stored: string) {
  const userId = String(user?.id || "");
  if (!userId || !stored || isBcryptHash(stored) || stored !== password) return;

  const passwordHash = await hashPassword(password);
  const attempts = [
    { password_hash: passwordHash },
    { password: passwordHash },
  ];

  let lastError = "";
  for (const payload of attempts) {
    const res = await supabaseRest(`users?id=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (res.ok) return;
    lastError = await res.text().catch(() => "");
  }

  throw new Error(`PASSWORD_REHASH_FAILED:${lastError}`);
}

async function insertUser(email: string, password: string) {
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const attempts = [
    { id, email, password_hash: passwordHash, created_at: new Date().toISOString() },
    { id, email, password: passwordHash, created_at: new Date().toISOString() },
    { email, password_hash: passwordHash, created_at: new Date().toISOString() },
    { email, password: passwordHash, created_at: new Date().toISOString() },
  ];

  let lastError = "";
  for (const payload of attempts) {
    const res = await supabaseRest("users", { method: "POST", body: JSON.stringify(payload) });
    if (res.ok) {
      const rows = await res.json().catch(() => []);
      const user = Array.isArray(rows) && rows[0] ? rows[0] : null;
      return user || { id, email };
    }
    lastError = await res.text().catch(() => "");
  }

  throw new Error(`INSERT_USER_FAILED:${lastError}`);
}

async function ensureUserCredits(userId: string) {
  if (!userId) throw new Error("USER_CREDITS_USER_ID_MISSING");

  const existingRes = await supabaseRest(
    `user_credits?select=user_id&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    { method: "GET", headers: { Prefer: "return=representation" } }
  );

  if (existingRes.ok) {
    const rows = await existingRes.json().catch(() => []);
    if (Array.isArray(rows) && rows.length > 0) return;
  }

  const payload = {
    user_id: userId,
    remaining_chars: 0,
  };

  const insertRes = await supabaseRest("user_credits", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (insertRes.ok || insertRes.status === 409) return;

  const retryRes = await supabaseRest(
    `user_credits?select=user_id&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    { method: "GET", headers: { Prefer: "return=representation" } }
  );
  if (retryRes.ok) {
    const rows = await retryRes.json().catch(() => []);
    if (Array.isArray(rows) && rows.length > 0) return;
  }

  const text = await insertRes.text().catch(() => "");
  throw new Error(`USER_CREDITS_CREATE_FAILED:${insertRes.status}:${text}`);
}

async function handleGetCurrentUserCredits(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const sessionUser = await getUserFromAuthHeader(req);
    if (!sessionUser?.userId) {
      return jsonResponse(res, 401, { ok: false, error: "Invalid or expired token" });
    }

    const [creditsRes, purchasesRes, usageRes] = await Promise.all([
      supabaseRest(
        `user_credits?select=remaining_chars&user_id=eq.${encodeURIComponent(sessionUser.userId)}&limit=1`,
        { method: "GET", headers: { Prefer: "return=representation" } }
      ),
      supabaseRest(
        `purchase_logs?select=points&user_id=eq.${encodeURIComponent(sessionUser.userId)}&status=in.(success,paid)`,
        { method: "GET", headers: { Prefer: "return=representation" } }
      ),
      supabaseRest(
        `usage_logs?select=total_chars&user_id=eq.${encodeURIComponent(sessionUser.userId)}`,
        { method: "GET", headers: { Prefer: "return=representation" } }
      ),
    ]);

    if (!creditsRes.ok) {
      const text = await creditsRes.text().catch(() => "");
      throw new Error(`USER_CREDITS_READ_FAILED:${creditsRes.status}:${text}`);
    }

    if (!purchasesRes.ok || !usageRes.ok) {
      throw new Error(
        `USER_CREDIT_TOTALS_READ_FAILED:${purchasesRes.status}:${usageRes.status}`
      );
    }

    const rows = await creditsRes.json().catch(() => []);
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    const purchaseRows = await purchasesRes.json().catch(() => []);
    const usageRows = await usageRes.json().catch(() => []);
    const totalPurchasedPoints = (Array.isArray(purchaseRows) ? purchaseRows : []).reduce(
      (sum: number, item: any) => sum + Math.max(0, Number(item?.points || 0) || 0),
      0,
    );
    const totalUsedChars = (Array.isArray(usageRows) ? usageRows : []).reduce(
      (sum: number, item: any) => sum + Math.max(0, Number(item?.total_chars || 0) || 0),
      0,
    );

    if (!row) {
      return jsonResponse(res, 200, {
        remaining_chars: 0,
        total_purchased_points: totalPurchasedPoints,
        total_used_chars: totalUsedChars,
      });
    }

    const remainingChars = Number(row.remaining_chars ?? 0);
    if (!Number.isFinite(remainingChars)) {
      return jsonResponse(res, 200, {
        remaining_chars: 0,
        total_purchased_points: totalPurchasedPoints,
        total_used_chars: totalUsedChars,
      });
    }

    return jsonResponse(res, 200, {
      remaining_chars: remainingChars,
      total_purchased_points: totalPurchasedPoints,
      total_used_chars: totalUsedChars,
    });
  } catch (e: any) {
    console.error("GET_CURRENT_USER_CREDITS_FAILED", e);
    return jsonResponse(res, 500, {
      ok: false,
      error: e?.message || "Failed to read user credits",
    });
  }
}

async function handleGetMyPurchaseLogs(req: any, res: any) {
  if (req.method !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const sessionUser = await getUserFromAuthHeader(req);
    if (!sessionUser?.userId) {
      return jsonResponse(res, 401, { ok: false, error: "Invalid or expired token" });
    }

    const response = await supabaseRest(
      `purchase_logs?select=id,order_no,amount,points,bonus_points,status,created_at&user_id=eq.${encodeURIComponent(sessionUser.userId)}&order=created_at.desc&limit=100`,
      { method: "GET", headers: { Prefer: "return=representation" } },
    );
    if (!response.ok) {
      throw new Error(`PURCHASE_LOGS_READ_FAILED:${response.status}`);
    }

    const rows = await response.json().catch(() => []);
    return jsonResponse(res, 200, {
      ok: true,
      purchases: Array.isArray(rows) ? rows : [],
    });
  } catch (error: any) {
    console.error("GET_MY_PURCHASE_LOGS_FAILED", error);
    return jsonResponse(res, 500, { ok: false, error: "Failed to read purchase logs" });
  }
}

async function handleGetPurchaseStatus(req: any, res: any) {
  if (req.method !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const sessionUser = await getUserFromAuthHeader(req);
    if (!sessionUser?.userId) {
      return jsonResponse(res, 401, { ok: false, error: "Invalid or expired token" });
    }

    const orderNo = safeText(req?.query?.order_no || req?.query?.orderNo);
    if (!orderNo || !/^[A-Za-z0-9_-]{1,80}$/.test(orderNo)) {
      return jsonResponse(res, 400, { ok: false, error: "Invalid order number" });
    }

    const response = await supabaseRest(
      `purchase_logs?select=id,order_no,amount,points,bonus_points,status,created_at&order_no=eq.${encodeURIComponent(orderNo)}&user_id=eq.${encodeURIComponent(sessionUser.userId)}&limit=1`,
      { method: "GET", headers: { Prefer: "return=representation" } },
    );
    if (!response.ok) {
      throw new Error(`PURCHASE_STATUS_READ_FAILED:${response.status}`);
    }

    const rows = await response.json().catch(() => []);
    const purchase = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!purchase) {
      return jsonResponse(res, 404, { ok: false, error: "Purchase not found" });
    }

    return jsonResponse(res, 200, { ok: true, purchase });
  } catch (error: any) {
    console.error("GET_PURCHASE_STATUS_FAILED", error);
    return jsonResponse(res, 500, { ok: false, error: "Failed to read purchase status" });
  }
}

async function handleGetCurrentUserProfile(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const sessionUser = await getUserFromAuthHeader(req);
    if (!sessionUser?.userId) {
      return jsonResponse(res, 401, { ok: false, error: "Invalid or expired token" });
    }

    const userRes = await supabaseRest(
      `users?select=id,email&id=eq.${encodeURIComponent(sessionUser.userId)}&limit=1`,
      { method: "GET", headers: { Prefer: "return=representation" } }
    );

    if (!userRes.ok) {
      throw new Error(`CURRENT_USER_PROFILE_READ_FAILED:${userRes.status}`);
    }

    const rows = await userRes.json().catch(() => []);
    const user = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!user?.id) {
      return jsonResponse(res, 404, { ok: false, error: "User not found" });
    }

    return jsonResponse(res, 200, {
      ok: true,
      user: {
        id: String(user.id),
        email: normalizeEmail(user.email),
      },
    });
  } catch (e: any) {
    console.error("GET_CURRENT_USER_PROFILE_FAILED", e);
    return jsonResponse(res, 500, { ok: false, error: "Failed to read current user profile" });
  }
}

async function handleAuth(req: any, res: any, body: any) {
  if (req.method !== "POST") {
    return jsonResponse(res, 405, { success: false, error: "Method Not Allowed" });
  }

  try {
    const mode = safeText(
      body?.action ||
      body?.mode ||
      body?.authMode ||
      body?.type ||
      body?.subaction ||
      body?.intent ||
      body?.operation ||
      body?.method ||
      "login"
    ).toLowerCase();
    const email = normalizeEmail(body?.email);
    const password = safeText(body?.password);

    if (!email || !password) {
      return jsonResponse(res, 400, { success: false, error: "請輸入 Email 與密碼" });
    }

    if (password.length < 6) {
      return jsonResponse(res, 400, { success: false, error: "密碼至少 6 個字元" });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(res, 500, { success: false, error: "登入服務未設定" });
    }

    if (mode === "register") {
      const existing = await getUserByEmail(email);
      if (existing?.id) {
        return jsonResponse(res, 409, { success: false, error: "此 Email 已註冊，請直接登入" });
      }

      const user = await insertUser(email, password);
      await ensureUserCredits(String(user?.id || ""));
      const session = await createUserSession(String(user?.id || ""), req);
      return jsonResponse(res, 200, {
        ok: true,
        success: true,
        message: "註冊成功",
        token: session.token,
        expiresAt: session.expiresAt,
        user: { id: String(user?.id || ""), email: user?.email || email },
        userId: String(user?.id || ""),
        email: user?.email || email,
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return jsonResponse(res, 401, { success: false, error: "帳號或密碼錯誤" });
    }

    const stored = readStoredPassword(user);
    const ok = await verifyPassword(password, stored);
    if (!ok) {
      return jsonResponse(res, 401, { success: false, error: "帳號或密碼錯誤" });
    }

    await upgradePlaintextPasswordIfNeeded(user, password, stored);
    const session = await createUserSession(String(user?.id || ""), req);

    return jsonResponse(res, 200, {
      ok: true,
      success: true,
      message: "登入成功",
      token: session.token,
      expiresAt: session.expiresAt,
      user: { id: String(user?.id || ""), email: user?.email || email },
      userId: String(user?.id || ""),
      email: user?.email || email,
    });
  } catch (e: any) {
    console.error("AUTH_FAILED", e);
    return jsonResponse(res, 500, {
      success: false,
      error: e?.message || "登入失敗，請稍後再試",
    });
  }
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeReqBody(req: any) {
  const b = req?.body;
  if (!b) return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b;
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((x) => x.trim());
}

function parseCsvText(csvText: string) {
  const lines = String(csvText || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((x) => x.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]);
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const row: any = {};
    for (let j = 0; j < header.length; j++) row[header[j]] = vals[j] || "";
    rows.push(row);
  }
  return rows;
}

function makeJobId() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.random().toString(16).slice(2, 6);
  return `job-${ts}-${rand}`;
}

function shopeeJobDir(jobId: string) {
  return path.join(SHOPEE_JOBS_DIR, jobId);
}

function shopeeJobMetaPath(jobId: string) {
  return path.join(shopeeJobDir(jobId), "job.json");
}

function writeJson(file: string, data: any) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function readJson(file: string, fallback: any = null) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function runNodeScript(scriptPath: string, args: string[], cwd: string, extraEnv: Record<string, string> = {}) {
  return new Promise<{ ok: boolean; stdout: string; stderr: string }>((resolve) => {
    const cp = spawn(process.execPath, [scriptPath, ...args], {
      cwd,
      env: {
        ...process.env,
        RXV_VIDEO_SERVER: extraEnv.RXV_VIDEO_SERVER || RENDER_SERVER_URL,
        SHOPEE_PROFILE_DIR,
        ...extraEnv,
      },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    cp.stdout.on("data", (d) => (stdout += String(d)));
    cp.stderr.on("data", (d) => (stderr += String(d)));
    cp.on("close", (code) => resolve({ ok: code === 0, stdout, stderr }));
  });
}

function resolveLimit(body: any, job: any, fallback = 5) {
  const bodyLimit = Number(body?.limit || 0);
  if (Number.isFinite(bodyLimit) && bodyLimit > 0) return Math.floor(bodyLimit);
  const count = Number(job?.count || 0);
  if (Number.isFinite(count) && count > 0) return Math.min(count, 20);
  return fallback;
}


type StorefrontRow = {
  id: string;
  owner_user_id: string;
  slug: string;
  page_mode: string;
  profile_type?: 'business' | 'supplier' | 'group_host' | string | null;
  display_name: string;
  contact_name?: string | null;
  job_title?: string | null;
  bio?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  tagline?: string | null;
  line_id?: string | null;
  address_text?: string | null;
  map_url?: string | null;
  business_hours_text?: string | null;
  service_area_text?: string | null;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  phone?: string | null;
  line_url?: string | null;
  email?: string | null;
  website_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  shopee_url?: string | null;
  delivery_url?: string | null;
  template_id?: string | null;
  status: string;
  is_public: boolean;
  expires_at?: string | null;
  created_at?: string;
};

type StorefrontItemRow = {
  id: string;
  storefront_id: string;
  item_type: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  price_text?: string | null;
  button_label?: string | null;
  button_url?: string | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
};

type StorefrontServiceItemRow = {
  id: string;
  storefront_id: string;
  title: string;
  description?: string | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
};


type StorefrontContentItemRow = {
  id: string;
  storefront_id: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
};

type StorefrontFaqItemRow = {
  id: string;
  storefront_id: string;
  question?: string | null;
  answer?: string | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
};

type StorefrontEntitlementRow = {
  id: string;
  storefront_id: string;
  plan_code: string;
  max_items: number | null;
  expires_at?: string | null;
  starts_at?: string | null;
  status: string;
};

type StorefrontSupplierProfileRow = {
  storefront_id: string;
  supply_types?: string[] | null;
  product_categories?: string[] | null;
  supplier_intro?: string | null;
  minimum_order_text?: string | null;
  shipping_origin?: string | null;
  delivery_regions?: string[] | null;
  lead_time_text?: string | null;
  cooperation_terms?: string | null;
  cooperation_button_label?: string | null;
  cooperation_button_url?: string | null;
  is_accepting_collaboration?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function sanitizeStorefrontSlug(value: any) {
  return safeText(value).toLowerCase();
}

function isValidStorefrontSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

const STOREFRONT_PROFILE_TYPES = new Set(['business', 'supplier', 'group_host']);

function normalizeStorefrontProfileType(value: any, fallback: 'business' | 'supplier' | 'group_host' = 'business') {
  const normalized = safeText(value).toLowerCase();
  return STOREFRONT_PROFILE_TYPES.has(normalized) ? normalized as 'business' | 'supplier' | 'group_host' : fallback;
}

function parseStorefrontBoolean(value: any, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  const normalized = safeText(value).toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function normalizeStorefrontTextList(value: any, maxItems: number, maxLength: number) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,、]/g)
      : [];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const rawValue of rawValues) {
    const item = safeText(rawValue).slice(0, maxLength);
    const dedupeKey = item.toLocaleLowerCase('zh-TW');
    if (!item || seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(item);
    if (result.length >= maxItems) break;
  }
  return result;
}

function normalizeSupplierProfileInput(value: any) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    supply_types: normalizeStorefrontTextList(input?.supplyTypes ?? input?.supply_types, 8, 30),
    product_categories: normalizeStorefrontTextList(input?.productCategories ?? input?.product_categories, 12, 40),
    supplier_intro: safeText(input?.supplierIntro ?? input?.supplier_intro).slice(0, 3000) || null,
    minimum_order_text: safeText(input?.minimumOrderText ?? input?.minimum_order_text).slice(0, 180) || null,
    shipping_origin: safeText(input?.shippingOrigin ?? input?.shipping_origin).slice(0, 120) || null,
    delivery_regions: normalizeStorefrontTextList(input?.deliveryRegions ?? input?.delivery_regions, 12, 40),
    lead_time_text: safeText(input?.leadTimeText ?? input?.lead_time_text).slice(0, 600) || null,
    cooperation_terms: safeText(input?.cooperationTerms ?? input?.cooperation_terms).slice(0, 3000) || null,
    cooperation_button_label: safeText(input?.cooperationButtonLabel ?? input?.cooperation_button_label).slice(0, 50) || '申請團購合作',
    cooperation_button_url: parseOptionalUrl(input?.cooperationButtonUrl ?? input?.cooperation_button_url),
    is_accepting_collaboration: parseStorefrontBoolean(input?.isAcceptingCollaboration ?? input?.is_accepting_collaboration, true),
  };
}

function parseOptionalUrl(value: any) {
  const raw = safeText(value);
  if (!raw) return null;
  if (/^(https?:|line:|tel:|mailto:)/i.test(raw)) return raw;
  return `https://${raw}`;
}

function parseOptionalEmail(value: any) {
  const raw = safeText(value);
  if (!raw) return null;
  return raw.slice(0, 180);
}

function isFutureDate(value: any) {
  const time = new Date(String(value || '')).getTime();
  return Number.isFinite(time) && time > Date.now();
}

function activeStorefrontEntitlements(rows: StorefrontEntitlementRow[]) {
  return rows.filter((row) => row?.status === 'active' && (!row.expires_at || isFutureDate(row.expires_at)));
}

async function findOwnerStorefront(userId: string): Promise<StorefrontRow | null> {
  const response = await supabaseRest(
    `storefronts?select=*&owner_user_id=eq.${encodeURIComponent(userId)}&page_mode=in.(product_showcase,brand_storefront)&order=created_at.desc&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] as StorefrontRow : null;
}

async function readStorefrontItems(storefrontId: string, publicOnly = false) {
  const visibleFilter = publicOnly ? '&is_visible=eq.true' : '';
  const response = await supabaseRest(
    `storefront_items?select=*&storefront_id=eq.${encodeURIComponent(storefrontId)}${visibleFilter}&order=sort_order.asc,created_at.asc`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_ITEMS_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows as StorefrontItemRow[] : [];
}

async function readStorefrontServiceItems(storefrontId: string, publicOnly = false) {
  const visibleFilter = publicOnly ? '&is_visible=eq.true' : '';
  const response = await supabaseRest(
    `storefront_service_items?select=*&storefront_id=eq.${encodeURIComponent(storefrontId)}${visibleFilter}&order=sort_order.asc,created_at.asc`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_SERVICE_ITEMS_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows as StorefrontServiceItemRow[] : [];
}


async function readStorefrontContentItems(
  tableName: 'storefront_portfolio_items' | 'storefront_process_steps',
  storefrontId: string,
  publicOnly = false,
) {
  const visibleFilter = publicOnly ? '&is_visible=eq.true' : '';
  const response = await supabaseRest(
    `${tableName}?select=*&storefront_id=eq.${encodeURIComponent(storefrontId)}${visibleFilter}&order=sort_order.asc,created_at.asc`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${tableName.toUpperCase()}_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows as StorefrontContentItemRow[] : [];
}

async function readStorefrontFaqItems(storefrontId: string, publicOnly = false) {
  const visibleFilter = publicOnly ? '&is_visible=eq.true' : '';
  const response = await supabaseRest(
    `storefront_faq_items?select=*&storefront_id=eq.${encodeURIComponent(storefrontId)}${visibleFilter}&order=sort_order.asc,created_at.asc`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_FAQ_ITEMS_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows as StorefrontFaqItemRow[] : [];
}

async function readStorefrontEntitlements(storefrontId: string) {
  const response = await supabaseRest(
    `storefront_entitlements?select=id,storefront_id,plan_code,max_items,expires_at,starts_at,status&storefront_id=eq.${encodeURIComponent(storefrontId)}&status=eq.active&order=created_at.desc`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_ENTITLEMENT_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows as StorefrontEntitlementRow[] : [];
}

async function readStorefrontSupplierProfile(storefrontId: string): Promise<StorefrontSupplierProfileRow | null> {
  const response = await supabaseRest(
    `storefront_supplier_profiles?select=*&storefront_id=eq.${encodeURIComponent(storefrontId)}&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_SUPPLIER_PROFILE_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] as StorefrontSupplierProfileRow : null;
}

async function upsertStorefrontSupplierProfile(storefrontId: string, input: ReturnType<typeof normalizeSupplierProfileInput>) {
  const response = await supabaseRest('storefront_supplier_profiles?on_conflict=storefront_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      storefront_id: storefrontId,
      ...input,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_SUPPLIER_PROFILE_SAVE_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) && rows[0] ? rows[0] as StorefrontSupplierProfileRow : null;
  if (!row) throw new Error('STOREFRONT_SUPPLIER_PROFILE_SAVE_EMPTY');
  return row;
}

function getEffectiveStorefrontEntitlement(rows: StorefrontEntitlementRow[]) {
  const activeRows = activeStorefrontEntitlements(rows);
  if (!activeRows.length) return null;

  return activeRows.reduce((best, current) => {
    const bestMax = Number(best?.max_items || 0) || 0;
    const currentMax = Number(current?.max_items || 0) || 0;
    if (!best || currentMax > bestMax) return current;
    return best;
  }, activeRows[0] as StorefrontEntitlementRow);
}

function storefrontPayload(row: StorefrontRow) {
  const primaryCtaLabel = safeText(row.primary_cta_label);
  const isGroupBuyCta = /團購.*合作|申請.*團購/.test(primaryCtaLabel);
  return {
    id: row.id,
    slug: row.slug,
    page_mode: row.page_mode,
    profile_type: normalizeStorefrontProfileType(row.profile_type),
    display_name: row.display_name,
    contact_name: row.contact_name || null,
    job_title: row.job_title || null,
    bio: row.bio || null,
    logo_url: row.logo_url || null,
    cover_image_url: row.cover_image_url || null,
    tagline: row.tagline || null,
    line_id: row.line_id || null,
    address_text: row.address_text || null,
    map_url: row.map_url || null,
    business_hours_text: row.business_hours_text || null,
    service_area_text: row.service_area_text || null,
    primary_cta_label: !GROUP_BUY_ENABLED && isGroupBuyCta ? null : row.primary_cta_label || null,
    primary_cta_url: !GROUP_BUY_ENABLED && isGroupBuyCta ? null : row.primary_cta_url || null,
    phone: row.phone || null,
    line_url: row.line_url || null,
    email: row.email || null,
    website_url: row.website_url || null,
    facebook_url: row.facebook_url || null,
    instagram_url: row.instagram_url || null,
    shopee_url: row.shopee_url || null,
    delivery_url: row.delivery_url || null,
    template_id: row.template_id || null,
    status: row.status,
    is_public: Boolean(row.is_public),
    expires_at: row.expires_at || null,
  };
}

function storefrontSupplierProfilePayload(row: StorefrontSupplierProfileRow | null) {
  if (!row) return null;
  return {
    supply_types: Array.isArray(row.supply_types) ? row.supply_types : [],
    product_categories: Array.isArray(row.product_categories) ? row.product_categories : [],
    supplier_intro: row.supplier_intro || null,
    minimum_order_text: row.minimum_order_text || null,
    shipping_origin: row.shipping_origin || null,
    delivery_regions: Array.isArray(row.delivery_regions) ? row.delivery_regions : [],
    lead_time_text: row.lead_time_text || null,
    cooperation_terms: GROUP_BUY_ENABLED ? (row.cooperation_terms || null) : null,
    cooperation_button_label: GROUP_BUY_ENABLED ? (row.cooperation_button_label || '申請團購合作') : null,
    cooperation_button_url: GROUP_BUY_ENABLED ? (row.cooperation_button_url || null) : null,
    is_accepting_collaboration: GROUP_BUY_ENABLED && row.is_accepting_collaboration !== false,
  };
}

function storefrontItemPayload(row: StorefrontItemRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    image_url: row.image_url || '',
    price_text: row.price_text || '',
    button_label: row.button_label || '',
    button_url: row.button_url || '',
    sort_order: Number(row.sort_order || 0) || 0,
  };
}

function storefrontServiceItemPayload(row: StorefrontServiceItemRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    sort_order: Number(row.sort_order || 0) || 0,
  };
}


function storefrontContentItemPayload(row: StorefrontContentItemRow) {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    image_url: row.image_url || '',
    sort_order: Number(row.sort_order || 0) || 0,
  };
}

function storefrontFaqItemPayload(row: StorefrontFaqItemRow) {
  return {
    id: row.id,
    question: row.question || '',
    answer: row.answer || '',
    sort_order: Number(row.sort_order || 0) || 0,
  };
}

async function requireOwnedEligibleStorefront(req: any) {
  const sessionUser = await getUserFromAuthHeader(req);
  if (!sessionUser?.userId) {
    const error: any = new Error('登入已失效，請重新登入。');
    error.statusCode = 401;
    throw error;
  }

  const storefront = await findOwnerStorefront(sessionUser.userId);
  if (!storefront) {
    const error: any = new Error('目前尚未找到已開通的商品展示頁資格。付款完成後，站方會確認並開通；收到通知後再進入設定頁。');
    error.statusCode = 404;
    throw error;
  }

  if (storefront.status === 'suspended') {
    const error: any = new Error('此商品展示頁目前已暫停，請聯繫站方。');
    error.statusCode = 403;
    throw error;
  }

  const entitlements = await readStorefrontEntitlements(storefront.id);
  const entitlement = getEffectiveStorefrontEntitlement(entitlements);
  if (!entitlement || !isFutureDate(storefront.expires_at)) {
    const error: any = new Error('商品展示頁資格已到期，請購買符合方案的點數包後再繼續使用。');
    error.statusCode = 403;
    throw error;
  }

  return { userId: sessionUser.userId, storefront, entitlement };
}

async function handleGetMyStorefront(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { storefront, entitlement } = await requireOwnedEligibleStorefront(req);
    const [items, supplierProfile, serviceItems, portfolioItems, processSteps, faqItems] = await Promise.all([
      readStorefrontItems(storefront.id),
      readStorefrontSupplierProfile(storefront.id),
      readStorefrontServiceItems(storefront.id),
      readStorefrontContentItems('storefront_portfolio_items', storefront.id),
      readStorefrontContentItems('storefront_process_steps', storefront.id),
      readStorefrontFaqItems(storefront.id),
    ]);
    return jsonResponse(res, 200, {
      ok: true,
      storefront: storefrontPayload(storefront),
      supplierProfile: storefrontSupplierProfilePayload(supplierProfile),
      serviceItems: serviceItems.map(storefrontServiceItemPayload),
      portfolioItems: portfolioItems.map(storefrontContentItemPayload),
      processSteps: processSteps.map(storefrontContentItemPayload),
      faqItems: faqItems.map(storefrontFaqItemPayload),
      items: items.map(storefrontItemPayload),
      entitlement: {
        plan_code: entitlement.plan_code,
        max_items: Number(entitlement.max_items || 0) || 0,
        expires_at: storefront.expires_at || entitlement.expires_at || null,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取公開頁失敗。',
    });
  }
}

async function handleUploadStorefrontImage(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { userId, storefront } = await requireOwnedEligibleStorefront(req);
    const base64 = body?.base64 || body?.imageBase64 || body?.fileDataBase64;
    const fileName = safeText(body?.fileName || body?.filename || 'storefront-image');
    const kind = safeText(body?.kind || 'image').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'image';
    if (!base64) return jsonResponse(res, 400, { ok: false, error: '缺少圖片資料。' });

    const { buffer, mimeType, ext } = normalizeBase64Image(base64);
    if (!buffer.length) return jsonResponse(res, 400, { ok: false, error: '圖片資料格式錯誤。' });
    if (buffer.length > 5 * 1024 * 1024) return jsonResponse(res, 400, { ok: false, error: '圖片請控制在 5MB 以下。' });

    const objectPath = `storefronts/${userId}/${storefront.id}/${kind}-${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const imageUrl = await uploadToSupabaseStorage(objectPath, buffer, mimeType);

    return jsonResponse(res, 200, {
      ok: true,
      imageUrl,
      fileName: sanitizeImageTitle(fileName),
      path: objectPath,
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '商品展示頁圖片上傳失敗。',
    });
  }
}

function normalizeStorefrontItemsInput(value: any, maxItems: number) {
  if (!Array.isArray(value)) return [];
  if (value.length > maxItems) {
    const error: any = new Error(`目前方案最多可展示 ${maxItems} 個商品。`);
    error.statusCode = 400;
    throw error;
  }

  return value
    .map((item: any, index: number) => {
      const title = safeText(item?.title).slice(0, 120);
      const description = safeText(item?.description).slice(0, 1200);
      const imageUrl = parseOptionalUrl(item?.image_url || item?.imageUrl);
      const priceText = safeText(item?.price_text || item?.priceText).slice(0, 80);
      const buttonLabel = safeText(item?.button_label || item?.buttonLabel || '立即詢問').slice(0, 50);
      const buttonUrl = parseOptionalUrl(item?.button_url || item?.buttonUrl);
      const id = safeText(item?.id);

      if (!title && !description && !imageUrl && !priceText && !buttonUrl) return null;
      if (!title) {
        const error: any = new Error(`第 ${index + 1} 個商品請填寫商品名稱。`);
        error.statusCode = 400;
        throw error;
      }
      if (!imageUrl) {
        const error: any = new Error(`第 ${index + 1} 個商品請上傳商品圖片。`);
        error.statusCode = 400;
        throw error;
      }

      return {
        id,
        item_type: 'product',
        title,
        description: description || null,
        image_url: imageUrl,
        price_text: priceText || null,
        button_label: buttonLabel || '立即詢問',
        button_url: buttonUrl,
        sort_order: index,
        is_visible: true,
      };
    })
    .filter(Boolean) as Array<Record<string, any>>;
}

async function syncStorefrontItems(storefrontId: string, items: Array<Record<string, any>>) {
  const currentItems = await readStorefrontItems(storefrontId);
  const currentItemIds = new Set(currentItems.map((item) => item.id));
  const keptIds = new Set<string>();

  for (const item of items) {
    const itemId = safeText(item.id);
    const payload = {
      storefront_id: storefrontId,
      item_type: 'product',
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      price_text: item.price_text,
      button_label: item.button_label,
      button_url: item.button_url,
      sort_order: item.sort_order,
      is_visible: true,
    };

    if (itemId && currentItemIds.has(itemId)) {
      const updateItemResponse = await supabaseRest(`storefront_items?id=eq.${encodeURIComponent(itemId)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!updateItemResponse.ok) {
        const text = await updateItemResponse.text().catch(() => '');
        throw new Error(`STOREFRONT_ITEM_UPDATE_FAILED:${updateItemResponse.status}:${text}`);
      }
      keptIds.add(itemId);
    } else {
      const insertItemResponse = await supabaseRest('storefront_items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!insertItemResponse.ok) {
        const text = await insertItemResponse.text().catch(() => '');
        throw new Error(`STOREFRONT_ITEM_INSERT_FAILED:${insertItemResponse.status}:${text}`);
      }
      const insertedRows = await insertItemResponse.json().catch(() => []);
      const inserted = Array.isArray(insertedRows) ? insertedRows[0] : null;
      if (inserted?.id) keptIds.add(String(inserted.id));
    }
  }

  for (const currentItem of currentItems) {
    if (keptIds.has(currentItem.id)) continue;
    const deleteItemResponse = await supabaseRest(`storefront_items?id=eq.${encodeURIComponent(currentItem.id)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`, {
      method: 'DELETE',
    });
    if (!deleteItemResponse.ok) {
      const text = await deleteItemResponse.text().catch(() => '');
      throw new Error(`STOREFRONT_ITEM_DELETE_FAILED:${deleteItemResponse.status}:${text}`);
    }
  }

  return readStorefrontItems(storefrontId);
}

const MAX_STOREFRONT_SERVICE_ITEMS = 6;

function normalizeStorefrontServiceItemsInput(value: any) {
  if (!Array.isArray(value)) return [];
  if (value.length > MAX_STOREFRONT_SERVICE_ITEMS) {
    const error: any = new Error(`基本介紹頁最多可設定 ${MAX_STOREFRONT_SERVICE_ITEMS} 個服務項目。`);
    error.statusCode = 400;
    throw error;
  }

  return value
    .map((item: any, index: number) => {
      const id = safeText(item?.id);
      const title = safeText(item?.title).slice(0, 80);
      const description = safeText(item?.description).slice(0, 500);
      if (!title && !description) return null;
      if (!title) {
        const error: any = new Error(`第 ${index + 1} 個服務項目請填寫標題。`);
        error.statusCode = 400;
        throw error;
      }
      return {
        id,
        title,
        description: description || null,
        sort_order: index,
        is_visible: true,
      };
    })
    .filter(Boolean) as Array<Record<string, any>>;
}

async function syncStorefrontServiceItems(storefrontId: string, items: Array<Record<string, any>>) {
  const currentItems = await readStorefrontServiceItems(storefrontId);
  const currentIds = new Set(currentItems.map((item) => item.id));
  const keptIds = new Set<string>();

  for (const item of items) {
    const itemId = safeText(item.id);
    const payload = {
      storefront_id: storefrontId,
      title: item.title,
      description: item.description,
      sort_order: item.sort_order,
      is_visible: true,
      updated_at: new Date().toISOString(),
    };

    if (itemId && currentIds.has(itemId)) {
      const response = await supabaseRest(
        `storefront_service_items?id=eq.${encodeURIComponent(itemId)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`,
        { method: 'PATCH', body: JSON.stringify(payload) },
      );
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`STOREFRONT_SERVICE_ITEM_UPDATE_FAILED:${response.status}:${text}`);
      }
      keptIds.add(itemId);
    } else {
      const response = await supabaseRest('storefront_service_items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`STOREFRONT_SERVICE_ITEM_INSERT_FAILED:${response.status}:${text}`);
      }
      const rows = await response.json().catch(() => []);
      const inserted = Array.isArray(rows) ? rows[0] : null;
      if (inserted?.id) keptIds.add(String(inserted.id));
    }
  }

  for (const current of currentItems) {
    if (keptIds.has(current.id)) continue;
    const response = await supabaseRest(
      `storefront_service_items?id=eq.${encodeURIComponent(current.id)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`STOREFRONT_SERVICE_ITEM_DELETE_FAILED:${response.status}:${text}`);
    }
  }

  return readStorefrontServiceItems(storefrontId);
}


const MAX_STOREFRONT_PORTFOLIO_ITEMS = 6;
const MAX_STOREFRONT_PROCESS_STEPS = 4;
const MAX_STOREFRONT_FAQ_ITEMS = 5;

function isStorefrontPlaceholderText(title: string, description: string) {
  const normalizedTitle = safeText(title).replace(/\s+/g, '');
  const normalizedDescription = safeText(description).replace(/\s+/g, '');
  return (
    /^項目[一二三四五六七八九十\d]+$/.test(normalizedTitle) &&
    /^(項目[一二三四五六七八九十\d]+說明|請填寫.*說明)$/.test(normalizedDescription)
  );
}

function normalizeStorefrontContentItemsInput(
  value: any,
  config: { maxItems: number; label: string; allowImage: boolean; requireImage?: boolean; titleMax: number; descriptionMax: number },
) {
  if (!Array.isArray(value)) return [];
  if (value.length > config.maxItems) {
    const error: any = new Error(`${config.label}最多可設定 ${config.maxItems} 筆。`);
    error.statusCode = 400;
    throw error;
  }

  return value
    .map((item: any, index: number) => {
      const id = safeText(item?.id);
      const title = safeText(item?.title).slice(0, config.titleMax);
      const description = safeText(item?.description).slice(0, config.descriptionMax);
      const imageUrl = config.allowImage ? parseOptionalUrl(item?.imageUrl ?? item?.image_url) : null;
      const hasContent = Boolean(title || description || imageUrl);
      if (!hasContent || isStorefrontPlaceholderText(title, description)) return null;
      if (config.requireImage && !imageUrl) {
        const error: any = new Error(`第 ${index + 1} 筆${config.label}請上傳圖片。`);
        error.statusCode = 400;
        throw error;
      }
      if (!config.allowImage && !title) {
        const error: any = new Error(`第 ${index + 1} 筆${config.label}請填寫標題。`);
        error.statusCode = 400;
        throw error;
      }
      return {
        id,
        title: title || '',
        description: description || null,
        image_url: imageUrl,
        sort_order: index,
        is_visible: true,
      };
    })
    .filter(Boolean) as Array<Record<string, any>>;
}

function normalizeStorefrontFaqItemsInput(value: any) {
  if (!Array.isArray(value)) return [];
  if (value.length > MAX_STOREFRONT_FAQ_ITEMS) {
    const error: any = new Error(`常見問題最多可設定 ${MAX_STOREFRONT_FAQ_ITEMS} 組。`);
    error.statusCode = 400;
    throw error;
  }

  return value
    .map((item: any, index: number) => {
      const id = safeText(item?.id);
      const question = safeText(item?.question).slice(0, 180);
      const answer = safeText(item?.answer).slice(0, 1600);
      if (!question && !answer) return null;
      if (!question || !answer) {
        const error: any = new Error(`第 ${index + 1} 組常見問題請同時填寫問題與回答。`);
        error.statusCode = 400;
        throw error;
      }
      return { id, question, answer, sort_order: index, is_visible: true };
    })
    .filter(Boolean) as Array<Record<string, any>>;
}

async function syncStorefrontContentItems(
  tableName: 'storefront_portfolio_items' | 'storefront_process_steps',
  storefrontId: string,
  items: Array<Record<string, any>>,
) {
  const currentItems = await readStorefrontContentItems(tableName, storefrontId);
  const currentIds = new Set(currentItems.map((item) => item.id));
  const keptIds = new Set<string>();

  for (const item of items) {
    const itemId = safeText(item.id);
    const payload: Record<string, any> = {
      storefront_id: storefrontId,
      title: item.title || '',
      description: item.description || null,
      sort_order: item.sort_order,
      is_visible: true,
      updated_at: new Date().toISOString(),
    };
    if (tableName === 'storefront_portfolio_items') payload.image_url = item.image_url || null;

    if (itemId && currentIds.has(itemId)) {
      const response = await supabaseRest(
        `${tableName}?id=eq.${encodeURIComponent(itemId)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`,
        { method: 'PATCH', body: JSON.stringify(payload) },
      );
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`${tableName.toUpperCase()}_UPDATE_FAILED:${response.status}:${text}`);
      }
      keptIds.add(itemId);
    } else {
      const response = await supabaseRest(tableName, { method: 'POST', body: JSON.stringify(payload) });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`${tableName.toUpperCase()}_INSERT_FAILED:${response.status}:${text}`);
      }
      const rows = await response.json().catch(() => []);
      const inserted = Array.isArray(rows) ? rows[0] : null;
      if (inserted?.id) keptIds.add(String(inserted.id));
    }
  }

  for (const current of currentItems) {
    if (keptIds.has(current.id)) continue;
    const response = await supabaseRest(
      `${tableName}?id=eq.${encodeURIComponent(current.id)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`${tableName.toUpperCase()}_DELETE_FAILED:${response.status}:${text}`);
    }
  }

  return readStorefrontContentItems(tableName, storefrontId);
}

async function syncStorefrontFaqItems(storefrontId: string, items: Array<Record<string, any>>) {
  const currentItems = await readStorefrontFaqItems(storefrontId);
  const currentIds = new Set(currentItems.map((item) => item.id));
  const keptIds = new Set<string>();

  for (const item of items) {
    const itemId = safeText(item.id);
    const payload = {
      storefront_id: storefrontId,
      question: item.question,
      answer: item.answer,
      sort_order: item.sort_order,
      is_visible: true,
      updated_at: new Date().toISOString(),
    };

    if (itemId && currentIds.has(itemId)) {
      const response = await supabaseRest(
        `storefront_faq_items?id=eq.${encodeURIComponent(itemId)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`,
        { method: 'PATCH', body: JSON.stringify(payload) },
      );
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`STOREFRONT_FAQ_ITEM_UPDATE_FAILED:${response.status}:${text}`);
      }
      keptIds.add(itemId);
    } else {
      const response = await supabaseRest('storefront_faq_items', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`STOREFRONT_FAQ_ITEM_INSERT_FAILED:${response.status}:${text}`);
      }
      const rows = await response.json().catch(() => []);
      const inserted = Array.isArray(rows) ? rows[0] : null;
      if (inserted?.id) keptIds.add(String(inserted.id));
    }
  }

  for (const current of currentItems) {
    if (keptIds.has(current.id)) continue;
    const response = await supabaseRest(
      `storefront_faq_items?id=eq.${encodeURIComponent(current.id)}&storefront_id=eq.${encodeURIComponent(storefrontId)}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`STOREFRONT_FAQ_ITEM_DELETE_FAILED:${response.status}:${text}`);
    }
  }

  return readStorefrontFaqItems(storefrontId);
}

async function handleSaveStorefront(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { storefront, entitlement } = await requireOwnedEligibleStorefront(req);
    const displayName = safeText(body?.displayName || body?.display_name).slice(0, 120);
    const slug = sanitizeStorefrontSlug(body?.slug);
    const wantsPublic = Boolean(body?.isPublic ?? body?.is_public);
    const maxItems = Number(entitlement.max_items || 0) || 0;
    const requestedProfileType = safeText(body?.profileType ?? body?.profile_type ?? storefront.profile_type ?? 'business').toLowerCase();

    if (!displayName) return jsonResponse(res, 400, { ok: false, error: '請填寫店家名稱。' });
    if (!isValidStorefrontSlug(slug)) {
      return jsonResponse(res, 400, { ok: false, error: '公開網址只能使用英文小寫、數字與連字號。' });
    }
    if (!STOREFRONT_PROFILE_TYPES.has(requestedProfileType)) {
      return jsonResponse(res, 400, { ok: false, error: '公開頁身分類型不正確。' });
    }

    if (slug !== storefront.slug) {
      const slugResponse = await supabaseRest(
        `storefronts?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (!slugResponse.ok) {
        const text = await slugResponse.text().catch(() => '');
        throw new Error(`STOREFRONT_SLUG_CHECK_FAILED:${slugResponse.status}:${text}`);
      }
      const slugRows = await slugResponse.json().catch(() => []);
      if (Array.isArray(slugRows) && slugRows.some((row) => row?.id && row.id !== storefront.id)) {
        return jsonResponse(res, 409, { ok: false, error: '這個公開網址名稱已被使用，請換一個。' });
      }
    }

    // 基本頁未傳 items 時，保留舊商品資料，避免降級或名片贈送方案誤刪商品。
    const hasItemsInput = Array.isArray(body?.items);
    const items = hasItemsInput ? normalizeStorefrontItemsInput(body?.items, maxItems) : null;
    const hasServiceItemsInput = Array.isArray(body?.serviceItems ?? body?.service_items);
    const serviceItems = hasServiceItemsInput
      ? normalizeStorefrontServiceItemsInput(body?.serviceItems ?? body?.service_items)
      : null;
    const hasPortfolioInput = Array.isArray(body?.portfolioItems ?? body?.portfolio_items);
    const portfolioItems = hasPortfolioInput
      ? normalizeStorefrontContentItemsInput(body?.portfolioItems ?? body?.portfolio_items, {
          maxItems: MAX_STOREFRONT_PORTFOLIO_ITEMS,
          label: '作品／案例',
          allowImage: true,
          requireImage: true,
          titleMax: 120,
          descriptionMax: 800,
        })
      : null;
    const hasProcessInput = Array.isArray(body?.processSteps ?? body?.process_steps);
    const processSteps = hasProcessInput
      ? normalizeStorefrontContentItemsInput(body?.processSteps ?? body?.process_steps, {
          maxItems: MAX_STOREFRONT_PROCESS_STEPS,
          label: '合作流程',
          allowImage: false,
          titleMax: 80,
          descriptionMax: 500,
        })
      : null;
    const hasFaqInput = Array.isArray(body?.faqItems ?? body?.faq_items);
    const faqItems = hasFaqInput
      ? normalizeStorefrontFaqItemsInput(body?.faqItems ?? body?.faq_items)
      : null;
    const requestedPrimaryCtaLabel = safeText(body?.primaryCtaLabel || body?.primary_cta_label).slice(0, 50);
    const requestedPrimaryCtaUrl = parseOptionalUrl(body?.primaryCtaUrl || body?.primary_cta_url);
    const isSupplierOnlyCta = /團購.*合作|申請.*團購/.test(requestedPrimaryCtaLabel);
    const storefrontUpdate = {
      slug,
      profile_type: normalizeStorefrontProfileType(requestedProfileType),
      display_name: displayName,
      contact_name: safeText(body?.contactName || body?.contact_name).slice(0, 80) || null,
      job_title: safeText(body?.jobTitle || body?.job_title).slice(0, 100) || null,
      bio: safeText(body?.bio).slice(0, 2000) || null,
      logo_url: parseOptionalUrl(body?.logoUrl || body?.logo_url),
      cover_image_url: parseOptionalUrl(body?.coverImageUrl || body?.cover_image_url),
      tagline: safeText(body?.tagline).slice(0, 180) || null,
      line_id: safeText(body?.lineId || body?.line_id).slice(0, 120) || null,
      address_text: safeText(body?.addressText || body?.address_text).slice(0, 240) || null,
      map_url: parseOptionalUrl(body?.mapUrl || body?.map_url),
      business_hours_text: safeText(body?.businessHoursText || body?.business_hours_text).slice(0, 600) || null,
      service_area_text: safeText(body?.serviceAreaText || body?.service_area_text).slice(0, 300) || null,
      primary_cta_label: requestedProfileType !== 'supplier' && isSupplierOnlyCta ? null : (requestedPrimaryCtaLabel || null),
      primary_cta_url: requestedProfileType !== 'supplier' && isSupplierOnlyCta ? null : requestedPrimaryCtaUrl,
      phone: safeText(body?.phone).slice(0, 60) || null,
      line_url: parseOptionalUrl(body?.lineUrl || body?.line_url),
      email: parseOptionalEmail(body?.email),
      website_url: parseOptionalUrl(body?.websiteUrl || body?.website_url),
      facebook_url: parseOptionalUrl(body?.facebookUrl || body?.facebook_url),
      instagram_url: parseOptionalUrl(body?.instagramUrl || body?.instagram_url),
      shopee_url: parseOptionalUrl(body?.shopeeUrl || body?.shopee_url),
      delivery_url: parseOptionalUrl(body?.deliveryUrl || body?.delivery_url),
      status: wantsPublic ? 'published' : 'draft',
      is_public: wantsPublic,
      updated_at: new Date().toISOString(),
    };

    const updateResponse = await supabaseRest(`storefronts?id=eq.${encodeURIComponent(storefront.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(storefrontUpdate),
    });
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`STOREFRONT_SAVE_FAILED:${updateResponse.status}:${text}`);
    }
    const updatedRows = await updateResponse.json().catch(() => []);
    const updatedStorefront = Array.isArray(updatedRows) && updatedRows[0] ? updatedRows[0] as StorefrontRow : null;
    if (!updatedStorefront) throw new Error('STOREFRONT_SAVE_EMPTY');

    const supplierProfile = updatedStorefront.profile_type === 'supplier'
      ? await upsertStorefrontSupplierProfile(
          storefront.id,
          normalizeSupplierProfileInput(body?.supplierProfile ?? body?.supplier_profile),
        )
      : await readStorefrontSupplierProfile(storefront.id);

    const savedItems = items ? await syncStorefrontItems(storefront.id, items) : await readStorefrontItems(storefront.id);
    const savedServiceItems = serviceItems
      ? await syncStorefrontServiceItems(storefront.id, serviceItems)
      : await readStorefrontServiceItems(storefront.id);
    const savedPortfolioItems = portfolioItems
      ? await syncStorefrontContentItems('storefront_portfolio_items', storefront.id, portfolioItems)
      : await readStorefrontContentItems('storefront_portfolio_items', storefront.id);
    const savedProcessSteps = processSteps
      ? await syncStorefrontContentItems('storefront_process_steps', storefront.id, processSteps)
      : await readStorefrontContentItems('storefront_process_steps', storefront.id);
    const savedFaqItems = faqItems
      ? await syncStorefrontFaqItems(storefront.id, faqItems)
      : await readStorefrontFaqItems(storefront.id);
    return jsonResponse(res, 200, {
      ok: true,
      storefront: storefrontPayload(updatedStorefront),
      supplierProfile: storefrontSupplierProfilePayload(supplierProfile),
      serviceItems: savedServiceItems.map(storefrontServiceItemPayload),

      portfolioItems: savedPortfolioItems.map(storefrontContentItemPayload),
      processSteps: savedProcessSteps.map(storefrontContentItemPayload),
      faqItems: savedFaqItems.map(storefrontFaqItemPayload),
      items: savedItems.map(storefrontItemPayload),
      entitlement: {
        plan_code: entitlement.plan_code,
        max_items: maxItems,
        expires_at: updatedStorefront.expires_at || entitlement.expires_at || null,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '公開頁儲存失敗。',
    });
  }
}

async function handleGetPublicStorefront(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const slug = sanitizeStorefrontSlug(req?.query?.slug);
    if (!isValidStorefrontSlug(slug)) {
      return jsonResponse(res, 400, { ok: false, error: '公開頁網址格式錯誤。' });
    }

    // 固定公開範例 /shop/rxv 完全改讀 Cloudflare R2，不再碰 Supabase。
    // 這樣即使 Supabase 因 cached egress 額度被 402 限制，商品展示範例仍可正常開啟。
    if (slug === 'rxv') {
      const demo = await readRxvStorefrontDemoFromR2();
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
      return jsonResponse(res, 200, demo);
    }

    const response = await supabaseRest(`storefronts?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
      method: 'GET',
      headers: { Prefer: 'return=representation' },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`PUBLIC_STOREFRONT_READ_FAILED:${response.status}:${text}`);
    }

    const rows = await response.json().catch(() => []);
    const storefront = Array.isArray(rows) && rows[0] ? rows[0] as StorefrontRow : null;
    if (!storefront || storefront.status !== 'published' || !storefront.is_public || !isFutureDate(storefront.expires_at)) {
      return jsonResponse(res, 404, { ok: false, error: '找不到此公開頁，或頁面尚未公開。' });
    }

    const profileType = normalizeStorefrontProfileType(storefront.profile_type);
    const [items, supplierProfile, serviceItems, portfolioItems, processSteps, faqItems] = await Promise.all([
      readStorefrontItems(storefront.id, true),
      profileType === 'supplier' ? readStorefrontSupplierProfile(storefront.id) : Promise.resolve(null),
      readStorefrontServiceItems(storefront.id, true),
      readStorefrontContentItems('storefront_portfolio_items', storefront.id, true),
      readStorefrontContentItems('storefront_process_steps', storefront.id, true),
      readStorefrontFaqItems(storefront.id, true),
    ]);
    return jsonResponse(res, 200, {
      ok: true,
      storefront: storefrontPayload(storefront),
      supplierProfile: storefrontSupplierProfilePayload(supplierProfile),
      serviceItems: serviceItems.map(storefrontServiceItemPayload),
      portfolioItems: portfolioItems.map(storefrontContentItemPayload),
      processSteps: processSteps.map(storefrontContentItemPayload),
      faqItems: faqItems.map(storefrontFaqItemPayload),
      items: items.map(storefrontItemPayload),
    });
  } catch (error: any) {
    return jsonResponse(res, 500, {
      ok: false,
      error: error?.message || '讀取公開頁失敗。',
    });
  }
}

async function handlePing(_req: any, res: any) {
  return res.status(200).json({
    ok: true,
    action: "ping",
    message: "main api alive",
    now: new Date().toISOString(),
    renderServer: RENDER_SERVER_URL,
  });
}

async function handleShorten(req: any, res: any, body: any) {
  return res.status(200).json({ ok: true, action: "shorten", message: "Not implemented yet" });
}

async function handleGetShort(req: any, res: any, body: any) {
  return res.status(200).json({ ok: true, action: "getShort", message: "Not implemented yet" });
}

async function handleRecordClick(req: any, res: any, body: any) {
  return res.status(200).json({ ok: true, action: "recordClick", message: "Not implemented yet" });
}

async function handleGetStats(req: any, res: any, body: any) {
  return res.status(200).json({ ok: true, action: "getStats", message: "Not implemented yet" });
}

async function handleGetTopQR(req: any, res: any, body: any) {
  return res.status(200).json({ ok: true, action: "getTopQR", message: "Not implemented yet" });
}


function isFeatureEnabled(envName: string, defaultValue = false) {
  const raw = String(process.env[envName] ?? '').trim().toLowerCase();
  if (!raw) return defaultValue;
  return ['1', 'true', 'yes', 'on', 'enabled'].includes(raw);
}

function aiPausedResponse(res: any, action: string) {
  return res.status(403).json({
    ok: false,
    action,
    disabled: true,
    error: '此 AI 功能目前暫停開放，避免免費試用期間產生過高 API 費用。',
    message: '目前主推 LINE 貼圖工具與商品圖服務；此功能之後可由環境變數重新開啟。',
  });
}

async function handleHomework(req: any, res: any, body: any) {
  if (!isFeatureEnabled("HOMEWORK_ENABLED", false)) {
    return aiPausedResponse(res, "homework");
  }
  return res.status(200).json({ ok: true, action: "homework", message: "Not implemented yet" });
}

async function handleSummary(req: any, res: any, body: any) {
  if (!isFeatureEnabled("SUMMARY_ENABLED", false)) {
    return aiPausedResponse(res, "summary");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, lang = "zh-TW" } = body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "缺少內容" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "AI 服務未設定" });
    }

    const isChinese = lang === "zh-TW";

    const prompt = isChinese
      ? `請分析以下文章內容，並提供：

1. 摘要：用 200-300 字總結文章重點
2. 關鍵字：提取 5 個最重要的關鍵字，用逗號分隔

文章內容：
${content}

請用以下格式回覆：
摘要：[摘要內容]
關鍵字：[關鍵字1, 關鍵字2, 關鍵字3, 關鍵字4, 關鍵字5]`
      : `Please analyze the following article content and provide:

1. Summary: Summarize the key points in 200-300 words
2. Keywords: Extract 5 most important keywords, separated by commas

Article content:
${content}

Please reply in the following format:
Summary: [summary content]
Keywords: [keyword1, keyword2, keyword3, keyword4, keyword5]`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: isChinese
              ? "你是一個專業的文章摘要和關鍵字提取助手。"
              : "You are a professional article summarization and keyword extraction assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API 錯誤:", errorData);
      return res.status(500).json({ error: "AI 服務錯誤" });
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices?.[0]?.message?.content || "";

    let summary = "";
    let keywords: string[] = [];

    if (isChinese) {
      const summaryMatch = aiResponse.match(/摘要[：:]\s*(.+?)(?=關鍵字|$)/s);
      if (summaryMatch) {
        summary = summaryMatch[1].trim();
      } else {
        summary = aiResponse.split("\n\n")[0].trim();
      }

      const keywordsMatch = aiResponse.match(/關鍵字[：:]\s*\[(.+?)\]/);
      if (keywordsMatch) {
        keywords = keywordsMatch[1]
          .split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);
      } else {
        const keywordsLine = aiResponse.match(/關鍵字[：:]\s*(.+?)(?:\n|$)/);
        if (keywordsLine) {
          keywords = keywordsLine[1]
            .split(/[,，、]/)
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0)
            .slice(0, 5);
        }
      }
    } else {
      const summaryMatch = aiResponse.match(/Summary[：:]\s*(.+?)(?=Keywords|$)/is);
      if (summaryMatch) {
        summary = summaryMatch[1].trim();
      } else {
        summary = aiResponse.split("\n\n")[0].trim();
      }

      const keywordsMatch = aiResponse.match(/Keywords[：:]\s*\[(.+?)\]/i);
      if (keywordsMatch) {
        keywords = keywordsMatch[1]
          .split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);
      } else {
        const keywordsLine = aiResponse.match(/Keywords[：:]\s*(.+?)(?:\n|$)/i);
        if (keywordsLine) {
          keywords = keywordsLine[1]
            .split(",")
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0)
            .slice(0, 5);
        }
      }
    }

    if (keywords.length === 0) {
      const words = content
        .replace(/[^一-龥a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 1);
      keywords = words.slice(0, 5);
    }

    return res.status(200).json({
      summary: summary || "無法生成摘要",
      keywords: keywords || [],
    });
  } catch (err: any) {
    console.error("Summary API 錯誤:", err);
    return res.status(500).json({ error: err.message || "伺服器錯誤" });
  }
}

async function invokeInternalEdgeFunction(functionName: string, payload: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const deployedFunctionName = process.env.VERCEL_ENV === "preview"
    ? `${functionName}-phase2-preview`
    : process.env.VERCEL_ENV === "production"
      ? `${functionName}-phase2`
      : functionName;

  return fetch(
    `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${encodeURIComponent(deployedFunctionName)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

async function handleSecureSummary(req: any, res: any, body: any) {
  if (req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const sessionUser = await getUserFromAuthHeader(req);
  if (!sessionUser?.userId) {
    return jsonResponse(res, 401, { ok: false, error: "Invalid or expired token" });
  }

  const content = safeText(body?.content);
  if (!content) return jsonResponse(res, 400, { ok: false, error: "Missing content" });
  if (content.length > 20_000) {
    return jsonResponse(res, 400, { ok: false, error: "Content is too long" });
  }

  try {
    const response = await invokeInternalEdgeFunction("summary", {
      content,
      title: safeText(body?.title).slice(0, 100),
      lang: safeText(body?.lang || "zh-TW"),
      internalUserId: sessionUser.userId,
    });
    const data = await response.json().catch(() => ({}));
    return jsonResponse(res, response.status, data);
  } catch (error: any) {
    console.error("SECURE_SUMMARY_FAILED", error);
    return jsonResponse(res, 502, { ok: false, error: "Summary service unavailable" });
  }
}

async function handleSecureHomework(req: any, res: any, body: any) {
  if (req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const sessionUser = await getUserFromAuthHeader(req);
  if (!sessionUser?.userId) {
    return jsonResponse(res, 401, { ok: false, error: "Invalid or expired token" });
  }

  const prompt = safeText(body?.prompt);
  if (!prompt) return jsonResponse(res, 400, { ok: false, error: "Missing prompt" });
  if (prompt.length > 10_000) {
    return jsonResponse(res, 400, { ok: false, error: "Prompt is too long" });
  }

  try {
    const response = await invokeInternalEdgeFunction("homework-helper", {
      prompt,
      mode: safeText(body?.mode || "answer"),
      language: safeText(body?.language || "zh"),
      internalUserId: sessionUser.userId,
    });
    const data = await response.json().catch(() => ({}));
    return jsonResponse(res, response.status, data);
  } catch (error: any) {
    console.error("SECURE_HOMEWORK_FAILED", error);
    return jsonResponse(res, 502, { ok: false, error: "Homework service unavailable" });
  }
}

function parseShopeeProductIds(productUrl: string) {
  const url = String(productUrl || "").trim();
  const productMatch = url.match(/\/product\/(\d+)\/(\d+)/);
  if (productMatch) return { shopId: productMatch[1], itemId: productMatch[2] };

  const iMatch = url.match(/[?&]i\.(\d+)\.(\d+)/);
  if (iMatch) return { shopId: iMatch[1], itemId: iMatch[2] };

  const plainMatch = url.match(/i\.(\d+)\.(\d+)/);
  if (plainMatch) return { shopId: plainMatch[1], itemId: plainMatch[2] };

  return { shopId: "", itemId: "" };
}

function normalizeShopeeImageUrl(value: any) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw.split("?")[0];

  const cleaned = raw.replace(/^\/+/g, "");
  if (cleaned.includes("/file/")) return `https://${cleaned}`.split("?")[0];

  return `https://down-tw.img.susercontent.com/file/${cleaned}`.split("?")[0];
}

function pickShopeeImagesFromPayload(payload: any): string[] {
  const candidates = [
    payload?.data?.item?.images,
    payload?.data?.item?.tier_variations?.flatMap?.((x: any) => x?.images || []) || [],
    payload?.item?.images,
    payload?.item?.tier_variations?.flatMap?.((x: any) => x?.images || []) || [],
  ].flat();

  return [...new Set(candidates.map(normalizeShopeeImageUrl).filter(Boolean))].slice(0, 3);
}

async function fetchShopeeImagesByProductUrl(productUrl: string): Promise<string[]> {
  const { shopId, itemId } = parseShopeeProductIds(productUrl);
  if (!shopId || !itemId) return [];

  const apiUrl = `https://shopee.tw/api/v4/pdp/get_pc?shop_id=${encodeURIComponent(shopId)}&item_id=${encodeURIComponent(itemId)}&tz_offset_minutes=480&detail_level=0`;

  const headers = {
    "accept": "application/json,text/plain,*/*",
    "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
    "referer": productUrl,
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  };

  try {
    const res = await fetch(apiUrl, { headers });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      const images = pickShopeeImagesFromPayload(json);
      if (images.length) return images;
    }
  } catch (e) {
    console.warn("SHOPEE_IMAGE_API_FAILED", e);
  }

  try {
    const pageRes = await fetch(productUrl, { headers });
    const html = await pageRes.text();
    const ids = [...html.matchAll(/"images"\s*:\s*\[([^\]]+)\]/g)]
      .flatMap((m) => [...String(m[1]).matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    return [...new Set(ids.map(normalizeShopeeImageUrl).filter(Boolean))].slice(0, 3);
  } catch (e) {
    console.warn("SHOPEE_IMAGE_HTML_FALLBACK_FAILED", e);
    return [];
  }
}

async function handleShopeeImages(req: any, res: any, body: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const rawItems = Array.isArray(body?.items)
      ? body.items
      : body?.productUrl
        ? [{ index: 0, productUrl: body.productUrl }]
        : [];

    const items = rawItems
      .map((item: any, fallbackIndex: number) => ({
        index: Number.isFinite(Number(item?.index)) ? Number(item.index) : fallbackIndex,
        productUrl: String(item?.productUrl || item?.url || "").trim(),
      }))
      .filter((item: any) => item.productUrl)
      .slice(0, 50);

    const results = [];
    for (const item of items) {
      const images = await fetchShopeeImagesByProductUrl(item.productUrl);
      results.push({
        index: item.index,
        productUrl: item.productUrl,
        ok: images.length > 0,
        images,
        error: images.length ? "" : "NO_IMAGES_FOUND",
      });
    }

    return res.status(200).json({
      ok: true,
      action: "shopee",
      mode: "images",
      count: results.length,
      results,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "SHOPEE_IMAGES_FAILED",
      message: e?.message || "UNKNOWN_ERROR",
    });
  }
}

async function handleShopee(req: any, res: any, body: any) {
  const mode = String(body?.mode || req?.query?.mode || "").toLowerCase();
  if (mode === "images" || mode === "image" || mode === "autoimages") {
    return handleShopeeImages(req, res, body);
  }
  return res.status(400).json({
    ok: false,
    error: "SHOPEE_MODE_INVALID",
    message: "Use action=shopee with mode=images",
  });
}

async function handleShopeeImportCsv(req: any, res: any, body: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  try {
    ensureDir(SHOPEE_JOBS_DIR);
    const csvText = typeof body?.csvText === "string" ? body.csvText : typeof body?.csv === "string" ? body.csv : "";
    if (!csvText.trim()) {
      return res.status(400).json({ ok: false, error: "CSV_MISSING", message: "請提供 csvText" });
    }
    const jobId = makeJobId();
    const jobDir = shopeeJobDir(jobId);
    ensureDir(jobDir);
    const csvPath = path.join(jobDir, "input.csv");
    fs.writeFileSync(csvPath, csvText, "utf-8");
    const rows = parseCsvText(csvText);
    const jobJson = {
      jobId,
      createdAt: new Date().toISOString(),
      csvPath,
      count: rows.length,
      status: "imported",
      renderServer: RENDER_SERVER_URL,
      items: rows.map((row, index) => ({
        itemId: String(index + 1).padStart(3, "0"),
        row,
        status: "pending",
      })),
    };
    writeJson(shopeeJobMetaPath(jobId), jobJson);
    return res.status(200).json({ ok: true, action: "shopeeimportcsv", jobId, count: rows.length, jobPath: jobDir });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "SHOPEE_IMPORT_FAILED", message: e?.message || "UNKNOWN_ERROR" });
  }
}

async function handleShopeeLoginOpen(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  try {
    ensureDir(SHOPEE_PROFILE_DIR);
    return res.status(200).json({
      ok: true,
      action: "shopeeloginopen",
      message: "請使用本地 persistent login 腳本開啟蝦皮登入視窗",
      profileDir: SHOPEE_PROFILE_DIR,
      note: "本 action 先提供流程與狀態，實際登入視窗建議由本地 server / script 執行。",
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "SHOPEE_LOGIN_OPEN_FAILED", message: e?.message || "UNKNOWN_ERROR" });
  }
}

async function handleShopeeLoginStatus(_req: any, res: any) {
  try {
    const exists = fs.existsSync(SHOPEE_PROFILE_DIR);
    const files = exists ? fs.readdirSync(SHOPEE_PROFILE_DIR) : [];
    const hasProfile = files.length > 0;
    return res.status(200).json({ ok: true, action: "shopeeloginstatus", loggedIn: hasProfile, profileDir: SHOPEE_PROFILE_DIR });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "SHOPEE_LOGIN_STATUS_FAILED", message: e?.message || "UNKNOWN_ERROR" });
  }
}

async function handleShopeePrepare(req: any, res: any, body: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  try {
    const jobId = String(body?.jobId || "").trim();
    if (!jobId) return res.status(400).json({ ok: false, error: "JOB_ID_MISSING" });
    const jobPath = shopeeJobMetaPath(jobId);
    const job = readJson(jobPath, null);
    if (!job?.csvPath) return res.status(404).json({ ok: false, error: "JOB_NOT_FOUND" });
    const limit = resolveLimit(body, job, 5);
    const run = await runNodeScript("scripts/shopee_batch_mp4.mjs", [job.csvPath, String(limit)], process.cwd(), {
      RXV_VIDEO_SERVER: RENDER_SERVER_URL,
      RXV_USE_TEMPLATE_FALLBACK: String(body?.useTemplateFallback ?? process.env.RXV_USE_TEMPLATE_FALLBACK ?? "1"),
    });
    const nextJob = {
      ...job,
      status: run.ok ? "prepared" : "prepare_failed",
      prepareLog: run.stdout,
      prepareError: run.stderr,
      prepareLimit: limit,
      preparedAt: new Date().toISOString(),
    };
    writeJson(jobPath, nextJob);
    return res.status(run.ok ? 200 : 500).json({ ok: run.ok, action: "shoeeeprepare", jobId, limit, log: run.stdout, error: run.stderr });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "SHOPEE_PREPARE_FAILED", message: e?.message || "UNKNOWN_ERROR" });
  }
}

async function handleShopeeRender(req: any, res: any, body: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  try {
    const jobId = String(body?.jobId || "").trim();
    if (!jobId) return res.status(400).json({ ok: false, error: "JOB_ID_MISSING" });
    const jobPath = shopeeJobMetaPath(jobId);
    const job = readJson(jobPath, null);
    if (!job?.csvPath) return res.status(404).json({ ok: false, error: "JOB_NOT_FOUND" });
    const limit = resolveLimit(body, job, 5);
    const run = await runNodeScript("scripts/shopee_batch_mp4.mjs", [job.csvPath, String(limit)], process.cwd(), {
      RXV_VIDEO_SERVER: RENDER_SERVER_URL,
      RXV_USE_TEMPLATE_FALLBACK: String(body?.useTemplateFallback ?? process.env.RXV_USE_TEMPLATE_FALLBACK ?? "1"),
    });
    const nextJob = {
      ...job,
      status: run.ok ? "rendered" : "render_failed",
      renderLog: run.stdout,
      renderError: run.stderr,
      renderLimit: limit,
      renderedAt: new Date().toISOString(),
    };
    writeJson(jobPath, nextJob);
    return res.status(run.ok ? 200 : 500).json({ ok: run.ok, action: "shoeeerender", jobId, limit, log: run.stdout, error: run.stderr });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "SHOPEE_RENDER_FAILED", message: e?.message || "UNKNOWN_ERROR" });
  }
}


// =========================================================
// 銀行轉帳人工對帳／商品展示頁人工開通
// - 客戶端只能透過自建 session 建立匯款回報。
// - 後台操作以 RXV_ADMIN_EMAILS 環境變數限制。
// - 點數與商品展示頁資格由資料庫 RPC 在同一交易中完成。
// =========================================================

type BankTransferPlanId = '99' | '199' | 'relationship_pro' | 'relationship_business';

type BankTransferPlan = {
  id: BankTransferPlanId;
  amount: number;
  points: number;
  maxItems: number;
  grantedMonths: number;
  durationDays?: number;
  productType: 'product_image' | 'relationship_ai';
  displayName: string;
};

const BANK_TRANSFER_PLANS: Record<BankTransferPlanId, BankTransferPlan> = {
  '99': { id: '99', amount: 99, points: 100000, maxItems: 3, grantedMonths: 3, productType: 'product_image', displayName: '商品圖點數方案' },
  '199': { id: '199', amount: 199, points: 300000, maxItems: 9, grantedMonths: 6, productType: 'product_image', displayName: '商品圖點數方案' },
  relationship_pro: { id: 'relationship_pro', amount: 99, points: 0, maxItems: 0, grantedMonths: 0, durationDays: 30, productType: 'relationship_ai', displayName: 'AI 回覆軍師 Pro' },
  relationship_business: { id: 'relationship_business', amount: 299, points: 0, maxItems: 0, grantedMonths: 0, durationDays: 30, productType: 'relationship_ai', displayName: 'AI 回覆軍師 Business Pro' },
};

function getBankTransferSettings() {
  const bankName = safeText(process.env.RXV_BANK_NAME);
  const bankCode = safeText(process.env.RXV_BANK_CODE);
  const bankBranch = safeText(process.env.RXV_BANK_BRANCH);
  const bankAccount = safeText(process.env.RXV_BANK_ACCOUNT);
  const accountName = safeText(process.env.RXV_BANK_ACCOUNT_NAME);

  const missing = [
    !bankName ? 'RXV_BANK_NAME' : '',
    !bankCode ? 'RXV_BANK_CODE' : '',
    !bankAccount ? 'RXV_BANK_ACCOUNT' : '',
    !accountName ? 'RXV_BANK_ACCOUNT_NAME' : '',
  ].filter(Boolean);

  return {
    enabled: missing.length === 0,
    missing,
    bankName,
    bankCode,
    bankBranch,
    bankAccount,
    accountName,
  };
}

async function getCurrentSessionUserProfile(req: any) {
  const sessionUser = await getUserFromAuthHeader(req);
  if (!sessionUser?.userId) {
    const error: any = new Error('登入已失效，請重新登入。');
    error.statusCode = 401;
    throw error;
  }

  const response = await supabaseRest(
    `users?select=id,email&id=eq.${encodeURIComponent(sessionUser.userId)}&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error: any = new Error(`讀取帳號資料失敗：${text || response.status}`);
    error.statusCode = 500;
    throw error;
  }

  const rows = await response.json().catch(() => []);
  const user = Array.isArray(rows) ? rows[0] : null;
  if (!user?.id || !normalizeEmail(user?.email)) {
    const error: any = new Error('找不到目前登入帳號的 Email，請重新登入後再試。');
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: String(user.id),
    email: normalizeEmail(user.email),
  };
}

function getConfiguredAdminEmails() {
  return new Set(
    safeText(process.env.RXV_ADMIN_EMAILS)
      .split(',')
      .map((value) => normalizeEmail(value))
      .filter(Boolean),
  );
}

async function requireManualPaymentAdmin(req: any) {
  const user = await getCurrentSessionUserProfile(req);
  const adminEmails = getConfiguredAdminEmails();

  if (adminEmails.size === 0) {
    const error: any = new Error('尚未設定管理者 Email。請先在 Vercel 環境變數設定 RXV_ADMIN_EMAILS。');
    error.statusCode = 503;
    throw error;
  }

  if (!adminEmails.has(user.email)) {
    const error: any = new Error('無權限存取付款管理後台。');
    error.statusCode = 403;
    throw error;
  }

  return user;
}

function readBankTransferPlan(value: any): BankTransferPlan {
  const id = safeText(value) as BankTransferPlanId;
  const plan = BANK_TRANSFER_PLANS[id];
  if (!plan) {
    const error: any = new Error('付款方案不正確。');
    error.statusCode = 400;
    throw error;
  }
  return plan;
}

function getTaipeiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function getDateKeyDaysBefore(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split('-').map((value) => Number(value));
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function parseTaipeiTransferDate(value: any) {
  const raw = safeText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const error: any = new Error('請填寫正確的匯款日期。');
    error.statusCode = 400;
    throw error;
  }

  const today = getTaipeiDateKey();
  const earliest = getDateKeyDaysBefore(today, 31);
  if (raw < earliest || raw > today) {
    const error: any = new Error('請確認匯款日期是否正確。');
    error.statusCode = 400;
    throw error;
  }

  // 資料表欄位是 timestamptz，因此固定以台灣中午儲存，
  // 後台只顯示日期，客戶不需要填寫匯款時間。
  const date = new Date(`${raw}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) {
    const error: any = new Error('匯款日期格式不正確。');
    error.statusCode = 400;
    throw error;
  }

  return date.toISOString();
}


const IMAGE_BUNDLE_PRODUCT = {
  code: 'image-bundle-full',
  productName: '1500+ 高畫質圖片素材庫完整版',
  displayName: '1,583+ 高畫質圖片素材庫完整版',
  amountNtd: 399,
} as const;

// ---------------------------------------------------------------------------
// NT$399 圖片素材庫販售：R2-only 儲存
//
// 重要：所有 API 仍留在 api/main.ts 的 action router 裡，不新增 Vercel Function。
// 訂單、待審核 Email 索引、下載 token 索引、目前 ZIP metadata 全部放 R2 private key。
// ---------------------------------------------------------------------------
const IMAGE_BUNDLE_SALES_PREFIX = 'private/image-bundle-sales';
const IMAGE_BUNDLE_ORDERS_PREFIX = `${IMAGE_BUNDLE_SALES_PREFIX}/orders/`;
const IMAGE_BUNDLE_PENDING_EMAIL_PREFIX = `${IMAGE_BUNDLE_SALES_PREFIX}/pending-emails/`;
const IMAGE_BUNDLE_DOWNLOAD_TOKEN_PREFIX = `${IMAGE_BUNDLE_SALES_PREFIX}/download-tokens/`;
const IMAGE_BUNDLE_CURRENT_FILE_KEY = `${IMAGE_BUNDLE_SALES_PREFIX}/current-bundle.json`;
const IMAGE_BUNDLE_DOWNLOAD_TTL_DAYS = Math.max(1, Number(process.env.RXV_IMAGE_BUNDLE_DOWNLOAD_TTL_DAYS || 7) || 7);
const IMAGE_BUNDLE_DOWNLOAD_LIMIT = Math.max(1, Number(process.env.RXV_IMAGE_BUNDLE_DOWNLOAD_LIMIT || 3) || 3);

type R2DigitalProductOrder = {
  id: string;
  order_no: string;
  product_code: string;
  product_name: string;
  email: string;
  amount_ntd: number;
  account_last_five: string;
  transfer_date: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string | null;
  created_at: string;
  processed_at?: string | null;
  processed_by?: string | null;
  review_note?: string | null;
  download_token?: string | null;
  download_expires_at?: string | null;
  download_count: number;
  download_limit: number;
  last_download_at?: string | null;
  bundle_file_id?: string | null;
  proof_key?: string | null;
  proof_file_name?: string | null;
  proof_content_type?: string | null;
  proof_size_bytes?: number | null;
};

type DigitalProductBundleFile = {
  id: string;
  product_code: string;
  version: string;
  object_key: string;
  file_name: string;
  size_bytes: number;
  content_type: string;
  status: string;
  uploaded_at: string;
  uploaded_by?: string | null;
};

type PendingEmailIndex = {
  email: string;
  order_id: string;
  order_no: string;
  created_at: string;
};

type DownloadTokenIndex = {
  token: string;
  order_id: string;
  created_at: string;
};

function imageBundleOrderKey(orderId: string) {
  return `${IMAGE_BUNDLE_ORDERS_PREFIX}${orderId}.json`;
}

function imageBundlePendingEmailKey(email: string) {
  const hash = crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex');
  return `${IMAGE_BUNDLE_PENDING_EMAIL_PREFIX}${hash}.json`;
}

function imageBundleDownloadTokenKey(token: string) {
  return `${IMAGE_BUNDLE_DOWNLOAD_TOKEN_PREFIX}${token}.json`;
}

function imageBundleOrderNo() {
  const date = getTaipeiDateKey().replace(/-/g, '');
  return `IMG${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

const IMAGE_BUNDLE_PROOF_MAX_BYTES = 8 * 1024 * 1024;

function imageBundleProofKey(proofId: string, extension: string) {
  const now = new Date();
  return `payment-proofs/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${proofId}.${extension}`;
}

function readPaymentProofPayload(body: any) {
  const fileName = safeText(body?.fileName || body?.file_name).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 180);
  const contentType = safeText(body?.contentType || body?.content_type).toLowerCase().replace('image/jpg', 'image/jpeg');
  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : '';
  const sizeBytes = Number(body?.sizeBytes || body?.size_bytes || 0);
  if (!fileName || !extension) throw new Error('PAYMENT_PROOF_UNSUPPORTED_FORMAT');
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > IMAGE_BUNDLE_PROOF_MAX_BYTES) throw new Error('PAYMENT_PROOF_SIZE_INVALID');
  return { fileName, contentType, extension, sizeBytes };
}

function isImageBundleProofKey(value: string) {
  return /^payment-proofs\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(value);
}

async function handleCreateImageBundleProofUploadUrl(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    if (safeText(body?.product || body?.productCode || body?.product_code) !== IMAGE_BUNDLE_PRODUCT.code) {
      return jsonResponse(res, 400, { ok: false, error: 'PAYMENT_PROOF_PRODUCT_INVALID' });
    }
    const proof = readPaymentProofPayload(body);
    const proofKey = imageBundleProofKey(crypto.randomUUID(), proof.extension);
    const uploadUrl = await getSignedUrl(getR2Client(), new PutObjectCommand({
      Bucket: R2_BUCKET_NAME, Key: proofKey, ContentType: proof.contentType, ContentLength: proof.sizeBytes, CacheControl: 'private, no-store',
    }), { expiresIn: 10 * 60 });
    return jsonResponse(res, 200, { ok: true, storage: 'r2', proofKey, uploadUrl, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  } catch (error: any) {
    return jsonResponse(res, 400, { ok: false, error: safeText(error?.message || 'PAYMENT_PROOF_UPLOAD_URL_FAILED') });
  }
}

async function handleAdminGetImageBundleProofUrl(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    const order = await readR2DigitalProductOrder(orderId);
    const proofKey = safeText(order?.proof_key);
    if (!order || !isImageBundleProofKey(proofKey)) return jsonResponse(res, 404, { ok: false, error: 'PAYMENT_PROOF_NOT_FOUND' });
    const signedUrl = await getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: proofKey }), { expiresIn: 10 * 60 });
    return jsonResponse(res, 200, { ok: true, signedUrl, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: safeText(error?.message || 'PAYMENT_PROOF_SIGN_FAILED') });
  }
}

function isR2NotFound(error: any) {
  const status = Number(error?.$metadata?.httpStatusCode || 0);
  const code = safeText(error?.name || error?.Code || error?.code);
  return status === 404 || /NoSuchKey|NotFound|NoSuchBucket/i.test(code);
}

function isR2PreconditionFailed(error: any) {
  const status = Number(error?.$metadata?.httpStatusCode || 0);
  const code = safeText(error?.name || error?.Code || error?.code);
  return status === 412 || /PreconditionFailed/i.test(code);
}

async function readR2PrivateJson<T = any>(key: string): Promise<T | null> {
  try {
    const object = await getR2Client().send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    if (!object.Body) return null;
    const raw = await r2BodyToText(object.Body);
    return JSON.parse(raw) as T;
  } catch (error: any) {
    if (isR2NotFound(error)) return null;
    throw error;
  }
}

async function writeR2PrivateJson(
  key: string,
  value: any,
  options: { ifNoneMatch?: boolean } = {},
) {
  await getR2Client().send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(JSON.stringify(value, null, 2), 'utf8'),
    ContentType: 'application/json; charset=utf-8',
    CacheControl: 'private, no-store',
    ...(options.ifNoneMatch ? { IfNoneMatch: '*' } : {}),
  }));
}

async function deleteR2PrivateObject(key: string) {
  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  } catch (error: any) {
    if (!isR2NotFound(error)) throw error;
  }
}

async function listR2PrivateKeys(prefix: string) {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const result = await getR2Client().send(new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    }));
    for (const item of result.Contents || []) {
      const key = safeText(item.Key);
      if (key) keys.push(key);
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

async function readR2DigitalProductOrder(orderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  return readR2PrivateJson<R2DigitalProductOrder>(imageBundleOrderKey(orderId));
}

async function writeR2DigitalProductOrder(order: R2DigitalProductOrder) {
  await writeR2PrivateJson(imageBundleOrderKey(order.id), order);
  return order;
}

async function listR2DigitalProductOrders() {
  const keys = (await listR2PrivateKeys(IMAGE_BUNDLE_ORDERS_PREFIX)).filter((key) => key.endsWith('.json'));
  const orders: R2DigitalProductOrder[] = [];
  const concurrency = 20;
  for (let i = 0; i < keys.length; i += concurrency) {
    const batch = keys.slice(i, i + concurrency);
    const rows = await Promise.all(batch.map((key) => readR2PrivateJson<R2DigitalProductOrder>(key).catch(() => null)));
    for (const row of rows) {
      if (row?.id && row.product_code === IMAGE_BUNDLE_PRODUCT.code) orders.push(row);
    }
  }
  return orders.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

async function findPendingR2OrderByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const indexKey = imageBundlePendingEmailKey(normalized);
  const index = await readR2PrivateJson<PendingEmailIndex>(indexKey);
  if (!index?.order_id) return null;

  const order = await readR2DigitalProductOrder(index.order_id);
  if (order?.status === 'pending' && normalizeEmail(order.email) === normalized) return order;

  // 清理中斷流程留下的 stale index。
  await deleteR2PrivateObject(indexKey).catch(() => undefined);
  return null;
}

async function releasePendingEmailIndex(order: R2DigitalProductOrder) {
  const key = imageBundlePendingEmailKey(order.email);
  const current = await readR2PrivateJson<PendingEmailIndex>(key).catch(() => null);
  if (!current || current.order_id === order.id) {
    await deleteR2PrivateObject(key).catch(() => undefined);
  }
}

async function requireImageBundleAdmin(req: any) {
  if (!RXV_IMAGE_BUNDLE_ADMIN_KEY) {
    const error: any = new Error('RXV_IMAGE_BUNDLE_ADMIN_KEY_MISSING');
    error.statusCode = 503;
    throw error;
  }

  const provided = safeText(
    getRequestHeader(req, 'x-rxv-image-bundle-admin-key') ||
    getRequestHeader(req, 'x-rxv-image-admin-key'),
  );

  if (!provided) {
    const error: any = new Error('請輸入圖片素材庫管理金鑰。');
    error.statusCode = 401;
    throw error;
  }
  if (!secureEqualText(provided, RXV_IMAGE_BUNDLE_ADMIN_KEY)) {
    const error: any = new Error('圖片素材庫管理金鑰不正確。');
    error.statusCode = 403;
    throw error;
  }

  return { userId: 'r2-image-bundle-admin', email: 'r2-image-bundle-admin' };
}

async function handleGetImageBundleBankTransferInfo(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const settings = getBankTransferSettings();
    if (!settings.enabled) {
      return jsonResponse(res, 503, { ok: false, error: '銀行轉帳尚未開放，請稍後再試。' });
    }

    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      bank: {
        name: settings.bankName,
        code: settings.bankCode,
        branch: settings.bankBranch,
        account: settings.bankAccount,
        accountName: settings.accountName,
      },
      product: {
        code: IMAGE_BUNDLE_PRODUCT.code,
        displayName: IMAGE_BUNDLE_PRODUCT.displayName,
        amountNtd: IMAGE_BUNDLE_PRODUCT.amountNtd,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, 500, { ok: false, error: error?.message || '讀取圖片素材庫匯款資訊失敗。' });
  }
}

async function handleCreateDigitalProductOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  let claimedPendingIndexKey = '';
  try {
    const settings = getBankTransferSettings();
    if (!settings.enabled) {
      return jsonResponse(res, 503, { ok: false, error: '銀行轉帳尚未開放。' });
    }

    const productCode = safeText(body?.productCode || body?.product_code);
    if (productCode !== IMAGE_BUNDLE_PRODUCT.code) {
      return jsonResponse(res, 400, { ok: false, error: '商品代碼不正確。' });
    }

    const email = normalizeEmail(body?.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(res, 400, { ok: false, error: '請輸入正確的 Email。' });
    }

    const accountLastFive = safeText(body?.accountLastFive || body?.account_last_five);
    if (!/^\d{5}$/.test(accountLastFive)) {
      return jsonResponse(res, 400, { ok: false, error: '請輸入匯出帳號後五碼（5 位數字）。' });
    }

    const transferDate = safeText(body?.transferDate || body?.transfer_date);
    const transferDateIso = parseTaipeiTransferDate(transferDate);
    const note = safeText(body?.note).slice(0, 500) || null;
    const proofKey = safeText(body?.payment_proof_object_key || body?.proofKey || body?.proof_key);
    const proofFileName = safeText(body?.payment_proof_file_name || body?.proofFileName || body?.proof_file_name).slice(0, 180);
    let proofContentType: string | null = null;
    let proofSize: number | null = null;
    if (proofKey) {
      if (!isImageBundleProofKey(proofKey)) return jsonResponse(res, 400, { ok: false, error: 'PAYMENT_PROOF_KEY_INVALID' });
      const proofHead = await getR2Client().send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: proofKey }));
      proofSize = Number(proofHead.ContentLength || 0);
      proofContentType = safeText(proofHead.ContentType).toLowerCase().replace('image/jpg', 'image/jpeg');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(proofContentType) || proofSize <= 0 || proofSize > IMAGE_BUNDLE_PROOF_MAX_BYTES) {
        return jsonResponse(res, 400, { ok: false, error: 'PAYMENT_PROOF_OBJECT_INVALID' });
      }
    }

    const existingPending = await findPendingR2OrderByEmail(email);
    if (existingPending) {
      return jsonResponse(res, 409, {
        ok: false,
        error: `這個 Email 已有待核對的素材庫匯款回報（${existingPending.order_no || '待處理'}），請勿重複送出。`,
      });
    }

    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const order: R2DigitalProductOrder = {
      id: orderId,
      order_no: imageBundleOrderNo(),
      product_code: IMAGE_BUNDLE_PRODUCT.code,
      product_name: IMAGE_BUNDLE_PRODUCT.productName,
      email,
      amount_ntd: IMAGE_BUNDLE_PRODUCT.amountNtd,
      account_last_five: accountLastFive,
      transfer_date: transferDateIso,
      status: 'pending',
      note,
      created_at: now,
      processed_at: null,
      processed_by: null,
      review_note: null,
      download_token: null,
      download_expires_at: null,
      download_count: 0,
      download_limit: IMAGE_BUNDLE_DOWNLOAD_LIMIT,
      last_download_at: null,
      bundle_file_id: null,
      proof_key: proofKey || null,
      proof_file_name: proofFileName || null,
      proof_content_type: proofContentType,
      proof_size_bytes: proofSize,
    };

    // Email pending index 使用 If-None-Match:* 當成輕量鎖，避免快速重複送出。
    claimedPendingIndexKey = imageBundlePendingEmailKey(email);
    try {
      await writeR2PrivateJson(
        claimedPendingIndexKey,
        { email, order_id: order.id, order_no: order.order_no, created_at: now } satisfies PendingEmailIndex,
        { ifNoneMatch: true },
      );
    } catch (error: any) {
      if (isR2PreconditionFailed(error)) {
        const pending = await findPendingR2OrderByEmail(email);
        return jsonResponse(res, 409, {
          ok: false,
          error: `這個 Email 已有待核對的素材庫匯款回報（${pending?.order_no || '待處理'}），請勿重複送出。`,
        });
      }
      throw error;
    }

    await writeR2DigitalProductOrder(order);

    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      order: {
        id: order.id,
        orderNo: order.order_no,
        status: order.status,
      },
    });
  } catch (error: any) {
    if (claimedPendingIndexKey) await deleteR2PrivateObject(claimedPendingIndexKey).catch(() => undefined);
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '建立圖片素材庫匯款回報失敗。',
    });
  }
}

async function handleAdminListDigitalProductOrders(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const orders = await listR2DigitalProductOrders();
    return jsonResponse(res, 200, { ok: true, storage: 'r2', orders });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取圖片素材庫訂單失敗。' });
  }
}

async function handleAdminApproveDigitalProductOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireImageBundleAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return jsonResponse(res, 400, { ok: false, error: '素材庫訂單編號不正確。' });

    const order = await readR2DigitalProductOrder(orderId);
    if (!order) return jsonResponse(res, 404, { ok: false, error: '找不到此素材庫訂單。' });
    if (order.status === 'approved') {
      // 核准流程採可重試設計：若上次在寫入 token index 前中斷，重按核准可自動補齊。
      if (safeText(order.download_token)) {
        const token = String(order.download_token);
        const tokenKey = imageBundleDownloadTokenKey(token);
        const existingTokenIndex = await readR2PrivateJson<DownloadTokenIndex>(tokenKey).catch(() => null);
        if (!existingTokenIndex?.order_id) {
          await writeR2PrivateJson(tokenKey, {
            token,
            order_id: order.id,
            created_at: order.processed_at || new Date().toISOString(),
          } satisfies DownloadTokenIndex);
        }
      }
      await releasePendingEmailIndex(order);
      return jsonResponse(res, 200, {
        ok: true,
        result: {
          order_id: order.id,
          order_no: order.order_no,
          status: order.status,
          download_expires_at: order.download_expires_at,
        },
      });
    }
    if (order.status !== 'pending') return jsonResponse(res, 409, { ok: false, error: '此訂單已處理，無法再次核准。' });

    const token = crypto.randomBytes(32).toString('hex');
    const processedAt = new Date();
    const expiresAt = new Date(processedAt.getTime() + IMAGE_BUNDLE_DOWNLOAD_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const approved: R2DigitalProductOrder = {
      ...order,
      status: 'approved',
      processed_at: processedAt.toISOString(),
      processed_by: admin.userId,
      review_note: null,
      download_token: token,
      download_expires_at: expiresAt,
      download_count: 0,
      download_limit: IMAGE_BUNDLE_DOWNLOAD_LIMIT,
    };

    await writeR2DigitalProductOrder(approved);
    await writeR2PrivateJson(imageBundleDownloadTokenKey(token), {
      token,
      order_id: approved.id,
      created_at: processedAt.toISOString(),
    } satisfies DownloadTokenIndex);
    await releasePendingEmailIndex(approved);

    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      result: {
        order_id: approved.id,
        order_no: approved.order_no,
        status: approved.status,
        download_expires_at: approved.download_expires_at,
        download_limit: approved.download_limit,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '確認素材庫收款失敗。' });
  }
}

async function handleAdminRejectDigitalProductOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireImageBundleAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    const reviewNote = safeText(body?.reviewNote || body?.review_note).slice(0, 500) || null;
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return jsonResponse(res, 400, { ok: false, error: '素材庫訂單編號不正確。' });

    const order = await readR2DigitalProductOrder(orderId);
    if (!order) return jsonResponse(res, 404, { ok: false, error: '找不到此素材庫訂單。' });
    if (order.status !== 'pending') return jsonResponse(res, 409, { ok: false, error: '此訂單已處理，無法再次拒絕。' });

    const rejected: R2DigitalProductOrder = {
      ...order,
      status: 'rejected',
      processed_at: new Date().toISOString(),
      processed_by: admin.userId,
      review_note: reviewNote,
      download_token: null,
      download_expires_at: null,
    };
    await writeR2DigitalProductOrder(rejected);
    await releasePendingEmailIndex(rejected);

    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      result: { order_id: rejected.id, order_no: rejected.order_no, status: rejected.status },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '拒絕素材庫匯款回報失敗。' });
  }
}

async function getCurrentDigitalProductBundleFile() {
  const bundle = await readR2PrivateJson<DigitalProductBundleFile>(IMAGE_BUNDLE_CURRENT_FILE_KEY);
  if (bundle && bundle.product_code === IMAGE_BUNDLE_PRODUCT.code && bundle.status === 'active') return bundle;

  // 舊版 ZIP 早已放在 R2、但 metadata 原本只存 Supabase。
  // 第一次切換到 R2-only 時自動尋找 private/image-bundles/ 最新 ZIP，避免要求重新上傳大檔。
  const prefix = 'private/image-bundles/';
  let continuationToken: string | undefined;
  const candidates: Array<{ key: string; size: number; lastModified: Date }> = [];
  do {
    const result = await getR2Client().send(new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    }));
    for (const item of result.Contents || []) {
      const key = safeText(item.Key);
      if (!key || !isPrivateImageBundleKey(key)) continue;
      candidates.push({
        key,
        size: Math.max(0, Number(item.Size || 0) || 0),
        lastModified: item.LastModified instanceof Date ? item.LastModified : new Date(0),
      });
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);

  candidates.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  const latest = candidates[0];
  if (!latest?.key) return null;

  const migratedAt = (latest.lastModified.getTime() > 0 ? latest.lastModified : new Date()).toISOString();
  const migrated: DigitalProductBundleFile = {
    id: crypto.randomUUID(),
    product_code: IMAGE_BUNDLE_PRODUCT.code,
    version: `v${migratedAt.slice(0, 10).replace(/-/g, '')}`,
    object_key: latest.key,
    file_name: 'RxV-1583張高畫質圖片素材庫.zip',
    size_bytes: latest.size,
    content_type: 'application/zip',
    status: 'active',
    uploaded_at: migratedAt,
    uploaded_by: 'r2-auto-migration',
  };
  await writeR2PrivateJson(IMAGE_BUNDLE_CURRENT_FILE_KEY, migrated);
  return migrated;
}

async function getDigitalProductOrderCounts() {
  const orders = await listR2DigitalProductOrders();
  return {
    pendingCount: orders.filter((row) => row.status === 'pending').length,
    approvedCount: orders.filter((row) => row.status === 'approved').length,
  };
}

async function handleAdminGetDigitalProductBundleSummary(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const [bundleFile, counts] = await Promise.all([getCurrentDigitalProductBundleFile(), getDigitalProductOrderCounts()]);
    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      bundleFile: bundleFile ? {
        id: bundleFile.id,
        version: bundleFile.version,
        fileName: bundleFile.file_name,
        sizeBytes: Number(bundleFile.size_bytes || 0),
        contentType: bundleFile.content_type,
        status: bundleFile.status,
        uploadedAt: bundleFile.uploaded_at,
      } : null,
      pendingPaymentCount: counts.pendingCount,
      pendingDeliveryCount: bundleFile ? 0 : counts.approvedCount,
      approvedCount: counts.approvedCount,
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取素材庫交付狀態失敗。' });
  }
}

async function handleAdminCreateDigitalProductBundleUpload(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const requestedName = safeText(body?.fileName || body?.file_name).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
    if (!requestedName.toLowerCase().endsWith('.zip')) {
      return jsonResponse(res, 400, { ok: false, error: '交付檔必須是 ZIP 檔。' });
    }
    const objectKey = makePrivateImageBundleKey(requestedName);
    const uploadUrl = await getSignedUrl(getR2Client(), new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: 'application/zip',
      CacheControl: 'private, no-store',
    }), { expiresIn: 15 * 60 });
    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      objectKey,
      fileName: requestedName,
      uploadUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '建立私有 ZIP 上傳權限失敗。' });
  }
}

async function handleAdminCompleteDigitalProductBundleUpload(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireImageBundleAdmin(req);
    const objectKey = safeText(body?.objectKey || body?.object_key);
    const fileName = safeText(body?.fileName || body?.file_name).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
    if (!isPrivateImageBundleKey(objectKey) || !fileName.toLowerCase().endsWith('.zip')) {
      return jsonResponse(res, 400, { ok: false, error: '素材庫交付檔資訊不正確。' });
    }
    const head = await getR2Client().send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: objectKey }));
    const sizeBytes = Number(head.ContentLength || 0);
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) throw new Error('DIGITAL_PRODUCT_BUNDLE_FILE_EMPTY');

    const uploadedAt = new Date().toISOString();
    const bundleFile: DigitalProductBundleFile = {
      id: crypto.randomUUID(),
      product_code: IMAGE_BUNDLE_PRODUCT.code,
      version: `v${uploadedAt.slice(0, 10).replace(/-/g, '')}`,
      object_key: objectKey,
      file_name: fileName,
      size_bytes: sizeBytes,
      content_type: 'application/zip',
      status: 'active',
      uploaded_at: uploadedAt,
      uploaded_by: admin.userId,
    };
    await writeR2PrivateJson(IMAGE_BUNDLE_CURRENT_FILE_KEY, bundleFile);

    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      bundleFile: {
        id: bundleFile.id,
        version: bundleFile.version,
        fileName: bundleFile.file_name,
        sizeBytes: bundleFile.size_bytes,
        uploadedAt: bundleFile.uploaded_at,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '完成素材庫 ZIP 上傳失敗。' });
  }
}

async function handleAdminDeleteDigitalProductBundle(req: any, res: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const bundleFile = await getCurrentDigitalProductBundleFile();
    if (!bundleFile) return jsonResponse(res, 404, { ok: false, error: '目前沒有可刪除的圖片素材庫 ZIP 檔。' });
    if (!isPrivateImageBundleKey(bundleFile.object_key)) {
      const error: any = new Error('DIGITAL_PRODUCT_BUNDLE_KEY_REJECTED');
      error.statusCode = 400;
      throw error;
    }

    const r2 = getR2Client();
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: bundleFile.object_key }));
    await deleteR2PrivateObject(IMAGE_BUNDLE_CURRENT_FILE_KEY);
    return jsonResponse(res, 200, { ok: true, storage: 'r2' });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '刪除圖片素材庫 ZIP 失敗。' });
  }
}


async function handleAdminDeleteDigitalProductTestOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
      return jsonResponse(res, 400, { ok: false, error: '素材庫測試訂單編號不正確。' });
    }

    const order = await readR2DigitalProductOrder(orderId);
    if (!order) return jsonResponse(res, 404, { ok: false, error: '找不到此素材庫測試訂單。' });
    if (order.status !== 'pending' || !/CODEX DELIVERY E2E TEST/i.test(String(order.note || ''))) {
      return jsonResponse(res, 403, { ok: false, error: '只能刪除尚未處理的 TEST 測試訂單。' });
    }

    await deleteR2PrivateObject(imageBundleOrderKey(order.id));
    await releasePendingEmailIndex(order);

    return jsonResponse(res, 200, { ok: true, storage: 'r2', deletedOrderId: order.id });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '刪除素材庫測試訂單失敗。',
    });
  }
}

async function handleAdminGetDigitalProductDownloadLink(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return jsonResponse(res, 400, { ok: false, error: '素材庫訂單編號不正確。' });

    const [bundleFile, order] = await Promise.all([
      getCurrentDigitalProductBundleFile(),
      readR2DigitalProductOrder(orderId),
    ]);
    if (!bundleFile) return jsonResponse(res, 409, { ok: false, error: '尚無可交付的圖片素材庫 ZIP 檔。' });
    if (!order || order.status !== 'approved' || !safeText(order.download_token) || !order.download_expires_at || new Date(order.download_expires_at).getTime() <= Date.now()) {
      return jsonResponse(res, 409, { ok: false, error: '此訂單目前沒有有效下載資格。' });
    }

    const origin = safeText(getRequestHeader(req, 'origin')) || `https://${safeText(getRequestHeader(req, 'host'))}`;
    return jsonResponse(res, 200, {
      ok: true,
      storage: 'r2',
      downloadUrl: `${origin.replace(/\/$/, '')}/download/image-bundle?token=${encodeURIComponent(String(order.download_token))}`,
      expiresAt: order.download_expires_at,
      downloadCount: Number(order.download_count || 0),
      downloadLimit: Number(order.download_limit || IMAGE_BUNDLE_DOWNLOAD_LIMIT),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '取得客戶下載連結失敗。' });
  }
}

async function handleAdminResetDigitalProductDownloadCount(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireImageBundleAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    const order = await readR2DigitalProductOrder(orderId);
    if (!order || order.status !== 'approved') return jsonResponse(res, 404, { ok: false, error: '找不到已核准的素材庫訂單。' });
    await writeR2DigitalProductOrder({ ...order, download_count: 0, last_download_at: null });
    return jsonResponse(res, 200, { ok: true, storage: 'r2', orderId });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '重設下載次數失敗。' });
  }
}

async function handleDownloadDigitalProductBundle(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const token = safeText(req?.query?.token);
    if (!/^[a-f0-9]{64}$/i.test(token)) return jsonResponse(res, 400, { ok: false, error: '下載連結無效。' });

    const tokenIndex = await readR2PrivateJson<DownloadTokenIndex>(imageBundleDownloadTokenKey(token));
    if (!tokenIndex?.order_id || tokenIndex.token !== token) {
      return jsonResponse(res, 403, { ok: false, error: '下載連結無效或已失效。' });
    }

    const [bundleFile, order] = await Promise.all([
      getCurrentDigitalProductBundleFile(),
      readR2DigitalProductOrder(tokenIndex.order_id),
    ]);
    if (!bundleFile) return jsonResponse(res, 409, { ok: false, error: '素材檔尚未準備完成，請稍後再試。' });
    if (!order || order.status !== 'approved' || order.download_token !== token) {
      return jsonResponse(res, 403, { ok: false, error: '此下載資格目前無效。' });
    }
    if (!order.download_expires_at || new Date(order.download_expires_at).getTime() <= Date.now()) {
      return jsonResponse(res, 403, { ok: false, error: '下載連結已過期，請聯絡管理者。' });
    }
    const currentCount = Math.max(0, Number(order.download_count || 0) || 0);
    const limit = Math.max(1, Number(order.download_limit || IMAGE_BUNDLE_DOWNLOAD_LIMIT) || IMAGE_BUNDLE_DOWNLOAD_LIMIT);
    if (currentCount >= limit) {
      return jsonResponse(res, 403, { ok: false, error: '下載次數已達上限，請聯絡管理者。' });
    }

    const safeName = bundleFile.file_name.replace(/[\r\n"]/g, '_');
    const signedUrl = await getSignedUrl(getR2Client(), new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: bundleFile.object_key,
      ResponseContentDisposition: `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
    }), { expiresIn: 10 * 60 });

    // Signed URL 成功產生後才計次，避免 Vercel/R2 建立連結失敗也消耗額度。
    const claimedOrder: R2DigitalProductOrder = {
      ...order,
      download_count: currentCount + 1,
      last_download_at: new Date().toISOString(),
      bundle_file_id: bundleFile.id,
    };
    await writeR2DigitalProductOrder(claimedOrder);
    return res.redirect(302, signedUrl);
  } catch (error: any) {
    console.error('R2_IMAGE_BUNDLE_DOWNLOAD_FAILED', error?.message || error);
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: '素材檔下載失敗，請聯絡管理者。' });
  }
}

async function handleDownloadFreeImage(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const imageId = safeText(req?.query?.image_id || req?.query?.imageId || req?.query?.id);
    if (!isUuid(imageId)) return jsonResponse(res, 400, { ok: false, error: '圖片編號不正確。' });

    const response = await supabaseRest(
      `images?select=id,title,public_url,image_url,file_path,price_type&id=eq.${encodeURIComponent(imageId)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!response.ok) throw new Error(`FREE_IMAGE_READ_FAILED:${response.status}`);
    const rows = await response.json().catch(() => []);
    const image = Array.isArray(rows) ? rows[0] : null;
    if (!image?.id) return jsonResponse(res, 404, { ok: false, error: '找不到圖片。' });
    if (safeText(image?.price_type) !== 'free') return jsonResponse(res, 403, { ok: false, error: '這張圖片屬於完整素材庫，請購買完整版後下載。' });

    let sourceUrl = '';
    const filePath = safeText(image?.file_path);
    if (filePath) sourceUrl = buildR2PublicUrl(filePath);
    if (!sourceUrl) sourceUrl = safeText(image?.public_url || image?.image_url);
    if (!sourceUrl) throw new Error('FREE_IMAGE_URL_MISSING');

    const r2Base = R2_PUBLIC_URL.replace(/\/$/, '');
    if (!sourceUrl.startsWith(`${r2Base}/`)) throw new Error('FREE_IMAGE_SOURCE_NOT_R2');

    const upstream = await fetch(sourceUrl);
    if (!upstream.ok) throw new Error(`FREE_IMAGE_FETCH_FAILED:${upstream.status}`);
    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (!buffer.length) throw new Error('FREE_IMAGE_EMPTY');

    const contentType = safeText(upstream.headers.get('content-type')) || 'application/octet-stream';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'bin';
    const baseName = sanitizeImageTitle(safeText(image?.title) || 'RxV-免費圖片').slice(0, 80) || 'RxV-免費圖片';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`${baseName}.${ext}`)}`);
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('FREE_IMAGE_DOWNLOAD_FAILED', error);
    return jsonResponse(res, 500, { ok: false, error: '免費圖片下載失敗，請稍後再試。' });
  }
}

async function handleGetBankTransferInfo(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const user = await getCurrentSessionUserProfile(req);
    const settings = getBankTransferSettings();

    if (!settings.enabled) {
      return jsonResponse(res, 503, {
        ok: false,
        error: '銀行轉帳尚未開放，請改用刷卡付款或稍後再試。',
      });
    }

    return jsonResponse(res, 200, {
      ok: true,
      accountEmail: user.email,
      bank: {
        name: settings.bankName,
        code: settings.bankCode,
        branch: settings.bankBranch,
        account: settings.bankAccount,
        accountName: settings.accountName,
      },
      plans: {
        '99': BANK_TRANSFER_PLANS['99'],
        '199': BANK_TRANSFER_PLANS['199'],
        relationship_pro: BANK_TRANSFER_PLANS.relationship_pro,
        relationship_business: BANK_TRANSFER_PLANS.relationship_business,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取銀行轉帳資訊失敗。',
    });
  }
}

async function handleCreateBankTransferReport(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const user = await getCurrentSessionUserProfile(req);
    const settings = getBankTransferSettings();
    if (!settings.enabled) {
      return jsonResponse(res, 503, { ok: false, error: '銀行轉帳尚未開放。' });
    }

    const plan = readBankTransferPlan(body?.planId || body?.plan_id);
    const submittedAmount = body?.amountNtd ?? body?.amount_ntd;
    if (submittedAmount != null && Number(submittedAmount) !== plan.amount) {
      return jsonResponse(res, 400, {
        ok: false,
        error: `此方案匯款金額應為 NT$${plan.amount}，請確認後再送出。`,
      });
    }

    const accountLastFive = safeText(body?.accountLastFive || body?.account_last_five);
    if (!/^\d{5}$/.test(accountLastFive)) {
      return jsonResponse(res, 400, { ok: false, error: '請輸入匯出帳號後五碼（5 位數字）。' });
    }

    const transferredAt = parseTaipeiTransferDate(
      body?.transferDate ||
      body?.transfer_date ||
      body?.transferredAt ||
      body?.transfer_at
    );
    const mode = safeText(body?.mode || body?.purchaseMode || body?.purchase_mode);
    const rawNote = safeText(body?.note).slice(0, 500);
    const isRelationshipPlan = plan.productType === 'relationship_ai';
    const isStorefrontMode = !isRelationshipPlan && (mode === 'storefront' || /商品展示頁正式版/.test(rawNote));
    const note = (isRelationshipPlan
      ? rawNote
      : isStorefrontMode
      ? `[商品展示頁正式版 NT$199／3個月] ${rawNote.replace(/^\[商品展示頁正式版[^\]]*\]\s*/u, '')}`.trim()
      : rawNote) || null;

    const response = await supabaseRest('bank_transfer_reports', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.userId,
        email: user.email,
        plan_id: plan.id,
        amount_ntd: plan.amount,
        account_last_five: accountLastFive,
        transferred_at: transferredAt,
        note,
        status: 'pending',
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`匯款回報建立失敗：${text || response.status}`);
    }

    const rows = await response.json().catch(() => []);
    const report = Array.isArray(rows) ? rows[0] : rows;

    return jsonResponse(res, 201, {
      ok: true,
      reportId: report?.id || null,
      message: isRelationshipPlan
        ? '已收到 AI 回覆軍師匯款回報，站方確認實際入帳後會人工開通 30 天。'
        : isStorefrontMode
        ? '已收到商品展示頁匯款回報，站方會核對實際入帳；確認後預計 1～2 天內開通或展延商品展示頁設定與使用權限。'
        : '已收到匯款回報，站方會核對實際入帳；確認後預計 1～2 天內加點並開通商品展示頁設定與使用權限。',
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '提交匯款回報失敗。',
    });
  }
}

async function handleAdminListBankTransferReports(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);

    const response = await supabaseRest(
      'bank_transfer_reports?select=id,user_id,email,plan_id,amount_ntd,account_last_five,transferred_at,note,status,created_at&status=eq.pending&order=created_at.asc',
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`讀取匯款回報失敗：${text || response.status}`);
    }

    const reports = await response.json().catch(() => []);
    return jsonResponse(res, 200, { ok: true, reports: Array.isArray(reports) ? reports : [] });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取匯款回報失敗。',
    });
  }
}

async function handleAdminListPaidStorefrontOrders(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);

    const ordersResponse = await supabaseRest(
      'purchase_logs?select=id,user_id,order_no,amount,points,status,created_at&status=in.(success,paid)&or=(amount.eq.99,amount.eq.199)&order=created_at.asc&limit=200',
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!ordersResponse.ok) {
      const text = await ordersResponse.text().catch(() => '');
      throw new Error(`讀取刷卡成功訂單失敗：${text || ordersResponse.status}`);
    }

    const orders = await ordersResponse.json().catch(() => []);
    const normalizedOrders = Array.isArray(orders) ? orders : [];
    if (!normalizedOrders.length) return jsonResponse(res, 200, { ok: true, orders: [] });

    const orderNumbers = normalizedOrders
      .map((order: any) => safeText(order?.order_no))
      .filter((value: string) => /^[A-Za-z0-9_-]+$/.test(value));

    const userIds = normalizedOrders
      .map((order: any) => safeText(order?.user_id))
      .filter((value: string) => /^[0-9a-f-]{36}$/i.test(value));

    const userEmailById = new Map<string, string>();
    if (userIds.length) {
      const usersResponse = await supabaseRest(
        `users?select=id,email&id=in.(${userIds.join(',')})`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (usersResponse.ok) {
        const users = await usersResponse.json().catch(() => []);
        for (const user of Array.isArray(users) ? users : []) {
          userEmailById.set(String(user?.id || ''), normalizeEmail(user?.email));
        }
      }
    }

    const grantedOrderNumbers = new Set<string>();
    if (orderNumbers.length) {
      const grantsResponse = await supabaseRest(
        `storefront_entitlements?select=source_reference&grant_source=eq.product_image_package&source_reference=in.(${orderNumbers.join(',')})`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (grantsResponse.ok) {
        const grants = await grantsResponse.json().catch(() => []);
        for (const grant of Array.isArray(grants) ? grants : []) {
          grantedOrderNumbers.add(safeText(grant?.source_reference));
        }
      }
    }

    const pendingOrders = normalizedOrders
      .filter((order: any) => !grantedOrderNumbers.has(safeText(order?.order_no)))
      .map((order: any) => ({
        id: String(order?.id || ''),
        user_id: String(order?.user_id || ''),
        email: userEmailById.get(String(order?.user_id || '')) || '',
        order_no: safeText(order?.order_no),
        amount: Number(order?.amount || 0),
        points: Number(order?.points || 0),
        status: safeText(order?.status),
        created_at: order?.created_at || null,
      }));

    return jsonResponse(res, 200, { ok: true, orders: pendingOrders });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取待開通刷卡訂單失敗。',
    });
  }
}

async function handleAdminMemberLookup(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);

    const email = normalizeEmail(req?.query?.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(res, 400, { ok: false, error: '請輸入正確的會員 Email。' });
    }

    const userResponse = await supabaseRest(
      `users?select=id,email,created_at&email=eq.${escapeFilterValue(email)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!userResponse.ok) {
      const text = await userResponse.text().catch(() => '');
      throw new Error(`讀取會員資料失敗：${text || userResponse.status}`);
    }

    const userRows = await userResponse.json().catch(() => []);
    const user = Array.isArray(userRows) ? userRows[0] : null;

    if (!user?.id) {
      return jsonResponse(res, 200, {
        ok: true,
        found: false,
        searched_email: email,
      });
    }

    const userId = String(user.id);

    const [creditsResponse, purchasesResponse, transferReportsResponse, storefrontResponse] = await Promise.all([
      supabaseRest(
        `user_credits?select=remaining_chars&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `purchase_logs?select=order_no,amount,points,status,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=100`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `bank_transfer_reports?select=id,plan_id,amount_ntd,status,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=100`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `storefronts?select=id,slug,display_name,status,is_public,expires_at,created_at&owner_user_id=eq.${encodeURIComponent(userId)}&page_mode=in.(product_showcase,brand_storefront)&order=created_at.desc&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
    ]);

    const responseGroups: Array<[string, any]> = [
      ['點數', creditsResponse],
      ['訂單', purchasesResponse],
      ['匯款回報', transferReportsResponse],
      ['商品展示頁', storefrontResponse],
    ];

    for (const [label, response] of responseGroups) {
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`讀取會員${label}資料失敗：${text || response.status}`);
      }
    }

    const creditsRows = await creditsResponse.json().catch(() => []);
    const purchaseRows = await purchasesResponse.json().catch(() => []);
    const transferRows = await transferReportsResponse.json().catch(() => []);
    const storefrontRows = await storefrontResponse.json().catch(() => []);

    const credits = Array.isArray(creditsRows) && creditsRows[0] ? creditsRows[0] : null;
    const purchases = Array.isArray(purchaseRows) ? purchaseRows : [];
    const transfers = Array.isArray(transferRows) ? transferRows : [];
    const storefront = Array.isArray(storefrontRows) && storefrontRows[0] ? storefrontRows[0] : null;

    const successfulOrders = purchases.filter((order: any) => {
      const status = safeText(order?.status).toLowerCase();
      return status === 'success' || status === 'paid';
    });

    const totalPaidNtd = successfulOrders.reduce(
      (sum: number, order: any) => sum + Math.max(0, Number(order?.amount || 0) || 0),
      0,
    );
    const totalPurchasedPoints = successfulOrders.reduce(
      (sum: number, order: any) => sum + Math.max(0, Number(order?.points || 0) || 0),
      0,
    );
    const pendingTransferCount = transfers.filter(
      (report: any) => safeText(report?.status).toLowerCase() === 'pending',
    ).length;

    let entitlement: any = null;
    if (storefront?.id) {
      const entitlementResponse = await supabaseRest(
        `storefront_entitlements?select=plan_code,max_items,status,starts_at,expires_at&storefront_id=eq.${encodeURIComponent(String(storefront.id))}&order=created_at.desc&limit=20`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );

      if (!entitlementResponse.ok) {
        const text = await entitlementResponse.text().catch(() => '');
        throw new Error(`讀取商品展示頁資格失敗：${text || entitlementResponse.status}`);
      }

      const entitlementRows = await entitlementResponse.json().catch(() => []);
      const rows = Array.isArray(entitlementRows) ? entitlementRows : [];
      const activeRows = rows.filter((row: any) => safeText(row?.status).toLowerCase() === 'active');

      entitlement =
        activeRows.sort((a: any, b: any) => Number(b?.max_items || 0) - Number(a?.max_items || 0))[0] ||
        rows[0] ||
        null;
    }

    return jsonResponse(res, 200, {
      ok: true,
      found: true,
      searched_email: email,
      member: {
        email: normalizeEmail(user.email),
        registered_at: user.created_at || null,
        remaining_points: Math.max(0, Number(credits?.remaining_chars || 0) || 0),
      },
      purchases: {
        has_successful_purchase: successfulOrders.length > 0,
        successful_order_count: successfulOrders.length,
        total_paid_ntd: totalPaidNtd,
        total_purchased_points: totalPurchasedPoints,
        latest_successful_purchase_at: successfulOrders[0]?.created_at || null,
        latest_order_no: safeText(successfulOrders[0]?.order_no) || null,
      },
      bank_transfer_reports: {
        total_count: transfers.length,
        pending_count: pendingTransferCount,
        latest_status: safeText(transfers[0]?.status) || null,
        latest_created_at: transfers[0]?.created_at || null,
      },
      storefront: storefront
        ? {
            slug: safeText(storefront.slug),
            display_name: safeText(storefront.display_name),
            status: safeText(storefront.status) || 'draft',
            is_public: Boolean(storefront.is_public),
            expires_at: storefront.expires_at || null,
          }
        : null,
      entitlement: entitlement
        ? {
            plan_code: safeText(entitlement.plan_code) || null,
            max_items: Math.max(0, Number(entitlement.max_items || 0) || 0),
            status: safeText(entitlement.status) || null,
            expires_at: entitlement.expires_at || null,
          }
        : null,
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '查詢會員資料失敗。',
    });
  }
}


function storefrontTrialError(message: string, statusCode = 400) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function storefrontTrialRequestPayload(row: any) {
  return {
    id: safeText(row?.id),
    user_id: safeText(row?.user_id),
    email: normalizeEmail(row?.email),
    status: safeText(row?.status) || 'pending',
    request_note: row?.request_note || null,
    review_note: row?.review_note || null,
    storefront_id: row?.storefront_id || null,
    entitlement_id: row?.entitlement_id || null,
    reviewed_by: row?.reviewed_by || null,
    reviewed_at: row?.reviewed_at || null,
    created_at: row?.created_at || null,
    updated_at: row?.updated_at || null,
  };
}

async function readExistingStorefrontTrialEntitlement(userId: string) {
  const response = await supabaseRest(
    `storefront_entitlements?select=id,storefront_id,status,starts_at,expires_at&owner_user_id=eq.${encodeURIComponent(userId)}&grant_source=eq.storefront_trial&plan_code=eq.storefront_trial_7d&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_TRIAL_ENTITLEMENT_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function findStorefrontTrialRequestForUser(userId: string, statuses = ['pending', 'approved']) {
  const statusFilter = statuses.map((value) => safeText(value)).filter(Boolean).join(',');
  const response = await supabaseRest(
    `storefront_trial_requests?select=*&user_id=eq.${encodeURIComponent(userId)}&status=in.(${statusFilter})&order=created_at.desc&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_TRIAL_REQUEST_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function handleCreateStorefrontTrialRequest(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const user = await getCurrentSessionUserProfile(req);
    const existingTrial = await readExistingStorefrontTrialEntitlement(user.userId);
    if (existingTrial?.id) {
      return jsonResponse(res, 409, {
        ok: false,
        code: 'TRIAL_ALREADY_USED',
        error: '此帳號已申請或開通過 7 天試用，請改用 NT$199／3 個月正式版。',
      });
    }

    const existingRequest = await findStorefrontTrialRequestForUser(user.userId, ['pending', 'approved']);
    if (existingRequest?.id) {
      const status = safeText(existingRequest.status);
      return jsonResponse(res, 200, {
        ok: true,
        request: storefrontTrialRequestPayload(existingRequest),
        message: status === 'approved'
          ? '你的 7 天試用已核准，請前往設定我的商品頁。'
          : '已收到 7 天試用申請，站方審核後會人工開通。',
      });
    }

    const requestNote = safeText(body?.requestNote || body?.request_note).slice(0, 500) || null;
    const response = await supabaseRest('storefront_trial_requests', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.userId,
        email: user.email,
        status: 'pending',
        request_note: requestNote,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`STOREFRONT_TRIAL_REQUEST_CREATE_FAILED:${response.status}:${text}`);
    }

    const rows = await response.json().catch(() => []);
    const request = Array.isArray(rows) ? rows[0] : rows;
    return jsonResponse(res, 201, {
      ok: true,
      request: storefrontTrialRequestPayload(request),
      message: '已收到 7 天試用申請，站方審核後會人工開通 1 個商品展示頁。',
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '送出 7 天試用申請失敗。',
    });
  }
}

async function handleAdminListStorefrontTrialRequests(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);
    const status = safeText(req?.query?.status || 'pending');
    const filter = status === 'all' ? '' : `&status=eq.${encodeURIComponent(status)}`;
    const response = await supabaseRest(
      `storefront_trial_requests?select=*&order=created_at.asc${filter}&limit=200`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`STOREFRONT_TRIAL_REQUEST_LIST_FAILED:${response.status}:${text}`);
    }

    const rows = await response.json().catch(() => []);
    return jsonResponse(res, 200, {
      ok: true,
      requests: (Array.isArray(rows) ? rows : []).map(storefrontTrialRequestPayload),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取 7 天試用申請失敗。',
    });
  }
}

async function grantStorefrontTrialForUser(input: { userId: string; email: string; requestId: string; adminUserId: string }) {
  const userId = safeText(input.userId);
  const email = normalizeEmail(input.email);
  const requestId = safeText(input.requestId);
  const adminUserId = safeText(input.adminUserId);

  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw storefrontTrialError('試用申請的會員資料不正確。', 400);
  if (!email) throw storefrontTrialError('試用申請缺少會員 Email。', 400);

  const existingTrial = await readExistingStorefrontTrialEntitlement(userId);
  if (existingTrial?.id) throw storefrontTrialError('此帳號已開通過 7 天試用，不能重複開通。', 409);

  const now = new Date();
  const startsAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  let storefront = await findOwnerStorefront(userId);
  const previousExpiry = storefront?.expires_at || null;

  if (!storefront?.id) {
    const emailPrefix = email.split('@')[0] || 'shop';
    const slug = await ensureUniqueStorefrontSlug(`trial-${emailPrefix}-${crypto.randomUUID().slice(0, 8)}`);
    const createResponse = await supabaseRest('storefronts', {
      method: 'POST',
      body: JSON.stringify({
        owner_user_id: userId,
        slug,
        page_mode: 'product_showcase',
        profile_type: 'business',
        display_name: `${emailPrefix} 的商品展示頁`,
        status: 'draft',
        is_public: false,
        expires_at: expiresAt,
      }),
    });

    if (!createResponse.ok) {
      const text = await createResponse.text().catch(() => '');
      throw new Error(`STOREFRONT_TRIAL_STOREFRONT_CREATE_FAILED:${createResponse.status}:${text}`);
    }

    const rows = await createResponse.json().catch(() => []);
    storefront = Array.isArray(rows) ? rows[0] : rows;
  }

  const storefrontId = safeText(storefront?.id);
  if (!storefrontId) throw storefrontTrialError('建立商品展示頁失敗。', 500);

  const entitlementResponse = await supabaseRest('storefront_entitlements', {
    method: 'POST',
    body: JSON.stringify({
      owner_user_id: userId,
      storefront_id: storefrontId,
      grant_source: 'storefront_trial',
      plan_code: 'storefront_trial_7d',
      max_items: 1,
      source_reference: requestId || `manual_trial:${email}`,
      granted_months: 0,
      previous_expires_at: previousExpiry,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: 'active',
      metadata: {
        trial_days: 7,
        max_items: 1,
        email,
        storefront_trial_request_id: requestId || null,
        approved_by: adminUserId || null,
      },
    }),
  });

  if (!entitlementResponse.ok) {
    const text = await entitlementResponse.text().catch(() => '');
    throw new Error(`STOREFRONT_TRIAL_ENTITLEMENT_CREATE_FAILED:${entitlementResponse.status}:${text}`);
  }

  const entitlementRows = await entitlementResponse.json().catch(() => []);
  const entitlement = Array.isArray(entitlementRows) ? entitlementRows[0] : entitlementRows;
  const syncedStorefront = await syncStorefrontExpiryFromActiveEntitlements(storefront);

  return {
    storefront: syncedStorefront,
    entitlement,
    expiresAt: syncedStorefront?.expires_at || expiresAt,
    publicPath: `/shop/${safeText(syncedStorefront?.slug || storefront?.slug)}`,
  };
}

async function handleAdminApproveStorefrontTrialRequest(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    const requestId = safeText(body?.requestId || body?.request_id);
    const reviewNote = safeText(body?.reviewNote || body?.review_note).slice(0, 500) || null;
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
      return jsonResponse(res, 400, { ok: false, error: '試用申請編號不正確。' });
    }

    const requestResponse = await supabaseRest(
      `storefront_trial_requests?select=*&id=eq.${encodeURIComponent(requestId)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!requestResponse.ok) {
      const text = await requestResponse.text().catch(() => '');
      throw new Error(`STOREFRONT_TRIAL_REQUEST_GET_FAILED:${requestResponse.status}:${text}`);
    }
    const requestRows = await requestResponse.json().catch(() => []);
    const request = Array.isArray(requestRows) ? requestRows[0] : null;
    if (!request?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此試用申請。' });
    if (safeText(request.status) !== 'pending') {
      return jsonResponse(res, 409, { ok: false, error: '此試用申請已處理過。' });
    }

    const granted = await grantStorefrontTrialForUser({
      userId: safeText(request.user_id),
      email: normalizeEmail(request.email),
      requestId,
      adminUserId: admin.userId,
    });

    const updateResponse = await supabaseRest(`storefront_trial_requests?id=eq.${encodeURIComponent(requestId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'approved',
        storefront_id: safeText(granted.storefront?.id) || null,
        entitlement_id: safeText(granted.entitlement?.id) || null,
        reviewed_by: admin.userId,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote,
      }),
    });
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`STOREFRONT_TRIAL_REQUEST_APPROVE_UPDATE_FAILED:${updateResponse.status}:${text}`);
    }

    return jsonResponse(res, 200, {
      ok: true,
      requestId,
      email: normalizeEmail(request.email),
      expiresAt: granted.expiresAt,
      publicPath: granted.publicPath,
      message: '已開通 7 天試用，最多可建立 1 個展示商品。',
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '開通 7 天試用失敗。',
    });
  }
}

async function handleAdminRejectStorefrontTrialRequest(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    const requestId = safeText(body?.requestId || body?.request_id);
    const reviewNote = safeText(body?.reviewNote || body?.review_note).slice(0, 500) || null;
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
      return jsonResponse(res, 400, { ok: false, error: '試用申請編號不正確。' });
    }

    const response = await supabaseRest(`storefront_trial_requests?id=eq.${encodeURIComponent(requestId)}&status=eq.pending`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'rejected',
        reviewed_by: admin.userId,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`STOREFRONT_TRIAL_REQUEST_REJECT_FAILED:${response.status}:${text}`);
    }

    const rows = await response.json().catch(() => []);
    if (!Array.isArray(rows) || !rows[0]) {
      return jsonResponse(res, 404, { ok: false, error: '找不到待處理的試用申請。' });
    }

    return jsonResponse(res, 200, { ok: true, request: storefrontTrialRequestPayload(rows[0]) });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '拒絕 7 天試用申請失敗。',
    });
  }
}

async function handleAdminApproveBankTransferReport(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    const reportId = safeText(body?.reportId || body?.report_id);
    const reviewNote = safeText(body?.reviewNote || body?.review_note).slice(0, 500) || null;
    if (!/^[0-9a-f-]{36}$/i.test(reportId)) {
      return jsonResponse(res, 400, { ok: false, error: '匯款回報編號不正確。' });
    }

    const reportResponse = await supabaseRest(
      `bank_transfer_reports?select=id,plan_id,amount_ntd,status&id=eq.${encodeURIComponent(reportId)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!reportResponse.ok) {
      const text = await reportResponse.text().catch(() => '');
      throw new Error(`讀取匯款回報失敗：${text || reportResponse.status}`);
    }
    const reportRows = await reportResponse.json().catch(() => []);
    const report = Array.isArray(reportRows) ? reportRows[0] : null;
    if (!report?.id) {
      return jsonResponse(res, 404, { ok: false, error: '找不到匯款回報。' });
    }

    const planId = safeText(report.plan_id);
    const isRelationshipPlan = planId === 'relationship_pro' || planId === 'relationship_business';
    const rpcName = isRelationshipPlan
      ? 'approve_relationship_bank_transfer_report'
      : 'approve_bank_transfer_report';

    const response = await supabaseRest(`rpc/${rpcName}`, {
      method: 'POST',
      body: JSON.stringify({
        p_report_id: reportId,
        p_admin_user_id: admin.userId,
        p_review_note: reviewNote,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`確認收款失敗：${text || response.status}`);
    }

    const result = await response.json().catch(() => ({}));
    return jsonResponse(res, 200, { ok: true, result });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '確認收款失敗。',
    });
  }
}

async function handleAdminRejectBankTransferReport(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    const reportId = safeText(body?.reportId || body?.report_id);
    const reviewNote = safeText(body?.reviewNote || body?.review_note).slice(0, 500) || null;
    if (!/^[0-9a-f-]{36}$/i.test(reportId)) {
      return jsonResponse(res, 400, { ok: false, error: '匯款回報編號不正確。' });
    }

    const response = await supabaseRest('rpc/reject_bank_transfer_report', {
      method: 'POST',
      body: JSON.stringify({
        p_report_id: reportId,
        p_admin_user_id: admin.userId,
        p_review_note: reviewNote,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`拒絕匯款回報失敗：${text || response.status}`);
    }

    const result = await response.json().catch(() => ({}));
    return jsonResponse(res, 200, { ok: true, result });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '拒絕匯款回報失敗。',
    });
  }
}

async function handleAdminGrantStorefrontForPurchase(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    const orderNo = safeText(body?.orderNo || body?.order_no);
    if (!/^[A-Za-z0-9_-]{6,80}$/.test(orderNo)) {
      return jsonResponse(res, 400, { ok: false, error: '訂單編號不正確。' });
    }

    const response = await supabaseRest('rpc/grant_storefront_for_purchase_log', {
      method: 'POST',
      body: JSON.stringify({
        p_order_no: orderNo,
        p_admin_user_id: admin.userId,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`開通商品展示頁失敗：${text || response.status}`);
    }

    const result = await response.json().catch(() => ({}));
    return jsonResponse(res, 200, { ok: true, result });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '開通商品展示頁失敗。',
    });
  }
}


// =========================================================
// 人工名片訂單（登入會員專用）
// - 前端必須帶 Authorization: Bearer <自訂 session token>
// - 價格與免運由後端重新計算，不採信前端金額。
// - 名片附件寫入 private bucket：business-card-orders。
// =========================================================

const BUSINESS_CARD_BUCKET = 'business-card-orders';
const BUSINESS_CARD_MAX_FILE_BYTES = 3 * 1024 * 1024; // Base64 經 Vercel API 傳送，第一版每檔先限制 3MB。
const BUSINESS_CARD_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

type BusinessCardServiceType = 'layout' | 'print';
type BusinessCardPrintSide = 'single' | 'double';
type BusinessCardFinishType = 'gloss' | 'matte';
type BusinessCardFileRole =
  | 'customer_logo'
  | 'customer_photo'
  | 'reference_image'
  | 'print_artwork'
  | 'preview_front'
  | 'preview_back'
  | 'payment_proof'
  | 'other';

const BUSINESS_CARD_PRICE_TABLE: Record<
  BusinessCardServiceType,
  Record<BusinessCardPrintSide, Record<number, number>>
> = {
  print: {
    single: { 200: 179, 300: 229, 500: 279, 1000: 399, 2000: 599, 3000: 799, 5000: 1099 },
    double: { 200: 199, 300: 249, 500: 299, 1000: 449, 2000: 699, 3000: 899, 5000: 1299 },
  },
  layout: {
    single: { 200: 349, 300: 399, 500: 449, 1000: 599, 2000: 799, 3000: 999, 5000: 1299 },
    double: { 200: 399, 300: 449, 500: 499, 1000: 649, 2000: 849, 3000: 1049, 5000: 1349 },
  },
};

/** 水晶亮膜為基本價格；雙面霧膜為質感升級。 */
const BUSINESS_CARD_MATTE_UPGRADE: Record<number, number> = {
  200: 50,
  300: 50,
  500: 80,
  1000: 100,
  2000: 150,
  3000: 200,
  5000: 300,
};

/**
 * 首波名片體驗活動。
 * 不新增資料庫欄位，也不採信前端折扣：由後端把「活動後」名片費與運費寫入既有欄位，
 * 付款頁、匯款回報與管理後台都會讀到同一筆正確金額。
 * 首波活動結束時，把 enabled 改為 false 後部署；前端同名設定也要一併關閉。
 */
const BUSINESS_CARD_FIRST_WAVE_PROMO = {
  enabled: true,
  serviceType: 'layout' as BusinessCardServiceType,
  printSide: 'double' as BusinessCardPrintSide,
  finishType: 'gloss' as BusinessCardFinishType,
  quantityCards: 200,
  itemDiscountNtd: 50,
  shippingFeeNtd: 50,
};

type BusinessCardPricing = {
  regularItemAmountNtd: number;
  itemDiscountNtd: number;
  itemAmountNtd: number;
  regularShippingFeeNtd: number;
  shippingDiscountNtd: number;
  shippingFeeNtd: number;
  totalAmountNtd: number;
  firstWavePromotion: boolean;
};

function isBusinessCardFirstWavePromotionSelection(
  serviceType: BusinessCardServiceType,
  printSide: BusinessCardPrintSide,
  finishType: BusinessCardFinishType,
  quantityCards: number,
) {
  return BUSINESS_CARD_FIRST_WAVE_PROMO.enabled
    && serviceType === BUSINESS_CARD_FIRST_WAVE_PROMO.serviceType
    && printSide === BUSINESS_CARD_FIRST_WAVE_PROMO.printSide
    && finishType === BUSINESS_CARD_FIRST_WAVE_PROMO.finishType
    && quantityCards === BUSINESS_CARD_FIRST_WAVE_PROMO.quantityCards;
}

function getBusinessCardPricing(
  serviceType: BusinessCardServiceType,
  printSide: BusinessCardPrintSide,
  finishType: BusinessCardFinishType,
  quantityCards: number,
): BusinessCardPricing | null {
  const baseAmount = BUSINESS_CARD_PRICE_TABLE?.[serviceType]?.[printSide]?.[quantityCards];
  if (!Number.isInteger(baseAmount)) return null;

  const matteUpgrade = finishType === 'matte' ? BUSINESS_CARD_MATTE_UPGRADE[quantityCards] : 0;
  if (!Number.isInteger(matteUpgrade)) return null;

  const regularItemAmountNtd = baseAmount + matteUpgrade;
  const firstWavePromotion = isBusinessCardFirstWavePromotionSelection(serviceType, printSide, finishType, quantityCards);
  const itemDiscountNtd = firstWavePromotion ? BUSINESS_CARD_FIRST_WAVE_PROMO.itemDiscountNtd : 0;
  const itemAmountNtd = regularItemAmountNtd - itemDiscountNtd;
  const regularShippingFeeNtd = regularItemAmountNtd >= 1000 ? 0 : 100;
  const shippingFeeNtd = firstWavePromotion
    ? BUSINESS_CARD_FIRST_WAVE_PROMO.shippingFeeNtd
    : (itemAmountNtd >= 1000 ? 0 : 100);
  const shippingDiscountNtd = Math.max(0, regularShippingFeeNtd - shippingFeeNtd);

  return {
    regularItemAmountNtd,
    itemDiscountNtd,
    itemAmountNtd,
    regularShippingFeeNtd,
    shippingDiscountNtd,
    shippingFeeNtd,
    totalAmountNtd: itemAmountNtd + shippingFeeNtd,
    firstWavePromotion,
  };
}

function isBusinessCardFirstWavePromotionOrder(order: any) {
  return safeText(order?.service_type ?? order?.serviceType) === BUSINESS_CARD_FIRST_WAVE_PROMO.serviceType
    && safeText(order?.print_side ?? order?.printSide) === BUSINESS_CARD_FIRST_WAVE_PROMO.printSide
    && safeText(order?.finish_type ?? order?.finishType) === BUSINESS_CARD_FIRST_WAVE_PROMO.finishType
    && Number(order?.quantity_cards ?? order?.quantityCards ?? 0) === BUSINESS_CARD_FIRST_WAVE_PROMO.quantityCards
    && Number(order?.item_amount_ntd ?? order?.itemAmountNtd ?? 0) === 349
    && Number(order?.shipping_fee_ntd ?? order?.shippingFeeNtd ?? 0) === BUSINESS_CARD_FIRST_WAVE_PROMO.shippingFeeNtd;
}

// 一頁式品牌網站贈送規則：僅人工排版，名片費滿 NT$349；運費不列入判斷。
const BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT = 349;
const BUSINESS_CARD_BRAND_WEBSITE_GIFT_MONTHS = 3;

function getBusinessCardBrandWebsiteGiftMonths(order: any) {
  const serviceType = safeText(order?.service_type ?? order?.serviceType);
  const itemAmount = Number(order?.item_amount_ntd ?? order?.itemAmountNtd ?? 0);
  return serviceType === 'layout' && Number.isFinite(itemAmount) && itemAmount >= BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT
    ? BUSINESS_CARD_BRAND_WEBSITE_GIFT_MONTHS
    : 0;
}

function isBusinessCardBrandWebsiteGiftEligible(order: any) {
  return getBusinessCardBrandWebsiteGiftMonths(order) > 0;
}

function businessCardError(message: string, statusCode = 400) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function readBusinessCardBoolean(value: any) {
  if (value === true) return true;
  const raw = safeText(value).toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

function businessCardText(value: any, maxLength: number) {
  return safeText(value).slice(0, maxLength) || null;
}

function isBusinessCardUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readBusinessCardFileRole(value: any, serviceType: BusinessCardServiceType): BusinessCardFileRole {
  const role = safeText(value);
  // 客戶端不能自行偽造「預覽正面／背面」檔案；此兩種角色只允許管理者端 API 建立。
  const allowed: BusinessCardFileRole[] = [
    'customer_logo',
    'customer_photo',
    'reference_image',
    'print_artwork',
    'payment_proof',
    'other',
  ];
  if (allowed.includes(role as BusinessCardFileRole)) return role as BusinessCardFileRole;
  return serviceType === 'print' ? 'print_artwork' : 'reference_image';
}

function storagePathUrl(bucket: string, objectPath: string) {
  const encodedPath = objectPath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function businessCardFileExtension(mimeType: string, originalName: string) {
  const fromMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  if (fromMime[mimeType]) return fromMime[mimeType];
  const match = safeText(originalName).match(/\.([a-z0-9]{1,10})$/i);
  return match?.[1]?.toLowerCase() || 'bin';
}

function businessCardSafeFileName(value: any) {
  const raw = path.basename(safeText(value || 'attachment'));
  const cleaned = raw.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, ' ').trim();
  return (cleaned || 'attachment').slice(0, 180);
}

function normalizeBusinessCardFile(input: any, requestedContentType: any) {
  const raw = safeText(input);
  if (!raw) throw businessCardError('缺少附件資料。');

  const match = raw.match(/^data:([^;,]+);base64,([\s\S]+)$/i);
  const contentType = safeText(match?.[1] || requestedContentType).toLowerCase().split(';')[0];
  const base64 = String(match?.[2] || raw).replace(/\s/g, '');

  if (!BUSINESS_CARD_ALLOWED_MIME_TYPES.has(contentType)) {
    throw businessCardError('附件僅支援 JPG、PNG、WebP 或 PDF。');
  }
  if (!/^[a-z0-9+/=]+$/i.test(base64)) {
    throw businessCardError('附件資料格式不正確。');
  }

  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) throw businessCardError('附件資料格式不正確。');
  if (buffer.length > BUSINESS_CARD_MAX_FILE_BYTES) {
    throw businessCardError('單一附件請控制在 3MB 以下。');
  }

  return { buffer, contentType };
}

async function uploadPrivateBusinessCardFile(objectPath: string, buffer: Buffer, contentType: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_ENV_MISSING');
  }

  const uploadRes = await fetch(storagePathUrl(BUSINESS_CARD_BUCKET, objectPath), {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
      'Cache-Control': '3600',
      'x-upsert': 'false',
    },
    body: buffer as unknown as BodyInit,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_STORAGE_UPLOAD_FAILED:${uploadRes.status}:${text}`);
  }
}

function normalizeBusinessCardOrderInput(body: any) {
  const serviceType = safeText(body?.serviceType || body?.service_type) as BusinessCardServiceType;
  const printSide = safeText(body?.printSide || body?.print_side) as BusinessCardPrintSide;
  const finishType = safeText(body?.finishType || body?.finish_type) as BusinessCardFinishType;
  const quantityCards = Number(body?.quantityCards || body?.quantity_cards || 0);

  if (serviceType !== 'layout' && serviceType !== 'print') {
    throw businessCardError('服務類型不正確。');
  }
  if (printSide !== 'single' && printSide !== 'double') {
    throw businessCardError('名片面數不正確。');
  }
  if (finishType !== 'gloss' && finishType !== 'matte') {
    throw businessCardError('紙材選項不正確。');
  }

  const pricing = getBusinessCardPricing(serviceType, printSide, finishType, quantityCards);
  if (!Number.isInteger(quantityCards) || !pricing) {
    throw businessCardError('訂購數量不正確。');
  }
  const itemAmountNtd = pricing.itemAmountNtd;

  const recipientName = businessCardText(body?.recipientName || body?.recipient_name, 120);
  const recipientPhone = businessCardText(body?.recipientPhone || body?.recipient_phone, 60);
  const shippingAddress = businessCardText(body?.shippingAddress || body?.shipping_address, 500);
  if (!recipientName || !recipientPhone || !shippingAddress) {
    throw businessCardError('請完整填寫收件人、收件電話與宅配地址。');
  }

  const needQr = readBusinessCardBoolean(body?.needQr ?? body?.need_qr);
  const qrLink = businessCardText(body?.qrLink || body?.qr_link, 1000);
  const templateId = serviceType === 'layout' ? businessCardText(body?.templateId || body?.template_id, 120) : null;
  const templateTitle = serviceType === 'layout' ? businessCardText(body?.templateTitle || body?.template_title, 180) : null;

  return {
    serviceType,
    printSide,
    finishType,
    quantityCards,
    boxCount: quantityCards / 100,
    templateId,
    templateTitle,
    needQr,
    qrLink: needQr ? qrLink : null,
    itemAmountNtd,
    shippingFeeNtd: pricing.shippingFeeNtd,
    regularItemAmountNtd: pricing.regularItemAmountNtd,
    itemDiscountNtd: pricing.itemDiscountNtd,
    regularShippingFeeNtd: pricing.regularShippingFeeNtd,
    shippingDiscountNtd: pricing.shippingDiscountNtd,
    totalAmountNtd: pricing.totalAmountNtd,
    firstWavePromotion: pricing.firstWavePromotion,

    brandName: businessCardText(body?.brandName || body?.brand_name, 180),
    fullName: businessCardText(body?.fullName || body?.full_name, 120),
    jobTitle: businessCardText(body?.jobTitle || body?.job_title, 120),
    cardPhone: businessCardText(body?.phone || body?.cardPhone || body?.card_phone, 60),
    lineId: businessCardText(body?.lineId || body?.line_id, 180),
    cardEmail: businessCardText(body?.email || body?.cardEmail || body?.card_email, 180),
    websiteUrl: businessCardText(body?.website || body?.websiteUrl || body?.website_url, 1000),
    serviceText: businessCardText(body?.services || body?.serviceText || body?.service_text, 2000),

    recipientName,
    recipientPhone,
    shippingAddress,
    customerNote: businessCardText(body?.note || body?.customerNote || body?.customer_note, 3000),
    // 符合活動的人工排版訂單會自動建立網站草稿，不依賴前端是否帶入勾選值。
    digitalCardOptIn: serviceType === 'layout' && itemAmountNtd >= BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT
      ? true
      : readBusinessCardBoolean(body?.digitalCardOptIn || body?.digital_card_opt_in),
  };
}

function businessCardOrderPayload(row: any) {
  return {
    id: row.id,
    orderCode: row.order_code,
    serviceType: row.service_type,
    printSide: row.print_side,
    finishType: row.finish_type,
    quantityCards: Number(row.quantity_cards || 0),
    boxCount: Number(row.box_count || 0),
    templateId: row.template_id || null,
    templateTitle: row.template_title || null,
    needQr: Boolean(row.need_qr),
    qrLink: row.qr_link || null,
    itemAmountNtd: Number(row.item_amount_ntd || 0),
    shippingFeeNtd: Number(row.shipping_fee_ntd || 0),
    totalAmountNtd: Number(row.total_amount_ntd || 0),
    status: row.status,
    revisionCount: Number(row.revision_count || 0),
    previewNote: row.preview_note || null,
    digitalCardOptIn: Boolean(row.digital_card_opt_in),
    brandWebsiteGiftEligible: isBusinessCardBrandWebsiteGiftEligible(row),
    brandWebsiteGiftMonths: getBusinessCardBrandWebsiteGiftMonths(row),
    firstWavePromotion: isBusinessCardFirstWavePromotionOrder(row),
    shippingCarrier: row.shipping_carrier || null,
    trackingNumber: row.tracking_number || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

async function handleCreateBusinessCardOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const user = await getCurrentSessionUserProfile(req);
    const input = normalizeBusinessCardOrderInput(body);

    // 新增數位名片欄位前的舊資料庫也能先正常接單。
    // migration 已執行時會寫入 digital_card_opt_in；尚未執行時僅略過該欄位，不影響名片訂單本身。
    const orderInsertPayload: Record<string, any> = {
      user_id: user.userId,
      customer_email: user.email,
      service_type: input.serviceType,
      print_side: input.printSide,
      finish_type: input.finishType,
      quantity_cards: input.quantityCards,
      box_count: input.boxCount,
      template_id: input.templateId,
      template_title: input.templateTitle,
      need_qr: input.needQr,
      qr_link: input.qrLink,
      item_amount_ntd: input.itemAmountNtd,
      shipping_fee_ntd: input.shippingFeeNtd,
      brand_name: input.brandName,
      full_name: input.fullName,
      job_title: input.jobTitle,
      card_phone: input.cardPhone,
      line_id: input.lineId,
      card_email: input.cardEmail,
      website_url: input.websiteUrl,
      service_text: input.serviceText,
      recipient_name: input.recipientName,
      recipient_phone: input.recipientPhone,
      shipping_address: input.shippingAddress,
      customer_note: input.customerNote,
      digital_card_opt_in: input.digitalCardOptIn,
      status: 'awaiting_payment',
      source: 'website',
    };

    let insertResponse = await supabaseRest('business_card_orders', {
      method: 'POST',
      body: JSON.stringify(orderInsertPayload),
    });

    // 舊版表格尚未加 digital_card_opt_in 時，不能讓整張名片訂單送出失敗。
    if (!insertResponse.ok) {
      const firstErrorText = await insertResponse.text().catch(() => '');
      if (/digital_card_opt_in/i.test(firstErrorText)) {
        const { digital_card_opt_in: _ignored, ...legacyOrderInsertPayload } = orderInsertPayload;
        insertResponse = await supabaseRest('business_card_orders', {
          method: 'POST',
          body: JSON.stringify(legacyOrderInsertPayload),
        });
      } else {
        throw new Error(`BUSINESS_CARD_ORDER_CREATE_FAILED:${insertResponse.status}:${firstErrorText}`);
      }
    }

    if (!insertResponse.ok) {
      const text = await insertResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_ORDER_CREATE_FAILED:${insertResponse.status}:${text}`);
    }

    const rows = await insertResponse.json().catch(() => []);
    let order = Array.isArray(rows) ? rows[0] : rows;
    if (!order?.id || !order?.order_code) throw new Error('BUSINESS_CARD_ORDER_CREATE_EMPTY');

    // 防呆：名片流程固定為「先匯款、核對入帳後才排版」。
    // 即使資料庫的舊預設值或 trigger 回傳 submitted，也立即改回 awaiting_payment，
    // 避免客戶進入付款頁後被誤判為不需要匯款。
    if (safeText(order?.status) !== 'awaiting_payment') {
      const normalizeStatusResponse = await supabaseRest(
        `business_card_orders?id=eq.${encodeURIComponent(String(order.id))}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'awaiting_payment' }),
        },
      );

      if (!normalizeStatusResponse.ok) {
        const text = await normalizeStatusResponse.text().catch(() => '');
        throw new Error(`BUSINESS_CARD_ORDER_STATUS_INIT_FAILED:${normalizeStatusResponse.status}:${text}`);
      }

      const normalizedRows = await normalizeStatusResponse.json().catch(() => []);
      const normalizedOrder = Array.isArray(normalizedRows) ? normalizedRows[0] : normalizedRows;
      if (!normalizedOrder?.id || safeText(normalizedOrder?.status) !== 'awaiting_payment') {
        throw new Error('BUSINESS_CARD_ORDER_STATUS_INIT_EMPTY');
      }
      order = normalizedOrder;
    }

    await addBusinessCardOrderEvent({
      orderId: String(order.id),
      actorUserId: user.userId,
      actorRole: 'customer',
      eventType: 'order_created',
      fromStatus: null,
      toStatus: 'awaiting_payment',
      message: input.firstWavePromotion
        ? `客戶已建立首波體驗名片訂單：原價 NT$${input.regularItemAmountNtd + input.regularShippingFeeNtd}，活動合計 NT$${input.totalAmountNtd}；等待匯款。付款確認後將自動開通一頁式品牌網站基本版 3 個月。`
        : (input.serviceType === 'layout' && input.itemAmountNtd >= BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT
          ? '客戶已建立名片訂單，等待匯款；付款確認後將自動開通一頁式品牌網站基本版 3 個月。'
          : '客戶已建立名片訂單，等待匯款。'),
    });

    return jsonResponse(res, 201, {
      ok: true,
      order: businessCardOrderPayload(order),
      message: '名片需求已建立，請接續上傳附件。',
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '建立名片訂單失敗。',
    });
  }
}

async function handleUploadBusinessCardOrderFile(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  let storagePath = '';
  try {
    const user = await getCurrentSessionUserProfile(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!isBusinessCardUuid(orderId)) {
      throw businessCardError('訂單編號格式不正確。');
    }

    const orderResponse = await supabaseRest(
      `business_card_orders?select=id,service_type&user_id=eq.${encodeURIComponent(user.userId)}&id=eq.${encodeURIComponent(orderId)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!orderResponse.ok) {
      const text = await orderResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_ORDER_READ_FAILED:${orderResponse.status}:${text}`);
    }
    const orderRows = await orderResponse.json().catch(() => []);
    const order = Array.isArray(orderRows) ? orderRows[0] : null;
    if (!order?.id) {
      throw businessCardError('找不到此名片訂單或無權限上傳附件。', 404);
    }

    const originalFileName = businessCardSafeFileName(body?.fileName || body?.file_name);
    const { buffer, contentType } = normalizeBusinessCardFile(
      body?.base64 || body?.fileDataBase64 || body?.dataUrl,
      body?.contentType || body?.content_type,
    );
    const fileRole = readBusinessCardFileRole(body?.fileRole || body?.file_role, order.service_type as BusinessCardServiceType);
    const extension = businessCardFileExtension(contentType, originalFileName);
    storagePath = `orders/${user.userId}/${orderId}/${fileRole}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

    await uploadPrivateBusinessCardFile(storagePath, buffer, contentType);

    const fileInsertResponse = await supabaseRest('business_card_order_files', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        file_role: fileRole,
        storage_bucket: BUSINESS_CARD_BUCKET,
        storage_path: storagePath,
        original_file_name: originalFileName,
        content_type: contentType,
        size_bytes: buffer.length,
        uploaded_by_user_id: user.userId,
        uploaded_by_role: 'customer',
        is_customer_visible: true,
      }),
    });

    if (!fileInsertResponse.ok) {
      const text = await fileInsertResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_FILE_CREATE_FAILED:${fileInsertResponse.status}:${text}`);
    }

    const fileRows = await fileInsertResponse.json().catch(() => []);
    const file = Array.isArray(fileRows) ? fileRows[0] : fileRows;

    await supabaseRest('business_card_order_events', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        actor_user_id: user.userId,
        actor_role: 'customer',
        event_type: 'file_uploaded',
        message: `客戶已上傳附件：${originalFileName}`,
        metadata: {
          file_id: file?.id || null,
          file_role: fileRole,
          original_file_name: originalFileName,
        },
      }),
    });

    return jsonResponse(res, 201, {
      ok: true,
      file: {
        id: file?.id || null,
        fileRole,
        originalFileName,
        contentType,
        sizeBytes: buffer.length,
        createdAt: file?.created_at || null,
      },
    });
  } catch (error: any) {
    // 若 metadata 寫入失敗，暫不自動刪除 Storage 檔案；避免誤刪掉已成功保存的客戶原稿。
    console.error('BUSINESS_CARD_FILE_UPLOAD_FAILED', error);
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '上傳名片附件失敗。',
    });
  }
}

async function normalizeLegacySubmittedBusinessCardOrder(order: any) {
  if (!order?.id || safeText(order?.status) !== 'submitted') return order;

  const response = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(String(order.id))}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'awaiting_payment' }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_LEGACY_STATUS_NORMALIZE_FAILED:${response.status}:${text}`);
  }
  return { ...order, status: 'awaiting_payment' };
}

async function handleGetMyBusinessCardOrders(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const user = await getCurrentSessionUserProfile(req);
    const response = await supabaseRest(
      `business_card_orders?select=*&user_id=eq.${encodeURIComponent(user.userId)}&order=created_at.desc&limit=100`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_ORDER_LIST_FAILED:${response.status}:${text}`);
    }

    const rows = await response.json().catch(() => []);
    const normalizedRows = Array.isArray(rows)
      ? await Promise.all(rows.map((row: any) => normalizeLegacySubmittedBusinessCardOrder(row)))
      : [];
    return jsonResponse(res, 200, {
      ok: true,
      orders: normalizedRows.map(businessCardOrderPayload),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取名片訂單失敗。',
    });
  }
}


// =========================================================
// 人工名片訂單管理後台
// - 只允許 RXV_ADMIN_EMAILS 中的管理者存取。
// - 客戶附件 bucket 為 private；後台取得短時效 signed URL，不公開檔案。
// =========================================================

type BusinessCardOrderStatus =
  | 'submitted'
  | 'reviewing'
  | 'designing'
  | 'preview_ready'
  | 'revision_requested'
  | 'awaiting_customer_confirmation'
  | 'awaiting_payment'
  | 'payment_reported'
  | 'payment_verified'
  | 'printing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

const BUSINESS_CARD_ORDER_STATUSES = new Set<BusinessCardOrderStatus>([
  'submitted',
  'reviewing',
  'designing',
  'preview_ready',
  'revision_requested',
  'awaiting_customer_confirmation',
  'awaiting_payment',
  'payment_reported',
  'payment_verified',
  'printing',
  'shipped',
  'completed',
  'cancelled',
]);

function businessCardAdminOrderPayload(row: any, filesCount = 0) {
  return {
    id: String(row?.id || ''),
    orderCode: safeText(row?.order_code),
    userId: safeText(row?.user_id),
    customerEmail: normalizeEmail(row?.customer_email),
    serviceType: safeText(row?.service_type),
    printSide: safeText(row?.print_side),
    finishType: safeText(row?.finish_type),
    quantityCards: Number(row?.quantity_cards || 0),
    boxCount: Number(row?.box_count || 0),
    templateId: row?.template_id || null,
    templateTitle: row?.template_title || null,
    needQr: Boolean(row?.need_qr),
    qrLink: row?.qr_link || null,
    itemAmountNtd: Number(row?.item_amount_ntd || 0),
    shippingFeeNtd: Number(row?.shipping_fee_ntd || 0),
    totalAmountNtd: Number(row?.total_amount_ntd || 0),
    brandName: row?.brand_name || null,
    fullName: row?.full_name || null,
    jobTitle: row?.job_title || null,
    cardPhone: row?.card_phone || null,
    lineId: row?.line_id || null,
    cardEmail: row?.card_email || null,
    websiteUrl: row?.website_url || null,
    serviceText: row?.service_text || null,
    recipientName: row?.recipient_name || null,
    recipientPhone: row?.recipient_phone || null,
    shippingAddress: row?.shipping_address || null,
    customerNote: row?.customer_note || null,
    adminNote: row?.admin_note || null,
    previewNote: row?.preview_note || null,
    status: safeText(row?.status),
    revisionCount: Number(row?.revision_count || 0),
    digitalCardOptIn: Boolean(row?.digital_card_opt_in),
    firstWavePromotion: isBusinessCardFirstWavePromotionOrder(row),
    shippingCarrier: row?.shipping_carrier || null,
    trackingNumber: row?.tracking_number || null,
    filesCount,
    createdAt: row?.created_at || null,
    updatedAt: row?.updated_at || null,
  };
}

function storageSignedObjectUrl(bucket: string, objectPath: string) {
  const encodedPath = objectPath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodedPath}`;
}

async function createPrivateBusinessCardSignedUrl(bucket: string, objectPath: string, expiresIn = 900) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_ENV_MISSING');
  }

  const response = await fetch(storageSignedObjectUrl(bucket, objectPath), {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_SIGN_URL_FAILED:${response.status}:${text}`);
  }

  const payload = await response.json().catch(() => ({}));
  const signed = safeText(payload?.signedURL || payload?.signedUrl || payload?.url);
  if (!signed) throw new Error('BUSINESS_CARD_SIGN_URL_EMPTY');
  return /^https?:\/\//i.test(signed)
    ? signed
    : `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1${signed.startsWith('/') ? signed : `/${signed}`}`;
}

async function handleAdminListBusinessCardOrders(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);

    const response = await supabaseRest(
      'business_card_orders?select=*&order=created_at.desc&limit=200',
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`讀取名片訂單失敗：${text || response.status}`);
    }

    const rows = await response.json().catch(() => []);
    const normalizedRows = Array.isArray(rows) ? rows : [];
    const orderIds = normalizedRows
      .map((row: any) => safeText(row?.id))
      .filter(isBusinessCardUuid);

    const fileCountByOrderId = new Map<string, number>();
    if (orderIds.length) {
      const filesResponse = await supabaseRest(
        `business_card_order_files?select=order_id&order_id=in.(${orderIds.join(',')})&limit=1000`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (filesResponse.ok) {
        const files = await filesResponse.json().catch(() => []);
        for (const file of Array.isArray(files) ? files : []) {
          const orderId = safeText(file?.order_id);
          if (orderId) fileCountByOrderId.set(orderId, (fileCountByOrderId.get(orderId) || 0) + 1);
        }
      }
    }

    const orders = normalizedRows.map((row: any) =>
      businessCardAdminOrderPayload(row, fileCountByOrderId.get(safeText(row?.id)) || 0),
    );

    const activeStatuses = new Set<BusinessCardOrderStatus>([
      'submitted',
      'reviewing',
      'designing',
      'preview_ready',
      'revision_requested',
      'awaiting_customer_confirmation',
      'awaiting_payment',
      'payment_reported',
      'payment_verified',
      'printing',
    ]);

    return jsonResponse(res, 200, {
      ok: true,
      orders,
      summary: {
        newCount: orders.filter((order: any) => order.status === 'submitted').length,
        activeCount: orders.filter((order: any) => activeStatuses.has(order.status as BusinessCardOrderStatus)).length,
        awaitingPaymentCount: orders.filter((order: any) => ['awaiting_payment', 'payment_reported'].includes(order.status)).length,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取名片訂單失敗。',
    });
  }
}

async function handleAdminUpdateBusinessCardOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    const nextStatus = safeText(body?.status) as BusinessCardOrderStatus;
    if (!isBusinessCardUuid(orderId)) {
      return jsonResponse(res, 400, { ok: false, error: '名片訂單 ID 不正確。' });
    }
    if (!BUSINESS_CARD_ORDER_STATUSES.has(nextStatus)) {
      return jsonResponse(res, 400, { ok: false, error: '名片訂單狀態不正確。' });
    }

    const currentResponse = await supabaseRest(
      `business_card_orders?select=id,status,admin_note&id=eq.${encodeURIComponent(orderId)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!currentResponse.ok) {
      const text = await currentResponse.text().catch(() => '');
      throw new Error(`讀取名片訂單失敗：${text || currentResponse.status}`);
    }
    const currentRows = await currentResponse.json().catch(() => []);
    const current = Array.isArray(currentRows) ? currentRows[0] : null;
    if (!current?.id) {
      return jsonResponse(res, 404, { ok: false, error: '找不到名片訂單。' });
    }

    const hasAdminNote = Object.prototype.hasOwnProperty.call(body || {}, 'adminNote') ||
      Object.prototype.hasOwnProperty.call(body || {}, 'admin_note');
    const updatePayload: Record<string, any> = { status: nextStatus };
    if (hasAdminNote) {
      updatePayload.admin_note = businessCardText(body?.adminNote ?? body?.admin_note, 3000);
    }

    const now = new Date().toISOString();
    if (nextStatus === 'payment_verified') updatePayload.payment_verified_at = now;
    if (nextStatus === 'printing') updatePayload.printing_started_at = now;
    if (nextStatus === 'shipped') updatePayload.shipped_at = now;
    if (nextStatus === 'completed') updatePayload.completed_at = now;
    if (nextStatus === 'cancelled') {
      updatePayload.cancelled_at = now;
      updatePayload.cancel_reason = businessCardText(body?.cancelReason || body?.cancel_reason, 1000);
    }

    const updateResponse = await supabaseRest(
      `business_card_orders?id=eq.${encodeURIComponent(orderId)}`,
      { method: 'PATCH', body: JSON.stringify(updatePayload) },
    );
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`更新名片訂單失敗：${text || updateResponse.status}`);
    }
    const updatedRows = await updateResponse.json().catch(() => []);
    const updated = Array.isArray(updatedRows) ? updatedRows[0] : null;

    const statusChanged = safeText(current.status) !== nextStatus;
    const eventPayload = {
      order_id: orderId,
      actor_user_id: admin.userId,
      actor_role: 'admin',
      event_type: statusChanged ? 'status_changed' : 'admin_note_updated',
      from_status: safeText(current.status) || null,
      to_status: nextStatus,
      message: statusChanged
        ? `管理者將訂單狀態由「${safeText(current.status)}」更新為「${nextStatus}」。`
        : '管理者更新名片訂單內部備註。',
      metadata: { admin_email: admin.email },
    };
    const eventResponse = await supabaseRest('business_card_order_events', {
      method: 'POST',
      body: JSON.stringify(eventPayload),
    });
    if (!eventResponse.ok) {
      const text = await eventResponse.text().catch(() => '');
      throw new Error(`名片訂單歷程寫入失敗：${text || eventResponse.status}`);
    }

    return jsonResponse(res, 200, {
      ok: true,
      order: businessCardAdminOrderPayload(updated || { ...current, ...updatePayload }),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '更新名片訂單失敗。',
    });
  }
}

async function handleAdminGetBusinessCardOrderFiles(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);
    const orderId = safeText(req?.query?.orderId || req?.query?.order_id);
    if (!isBusinessCardUuid(orderId)) {
      return jsonResponse(res, 400, { ok: false, error: '名片訂單 ID 不正確。' });
    }

    const filesResponse = await supabaseRest(
      `business_card_order_files?select=id,order_id,file_role,storage_bucket,storage_path,original_file_name,content_type,size_bytes,uploaded_by_role,is_customer_visible,created_at&order_id=eq.${encodeURIComponent(orderId)}&order=created_at.asc&limit=100`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!filesResponse.ok) {
      const text = await filesResponse.text().catch(() => '');
      throw new Error(`讀取名片附件失敗：${text || filesResponse.status}`);
    }

    const rows = await filesResponse.json().catch(() => []);
    const files = await Promise.all(
      (Array.isArray(rows) ? rows : []).map(async (file: any) => {
        const bucket = safeText(file?.storage_bucket) || BUSINESS_CARD_BUCKET;
        const storagePath = safeText(file?.storage_path);
        let signedUrl = '';
        if (storagePath) {
          signedUrl = await createPrivateBusinessCardSignedUrl(bucket, storagePath, 900);
        }
        return {
          id: String(file?.id || ''),
          fileRole: safeText(file?.file_role),
          originalFileName: safeText(file?.original_file_name),
          contentType: safeText(file?.content_type),
          sizeBytes: Number(file?.size_bytes || 0),
          uploadedByRole: safeText(file?.uploaded_by_role),
          isCustomerVisible: Boolean(file?.is_customer_visible),
          createdAt: file?.created_at || null,
          signedUrl,
        };
      }),
    );

    return jsonResponse(res, 200, { ok: true, files });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), {
      ok: false,
      error: error?.message || '讀取名片附件失敗。',
    });
  }
}

// =========================================================
// 人工名片訂單完整流程：客戶預覽／修改／匯款、管理者預覽上傳／付款核對／寄送／數位名片頁
// =========================================================

type BusinessCardDigitalProfileStatus = 'draft' | 'active' | 'expired' | 'disabled';
type BusinessCardPaymentReportStatus = 'reported' | 'verified' | 'rejected' | 'cancelled';

function businessCardPublicStatusLabel(status: string) {
  const labels: Record<string, string> = {
    submitted: '已送出需求',
    reviewing: '資料確認中',
    designing: '排版中',
    preview_ready: '預覽稿已完成',
    revision_requested: '等待修改',
    awaiting_customer_confirmation: '等待確認預覽',
    awaiting_payment: '等待匯款',
    payment_reported: '已回填匯款，等待核對',
    payment_verified: '已確認入帳',
    printing: '已送印',
    shipped: '已寄出',
    completed: '已完成',
    cancelled: '已取消',
  };
  return labels[safeText(status)] || safeText(status) || '處理中';
}

async function addBusinessCardOrderEvent(input: {
  orderId: string;
  actorUserId?: string | null;
  actorRole: 'customer' | 'admin' | 'system';
  eventType: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  message: string;
  metadata?: Record<string, any>;
}) {
  const response = await supabaseRest('business_card_order_events', {
    method: 'POST',
    body: JSON.stringify({
      order_id: input.orderId,
      actor_user_id: input.actorUserId || null,
      actor_role: input.actorRole,
      event_type: input.eventType,
      from_status: input.fromStatus || null,
      to_status: input.toStatus || null,
      message: safeText(input.message).slice(0, 2000),
      metadata: input.metadata || {},
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_EVENT_FAILED:${response.status}:${text}`);
  }
}

async function getBusinessCardOrderForOwner(userId: string, orderId: string, select = '*') {
  const response = await supabaseRest(
    `business_card_orders?select=${encodeURIComponent(select)}&id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_ORDER_READ_FAILED:${response.status}:${text}`);
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function getBusinessCardOrderForAdmin(orderId: string, select = '*') {
  const response = await supabaseRest(
    `business_card_orders?select=${encodeURIComponent(select)}&id=eq.${encodeURIComponent(orderId)}&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_ORDER_READ_FAILED:${response.status}:${text}`);
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function getBusinessCardFilesForOrder(orderId: string, customerVisibleOnly = false) {
  const visibleFilter = customerVisibleOnly ? '&is_customer_visible=eq.true' : '';
  const response = await supabaseRest(
    `business_card_order_files?select=id,order_id,file_role,storage_bucket,storage_path,original_file_name,content_type,size_bytes,uploaded_by_role,is_customer_visible,created_at&order_id=eq.${encodeURIComponent(orderId)}${visibleFilter}&order=created_at.asc&limit=100`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_FILES_READ_FAILED:${response.status}:${text}`);
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

async function serializeBusinessCardFilesWithSignedUrl(rows: any[], expiresIn = 900) {
  return Promise.all(
    rows.map(async (file: any) => {
      const bucket = safeText(file?.storage_bucket) || BUSINESS_CARD_BUCKET;
      const objectPath = safeText(file?.storage_path);
      const signedUrl = objectPath ? await createPrivateBusinessCardSignedUrl(bucket, objectPath, expiresIn) : '';
      return {
        id: safeText(file?.id),
        fileRole: safeText(file?.file_role),
        originalFileName: safeText(file?.original_file_name),
        contentType: safeText(file?.content_type),
        sizeBytes: Number(file?.size_bytes || 0),
        uploadedByRole: safeText(file?.uploaded_by_role),
        isCustomerVisible: Boolean(file?.is_customer_visible),
        createdAt: file?.created_at || null,
        signedUrl,
      };
    }),
  );
}

function businessCardCustomerDetailPayload(row: any) {
  return {
    ...businessCardOrderPayload(row),
    brandName: row?.brand_name || null,
    fullName: row?.full_name || null,
    jobTitle: row?.job_title || null,
    cardPhone: row?.card_phone || null,
    lineId: row?.line_id || null,
    cardEmail: row?.card_email || null,
    websiteUrl: row?.website_url || null,
    serviceText: row?.service_text || null,
    customerNote: row?.customer_note || null,
    recipientName: row?.recipient_name || null,
    recipientPhone: row?.recipient_phone || null,
    shippingAddress: row?.shipping_address || null,
    digitalCardOptIn: Boolean(row?.digital_card_opt_in),
    shippingCarrier: row?.shipping_carrier || null,
    trackingNumber: row?.tracking_number || null,
    customerConfirmedAt: row?.customer_confirmed_at || null,
    paymentVerifiedAt: row?.payment_verified_at || null,
    printingStartedAt: row?.printing_started_at || null,
    shippedAt: row?.shipped_at || null,
    completedAt: row?.completed_at || null,
  };
}

async function getBusinessCardPaymentSummary(orderId: string) {
  const response = await supabaseRest(
    `business_card_payment_reports?select=id,payer_name,payer_email,amount_ntd,account_last_five,transferred_at,note,status,review_note,reviewed_at,created_at&order_id=eq.${encodeURIComponent(orderId)}&order=created_at.desc&limit=5`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!response.ok) return [];
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows)
    ? rows.map((row: any) => ({
        id: safeText(row?.id),
        payerName: safeText(row?.payer_name),
        payerEmail: safeText(row?.payer_email),
        amountNtd: Number(row?.amount_ntd || 0),
        accountLastFive: safeText(row?.account_last_five),
        transferredAt: row?.transferred_at || null,
        note: row?.note || null,
        status: safeText(row?.status),
        reviewNote: row?.review_note || null,
        reviewedAt: row?.reviewed_at || null,
        createdAt: row?.created_at || null,
      }))
    : [];
}

async function getBusinessCardDigitalProfileForOrder(orderId: string) {
  // 新流程：名片贈送的基本數位名片使用同一個「個人／公司介紹頁」(/shop/slug)。
  // 以 storefront_entitlements.source_reference 綁定訂單，未來加購商品展示仍沿用同一網址。
  const entitlementResponse = await supabaseRest(
    `storefront_entitlements?select=id,storefront_id,plan_code,expires_at,status&grant_source=eq.business_card_order&source_reference=eq.${encodeURIComponent(orderId)}&status=eq.active&order=created_at.desc&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (entitlementResponse.ok) {
    const entitlementRows = await entitlementResponse.json().catch(() => []);
    const entitlement = Array.isArray(entitlementRows) ? entitlementRows[0] : null;
    const storefrontId = safeText(entitlement?.storefront_id);
    if (storefrontId) {
      const storefrontResponse = await supabaseRest(
        `storefronts?select=id,slug,display_name,status,is_public,expires_at& id=eq.${encodeURIComponent(storefrontId)}&limit=1`.replace('& id=', '&id='),
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (storefrontResponse.ok) {
        const storefrontRows = await storefrontResponse.json().catch(() => []);
        const storefront = Array.isArray(storefrontRows) ? storefrontRows[0] : null;
        if (storefront?.id && safeText(storefront?.slug)) {
          return {
            id: safeText(entitlement?.id),
            slug: safeText(storefront?.slug),
            displayName: safeText(storefront?.display_name),
            headline: null,
            status: Boolean(storefront?.is_public) && safeText(storefront?.status) === 'published' ? 'published' : 'draft',
            expiresAt: storefront?.expires_at || entitlement?.expires_at || null,
            createdAt: null,
            updatedAt: null,
            publicPath: `/shop/${safeText(storefront?.slug)}`,
          };
        }
      }
    }
  }

  // 舊訂單仍保留原本 /card/ 網址，避免過去已分享的 QR Code 失效。
  const legacyResponse = await supabaseRest(
    `business_card_digital_profiles?select=id,order_id,slug,display_name,headline,status,expires_at,created_at,updated_at&order_id=eq.${encodeURIComponent(orderId)}&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!legacyResponse.ok) return null;
  const legacyRows = await legacyResponse.json().catch(() => []);
  const legacy = Array.isArray(legacyRows) ? legacyRows[0] : null;
  if (!legacy?.id) return null;
  return {
    id: safeText(legacy?.id),
    slug: safeText(legacy?.slug),
    displayName: safeText(legacy?.display_name),
    headline: legacy?.headline || null,
    status: safeText(legacy?.status) === 'active' ? 'published' : safeText(legacy?.status),
    expiresAt: legacy?.expires_at || null,
    createdAt: legacy?.created_at || null,
    updatedAt: legacy?.updated_at || null,
    publicPath: `/card/${safeText(legacy?.slug)}`,
  };
}

async function handleGetMyBusinessCardOrderDetail(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const user = await getCurrentSessionUserProfile(req);
    const orderId = safeText(req?.query?.orderId || req?.query?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    let order = await getBusinessCardOrderForOwner(user.userId, orderId);
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此名片訂單。' });
    order = await normalizeLegacySubmittedBusinessCardOrder(order);

    const [filesRows, paymentReports, digitalProfile, eventsResponse] = await Promise.all([
      getBusinessCardFilesForOrder(orderId, true),
      getBusinessCardPaymentSummary(orderId),
      getBusinessCardDigitalProfileForOrder(orderId),
      supabaseRest(
        `business_card_order_events?select=id,actor_role,event_type,from_status,to_status,message,created_at&order_id=eq.${encodeURIComponent(orderId)}&event_type=neq.admin_note_updated&order=created_at.asc&limit=100`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
    ]);

    const eventRows = eventsResponse.ok ? await eventsResponse.json().catch(() => []) : [];
    const files = await serializeBusinessCardFilesWithSignedUrl(filesRows, 900);
    const events = (Array.isArray(eventRows) ? eventRows : []).map((event: any) => ({
      id: safeText(event?.id),
      actorRole: safeText(event?.actor_role),
      eventType: safeText(event?.event_type),
      fromStatus: event?.from_status || null,
      toStatus: event?.to_status || null,
      message: safeText(event?.message),
      createdAt: event?.created_at || null,
    }));

    return jsonResponse(res, 200, {
      ok: true,
      order: businessCardCustomerDetailPayload(order),
      files,
      events,
      paymentReports,
      digitalProfile,
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取名片訂單詳細資料失敗。' });
  }
}

async function handleCustomerRequestBusinessCardRevision(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const user = await getCurrentSessionUserProfile(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    const message = businessCardText(body?.message || body?.revisionMessage || body?.revision_message, 1200);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    if (!message || message.length < 2) throw businessCardError('請填寫需要修改的文字或內容。');

    const order = await getBusinessCardOrderForOwner(user.userId, orderId, 'id,status,revision_count,revision_limit');
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此名片訂單。' });
    const currentStatus = safeText(order?.status);
    if (!['preview_ready', 'awaiting_customer_confirmation'].includes(currentStatus)) {
      throw businessCardError('目前尚未進入可確認預覽的階段。');
    }
    const revisionCount = Number(order?.revision_count || 0);
    const revisionLimit = Number(order?.revision_limit || 1);
    if (revisionCount >= revisionLimit) {
      throw businessCardError(`此訂單已使用 ${revisionLimit} 次文字修改，若有其他需求請與工作室確認。`);
    }

    const updateResponse = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'revision_requested', revision_count: revisionCount + 1 }),
    });
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_REVISION_UPDATE_FAILED:${updateResponse.status}:${text}`);
    }

    await addBusinessCardOrderEvent({
      orderId,
      actorUserId: user.userId,
      actorRole: 'customer',
      eventType: 'revision_requested',
      fromStatus: currentStatus,
      toStatus: 'revision_requested',
      message: `客戶提出第 ${revisionCount + 1} 次文字修改：${message}`,
      metadata: { revision_message: message, revision_count: revisionCount + 1 },
    });

    return jsonResponse(res, 200, { ok: true, status: 'revision_requested', revisionCount: revisionCount + 1 });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '送出修改需求失敗。' });
  }
}

async function handleCustomerConfirmBusinessCardPreview(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const user = await getCurrentSessionUserProfile(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    const order = await getBusinessCardOrderForOwner(user.userId, orderId, 'id,status');
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此名片訂單。' });
    const currentStatus = safeText(order?.status);
    if (!['preview_ready', 'awaiting_customer_confirmation'].includes(currentStatus)) {
      throw businessCardError('目前尚未進入確認預覽的階段。');
    }

    const now = new Date().toISOString();
    const updateResponse = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'printing', customer_confirmed_at: now }),
    });
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_CONFIRM_UPDATE_FAILED:${updateResponse.status}:${text}`);
    }
    await addBusinessCardOrderEvent({
      orderId,
      actorUserId: user.userId,
      actorRole: 'customer',
      eventType: 'preview_confirmed',
      fromStatus: currentStatus,
      toStatus: 'printing',
      message: '客戶已確認預覽稿，安排送印。',
    });
    return jsonResponse(res, 200, { ok: true, status: 'printing' });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '確認預覽稿失敗。' });
  }
}

async function handleGetBusinessCardBankTransferInfo(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const user = await getCurrentSessionUserProfile(req);
    const orderId = safeText(req?.query?.orderId || req?.query?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    let order = await getBusinessCardOrderForOwner(user.userId, orderId, 'id,order_code,total_amount_ntd,status');
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此名片訂單。' });
    order = await normalizeLegacySubmittedBusinessCardOrder(order);
    if (!['awaiting_payment', 'payment_reported'].includes(safeText(order?.status))) {
      throw businessCardError('此訂單目前無法進行匯款，請重新整理後再確認。');
    }
    const settings = getBankTransferSettings();
    if (!settings.enabled) throw businessCardError('銀行轉帳尚未開放，請稍後再試。', 503);
    return jsonResponse(res, 200, {
      ok: true,
      orderCode: safeText(order?.order_code),
      amountNtd: Number(order?.total_amount_ntd || 0),
      bank: {
        name: settings.bankName,
        code: settings.bankCode,
        branch: settings.bankBranch,
        account: settings.bankAccount,
        accountName: settings.accountName,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取名片匯款資訊失敗。' });
  }
}

async function handleCreateBusinessCardPaymentReport(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const user = await getCurrentSessionUserProfile(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    const order = await getBusinessCardOrderForOwner(user.userId, orderId, 'id,order_code,status,total_amount_ntd');
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此名片訂單。' });
    const currentStatus = safeText(order?.status);
    if (!['submitted', 'awaiting_payment'].includes(currentStatus)) {
      throw businessCardError('目前訂單不是等待匯款狀態，請重新整理後再確認。');
    }

    const amountNtd = Number(body?.amountNtd || body?.amount_ntd || 0);
    const expectedAmount = Number(order?.total_amount_ntd || 0);
    if (!Number.isInteger(amountNtd) || amountNtd !== expectedAmount) {
      throw businessCardError(`此訂單匯款金額應為 NT$${expectedAmount.toLocaleString()}。`);
    }
    const payerName = businessCardText(body?.payerName || body?.payer_name, 120);
    if (!payerName) throw businessCardError('請填寫匯款人姓名。');
    const accountLastFive = safeText(body?.accountLastFive || body?.account_last_five);
    if (!/^\d{5}$/.test(accountLastFive)) throw businessCardError('請輸入匯出帳號後五碼（5 位數字）。');
    const transferredAt = parseTaipeiTransferDate(body?.transferDate || body?.transfer_date || body?.transferredAt || body?.transferred_at);
    const note = businessCardText(body?.note, 500);
    const proofFileId = safeText(body?.paymentProofFileId || body?.payment_proof_file_id);
    if (proofFileId && !isBusinessCardUuid(proofFileId)) throw businessCardError('付款證明附件格式不正確。');

    if (proofFileId) {
      const proofResponse = await supabaseRest(
        `business_card_order_files?select=id,file_role&order_id=eq.${encodeURIComponent(orderId)}&id=eq.${encodeURIComponent(proofFileId)}&file_role=eq.payment_proof&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      const proofRows = proofResponse.ok ? await proofResponse.json().catch(() => []) : [];
      if (!Array.isArray(proofRows) || !proofRows[0]?.id) throw businessCardError('找不到付款證明附件。');
    }

    const insertResponse = await supabaseRest('business_card_payment_reports', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        payer_name: payerName,
        payer_email: user.email,
        amount_ntd: amountNtd,
        account_last_five: accountLastFive,
        transferred_at: transferredAt,
        note,
        payment_proof_file_id: proofFileId || null,
        status: 'reported',
      }),
    });
    if (!insertResponse.ok) {
      const text = await insertResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_PAYMENT_CREATE_FAILED:${insertResponse.status}:${text}`);
    }
    const rows = await insertResponse.json().catch(() => []);
    const report = Array.isArray(rows) ? rows[0] : rows;

    const updateResponse = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'payment_reported' }),
    });
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_PAYMENT_STATUS_FAILED:${updateResponse.status}:${text}`);
    }
    await addBusinessCardOrderEvent({
      orderId,
      actorUserId: user.userId,
      actorRole: 'customer',
      eventType: 'payment_reported',
      fromStatus: currentStatus,
      toStatus: 'payment_reported',
      message: `客戶已回填匯款資料，金額 NT$${amountNtd.toLocaleString()}，等待工作室核對。`,
      metadata: { report_id: report?.id || null },
    });

    return jsonResponse(res, 201, { ok: true, reportId: report?.id || null, status: 'payment_reported' });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '送出名片匯款回報失敗。' });
  }
}

function readAdminPreviewFile(input: any, fallbackName: string) {
  const originalFileName = businessCardSafeFileName(input?.fileName || input?.file_name || fallbackName);
  const { buffer, contentType } = normalizeBusinessCardFile(input?.base64 || input?.fileDataBase64 || input?.dataUrl, input?.contentType || input?.content_type);
  return { originalFileName, buffer, contentType };
}

async function insertAdminBusinessCardFile(
  adminUserId: string,
  orderId: string,
  role: 'preview_front' | 'preview_back',
  input: any,
  isCustomerVisible = true,
) {
  const file = readAdminPreviewFile(input, role === 'preview_front' ? 'preview-front.png' : 'preview-back.png');
  const extension = businessCardFileExtension(file.contentType, file.originalFileName);
  const storagePath = `orders/admin/${orderId}/${role}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await uploadPrivateBusinessCardFile(storagePath, file.buffer, file.contentType);
  const response = await supabaseRest('business_card_order_files', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      file_role: role,
      storage_bucket: BUSINESS_CARD_BUCKET,
      storage_path: storagePath,
      original_file_name: file.originalFileName,
      content_type: file.contentType,
      size_bytes: file.buffer.length,
      uploaded_by_user_id: adminUserId,
      uploaded_by_role: 'admin',
      is_customer_visible: isCustomerVisible,
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_PREVIEW_FILE_CREATE_FAILED:${response.status}:${text}`);
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows[0] : rows;
}

async function updateBusinessCardPreviewVisibility(fileIds: string[], isCustomerVisible: boolean) {
  const ids = Array.from(new Set(fileIds.filter(Boolean)));
  if (!ids.length) return;
  const response = await supabaseRest(
    `business_card_order_files?id=in.(${ids.map((id) => encodeURIComponent(id)).join(',')})`,
    {
      method: 'PATCH',
      body: JSON.stringify({ is_customer_visible: isCustomerVisible }),
    },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`BUSINESS_CARD_PREVIEW_VISIBILITY_UPDATE_FAILED:${response.status}:${text}`);
  }
}

async function handleAdminUploadBusinessCardPreview(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireManualPaymentAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    const order = await getBusinessCardOrderForAdmin(orderId, 'id,status');
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到名片訂單。' });

    const currentStatus = safeText(order?.status);
    const editableStatuses = new Set(['payment_verified', 'awaiting_customer_confirmation', 'revision_requested']);
    if (!editableStatuses.has(currentStatus)) {
      throw businessCardError('請先核對客戶匯款入帳後再上傳排版預覽稿；客戶提出修改後也可在此重新上傳新版預覽。');
    }

    const rolesToReplace: Array<'preview_front' | 'preview_back'> = [];
    if (body?.previewFront) rolesToReplace.push('preview_front');
    if (body?.previewBack) rolesToReplace.push('preview_back');
    if (!rolesToReplace.length) throw businessCardError('請至少上傳正面或背面預覽圖。');

    // 先把新版檔案以「暫不公開」方式存入。全部成功後才切換顧客可見版本，避免上傳失敗時舊稿消失。
    const existingVisibleFiles = (await getBusinessCardFilesForOrder(orderId, true))
      .filter((file: any) => rolesToReplace.includes(safeText(file?.file_role) as 'preview_front' | 'preview_back'));

    const files: any[] = [];
    if (body?.previewFront) files.push(await insertAdminBusinessCardFile(admin.userId, orderId, 'preview_front', body.previewFront, false));
    if (body?.previewBack) files.push(await insertAdminBusinessCardFile(admin.userId, orderId, 'preview_back', body.previewBack, false));

    const previewNote = businessCardText(body?.previewNote || body?.preview_note, 2000);
    const updateResponse = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'awaiting_customer_confirmation', preview_note: previewNote }),
    });
    if (!updateResponse.ok) {
      const text = await updateResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_PREVIEW_UPDATE_FAILED:${updateResponse.status}:${text}`);
    }

    // 新檔先公開，再隱藏同一面的舊檔；即使切換中斷，客戶也至少仍看得到一份可確認的預覽。
    await updateBusinessCardPreviewVisibility(files.map((file: any) => safeText(file?.id)), true);
    await updateBusinessCardPreviewVisibility(existingVisibleFiles.map((file: any) => safeText(file?.id)), false);

    const isReplacement = currentStatus !== 'payment_verified';
    await addBusinessCardOrderEvent({
      orderId,
      actorUserId: admin.userId,
      actorRole: 'admin',
      eventType: isReplacement ? 'preview_reuploaded' : 'preview_uploaded',
      fromStatus: currentStatus,
      toStatus: 'awaiting_customer_confirmation',
      message: isReplacement
        ? '工作室已更新名片預覽稿，請客戶重新登入查看並確認。'
        : '工作室已上傳名片預覽稿，請客戶登入查看並確認。',
      metadata: {
        preview_files: files.map((file: any) => file?.id || null),
        replaced_preview_files: existingVisibleFiles.map((file: any) => file?.id || null),
      },
    });
    return jsonResponse(res, 201, {
      ok: true,
      status: 'awaiting_customer_confirmation',
      filesCount: files.length,
      replacedFilesCount: existingVisibleFiles.length,
      isReplacement,
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '上傳名片預覽稿失敗。' });
  }
}

async function handleAdminListBusinessCardPaymentReports(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireManualPaymentAdmin(req);
    const response = await supabaseRest(
      'business_card_payment_reports?select=id,order_id,payer_name,payer_email,amount_ntd,account_last_five,transferred_at,note,payment_proof_file_id,status,created_at&status=eq.reported&order=created_at.asc&limit=200',
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_PAYMENT_LIST_FAILED:${response.status}:${text}`);
    }
    const reportRows = await response.json().catch(() => []);
    const reports = Array.isArray(reportRows) ? reportRows : [];
    const orderIds = [...new Set(reports.map((row: any) => safeText(row?.order_id)).filter(isBusinessCardUuid))];
    const orderMap = new Map<string, any>();
    if (orderIds.length) {
      const ordersResponse = await supabaseRest(
        `business_card_orders?select=id,order_code,customer_email,total_amount_ntd,status,brand_name,full_name& id=in.(${orderIds.join(',')})`.replace('& id=', '&id='),
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json().catch(() => []);
        for (const order of Array.isArray(orders) ? orders : []) orderMap.set(safeText(order?.id), order);
      }
    }
    return jsonResponse(res, 200, {
      ok: true,
      reports: reports.map((report: any) => {
        const order = orderMap.get(safeText(report?.order_id));
        return {
          id: safeText(report?.id),
          orderId: safeText(report?.order_id),
          orderCode: safeText(order?.order_code),
          customerEmail: safeText(order?.customer_email || report?.payer_email),
          customerName: safeText(order?.brand_name || order?.full_name),
          expectedAmountNtd: Number(order?.total_amount_ntd || 0),
          payerName: safeText(report?.payer_name),
          payerEmail: safeText(report?.payer_email),
          amountNtd: Number(report?.amount_ntd || 0),
          accountLastFive: safeText(report?.account_last_five),
          transferredAt: report?.transferred_at || null,
          note: report?.note || null,
          paymentProofFileId: report?.payment_proof_file_id || null,
          status: safeText(report?.status),
          createdAt: report?.created_at || null,
        };
      }),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取名片匯款回報失敗。' });
  }
}

async function handleAdminReviewBusinessCardPayment(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireManualPaymentAdmin(req);
    const reportId = safeText(body?.reportId || body?.report_id);
    const decision = safeText(body?.decision || body?.status);
    const reviewNote = businessCardText(body?.reviewNote || body?.review_note, 1000);
    if (!isBusinessCardUuid(reportId)) throw businessCardError('匯款回報 ID 不正確。');
    if (!['verified', 'rejected'].includes(decision)) throw businessCardError('核對結果不正確。');

    const reportResponse = await supabaseRest(
      `business_card_payment_reports?select=id,order_id,status,amount_ntd& id=eq.${encodeURIComponent(reportId)}&limit=1`.replace('& id=', '&id='),
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!reportResponse.ok) {
      const text = await reportResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_PAYMENT_READ_FAILED:${reportResponse.status}:${text}`);
    }
    const reportRows = await reportResponse.json().catch(() => []);
    const report = Array.isArray(reportRows) ? reportRows[0] : null;
    if (!report?.id) return jsonResponse(res, 404, { ok: false, error: '找不到名片匯款回報。' });
    if (safeText(report?.status) !== 'reported') throw businessCardError('此匯款回報已處理。');

    const now = new Date().toISOString();
    const reviewResponse = await supabaseRest(`business_card_payment_reports?id=eq.${encodeURIComponent(reportId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: decision, reviewed_by: admin.userId, reviewed_at: now, review_note: reviewNote }),
    });
    if (!reviewResponse.ok) {
      const text = await reviewResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_PAYMENT_REVIEW_FAILED:${reviewResponse.status}:${text}`);
    }

    const orderId = safeText(report?.order_id);
    const nextStatus: BusinessCardOrderStatus = decision === 'verified' ? 'payment_verified' : 'awaiting_payment';
    const orderResponse = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify(decision === 'verified' ? { status: nextStatus, payment_verified_at: now } : { status: nextStatus }),
    });
    if (!orderResponse.ok) {
      const text = await orderResponse.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_ORDER_PAYMENT_STATUS_FAILED:${orderResponse.status}:${text}`);
    }
    await addBusinessCardOrderEvent({
      orderId,
      actorUserId: admin.userId,
      actorRole: 'admin',
      eventType: decision === 'verified' ? 'payment_verified' : 'payment_rejected',
      fromStatus: 'payment_reported',
      toStatus: nextStatus,
      message: decision === 'verified' ? '工作室已確認匯款入帳，將開始人工排版。' : `工作室未能核對此筆匯款，請確認後重新回填。${reviewNote ? ` 說明：${reviewNote}` : ''}`,
    });

    // 名片活動贈送：付款確認後自動建立一頁式品牌網站草稿。
    // 若開通失敗，不回滾已確認的付款，改由後台顯示補開通按鈕處理。
    let storefrontGift: any = null;
    if (decision === 'verified') {
      const verifiedOrder = await getBusinessCardOrderForAdmin(orderId);
      const giftMonths = getBusinessCardBrandWebsiteGiftMonths(verifiedOrder);
      if (giftMonths > 0) {
        try {
          const unified = await ensureUnifiedStorefrontForBusinessCard(verifiedOrder, giftMonths);
          const slug = safeText(unified.storefront?.slug);
          if (!unified.alreadyGranted) {
            try {
              await addBusinessCardOrderEvent({
                orderId,
                actorUserId: admin.userId,
                actorRole: 'admin',
                eventType: 'brand_website_gift_activated',
                message: `一頁式品牌網站基本版已自動開通，可使用 ${giftMonths} 個月。`,
                metadata: {
                  duration_months: giftMonths,
                  gift_expires_at: unified.giftExpiresAt,
                  page_expires_at: unified.expiresAt,
                  slug,
                  public_path: `/shop/${slug}`,
                  auto_granted_after_payment_verification: true,
                },
              });
            } catch (eventError) {
              console.error('BUSINESS_CARD_BRAND_WEBSITE_GIFT_EVENT_FAILED', eventError);
            }
          }
          storefrontGift = {
            eligible: true,
            autoGranted: true,
            alreadyGranted: Boolean(unified.alreadyGranted),
            durationMonths: giftMonths,
            publicPath: `/shop/${slug}`,
            expiresAt: unified.expiresAt,
          };
        } catch (giftError: any) {
          console.error('BUSINESS_CARD_BRAND_WEBSITE_GIFT_AUTO_GRANT_FAILED', giftError);
          storefrontGift = {
            eligible: true,
            autoGranted: false,
            durationMonths: giftMonths,
            error: '付款已確認，但網站草稿尚未建立；請在名片訂單後台按「補開通 3 個月」。',
          };
        }
      }
    }
    return jsonResponse(res, 200, { ok: true, status: nextStatus, storefrontGift });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '核對名片匯款失敗。' });
  }
}

async function handleAdminShipBusinessCardOrder(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireManualPaymentAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    const order = await getBusinessCardOrderForAdmin(orderId, 'id,status');
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到名片訂單。' });
    const carrier = businessCardText(body?.carrier || body?.shippingCarrier || body?.shipping_carrier, 120);
    const trackingNumber = businessCardText(body?.trackingNumber || body?.tracking_number, 180);
    const now = new Date().toISOString();
    const response = await supabaseRest(`business_card_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'shipped', shipped_at: now, shipping_carrier: carrier, tracking_number: trackingNumber }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_SHIP_FAILED:${response.status}:${text}`);
    }
    await addBusinessCardOrderEvent({
      orderId,
      actorUserId: admin.userId,
      actorRole: 'admin',
      eventType: 'order_shipped',
      fromStatus: safeText(order?.status),
      toStatus: 'shipped',
      message: `名片已由合作印刷廠寄出。${carrier ? ` 物流：${carrier}。` : ''}${trackingNumber ? ` 追蹤號碼：${trackingNumber}。` : ''}`,
    });
    return jsonResponse(res, 200, { ok: true, status: 'shipped' });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '更新名片寄送資訊失敗。' });
  }
}

function buildBusinessCardDigitalSlug(orderCode: string) {
  const suffix = safeText(orderCode).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `card-${suffix || crypto.randomUUID().slice(0, 12)}`.slice(0, 79);
}

function calculateBusinessCardDigitalExpiry(months: number, paymentVerifiedAt?: any) {
  const verifiedAt = new Date(String(paymentVerifiedAt || ''));
  if (Number.isNaN(verifiedAt.getTime())) {
    throw businessCardError('請先完成名片匯款核對後，再開通一頁式品牌網站。');
  }

  // 名片贈送期限固定從「實際核對入帳日」起算，
  // 不可接在既有商品展示頁到期日後面，避免同一筆名片重按時不斷累加。
  const expiresAt = new Date(verifiedAt.getTime());
  expiresAt.setMonth(expiresAt.getMonth() + months);
  return expiresAt.toISOString();
}

async function ensureUniqueStorefrontSlug(preferred: string) {
  const base = safeText(preferred).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || `card-${crypto.randomUUID().slice(0, 12)}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base.slice(0, 70)}-${attempt + 1}`.slice(0, 80);
    const response = await supabaseRest(`storefronts?select=id&slug=eq.${encodeURIComponent(candidate)}&limit=1`, { method: 'GET', headers: { Prefer: 'return=representation' } });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`STOREFRONT_SLUG_CHECK_FAILED:${response.status}:${text}`);
    }
    const rows = await response.json().catch(() => []);
    if (!Array.isArray(rows) || rows.length === 0) return candidate;
  }
  throw businessCardError('無法建立專屬個人／公司介紹頁網址，請稍後再試。', 500);
}

/**
 * 個人／公司介紹頁的實際總到期日，永遠取所有有效資格中最晚的一天。
 * 名片贈送 3／6 個月只影響自己的 entitlement，不會縮短客戶既有商品展示資格。
 */
async function getLatestActiveStorefrontExpiry(storefrontId: string) {
  const response = await supabaseRest(
    `storefront_entitlements?select=expires_at&storefront_id=eq.${encodeURIComponent(storefrontId)}&status=eq.active&expires_at=not.is.null&order=expires_at.desc&limit=200`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`STOREFRONT_ENTITLEMENT_EXPIRY_READ_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  let latest: string | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const row of Array.isArray(rows) ? rows : []) {
    const value = safeText(row?.expires_at);
    const time = new Date(value).getTime();
    if (Number.isFinite(time) && time > latestTime) {
      latest = value;
      latestTime = time;
    }
  }

  return latest;
}

async function syncStorefrontExpiryFromActiveEntitlements(storefront: any) {
  const storefrontId = safeText(storefront?.id);
  if (!storefrontId) throw businessCardError('找不到個人／公司介紹頁資料。', 500);

  const latestExpiry = await getLatestActiveStorefrontExpiry(storefrontId);
  if (!latestExpiry) {
    throw businessCardError('找不到有效的個人／公司介紹頁期限資料。', 500);
  }

  if (safeText(storefront?.expires_at) === latestExpiry) {
    return { ...storefront, expires_at: latestExpiry };
  }

  const response = await supabaseRest(`storefronts?id=eq.${encodeURIComponent(storefrontId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ expires_at: latestExpiry }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`UNIFIED_STOREFRONT_EXPIRY_SYNC_FAILED:${response.status}:${text}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] : { ...storefront, expires_at: latestExpiry };
}

async function ensureUnifiedStorefrontForBusinessCard(order: any, durationMonths: number) {
  const userId = safeText(order?.user_id);
  const sourceReference = safeText(order?.id);
  const paymentVerifiedAt = safeText(order?.payment_verified_at);

  if (!isBusinessCardUuid(userId)) throw businessCardError('名片訂單的會員資料不正確。', 500);
  if (!isBusinessCardUuid(sourceReference)) throw businessCardError('名片訂單資料不正確。', 500);
  if (!paymentVerifiedAt) throw businessCardError('請先完成名片匯款核對後，再開通一頁式品牌網站。');

  // 先確認是否已經由「同一筆名片訂單」開通過。
  // 必須先查再寫，避免管理者重按或前次失敗重試時累加期限。
  const entitlementResponse = await supabaseRest(
    `storefront_entitlements?select=id,storefront_id,starts_at,expires_at,status&grant_source=eq.business_card_order&source_reference=eq.${encodeURIComponent(sourceReference)}&limit=1`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!entitlementResponse.ok) {
    const text = await entitlementResponse.text().catch(() => '');
    throw new Error(`UNIFIED_STOREFRONT_ENTITLEMENT_READ_FAILED:${entitlementResponse.status}:${text}`);
  }
  const entitlementRows = await entitlementResponse.json().catch(() => []);
  const existingEntitlement = Array.isArray(entitlementRows) ? entitlementRows[0] : null;

  let storefront = await findOwnerStorefront(userId);

  if (existingEntitlement?.id) {
    const linkedStorefrontId = safeText(existingEntitlement?.storefront_id);
    if (!storefront?.id || (linkedStorefrontId && safeText(storefront.id) !== linkedStorefrontId)) {
      const storefrontResponse = await supabaseRest(
        `storefronts?select=*&id=eq.${encodeURIComponent(linkedStorefrontId)}&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      if (!storefrontResponse.ok) {
        const text = await storefrontResponse.text().catch(() => '');
        throw new Error(`UNIFIED_STOREFRONT_EXISTING_READ_FAILED:${storefrontResponse.status}:${text}`);
      }
      const storefrontRows = await storefrontResponse.json().catch(() => []);
      storefront = Array.isArray(storefrontRows) ? storefrontRows[0] || null : null;
    }

    if (!storefront?.id) {
      throw businessCardError('此名片訂單已開通，但找不到對應的個人／公司介紹頁。', 500);
    }

    const syncedStorefront = await syncStorefrontExpiryFromActiveEntitlements(storefront);
    return {
      storefront: syncedStorefront,
      // expiresAt 是客戶整個個人／公司介紹頁可用到的最晚日期。
      expiresAt: syncedStorefront?.expires_at || existingEntitlement?.expires_at || null,
      // giftExpiresAt 是本張名片贈送本身的期限；不會因客戶另有商品方案而改變。
      giftExpiresAt: existingEntitlement?.expires_at || null,
      paymentVerifiedAt,
      alreadyGranted: true,
    };
  }

  const displayName = businessCardText(order?.brand_name || order?.full_name || '我的個人／公司介紹頁', 120) || '我的個人／公司介紹頁';
  const giftExpiresAt = calculateBusinessCardDigitalExpiry(durationMonths, paymentVerifiedAt);
  const previousExpiry = storefront?.expires_at || null;

  if (!storefront?.id) {
    const slug = await ensureUniqueStorefrontSlug(buildBusinessCardDigitalSlug(safeText(order?.order_code)));
    const createResponse = await supabaseRest('storefronts', {
      method: 'POST',
      body: JSON.stringify({
        owner_user_id: userId,
        slug,
        page_mode: 'brand_storefront',
        display_name: displayName,
        contact_name: businessCardText(order?.full_name, 120) || null,
        job_title: businessCardText(order?.job_title, 120) || null,
        bio: businessCardText(order?.service_text, 2000) || null,
        phone: businessCardText(order?.card_phone, 60) || null,
        line_url: null,
        email: businessCardText(order?.card_email || order?.customer_email, 180) || null,
        website_url: businessCardText(order?.website_url, 1000) || null,
        status: 'draft',
        is_public: false,
        // 新頁面暫先使用本筆贈送到期日；成功寫入資格後會再由所有有效資格重新同步。
        expires_at: giftExpiresAt,
      }),
    });
    if (!createResponse.ok) {
      const text = await createResponse.text().catch(() => '');
      throw new Error(`UNIFIED_STOREFRONT_CREATE_FAILED:${createResponse.status}:${text}`);
    }
    const rows = await createResponse.json().catch(() => []);
    storefront = Array.isArray(rows) ? rows[0] : rows;
  }

  const storefrontId = safeText(storefront?.id);
  if (!storefrontId) throw businessCardError('建立個人／公司介紹頁失敗。', 500);

  // 先建立 entitlement，成功後才更新既有頁面的總到期日。
  // 因此資料庫限制或網路失敗時，不會把既有頁面的期限先延長。
  const entitlementPayload = {
    owner_user_id: userId,
    storefront_id: storefrontId,
    grant_source: 'business_card_order',
    plan_code: durationMonths === 6 ? 'digital_business_card_6m' : 'brand_website_basic_gift_3m',
    max_items: 0,
    source_reference: sourceReference,
    granted_months: durationMonths,
    previous_expires_at: previousExpiry,
    starts_at: paymentVerifiedAt,
    expires_at: giftExpiresAt,
    status: 'active',
    metadata: {
      business_card_order_id: sourceReference,
      business_card_order_code: safeText(order?.order_code),
      unified_page: true,
      plan_label: durationMonths === 6 ? '一頁式品牌網站加碼版 6 個月' : '一頁式品牌網站基本版 3 個月',
      payment_verified_at: paymentVerifiedAt,
    },
  };

  const entitlementWrite = await supabaseRest('storefront_entitlements', {
    method: 'POST',
    body: JSON.stringify(entitlementPayload),
  });
  if (!entitlementWrite.ok) {
    const text = await entitlementWrite.text().catch(() => '');
    throw new Error(`UNIFIED_STOREFRONT_ENTITLEMENT_WRITE_FAILED:${entitlementWrite.status}:${text}`);
  }

  const syncedStorefront = await syncStorefrontExpiryFromActiveEntitlements(storefront);
  return {
    storefront: syncedStorefront,
    expiresAt: syncedStorefront?.expires_at || giftExpiresAt,
    giftExpiresAt,
    paymentVerifiedAt,
    alreadyGranted: false,
  };
}

async function handleAdminGrantBusinessCardDigitalProfile(req: any, res: any, body: any) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const admin = await requireManualPaymentAdmin(req);
    const orderId = safeText(body?.orderId || body?.order_id);
    const durationMonths = Number(body?.durationMonths || body?.duration_months || 3);
    const manualOverride = readBusinessCardBoolean(body?.manualOverride || body?.manual_override);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    if (![3, 6].includes(durationMonths)) throw businessCardError('一頁式品牌網站期限僅能選 3 或 6 個月。');
    const order = await getBusinessCardOrderForAdmin(orderId);
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到名片訂單。' });
    const giftMonths = getBusinessCardBrandWebsiteGiftMonths(order);
    if (!giftMonths && !manualOverride) {
      throw businessCardError('此訂單未符合一頁式品牌網站贈送資格；若為特別活動或單獨購買，請勾選人工加碼後再開通。');
    }
    if (giftMonths && durationMonths !== giftMonths && !manualOverride) {
      throw businessCardError(`此訂單符合的贈送期限為 ${giftMonths} 個月；6 個月僅供特別活動或人工加碼使用。`);
    }
    if (!safeText(order?.payment_verified_at)) {
      throw businessCardError('請先完成名片匯款核對後，再開通一頁式品牌網站。');
    }

    const unified = await ensureUnifiedStorefrontForBusinessCard(order, durationMonths);
    const slug = safeText(unified.storefront?.slug);

    // 同一筆訂單重按時只回傳既有資格；不重複寫事件、不重複延長。
    if (!unified.alreadyGranted) {
      await addBusinessCardOrderEvent({
        orderId,
        actorUserId: admin.userId,
        actorRole: 'admin',
        eventType: 'unified_personal_page_activated',
        message: `一頁式品牌網站已開通。名片贈送期限自匯款核對日開始計算 ${durationMonths} 個月；日後商品展示會使用同一個網址。`,
        metadata: {
          duration_months: durationMonths,
          payment_verified_at: unified.paymentVerifiedAt,
          gift_expires_at: unified.giftExpiresAt,
          page_expires_at: unified.expiresAt,
          slug,
          public_path: `/shop/${slug}`,
        },
      });
    }

    return jsonResponse(res, 200, {
      ok: true,
      alreadyGranted: Boolean(unified.alreadyGranted),
      digitalProfile: {
        slug,
        publicPath: `/shop/${slug}`,
        // 客戶頁總到期日：所有有效資格取最晚日期。
        expiresAt: unified.expiresAt,
        // 本張名片贈送本身的到期日。
        giftExpiresAt: unified.giftExpiresAt,
        paymentVerifiedAt: unified.paymentVerifiedAt,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '開通個人／公司介紹頁失敗。' });
  }
}

async function handleGetPublicBusinessCardProfile(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const slug = safeText(req?.query?.slug).toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(slug)) throw businessCardError('數位名片頁網址不正確。');
    const response = await supabaseRest(
      `business_card_digital_profiles?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.active&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`BUSINESS_CARD_DIGITAL_PROFILE_READ_FAILED:${response.status}:${text}`);
    }
    const rows = await response.json().catch(() => []);
    const profile = Array.isArray(rows) ? rows[0] : null;
    if (!profile?.id) return jsonResponse(res, 404, { ok: false, error: '找不到此數位名片頁。' });
    if (profile?.expires_at && new Date(profile.expires_at).getTime() < Date.now()) {
      await supabaseRest(`business_card_digital_profiles?id=eq.${encodeURIComponent(safeText(profile?.id))}`, { method: 'PATCH', body: JSON.stringify({ status: 'expired' }) });
      return jsonResponse(res, 410, { ok: false, error: '此數位名片頁已到期。' });
    }

    const files = await getBusinessCardFilesForOrder(safeText(profile?.order_id), true);
    const logo = files.find((file: any) => safeText(file?.file_role) === 'customer_logo');
    let logoUrl = '';
    if (logo?.storage_path) logoUrl = await createPrivateBusinessCardSignedUrl(safeText(logo?.storage_bucket) || BUSINESS_CARD_BUCKET, safeText(logo?.storage_path), 900);
    return jsonResponse(res, 200, {
      ok: true,
      profile: {
        displayName: safeText(profile?.display_name),
        headline: profile?.headline || null,
        contactPhone: profile?.contact_phone || null,
        lineId: profile?.line_id || null,
        contactEmail: profile?.contact_email || null,
        websiteUrl: profile?.website_url || null,
        servicesText: profile?.services_text || null,
        qrLink: profile?.qr_link || null,
        logoUrl: logoUrl || null,
        expiresAt: profile?.expires_at || null,
      },
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取數位名片頁失敗。' });
  }
}

async function handleAdminGetBusinessCardOrderDetail(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireManualPaymentAdmin(req);
    const orderId = safeText(req?.query?.orderId || req?.query?.order_id);
    if (!isBusinessCardUuid(orderId)) throw businessCardError('名片訂單 ID 不正確。');
    const order = await getBusinessCardOrderForAdmin(orderId);
    if (!order?.id) return jsonResponse(res, 404, { ok: false, error: '找不到名片訂單。' });
    const [filesRows, paymentReports, digitalProfile, eventsResponse] = await Promise.all([
      getBusinessCardFilesForOrder(orderId, false),
      getBusinessCardPaymentSummary(orderId),
      getBusinessCardDigitalProfileForOrder(orderId),
      supabaseRest(`business_card_order_events?select=id,actor_role,event_type,from_status,to_status,message,metadata,created_at&order_id=eq.${encodeURIComponent(orderId)}&order=created_at.asc&limit=200`, { method: 'GET', headers: { Prefer: 'return=representation' } }),
    ]);
    const files = await serializeBusinessCardFilesWithSignedUrl(filesRows, 900);
    const eventRows = eventsResponse.ok ? await eventsResponse.json().catch(() => []) : [];
    return jsonResponse(res, 200, {
      ok: true,
      order: businessCardAdminOrderPayload(order, files.length),
      files,
      paymentReports,
      digitalProfile,
      events: Array.isArray(eventRows) ? eventRows : [],
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取名片訂單詳細資料失敗。' });
  }
}


// =========================================================
// 客戶服務狀況／商品圖生成紀錄
// - 商品圖 Edge Function 已把來源與結果網址寫入 usage_logs.meta。
// - SQL trigger 會同步成 product_image_generations，供客戶與管理者安全查詢。
// =========================================================
function productImageGenerationPayload(row: any, customerEmail = '') {
  return {
    id: safeText(row?.id),
    userId: safeText(row?.user_id),
    customerEmail: normalizeEmail(customerEmail),
    sourceImageUrl: row?.source_image_url || null,
    resultImageUrl: row?.result_image_url || null,
    resultStoragePath: row?.result_storage_path || null,
    productType: row?.product_type || null,
    outputRatio: row?.output_ratio || null,
    styleId: row?.style_id || null,
    styleTitle: row?.style_title || null,
    engine: row?.engine || null,
    model: row?.model || null,
    quality: row?.quality || null,
    pointsUsed: Number(row?.points_used || 0),
    beforeRemaining: row?.before_remaining == null ? null : Number(row.before_remaining),
    afterRemaining: row?.after_remaining == null ? null : Number(row.after_remaining),
    createdAt: row?.created_at || null,
  };
}

async function readProductImageGenerationsForUser(userId: string, limit = 30) {
  const response = await supabaseRest(
    `product_image_generations?select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=${Math.max(1, Math.min(100, Number(limit) || 30))}`,
    { method: 'GET', headers: { Prefer: 'return=representation' } },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`PRODUCT_IMAGE_HISTORY_READ_FAILED:${response.status}:${text}`);
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

async function handleGetMyProductImageGenerations(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    const user = await getCurrentSessionUserProfile(req);
    const rows = await readProductImageGenerationsForUser(user.userId, Number(req?.query?.limit || 30));
    return jsonResponse(res, 200, { ok: true, generations: rows.map((row: any) => productImageGenerationPayload(row)) });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取商品圖生成紀錄失敗。' });
  }
}

async function handleGetMyCustomerServiceStatus(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });

  try {
    const user = await getCurrentSessionUserProfile(req);
    const [transferResponse, purchaseResponse, businessCardResponse, storefrontResponse, storefrontTrialRequestResponse] = await Promise.all([
      supabaseRest(
        `bank_transfer_reports?select=id,plan_id,amount_ntd,status,transferred_at,created_at&user_id=eq.${encodeURIComponent(user.userId)}&order=created_at.desc&limit=100`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `purchase_logs?select=id,order_no,amount,points,status,created_at&user_id=eq.${encodeURIComponent(user.userId)}&or=(amount.eq.99,amount.eq.199)&order=created_at.desc&limit=100`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `business_card_orders?select=id,order_code,template_title,total_amount_ntd,status,created_at,updated_at&user_id=eq.${encodeURIComponent(user.userId)}&order=updated_at.desc&limit=100`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `storefronts?select=id,slug,display_name,page_mode,status,is_public,expires_at,created_at&owner_user_id=eq.${encodeURIComponent(user.userId)}&page_mode=in.(product_showcase,brand_storefront)&order=created_at.desc&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
      supabaseRest(
        `storefront_trial_requests?select=id,status,created_at,reviewed_at,review_note,storefront_id,entitlement_id&user_id=eq.${encodeURIComponent(user.userId)}&status=in.(pending,approved)&order=created_at.desc&limit=1`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      ),
    ]);

    const readRows = async (response: any, label: string) => {
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`${label}_READ_FAILED:${response.status}:${text}`);
      }
      const rows = await response.json().catch(() => []);
      return Array.isArray(rows) ? rows : [];
    };

    const [transferRows, purchaseRows, businessCardRows, storefrontRows, storefrontTrialRequestRows] = await Promise.all([
      readRows(transferResponse, 'POINT_TRANSFER'),
      readRows(purchaseResponse, 'PURCHASE'),
      readRows(businessCardResponse, 'BUSINESS_CARD'),
      readRows(storefrontResponse, 'STOREFRONT'),
      readRows(storefrontTrialRequestResponse, 'STOREFRONT_TRIAL_REQUEST'),
    ]);

    const storefront = storefrontRows[0] || null;
    const storefrontTrialRequest = storefrontTrialRequestRows[0] || null;
    let entitlementRows: any[] = [];
    if (storefront?.id) {
      const entitlementResponse = await supabaseRest(
        `storefront_entitlements?select=plan_code,max_items,status,starts_at,expires_at,created_at&storefront_id=eq.${encodeURIComponent(String(storefront.id))}&status=eq.active&order=created_at.desc&limit=50`,
        { method: 'GET', headers: { Prefer: 'return=representation' } },
      );
      entitlementRows = await readRows(entitlementResponse, 'STOREFRONT_ENTITLEMENT');
    }

    const pointTransfers = transferRows
      .filter((row: any) => ['99', '199'].includes(safeText(row?.plan_id)))
      .map((row: any) => ({
      id: safeText(row?.id),
      planId: safeText(row?.plan_id),
      amountNtd: Number(row?.amount_ntd || 0),
      status: safeText(row?.status),
      transferredAt: row?.transferred_at || null,
      createdAt: row?.created_at || null,
      }));
    const relationshipTransfers = transferRows
      .filter((row: any) => ['relationship_pro', 'relationship_business'].includes(safeText(row?.plan_id)))
      .map((row: any) => ({
        id: safeText(row?.id),
        planId: safeText(row?.plan_id),
        amountNtd: Number(row?.amount_ntd || 0),
        status: safeText(row?.status),
        transferredAt: row?.transferred_at || null,
        createdAt: row?.created_at || null,
      }));

    const paidProductImageOrders = purchaseRows
      .filter((row: any) => ['success', 'paid'].includes(safeText(row?.status).toLowerCase()))
      .map((row: any) => ({
        orderNo: safeText(row?.order_no),
        amountNtd: Number(row?.amount || 0),
        points: Number(row?.points || 0),
        status: safeText(row?.status),
        createdAt: row?.created_at || null,
      }));

    const normalizedBusinessCardRows = await Promise.all(
      businessCardRows.map((row: any) => normalizeLegacySubmittedBusinessCardOrder(row)),
    );
    const businessCardOrders = normalizedBusinessCardRows.map((row: any) => ({
      id: safeText(row?.id),
      orderCode: safeText(row?.order_code),
      templateTitle: row?.template_title || null,
      totalAmountNtd: Number(row?.total_amount_ntd || 0),
      status: safeText(row?.status),
      createdAt: row?.created_at || null,
      updatedAt: row?.updated_at || null,
    }));

    const activeEntitlements = entitlementRows.filter((row: any) => {
      const status = safeText(row?.status).toLowerCase();
      return status === 'active' && (!row?.expires_at || isFutureDate(row.expires_at));
    });
    const effectiveEntitlement = activeEntitlements
      .slice()
      .sort((a: any, b: any) => Number(b?.max_items || 0) - Number(a?.max_items || 0))[0] || null;

    let generations: any[] = [];
    let generationHistoryReady = true;
    try {
      generations = await readProductImageGenerationsForUser(user.userId, 100);
    } catch {
      generationHistoryReady = false;
    }

    // 首頁只使用這些快捷項目：每種服務僅抓最新尚未完成的一筆。
    const nextActions: Array<{ key: string; title: string; description: string; href: string; tone: string }> = [];
    const latestUnresolvedTransfer = pointTransfers.find((row: any) =>
      ['pending', 'reported', 'rejected'].includes(safeText(row?.status).toLowerCase()),
    ) || null;
    if (latestUnresolvedTransfer) {
      const status = safeText(latestUnresolvedTransfer.status).toLowerCase();
      if (status === 'rejected') {
        nextActions.push({
          key: 'product-image-transfer-rejected',
          title: '商品圖匯款資料需重新確認',
          description: `方案 NT$${latestUnresolvedTransfer.amountNtd.toLocaleString()}，請重新確認後回填匯款資料。`,
          href: `/payment/bank-transfer?plan=${encodeURIComponent(latestUnresolvedTransfer.planId || '99')}`,
          tone: 'rose',
        });
      } else {
        nextActions.push({
          key: 'product-image-transfer-checking',
          title: '商品圖匯款核對中',
          description: `方案 NT$${latestUnresolvedTransfer.amountNtd.toLocaleString()}，已收到匯款回報，請等待核對。`,
          href: '/my-services',
          tone: 'amber',
        });
      }
    }

    const latestRelationshipTransfer = relationshipTransfers.find((row: any) =>
      ['pending', 'rejected'].includes(safeText(row?.status).toLowerCase()),
    ) || null;
    if (latestRelationshipTransfer) {
      const rejected = safeText(latestRelationshipTransfer.status).toLowerCase() === 'rejected';
      const product = latestRelationshipTransfer.planId === 'relationship_business'
        ? 'relationship_business'
        : 'relationship_pro';
      nextActions.push({
        key: rejected ? 'relationship-transfer-rejected' : 'relationship-transfer-checking',
        title: rejected ? 'AI 回覆軍師匯款資料需重新確認' : 'AI 回覆軍師匯款核對中',
        description: `${product === 'relationship_business' ? 'Business Pro' : 'Pro'} NT$${latestRelationshipTransfer.amountNtd.toLocaleString()}，${rejected ? '請重新確認後回填匯款資料。' : '已收到匯款回報，請等待人工核對。'}`,
        href: rejected ? `/payment/bank-transfer?product=${encodeURIComponent(product)}` : '/my-services',
        tone: rejected ? 'rose' : 'amber',
      });
    }

    const latestOpenBusinessCard = businessCardOrders.find((row: any) => {
      const status = safeText(row?.status).toLowerCase();
      return !['completed', 'cancelled'].includes(status);
    }) || null;
    if (latestOpenBusinessCard?.id) {
      const status = safeText(latestOpenBusinessCard.status).toLowerCase();
      const cardDetails = `${latestOpenBusinessCard.orderCode || '名片訂單'}・${latestOpenBusinessCard.templateTitle || '人工名片'}・NT$${Number(latestOpenBusinessCard.totalAmountNtd || 0).toLocaleString()}`;
      if (['awaiting_payment', 'submitted'].includes(status)) {
        nextActions.push({
          key: 'business-card-payment',
          title: '名片訂單待匯款',
          description: cardDetails,
          href: `/business-card/payment?orderId=${encodeURIComponent(latestOpenBusinessCard.id)}`,
          tone: 'amber',
        });
      } else if (status === 'payment_reported') {
        nextActions.push({
          key: 'business-card-payment-checking',
          title: '名片匯款核對中',
          description: cardDetails,
          href: `/my-business-card-orders?orderId=${encodeURIComponent(latestOpenBusinessCard.id)}`,
          tone: 'amber',
        });
      } else if (['preview_ready', 'awaiting_customer_confirmation'].includes(status)) {
        nextActions.push({
          key: 'business-card-preview',
          title: '名片預覽待確認',
          description: `${cardDetails}，請確認文字、電話與 QR Code。`,
          href: `/my-business-card-orders?orderId=${encodeURIComponent(latestOpenBusinessCard.id)}`,
          tone: 'violet',
        });
      } else {
        const titleByStatus: Record<string, string> = {
          payment_verified: '名片已確認入帳，準備排版',
          designing: '名片排版中',
          revision_requested: '名片正在修改',
          printing: '名片已送印',
          shipped: '名片已寄出',
        };
        nextActions.push({
          key: `business-card-${status || 'processing'}`,
          title: titleByStatus[status] || '名片訂單處理中',
          description: cardDetails,
          href: `/my-business-card-orders?orderId=${encodeURIComponent(latestOpenBusinessCard.id)}`,
          tone: status === 'shipped' ? 'emerald' : 'violet',
        });
      }
    }

    const trialRequestStatus = safeText(storefrontTrialRequest?.status).toLowerCase();
    if (!effectiveEntitlement && trialRequestStatus === 'pending') {
      nextActions.push({
        key: 'storefront-trial-pending',
        title: '商品展示頁試用申請審核中',
        description: '已收到 7 天試用申請，站方審核後會人工開通，請先等待通知。',
        href: '/tools/product-showcase-page#trial',
        tone: 'amber',
      });
    } else if (!effectiveEntitlement && trialRequestStatus === 'approved') {
      nextActions.push({
        key: 'storefront-trial-approved',
        title: '商品展示頁試用已核准',
        description: '試用已核准，若尚未看到設定入口，請重新整理或稍後再試。',
        href: '/settings/storefront',
        tone: 'emerald',
      });
    }

    const storefrontActive = Boolean(
      storefront?.id &&
      effectiveEntitlement &&
      (!storefront?.expires_at || isFutureDate(storefront.expires_at)),
    );
    const storefrontNeedsSetup = storefrontActive && !Boolean(storefront?.is_public);
    if (storefrontNeedsSetup) {
      const storefrontExpiryText = storefront?.expires_at
        ? new Date(String(storefront.expires_at)).toLocaleDateString('zh-TW')
        : '方案到期日';
      nextActions.push({
        key: 'personal-page-setup',
        title: '個人／公司頁待設定',
        description: `已開通至 ${storefrontExpiryText}，補齊資料並勾選公開後即可分享。`,
        href: '/settings/storefront',
        tone: 'emerald',
      });
    }

    return jsonResponse(res, 200, {
      ok: true,
      pointTransfers,
      paidProductImageOrders,
      businessCardOrders,
      productImageGenerations: generations.map((row: any) => productImageGenerationPayload(row)),
      generationHistoryReady,
      storefront: storefront
        ? {
            id: safeText(storefront.id),
            slug: safeText(storefront.slug),
            displayName: safeText(storefront.display_name),
            pageMode: safeText(storefront.page_mode),
            status: safeText(storefront.status) || 'draft',
            isPublic: Boolean(storefront.is_public),
            expiresAt: storefront.expires_at || null,
          }
        : null,
      entitlement: effectiveEntitlement
        ? {
            planCode: safeText(effectiveEntitlement.plan_code),
            maxItems: Number(effectiveEntitlement.max_items || 0),
            expiresAt: effectiveEntitlement.expires_at || storefront?.expires_at || null,
          }
        : null,
      storefrontTrialRequest: storefrontTrialRequest
        ? {
            id: safeText(storefrontTrialRequest.id),
            status: safeText(storefrontTrialRequest.status),
            createdAt: storefrontTrialRequest.created_at || null,
            reviewedAt: storefrontTrialRequest.reviewed_at || null,
          }
        : null,
      nextActions,
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取客戶服務狀況失敗。' });
  }
}

async function handleAdminListProductImageGenerations(req: any, res: any) {
  if (req.method !== 'GET') return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  try {
    await requireManualPaymentAdmin(req);
    const email = normalizeEmail(req?.query?.email);
    const requestedUserId = safeText(req?.query?.userId || req?.query?.user_id);
    let userId = requestedUserId;
    let selectedUser: any = null;

    if (email) {
      const userResponse = await supabaseRest(`users?select=id,email&email=eq.${escapeFilterValue(email)}&limit=1`, { method: 'GET', headers: { Prefer: 'return=representation' } });
      if (!userResponse.ok) {
        const text = await userResponse.text().catch(() => '');
        throw new Error(`PRODUCT_IMAGE_HISTORY_USER_READ_FAILED:${userResponse.status}:${text}`);
      }
      const users = await userResponse.json().catch(() => []);
      selectedUser = Array.isArray(users) ? users[0] : null;
      userId = safeText(selectedUser?.id);
      if (!userId) return jsonResponse(res, 200, { ok: true, member: null, generations: [] });
    }

    const filter = userId && /^[0-9a-f-]{36}$/i.test(userId) ? `&user_id=eq.${encodeURIComponent(userId)}` : '';
    const response = await supabaseRest(`product_image_generations?select=*&order=created_at.desc&limit=100${filter}`, { method: 'GET', headers: { Prefer: 'return=representation' } });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`PRODUCT_IMAGE_HISTORY_ADMIN_READ_FAILED:${response.status}:${text}`);
    }
    const rows = await response.json().catch(() => []);
    const records = Array.isArray(rows) ? rows : [];
    const userIds = [...new Set(records.map((row: any) => safeText(row?.user_id)).filter((value: string) => /^[0-9a-f-]{36}$/i.test(value)))];
    const emailByUserId = new Map<string, string>();
    if (selectedUser?.id) emailByUserId.set(safeText(selectedUser.id), normalizeEmail(selectedUser.email));
    if (userIds.length && !selectedUser?.id) {
      const usersResponse = await supabaseRest(`users?select=id,email&id=in.(${userIds.join(',')})`, { method: 'GET', headers: { Prefer: 'return=representation' } });
      if (usersResponse.ok) {
        const users = await usersResponse.json().catch(() => []);
        for (const item of Array.isArray(users) ? users : []) emailByUserId.set(safeText(item?.id), normalizeEmail(item?.email));
      }
    }
    return jsonResponse(res, 200, {
      ok: true,
      member: selectedUser ? { id: safeText(selectedUser.id), email: normalizeEmail(selectedUser.email) } : null,
      generations: records.map((row: any) => productImageGenerationPayload(row, emailByUserId.get(safeText(row?.user_id)) || '')),
    });
  } catch (error: any) {
    return jsonResponse(res, Number(error?.statusCode || 500), { ok: false, error: error?.message || '讀取商品圖生成紀錄失敗。' });
  }
}

const DESIGN_PORTFOLIO_CATEGORIES = new Set([
  '商品圖設計',
  'LINE 貼圖',
  '名片設計',
  '品牌視覺',
]);

const DESIGN_PORTFOLIO_CATEGORY_CODES: Record<string, string> = {
  '商品圖設計': 'product',
  'LINE 貼圖': 'line',
  '名片設計': 'card',
  '品牌視覺': 'brand',
};

const DESIGN_PORTFOLIO_CATEGORY_LABELS: Record<string, string> = {
  product: '商品圖設計',
  line: 'LINE 貼圖',
  card: '名片設計',
  brand: '品牌視覺',
};

function encodeDesignPortfolioTitle(title: string) {
  return Buffer.from(title, 'utf8').toString('base64url');
}

function decodeDesignPortfolioTitle(value: string) {
  try {
    return Buffer.from(value, 'base64url').toString('utf8').trim();
  } catch {
    return '';
  }
}

function designPortfolioDefaults(category: string) {
  switch (category) {
    case 'LINE 貼圖':
      return {
        description: '依照角色、品牌個性與常用情境，整理成清楚好用的貼圖視覺。',
        business_type: '個人角色、店家品牌、社群經營',
        usage_type: 'LINE 日常對話、品牌客服與社群互動',
      };
    case '名片設計':
      return {
        description: '把聯絡資訊與品牌特色整理成好閱讀、方便印製的名片版面。',
        business_type: '個人工作者、小店、品牌與業務',
        usage_type: '實體名片、活動交流與店面宣傳',
      };
    case '品牌視覺':
      return {
        description: '依照商品定位與品牌風格，規劃一致、容易辨識的視覺。',
        business_type: '新品牌、個人品牌、禮盒與小型商家',
        usage_type: '品牌識別、包裝、禮盒與社群宣傳',
      };
    default:
      return {
        description: '將原始照片整理成更清楚、有重點，適合宣傳與販售的商品視覺。',
        business_type: '甜點、飲品、手作商品與電商賣家',
        usage_type: 'Facebook、Instagram、菜單與商品頁',
      };
  }
}

async function handleGetPublicDesignPortfolio(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const response = await supabaseRest(
      'images?select=id,file_path,public_url,created_at&file_path=like.portfolio%2Fdesign-commission%2F*&order=created_at.desc&limit=100',
      { method: 'GET', headers: { Prefer: 'return=representation' } },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`PORTFOLIO_LIST_FAILED:${response.status}:${text}`);
    }

    const rows = await response.json().catch(() => []);
    const items = (Array.isArray(rows) ? rows : []).map((row: any) => {
      const path = safeText(row?.file_path);
      const match = path.match(/^portfolio\/design-commission\/([^/]+)\/\d+-([A-Za-z0-9_-]+)\.[A-Za-z0-9]+$/);
      const category = DESIGN_PORTFOLIO_CATEGORY_LABELS[match?.[1] || ''] || '作品案例';
      const title = decodeDesignPortfolioTitle(match?.[2] || '') || '最新設計作品';
      return {
        id: safeText(row?.id) || path,
        title,
        category,
        image_url: safeText(row?.public_url),
        created_at: row?.created_at || null,
        sort_order: 0,
        ...designPortfolioDefaults(category),
      };
    }).filter((item: any) => item.image_url);

    return jsonResponse(res, 200, {
      ok: true,
      items,
    });
  } catch (error: any) {
    console.error('DESIGN_PORTFOLIO_LIST_FAILED', error);
    return jsonResponse(res, 500, { ok: false, error: '作品讀取失敗，請稍後再試。' });
  }
}

async function handleGetDesignPortfolioAdminStatus(req: any, res: any) {
  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const admin = await requireManualPaymentAdmin(req);
    return jsonResponse(res, 200, { ok: true, isAdmin: true, email: admin.email });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, {
      ok: false,
      isAdmin: false,
      error: status === 401 ? '請先登入管理者帳號。' : status === 403 ? '此帳號沒有作品管理權限。' : safeText(error?.message) || '無法確認管理權限。',
    });
  }
}

async function handleAdminUploadDesignPortfolio(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireManualPaymentAdmin(req);

    const title = safeText(body?.title).slice(0, 120);
    const category = safeText(body?.category);
    const description = safeText(body?.description).slice(0, 600);
    const businessType = safeText(body?.businessType || body?.business_type).slice(0, 240);
    const usageType = safeText(body?.usageType || body?.usage_type).slice(0, 240);
    const base64 = body?.base64 || body?.imageBase64;
    const sortOrder = Math.max(-9999, Math.min(9999, Number(body?.sortOrder || body?.sort_order || 0) || 0));

    if (!title) return jsonResponse(res, 400, { ok: false, error: '請填寫作品名稱。' });
    if (!DESIGN_PORTFOLIO_CATEGORIES.has(category)) {
      return jsonResponse(res, 400, { ok: false, error: '請選擇正確的作品分類。' });
    }
    if (!base64) return jsonResponse(res, 400, { ok: false, error: '請選擇要上傳的圖片。' });

    const { buffer, mimeType, ext } = normalizeBase64Image(base64);
    if (!buffer.length) return jsonResponse(res, 400, { ok: false, error: '圖片資料格式錯誤。' });
    if (buffer.length > 8 * 1024 * 1024) {
      return jsonResponse(res, 413, { ok: false, error: '圖片請控制在 8MB 以內。' });
    }

    const categoryCode = DESIGN_PORTFOLIO_CATEGORY_CODES[category] || 'brand';
    const encodedTitle = encodeDesignPortfolioTitle(title).slice(0, 220);
    const objectPath = `portfolio/design-commission/${categoryCode}/${Date.now()}-${encodedTitle}.${ext}`;
    const imageUrl = await uploadToSupabaseStorage(objectPath, buffer, mimeType);
    const insertResponse = await supabaseRest('images', {
      method: 'POST',
      body: JSON.stringify({
        title,
        image_url: imageUrl,
        access_level: 'free',
        price_type: 'free',
        public_url: imageUrl,
        file_path: objectPath,
        file_size_kb: Math.max(1, Math.round(buffer.length / 1024)),
        is_free: true,
        created_at: new Date().toISOString(),
      }),
    });

    if (!insertResponse.ok) {
      const text = await insertResponse.text().catch(() => '');
      throw new Error(`PORTFOLIO_INSERT_FAILED:${insertResponse.status}:${text}`);
    }

    const rows = await insertResponse.json().catch(() => []);
    const item = Array.isArray(rows) ? rows[0] : rows;
    return jsonResponse(res, 200, { ok: true, item, imageUrl });
  } catch (error: any) {
    console.error('DESIGN_PORTFOLIO_UPLOAD_FAILED', error);
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, {
      ok: false,
      error: status === 401
        ? '登入已失效，請重新登入。'
        : status === 403
          ? '此帳號沒有上傳作品的權限。'
          : '作品上傳失敗，請稍後再試。',
    });
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readAdminContentId(value: any, field = 'id') {
  const id = safeText(value);
  if (!isUuid(id)) {
    const error: any = new Error(`${field}_INVALID`);
    error.statusCode = 400;
    throw error;
  }
  return id;
}

async function readContentRows(pathname: string, errorCode: string) {
  const response = await supabaseRest(pathname, { method: 'GET', headers: { Prefer: 'return=representation' } });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`${errorCode}:${response.status}:${detail}`);
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

async function handleGetPublicImageCategories(_req: any, res: any) {
  try {
    const categories = await readContentRows(
      'image_categories?select=id,name,slug&is_active=eq.true&order=sort_order.asc,name.asc',
      'PUBLIC_IMAGE_CATEGORIES_READ_FAILED',
    );
    return jsonResponse(res, 200, { ok: true, categories });
  } catch (error: any) {
    console.error('PUBLIC_IMAGE_CATEGORIES_READ_FAILED', error);
    return jsonResponse(res, 500, { ok: false, error: '圖片分類暫時無法載入。' });
  }
}

async function handleGetPublicImages(req: any, res: any) {
  try {
    const rawPage = Math.max(0, Number(req?.query?.page || 0) || 0);
    const pageSize = Math.max(1, Math.min(48, Number(req?.query?.page_size || 24) || 24));
    const categoryId = safeText(req?.query?.category_id);
    if (categoryId && !isUuid(categoryId)) return jsonResponse(res, 400, { ok: false, error: 'CATEGORY_ID_INVALID' });
    const offset = rawPage * pageSize;
    const categoryFilter = categoryId ? `&category_id=eq.${encodeURIComponent(categoryId)}` : '';
    const response = await supabaseRest(
      `images?select=id,title,public_url,image_url,thumbnail_url,price_type,category_id&order=created_at.desc&offset=${offset}&limit=${pageSize}${categoryFilter}`,
      { method: 'GET', headers: { Prefer: 'count=exact' } },
    );
    if (!response.ok) throw new Error(`PUBLIC_IMAGES_READ_FAILED:${response.status}:${await response.text().catch(() => '')}`);
    const rows = await response.json().catch(() => []);
    const contentRange = String(response.headers.get('content-range') || '');
    const totalPart = contentRange.split('/')[1];
    const total = totalPart && totalPart !== '*' ? Number(totalPart) : undefined;
    const images = (Array.isArray(rows) ? rows : []).map((image: any) => {
      const isFree = safeText(image?.price_type).toLowerCase() === 'free';

      // Bundle images are previews only. Do not expose an R2 original URL in
      // a public listing; the later token-validated ZIP flow will own access
      // to the full-resolution assets.
      return {
        id: safeText(image?.id),
        title: image?.title || null,
        thumbnail_url: image?.thumbnail_url || null,
        price_type: isFree ? 'free' : 'bundle',
        category_id: image?.category_id || null,
        ...(isFree
          ? {
              public_url: image?.public_url || null,
              image_url: image?.image_url || null,
            }
          : {}),
      };
    });
    return jsonResponse(res, 200, { ok: true, images, ...(Number.isFinite(total) ? { total } : {}) });
  } catch (error: any) {
    console.error('PUBLIC_IMAGES_READ_FAILED', error);
    return jsonResponse(res, 500, { ok: false, error: '圖片暫時無法載入。' });
  }
}

async function handleGetPublicDeals(_req: any, res: any) {
  try {
    const deals = await readContentRows(
      'deal_items?select=id,platform,title,price,original_price,image_url,product_url,affiliate_url,sale_end_time,discount_percent&platform=eq.shopee&is_active=eq.true&order=sale_end_time.asc.nullslast&limit=50',
      'PUBLIC_DEALS_READ_FAILED',
    );
    return jsonResponse(res, 200, { ok: true, deals });
  } catch (error: any) {
    console.error('PUBLIC_DEALS_READ_FAILED', error);
    return jsonResponse(res, 500, { ok: false, error: '優惠商品暫時無法載入。' });
  }
}

async function handleAdminListImageCategories(req: any, res: any) {
  try {
    await requireImageAdmin(req);
    const catalog = await readPublicImageCatalogFromR2();
    const seen = new Map<string, any>();

    for (const image of catalog.images) {
      const name = catalogCategoryName(image);
      if (!name) continue;
      const id = safeText(image?.category_id) || name;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, {
          id,
          name,
          slug: id,
          sort_order: seen.size + 1,
          is_active: true,
        });
      }
    }

    return jsonResponse(res, 200, { ok: true, categories: Array.from(seen.values()) });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    console.error("ADMIN_R2_IMAGE_CATEGORIES_READ_FAILED", error);
    return jsonResponse(res, status, {
      ok: false,
      error: status === 401
        ? "請輸入圖片後台管理金鑰。"
        : status === 403
          ? "圖片後台管理金鑰不正確。"
          : safeText(error?.message) || "R2_IMAGE_CATEGORIES_READ_FAILED",
    });
  }
}

async function handleAdminCreateImageCategory(req: any, res: any, body: any) {
  try {
    await requireManualPaymentAdmin(req);
    const name = safeText(body?.name).slice(0, 120);
    const sortOrder = Math.max(0, Math.min(999999, Number(body?.sort_order) || 0));
    if (!name) return jsonResponse(res, 400, { ok: false, error: 'CATEGORY_NAME_REQUIRED' });
    // image_categories.slug is required and must be unique. Use a stable
    // machine-safe identifier; the human-facing category name remains `name`.
    const slug = `category-${crypto.randomUUID()}`;
    const response = await supabaseRest('image_categories', { method: 'POST', body: JSON.stringify({ name, slug, sort_order: sortOrder, is_active: true }) });
    if (!response.ok) throw new Error(`ADMIN_IMAGE_CATEGORY_CREATE_FAILED:${response.status}`);
    return jsonResponse(res, 200, { ok: true, category: (await response.json().catch(() => []))[0] || null });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '圖片分類新增失敗。' });
  }
}

async function handleAdminUpdateImageCategory(req: any, res: any, body: any) {
  try {
    await requireManualPaymentAdmin(req);
    const id = readAdminContentId(body?.id, 'CATEGORY_ID');
    const payload: any = {};
    if (body?.name !== undefined) {
      const name = safeText(body.name).slice(0, 120);
      if (!name) return jsonResponse(res, 400, { ok: false, error: 'CATEGORY_NAME_REQUIRED' });
      payload.name = name;
    }
    if (body?.sort_order !== undefined) payload.sort_order = Math.max(0, Math.min(999999, Number(body.sort_order) || 0));
    if (body?.is_active !== undefined) payload.is_active = Boolean(body.is_active);
    if (!Object.keys(payload).length) return jsonResponse(res, 400, { ok: false, error: 'NO_CHANGES' });
    const response = await supabaseRest(`image_categories?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`ADMIN_IMAGE_CATEGORY_UPDATE_FAILED:${response.status}`);
    return jsonResponse(res, 200, { ok: true });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 400 ? safeText(error?.message) : status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '圖片分類更新失敗。' });
  }
}

async function handleAdminDeleteImageCategory(req: any, res: any, body: any) {
  try {
    await requireManualPaymentAdmin(req);
    const id = readAdminContentId(body?.id, 'CATEGORY_ID');
    const response = await supabaseRest(`image_categories?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`ADMIN_IMAGE_CATEGORY_DELETE_FAILED:${response.status}`);
    return jsonResponse(res, 200, { ok: true });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 400 ? safeText(error?.message) : status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '圖片分類刪除失敗。' });
  }
}

async function handleAdminListImages(req: any, res: any) {
  try {
    await requireImageAdmin(req);
    const catalog = await readPublicImageCatalogFromR2();
    const images = catalog.images.map((image: any) => {
      const planType = catalogPlanType(image);
      const thumbnailUrl = safeText(image?.thumbnail_url || image?.preview_url);
      return {
        id: safeText(image?.id),
        title: safeText(image?.title) || "圖片素材",
        public_url: thumbnailUrl,
        thumbnail_url: thumbnailUrl,
        preview_url: safeText(image?.preview_url || image?.thumbnail_url),
        created_at: safeText(image?.created_at),
        is_free: planType === "free",
        price_type: planType,
        plan_type: planType,
        category_id: safeText(image?.category_id) || catalogCategoryName(image),
        category_name: catalogCategoryName(image),
      };
    });

    return jsonResponse(res, 200, { ok: true, images, total: images.length, source: "r2-public-catalog" });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    console.error("ADMIN_R2_IMAGES_READ_FAILED", error);
    return jsonResponse(res, status, {
      ok: false,
      error: status === 401
        ? "請輸入圖片後台管理金鑰。"
        : status === 403
          ? "圖片後台管理金鑰不正確。"
          : safeText(error?.message) || "R2_IMAGES_READ_FAILED",
    });
  }
}

async function handleAdminUpdateImage(req: any, res: any, body: any) {
  try {
    await requireManualPaymentAdmin(req);
    const id = readAdminContentId(body?.id, 'IMAGE_ID');
    const priceType = safeText(body?.price_type);
    if (!['free', 'bundle', 'price_99', 'price_199'].includes(priceType)) return jsonResponse(res, 400, { ok: false, error: 'PRICE_TYPE_INVALID' });
    const response = await supabaseRest(`images?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ price_type: priceType, is_free: priceType === 'free' }) });
    if (!response.ok) throw new Error(`ADMIN_IMAGE_UPDATE_FAILED:${response.status}`);
    return jsonResponse(res, 200, { ok: true });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 400 ? safeText(error?.message) : status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '圖片更新失敗。' });
  }
}

async function handleAdminDeleteImage(req: any, res: any, body: any) {
  try {
    await requireManualPaymentAdmin(req);
    const id = readAdminContentId(body?.id, 'IMAGE_ID');
    const response = await supabaseRest(`images?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`ADMIN_IMAGE_DELETE_FAILED:${response.status}`);
    return jsonResponse(res, 200, { ok: true });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 400 ? safeText(error?.message) : status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '圖片刪除失敗。' });
  }
}

async function handleAdminListDeals(req: any, res: any) {
  try {
    await requireManualPaymentAdmin(req);
    const deals = await readContentRows('deal_items?select=id,title,price,sale_end_time,product_url,affiliate_url&order=sale_end_time.asc.nullslast', 'ADMIN_DEALS_READ_FAILED');
    return jsonResponse(res, 200, { ok: true, deals });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '優惠商品暫時無法載入。' });
  }
}

async function handleAdminUpdateDealAffiliate(req: any, res: any, body: any) {
  try {
    await requireManualPaymentAdmin(req);
    const id = readAdminContentId(body?.id, 'DEAL_ID');
    const affiliateUrl = safeText(body?.affiliate_url);
    if (affiliateUrl && !/^https:\/\//i.test(affiliateUrl)) return jsonResponse(res, 400, { ok: false, error: 'AFFILIATE_URL_INVALID' });
    const response = await supabaseRest(`deal_items?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ affiliate_url: affiliateUrl || null }) });
    if (!response.ok) throw new Error(`ADMIN_DEAL_UPDATE_FAILED:${response.status}`);
    return jsonResponse(res, 200, { ok: true });
  } catch (error: any) {
    const status = Number(error?.statusCode || 500);
    return jsonResponse(res, status, { ok: false, error: status === 400 ? safeText(error?.message) : status === 401 ? '請先登入。' : status === 403 ? '沒有管理權限。' : '優惠商品更新失敗。' });
  }
}

export default async function handler(req: any, res: any) {
  const body = normalizeReqBody(req);
  const queryAction = typeof req?.query?.action === "string" ? req.query.action : "";
  const bodyAction = typeof body?.action === "string" ? body.action : "";
  const action = (queryAction || bodyAction || "").toLowerCase();
  console.log("ACTION RECEIVED:", action);

  if (action.startsWith("group-buy-")) {
    if (!GROUP_BUY_ENABLED) {
      return jsonResponse(res, 404, { ok: false, error: "團購功能目前暫停開放。" });
    }
    // 延遲載入團購模組：即使團購模組部署異常，也不會拖垮其他 /api/main actions。
    const { handleGroupBuyAction } = await import("./group-buy.js");
    return handleGroupBuyAction(req, res, body, action);
  }

  if (action.startsWith("image-bundle-r2-")) {
    const subAction = action.slice("image-bundle-r2-".length);

    // NT$399 素材庫全部留在同一支 /api/main，不新增 Vercel Function。
    switch (subAction) {
      case "create":
        return handleCreateDigitalProductOrder(req, res, body);
      case "create-proof-upload-url":
        return handleCreateImageBundleProofUploadUrl(req, res, body);
      case "proof-link":
        return handleAdminGetImageBundleProofUrl(req, res, body);
      case "list":
        return handleAdminListDigitalProductOrders(req, res);
      case "summary":
        return handleAdminGetDigitalProductBundleSummary(req, res);
      case "approve":
        return handleAdminApproveDigitalProductOrder(req, res, body);
      case "reject":
        return handleAdminRejectDigitalProductOrder(req, res, body);
      case "prepare-bundle-upload":
        return handleAdminCreateDigitalProductBundleUpload(req, res, body);
      case "complete-bundle-upload":
        return handleAdminCompleteDigitalProductBundleUpload(req, res, body);
      case "delete-bundle":
        return handleAdminDeleteDigitalProductBundle(req, res);
      case "download-link":
        return handleAdminGetDigitalProductDownloadLink(req, res, body);
      case "reset-download-count":
        return handleAdminResetDigitalProductDownloadCount(req, res, body);
      case "delete-test-order":
        return handleAdminDeleteDigitalProductTestOrder(req, res, body);
      default:
        return jsonResponse(res, 400, {
          ok: false,
          error: `不支援的 NT$399 素材庫操作：${subAction || "(empty)"}`,
        });
    }
  }

  switch (action) {
    case "ping":
      return handlePing(req, res);
    case "shorten":
      return handleShorten(req, res, body);
    case "getshort":
      return handleGetShort(req, res, body);
    case "recordclick":
      return handleRecordClick(req, res, body);
    case "getstats":
      return handleGetStats(req, res, body);
    case "gettopqr":
      return handleGetTopQR(req, res, body);
    case "homework":
      return handleSecureHomework(req, res, body);
    case "summary":
      return handleSecureSummary(req, res, body);
    case "auth":
      return handleAuth(req, res, body);
    case "get-current-user-credits":
      return handleGetCurrentUserCredits(req, res);
    case "get-my-purchase-logs":
      return handleGetMyPurchaseLogs(req, res);
    case "get-purchase-status":
      return handleGetPurchaseStatus(req, res);
    case "get-current-user-profile":
      return handleGetCurrentUserProfile(req, res);
    case "get-my-customer-service-status":
      return handleGetMyCustomerServiceStatus(req, res);
    case "get-my-product-image-generations":
      return handleGetMyProductImageGenerations(req, res);
    case "admin-list-product-image-generations":
      return handleAdminListProductImageGenerations(req, res);
    case "get-public-design-portfolio":
      return handleGetPublicDesignPortfolio(req, res);
    case "get-public-image-categories":
      return handleGetPublicImageCategories(req, res);
    case "get-public-images":
      return handleGetPublicImages(req, res);
    case "get-public-deals":
      return handleGetPublicDeals(req, res);
    case "admin-list-image-categories":
      return handleAdminListR2ImageCategories(req, res);
    case "admin-create-image-category":
      return handleAdminCreateImageCategory(req, res, body);
    case "admin-update-image-category":
      return handleAdminUpdateImageCategory(req, res, body);
    case "admin-delete-image-category":
      return handleAdminDeleteImageCategory(req, res, body);
    case "admin-list-images":
      return handleAdminListR2Images(req, res);
    case "admin-update-image":
      return handleAdminUpdateImage(req, res, body);
    case "admin-delete-image":
      return handleAdminDeleteImage(req, res, body);
    case "admin-list-deals":
      return handleAdminListDeals(req, res);
    case "admin-update-deal-affiliate":
      return handleAdminUpdateDealAffiliate(req, res, body);
    case "get-design-portfolio-admin-status":
      return handleGetDesignPortfolioAdminStatus(req, res);
    case "admin-upload-design-portfolio":
      return handleAdminUploadDesignPortfolio(req, res, body);
    case "create-business-card-order":
      return handleCreateBusinessCardOrder(req, res, body);
    case "upload-business-card-order-file":
      return handleUploadBusinessCardOrderFile(req, res, body);
    case "get-my-business-card-orders":
      return handleGetMyBusinessCardOrders(req, res);
    case "get-my-business-card-order-detail":
      return handleGetMyBusinessCardOrderDetail(req, res);
    case "request-business-card-revision":
      return handleCustomerRequestBusinessCardRevision(req, res, body);
    case "confirm-business-card-preview":
      return handleCustomerConfirmBusinessCardPreview(req, res, body);
    case "get-business-card-bank-transfer-info":
      return handleGetBusinessCardBankTransferInfo(req, res);
    case "create-business-card-payment-report":
      return handleCreateBusinessCardPaymentReport(req, res, body);
    case "get-public-business-card-profile":
      return handleGetPublicBusinessCardProfile(req, res);
    case "admin-list-business-card-orders":
      return handleAdminListBusinessCardOrders(req, res);
    case "admin-get-business-card-order-detail":
      return handleAdminGetBusinessCardOrderDetail(req, res);
    case "admin-upload-business-card-preview":
      return handleAdminUploadBusinessCardPreview(req, res, body);
    case "admin-list-business-card-payment-reports":
      return handleAdminListBusinessCardPaymentReports(req, res);
    case "admin-review-business-card-payment":
      return handleAdminReviewBusinessCardPayment(req, res, body);
    case "admin-ship-business-card-order":
      return handleAdminShipBusinessCardOrder(req, res, body);
    case "admin-grant-business-card-digital-profile":
      return handleAdminGrantBusinessCardDigitalProfile(req, res, body);
    case "admin-update-business-card-order":
      return handleAdminUpdateBusinessCardOrder(req, res, body);
    case "admin-get-business-card-order-files":
      return handleAdminGetBusinessCardOrderFiles(req, res);
    case "get-my-storefront":
      return handleGetMyStorefront(req, res);
    case "create-storefront-trial-request":
      return handleCreateStorefrontTrialRequest(req, res, body);
    case "save-storefront":
      return handleSaveStorefront(req, res, body);
    case "upload-storefront-image":
      return handleUploadStorefrontImage(req, res, body);
    case "get-public-storefront":
      return handleGetPublicStorefront(req, res);
    case "get-image-bundle-bank-transfer-info":
      return handleGetImageBundleBankTransferInfo(req, res);
    case "create-digital-product-order":
      return handleCreateDigitalProductOrder(req, res, body);
    case "download-free-image":
      return handleDownloadFreeImage(req, res);
    case "get-r2-image-thumbnail":
      return handleGetR2ImageThumbnail(req, res);
    case "get-r2-free-image-download":
      return handleGetR2FreeImageDownload(req, res);
    case "admin-list-digital-product-orders":
      return handleAdminListDigitalProductOrders(req, res);
    case "admin-approve-digital-product-order":
      return handleAdminApproveDigitalProductOrder(req, res, body);
    case "admin-reject-digital-product-order":
      return handleAdminRejectDigitalProductOrder(req, res, body);
    case "admin-get-digital-product-bundle-summary":
      return handleAdminGetDigitalProductBundleSummary(req, res);
    case "admin-create-digital-product-bundle-upload":
      return handleAdminCreateDigitalProductBundleUpload(req, res, body);
    case "admin-complete-digital-product-bundle-upload":
      return handleAdminCompleteDigitalProductBundleUpload(req, res, body);
    case "admin-delete-digital-product-bundle":
      return handleAdminDeleteDigitalProductBundle(req, res);
    case "admin-get-digital-product-download-link":
      return handleAdminGetDigitalProductDownloadLink(req, res, body);
    case "admin-delete-digital-product-test-order":
      return handleAdminDeleteDigitalProductTestOrder(req, res, body);
    case "download-digital-product-bundle":
      return handleDownloadDigitalProductBundle(req, res);
    case "get-bank-transfer-info":
      return handleGetBankTransferInfo(req, res);
    case "create-bank-transfer-report":
      return handleCreateBankTransferReport(req, res, body);
    case "admin-list-bank-transfer-reports":
      return handleAdminListBankTransferReports(req, res);
    case "admin-list-storefront-trial-requests":
      return handleAdminListStorefrontTrialRequests(req, res);
    case "admin-list-paid-storefront-orders":
      return handleAdminListPaidStorefrontOrders(req, res);
    case "admin-member-lookup":
      return handleAdminMemberLookup(req, res);
    case "admin-approve-bank-transfer-report":
      return handleAdminApproveBankTransferReport(req, res, body);
    case "admin-reject-bank-transfer-report":
      return handleAdminRejectBankTransferReport(req, res, body);
    case "admin-grant-storefront-for-purchase":
      return handleAdminGrantStorefrontForPurchase(req, res, body);
    case "admin-approve-storefront-trial-request":
      return handleAdminApproveStorefrontTrialRequest(req, res, body);
    case "admin-reject-storefront-trial-request":
      return handleAdminRejectStorefrontTrialRequest(req, res, body);
    case "uploadimage":
    case "upload-image":
      return handleUploadImage(req, res, body);
    case "create-image-upload-url":
      return handleCreateImageUploadUrl(req, res, body);
    case "finalize-image-upload":
      return handleFinalizeImageUpload(req, res, body);
    case "shopee":
      return handleShopee(req, res, body);
    case "shopeeimportcsv":
      return handleShopeeImportCsv(req, res, body);
    case "shopeeloginopen":
      return handleShopeeLoginOpen(req, res);
    case "shopeeloginstatus":
      return handleShopeeLoginStatus(req, res);
    case "shoeeeprepare":
    case "shopeeprepare":
      return handleShopeePrepare(req, res, body);
    case "shoeeerender":
    case "shopeerender":
      return handleShopeeRender(req, res, body);
    default:
      return res.status(400).json({ ok: false, error: "Use a supported action such as auth, create-business-card-order, get-my-business-card-order-detail, admin-upload-business-card-preview, or uploadImage", actionReceived: action });
  }
}
