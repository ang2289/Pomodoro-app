import fs from "fs";
import path from "path";
import { loadCSV } from "./csv-loader";
import { buildVideoTask } from "./video-builder";

interface BatchOptions {
  csvPath: string;
  outputRoot: string;
  limit?: number;        // ex: 100、200、500
  bgm?: string;
  resolution?: { w: number; h: number };
  style?: string;
}

/**
 * 批次執行主程式
 */
export async function generateBatchVideos(opts: BatchOptions) {
  const { csvPath, outputRoot, limit, bgm, resolution, style } = opts;

  // 1. 讀取 CSV
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  // 在 Node.js 環境中，將字串轉換為 File 物件
  const csvBlob = new Blob([csvContent], { type: "text/csv" });
  const csvFile = new File([csvBlob], path.basename(csvPath), { type: "text/csv" });
  
  const { items } = await loadCSV(csvFile);
  const tasks = limit ? items.slice(0, limit) : items;

  if (!fs.existsSync(outputRoot)) fs.mkdirSync(outputRoot, { recursive: true });

  // 2. 批次處理
  const ffmpegCommands: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const product = tasks[i];
    const folder = path.join(outputRoot, `${String(i + 1).padStart(3, "0")}`);

    console.log(`▶ 建立影片素材：#${i + 1} ${product.title}`);

    const result = await buildVideoTask({
      product,
      style: style ?? "default",
      outputDir: folder,
      bgm,
      resolution: resolution ?? { w: 1080, h: 1920 }
    });

    ffmpegCommands.push(result.ffmpeg);
  }

  // 3. 輸出批次執行檔（Windows + Mac 兩種）
  fs.writeFileSync(
    path.join(outputRoot, "run-all.sh"),
    ffmpegCommands.join("\n")
  );

  fs.writeFileSync(
    path.join(outputRoot, "run-all.bat"),
    ffmpegCommands.map((cmd) => cmd.replace(/\//g, "\\")).join("\n")
  );

  console.log(`\n🎉 批次素材建立完成！`);
  console.log(`📌 Windows：執行 ${outputRoot}/run-all.bat`);
  console.log(`📌 Mac/Linux：執行 chmod +x run-all.sh && ./run-all.sh`);
}

