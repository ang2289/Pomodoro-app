"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn, execFileSync } = require("node:child_process");
const { createRequire } = require("node:module");
const { prepare916Images, RATIO_MIN, RATIO_MAX, MIN_WIDTH, MIN_HEIGHT } = require("./rxv-video-916-selector.cjs");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SOURCE_ROOT = process.env.RXV_SOURCE_ROOT || "D:\\Pomodoro-app";
const SALES_URL = "https://pomodoro-app-eight-rouge.vercel.app/images";
const LINE_ID = "ang22899";

function requireOptional(name) {
  try { return require(name); } catch {}
  const packageFiles = [
    path.join(ROOT, "package.json"),
    path.join(DEFAULT_SOURCE_ROOT, "package.json"),
  ];
  for (const file of packageFiles) {
    try {
      if (!fs.existsSync(file)) continue;
      return createRequire(file)(name);
    } catch {}
  }
  return null;
}

function resolveFfmpeg() {
  const envPath = String(process.env.RXV_FFMPEG_PATH || "").trim();
  if (envPath && fs.existsSync(envPath)) return envPath;

  const staticFfmpeg = requireOptional("ffmpeg-static");
  if (staticFfmpeg && fs.existsSync(String(staticFfmpeg))) return String(staticFfmpeg);

  const candidates = [
    path.join(ROOT, "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(DEFAULT_SOURCE_ROOT, "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "D:\\ffmpeg\\bin\\ffmpeg.exe",
  ];
  for (const candidate of candidates) {
    try {
      if (candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    } catch {}
  }

  try {
    const cmd = process.platform === "win32" ? "where.exe" : "which";
    const out = execFileSync(cmd, ["ffmpeg"], { encoding: "utf8", windowsHide: true });
    const first = String(out || "").split(/\r?\n/).map((x) => x.trim()).find(Boolean);
    if (first) return first;
  } catch {}
  return "";
}

function outputRoot() {
  const configured = String(process.env.RXV_AUTO_VIDEO_ROOT || "").trim();
  if (configured) return path.resolve(configured);
  if (process.platform === "win32") return "D:\\RXV-AutoVideo";
  return path.join(ROOT, ".local-tools", "rxv-auto-video");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function safeFileName(value) {
  return (String(value || "item")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 90) || "item");
}

function xmlEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value, maxChars = 17, maxLines = 3) {
  const text = String(value || "").trim();
  if (!text) return [];
  const lines = [];
  let current = "";
  for (const char of Array.from(text)) {
    current += char;
    if (current.length >= maxChars || /[。！？!?；;，,]$/.test(current)) {
      lines.push(current.trim());
      current = "";
      if (lines.length >= maxLines) break;
    }
  }
  if (current.trim() && lines.length < maxLines) lines.push(current.trim());
  return lines.slice(0, maxLines);
}

function svgTextLines(lines, { x, y, lineHeight, fontSize, anchor = "middle", fill = "#ffffff", weight = 800 } = {}) {
  return (lines || []).map((line, index) => {
    const yy = Number(y || 0) + index * Number(lineHeight || fontSize || 40);
    return `<text x="${x}" y="${yy}" text-anchor="${anchor}" font-family="Microsoft JhengHei,Microsoft YaHei,Noto Sans CJK TC,sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${xmlEscape(line)}</text>`;
  }).join("\n");
}

function contentOverlaySvg({ headline, footer, brand = "RXV 圖片素材" }) {
  const headLines = wrapText(headline, 18, 3);
  const footerLines = wrapText(footer, 22, 2);
  return Buffer.from(`
  <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <rect x="48" y="48" width="984" height="235" rx="36" fill="rgba(10,10,10,0.70)"/>
    ${svgTextLines(headLines, { x: 540, y: 122, lineHeight: 66, fontSize: 54 })}
    <rect x="48" y="1515" width="984" height="310" rx="36" fill="rgba(10,10,10,0.76)"/>
    ${svgTextLines(footerLines, { x: 540, y: 1618, lineHeight: 62, fontSize: 48 })}
    <text x="540" y="1770" text-anchor="middle" font-family="Microsoft JhengHei,Microsoft YaHei,Noto Sans CJK TC,sans-serif" font-size="40" font-weight="700" fill="#f5e8b6">${xmlEscape(brand)}</text>
  </svg>`, "utf8");
}

function ctaOverlaySvg({ packLabel, packCount, siteTotal, smallPrice = 99, allPrice = 199, salesUrl = SALES_URL, lineId = LINE_ID }) {
  return Buffer.from(`
  <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <rect x="62" y="165" width="956" height="1595" rx="56" fill="rgba(5,8,12,0.91)"/>
    <text x="540" y="355" text-anchor="middle" font-family="Microsoft JhengHei,Microsoft YaHei,Noto Sans CJK TC,sans-serif" font-size="66" font-weight="850" fill="#ffffff">${xmlEscape(`${packCount} 張 ${packLabel}`)}</text>
    <text x="540" y="515" text-anchor="middle" font-family="Arial,Microsoft JhengHei,sans-serif" font-size="102" font-weight="900" fill="#ffbf27">NT$${smallPrice}</text>
    <text x="540" y="620" text-anchor="middle" font-family="Microsoft JhengHei,Microsoft YaHei,sans-serif" font-size="47" font-weight="750" fill="#ffffff">全部 ${siteTotal} 張素材｜NT$${allPrice}</text>
    <rect x="205" y="690" width="670" height="118" rx="59" fill="#0aa174"/>
    <text x="540" y="767" text-anchor="middle" font-family="Microsoft JhengHei,Microsoft YaHei,sans-serif" font-size="48" font-weight="850" fill="#ffffff">掃碼立即查看</text>
    <text x="540" y="1370" text-anchor="middle" font-family="Arial,Microsoft JhengHei,sans-serif" font-size="34" font-weight="600" fill="#ffffff">${xmlEscape(salesUrl.replace(/^https?:\/\//, ""))}</text>
    <text x="540" y="1485" text-anchor="middle" font-family="Arial,Microsoft JhengHei,sans-serif" font-size="42" font-weight="700" fill="#ffffff">LINE：${xmlEscape(lineId)}</text>
    <text x="540" y="1662" text-anchor="middle" font-family="Microsoft JhengHei,Microsoft YaHei,sans-serif" font-size="40" font-weight="700" fill="#f5e8b6">RXV 圖片素材</text>
  </svg>`, "utf8");
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

async function downloadImageSmart(url, dir, stem) {
  const response = await fetch(String(url || ""), { cache: "no-store" });
  if (!response.ok) throw new Error(`圖片下載失敗：HTTP ${response.status}`);
  const ext = detectExt(url, response.headers.get("content-type") || "");
  const target = path.join(dir, safeFileName(stem) + ext);
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}

function listMp3Files() {
  const dirs = [
    String(process.env.RXV_MP3_DIR || "").trim(),
    path.join(outputRoot(), "mp3"),
    path.join(ROOT, "assets"),
    path.join(ROOT, "public", "music"),
    path.join(DEFAULT_SOURCE_ROOT, "assets"),
    path.join(DEFAULT_SOURCE_ROOT, "public", "music"),
  ].filter(Boolean);

  const seen = new Set();
  const items = [];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
      for (const name of fs.readdirSync(dir)) {
        const file = path.join(dir, name);
        let stat;
        try { stat = fs.statSync(file); } catch { continue; }
        if (!stat.isFile() || !/\.(mp3|m4a|wav|aac)$/i.test(name)) continue;
        const key = file.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ id: Buffer.from(file).toString("base64url"), name, path: file });
        if (items.length >= 80) return items;
      }
    } catch {}
  }
  return items;
}

