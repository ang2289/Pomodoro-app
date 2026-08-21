// 覆蓋到 D:\Pomodoro-app\api\main.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

const R2_IMAGE_ORIGINAL_PREFIX = "originals/by-image-id/";
const R2_IMAGE_DOWNLOAD_SIGNED_URL_SECONDS = 600;

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


function normalizeBase64Image(input: any) {
  const raw = String(input || "").trim();
  const match = raw.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  if (match) {
    const mimeType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    return { buffer: Buffer.from(match[2], "base64"), mimeType, ext };
  }

  const cleaned = raw.replace(/^data:image\/[^;]+;base64,/i, "");
  return { buffer: Buffer.from(cleaned, "base64"), mimeType: "image/jpeg", ext: "jpg" };
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
    body: buffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(`STORAGE_UPLOAD_FAILED:${uploadRes.status}:${text}`);
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/images/${objectPath.replace(/^\/+/, "")}`;
}

function getR2ImageDownloadClient() {
  const accountId = safeText(process.env.R2_ACCOUNT_ID);
  const accessKeyId = safeText(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = safeText(process.env.R2_SECRET_ACCESS_KEY);
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_DOWNLOAD_ENV_MISSING");
  }

  return {
    bucket: safeText(process.env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging"),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

async function handleDownloadImage(req: any, res: any, body: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Only POST requests are supported." });
  }

  try {
    const imageId = safeText(body?.imageId);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imageId)) {
      return res.status(400).json({ success: false, error: "imageId is required" });
    }

    const { client, bucket } = getR2ImageDownloadClient();
    const prefix = `${R2_IMAGE_ORIGINAL_PREFIX}${imageId}/`;
    const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 10 }));
    const originalKey = listed.Contents
      ?.map((item) => item.Key || "")
      .find((key) => /^original\.(jpg|jpeg|png|webp)$/i.test(key.slice(prefix.length)));
    if (!originalKey) return res.status(404).json({ success: false, error: "找不到原始圖片" });

    const extension = originalKey.split(".").pop()?.toLowerCase() || "jpg";
    const downloadUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: originalKey,
        ResponseContentDisposition: `attachment; filename="RXV-${imageId}.${extension}"`,
      }),
      { expiresIn: R2_IMAGE_DOWNLOAD_SIGNED_URL_SECONDS },
    );
    return res.status(200).json({ success: true, downloadUrl });
  } catch (error: any) {
    console.error("[download-image] 發生錯誤:", error);
    return res.status(500).json({ success: false, error: error?.message || "下載失敗，請稍後再試" });
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

  try {
    const base64 = body?.base64 || body?.fileDataBase64 || body?.imageBase64;
    const categoryId = safeText(body?.category_id || body?.categoryId);
    const priceType = safeText(body?.price_type || body?.priceType || "free") || "free";
    const originalName = safeText(body?.file_name || body?.filename || body?.name || "圖片素材");

    if (!base64) {
      return jsonResponse(res, 400, { success: false, error: "缺少圖片資料" });
    }
    if (!categoryId) {
      return jsonResponse(res, 400, { success: false, error: "請先選擇圖片分類" });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(res, 500, { success: false, error: "Supabase 環境變數未設定" });
    }

    const { buffer, mimeType, ext } = normalizeBase64Image(base64);
    if (!buffer.length) {
      return jsonResponse(res, 400, { success: false, error: "圖片資料格式錯誤" });
    }

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const safeId = crypto.randomUUID();
    const objectPath = `${yyyy}/${mm}/${Date.now()}-${safeId}.${ext}`;
    const publicUrl = await uploadToSupabaseStorage(objectPath, buffer, mimeType);

    // public.images 欄位對應：
    // 必填欄位為 title、image_url、access_level、price_type。
    // image_url 必須寫入，否則 Supabase 會回：
    // null value in column "image_url" violates not-null constraint
    const accessLevel = priceType || "free";
    const insertPayload = {
      title: sanitizeImageTitle(originalName),
      image_url: publicUrl,
      access_level: accessLevel,
      price_type: accessLevel,
      public_url: publicUrl,
      file_path: objectPath,
      file_size_kb: Math.max(1, Math.round(buffer.length / 1024)),
      is_free: accessLevel === "free",
      category_id: categoryId,
      created_at: now.toISOString(),
    };

    const insertRes = await supabaseRest("images", {
      method: "POST",
      body: JSON.stringify(insertPayload),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text().catch(() => "");
      throw new Error(`IMAGE_DB_INSERT_FAILED:${insertRes.status}:${text}`);
    }

    const rows = await insertRes.json().catch(() => []);
    const record = Array.isArray(rows) ? rows[0] : rows;

    return jsonResponse(res, 200, {
      success: true,
      ok: true,
      action: "uploadImage",
      image: record,
      public_url: publicUrl,
      path: objectPath,
    });
  } catch (e: any) {
    console.error("UPLOAD_IMAGE_FAILED", e);
    return jsonResponse(res, 500, {
      success: false,
      ok: false,
      error: e?.message || "圖片上傳失敗",
    });
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

async function hashPassword(password: string) {
  try {
    const bcrypt = await import("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return { hash, field: "password_hash" };
  } catch {
    return { hash: password, field: "password" };
  }
}

async function verifyPassword(password: string, stored: string) {
  if (!stored) return false;
  if (stored === password) return true;

  if (/^\$2[aby]\$/.test(stored)) {
    try {
      const bcrypt = await import("bcryptjs");
      return await bcrypt.compare(password, stored);
    } catch {
      return false;
    }
  }

  return false;
}

async function insertUser(email: string, password: string) {
  const id = crypto.randomUUID();
  const hashed = await hashPassword(password);
  const attempts = [
    { id, email, [hashed.field]: hashed.hash, created_at: new Date().toISOString() },
    { id, email, password: password, created_at: new Date().toISOString() },
    { id, email, password_hash: hashed.hash, created_at: new Date().toISOString() },
    { email, [hashed.field]: hashed.hash, created_at: new Date().toISOString() },
    { email, password: password, created_at: new Date().toISOString() },
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
  if (!userId) return;
  const payloads = [
    { user_id: userId, credits: 0 },
    { user_id: userId, balance: 0 },
  ];

  for (const payload of payloads) {
    try {
      const res = await supabaseRest("user_credits", { method: "POST", body: JSON.stringify(payload) });
      if (res.ok || res.status === 409) return;
    } catch {}
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
      return jsonResponse(res, 200, {
        ok: true,
        success: true,
        message: "註冊成功",
        token: `rxv-${String(user?.id || email)}-${Date.now()}`,
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

    return jsonResponse(res, 200, {
      ok: true,
      success: true,
      message: "登入成功",
      token: `rxv-${String(user?.id || email)}-${Date.now()}`,
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

async function handleHomework(req: any, res: any, body: any) {
  return res.status(200).json({ ok: true, action: "homework", message: "Not implemented yet" });
}

async function handleSummary(req: any, res: any, body: any) {
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

export default async function handler(req: any, res: any) {
  const body = normalizeReqBody(req);
  const queryAction = typeof req?.query?.action === "string" ? req.query.action : "";
  const bodyAction = typeof body?.action === "string" ? body.action : "";
  const action = (queryAction || bodyAction || "").toLowerCase();
  console.log("ACTION RECEIVED:", action);

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
      return handleHomework(req, res, body);
    case "summary":
      return handleSummary(req, res, body);
    case "auth":
      return handleAuth(req, res, body);
    case "download-image":
      return handleDownloadImage(req, res, body);
    case "uploadimage":
    case "upload-image":
      return handleUploadImage(req, res, body);
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
      return res.status(400).json({ ok: false, error: "Use ?action=ping|shorten|getShort|recordClick|getStats|getTopQR|homework|summary|auth|uploadImage|shopee", actionReceived: action });
  }
}
