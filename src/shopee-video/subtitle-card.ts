import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 在 ES modules 中獲取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 註冊字體（如果存在）
const fontPath = path.join(__dirname, "../assets/fonts/NotoSansTC-Bold.otf");
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, {
    family: "NotoSansTC",
  });
}

interface SubtitleCardOptions {
  text: string;
  output: string;
  width?: number;
  height?: number;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  iconPath?: string; // 雙胞胎角色
}

/**
 * 建立字幕卡（PNG）
 */
export async function createSubtitleCard(opts: SubtitleCardOptions) {
  const width = opts.width ?? 1080;
  const height = opts.height ?? 360;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 背景透明
  ctx.clearRect(0, 0, width, height);

  // 卡片參數
  const radius = opts.radius ?? 32;

  // 卡片背景
  ctx.beginPath();
  roundRect(
    ctx,
    40,
    40,
    width - 80,
    height - 80,
    radius
  );
  ctx.fillStyle = opts.bgColor ?? "#FFFFFFEE";
  ctx.fill();

  // 卡片邊框
  ctx.lineWidth = opts.borderWidth ?? 4;
  ctx.strokeStyle = opts.borderColor ?? "#FF80A8";
  ctx.stroke();

  // 處理文字
  ctx.font = "bold 58px NotoSansTC";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";

  const lines = wrapText(ctx, opts.text, width - 160);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 130 + i * 70);
  });

  // 插入icon（可選）
  if (opts.iconPath && fs.existsSync(opts.iconPath)) {
    const img = await loadImage(opts.iconPath);
    ctx.drawImage(img, 60, height - 200, 140, 140);
  }

  // 輸出 PNG
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(opts.output, buffer);
}

/** 圓角矩形 */
function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

/** 自動換行 */
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split("");
  let line = "";
  const lines: string[] = [];

  for (let w of words) {
    const test = line + w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}

