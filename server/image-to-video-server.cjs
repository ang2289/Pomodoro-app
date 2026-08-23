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
const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");
const { spawn, execFile } = require("node:child_process");
const axios = require("axios");
const express = require("express");

const PORT = Number(process.env.PORT || 3006);
const BUILD = "RXV_VIDEO_SERVER_V38_PAIN_POINT_NATURAL_VOICE";
const ROOT = process.cwd();

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
const ENABLE_PUBLIC_UPLOAD =
  String(process.env.RXV_ENABLE_PUBLIC_UPLOAD || "0") === "1";

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
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "out_mp4");
const FONT_FILE = process.env.RXV_FONT_FILE || "C:/Windows/Fonts/msjh.ttc";
const FFMPEG_BIN = process.env.FFMPEG_PATH || require("ffmpeg-static");
const EDGE_TTS_VOICE =
  process.env.RXV_EDGE_TTS_VOICE || "zh-TW-HsiaoChenNeural";
const EDGE_TTS_RATE = process.env.RXV_EDGE_TTS_RATE || "-5%";

const app = express();
app.use(express.json({ limit: "20mb" }));

const ALLOWED_ORIGINS = ["http://localhost:3005", "http://127.0.0.1:3005"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Credentials", "true");
  }
  next();
});

app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Credentials", "true");
  }
  res.sendStatus(200);
});

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

async function synthesizeVoice(voiceText, workDir) {
  const trimmed = String(voiceText || "").trim();
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

function buildFilterComplex(
  sceneTitles,
  sceneSubtitles,
  clipDur,
  totalDuration,
) {
  const fontFile = ffmpegFilterPath(getReadableFontFile());
  const title1 = escapeText(getScene(sceneTitles, 0, "商品介紹"));
  const title2 = escapeText(getScene(sceneTitles, 1, "商品特色"));
  const title3 = escapeText(getScene(sceneTitles, 2, "立即下單"));
  const sub1 = escapeText(getScene(sceneSubtitles, 0, "重點一眼看懂"));
  const sub2 = escapeText(getScene(sceneSubtitles, 1, "熱賣關鍵直接看"));
  const sub3 = escapeText(getScene(sceneSubtitles, 2, "點擊連結立即查看"));

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
    `[bottombox]drawtext=fontfile='${fontFile}':text='${title1}':fontsize=82:fontcolor=white:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=108:enable='between(t,${t0.toFixed(3)},${t1.toFixed(3)})'[vt1];`,
    `[vt1]drawtext=fontfile='${fontFile}':text='${title2}':fontsize=82:fontcolor=white:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=108:enable='between(t,${t1.toFixed(3)},${t2.toFixed(3)})'[vt2];`,
    `[vt2]drawtext=fontfile='${fontFile}':text='${title3}':fontsize=82:fontcolor=white:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=108:enable='between(t,${t2.toFixed(3)},${totalDuration.toFixed(3)})'[vt3];`,
    `[vt3]drawtext=fontfile='${fontFile}':text='${sub1}':fontsize=62:fontcolor=#FFD400:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=h-315:enable='between(t,${t0.toFixed(3)},${t1.toFixed(3)})'[vs1];`,
    `[vs1]drawtext=fontfile='${fontFile}':text='${sub2}':fontsize=62:fontcolor=#FFD400:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=h-315:enable='between(t,${t1.toFixed(3)},${t2.toFixed(3)})'[vs2];`,
    `[vs2]drawtext=fontfile='${fontFile}':text='${sub3}':fontsize=62:fontcolor=#FFD400:borderw=7:bordercolor=black:shadowy=4:x=(w-text_w)/2:y=h-315:enable='between(t,${t2.toFixed(3)},${totalDuration.toFixed(3)})'[vout];`,
    `[3:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=1.35[voice];`,
    `[4:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.10[bgm];`,
    `[voice][bgm]amix=inputs=2:duration=longest:dropout_transition=2[aout]`,
  ].join("");
}

