const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { execSync } = require("child_process");
const archiver = require("archiver");

// 影片長度（秒）
const VIDEO_DURATION = 15;

// 可選：背景音樂檔路徑（放在同資料夾，命名 bgm.mp3）
// 如果沒有這個檔案，程式會自動改成「無背景音樂版本」
const BGM_PATH = path.join(__dirname, "bgm.mp3");

// 下載圖片
async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("下載圖片失敗：" + url);
  }
  const buffer = await res.buffer();
  fs.writeFileSync(destPath, buffer);
}

// 產生單支影片
function generateVideo(imagePath, outputPath) {
  // 基本 ffmpeg 參數：用單張圖片做 9:16 影片
  // scale + pad 讓圖片塞滿 1080x1920
  const hasBgm = fs.existsSync(BGM_PATH);

  let cmd;

  if (hasBgm) {
    cmd = `ffmpeg -y -loop 1 -i "${imagePath}" -i "${BGM_PATH}" -t ${VIDEO_DURATION} -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${outputPath}"`;
  } else {
    cmd = `ffmpeg -y -loop 1 -i "${imagePath}" -t ${VIDEO_DURATION} -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`;
  }

  console.log("執行 ffmpeg：", cmd);
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

  // 先只產前 10 筆測試（怕一次 100 太久）
  const MAX_COUNT = Math.min(scripts.length, 10);

  for (let i = 0; i < MAX_COUNT; i++) {
    const s = scripts[i];

    console.log(`\n[${i + 1}/${MAX_COUNT}] ${s.title || s.name || "無標題"}`);

    const imageUrl = s.image;
    if (!imageUrl) {
      console.warn("  ⚠️ 缺少 image 欄位，略過此筆。");
      continue;
    }

    const imagePath = path.join(tempDir, `img_${i}.jpg`);
    const videoPath = path.join(outputDir, `video_${i + 1}.mp4`);

    try {
      console.log("  下載圖片…");
      await downloadImage(imageUrl, imagePath);

      console.log("  產生影片…");
      generateVideo(imagePath, videoPath);

      console.log("  ✅ 完成：", videoPath);
    } catch (err) {
      console.error("  ❌ 發生錯誤：", err.message);
    }
  }

  const zipPath = path.join(__dirname, "videos_batch.zip");
  await zipVideos(outputDir, zipPath);

  console.log("\n全部處理完成！");
  console.log("請到 output 資料夾查看影片，或使用 videos_batch.zip。");
}

main().catch((err) => {
  console.error("主程式錯誤：", err);
});























