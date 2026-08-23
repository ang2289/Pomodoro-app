const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { execSync } = require("child_process");
const archiver = require("archiver");

// 多圖輪播總長度（秒），9:16 直式
const VIDEO_DURATION_MIN = 6;
const VIDEO_DURATION_MAX = 9;
const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

// 每筆最多下載幾張圖（3~5 張）
const MAX_IMAGES_PER_SCRIPT = 5;

// 可選：背景音樂檔路徑（放在同資料夾，命名 bgm.mp3）
const BGM_PATH = path.join(__dirname, "bgm.mp3");

// 下載單張圖片，失敗回傳 null
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.buffer();
    fs.writeFileSync(destPath, buffer);
    return destPath;
  } catch (e) {
    console.warn("  跳過下載失敗：", url);
    return null;
  }
}

// 從腳本取得圖片 URL 陣列（優先 imageUrls）
function getImageUrls(script) {
  if (Array.isArray(script.imageUrls) && script.imageUrls.length > 0) {
    return script.imageUrls;
  }
  if (Array.isArray(script.images) && script.images.length > 0) {
    return script.images;
  }
  if (script.image && typeof script.image === "string") {
    return [script.image];
  }
  return [];
}

// 取得副檔名（預設 .jpg）
function getImageExt(url) {
  try {
    const u = new URL(url, "http://x");
    const ext = path.extname(u.pathname).toLowerCase();
    return ext && [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
  } catch {
    return ".jpg";
  }
}

// 正確組出 filter_complex 字串（多圖輪播）
function buildConcatFilter(n, scalePad) {
  const parts = [];
  for (let j = 0; j < n; j++) {
    parts.push(`[${j}:v]${scalePad}[v${j}]`);
  }
  const concatInputs = Array.from({ length: n }, (_, j) => `[v${j}]`).join("");
  parts.push(`${concatInputs}concat=n=${n}:v=1:a=0[outv]`);
  return parts.join(";");
}

// 產生單支影片（多圖輪播，9:16、1080x1920、6~9 秒）
function generateVideo(localPaths, outputPath) {
  if (localPaths.length === 0) return;
  const n = localPaths.length;
  // 總長 6~9 秒：圖少用 6，圖多用 9
  const totalDuration = Math.min(VIDEO_DURATION_MAX, Math.max(VIDEO_DURATION_MIN, 5 + n));
  const durationPerImage = totalDuration / n;

  const hasBgm = fs.existsSync(BGM_PATH);
  const scalePad = `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=decrease,pad=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:(ow-iw)/2:(oh-ih)/2`;

  const args = ["-y"];
  for (let j = 0; j < n; j++) {
    args.push("-loop", "1", "-t", String(durationPerImage), "-i", localPaths[j]);
  }
  if (hasBgm) {
    args.push("-i", BGM_PATH);
  }

  const filterComplex = buildConcatFilter(n, scalePad);
  args.push("-filter_complex", filterComplex, "-map", "[outv]");
  if (hasBgm) {
    args.push("-map", `${n}:a`, "-c:a", "aac", "-shortest");
  }
  args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", outputPath);

  const cmd = "ffmpeg " + args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ");
  console.log("  執行 ffmpeg（多圖輪播 " + n + " 張）…");
  execSync(cmd, { stdio: "inherit" });
}

// 打包成 zip
function zipVideos(outputDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`已建立 ZIP 檔：${zipPath}（共 ${archive.pointer()} bytes）`);
      resolve();
    });

    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(outputDir, false);
    archive.finalize();
  });
}

async function main() {
  const scriptsPath = path.join(__dirname, "scripts.json");

  if (!fs.existsSync(scriptsPath)) {
    console.error("找不到 scripts.json，請先從網站下載腳本 JSON 並放在此資料夾。");
    process.exit(1);
  }

  const raw = fs.readFileSync(scriptsPath, "utf-8");
  const scripts = JSON.parse(raw);

  if (!Array.isArray(scripts) || scripts.length === 0) {
    console.error("scripts.json 格式不正確或是空的。");
    process.exit(1);
  }

  const outputDir = path.join(__dirname, "output");
  const tempDir = path.join(__dirname, "tmp");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  console.log(`共 ${scripts.length} 筆腳本，開始產生影片…`);

  const MAX_COUNT = scripts.length;
  const skipped = [];

  for (let i = 0; i < MAX_COUNT; i++) {
    const s = scripts[i];
    const title = s.title || s.name || "無標題";

    console.log(`\n[${i + 1}/${MAX_COUNT}] ${title}`);

    // 優先使用 imageUrls，再 fallback images / image
    const urls = getImageUrls(s);
    const toDownload = urls.slice(0, MAX_IMAGES_PER_SCRIPT);

    if (toDownload.length === 0) {
      console.log(`  [跳過] 沒有圖片 URL，需手動補圖`);
      skipped.push({ index: i + 1, title, reason: "無圖片" });
      continue;
    }

    const taskTmpDir = path.join(tempDir, String(i));
    if (!fs.existsSync(taskTmpDir)) fs.mkdirSync(taskTmpDir, { recursive: true });

    const localPaths = [];
    for (let j = 0; j < toDownload.length; j++) {
      const ext = getImageExt(toDownload[j]);
      const destPath = path.join(taskTmpDir, `img_${j}${ext}`);
      const result = await downloadImage(toDownload[j], destPath);
      if (result) localPaths.push(result);
    }

    if (localPaths.length === 0) {
      console.log(`  [跳過] 下載到的圖片數 = 0，需手動補圖`);
      skipped.push({ index: i + 1, title, reason: "下載失敗" });
      continue;
    }

    const videoPath = path.join(outputDir, `video_${i + 1}.mp4`);

    try {
      console.log("  已下載 " + localPaths.length + " 張圖，產生影片…");
      generateVideo(localPaths, videoPath);
      console.log("  ✅ 完成：", videoPath);
    } catch (err) {
      console.error("  ❌ FFmpeg 錯誤：", err.message);
      skipped.push({ index: i + 1, title, reason: err.message });
    }
  }

  if (skipped.length > 0) {
    console.log("\n--- 已跳過（無圖或失敗）---");
    skipped.forEach(({ index, title, reason }) => {
      console.log(`  [${index}] ${title}：${reason}`);
    });
  }

  const zipPath = path.join(__dirname, "videos_batch.zip");
  await zipVideos(outputDir, zipPath);

  console.log("\n全部處理完成！");
  console.log("請到 output 資料夾查看影片，或使用 videos_batch.zip。");
}

main().catch((err) => {
  console.error("主程式錯誤：", err);
});
