import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export async function generateShopeeVideo(
  imageFiles: File[],
  onProgressChange?: (stage: "idle" | "loading-ffmpeg" | "generating-video") => void
) {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("至少需要 1 張圖片");
  }

  console.log("generateShopeeVideo 開始，圖片數量:", imageFiles.length);
  
  // 使用本地核心文件（從 public/ffmpeg-core/ 載入）
  // Vite 會將 public 目錄中的文件直接 serve 到根路徑
  const baseURL = '/ffmpeg-core';
  const corePath = `${baseURL}/ffmpeg-core.js`;
  const wasmPath = `${baseURL}/ffmpeg-core.wasm`;
  
  console.log("🔧 FFmpeg 核心文件路徑配置:");
  console.log("  - corePath:", corePath);
  console.log("  - wasmPath:", wasmPath);
  
  const ffmpeg = new FFmpeg();
  
  // 啟用日誌
  try {
    (ffmpeg as any).log = true;
  } catch (e) {
    // 忽略錯誤
  }
  
  try {
    onProgressChange?.("loading-ffmpeg");
    console.log("開始加載 FFmpeg...");
    console.log("正在從本地載入 FFmpeg 核心文件...");
    
    await ffmpeg.load({
      coreURL: corePath,
      wasmURL: wasmPath,
      // 注意：新版本的 @ffmpeg/core 不再需要單獨的 worker 文件
    });
    
    console.log("✅ FFmpeg 成功載入（使用本地核心文件）！");
    
    onProgressChange?.("generating-video");
  } catch (err) {
    console.error("❌ FFmpeg 加載失敗:", err);
    throw new Error("無法載入影片處理引擎。請確認 FFmpeg 核心文件已正確複製到 public/ffmpeg-core/ 目錄。");
  }

  // 取前三張圖
  const selected = imageFiles.slice(0, 3);

  // 寫入 FFmpeg 暫存檔
  try {
    console.log("開始寫入圖片檔案...");
    for (let i = 0; i < selected.length; i++) {
      console.log(`寫入圖片 ${i + 1}/${selected.length}...`);
      const fileData = await fetchFile(selected[i]);
      await ffmpeg.writeFile(`img${i}.jpg`, fileData);
    }
    console.log("所有圖片寫入完成");
  } catch (error) {
    console.error('圖片寫入失敗:', error);
    throw new Error('無法讀取圖片檔案');
  }

  // 生成 input.txt（淡入淡出效果＋每張 3 秒）
  const inputText =
    selected
      .map(
        (_, i) =>
          `file img${i}.jpg\n` +
          `duration 2.5\n`
      )
      .join("") + `file img${selected.length - 1}.jpg`;

  console.log("寫入 input.txt:", inputText);
  await ffmpeg.writeFile("input.txt", inputText);
  console.log("input.txt 寫入完成");

  // 輸出 mp4
  try {
    console.log("開始執行 FFmpeg 命令生成影片...");
    const command = [
      "-f", "concat",
      "-safe", "0",
      "-i", "input.txt",
      "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
      "-r", "30",
      "-pix_fmt", "yuv420p",
      "output.mp4"
    ];
    console.log("FFmpeg 命令:", command.join(" "));
    
    await ffmpeg.exec(command);
    console.log("FFmpeg 命令執行完成");
  } catch (error: any) {
    console.error('影片生成失敗:', error);
    const errorMsg = error?.message || String(error);
    throw new Error(`影片處理失敗: ${errorMsg}`);
  }

  try {
    console.log("開始讀取生成的影片檔案...");
    const data = await ffmpeg.readFile("output.mp4");
    console.log("影片檔案讀取成功，大小:", data.length, "bytes");
    const blob = new Blob([data], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    console.log("影片 URL 創建成功:", url);
    return url;
  } catch (error) {
    console.error('讀取輸出檔案失敗:', error);
    throw new Error('無法讀取生成的影片');
  }
}

