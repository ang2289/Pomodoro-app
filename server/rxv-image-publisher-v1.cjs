"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");

let DatabaseSync = null;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {}

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.RXV_IMAGE_PUBLISHER_PORT || 3017);
const HOST = "127.0.0.1";
const DB_PATH = path.join(ROOT, "data", "rxv-image-publisher.db");
const SALES_URL = "https://pomodoro-app-eight-rouge.vercel.app/images";
const PLATFORM = "tiktok";

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    console.warn("[RXV] env load warning:", error && error.message ? error.message : error);
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

function getManifestSource() {
  const base = String(process.env.VITE_PUBLIC_R2_URL || process.env.R2_PUBLIC_ASSET_URL || "").replace(/\/$/, "");
  if (base) return { type: "url", value: base + "/catalog/images-public.json" };

  const explicit = String(process.env.VITE_IMAGE_MANIFEST_URL || "").trim();
  if (/^https?:\/\//i.test(explicit)) return { type: "url", value: explicit };

  return { type: "file", value: path.join(ROOT, "public", "data", "images-public.json") };
}

function requireDb() {
  if (!DatabaseSync) {
    throw new Error("目前 Node.js 不支援 node:sqlite。請使用專案目前的 Node 22+ 執行。");
  }
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(
    "PRAGMA journal_mode = WAL;\n" +
    "PRAGMA synchronous = NORMAL;\n" +
    "CREATE TABLE IF NOT EXISTS rxv_image_publish (" +
    " image_id TEXT NOT NULL," +
    " platform TEXT NOT NULL," +
    " status TEXT NOT NULL DEFAULT 'draft'," +
    " title TEXT NOT NULL DEFAULT ''," +
    " category TEXT NOT NULL DEFAULT ''," +
    " plan_type TEXT NOT NULL DEFAULT ''," +
    " image_url TEXT NOT NULL DEFAULT ''," +
    " caption TEXT NOT NULL DEFAULT ''," +
    " publish_id TEXT NOT NULL DEFAULT ''," +
    " post_url TEXT NOT NULL DEFAULT ''," +
    " drafted_at TEXT," +
    " published_at TEXT," +
    " updated_at TEXT NOT NULL," +
    " PRIMARY KEY (image_id, platform)" +
    ");" +
    "CREATE INDEX IF NOT EXISTS idx_rxv_image_publish_platform_status ON rxv_image_publish(platform, status);"
  );
  return db;
}

function nowIso() {
  return new Date().toISOString();
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("REQUEST_TOO_LARGE"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON_FORMAT_ERROR"));
      }
    });
    req.on("error", reject);
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function text(res, status, body, contentType) {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType || "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function htmlEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function loadManifest() {
  const source = getManifestSource();
  let raw;

  if (source.type === "url") {
    const response = await fetch(source.value, { cache: "no-store" });
    if (!response.ok) throw new Error("R2 圖片清單讀取失敗：HTTP " + response.status);
    raw = await response.json();
  } else {
    if (!fs.existsSync(source.value)) {
      throw new Error("找不到圖片清單。請確認 .env.local 內 VITE_PUBLIC_R2_URL，或 public/data/images-public.json 是否存在。");
    }
    raw = JSON.parse(fs.readFileSync(source.value, "utf8"));
  }

  const manifest = Array.isArray(raw) ? { images: raw, categories: [] } : raw || {};
  const categories = Array.isArray(manifest.categories) ? manifest.categories : [];
  const categoryMap = new Map();
  for (const c of categories) {
    const id = String(c && c.id || "").trim();
    if (id) categoryMap.set(id, String(c && c.name || id).trim());
  }

  const images = (Array.isArray(manifest.images) ? manifest.images : [])
    .map((img) => {
      const id = String(img && img.id || "").trim();
      const categoryId = String(
        img && (img.category_id || img.category_slug || img.category_name || img.category) || ""
      ).trim();
      const category = String(
        img && (img.category_name || img.category) || categoryMap.get(categoryId) || categoryId || "其他素材"
      ).trim();
      const title = String(img && img.title || category || "圖片素材").trim();
      const imageUrl = String(
        img && (img.preview_url || img.thumbnail_url || img.download_url) || ""
      ).trim();
      const rawPlan = String(img && (img.price_type || img.plan_type) || "bundle").toLowerCase();
      const planType = rawPlan === "free" ? "free" : "bundle";
      return { id, title, categoryId, category, imageUrl, planType };
    })
    .filter((img) => img.id && img.imageUrl);

  return {
    source,
    total: images.length,
    updatedAt: String(manifest.updated_at || ""),
    images
  };
}