function chooseMp3(requested) {
  const items = listMp3Files();
  const value = String(requested || "auto").trim();
  if (value === "none") return "";
  if (value && value !== "auto") {
    const exact = items.find((x) => x.id === value || x.path === value || x.name === value);
    if (exact) return exact.path;
  }
  return items.length ? items[0].path : "";
}

function run(file, args, timeoutMs = 240000) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk || ""); });
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      reject(new Error("FFmpeg 執行逾時"));
    }, Math.max(15000, Number(timeoutMs || 240000)));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) return resolve({ ok: true });
      reject(new Error("FFmpeg 失敗：" + stderr.slice(-1800)));
    });
  });
}

async function renderContentSlide(sharp, imagePath, outputPath, headline, footer) {
  const bg = await sharp(imagePath)
    .rotate()
    .resize(1080, 1920, {
      fit: "contain",
      background: "#000000",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 0.98, saturation: 1.0 })
    .png()
    .toBuffer();
  await sharp(bg)
    .composite([{ input: contentOverlaySvg({ headline, footer }) }])
    .png()
    .toFile(outputPath);
}

async function renderCtaSlide(sharp, QRCode, imagePath, outputPath, data) {
  const bg = await sharp(imagePath)
    .rotate()
    .resize(1080, 1920, { fit: "cover", position: "attention" })
    .blur(14)
    .modulate({ brightness: 0.48, saturation: 0.75 })
    .png()
    .toBuffer();

  const qrBuffer = await QRCode.toBuffer(String(data.salesUrl || SALES_URL), {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
    color: { dark: "#000000", light: "#ffffff" },
  });

  await sharp(bg)
    .composite([
      { input: ctaOverlaySvg(data) },
      { input: qrBuffer, left: 380, top: 900 },
    ])
    .png()
    .toFile(outputPath);
}

