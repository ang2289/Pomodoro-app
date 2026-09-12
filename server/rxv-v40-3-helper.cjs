"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn, execFile } = require("node:child_process");
let DatabaseSync = null;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeFilename(value) {
  return (String(value || "video")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "video");
}

function rxvV4056NormalizeLookup(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\.mp4$/i, "")
    .replace(/[\s_\-–—]+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function rxvV4056Hash(value) {
  let h = 2166136261;
  const s = String(value || "");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function rxvV4056ResolveLocalVideo(videoName, productTitle) {
  const outDir = String(process.env.RXV_OUT_MP4_DIR || "D:\\out_mp4");
  try {
    if (!fs.existsSync(outDir)) return "";
  } catch {
    return "";
  }

  const directBase = path.basename(String(videoName || "").trim());
  if (/\.mp4$/i.test(directBase)) {
    const direct = path.join(outDir, directBase);
    try {
      if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
    } catch {}
  }

  const titleKey = rxvV4056NormalizeLookup(productTitle);
  if (titleKey.length < 4) return "";

  let candidates = [];
  try {
    candidates = fs.readdirSync(outDir)
      .filter((name) => /\.mp4$/i.test(name))
      .map((name) => {
        const full = path.join(outDir, name);
        let mtimeMs = 0;
        try { mtimeMs = fs.statSync(full).mtimeMs || 0; } catch {}
        return { name, full, key: rxvV4056NormalizeLookup(name), mtimeMs };
      })
      .filter((item) => item.key.includes(titleKey))
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
  } catch {
    return "";
  }
  return candidates[0]?.full || "";
}

function rxvV4056RemoteName(productKey, localPath) {
  const key = String(productKey || "")
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(-48);
  if (key) return `RXV_${key}.mp4`;
  return `RXV_FILE_${rxvV4056Hash(path.basename(String(localPath || "")))}.mp4`;
}

function runFile(file, args = [], timeoutMs = 120000) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        code: error && Number.isFinite(error.code) ? Number(error.code) : 0,
        error: error ? String(error.message || error) : "",
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
      });
    });
  });
}

function existingFile(candidates) {
  for (const candidate of candidates) {
    const p = String(candidate || "").trim();
    if (!p) continue;
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {}
  }
  return "";
}

async function resolveFromWhere(exe) {
  const result = await runFile("where.exe", [exe], 5000);
  if (!result.ok) return "";
  return existingFile(result.stdout.split(/\r?\n/));
}

async function resolveAdb() {
  const envPath = String(process.env.RXV_ADB_PATH || "").trim();
  const common = [
    envPath,
    path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk", "platform-tools", "adb.exe"),
    "C:\\Android\\platform-tools\\adb.exe",
    "D:\\Android\\platform-tools\\adb.exe",
    "C:\\scrcpy\\adb.exe",
    "D:\\scrcpy\\adb.exe",
    "D:\\tools\\scrcpy\\adb.exe",
  ];
  return existingFile(common) || (await resolveFromWhere("adb.exe")) || (await resolveFromWhere("adb"));
}

async function resolveScrcpy() {
  const envPath = String(process.env.RXV_SCRCPY_PATH || "").trim();
  const common = [
    envPath,
    "C:\\scrcpy\\scrcpy.exe",
    "D:\\scrcpy\\scrcpy.exe",
    "D:\\tools\\scrcpy\\scrcpy.exe",
    path.join(process.env.LOCALAPPDATA || "", "Programs", "scrcpy", "scrcpy.exe"),
  ];
  return existingFile(common) || (await resolveFromWhere("scrcpy.exe")) || (await resolveFromWhere("scrcpy"));
}


async function findFacebookPackage(adbPath, serial) {
  const pkg = await runFile(adbPath, ["-s", serial, "shell", "pm", "list", "packages", "com.facebook"], 10000);
  const packages = String(pkg.stdout || "")
    .split(/\r?\n/)
    .map((x) => x.replace(/^package:/, "").trim())
    .filter(Boolean);
  if (packages.includes("com.facebook.katana")) return "com.facebook.katana";
  if (packages.includes("com.facebook.lite")) return "com.facebook.lite";
  return "";
}

function outputLooksBad(result) {
  return !result?.ok || /Error:|Exception|unable to resolve|Activity not started|does not exist|not found/i.test(`${result?.stdout || ""}\n${result?.stderr || ""}`);
}