function categoryPriority(category) {
  const name = String(category || "");
  const rules = [
    [/房仲|房地產/, 10],
    [/美髮|沙龍/, 20],
    [/美甲/, 30],
    [/美容|SPA|芳療/, 40],
    [/牙醫|牙科/, 50],
    [/寵物|動物/, 60],
    [/宗教|佛|療癒|觀音|地藏|阿彌陀/, 70]
  ];
  for (const pair of rules) {
    if (pair[0].test(name)) return pair[1];
  }
  return 100;
}

function hashtagsFor(category) {
  const name = String(category || "");
  if (/房仲|房地產/.test(name)) return "#房仲 #房地產 #房仲素材 #社群素材 #圖片素材";
  if (/美髮|沙龍/.test(name)) return "#美髮 #髮型師 #美髮素材 #社群素材 #圖片素材";
  if (/美甲/.test(name)) return "#美甲 #美甲師 #美甲素材 #社群素材 #圖片素材";
  if (/美容|SPA|芳療/.test(name)) return "#美容SPA #美容師 #芳療 #社群素材 #圖片素材";
  if (/牙醫|牙科/.test(name)) return "#牙醫 #牙科 #診所素材 #社群素材 #圖片素材";
  if (/寵物|動物/.test(name)) return "#寵物 #毛孩 #寵物素材 #社群素材 #圖片素材";
  if (/宗教|佛|療癒|觀音|地藏|阿彌陀/.test(name)) return "#佛像 #佛教 #祈福 #靜心 #免費圖片";
  return "#圖片素材 #社群素材 #商業素材 #設計素材 #RXV";
}

function captionFor(image) {
  const cat = image.category || "圖片素材";
  const title = image.title || cat;
  const tags = hashtagsFor(cat);

  if (image.planType === "free") {
    if (/宗教|佛|療癒|觀音|地藏|阿彌陀/.test(cat + " " + title)) {
      return [
        "🙏 免費佛像圖片分享｜" + title,
        "",
        "願見者平安順心、福慧增長。",
        "網站可免費瀏覽與下載指定免費圖片。",
        "",
        "🖼️ 免費圖片分享／更多圖片：",
        SALES_URL,
        "",
        tags + " #Shorts"
      ].join("\n");
    }

    return [
      "🖼️ 免費圖片分享｜" + title,
      "",
      "這張圖片目前開放免費下載，適合社群貼文、短影音與日常設計使用。",
      "",
      "👉 免費圖片／更多素材：",
      SALES_URL,
      "",
      tags
    ].join("\n");
  }

  return [
    "🖼️ " + cat + " 圖片素材｜" + title,
    "",
    "發文還在花時間找圖嗎？RxV 已整理多種職業與社群圖片素材。",
    "",
    "🔥 完整圖片素材庫限時 NT$199",
    "包含房仲、美髮、美甲、美容 SPA、牙醫等職業圖片，以及其他多種素材。",
    "",
    "👉 查看圖片／購買：",
    SALES_URL,
    "",
    tags
  ].join("\n");
}

function getExistingIds(db) {
  const rows = db.prepare(
    "SELECT image_id FROM rxv_image_publish WHERE platform = ? AND status IN ('draft','scheduled','published')"
  ).all(PLATFORM);
  return new Set(rows.map((row) => String(row.image_id)));
}

function listDrafts(db) {
  return db.prepare(
    "SELECT * FROM rxv_image_publish WHERE platform = ? AND status = 'draft' ORDER BY drafted_at DESC"
  ).all(PLATFORM);
}

function listPublished(db, limit) {
  const n = Math.max(1, Math.min(100, Number(limit || 20)));
  return db.prepare(
    "SELECT * FROM rxv_image_publish WHERE platform = ? AND status = 'published' ORDER BY published_at DESC LIMIT ?"
  ).all(PLATFORM, n);
}

