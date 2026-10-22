"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const SALES_URL = "https://pomodoro-app-eight-rouge.vercel.app/images";
const DEFAULT_BOARD = "療癒圖片";
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

function clean(value) {
  return String(value == null ? "" : value).trim();
}

function esc(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function manifestSource(root) {
  const base = clean(
    process.env.VITE_PUBLIC_R2_URL ||
    process.env.R2_PUBLIC_ASSET_URL ||
    process.env.RXV_R2_PUBLIC_BASE_URL ||
    process.env.CLOUDFLARE_R2_PUBLIC_URL ||
    process.env.R2_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");

  if (base) {
    return { type: "url", value: base + "/catalog/images-public.json" };
  }

  const explicit = clean(process.env.VITE_IMAGE_MANIFEST_URL || "");
  if (/^https?:\/\//i.test(explicit)) {
    return { type: "url", value: explicit };
  }

  return {
    type: "file",
    value: path.join(root, "public", "data", "images-public.json"),
  };
}

async function loadCatalog(root) {
  const source = manifestSource(root);
  let raw;

  if (source.type === "url") {
    const response = await fetch(source.value, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("PINTEREST_MANIFEST_HTTP_" + response.status);
    }
    raw = await response.json();
  } else {
    raw = JSON.parse(await fsp.readFile(source.value, "utf8"));
  }

  const manifest = Array.isArray(raw) ? { images: raw, categories: [] } : (raw || {});
  const categoryMap = new Map();

  for (const item of Array.isArray(manifest.categories) ? manifest.categories : []) {
    const id = clean(item && item.id);
    const name = clean(item && (item.name || item.label || id));
    if (id) categoryMap.set(id, name);
  }

  const images = (Array.isArray(manifest.images) ? manifest.images : [])
    .map((img) => {
      const categoryId = clean(
        img && (img.category_id || img.category_slug || img.category_name || img.category)
      );
      const category = clean(
        (img && img.category_name) ||
        categoryMap.get(categoryId) ||
        (img && img.category) ||
        categoryId ||
        "其他"
      );
      const imageUrl = clean(
        img && (img.download_url || img.preview_url || img.thumbnail_url || img.url)
      );
      return {
        id: clean(img && img.id),
        title: clean((img && img.title) || category || "圖片素材"),
        category,
        imageUrl,
        planType: clean(img && (img.price_type || img.plan_type || "bundle")).toLowerCase(),
      };
    })
    .filter((img) => img.imageUrl);

  return {
    source,
    updatedAt: clean(manifest.updated_at || ""),
    total: images.length,
    images,
  };
}

function categoryKind(category, title) {
  const text = (clean(category) + " " + clean(title)).toLowerCase();
  if (/佛|觀音|地藏|阿彌陀|宗教/.test(text)) return "buddha";
  if (/花|玫瑰|蘭|櫻|植物/.test(text)) return "flower";
  if (/貓|狗|寵物|毛孩/.test(text)) return "pet";
  if (/房仲|房地產|不動產/.test(text)) return "real-estate";
  if (/美髮|髮型|沙龍/.test(text)) return "hair";
  if (/美甲|指甲/.test(text)) return "nail";
  if (/美容|spa|芳療/.test(text)) return "spa";
  if (/牙醫|牙科/.test(text)) return "dental";
  return "generic";
}

function buildPinterestCopy(item) {
  const title = clean(item.title || item.category || "圖片素材");
  const category = clean(item.category || "圖片素材");
  const kind = categoryKind(category, title);

  if (kind === "buddha") {
    return {
      title: (title + "｜唯美療癒佛像圖片").slice(0, 100),
      description: [
        "唯美療癒佛像圖片分享。",
        "",
        "溫暖柔和的光影與莊嚴氛圍，適合收藏、靜心欣賞與手機桌布。",
        "",
        "想看更多療癒圖片與免費圖片素材，可到 RxV 圖片專區查看。",
        "",
        "#佛像 #佛教 #療癒圖片 #靜心 #免費圖片",
      ].join("\n"),
      boardName: "療癒圖片",
    };
  }

  if (kind === "flower") {
    return {
      title: (title + "｜唯美花卉療癒圖片").slice(0, 100),
      description: [
        "今日花卉療癒圖片分享。",
        "",
        "適合收藏、手機桌布、社群分享與設計靈感。",
        "",
        "想看更多不同花卉與療癒圖片，可到 RxV 圖片專區查看。",
        "",
        "#花卉 #療癒圖片 #唯美圖片 #桌布 #圖片分享",
      ].join("\n"),
      boardName: "療癒圖片",
    };
  }

  if (kind === "pet") {
    return {
      title: (title + "｜可愛寵物療癒圖片").slice(0, 100),
      description: [
        "可愛寵物圖片分享。",
        "",
        "適合收藏、社群貼文、手機桌布與日常療癒。",
        "",
        "更多不同風格圖片可到 RxV 圖片專區查看。",
        "",
        "#寵物 #貓咪 #狗狗 #療癒圖片 #圖片分享",
      ].join("\n"),
      boardName: "療癒圖片",
    };
  }

  const commercial = {
    "real-estate": ["房仲", "房仲每天發文還在花時間找圖嗎？", "#房仲 #房地產 #房仲素材 #社群素材"],
    hair: ["美髮", "美髮社群每天發文還在重新找圖嗎？", "#美髮 #髮型師 #美髮素材 #社群素材"],
    nail: ["美甲", "美甲發文需要更多好看的圖片素材嗎？", "#美甲 #美甲師 #美甲素材 #社群素材"],
    spa: ["美容 SPA", "美容 SPA 發文還在臨時找圖片嗎？", "#美容SPA #美容師 #芳療 #社群素材"],
    dental: ["牙醫", "牙醫診所衛教與社群宣傳還在找圖嗎？", "#牙醫 #牙科 #診所行銷 #社群素材"],
  };

  if (commercial[kind]) {
    const cfg = commercial[kind];
    return {
      title: (cfg[0] + "圖片素材｜社群發文素材").slice(0, 100),
      description: [
        cfg[1],
        "",
        "RxV 已整理常用情境圖片，發文時直接挑圖使用，省下重複找素材的時間。",
        "",
        "另有多種職業圖片素材與完整素材庫，可到網站查看。",
        "",
        cfg[2] + " #圖片素材",
      ].join("\n"),
      boardName: cfg[0] + "素材",
    };
  }

  return {
    title: (title + "｜RxV 圖片分享").slice(0, 100),
    description: [
      "圖片素材分享。",
      "",
      "適合收藏、社群貼文與設計靈感。",
      "",
      "更多不同主題圖片可到 RxV 圖片專區查看。",
      "",
      "#圖片分享 #圖片素材 #療癒圖片 #RxV",
    ].join("\n"),
    boardName: DEFAULT_BOARD,
  };
}

function extensionJobPublic(job) {
  if (!job) return null;
  return {
    id: job.id,
    queueSource: "pinterest-helper",
    platform: "pinterest",
    targetUrl: "https://www.pinterest.com/pin-creation-tool/",
    imagePath: job.imagePath,
    imageUrl: job.imageUrl,
    imageId: job.imageId,
    publishTitle: job.publishTitle,
    publishDescription: job.publishDescription,
    publishText: job.publishDescription,
    destinationUrl: job.destinationUrl,
    boardName: job.boardName,
    finalPublishMode: "manual",
    status: job.status,
    error: job.error || "",
    debug: job.debug || null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

async function downloadImageToStage(root, imageUrl) {
  const response = await fetch(imageUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("PINTEREST_IMAGE_HTTP_" + response.status);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error("PINTEREST_IMAGE_EMPTY");
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("PINTEREST_IMAGE_TOO_LARGE");

  const contentType = clean(response.headers.get("content-type")).toLowerCase();
  let ext = ".jpg";
  if (contentType.includes("png")) ext = ".png";
  else if (contentType.includes("webp")) ext = ".webp";
  else if (contentType.includes("gif")) ext = ".gif";
  else {
    try {
      const pathname = new URL(imageUrl).pathname;
      const candidate = path.extname(pathname).toLowerCase();
      if (/^\.(jpe?g|png|webp|gif)$/.test(candidate)) ext = candidate;
    } catch {}
  }

  const dir = path.join(root, "data", "pinterest-staging");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, "pin-" + Date.now() + "-" + crypto.randomUUID().slice(0, 8) + ext);
  await fsp.writeFile(filePath, buffer);
  return filePath;
}

function helperPage() {
  return [
    "<!doctype html>",
    "<html lang=\"zh-Hant\">",
    "<head>",
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    "<title>RxV Pinterest 一鍵填入 v1</title>",
    "<style>",
    "body{font-family:Arial,'Microsoft JhengHei',sans-serif;background:#f6f7fb;color:#111827;margin:0}.wrap{max-width:1080px;margin:0 auto;padding:20px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:0 3px 14px rgba(15,23,42,.05)}h1{margin:0 0 8px;font-size:26px}.muted{color:#64748b}.grid{display:grid;grid-template-columns:320px 1fr;gap:18px}@media(max-width:800px){.grid{grid-template-columns:1fr}}label{display:block;font-weight:700;margin:12px 0 6px}select,input,textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit}textarea{min-height:150px;resize:vertical}.thumb{width:100%;aspect-ratio:4/3;object-fit:contain;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0}.row{display:flex;gap:10px;flex-wrap:wrap}.btn{border:0;border-radius:10px;padding:12px 16px;font-weight:800;cursor:pointer}.primary{background:#e60023;color:#fff}.secondary{background:#e2e8f0;color:#0f172a}.status{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:10px;min-height:54px}.ok{color:#16a34a;font-weight:800}.warn{color:#b45309;font-weight:800}.count{font-size:12px;color:#64748b;text-align:right}.images{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.images img{width:100%;aspect-ratio:1/1;object-fit:cover;border:2px solid transparent;border-radius:10px;cursor:pointer}.images img.sel{border-color:#e60023}@media(max-width:700px){.images{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    "</style>",
    "</head>",
    "<body>",
    "<div class=\"wrap\">",
    "<div class=\"card\"><h1>📌 RxV Pinterest 一鍵填入 v1</h1><div class=\"muted\">自動選圖、產生標題／說明／連結、開 Pinterest 並填入；最後「發布／儲存」一定由你自己按。</div></div>",
    "<div class=\"grid\">",
    "<div class=\"card\">",
    "<label>分類</label><select id=\"category\"></select>",
    "<label>圖片</label><img id=\"preview\" class=\"thumb\" alt=\"預覽\"><div id=\"images\" class=\"images\"></div>",
    "</div>",
    "<div class=\"card\">",
    "<label>標題</label><input id=\"title\" maxlength=\"100\"><div id=\"titleCount\" class=\"count\">0 / 100</div>",
    "<label>說明</label><textarea id=\"description\" maxlength=\"800\"></textarea><div id=\"descCount\" class=\"count\">0 / 800</div>",
    "<label>導流網址</label><input id=\"link\" value=\"" + SALES_URL + "\">",
    "<label>Pinterest 圖版名稱</label><input id=\"board\" placeholder=\"例如：療癒圖片\"><div class=\"muted\" style=\"font-size:12px;margin-top:4px\">第一次請填你 Pinterest 已存在的圖版名稱；之後會記住。</div>",
    "<div class=\"row\" style=\"margin-top:14px\"><button id=\"regen\" class=\"btn secondary\">重新產生文案</button><button id=\"send\" class=\"btn primary\">開啟 Pinterest 並自動填入</button></div>",
    "<div style=\"margin-top:14px\" id=\"status\" class=\"status\">正在載入圖片…</div>",
    "</div>",
    "</div>",
    "</div>",
    "<script>",
    "let items=[];let selected=null;",
    "const $=(id)=>document.getElementById(id);",
    "function setStatus(t){$('status').textContent=t}",
    "function count(){ $('titleCount').textContent=$('title').value.length+' / 100'; $('descCount').textContent=$('description').value.length+' / 800'; }",
    "function uniqueCats(){return [...new Set(items.map(x=>x.category||'其他'))].sort((a,b)=>a.localeCompare(b,'zh-Hant'))}",
    "function renderCats(){const cats=uniqueCats();$('category').innerHTML='<option value=\"\">全部分類</option>'+cats.map(x=>'<option>'+x.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>').join('')}",
    "function filtered(){const c=$('category').value;return items.filter(x=>!c||x.category===c).slice(-24).reverse()}",
    "function renderImages(){const list=filtered();$('images').innerHTML=list.map((x,i)=>'<img data-i=\"'+items.indexOf(x)+'\" src=\"'+x.imageUrl+'\" title=\"'+(x.title||'')+'\">').join('');$('images').querySelectorAll('img').forEach(el=>el.onclick=()=>selectItem(items[Number(el.dataset.i)]));if(!selected&&list[0])selectItem(list[0])}",
    "async function selectItem(x){selected=x;$('preview').src=x.imageUrl;$('images').querySelectorAll('img').forEach(el=>el.classList.toggle('sel',items[Number(el.dataset.i)]===x));await regen()}",
    "async function regen(){if(!selected)return;const r=await fetch('/pinterest-helper/copy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(selected)});const d=await r.json();$('title').value=d.copy.title||'';$('description').value=d.copy.description||'';if(!$('board').value)$('board').value=localStorage.getItem('rxvPinterestBoard')||d.copy.boardName||'';count()}",
    "$('category').onchange=()=>{selected=null;renderImages()};$('title').oninput=count;$('description').oninput=count;$('regen').onclick=regen;",
    "$('send').onclick=async()=>{if(!selected){setStatus('請先選圖片');return}const board=$('board').value.trim();if(board)localStorage.setItem('rxvPinterestBoard',board);$('send').disabled=true;setStatus('⏳ 正在準備圖片與 Pinterest 工作…');try{const r=await fetch('/pinterest-helper/queue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageId:selected.id,imageUrl:selected.imageUrl,category:selected.category,title:$('title').value,description:$('description').value,link:$('link').value,boardName:board})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||d.error||('HTTP '+r.status));setStatus('✅ 已送出 Pinterest 一鍵填入工作\\n\\n接下來 Edge 會自動開 Pinterest、上傳圖片並填入內容。\\n最後請你自己檢查並按「發布／儲存」。');}catch(e){setStatus('❌ '+e.message)}finally{$('send').disabled=false}};",
    "fetch('/pinterest-helper/catalog').then(r=>r.json()).then(d=>{items=d.images||[];renderCats();renderImages();setStatus('✅ 圖片已載入 '+items.length+' 張\\n請選圖片後按「開啟 Pinterest 並自動填入」。')}).catch(e=>setStatus('❌ 圖片載入失敗：'+e.message));",
    "</script>",
    "</body></html>",
  ].join("\n");
}

function registerPinterestOneClickV1(app, options = {}) {
  const root = options.root || process.cwd();
  const jobs = new Map();
  const queue = [];

  function cleanupJob(job) {
    if (!job) return;
    const filePath = clean(job.imagePath);
    if (filePath) {
      setTimeout(() => {
        fsp.unlink(filePath).catch(() => {});
      }, 20 * 60 * 1000).unref?.();
    }
  }

  app.get("/pinterest-helper", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(helperPage());
  });

  app.get("/pinterest-helper/catalog", async (_req, res) => {
    try {
      const catalog = await loadCatalog(root);
      res.json({
        ok: true,
        total: catalog.total,
        updatedAt: catalog.updatedAt,
        images: catalog.images,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: "PINTEREST_CATALOG_FAILED",
        message: clean(error && error.message || error),
      });
    }
  });

  app.post("/pinterest-helper/copy", (req, res) => {
    const item = {
      title: clean(req.body && req.body.title),
      category: clean(req.body && req.body.category),
    };
    res.json({ ok: true, copy: buildPinterestCopy(item) });
  });

  app.post("/pinterest-helper/queue", async (req, res) => {
    try {
      const imageUrl = clean(req.body && req.body.imageUrl);
      if (!/^https?:\/\//i.test(imageUrl)) {
        return res.status(400).json({ ok: false, error: "PINTEREST_IMAGE_URL_REQUIRED" });
      }

      const imagePath = await downloadImageToStage(root, imageUrl);
      const fallback = buildPinterestCopy({
        title: clean(req.body && req.body.title),
        category: clean(req.body && req.body.category),
      });

      const job = {
        id: crypto.randomUUID(),
        queueSource: "pinterest-helper",
        platform: "pinterest",
        imageId: clean(req.body && req.body.imageId),
        imageUrl,
        imagePath,
        publishTitle: clean(req.body && req.body.title) || fallback.title,
        publishDescription: clean(req.body && req.body.description) || fallback.description,
        destinationUrl: clean(req.body && req.body.link) || SALES_URL,
        boardName: clean(req.body && req.body.boardName) || fallback.boardName || DEFAULT_BOARD,
        status: "pending",
        error: "",
        debug: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      jobs.set(job.id, job);
      queue.push(job.id);

      return res.json({
        ok: true,
        job: extensionJobPublic(job),
        queueDepth: queue.length,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: "PINTEREST_QUEUE_FAILED",
        message: clean(error && error.message || error),
      });
    }
  });

  app.get("/pinterest-helper/next", (_req, res) => {
    while (queue.length) {
      const id = queue.shift();
      const job = jobs.get(id);
      if (!job || job.status !== "pending") continue;
      job.status = "processing";
      job.updatedAt = Date.now();
      return res.json({ ok: true, job: extensionJobPublic(job) });
    }
    return res.json({ ok: true, job: null });
  });

  app.post("/pinterest-helper/result", (req, res) => {
    const id = clean(req.body && req.body.id);
    const job = jobs.get(id);
    if (!job) {
      return res.status(404).json({ ok: false, error: "PINTEREST_JOB_NOT_FOUND" });
    }

    job.status = clean(req.body && req.body.status) === "published" ? "published" : "prepared";
    job.error = clean(req.body && req.body.error);
    job.debug = req.body && req.body.debug || null;
    job.updatedAt = Date.now();
    cleanupJob(job);
    return res.json({ ok: true, job: extensionJobPublic(job) });
  });

  app.post("/pinterest-helper/fail", (req, res) => {
    const id = clean(req.body && req.body.id);
    const job = jobs.get(id);
    if (!job) {
      return res.status(404).json({ ok: false, error: "PINTEREST_JOB_NOT_FOUND" });
    }

    job.status = "failed";
    job.error = clean(req.body && req.body.error) || "PINTEREST_PREPARE_FAILED";
    job.debug = req.body && req.body.debug || null;
    job.updatedAt = Date.now();
    cleanupJob(job);
    return res.json({ ok: true, job: extensionJobPublic(job) });
  });

  app.get("/pinterest-helper/status", (_req, res) => {
    const list = Array.from(jobs.values()).slice(-20);
    res.json({
      ok: true,
      queueDepth: queue.length,
      recentJobs: list.map(extensionJobPublic),
    });
  });
}

module.exports = {
  registerPinterestOneClickV1,
  buildPinterestCopy,
};