async function openAndroidPackage(adbPath, serial, packageName) {
  const prefix = ["-s", serial, "shell"];
  const attempts = [];

  // Android 11+ / Samsung: resolve the real launcher activity first. This is
  // more reliable than relying on monkey alone.
  const resolve = await runFile(adbPath, [...prefix, "cmd", "package", "resolve-activity", "--brief", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.LAUNCHER", packageName], 10000);
  attempts.push({ method: "resolve_activity", ...resolve });
  const component = String(resolve.stdout || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .find((x) => x.includes("/") && !/^No activity/i.test(x));
  if (component) {
    const direct = await runFile(adbPath, [...prefix, "am", "start", "-W", "-n", component], 20000);
    attempts.push({ method: "resolved_component", component, ...direct });
    if (!outputLooksBad(direct)) return { ok: true, method: "resolved_component", component, attempts };
  }

  const main = await runFile(adbPath, [...prefix, "am", "start", "-W", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.LAUNCHER", "-p", packageName], 20000);
  attempts.push({ method: "main_intent", ...main });
  if (!outputLooksBad(main)) return { ok: true, method: "main_intent", attempts };

  const monkey = await runFile(adbPath, [...prefix, "monkey", "-p", packageName, "-c", "android.intent.category.LAUNCHER", "1"], 20000);
  attempts.push({ method: "monkey", ...monkey });
  const monkeyText = `${monkey.stdout || ""}\n${monkey.stderr || ""}`;
  if (!outputLooksBad(monkey) || /Events injected:\s*1/i.test(monkeyText)) {
    return { ok: true, method: "monkey", attempts };
  }

  return { ok: false, method: "failed", attempts };
}

function parseAdbDevices(text) {
  const devices = [];
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^List of devices/i.test(line) || line.startsWith("* daemon")) continue;
    const [serial, state, ...rest] = line.split(/\s+/);
    if (!serial || !state) continue;
    const details = rest.join(" ");
    const modelMatch = details.match(/model:([^\s]+)/i);
    devices.push({ serial, state, model: modelMatch ? modelMatch[1].replace(/_/g, " ") : "" });
  }
  return devices;
}

function createDb(dbPath) {
  if (!DatabaseSync) throw new Error("NODE_SQLITE_UNAVAILABLE");
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS rxv_shopee_mobile_publish (
      product_key TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'ready',
      remote_path TEXT NOT NULL DEFAULT '',
      sent_at TEXT,
      published_at TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rxv_facebook_mobile_publish (
      product_key TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'ready',
      shared_at TEXT,
      published_at TEXT,
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

function nowIso() {
  return new Date().toISOString();
}

function cleanCaptionBody(value) {
  return String(value || "")
    .replace(/商品名稱標示/g, "商品頁標示")
    .replace(/商品資訊(?:請)?看(?:個人檔案|個人頁面)?\s*[／/、或 ]*\s*商品連結[。.!！]?/g, "")
    .replace(/商品資訊(?:請)?看個人檔案[。.!！]?/g, "")
    .replace(/(?:請)?到個人檔案(?:查看|看)商品(?:資訊|連結)?[。.!！]?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripKnownUrls(body, row) {
  let out = String(body || "");
  for (const url of [row.affiliate_url, row.product_url]) {
    const u = String(url || "").trim();
    if (u) out = out.split(u).join("");
  }
  return out
    .replace(/\[affiliateUrl\]/gi, "")
    .replace(/\{\{\s*affiliateUrl\s*\}\}/gi, "")
    .replace(/\$\{\s*affiliateUrl\s*\}/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const RXV_CAPTION_PRECISION_V40_3_9 = true;

const CATEGORY_RULES = [
  {
    id: "wardrobe", label: "衣櫃", re: /衣櫃|衣櫥|衣物收納櫃|抽屜櫃/,
    hook: "衣服、棉被和日常用品總是沒地方放？",
    benefit: "適合用來分類整理衣物與居家用品。",
    baseTags: ["#衣櫃", "#衣物收納", "#收納櫃"], priorityFeatureTags: ["#三門衣櫃", "#台灣製造", "#二抽二格"],
    features: [
      [/三門/, "三門", "#三門衣櫃"], [/二抽二格|2抽2格/, "二抽二格", "#二抽二格"],
      [/二抽|2抽/, "二抽", "#抽屜收納"], [/二格|2格/, "二格", "#分格收納"],
      [/台灣製造|台灣製/, "台灣製造", "#台灣製造"], [/復古/, "復古設計", "#復古家具"],
      [/緩衝/, "緩衝設計", "#緩衝設計"]
    ]
  },
  {
    id: "raincoat", label: "雨衣", re: /雨衣|雨披/,
    hook: "突然下雨，穿雨衣還在手忙腳亂？",
    benefit: "通勤、騎車遇到下雨時更方便準備。",
    baseTags: ["#雨衣", "#機車雨衣"], priorityFeatureTags: ["#側開雨衣", "#秒穿雨衣", "#背包雨衣"],
    features: [
      [/側開|側穿/, "側開／側穿", "#側開雨衣"], [/秒穿|快速穿/, "快速穿脫", "#秒穿雨衣"],
      [/背包/, "背包空間", "#背包雨衣"], [/加大/, "加大設計", "#加大雨衣"], [/一件式/, "一件式", "#一件式雨衣"]
    ]
  },
  {
    id: "pillow", label: "枕頭", re: /枕頭|獨立筒枕|護頸枕|乳膠枕/,
    hook: "每天睡覺都會用到的枕頭，材質與清潔方式很重要。",
    benefit: "可依自己的睡眠習慣與需求挑選。",
    baseTags: ["#枕頭", "#睡眠好物"],
    features: [
      [/可水洗|能水洗|水洗/, "可水洗", "#可水洗枕"], [/涼感天絲|天絲/, "涼感天絲", "#涼感天絲"],
      [/石墨烯/, "石墨烯", "#石墨烯"], [/獨立筒/, "獨立筒設計", "#獨立筒枕"],
      [/一年保固/, "一年保固", "#一年保固"], [/護頸/, "護頸款式", "#護頸枕"]
    ]
  },
  {
    id: "bedding", label: "床包／寢具", re: /床包|床單|被套|兩用被|涼被|寢具/,
    hook: "想換寢具，又怕尺寸和材質選錯？",
    benefit: "可依床型尺寸與季節需求挑選合適款式。",
    baseTags: ["#床包", "#寢具", "#居家寢具"],
    features: [
      [/天絲|萊賽爾|tence/i, "天絲／萊賽爾", "#天絲床包"], [/單人/, "單人", "#單人床包"],
      [/雙人/, "雙人", "#雙人床包"], [/加大/, "加大", "#加大床包"], [/特大/, "特大", "#特大床包"],
      [/兩用被/, "兩用被", "#兩用被"], [/涼感/, "涼感", "#涼感寢具"]
    ]
  },
  {
    id: "airbed", label: "充氣床墊", re: /充氣床|充氣床墊|充氣睡墊/,
    hook: "臨時多一張床、露營或外宿時，收納空間不夠用？",
    benefit: "適合露營、臨時住宿或居家備用時參考。",
    baseTags: ["#充氣床墊", "#露營用品", "#居家備用"],
    features: [
      [/自動充氣/, "自動充氣", "#自動充氣床"], [/雙人/, "雙人尺寸", "#雙人充氣床"],
      [/戶外|露營/, "戶外露營", "#露營床墊"], [/便攜|便携/, "便攜設計", "#便攜床墊"],
      [/收納袋/, "附收納袋", "#收納方便"], [/充氣枕/, "附充氣枕", "#充氣枕"]
    ]
  },
  {
    id: "backpack", label: "背包／書包", re: /背包|書包|雙肩包/,
    hook: "每天要帶的東西越來越多，背包空間夠用嗎？",
    benefit: "可依上課、通勤或出遊需求挑選容量與款式。",
    baseTags: ["#背包", "#雙肩背包"],
    features: [
      [/大容量/, "大容量", "#大容量背包"], [/加大/, "加大設計", "#加大背包"],
      [/學生|高中|大學|國小|初中/, "學生適用款式", "#學生書包"], [/出遊/, "出遊使用", "#出遊背包"],
      [/日韓|韓系/, "日韓風格", "#韓系背包"]
    ]
  },
  {
    id: "massagepad", label: "指壓／慢跑墊", re: /指壓板|慢跑墊|按摩墊/,
    hook: "在家運動或站立訓練，想找一塊好整理的墊子？",
    benefit: "可依運動方式、尺寸與材質需求選擇。",
    baseTags: ["#慢跑墊", "#居家運動"],
    features: [
      [/液態硅膠|液態矽膠/, "液態矽膠", "#矽膠指壓板"], [/磁石/, "磁石設計", "#磁石慢跑墊"],
      [/無折痕/, "無折痕", "#無折痕"], [/實心/, "實心設計", "#實心指壓板"],
      [/腳底|足底|按摩/, "足底使用", "#足底按摩墊"]
    ]
  },
  {
    id: "chocolate", label: "巧克力／零食", re: /巧克力|千絲酥|零食|餅乾|爆米花/,
    hook: "嘴饞想換點不同口感的零食？",
    benefit: "口味、內容物與保存方式請以商品頁資訊為準。",
    baseTags: ["#零食", "#下午茶"],
    features: [
      [/迪拜風格|迪拜/, "迪拜風格", "#迪拜巧克力"], [/開心果/, "開心果", "#開心果巧克力"],
      [/千絲酥/, "千絲酥", "#千絲酥"], [/夾心/, "夾心", "#夾心巧克力"], [/拉絲/, "拉絲口感", "#拉絲巧克力"],
      [/爆米花/, "爆米花", "#爆米花"], [/焦糖/, "焦糖口味", "#焦糖爆米花"]
    ]
  },
  {
    id: "airfryer", label: "氣炸鍋", re: /氣炸鍋/,
    hook: "想在家快速準備料理，又希望少一點繁複步驟？",
    benefit: "容量與功能請依家庭人數及料理習慣選擇。",
    baseTags: ["#氣炸鍋", "#廚房家電"],
    features: [
      [/4\.2L|4\.2公升/i, "4.2L 容量", "#4L氣炸鍋"], [/大容量/, "大容量", "#大容量氣炸鍋"],
      [/螢幕|顯示/, "螢幕顯示", "#數位氣炸鍋"], [/Tefal|特福/i, "Tefal 特福", "#Tefal"]
    ]
  },
  {
    id: "camera", label: "監視器／網路攝影機", re: /監視器|網路攝影機|攝影機/,
    hook: "想從手機查看家中或店面的即時狀況？",
    benefit: "實際連線方式、儲存與相容規格請以商品頁為準。",
    baseTags: ["#監視器", "#網路攝影機", "#居家安全"],
    features: [
      [/雙鏡頭/, "雙鏡頭", "#雙鏡頭監視器"], [/5G|5GHz/i, "5G Wi-Fi", "#WiFi監視器"],
      [/彩色夜視/, "彩色夜視", "#彩色夜視"], [/自動追蹤/, "自動追蹤", "#自動追蹤"],
      [/360/, "360° 監控", "#360監視器"], [/對講/, "對講通話", "#雙向對講"]
    ]
  },
  {
    id: "jacket", label: "外套", re: /外套|連帽外套/,
    hook: "天氣轉涼，想找日常好搭又保暖的外套？",
    benefit: "版型、尺寸與實際材質請以商品頁標示為準。",
    baseTags: ["#外套", "#秋冬穿搭"],
    features: [
      [/拉鍊/, "拉鍊設計", "#拉鍊外套"], [/連帽/, "連帽款", "#連帽外套"],
      [/刷毛|內刷毛/, "刷毛內裡", "#刷毛外套"], [/保暖/, "保暖款式", "#保暖外套"], [/多色/, "多色可選", "#多色外套"]
    ]
  },
  {
    id: "rainboots", label: "雨鞋", re: /雨鞋|雨靴|防水鞋/,
    hook: "下雨天鞋子容易濕，通勤或工作想換雙防水鞋？",
    benefit: "尺寸、筒高與鞋底規格請以商品頁標示為準。",
    baseTags: ["#雨鞋", "#防水鞋"],
    features: [
      [/防滑/, "防滑", "#防滑雨鞋"], [/短筒/, "短筒", "#短筒雨鞋"], [/男|男生/, "男款", "#男雨鞋"],
      [/女|女生/, "女款", "#女雨鞋"], [/廚師鞋/, "廚師鞋款", "#廚師鞋"]
    ]
  },
  {
    id: "microphone", label: "麥克風／KTV", re: /麥克風|KTV|卡拉OK|喇叭/,
    hook: "在家唱歌或聚會，想少接幾條線就能開始？",
    benefit: "連線方式、音效與支援裝置請以商品頁為準。",
    baseTags: ["#麥克風", "#家庭KTV", "#藍牙音響"],
    features: [
      [/雙人/, "雙人", "#雙人麥克風"], [/藍牙|藍芽/, "藍牙連線", "#藍牙麥克風"],
      [/無線/, "無線使用", "#無線麥克風"], [/家庭K歌|家庭KTV/, "家庭 KTV", "#居家KTV"]
    ]
  },
  {
    id: "boxing", label: "拳擊訓練器", re: /拳擊靶|拳擊機|拳擊訓練器/,
    hook: "想在家練反應與節奏，又不想占太多空間？",
    benefit: "安裝方式、尺寸與訓練模式請以商品頁為準。",
    baseTags: ["#拳擊訓練", "#居家健身"],
    features: [
      [/智能/, "智能模式", "#智能拳擊靶"], [/音樂/, "音樂模式", "#音樂拳擊機"],
      [/反應/, "反應訓練", "#反應訓練"], [/牆靶/, "牆面安裝款", "#拳擊牆靶"]
    ]
  },
  {
    id: "slippers", label: "拖鞋", re: /拖鞋/,
    hook: "在家走動或外出穿拖鞋，想找腳感更舒服的款式？",
    benefit: "尺寸、材質與實際腳感仍請以商品頁資訊為準。",
    baseTags: ["#拖鞋", "#居家拖鞋"],
    features: [
      [/厚底/, "厚底", "#厚底拖鞋"], [/麻糬|踩屎感/, "柔軟腳感款式", "#軟底拖鞋"],
      [/EVA/i, "EVA 材質", "#EVA拖鞋"], [/防滑/, "防滑", "#防滑拖鞋"], [/防臭/, "防臭", "#防臭拖鞋"]
    ]
  }
];

function uniq(list) {
  return [...new Set((list || []).map((x) => String(x || "").trim()).filter(Boolean))];
}

function detectProductCategory(title) {
  const text = String(title || "");
  return CATEGORY_RULES.find((rule) => rule.re.test(text)) || null;
}

function detectBrand(title) {
  const text = String(title || "");
  const known = ["HOPMA", "Check2Check", "SUD", "Tefal", "recolte", "YOOSEE", "WTHB"];
  return known.find((brand) => new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text)) || "";
}

function collectPrecisionFeatures(title, rule) {
  const text = String(title || "");
  if (!rule) return [];
  const out = [];
  for (const [re, label, tag] of rule.features || []) {
    if (!re.test(text)) continue;
    if (out.some((x) => String(x.label || "").includes(label))) continue;
    out.push({ label, tag });
    if (out.length >= 5) break;
  }
  return out;
}

function sanitizeHashtag(tag) {
  const t = String(tag || "").trim();
  if (!t) return "";
  return t.startsWith("#") ? t.replace(/\s+/g, "") : `#${t.replace(/\s+/g, "")}`;
}

function precisionContent(row) {
  const title = String(row.product_title || "").trim();
  const rule = detectProductCategory(title);
  const features = collectPrecisionFeatures(title, rule);
  const brand = detectBrand(title);
  if (!rule) {
    let body = String(row.tiktok_caption || row.short_description || title).trim();
    body = cleanCaptionBody(stripKnownUrls(body, row));
    const oldTags = String(row.tiktok_hashtags || row.hashtags || "")
      .split(/\s+/).map(sanitizeHashtag).filter((x) => x && x !== "#商品分享");
    return {
      category: "其他商品",
      features: [],
      body,
      tags: uniq(oldTags).slice(0, 5),
      source: "fallback-existing-copy",
    };
  }

  const featureLabels = features.map((x) => x.label);
  const brandPrefix = brand ? `${brand} ` : "";
  const featureSentence = featureLabels.length
    ? `這款 ${brandPrefix}${rule.label}，商品頁標示${featureLabels.join("、")}。`
    : `這款 ${brandPrefix}${rule.label}，可先查看商品頁標示的尺寸、材質與設計。`;
  const body = [rule.hook, featureSentence, rule.benefit].filter(Boolean).join("\n");
  const featureTags = features.map((x) => x.tag).filter(Boolean).map(sanitizeHashtag);
  const priority = (rule.priorityFeatureTags || []).map(sanitizeHashtag);
  const priorityMatched = priority.filter((tag) => featureTags.includes(tag)).slice(0, 2);
  const remainingFeatureTags = featureTags.filter((tag) => !priorityMatched.includes(tag));
  const baseTags = (rule.baseTags || []).map(sanitizeHashtag).filter(Boolean);
  const tags = uniq([baseTags[0], ...priorityMatched, ...baseTags.slice(1), ...remainingFeatureTags])
    .filter(Boolean).slice(0, 5);
  return {
    category: rule.label,
    features: featureLabels,
    body,
    tags,
    source: "title-category-features-v40.3.9",
  };
}

function buildShopeeText(row) {
  const precise = precisionContent(row);
  let body = precise.body;
  body = body.replace(/詳細尺寸、顏色與規格請以商品頁為準，請由下方商品連結查看。[。]?/g, "").trim();
  if (!/影片下方商品/.test(body)) {
    const cta = /請以商品頁(?:資訊|標示)?為準|請以商品頁為準/.test(body)
      ? "點影片下方商品查看。"
      : "詳細尺寸、顏色與規格請以商品頁為準，點影片下方商品查看。";
    body = [body, cta].filter(Boolean).join("\n\n");
  }
  return [body, precise.tags.join(" ")].filter(Boolean).join("\n\n").trim();
}

function extractAffiliateUrlCandidate(value) {
  const text = String(value || "");
  const matches = text.match(/https?:\/\/[^\s<>'"）)]+/gi) || [];
  for (const raw of matches) {
    const candidate = raw.replace(/[，。；;！？!?,.]+$/g, "");
    try {
      const u = new URL(candidate);
      const host = String(u.hostname || "").toLowerCase();
      if (
        host === "s.shopee.tw" ||
        host === "shope.ee" || host.endsWith(".shope.ee") ||
        host === "shp.ee" || host.endsWith(".shp.ee")
      ) return candidate;
    } catch {}
  }
  return "";
}

function resolveAffiliateUrl(row) {
  const direct = String(row?.affiliate_url || "").trim();
  if (direct) return direct;
  for (const source of [row?.facebook_post, row?.full_post, row?.publish_payload_json]) {
    const found = extractAffiliateUrlCandidate(source);
    if (found) return found;
  }
  return "";
}

function validateAffiliateUrl(value) {
  const text = String(value || "").trim();
  if (!text) return { ok: false, reason: "EMPTY" };
  let u;
  try { u = new URL(text); } catch { return { ok: false, reason: "INVALID_URL" }; }
  if (!/^https?:$/.test(u.protocol)) return { ok: false, reason: "INVALID_PROTOCOL" };
  const host = String(u.hostname || "").toLowerCase();
  const looksShopee =
    host === "s.shopee.tw" ||
    host === "shopee.tw" || host.endsWith(".shopee.tw") ||
    host === "shope.ee" || host.endsWith(".shope.ee") ||
    host === "shp.ee" || host.endsWith(".shp.ee");
  if (!looksShopee) return { ok: false, reason: "NOT_SHOPEE_URL" };
  return { ok: true, url: text };
}

function buildFacebookText(row) {
  const precise = precisionContent(row);
  const affiliateUrl = resolveAffiliateUrl(row);
  const details = /請以商品頁(?:資訊|標示)?為準|請以商品頁為準/.test(precise.body)
    ? ""
    : "詳細尺寸、顏色與規格請以商品頁為準。";
  const linkLine = affiliateUrl ? `🛒 商品連結：\n${affiliateUrl}` : "";
  const disclosure = affiliateUrl ? "此連結為分潤連結，透過連結購買我可能獲得分潤，不影響你的購買價格。" : "";
  return [precise.body, details, linkLine, disclosure, precise.tags.join(" ")]
    .filter(Boolean).join("\n\n").trim();
}

function getShopeeItems(db, limit = 200) {
  const rows = db.prepare(`
    SELECT
      a.product_key,
      a.product_title,
      a.product_url,
      a.affiliate_url,
      a.facebook_post,
      a.full_post,
      a.publish_payload_json,
      a.video_path,
      a.video_filename,
      a.video_status,
      a.short_description,
      a.tiktok_caption,
      a.tiktok_hashtags,
      a.hashtags,
      a.updated_at,
      COALESCE(m.status, 'ready') AS mobile_status,
      COALESCE(m.remote_path, '') AS remote_path,
      COALESCE(m.sent_at, '') AS sent_at,
      COALESCE(m.published_at, '') AS mobile_published_at,
      COALESCE(f.status, 'ready') AS facebook_status,
      COALESCE(f.shared_at, '') AS facebook_shared_at,
      COALESCE(f.published_at, '') AS facebook_published_at
    FROM affiliate_products a
    LEFT JOIN rxv_shopee_mobile_publish m
      ON m.product_key = a.product_key
    LEFT JOIN rxv_facebook_mobile_publish f
      ON f.product_key = a.product_key
    WHERE TRIM(COALESCE(a.video_path, '')) <> ''
    ORDER BY a.updated_at DESC
    LIMIT ?
  `).all(Math.max(1, Math.min(500, Number(limit) || 200)));

  return rows.map((row) => {
    const videoPath = String(row.video_path || "");
    let videoExists = false;
    try { videoExists = !!videoPath && fs.existsSync(videoPath); } catch {}
    return {
      productKey: String(row.product_key || ""),
      productTitle: String(row.product_title || ""),
      productUrl: String(row.product_url || ""),
      affiliateUrl: resolveAffiliateUrl(row),
      affiliateUrlStored: String(row.affiliate_url || ""),
      affiliateUrlRecovered: !String(row.affiliate_url || "").trim() && !!resolveAffiliateUrl(row),
      videoPath,
      videoFilename: String(row.video_filename || path.basename(videoPath || "")),
      videoExists,
      videoStatus: String(row.video_status || ""),
      shopeeText: buildShopeeText(row),
      facebookText: buildFacebookText(row),
      facebookReady: !!resolveAffiliateUrl(row),
      precisionCategory: precisionContent(row).category,
      precisionFeatures: precisionContent(row).features,
      precisionTags: precisionContent(row).tags,
      precisionSource: precisionContent(row).source,
      mobileStatus: String(row.mobile_status || "ready"),
      facebookStatus: String(row.facebook_status || "ready"),
      facebookSharedAt: String(row.facebook_shared_at || ""),
      facebookPublishedAt: String(row.facebook_published_at || ""),
      remotePath: String(row.remote_path || ""),
      sentAt: String(row.sent_at || ""),
      publishedAt: String(row.mobile_published_at || ""),
      updatedAt: String(row.updated_at || ""),
    };
  });
}

function localDayBounds(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function nextSlotAtOrAfter(date, minuteStep) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const minutes = d.getMinutes();
  const step = Math.max(1, Number(minuteStep) || 60);
  const rounded = Math.ceil(minutes / step) * step;
  if (rounded >= 60) {
    d.setMinutes(0);
    d.setHours(d.getHours() + 1);
  } else {
    d.setMinutes(rounded);
  }
  return d;
}

function autoScheduleTikTok(db, options = {}) {
  const setting = db.prepare(`
    SELECT daily_limit, min_interval_minutes, last_published_at
    FROM publisher_settings WHERE platform='tiktok'
  `).get() || {};

  const dailyLimit = Math.max(1, Math.min(14, Number(setting.daily_limit || 14)));
  const intervalMinutes = Math.max(5, Number(setting.min_interval_minutes || 60));
  const dayStartHour = Math.max(0, Math.min(23, Number(options.dayStartHour ?? 8)));
  const dayEndHour = Math.max(dayStartHour + 1, Math.min(24, Number(options.dayEndHour ?? 22)));
  const maxJobs = Math.max(1, Math.min(200, Number(options.maxJobs || 100)));

  let start = options.startAt ? new Date(options.startAt) : new Date(Date.now() + 5 * 60 * 1000);
  if (Number.isNaN(start.getTime())) start = new Date(Date.now() + 5 * 60 * 1000);

  const lastPublishedAt = String(setting.last_published_at || "").trim();
  if (lastPublishedAt) {
    const nextAllowed = new Date(new Date(lastPublishedAt).getTime() + intervalMinutes * 60 * 1000);
    if (!Number.isNaN(nextAllowed.getTime()) && nextAllowed > start) start = nextAllowed;
  }

  start = nextSlotAtOrAfter(start, intervalMinutes >= 60 ? 60 : intervalMinutes);

  const rows = db.prepare(`
    SELECT j.id, j.product_key, j.status, j.scheduled_at,
           a.video_path, a.publish_ready
    FROM publisher_jobs j
    JOIN affiliate_products a ON a.product_key=j.product_key
    WHERE j.platform='tiktok'
      AND j.status IN ('queued','failed','cancelled')
      AND a.publish_ready=1
    ORDER BY j.updated_at ASC, j.id ASC
    LIMIT ?
  `).all(maxJobs);

  const eligible = rows.filter((row) => {
    try { return !!row.video_path && fs.existsSync(String(row.video_path)); } catch { return false; }
  });

  const scheduled = [];
  let cursor = new Date(start);

  for (const row of eligible) {
    let guard = 0;
    while (guard++ < 4000) {
      const dayStart = new Date(cursor);
      dayStart.setHours(dayStartHour, 0, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(dayEndHour, 0, 0, 0);

      if (cursor < dayStart) cursor = new Date(dayStart);
      if (cursor >= dayEnd) {
        cursor = new Date(dayStart);
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }

      const { startIso, endIso } = localDayBounds(cursor);
      const already = Number(db.prepare(`
        SELECT COUNT(*) AS count
        FROM publisher_jobs
        WHERE platform='tiktok'
          AND (
            (status='scheduled' AND scheduled_at>=? AND scheduled_at<?)
            OR (status IN ('published','publishing') AND updated_at>=? AND updated_at<?)
          )
      `).get(startIso, endIso, startIso, endIso)?.count || 0);

      if (already >= dailyLimit) {
        cursor = new Date(dayStart);
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }

      const iso = cursor.toISOString();
      const collision = Number(db.prepare(`
        SELECT COUNT(*) AS count FROM publisher_jobs
        WHERE platform='tiktok' AND status='scheduled' AND scheduled_at=?
      `).get(iso)?.count || 0);
      if (collision > 0) {
        cursor = new Date(cursor.getTime() + intervalMinutes * 60 * 1000);
        continue;
      }

      const now = nowIso();
      db.prepare(`
        UPDATE publisher_jobs
        SET status='scheduled', scheduled_at=?, next_attempt_at=?, last_error='', updated_at=?
        WHERE id=?
      `).run(iso, iso, now, Number(row.id));
      db.prepare(`
        UPDATE affiliate_products
        SET tiktok_status='queued', tiktok_error='', updated_at=?
        WHERE product_key=?
      `).run(now, String(row.product_key));
      scheduled.push({ id: Number(row.id), productKey: String(row.product_key), scheduledAt: iso });
      cursor = new Date(cursor.getTime() + intervalMinutes * 60 * 1000);
      break;
    }
  }

  return {
    dailyLimit,
    intervalMinutes,
    dayStartHour,
    dayEndHour,
    eligible: eligible.length,
    scheduledCount: scheduled.length,
    firstScheduledAt: scheduled[0]?.scheduledAt || "",
    lastScheduledAt: scheduled[scheduled.length - 1]?.scheduledAt || "",
    scheduled,
    note: "TikTok 到點後會轉為待確認；按『立即發布』才真正送官方 API。",
  };
}

function registerRxvV403Helper(app, options = {}) {
  const root = options.root || process.cwd();
  const dbPath = options.dbPath || path.join(root, "data", "affiliate-publish.db");

  function withDb(fn) {
    const db = createDb(dbPath);
    try { return fn(db); } finally { try { db.close(); } catch {} }
  }

  app.get("/rxv-v40-3/status", async (_req, res) => {
    try {
      const adbPath = await resolveAdb();
      const scrcpyPath = await resolveScrcpy();
      let devices = [];
      if (adbPath) {
        const r = await runFile(adbPath, ["devices", "-l"], 10000);
        devices = parseAdbDevices(r.stdout);
      }
      const itemCount = withDb((db) => getShopeeItems(db, 500).filter((x) => x.videoExists).length);
      return res.json({ ok: true, build: "V40.3.9", adbPath, scrcpyPath, devices, itemCount, dbPath });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "V40_3_STATUS_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/publisher/tiktok-auto-schedule", (req, res) => {
    try {
      const result = withDb((db) => autoScheduleTikTok(db, req.body || {}));
      return res.json({ ok: true, ...result });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "TIKTOK_AUTO_SCHEDULE_FAILED", message: error?.message || String(error) });
    }
  });

  app.get("/shopee-mobile/items", (req, res) => {
    try {
      const items = withDb((db) => getShopeeItems(db, Number(req.query?.limit || 200)));
      return res.json({ ok: true, items });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "SHOPEE_MOBILE_ITEMS_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/affiliate-link", (req, res) => {
    try {
      const productKey = String(req.body?.productKey || "").trim();
      const affiliateUrlRaw = String(req.body?.affiliateUrl || "").trim();
      if (!productKey) return res.status(400).json({ ok: false, error: "PRODUCT_KEY_REQUIRED", message: "缺少商品識別碼。" });
      const checked = validateAffiliateUrl(affiliateUrlRaw);
      if (!checked.ok) {
        const messages = {
          EMPTY: "請貼上蝦皮分潤連結。",
          INVALID_URL: "分潤連結格式不正確。",
          INVALID_PROTOCOL: "分潤連結必須是 http/https 網址。",
          NOT_SHOPEE_URL: "這看起來不是蝦皮網址，請貼上蝦皮分潤連結。",
        };
        return res.status(400).json({ ok: false, error: "INVALID_AFFILIATE_URL", reason: checked.reason, message: messages[checked.reason] || "分潤連結無效。" });
      }
      const now = nowIso();
      const changed = withDb((db) => db.prepare(`
        UPDATE affiliate_products
        SET affiliate_url=?, updated_at=?
        WHERE product_key=?
      `).run(checked.url, now, productKey));
      if (!Number(changed?.changes || 0)) return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND", message: "找不到這個商品。" });
      const item = withDb((db) => getShopeeItems(db, 500).find((x) => x.productKey === productKey));
      return res.json({ ok: true, productKey, affiliateUrl: checked.url, facebookReady: !!item?.facebookReady, facebookText: item?.facebookText || "" });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "AFFILIATE_LINK_SAVE_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/mark", (req, res) => {
    try {
      const productKey = String(req.body?.productKey || "").trim();
      const status = ["ready", "sent_to_phone", "published"].includes(String(req.body?.status || ""))
        ? String(req.body.status)
        : "ready";
      if (!productKey) return res.status(400).json({ ok: false, error: "PRODUCT_KEY_REQUIRED" });
      const now = nowIso();
      withDb((db) => {
        const current = db.prepare("SELECT * FROM rxv_shopee_mobile_publish WHERE product_key=?").get(productKey) || {};
        db.prepare(`
          INSERT OR REPLACE INTO rxv_shopee_mobile_publish
          (product_key,status,remote_path,sent_at,published_at,updated_at)
          VALUES (?,?,?,?,?,?)
        `).run(
          productKey,
          status,
          String(current.remote_path || ""),
          status === "sent_to_phone" ? now : String(current.sent_at || ""),
          status === "published" ? now : String(current.published_at || ""),
          now,
        );
      });
      return res.json({ ok: true, productKey, status });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "SHOPEE_MOBILE_MARK_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/push-files", async (req, res) => {
    try {
      const adbPath = await resolveAdb();
      if (!adbPath) {
        return res.status(409).json({
          ok: false,
          error: "ADB_NOT_FOUND",
          message: "找不到 adb.exe；請先連接 Android 手機並確認 ADB。",
        });
      }

      const deviceResult = await runFile(adbPath, ["devices", "-l"], 10000);
      const online = parseAdbDevices(deviceResult.stdout).filter((d) => d.state === "device");
      const requestedSerial = String(req.body?.serial || "").trim();
      const device = requestedSerial ? online.find((d) => d.serial === requestedSerial) : online[0];
      if (!device) {
        return res.status(409).json({
          ok: false,
          error: "ANDROID_DEVICE_NOT_CONNECTED",
          message: "沒有找到已授權的 Android 手機。請用 USB 連線並開啟 USB 偵錯。",
        });
      }
      if (!requestedSerial && online.length > 1) {
        return res.status(409).json({
          ok: false,
          error: "MULTIPLE_ANDROID_DEVICES",
          devices: online,
          message: "偵測到多支手機，請先只連一支。",
        });
      }

      const requested = Array.isArray(req.body?.videos) ? req.body.videos.slice(0, 100) : [];
      if (!requested.length) {
        return res.status(400).json({
          ok: false,
          error: "NO_VIDEOS",
          message: "沒有收到要傳送的影片清單。",
        });
      }

      const prefix = ["-s", device.serial];
      await runFile(adbPath, [...prefix, "shell", "mkdir", "-p", "/sdcard/Movies/RxV"], 10000);

      const results = [];
      for (let i = 0; i < requested.length; i += 1) {
        const spec = requested[i] || {};
        const productKey = String(spec.productKey || "").trim();
        const productTitle = String(spec.productTitle || "").trim();
        const productUrl = String(spec.productUrl || "").trim();
        const requestedVideoName = String(spec.videoName || "").trim();

        const localPath = rxvV4056ResolveLocalVideo(requestedVideoName, productTitle);
        if (!localPath) {
          results.push({
            ok: false,
            status: "missing_local",
            productKey,
            productTitle,
            productUrl,
            requestedVideoName,
            localPath: "",
            remotePath: "",
            error: "D:\\out_mp4 找不到對應 MP4",
          });
          continue;
        }

        const remoteName = rxvV4056RemoteName(productKey, localPath);
        const remotePath = `/sdcard/Movies/RxV/${remoteName}`;

        // Phone file existence is the source of truth. This avoids relying on incomplete SQLite rows.
        const existsOnPhone = await runFile(adbPath, [...prefix, "shell", "ls", "-l", remotePath], 10000);
        if (existsOnPhone.ok) {
          results.push({
            ok: true,
            status: "already_on_phone",
            productKey,
            productTitle,
            productUrl,
            requestedVideoName,
            localPath,
            remotePath,
            error: "",
          });
          continue;
        }

        const pushed = await runFile(adbPath, [...prefix, "push", localPath, remotePath], 180000);
        const verify = pushed.ok
          ? await runFile(adbPath, [...prefix, "shell", "ls", "-l", remotePath], 10000)
          : { ok: false, stderr: "", error: "" };

        const ok = Boolean(pushed.ok && verify.ok);
        const errorText = ok
          ? ""
          : String(pushed.stderr || pushed.error || verify.stderr || verify.error || "ADB push verification failed");

        if (ok) {
          if (productKey) {
            try {
              const now = nowIso();
              withDb((db) => db.prepare(`
                INSERT OR REPLACE INTO rxv_shopee_mobile_publish
                (product_key,status,remote_path,sent_at,published_at,updated_at)
                VALUES (?,?,?,?,COALESCE((SELECT published_at FROM rxv_shopee_mobile_publish WHERE product_key=?),''),?)
              `).run(productKey, "sent_to_phone", remotePath, now, productKey, now));
            } catch (dbError) {
              console.warn("[V40.5.6] mobile DB mark skipped", dbError);
            }
          }
          await runFile(
            adbPath,
            [...prefix, "shell", "am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE", "-d", `file://${remotePath}`],
            10000,
          );
        }

        console.log("[V40.5.6] direct phone push", {
          productKey,
          productTitle,
          requestedVideoName,
          localPath,
          remotePath,
          ok,
          error: errorText,
        });

        results.push({
          ok,
          status: ok ? "pushed" : "failed",
          productKey,
          productTitle,
          productUrl,
          requestedVideoName,
          localPath,
          remotePath,
          error: errorText,
        });
      }

      return res.json({
        ok: true,
        device,
        requested: requested.length,
        foundLocal: results.filter((x) => x.status !== "missing_local").length,
        pushed: results.filter((x) => x.status === "pushed").length,
        skippedAlreadyOnPhone: results.filter((x) => x.status === "already_on_phone").length,
        missingLocal: results.filter((x) => x.status === "missing_local").length,
        failed: results.filter((x) => x.status === "failed").length,
        results,
        remoteDir: "/sdcard/Movies/RxV",
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: "SHOPEE_MOBILE_PUSH_FILES_FAILED",
        message: error?.message || String(error),
      });
    }
  });

  app.post("/shopee-mobile/push-batch", async (req, res) => {
    try {
      const adbPath = await resolveAdb();
      if (!adbPath) return res.status(409).json({ ok: false, error: "ADB_NOT_FOUND", message: "找不到 adb.exe；請先安裝 Android platform-tools 或 scrcpy。" });
      const deviceResult = await runFile(adbPath, ["devices", "-l"], 10000);
      const online = parseAdbDevices(deviceResult.stdout).filter((d) => d.state === "device");
      const requestedSerial = String(req.body?.serial || "").trim();
      const device = requestedSerial ? online.find((d) => d.serial === requestedSerial) : online[0];
      if (!device) return res.status(409).json({ ok: false, error: "ANDROID_DEVICE_NOT_CONNECTED", message: "沒有找到已授權的 Android 手機。請用 USB 連線並開啟 USB 偵錯。" });
      if (!requestedSerial && online.length > 1) return res.status(409).json({ ok: false, error: "MULTIPLE_ANDROID_DEVICES", devices: online, message: "偵測到多支手機，請先只連一支。" });

      const keys = Array.isArray(req.body?.productKeys) ? req.body.productKeys.map((x) => String(x)) : [];
      const limit = Math.max(1, Math.min(50, Number(req.body?.limit || 30)));
      const onlyUnsent = req.body?.onlyUnsent === true;
      const allCandidates = withDb((db) => getShopeeItems(db, 500))
        .filter((x) => x.videoExists && (!keys.length || keys.includes(x.productKey)));
      const skippedAlreadySent = onlyUnsent
        ? allCandidates.filter((x) => x.mobileStatus === "sent_to_phone" || x.mobileStatus === "published").length
        : 0;
      const items = allCandidates
        .filter((x) => x.mobileStatus !== "published" && (!onlyUnsent || x.mobileStatus !== "sent_to_phone"))
        .slice(0, limit);
      if (!items.length) return res.json({ ok: true, pushed: 0, failed: 0, skippedAlreadySent, results: [], message: "沒有尚未傳送的影片。" });

      const prefix = ["-s", device.serial];
      await runFile(adbPath, [...prefix, "shell", "mkdir", "-p", "/sdcard/Movies/RxV"], 10000);
      const results = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const ext = path.extname(item.videoPath) || ".mp4";
        const remoteName = `${String(i + 1).padStart(3, "0")}_${sanitizeFilename(item.productTitle)}${ext}`;
        const remotePath = `/sdcard/Movies/RxV/${remoteName}`;
        const r = await runFile(adbPath, [...prefix, "push", item.videoPath, remotePath], 180000);
        const ok = r.ok;
        results.push({ productKey: item.productKey, productTitle: item.productTitle, ok, remotePath, error: ok ? "" : (r.stderr || r.error) });
        if (ok) {
          const now = nowIso();
          withDb((db) => db.prepare(`
            INSERT OR REPLACE INTO rxv_shopee_mobile_publish
            (product_key,status,remote_path,sent_at,published_at,updated_at)
            VALUES (?,?,?,?,COALESCE((SELECT published_at FROM rxv_shopee_mobile_publish WHERE product_key=?),''),?)
          `).run(item.productKey, "sent_to_phone", remotePath, now, item.productKey, now));
          await runFile(adbPath, [...prefix, "shell", "am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE", "-d", `file://${remotePath}`], 10000);
        }
      }
      return res.json({
        ok: true,
        device,
        pushed: results.filter((x) => x.ok).length,
        failed: results.filter((x) => !x.ok).length,
        skippedAlreadySent,
        results,
        remoteDir: "/sdcard/Movies/RxV",
      });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "SHOPEE_MOBILE_PUSH_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/facebook-mark", (req, res) => {
    try {
      const productKey = String(req.body?.productKey || "").trim();
      const status = ["ready", "shared", "published"].includes(String(req.body?.status || ""))
        ? String(req.body.status)
        : "ready";
      if (!productKey) return res.status(400).json({ ok: false, error: "PRODUCT_KEY_REQUIRED" });
      const now = nowIso();
      withDb((db) => {
        const current = db.prepare("SELECT * FROM rxv_facebook_mobile_publish WHERE product_key=?").get(productKey) || {};
        db.prepare(`
          INSERT OR REPLACE INTO rxv_facebook_mobile_publish
          (product_key,status,shared_at,published_at,updated_at)
          VALUES (?,?,?,?,?)
        `).run(
          productKey,
          status,
          status === "shared" ? now : String(current.shared_at || ""),
          status === "published" ? now : String(current.published_at || ""),
          now,
        );
      });
      return res.json({ ok: true, productKey, status });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "FACEBOOK_MOBILE_MARK_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/open-facebook", async (req, res) => {
    try {
      const adbPath = await resolveAdb();
      if (!adbPath) return res.status(409).json({ ok: false, error: "ADB_NOT_FOUND", message: "找不到 ADB。" });
      let serial = String(req.body?.serial || "").trim();
      if (!serial) {
        const r = await runFile(adbPath, ["devices", "-l"], 10000);
        serial = parseAdbDevices(r.stdout).find((d) => d.state === "device")?.serial || "";
      }
      if (!serial) return res.status(409).json({ ok: false, error: "ANDROID_DEVICE_NOT_CONNECTED", message: "沒有找到已授權的 Android 手機。" });

      const packageName = await findFacebookPackage(adbPath, serial);
      if (!packageName) return res.status(409).json({ ok: false, error: "FACEBOOK_APP_NOT_FOUND", message: "手機找不到 Facebook App（com.facebook.katana / com.facebook.lite）。" });

      const opened = await openAndroidPackage(adbPath, serial, packageName);
      if (!opened.ok) {
        const last = opened.attempts?.[opened.attempts.length - 1] || {};
        const detail = String(last.stderr || last.stdout || last.error || "").trim().slice(0, 500);
        return res.status(409).json({
          ok: false,
          error: "FACEBOOK_APP_OPEN_FAILED",
          message: `Facebook App 已找到 (${packageName})，但 Android 無法啟動。${detail ? "\n" + detail : " 請先在手機上手動開啟一次 Facebook，再重試。"}`,
          serial,
          packageName,
          attempts: opened.attempts?.map((x) => x.method),
        });
      }

      return res.json({ ok: true, serial, packageName, method: opened.method, message: "Facebook App 已開啟。" });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "FACEBOOK_APP_OPEN_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/facebook-share", async (req, res) => {
    try {
      const productKey = String(req.body?.productKey || "").trim();
      if (!productKey) return res.status(400).json({ ok: false, error: "PRODUCT_KEY_REQUIRED" });
      const item = withDb((db) => getShopeeItems(db, 500).find((x) => x.productKey === productKey));
      if (!item) return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
      if (!item.facebookReady) return res.status(409).json({ ok: false, error: "AFFILIATE_URL_MISSING", message: "這個商品沒有蝦皮分潤連結，先不要發布 Facebook，避免漏掉分潤。" });
      if (!item.videoExists) return res.status(409).json({ ok: false, error: "VIDEO_NOT_FOUND", message: "找不到這支 MP4。" });

      const adbPath = await resolveAdb();
      if (!adbPath) return res.status(409).json({ ok: false, error: "ADB_NOT_FOUND" });
      const dr = await runFile(adbPath, ["devices", "-l"], 10000);
      const online = parseAdbDevices(dr.stdout).filter((d) => d.state === "device");
      const requestedSerial = String(req.body?.serial || "").trim();
      const device = requestedSerial ? online.find((d) => d.serial === requestedSerial) : online[0];
      if (!device) return res.status(409).json({ ok: false, error: "ANDROID_DEVICE_NOT_CONNECTED", message: "沒有找到已授權的 Android 手機。" });
      if (!requestedSerial && online.length > 1) return res.status(409).json({ ok: false, error: "MULTIPLE_ANDROID_DEVICES", message: "偵測到多支手機，請先只連一支。" });

      let remotePath = String(item.remotePath || "").trim();
      const prefix = ["-s", device.serial];
      if (!remotePath) {
        await runFile(adbPath, [...prefix, "shell", "mkdir", "-p", "/sdcard/Movies/RxV"], 10000);
        const ext = path.extname(item.videoPath) || ".mp4";
        const remoteName = `FB_${sanitizeFilename(item.productTitle)}${ext}`;
        remotePath = `/sdcard/Movies/RxV/${remoteName}`;
        const push = await runFile(adbPath, [...prefix, "push", item.videoPath, remotePath], 180000);
        if (!push.ok) return res.status(500).json({ ok: false, error: "VIDEO_PUSH_FAILED", message: push.stderr || push.error || "影片傳到手機失敗。" });
        const now = nowIso();
        withDb((db) => db.prepare(`
          INSERT OR REPLACE INTO rxv_shopee_mobile_publish
          (product_key,status,remote_path,sent_at,published_at,updated_at)
          VALUES (?,?,?,?,COALESCE((SELECT published_at FROM rxv_shopee_mobile_publish WHERE product_key=?),''),?)
        `).run(item.productKey, "sent_to_phone", remotePath, now, item.productKey, now));
      }

      await runFile(adbPath, [...prefix, "shell", "am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE", "-d", `file://${remotePath}`], 10000);
      const packageName = await findFacebookPackage(adbPath, device.serial);
      if (!packageName) return res.status(409).json({ ok: false, error: "FACEBOOK_APP_NOT_FOUND", message: "手機找不到 Facebook App（com.facebook.katana / com.facebook.lite）。" });

      const remoteName = path.posix.basename(remotePath);
      const documentId = `primary:Movies/RxV/${remoteName}`;
      const uri = `content://com.android.externalstorage.documents/document/${encodeURIComponent(documentId)}`;
      let share = await runFile(adbPath, [...prefix, "shell", "am", "start", "-a", "android.intent.action.SEND", "-t", "video/mp4", "-f", "1", "--eu", "android.intent.extra.STREAM", uri, "-p", packageName], 20000);
      let mode = "facebook_share_intent";
      if (outputLooksBad(share)) {
        const open = await openAndroidPackage(adbPath, device.serial, packageName);
        mode = open.ok ? "facebook_app_fallback" : "facebook_open_failed";
        if (!open.ok) {
          const last = open.attempts?.[open.attempts.length - 1] || {};
          const detail = String(last.stderr || last.stdout || last.error || "").trim().slice(0, 500);
          return res.status(409).json({
            ok: false,
            error: "FACEBOOK_APP_OPEN_FAILED",
            message: `影片已在手機 Movies/RxV，但 Facebook 無法自動開啟。${detail ? "\n" + detail : " 請先手動開 Facebook，再從相簿選影片。"}`,
          });
        }
      }

      const now = nowIso();
      withDb((db) => db.prepare(`
        INSERT OR REPLACE INTO rxv_facebook_mobile_publish
        (product_key,status,shared_at,published_at,updated_at)
        VALUES (?,?,?,COALESCE((SELECT published_at FROM rxv_facebook_mobile_publish WHERE product_key=?),''),?)
      `).run(item.productKey, "shared", now, item.productKey, now));

      return res.json({
        ok: true,
        serial: device.serial,
        packageName,
        mode,
        remotePath,
        facebookText: item.facebookText,
        message: mode === "facebook_share_intent"
          ? "已把影片交給 Facebook；FB 文案已由網頁複製，請貼上後由你確認發布。"
          : "已開啟 Facebook。若影片沒有自動帶入，請從手機相簿選 Movies/RxV 內的對應影片；FB 文案已複製。",
      });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "FACEBOOK_SHARE_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/open-scrcpy", async (req, res) => {
    try {
      const scrcpyPath = await resolveScrcpy();
      if (!scrcpyPath) return res.status(409).json({ ok: false, error: "SCRCPY_NOT_FOUND", message: "找不到 scrcpy.exe。可先安裝 scrcpy；安裝後 RxV 就能把手機畫面顯示在電腦。" });
      const adbPath = await resolveAdb();
      let serial = String(req.body?.serial || "").trim();
      if (!serial && adbPath) {
        const r = await runFile(adbPath, ["devices", "-l"], 10000);
        serial = parseAdbDevices(r.stdout).find((d) => d.state === "device")?.serial || "";
      }
      const args = ["--window-title=RxV 蝦皮短影音手機畫面"];
      if (serial) args.push("--serial", serial);
      const child = spawn(scrcpyPath, args, { detached: true, stdio: "ignore", windowsHide: false });
      child.unref();
      return res.json({ ok: true, scrcpyPath, serial });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "SCRCPY_OPEN_FAILED", message: error?.message || String(error) });
    }
  });

  app.post("/shopee-mobile/open-shopee", async (req, res) => {
    try {
      const adbPath = await resolveAdb();
      if (!adbPath) return res.status(409).json({ ok: false, error: "ADB_NOT_FOUND" });
      let serial = String(req.body?.serial || "").trim();
      if (!serial) {
        const r = await runFile(adbPath, ["devices", "-l"], 10000);
        serial = parseAdbDevices(r.stdout).find((d) => d.state === "device")?.serial || "";
      }
      if (!serial) return res.status(409).json({ ok: false, error: "ANDROID_DEVICE_NOT_CONNECTED" });
      const r = await runFile(adbPath, ["-s", serial, "shell", "monkey", "-p", "com.shopee.tw", "-c", "android.intent.category.LAUNCHER", "1"], 15000);
      return res.json({ ok: r.ok, serial, output: (r.stdout || r.stderr).slice(0, 1000) });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "SHOPEE_APP_OPEN_FAILED", message: error?.message || String(error) });
    }
  });

  app.get("/shopee/mobile-helper", (_req, res) => {
    try {
      const htmlPath = path.join(__dirname, "rxv-v40-3-shopee-mobile-helper.html");
      const html = fs.readFileSync(htmlPath, "utf8");
      return res.type("html").send(html);
    } catch (error) {
      return res.status(500).type("text").send(`Shopee helper UI missing: ${error?.message || String(error)}`);
    }
  });
}

module.exports = { registerRxvV403Helper };
