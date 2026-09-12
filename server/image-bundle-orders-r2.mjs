// server/image-bundle-orders-r2.ts
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var PRODUCT = {
  code: "image-bundle-full",
  productName: "1584+ \u9AD8\u756B\u8CEA\u5716\u7247\u7D20\u6750\u5EAB\u5B8C\u6574\u7248",
  amountNtd: 399
};
var ORDER_PREFIX = "private/image-bundle-orders/orders/";
var PENDING_PREFIX = "private/image-bundle-orders/pending-email/";
var BUNDLE_META_KEY = "private/image-bundle-orders/bundle/current.json";
var BUNDLE_OBJECT_PREFIX = "private/image-bundles/";
var SIGNED_DOWNLOAD_SECONDS = 7 * 24 * 60 * 60;
var r2Client = null;
function safeText(value) {
  return String(value ?? "").trim();
}
function normalizeEmail(value) {
  return safeText(value).toLowerCase();
}
function loadLocalEnvIfNeeded() {
  const names = [
    "RXV_IMAGE_ADMIN_KEY",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_PRIVATE_BUCKET_NAME"
  ];
  if (names.slice(0, 4).every((name) => safeText(process.env[name]))) return;
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "..", ".env.local"),
    process.platform === "win32" ? String.raw`D:\Pomodoro-app\.env.local` : ""
  ].filter(Boolean);
  const envPath = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (!envPath) return;
  try {
    for (const raw of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i <= 0) continue;
      const key = line.slice(0, i).trim();
      if (!names.includes(key)) continue;
      let value = line.slice(i + 1).trim();
      if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      if (value) process.env[key] = value;
    }
  } catch {
  }
}
function getConfig() {
  loadLocalEnvIfNeeded();
  const cfg = {
    adminKey: safeText(process.env.RXV_IMAGE_ADMIN_KEY),
    accountId: safeText(process.env.R2_ACCOUNT_ID),
    accessKeyId: safeText(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: safeText(process.env.R2_SECRET_ACCESS_KEY),
    privateBucket: safeText(process.env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging")
  };
  const missing = Object.entries(cfg).filter(([key, value]) => key !== "privateBucket" && !value).map(([key]) => key);
  if (missing.length) {
    const error = new Error(`IMAGE_BUNDLE_R2_ENV_MISSING:${missing.join(",")}`);
    error.statusCode = 503;
    throw error;
  }
  return cfg;
}
function client() {
  if (r2Client) return r2Client;
  const cfg = getConfig();
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey
    }
  });
  return r2Client;
}
function json(res, status, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(payload);
  }
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
function header(req, name) {
  const headers = req?.headers || {};
  return safeText(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()]);
}
function secureEqual(left, right) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
function requireAdmin(req) {
  const cfg = getConfig();
  const provided = header(req, "x-rxv-image-admin-key");
  if (!provided) {
    const error = new Error("\u8ACB\u8F38\u5165\u5716\u7247\u5F8C\u53F0\u7BA1\u7406\u91D1\u9470\u3002");
    error.statusCode = 401;
    throw error;
  }
  if (!secureEqual(provided, cfg.adminKey)) {
    const error = new Error("\u5716\u7247\u5F8C\u53F0\u7BA1\u7406\u91D1\u9470\u4E0D\u6B63\u78BA\u3002");
    error.statusCode = 403;
    throw error;
  }
}
function body(req) {
  if (req?.body == null) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}
async function bodyToText(value) {
  if (!value) return "";
  if (typeof value.transformToString === "function") return value.transformToString("utf-8");
  const chunks = [];
  for await (const chunk of value) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}