async function generateDrafts(count) {
  const manifest = await loadManifest();
  const db = requireDb();
  try {
    const used = getExistingIds(db);
    const available = manifest.images
      .filter((img) => !used.has(img.id))
      .sort((a, b) => {
        const p = categoryPriority(a.category) - categoryPriority(b.category);
        if (p !== 0) return p;
        return a.id.localeCompare(b.id, "zh-Hant");
      });

    const take = Math.max(1, Math.min(20, Number(count || 5)));
    const selected = available.slice(0, take);
    const insert = db.prepare(
      "INSERT INTO rxv_image_publish " +
      "(image_id, platform, status, title, category, plan_type, image_url, caption, drafted_at, updated_at) " +
      "VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(image_id, platform) DO NOTHING"
    );

    const created = [];
    for (const image of selected) {
      const caption = captionFor(image);
      const now = nowIso();
      insert.run(
        image.id,
        PLATFORM,
        image.title,
        image.category,
        image.planType,
        image.imageUrl,
        caption,
        now,
        now
      );
      created.push(Object.assign({}, image, { caption, status: "draft", drafted_at: now }));
    }

    return {
      ok: true,
      created: created.length,
      items: created,
      manifestTotal: manifest.total,
      remainingBefore: available.length,
      manifestSource: manifest.source.value,
      manifestUpdatedAt: manifest.updatedAt
    };
  } finally {
    db.close();
  }
}

async function statusPayload() {
  const manifest = await loadManifest();
  const db = requireDb();
  try {
    const stats = db.prepare(
      "SELECT status, COUNT(*) AS count FROM rxv_image_publish WHERE platform = ? GROUP BY status"
    ).all(PLATFORM);
    const counts = { draft: 0, scheduled: 0, published: 0 };
    for (const row of stats) counts[String(row.status)] = Number(row.count || 0);
    const used = getExistingIds(db).size;
    return {
      ok: true,
      platform: PLATFORM,
      total: manifest.total,
      draft: counts.draft || 0,
      scheduled: counts.scheduled || 0,
      published: counts.published || 0,
      remaining: Math.max(0, manifest.total - used),
      dbPath: DB_PATH,
      manifestSource: manifest.source.value,
      manifestUpdatedAt: manifest.updatedAt
    };
  } finally {
    db.close();
  }
}