function shortText(input, maxLen = 12) {
  const s = String(input || "")
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D]/gu, "")
    .replace(/\s+/g, "")
    .trim();
  const chars = Array.from(s);
  return chars.length > maxLen ? chars.slice(0, maxLen).join("") : s;
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
  const rawTitle = String(title || "");
  const profiles = [
    {
      test: /烘鞋|乾鞋|鞋襪機/,
      base: "烘鞋機",
      hook: "下雨天鞋子濕透",
      pain: "隔天穿又冷又悶",
      benefit: "定時恆溫輕鬆烘乾",
      proof: "鞋子襪子都能使用",
      voiceText:
        "下雨鞋子濕透，隔天還要穿，又冷又悶嗎？這款烘鞋機可定時恆溫烘乾，鞋子襪子都能用，點連結看價格。",
    },
    {
      test: /吸塵|除塵|車用吸塵/,
      base: "無線吸塵器",
      hook: "碎屑灰塵清不完",
      pain: "搬大台吸塵器太麻煩",
      benefit: "輕巧無線隨手清",
      proof: "桌面車縫都好整理",
      voiceText:
        "桌面碎屑、車縫灰塵，每次搬大台吸塵器太麻煩？這款輕巧無線，髒了隨手吸，點連結看價格。",
    },
    {
      test: /枕|記憶棉|乳膠枕/,
      base: "舒眠枕",
      hook: "枕頭高度總不合",
      pain: "翻來覆去難找姿勢",
      benefit: "分區承托不同睡姿",
      proof: "側睡仰睡都能調整",
      voiceText:
        "枕頭高度不合，翻來覆去找不到舒服姿勢？這款分區承托設計，側睡仰睡都好調整，點連結看款式。",
    },
    {
      test: /收納|置物|折疊櫃|衣櫃/,
      base: "折疊收納櫃",
      hook: "東西堆滿找不到",
      pain: "房間看起來又亂又擠",
      benefit: "多層分類整齊收好",
      proof: "折疊設計省去安裝",
      voiceText:
        "東西堆滿地，臨時要用又找不到？這款多層收納櫃可分類整理，折疊設計省去安裝，點連結看尺寸。",
    },
    {
      test: /手機架|手機支架|懶人支架/,
      base: "手機支架",
      hook: "追劇手痠手機又滑",
      pain: "低頭久了姿勢不舒服",
      benefit: "免手持角度自由調",
      proof: "桌邊床邊都能使用",
      voiceText:
        "躺著追劇手舉到痠，手機還一直滑落？這款支架免手持、角度可調，床邊桌邊都能用，點連結看款式。",
    },
  ];
  const matched = profiles.find((profile) => profile.test.test(rawTitle));
  const base = matched?.base || shortText(title, 7) || "居家好物";
  const hook = matched?.hook || "家裡這個麻煩";
  const pain = matched?.pain || "每天處理真的很費事";
  const benefit = matched?.benefit || `${base}幫你輕鬆解決`;
  const proof = matched?.proof || "重點功能快速看懂";
  const voiceText =
    matched?.voiceText ||
    `家裡這個小麻煩，每天處理真的很費事？這款${base}讓日常更省力，重點功能一次看懂，點連結看價格。`;
  const keywords = normalizeKeywordList("", base);
  return {
    source: "fallback",
    hook,
    pain,
    benefit,
    proof,
    cta: "點連結查看價格",
    sceneTitles: [hook, benefit, "現在價格多少"],
    sceneSubtitles: [pain, proof, "點連結看款式與優惠"],
    voiceText,
    shortTitle: `${hook}？${base}快速解決`,
    keywords,
    titleWithKeywords: `${hook}？${base}快速解決\n\n${keywords}`,
    shortDescription: `${pain}？用 ${base} 把日常麻煩變簡單，影片快速看功能與使用情境。`,
    fullPost: `${hook}？${base}快速解決\n\n${pain}？用 ${base} 把日常麻煩變簡單，影片快速看功能與使用情境。\n\n[affiliateUrl]`,
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

function normalizeAiResponse(raw, title) {
  const obj = pickRootData(raw);
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

  return {
    source: obj.source || raw?.source || "supabase",
    raw,
    hook,
    pain,
    benefit,
    proof,
    cta,
    sceneTitles: [
      shortText(pain, 12),
      shortText(benefit, 12),
      shortText(cta, 12),
    ],
    sceneSubtitles: [
      shortText(benefit, 18),
      shortText(proof, 18),
      shortText(cta, 18),
    ],
    voiceText: String(voiceText).trim(),
    shortTitle: String(shortTitle).trim(),
    keywords: String(keywords).trim(),
    titleWithKeywords: String(titleWithKeywords).trim(),
    shortDescription: String(shortDescription).trim(),
    fullPost: String(fullPost).trim(),
  };
}

async function getAiScript(title, productUrl, promoUrl) {
  if (!VIDEO_SCRIPT_ENDPOINT) {
    debugAi("[AI] missing VIDEO_SCRIPT_ENDPOINT");
    return {
      ...buildFallbackScript(title),
      source: "fallback_missing_endpoint",
      aiError: "VIDEO_SCRIPT_ENDPOINT empty",
    };
  }

  const payload = {
    title: cleanProductTitle(title),
    productUrl,
    promoUrl,
    affiliateUrl: promoUrl,
    content: [title, productUrl, promoUrl].filter(Boolean).join("\n"),
    lang: "zh-TW",
    style: "shopee_short_video_3_scene",
    target: "shopee_short_video",
    goal: "direct_conversion",
    tone: "pain_point_sales",
    scenes: 3,
    requireFields: [
      "pain",
      "benefit",
      "proof",
      "cta",
      "shortTitle",
      "keywords",
      "shortDescription",
      "fullPost",
      "voice",
    ],
  };

  debugAi(`[AI] endpoint=${VIDEO_SCRIPT_ENDPOINT}`);
  debugAi(`[AI] key=${maskSecret(VIDEO_SCRIPT_KEY)}`);
  debugAi(`[AI] title=${String(title || "").slice(0, 80)}`);

  try {
    const response = await axios.post(VIDEO_SCRIPT_ENDPOINT, payload, {
      headers: {
        "content-type": "application/json",
        ...(VIDEO_SCRIPT_KEY
          ? { authorization: `Bearer ${VIDEO_SCRIPT_KEY}` }
          : {}),
        ...(VIDEO_SCRIPT_KEY ? { apikey: VIDEO_SCRIPT_KEY } : {}),
      },
      timeout: 30000,
    });

    const status = response?.status || 0;
    let data = response?.data;
    debugAi(`[AI] status=${status}`);
    debugAi(
      `[AI] raw=${String(typeof data === "string" ? data : JSON.stringify(data)).slice(0, 500)}`,
    );

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        debugAi("[AI] parse failed, non-json response");
        return {
          ...buildFallbackScript(title),
          source: "fallback_non_json",
          aiError: String(data || "").slice(0, 300),
        };
      }
    }

    if (status >= 400 || data?.ok === false || data?.error) {
      const msg = data?.message || data?.error || `AI_HTTP_${status}`;
      debugAi(`[AI] request failed -> ${msg}`);
      return {
        ...buildFallbackScript(title),
        source: `fallback_http_${status}`,
        aiError: msg,
      };
    }

    const normalized = normalizeAiResponse(data, title);
    debugAi(`[AI] normalized source=${normalized.source}`);
    debugAi(`[AI] normalized shortTitle=${normalized.shortTitle}`);
    return normalized;
  } catch (error) {
    const msg = error?.message || "UNKNOWN_AI_ERROR";
    debugAi(`[AI] fallback -> ${msg}`);
    return {
      ...buildFallbackScript(title),
      source: "fallback_fetch_error",
      aiError: error?.stack || error?.message || msg || "UNKNOWN_AI_ERROR",
    };
  }
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

  const merged = {
    source: aiScript?.source || "fallback",
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
  };

  if (!merged.titleWithKeywords) {
    merged.titleWithKeywords =
      `${merged.shortTitle}\n\n${merged.keywords}`.trim();
  }
  if (!merged.fullPost) {
    merged.fullPost =
      `${merged.shortTitle}\n\n${merged.shortDescription}\n\n[affiliateUrl]`.trim();
  }
  return merged;
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
    context = await browser.newContext({
      locale: "zh-TW",
      userAgent:
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    });
    const page = await context.newPage();
    const response = await page.goto(productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    if (!response?.ok()) {
      console.warn("[shopee-images] browser api failed", {
        status: response?.status() || 0,
        productUrl,
      });
      return [];
    }

    await page
      .waitForSelector(".stardust-carousel__item-inner-wrapper", {
        timeout: 5000,
      })
      .catch(() => null);

    // Shopee 商品媒體輪播的第 1 項可能是影片；固定只取第 2～4 項。
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
    console.log("[shopee-images] browser fallback", {
      productUrl,
      imageCount: images.length,
    });
    return images;
  } catch (error) {
    console.warn(
      "[shopee-images] browser fallback failed",
      error?.message || error,
    );
    return [];
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
    if (response.status < 200 || response.status >= 300) return [];

    const html = String(response.data || "");
    const ids = [...html.matchAll(/"images"\s*:\s*\[([^\]]+)\]/g)]
      .flatMap((match) =>
        [...String(match[1]).matchAll(/"([^"]+)"/g)].map((x) => x[1]),
      );
    const images = [
      ...new Set(ids.map(normalizeShopeeImageUrl).filter(Boolean)),
    ].slice(0, 3);
    if (images.length) return images;
  } catch (error) {
    console.warn("[shopee-images] html fallback failed", error?.message || error);
  }

  return fetchShopeeImagesWithBrowser(productUrl);
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
        index: Number.isFinite(Number(item?.index))
          ? Number(item.index)
          : fallbackIndex,
        productUrl: String(item?.productUrl || item?.url || "").trim(),
      }))
      .filter((item) => item.productUrl)
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

    return res.json({ ok: true, count: results.length, results });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "SHOPEE_IMAGES_FAILED",
      message: error?.message || String(error),
      build: BUILD,
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
    if (imageUrls.length < 3) {
      throw new Error(`NEED_3_IMAGE_URLS_ONLY_GOT_${imageUrls.length}`);
    }

    const shouldUseAi = item.useAi !== false;
    const aiScript = shouldUseAi
      ? await getAiScript(
          title,
          item.productUrl,
          item.promoUrl || item.affiliateUrl,
        )
      : buildFallbackScript(title);

    const mergedScript = mergeScript(item, aiScript, title);

    const { files: localImages, hashes } = await downloadImages(
      imageUrls,
      workDir,
    );
    if (new Set(hashes).size < 3) {
      throw new Error("IMAGE_HASH_DUPLICATED");
    }

    const voice = await synthesizeVoice(mergedScript.voiceText, workDir);
    const voiceDuration = await ffprobeDuration(voice.voiceFile);
    const clipDur = 4.0;
    const totalDuration = Math.max(clipDur * 3, voiceDuration || 0, 12);
    const bgmPath = await resolveBgmPath(item, workDir, totalDuration);
    const filterComplex = buildFilterComplex(
      mergedScript.sceneTitles,
      mergedScript.sceneSubtitles,
      clipDur,
      totalDuration,
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
    const publicVideoFallback = buildPublicVideoUrl(outputFile);
    let publicVideoUrl = publicVideoFallback;
    let uploadError = "";

    if (ENABLE_PUBLIC_UPLOAD) {
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
      title: mergedScript.shortTitle,
      desc: mergedScript.shortDescription,
      link: affiliateUrl,
      video: publicVideoUrl,
      image: item.imageUrls?.[0] || "",
    });

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
      aiError: mergedScript.aiError || "",
      sceneTitles: mergedScript.sceneTitles,
      sceneSubtitles: mergedScript.sceneSubtitles,
      totalDuration,
      shortTitle: mergedScript.shortTitle,
      keywords: mergedScript.keywords,
      titleWithKeywords: mergedScript.titleWithKeywords,
      shortDescription: mergedScript.shortDescription,
      fullPost: mergedScript.fullPost,
      pain: mergedScript.pain,
      benefit: mergedScript.benefit,
      proof: mergedScript.proof,
      cta: mergedScript.cta,
      affiliateUrl,
      title,
      uploadError,
    });
  } catch (error) {
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
    const results = [];

    for (const item of items) {
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
      results.push({
        ok: response.ok && data?.ok !== false,
        title: item.title || "",
        ...data,
      });
    }

    return res.json({
      ok: true,
      count: results.length,
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
  console.log(`Image-to-video server running at http://localhost:${PORT}`);
});
