import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/pages/tools/ImageToVideo.tsx');
if (!fs.existsSync(target)) {
  console.error('ERROR: src/pages/tools/ImageToVideo.tsx not found');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve('backup/image-to-video-v1-1-stability');
fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(target, path.join(backupDir, `ImageToVideo.tsx.${stamp}.bak`));

let s = fs.readFileSync(target, 'utf8');
// Normalize line endings so Windows CRLF does not make exact patch matching fail.
s = s.replace(/\r\n/g, '\n');

const marker = `function makeFileName() {`;
if (!s.includes(marker)) {
  console.error('ERROR: makeFileName marker not found');
  process.exit(1);
}

if (!s.includes('async function loadBitmapForVideo(')) {
  const helper = `async function loadBitmapForVideo(\n  file: File,\n  maxWidth: number,\n  maxHeight: number,\n): Promise<ImageBitmap> {\n  const objectUrl = URL.createObjectURL(file);\n  try {\n    const image = new Image();\n    image.decoding = \"async\";\n    image.src = objectUrl;\n\n    await Promise.race([\n      new Promise<void>((resolve, reject) => {\n        image.onload = () => resolve();\n        image.onerror = () => reject(new Error(\`圖片「\${file.name}」無法讀取，請換 JPG／PNG／WebP。\`));\n      }),\n      new Promise<never>((_, reject) => {\n        window.setTimeout(\n          () => reject(new Error(\`圖片「\${file.name}」讀取超過 15 秒，可能檔案過大或格式異常。\`)),\n          15000,\n        );\n      }),\n    ]);\n\n    const naturalWidth = Math.max(1, image.naturalWidth);\n    const naturalHeight = Math.max(1, image.naturalHeight);\n    const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);\n    const width = Math.max(1, Math.round(naturalWidth * scale));\n    const height = Math.max(1, Math.round(naturalHeight * scale));\n\n    const workCanvas = document.createElement(\"canvas\");\n    workCanvas.width = width;\n    workCanvas.height = height;\n    const workCtx = workCanvas.getContext(\"2d\", { alpha: false });\n    if (!workCtx) throw new Error(\"無法建立圖片處理畫布\");\n    workCtx.fillStyle = \"#ffffff\";\n    workCtx.fillRect(0, 0, width, height);\n    workCtx.drawImage(image, 0, 0, width, height);\n\n    return await createImageBitmap(workCanvas);\n  } finally {\n    URL.revokeObjectURL(objectUrl);\n  }\n}\n\n`;
  s = s.replace(marker, helper + marker);
}

const oldLoop = `      for (let index = 0; index < imageFiles.length; index += 1) {\n        if (cancelledRef.current) throw new Error(\"已取消產生影片\");\n        bitmaps.push(await createImageBitmap(imageFiles[index]));\n        setProgress(Math.max(2, Math.round(((index + 1) / imageFiles.length) * 8)));\n      }`;

const newLoop = `      for (let index = 0; index < imageFiles.length; index += 1) {\n        if (cancelledRef.current) throw new Error(\"已取消產生影片\");\n        const file = imageFiles[index];\n        setStatus(\`正在讀取圖片 \${index + 1}/\${imageFiles.length}：\${file.name}\`);\n        const maxDecodeWidth = Math.max(1280, Math.round(outputDimensions.width * 1.35));\n        const maxDecodeHeight = Math.max(1280, Math.round(outputDimensions.height * 1.35));\n        const bitmap = await loadBitmapForVideo(file, maxDecodeWidth, maxDecodeHeight);\n        bitmaps.push(bitmap);\n        setProgress(2 + Math.round(((index + 1) / imageFiles.length) * 6));\n        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));\n      }`;

if (s.includes(oldLoop)) {
  s = s.replace(oldLoop, newLoop);
} else if (!s.includes('setStatus(`正在讀取圖片 ${index + 1}/${imageFiles.length}：${file.name}`)')) {
  console.error('ERROR: image loading loop not found; file left unchanged');
  process.exit(1);
}

s = s.replace('RXV 免費圖片轉 MP4 v1.0', 'RXV 免費圖片轉 MP4 v1.1');

fs.writeFileSync(target, s, 'utf8');
console.log('SUCCESS: v1.1 stability patch applied.');
console.log('Changes: safer image decoding, automatic downscale, 15-second per-image timeout, clearer progress.');
console.log('Next: npm run build');
