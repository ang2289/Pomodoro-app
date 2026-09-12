// scripts/copy-ffmpeg-core.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用 umd 版本（通用模組定義，適合瀏覽器使用）
const srcDir = path.join(__dirname, "../node_modules/@ffmpeg/core/dist/umd");
const destDir = path.join(__dirname, "../public/ffmpeg-core");

const files = [
  "ffmpeg-core.js",
  "ffmpeg-core.wasm",
  // 注意：新版本的 @ffmpeg/core 可能不再需要 worker 文件
  // 如果需要的話，請檢查實際的文件位置
];

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

files.forEach((file) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ 已複製 ${file} → public/ffmpeg-core/`);
  } else {
    console.warn(`⚠️ 找不到 ${file}，請檢查套件是否安裝完整。`);
  }
});

