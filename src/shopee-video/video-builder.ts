import fs from "fs";
import path from "path";
import { generateScript } from "./script-generator";
import { ProductItem } from "./csv-loader";
import { createSubtitleCard } from "./subtitle-card";

export interface VideoTaskInput {
  product: ProductItem;
  style?: string;
  outputDir: string;
  bgImages?: string[];      // 動態背景庫
  bgm?: string;             // BGM 音樂檔
  resolution?: {
    w: number;
    h: number;
  };
}

/**
 * Step 1：把腳本拆行成「字幕段落」
 */
function splitToSegments(script: string): string[] {
  return script
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Step 2：生成字幕卡（文字 → PNG）
 * 使用 Canvas 生成真正的字幕卡圖片
 */
export async function createSubtitleImage(
  text: string,
  index: number,
  outDir: string,
  iconPath?: string
) {
  const filename = `subtitle_${index}.png`;
  const filepath = path.join(outDir, filename);

  // 使用 createSubtitleCard 生成真正的字幕卡
  await createSubtitleCard({
    text,
    output: filepath,
    width: 1080,
    height: 360,
    iconPath,
  });

  return filepath;
}

/**
 * Step 3：組合 FFmpeg 指令（不包含渲染）
 * -> 你未來能丟給本機 / API 做渲染
 */
function buildFFmpegCommand(
  images: string[],
  bgm: string | undefined,
  output: string,
  resolution: { w: number; h: number }
) {
  const listFile = "images.txt";

  // 產生 FFmpeg 所需 list
  fs.writeFileSync(
    listFile,
    images.map((i) => `file '${i}'\nduration 1.8`).join("\n")
  );

  const base = [
    `ffmpeg -y -f concat -safe 0 -i ${listFile}`,
    `-vf "scale=${resolution.w}:${resolution.h}:force_original_aspect_ratio=decrease"`,
  ];

  if (bgm) {
    base.push(`-i ${bgm} -shortest -filter_complex "[1:a]volume=0.5[aout]" -map 0:v -map "[aout]"`);
  }

  base.push(output);

  return base.join(" ");
}

/**
 * Step 4：影片任務主流程（不執行 FFmpeg，只生成必要素材＋指令）
 */
export async function buildVideoTask(input: VideoTaskInput) {
  const { product, style, outputDir, resolution, bgm } = input;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // A. 取得腳本
  const scriptObj = generateScript(product, style as any);
  const lines = splitToSegments(scriptObj.lines);

  // B. 生成字幕卡
  const subtitleImages: string[] = [];
  const iconPath = "./assets/icons/rxv-baby.png"; // 可選的 icon 路徑
  for (let i = 0; i < lines.length; i++) {
    const img = await createSubtitleImage(lines[i], i, outputDir, iconPath);
    subtitleImages.push(img);
  }

  // C. 生成 FFmpeg 命令
  const ffmpegCmd = buildFFmpegCommand(
    subtitleImages,
    bgm,
    path.join(outputDir, "video.mp4"),
    resolution ?? { w: 1080, h: 1920 }
  );

  return {
    script: scriptObj.lines,
    images: subtitleImages,
    ffmpeg: ffmpegCmd,
  };
}

