// scripts/copy-ffmpeg-core.cjs
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../node_modules/@ffmpeg/core/dist");
const destDir = path.join(__dirname, "../public/ffmpeg-core");

const files = [
  "ffmpeg-core.js",
  "ffmpeg-core.wasm",
  "ffmpeg-core.worker.js",
];

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

files.forEach((file) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  
  // 檢查源文件是否存在
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  警告: ${file} 不存在於 ${srcDir}`);
    return;
  }
  
  fs.copyFileSync(src, dest);
  console.log(`✅ 已複製 ${file} → public/ffmpeg-core/`);
});

console.log("🎉 FFmpeg 核心套件已準備完成。");