async function readJson(key) {
  const cfg = getConfig();
  try {
    const result = await client().send(new GetObjectCommand({ Bucket: cfg.privateBucket, Key: key }));
    const text = await bodyToText(result.Body);
    return text ? JSON.parse(text) : null;
  } catch (error) {
    const status = Number(error?.$metadata?.httpStatusCode || 0);
    const name = safeText(error?.name);
    if (status === 404 || name === "NoSuchKey" || name === "NotFound") return null;
    throw error;
  }
}
async function putJson(key, value) {
  const cfg = getConfig();
  await client().send(
    new PutObjectCommand({
      Bucket: cfg.privateBucket,
      Key: key,
      Body: Buffer.from(JSON.stringify(value, null, 2), "utf8"),
      ContentType: "application/json; charset=utf-8",
      CacheControl: "private, no-store"
    })
  );
}
async function deleteObject(key) {
  const cfg = getConfig();
  await client().send(new DeleteObjectCommand({ Bucket: cfg.privateBucket, Key: key }));
}
function orderKey(id) {
  return `${ORDER_PREFIX}${id}.json`;
}
function pendingKey(email) {
  const hash = crypto.createHash("sha256").update(email).digest("hex");
  return `${PENDING_PREFIX}${hash}.json`;
}
function orderNo() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(/* @__PURE__ */ new Date()).replace(/-/g, "");
  return `IMG${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}
function validTransferDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = /* @__PURE__ */ new Date(`${value}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return false;
  const now = Date.now();
  const age = now - date.getTime();
  return age >= -24 * 60 * 60 * 1e3 && age <= 32 * 24 * 60 * 60 * 1e3;
}
async function listOrders() {
  const cfg = getConfig();
  const keys = [];
  let continuationToken;
  do {
    const page = await client().send(
      new ListObjectsV2Command({
        Bucket: cfg.privateBucket,
        Prefix: ORDER_PREFIX,
        ContinuationToken: continuationToken,
        MaxKeys: 1e3
      })
    );
    for (const item of page.Contents || []) {
      const key = safeText(item.Key);
      if (key.endsWith(".json")) keys.push(key);
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : void 0;
  } while (continuationToken);
  const orders = [];
  for (let i = 0; i < keys.length; i += 25) {
    const batch = keys.slice(i, i + 25);
    const rows = await Promise.all(batch.map((key) => readJson(key)));
    for (const row of rows) if (row?.id) orders.push(row);
  }
  orders.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return orders;
}
async function createOrder(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method Not Allowed" });
  const input = body(req);
  const productCode = safeText(input?.productCode || input?.product_code);
  if (productCode !== PRODUCT.code) return json(res, 400, { ok: false, error: "\u5546\u54C1\u4EE3\u78BC\u4E0D\u6B63\u78BA\u3002" });
  const email = normalizeEmail(input?.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: "\u8ACB\u8F38\u5165\u6B63\u78BA\u7684 Email\u3002" });
  const lastFive = safeText(input?.accountLastFive || input?.account_last_five);
  if (!/^\d{5}$/.test(lastFive)) return json(res, 400, { ok: false, error: "\u8ACB\u8F38\u5165\u532F\u51FA\u5E33\u865F\u5F8C\u4E94\u78BC\uFF085 \u4F4D\u6578\u5B57\uFF09\u3002" });
  const transferDate = safeText(input?.transferDate || input?.transfer_date);
  if (!validTransferDate(transferDate)) return json(res, 400, { ok: false, error: "\u8ACB\u78BA\u8A8D\u532F\u6B3E\u65E5\u671F\u662F\u5426\u6B63\u78BA\u3002" });
  const markerKey = pendingKey(email);
  const existingMarker = await readJson(markerKey);
  if (existingMarker?.orderId) {
    const existingOrder = await readJson(orderKey(existingMarker.orderId));
    if (existingOrder?.status === "pending") {
      return json(res, 409, {
        ok: false,
        error: `\u9019\u500B Email \u5DF2\u6709\u5F85\u6838\u5C0D\u7684\u7D20\u6750\u5EAB\u532F\u6B3E\u56DE\u5831\uFF08${existingOrder.order_no || existingMarker.orderNo || "\u5F85\u8655\u7406"}\uFF09\uFF0C\u8ACB\u52FF\u91CD\u8907\u9001\u51FA\u3002`
      });
    }
    await deleteObject(markerKey).catch(() => void 0);
  }
  const id = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const order = {
    id,
    order_no: orderNo(),
    product_code: PRODUCT.code,
    product_name: PRODUCT.productName,
    email,
    amount_ntd: PRODUCT.amountNtd,
    account_last_five: lastFive,
    transfer_date: transferDate,
    status: "pending",
    note: safeText(input?.note).slice(0, 500) || null,
    created_at: now,
    processed_at: null,
    review_note: null,
    download_expires_at: null,
    download_count: 0,
    download_limit: 0
  };
  await putJson(orderKey(id), order);
  await putJson(markerKey, { orderId: id, orderNo: order.order_no, createdAt: now });
  return json(res, 200, { ok: true, order: { orderNo: order.order_no, status: order.status } });
}
async function getOrderOrThrow(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    const error = new Error("\u7D20\u6750\u5EAB\u8A02\u55AE\u7DE8\u865F\u4E0D\u6B63\u78BA\u3002");
    error.statusCode = 400;
    throw error;
  }
  const order = await readJson(orderKey(id));
  if (!order) {
    const error = new Error("\u627E\u4E0D\u5230\u7D20\u6750\u5EAB\u8A02\u55AE\u3002");
    error.statusCode = 404;
    throw error;
  }
  return order;
}
async function adminList(req, res) {
  requireAdmin(req);
  const orders = await listOrders();
  return json(res, 200, { ok: true, orders });
}
async function adminApprove(req, res) {
  requireAdmin(req);
  const input = body(req);
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id));
  if (order.status !== "pending") return json(res, 409, { ok: false, error: "\u6B64\u8A02\u55AE\u76EE\u524D\u4E0D\u662F\u5F85\u6838\u5C0D\u72C0\u614B\u3002" });
  order.status = "approved";
  order.processed_at = (/* @__PURE__ */ new Date()).toISOString();
  order.download_expires_at = new Date(Date.now() + SIGNED_DOWNLOAD_SECONDS * 1e3).toISOString();
  await putJson(orderKey(order.id), order);
  await deleteObject(pendingKey(order.email)).catch(() => void 0);
  return json(res, 200, { ok: true, order });
}
async function adminReject(req, res) {
  requireAdmin(req);
  const input = body(req);
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id));
  if (order.status !== "pending") return json(res, 409, { ok: false, error: "\u6B64\u8A02\u55AE\u76EE\u524D\u4E0D\u662F\u5F85\u6838\u5C0D\u72C0\u614B\u3002" });
  order.status = "rejected";
  order.processed_at = (/* @__PURE__ */ new Date()).toISOString();
  order.review_note = safeText(input?.reviewNote || input?.review_note).slice(0, 500) || null;
  await putJson(orderKey(order.id), order);
  await deleteObject(pendingKey(order.email)).catch(() => void 0);
  return json(res, 200, { ok: true, order });
}
async function currentBundle() {
  return readJson(BUNDLE_META_KEY);
}
async function adminSummary(req, res) {
  requireAdmin(req);
  const [orders, bundleFile] = await Promise.all([listOrders(), currentBundle()]);
  const pendingPaymentCount = orders.filter((order) => order.status === "pending").length;
  const approvedCount = orders.filter((order) => order.status === "approved").length;
  return json(res, 200, {
    ok: true,
    bundleFile,
    pendingPaymentCount,
    pendingDeliveryCount: bundleFile ? 0 : approvedCount,
    approvedCount
  });
}
function safeZipFileName(value) {
  const raw = safeText(value || "rxv-image-bundle.zip");
  const cleaned = raw.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "_").slice(0, 120);
  return cleaned.toLowerCase().endsWith(".zip") ? cleaned : `${cleaned}.zip`;
}
async function adminPrepareBundleUpload(req, res) {
  requireAdmin(req);
  const input = body(req);
  const fileName = safeZipFileName(input?.fileName || input?.file_name);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(/* @__PURE__ */ new Date()).replace(/-/g, "");
  const objectKey = `${BUNDLE_OBJECT_PREFIX}image-bundle-full-v${date}-${crypto.randomBytes(8).toString("hex")}.zip`;
  const cfg = getConfig();
  const uploadUrl = await getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: cfg.privateBucket, Key: objectKey, ContentType: "application/zip" }),
    { expiresIn: 15 * 60 }
  );
  return json(res, 200, { ok: true, objectKey, fileName, uploadUrl });
}
async function adminCompleteBundleUpload(req, res) {
  requireAdmin(req);
  const input = body(req);
  const objectKey = safeText(input?.objectKey || input?.object_key);
  if (!objectKey.startsWith(BUNDLE_OBJECT_PREFIX) || !objectKey.endsWith(".zip")) {
    return json(res, 400, { ok: false, error: "ZIP \u7269\u4EF6\u8DEF\u5F91\u4E0D\u6B63\u78BA\u3002" });
  }
  const cfg = getConfig();
  const head = await client().send(new HeadObjectCommand({ Bucket: cfg.privateBucket, Key: objectKey }));
  const uploadedAt = (/* @__PURE__ */ new Date()).toISOString();
  const meta = {
    id: crypto.randomUUID(),
    version: path.basename(objectKey, ".zip"),
    objectKey,
    fileName: safeZipFileName(input?.fileName || input?.file_name),
    sizeBytes: Number(head.ContentLength || 0),
    contentType: safeText(head.ContentType || "application/zip"),
    status: "active",
    uploadedAt
  };
  await putJson(BUNDLE_META_KEY, meta);
  return json(res, 200, { ok: true, bundleFile: meta });
}
async function adminDeleteBundle(req, res) {
  requireAdmin(req);
  const meta = await currentBundle();
  if (meta?.objectKey) await deleteObject(meta.objectKey).catch(() => void 0);
  await deleteObject(BUNDLE_META_KEY).catch(() => void 0);
  return json(res, 200, { ok: true });
}
async function adminDownloadLink(req, res) {
  requireAdmin(req);
  const input = body(req);
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id));
  if (order.status !== "approved") return json(res, 409, { ok: false, error: "\u6B64\u8A02\u55AE\u5C1A\u672A\u6838\u51C6\u6536\u6B3E\u3002" });
  const meta = await currentBundle();
  if (!meta?.objectKey) return json(res, 409, { ok: false, error: "\u5C1A\u672A\u4E0A\u50B3\u5716\u7247\u7D20\u6750\u5EAB ZIP\u3002" });
  const cfg = getConfig();
  const downloadUrl = await getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: cfg.privateBucket,
      Key: meta.objectKey,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(meta.fileName)}`
    }),
    { expiresIn: SIGNED_DOWNLOAD_SECONDS }
  );
  order.download_expires_at = new Date(Date.now() + SIGNED_DOWNLOAD_SECONDS * 1e3).toISOString();
  await putJson(orderKey(order.id), order);
  return json(res, 200, { ok: true, downloadUrl, expiresAt: order.download_expires_at });
}
async function adminDeleteTestOrder(req, res) {
  requireAdmin(req);
  const input = body(req);
  const order = await getOrderOrThrow(safeText(input?.orderId || input?.order_id));
  if (!/CODEX DELIVERY E2E TEST/i.test(order.note || "")) {
    return json(res, 400, { ok: false, error: "\u53EA\u5141\u8A31\u522A\u9664\u6A19\u8A18\u70BA CODEX DELIVERY E2E TEST \u7684\u6E2C\u8A66\u8A02\u55AE\u3002" });
  }
  await deleteObject(orderKey(order.id));
  await deleteObject(pendingKey(order.email)).catch(() => void 0);
  return json(res, 200, { ok: true });
}
async function handleImageBundleR2Action(req, res, rawAction) {
  try {
    const action = safeText(rawAction || req?.query?.action);
    if (action === "create") return await createOrder(req, res);
    if (action === "list") return await adminList(req, res);
    if (action === "approve") return await adminApprove(req, res);
    if (action === "reject") return await adminReject(req, res);
    if (action === "summary") return await adminSummary(req, res);
    if (action === "prepare-bundle-upload") return await adminPrepareBundleUpload(req, res);
    if (action === "complete-bundle-upload") return await adminCompleteBundleUpload(req, res);
    if (action === "delete-bundle") return await adminDeleteBundle(req, res);
    if (action === "download-link") return await adminDownloadLink(req, res);
    if (action === "delete-test-order") return await adminDeleteTestOrder(req, res);
    return json(res, 400, { ok: false, error: "Unsupported image bundle order action" });
  } catch (error) {
    const status = Number(error?.statusCode || error?.$metadata?.httpStatusCode || 500);
    return json(res, status >= 400 && status < 600 ? status : 500, {
      ok: false,
      error: safeText(error?.message || "\u5716\u7247\u7D20\u6750\u5EAB\u8A02\u55AE\u8655\u7406\u5931\u6557\u3002")
    });
  }
}
export {
  handleImageBundleR2Action
};