async function createSegment(ffmpeg, slidePath, outPath, duration) {
  const safeDuration = Math.max(0.5, Number(duration || 2.25));
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-loop", "1",
    "-framerate", "30",
    "-i", slidePath,
    "-t", safeDuration.toFixed(3),
    "-vf", "fps=30,format=yuv420p",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "21",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-an",
    outPath,
  ]);
}

function ffconcatQuote(filePath) {
  return String(filePath).replace(/'/g, "'\\''");
}

async function concatSegments(ffmpeg, segmentPaths, outputPath, workDir) {
  const listPath = path.join(workDir, "concat.txt");
  const text = segmentPaths.map((p) => `file '${ffconcatQuote(path.resolve(p).replace(/\\/g, "/"))}'`).join("\n") + "\n";
  fs.writeFileSync(listPath, text, "utf8");
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", listPath,
    "-c", "copy", "-movflags", "+faststart",
    outputPath,
  ]);
}

async function addAudio(ffmpeg, inputVideo, mp3Path, outputPath) {
  if (!mp3Path || !fs.existsSync(mp3Path)) {
    fs.copyFileSync(inputVideo, outputPath);
    return;
  }
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", inputVideo,
    "-stream_loop", "-1", "-i", mp3Path,
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "160k",
    "-af", "volume=0.22",
    "-shortest",
    "-movflags", "+faststart",
    outputPath,
  ]);
}