function dashboardHtml() {
  return [
    "<!doctype html>",
    "<html lang='zh-Hant'>",
    "<head>",
    "<meta charset='utf-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>RXV 圖片自動推廣器 v1</title>",
    "<style>",
    "body{font-family:system-ui,-apple-system,'Segoe UI','Noto Sans TC',sans-serif;margin:0;background:#f6f7fb;color:#172033}",
    ".wrap{max-width:1180px;margin:auto;padding:24px}",
    ".hero{background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:22px;box-shadow:0 8px 24px #0000000d}",
    "h1{margin:0 0 8px;font-size:28px}.muted{color:#64748b}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}",
    ".stat{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px}.stat b{display:block;font-size:26px;margin-top:4px}",
    ".actions{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.btn{border:0;border-radius:10px;padding:11px 16px;font-weight:800;cursor:pointer;background:#2563eb;color:#fff}",
    ".btn.gray{background:#475569}.btn.green{background:#059669}.btn.red{background:#dc2626}.btn.light{background:#e2e8f0;color:#1e293b}",
    ".grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:14px;display:grid;grid-template-columns:150px 1fr;gap:14px}",
    ".card img{width:150px;height:190px;object-fit:cover;border-radius:12px;background:#eee}.tag{display:inline-block;background:#eef2ff;color:#3730a3;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700}",
    "textarea{width:100%;min-height:180px;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit;resize:vertical}.small{font-size:12px;color:#64748b}",
    ".history{margin-top:24px}.history table{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden}.history th,.history td{padding:10px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:13px}",
    "@media(max-width:800px){.stats{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}.card{grid-template-columns:100px 1fr}.card img{width:100px;height:130px}}",
    "</style>",
    "</head>",
    "<body><div class='wrap'>",
    "<div class='hero'>",
    "<h1>RXV 圖片自動推廣器 v1</h1>",
    "<div class='muted'>零成本第一版：同步 R2 圖片 → 排除 TikTok 已用過圖片 → 自動產生待發文案 → 手動確認已發布。</div>",
    "<div class='actions'>",
    "<button class='btn' onclick='generateDrafts(5)'>產生 5 張待發內容</button>",
    "<button class='btn gray' onclick='refreshAll()'>同步最新圖片數量</button>",
    "<button class='btn light' onclick='generateDrafts(1)'>只產生 1 張測試</button>",
    "</div>",
    "<div id='msg' class='small'></div>",
    "</div>",
    "<div class='stats'>",
    "<div class='stat'>R2 圖片總數<b id='total'>-</b></div>",
    "<div class='stat'>待發布<b id='draft'>-</b></div>",
    "<div class='stat'>TikTok 已發布<b id='published'>-</b></div>",
    "<div class='stat'>尚未使用<b id='remaining'>-</b></div>",
    "</div>",
    "<h2>待發布內容</h2>",
    "<div id='drafts' class='grid'></div>",
    "<div class='history'><h2>最近已發布紀錄</h2><div id='history'></div></div>",
    "</div>",
    "<script>",
    "async function api(url,opts){const r=await fetch(url,opts);const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||d.error||('HTTP '+r.status));return d}",
    "function esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]))}",
    "function setMsg(s){document.getElementById('msg').textContent=s||''}",
    "async function refreshAll(){try{setMsg('同步中…');const s=await api('/api/status');total.textContent=s.total;draft.textContent=s.draft;published.textContent=s.published;remaining.textContent=s.remaining;const d=await api('/api/drafts');renderDrafts(d.items||[]);const h=await api('/api/published?limit=20');renderHistory(h.items||[]);setMsg('已同步最新資料｜來源：'+s.manifestSource)}catch(e){setMsg('錯誤：'+e.message)}}",
    "async function generateDrafts(n){try{setMsg('正在產生待發內容…');const d=await api('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:n})});setMsg('已新增 '+d.created+' 張待發內容');await refreshAll()}catch(e){setMsg('錯誤：'+e.message)}}",
    "function renderDrafts(items){const box=document.getElementById('drafts');if(!items.length){box.innerHTML='<div class=\"muted\">目前沒有待發布內容。按上方按鈕建立。</div>';return}box.innerHTML=items.map(x=>'<div class=\"card\"><div><img src=\"'+esc(x.image_url)+'\" alt=\"\"><div class=\"small\" style=\"margin-top:6px\">'+esc(x.image_id)+'</div></div><div><span class=\"tag\">'+esc(x.category||'其他')+'</span><h3>'+esc(x.title||'圖片素材')+'</h3><textarea id=\"cap_'+esc(x.image_id)+'\">'+esc(x.caption||'')+'</textarea><div class=\"actions\"><button class=\"btn green\" onclick=\"copyCap(\''+esc(x.image_id)+'\')\">複製文案</button><a class=\"btn gray\" style=\"text-decoration:none\" target=\"_blank\" href=\"/api/image?imageId='+encodeURIComponent(x.image_id)+'\">開啟圖片</a><button class=\"btn\" onclick=\"markPublished(\''+esc(x.image_id)+'\')\">標記已發布</button><button class=\"btn red\" onclick=\"releaseDraft(\''+esc(x.image_id)+'\')\">取消待發</button></div></div></div>').join('')}",
    "async function copyCap(id){const el=document.getElementById('cap_'+id);await navigator.clipboard.writeText(el.value);setMsg('文案已複製')}",
    "async function markPublished(id){const postUrl=prompt('可貼上 TikTok 貼文網址（沒有可留空）','')||'';await api('/api/published',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageId:id,postUrl})});await refreshAll()}",
    "async function releaseDraft(id){if(!confirm('取消這張待發？之後可再次被選到。'))return;await api('/api/release',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageId:id})});await refreshAll()}",
    "function renderHistory(items){const box=document.getElementById('history');if(!items.length){box.innerHTML='<div class=\"muted\">尚無已發布紀錄。</div>';return}box.innerHTML='<table><thead><tr><th>日期</th><th>分類</th><th>圖片</th><th>連結</th></tr></thead><tbody>'+items.map(x=>'<tr><td>'+esc((x.published_at||'').replace('T',' ').slice(0,16))+'</td><td>'+esc(x.category)+'</td><td>'+esc(x.title)+'</td><td>'+(x.post_url?'<a target=\"_blank\" href=\"'+esc(x.post_url)+'\">查看</a>':'-')+'</td></tr>').join('')+'</tbody></table>'}",
    "refreshAll();",
    "</script></body></html>"
  ].join("\n");
}