async function buildVideo(options = {}) {
  const sharp = requireOptional("sharp");
  const QRCode = requireOptional("qrcode");
  if (!sharp) throw new Error("找不到 sharp。請確認 D:\\Pomodoro-app\\node_modules 可用。");
  if (!QRCode) throw new Error("找不到 qrcode。請確認 D:\\Pomodoro-app\\node_modules 可用。");
  const ffmpeg = resolveFfmpeg();
  if (!ffmpeg) throw new Error("找不到 FFmpeg。請確認 ffmpeg-static 或系統 FFmpeg 可用。");
  const videoId = safeFileName(options.videoId || Date.now());
  const inputImages = Array.isArray(options.images) ? options.images.filter((x) => x && (x.image_id || x.id)) : [];
  const requestedCount = Math.max(2, Math.min(6, Number(options.imageCount || inputImages.length || 4) || 4));
  const prepared = await prepare916Images(options, sharp, requestedCount);
  const localImages = prepared.map((item) => item.localPath);
  const root = outputRoot();
  const workDir = ensureDir(path.join(root, "work", videoId));
  const slideDir = ensureDir(path.join(workDir, "slides"));
  const segmentDir = ensureDir(path.join(workDir, "segments"));
  const outputDir = ensureDir(path.join(root, "output"));
  const painLines = Array.isArray(options.painLines) && options.painLines.length ? options.painLines : [
    (options.categoryLabel || "社群") + "每天發文還在花時間找圖嗎？",
    "常用情境素材一次整理",
    "買一次即可重複使用，發文直接挑圖",
    "小包 NT$99｜全部素材 NT$199",
  ];
  const footer = (options.packCount || requestedCount) + " 張小包 NT$99｜全部 " + (options.siteTotal || requestedCount) + " 張 NT$199";
  const slides = [];
  for (let i = 0; i < localImages.length; i += 1) {
    const slide = path.join(slideDir, "slide_" + String(i + 1).padStart(2, "0") + ".png");
    await renderContentSlide(sharp, localImages[i], slide, painLines[i % painLines.length], footer);
    slides.push({ path: slide, duration: Number(options.secondsPerImage || 2.0) });
  }
  const ctaSlide = path.join(slideDir, "slide_cta.png");
  await renderCtaSlide(sharp, QRCode, localImages[localImages.length - 1], ctaSlide, {
    packLabel: options.packLabel || (options.categoryLabel || "專業") + "常用圖片",
    packCount: Number(options.packCount || requestedCount),
    siteTotal: Number(options.siteTotal || requestedCount),
    smallPrice: Number(options.smallPrice || 99),
    allPrice: Number(options.allPrice || 199),
    salesUrl: options.salesUrl || SALES_URL,
    lineId: options.lineId || LINE_ID,
  });
  slides.push({ path: ctaSlide, duration: Number(options.ctaSeconds || 2.5) });
  const segmentPaths = [];
  for (let i = 0; i < slides.length; i += 1) {
    const segment = path.join(segmentDir, "seg_" + String(i + 1).padStart(2, "0") + ".mp4");
    await createSegment(ffmpeg, slides[i].path, segment, slides[i].duration);
    segmentPaths.push(segment);
  }
  const silent = path.join(workDir, "joined-silent.mp4");
  await concatSegments(ffmpeg, segmentPaths, silent, workDir);
  const selectedMp3 = chooseMp3(options.mp3Choice || "auto");
  const finalPath = path.join(outputDir, videoId + ".mp4");
  await addAudio(ffmpeg, silent, selectedMp3, finalPath);
  const totalDuration = slides.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  const stat = fs.statSync(finalPath);
  return {
    ok: true,
    version: "v2.1-916-originals",
    videoPath: finalPath,
    durationSec: Number(totalDuration.toFixed(2)),
    sizeBytes: stat.size,
    mp3Path: selectedMp3,
    ffmpegPath: ffmpeg,
    workDir,
    selectedImages: prepared.map((item) => ({
      imageId: String(item.image && (item.image.image_id || item.image.id) || ""),
      title: String(item.image && item.image.title || ""),
      category: String(item.image && item.image.category || options.categoryLabel || ""),
      width: Number(item.width || 0),
      height: Number(item.height || 0),
      ratio: Number(Number(item.ratio || 0).toFixed(4)),
      is916: Boolean(item.is916),
      isHighRes916: Boolean(item.isHighRes916),
      originalPath: item.localPath,
    })),
    selectionRule: { only916: true, originalImageOnly: true, ratioMin: RATIO_MIN, ratioMax: RATIO_MAX, minWidth: MIN_WIDTH, minHeight: MIN_HEIGHT },
  };
}

module.exports = {
  buildVideo,
  listMp3Files,
  chooseMp3,
  resolveFfmpeg,
  outputRoot,
};