async function handleImageProxy(urlObj, res) {
  const imageId = String(urlObj.searchParams.get("imageId") || "").trim();
  if (!imageId) return text(res, 400, "IMAGE_ID_REQUIRED");
  const db = requireDb();
  let row;
  try {
    row = db.prepare(
      "SELECT image_url, title FROM rxv_image_publish WHERE image_id = ? AND platform = ? LIMIT 1"
    ).get(imageId, PLATFORM);
  } finally {
    db.close();
  }
  if (!row || !row.image_url) return text(res, 404, "IMAGE_NOT_FOUND");

  const upstream = await fetch(String(row.image_url));
  if (!upstream.ok) return text(res, 502, "IMAGE_FETCH_FAILED");
  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "private, max-age=60");
  res.setHeader(
    "Content-Disposition",
    "inline; filename*=UTF-8''" + encodeURIComponent(String(row.title || imageId).replace(/[\\/:*?"<>|]/g, "_"))
  );
  res.end(buffer);
}

async function requestHandler(req, res) {
  try {
    const urlObj = new URL(req.url || "/", "http://" + HOST + ":" + PORT);

    if (req.method === "GET" && urlObj.pathname === "/") {
      return text(res, 200, dashboardHtml(), "text/html; charset=utf-8");
    }

    if (req.method === "GET" && urlObj.pathname === "/api/status") {
      return json(res, 200, await statusPayload());
    }

    if (req.method === "GET" && urlObj.pathname === "/api/drafts") {
      const db = requireDb();
      try {
        return json(res, 200, { ok: true, items: listDrafts(db) });
      } finally {
        db.close();
      }
    }

    if (req.method === "GET" && urlObj.pathname === "/api/published") {
      const db = requireDb();
      try {
        return json(res, 200, { ok: true, items: listPublished(db, urlObj.searchParams.get("limit")) });
      } finally {
        db.close();
      }
    }

    if (req.method === "POST" && urlObj.pathname === "/api/generate") {
      const body = await readJsonBody(req);
      return json(res, 200, await generateDrafts(body.count || 5));
    }

    if (req.method === "POST" && urlObj.pathname === "/api/published") {
      const body = await readJsonBody(req);
      const imageId = String(body.imageId || "").trim();
      if (!imageId) return json(res, 400, { ok: false, message: "缺少 imageId" });
      const now = nowIso();
      const db = requireDb();
      try {
        const result = db.prepare(
          "UPDATE rxv_image_publish SET status='published', post_url=?, published_at=?, updated_at=? WHERE image_id=? AND platform=?"
        ).run(String(body.postUrl || "").trim(), now, now, imageId, PLATFORM);
        if (!Number(result.changes || 0)) return json(res, 404, { ok: false, message: "找不到待發布圖片" });
      } finally {
        db.close();
      }
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && urlObj.pathname === "/api/release") {
      const body = await readJsonBody(req);
      const imageId = String(body.imageId || "").trim();
      if (!imageId) return json(res, 400, { ok: false, message: "缺少 imageId" });
      const db = requireDb();
      try {
        db.prepare(
          "DELETE FROM rxv_image_publish WHERE image_id=? AND platform=? AND status='draft'"
        ).run(imageId, PLATFORM);
      } finally {
        db.close();
      }
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && urlObj.pathname === "/api/image") {
      return await handleImageProxy(urlObj, res);
    }

    if (req.method === "GET" && urlObj.pathname === "/health") {
      return json(res, 200, { ok: true, app: "rxv-image-publisher-v1" });
    }

    return json(res, 404, { ok: false, message: "NOT_FOUND" });
  } catch (error) {
    console.error(error);
    return json(res, 500, {
      ok: false,
      message: error && error.message ? error.message : String(error)
    });
  }
}

function openBrowser(url) {
  if (process.platform !== "win32") return;
  try {
    const child = spawn("cmd.exe", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    });
    child.unref();
  } catch {}
}

async function main() {
  if (process.argv.includes("--generate")) {
    const index = process.argv.indexOf("--generate");
    const count = Number(process.argv[index + 1] || 5);
    const result = await generateDrafts(count);
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  const server = http.createServer((req, res) => {
    void requestHandler(req, res);
  });

  server.listen(PORT, HOST, () => {
    const url = "http://" + HOST + ":" + PORT + "/";
    console.log("RXV 圖片自動推廣器 v1 已啟動：" + url);
    console.log("SQLite：" + DB_PATH);
    console.log("關閉此視窗即可停止。");
    setTimeout(() => openBrowser(url), 500);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error("[RXV] 啟動失敗：", error && error.stack ? error.stack : error);
    process.exitCode = 1;
  });
}

module.exports = {
  loadManifest,
  generateDrafts,
  statusPayload
};
