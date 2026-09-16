import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PAGE_FILE = path.join(ROOT, "src", "pages", "tools", "ImageToVideo.tsx");
const LOCAL_LOCK_FILE = path.join(ROOT, "src", "lib", "isLocalDevelopment.ts");
const APP_FILE = path.join(ROOT, "src", "App.tsx");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(ROOT, "backup", "browser-local-image-to-mp4-v1", stamp);

await fs.mkdir(backupDir, { recursive: true });

for (const file of [PAGE_FILE, LOCAL_LOCK_FILE, APP_FILE]) {
  try {
    await fs.copyFile(file, path.join(backupDir, path.basename(file)));
  } catch (error) {
    console.error("備份失敗：", file, error?.message || error);
    process.exit(1);
  }
}

const page = String.raw`import { useEffect, useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import SEO from "@/components/SEO";

type RatioValue = "9:16" | "16:9" | "1:1" | "4:5";
type DurationValue = 10 | 15 | 30;

type RatioOption = {
  value: RatioValue;
  label: string;
  width: number;
  height: number;
};

const MAX_IMAGES = 12;
const MAX_AUDIO_MB = 25;
const FPS = 24;
const FFMPEG_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

const ratioOptions: RatioOption[] = [
  { value: "9:16", label: "直式 9:16｜Shorts / Reels", width: 720, height: 1280 },
  { value: "16:9", label: "橫式 16:9｜YouTube", width: 1280, height: 720 },
  { value: "1:1", label: "方形 1:1｜商品 / 貼文", width: 720, height: 720 },
  { value: "4:5", label: "直式 4:5｜IG 貼文", width: 720, height: 900 },
];

function getRatio(value: RatioValue) {
  return ratioOptions.find((item) => item.value === value) || ratioOptions[0];
}

function pickRecorderMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((value) => MediaRecorder.isTypeSupported(value)) || "";
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  scaleBoost = 1,
) {
  const baseScale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const scale = baseScale * scaleBoost;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;
  ctx.drawImage(image, x, y, width, height);
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export default function ImageToVideo() {
  const [images, setImages] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [ratio, setRatio] = useState<RatioValue>("9:16");
  const [duration, setDuration] = useState<DurationValue>(15);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("等待開始");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const previewUrls = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  async function ensureFfmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current;

    setStage("第一次使用：載入本機轉檔引擎…");
    setProgress(5);

    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: value }) => {
      const safe = Math.max(0, Math.min(1, Number(value) || 0));
      setProgress(72 + Math.round(safe * 27));
    });

    const coreURL = await toBlobURL(
      FFMPEG_CORE_BASE + "/ffmpeg-core.js",
      "text/javascript",
    );
    const wasmURL = await toBlobURL(
      FFMPEG_CORE_BASE + "/ffmpeg-core.wasm",
      "application/wasm",
    );

    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  function handleImages(fileList: FileList | null) {
    const selected = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    setError("");
    setResultUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });

    if (!selected.length) {
      setImages([]);
      return;
    }

    if (selected.length > MAX_IMAGES) {
      setError("第一版最多選 " + MAX_IMAGES + " 張圖片，已自動保留前 " + MAX_IMAGES + " 張。");
    }
    setImages(selected.slice(0, MAX_IMAGES));
  }

  function handleAudio(file: File | null) {
    setError("");
    if (!file) {
      setAudioFile(null);
      return;
    }
    if (!file.type.startsWith("audio/")) {
      setError("請選擇 MP3、M4A、WAV 等音訊檔。");
      return;
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      setError("第一版背景音樂請控制在 " + MAX_AUDIO_MB + " MB 以內。");
      return;
    }
    setAudioFile(file);
  }

  async function makeMp4() {
    if (!images.length || busy) return;

    setBusy(true);
    setError("");
    setProgress(1);
    setResultSize(0);
    setResultUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });

    let bitmaps: ImageBitmap[] = [];
    let audioContext: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;

    try {
      if (typeof MediaRecorder === "undefined") {
        throw new Error("此瀏覽器不支援本機影片錄製，請改用最新版 Chrome 或 Edge。");
      }

      const ffmpeg = await ensureFfmpeg();
      setStage("讀取圖片…");
      setProgress(12);

      bitmaps = await Promise.all(images.map((file) => createImageBitmap(file)));

      const selectedRatio = getRatio(ratio);
      const canvas = document.createElement("canvas");
      canvas.width = selectedRatio.width;
      canvas.height = selectedRatio.height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("無法建立瀏覽器畫布。");

      const canvasStream = canvas.captureStream(FPS);
      const mixedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach((track) => mixedStream.addTrack(track));

      if (audioFile) {
        setStage("讀取背景音樂…");
        audioContext = new AudioContext();
        await audioContext.resume();
        const audioBuffer = await audioContext.decodeAudioData(await audioFile.arrayBuffer());
        const destination = audioContext.createMediaStreamDestination();
        const gain = audioContext.createGain();
        gain.gain.value = 0.75;
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.loop = true;
        audioSource.connect(gain);
        gain.connect(destination);
        destination.stream.getAudioTracks().forEach((track) => mixedStream.addTrack(track));
      }

      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(
        mixedStream,
        mimeType
          ? { mimeType, videoBitsPerSecond: 4_000_000 }
          : { videoBitsPerSecond: 4_000_000 },
      );
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      };

      setStage("瀏覽器正在本機製作影片…");
      setProgress(18);

      const totalMs = duration * 1000;
      const eachMs = totalMs / bitmaps.length;
      const fadeMs = Math.min(500, eachMs * 0.2);

      await new Promise<void>((resolve, reject) => {
        recorder.onerror = () => reject(new Error("瀏覽器錄製影片失敗。"));
        recorder.onstop = () => resolve();
        recorder.start(500);
        if (audioSource) audioSource.start(0);

        const startedAt = performance.now();

        const render = (now: number) => {
          const elapsed = now - startedAt;
          const capped = Math.min(elapsed, totalMs - 1);
          const rawIndex = Math.floor(capped / eachMs);
          const index = Math.min(rawIndex, bitmaps.length - 1);
          const localMs = capped - index * eachMs;
          const localProgress = Math.max(0, Math.min(1, localMs / eachMs));
          const zoom = 1 + localProgress * 0.055;

          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
          const current = bitmaps[index];
          drawCover(
            ctx,
            current,
            current.width,
            current.height,
            canvas.width,
            canvas.height,
            zoom,
          );

          const nextIndex = index + 1;
          if (nextIndex < bitmaps.length && localMs > eachMs - fadeMs) {
            const alpha = (localMs - (eachMs - fadeMs)) / fadeMs;
            const next = bitmaps[nextIndex];
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            drawCover(
              ctx,
              next,
              next.width,
              next.height,
              canvas.width,
              canvas.height,
              1,
            );
            ctx.globalAlpha = 1;
          }

          setProgress(18 + Math.round((elapsed / totalMs) * 48));

          if (elapsed < totalMs) {
            requestAnimationFrame(render);
          } else {
            try {
              if (audioSource) audioSource.stop();
            } catch {}
            recorder.stop();
          }
        };

        requestAnimationFrame(render);
      });

      const webmBlob = new Blob(chunks, { type: mimeType || "video/webm" });
      if (!webmBlob.size) throw new Error("影片暫存檔建立失敗。");

      setStage("轉成 MP4…");
      setProgress(70);

      try {
        await ffmpeg.deleteFile("rxv-input.webm");
      } catch {}
      try {
        await ffmpeg.deleteFile("rxv-output.mp4");
      } catch {}

      await ffmpeg.writeFile("rxv-input.webm", await fetchFile(webmBlob));
      await ffmpeg.exec([
        "-i",
        "rxv-input.webm",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-shortest",
        "rxv-output.mp4",
      ]);

      const output = await ffmpeg.readFile("rxv-output.mp4");
      if (typeof output === "string") throw new Error("MP4 輸出格式異常。");
      const buffer = output.buffer.slice(
        output.byteOffset,
        output.byteOffset + output.byteLength,
      ) as ArrayBuffer;
      const mp4Blob = new Blob([buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(mp4Blob);
      setResultUrl(url);
      setResultSize(mp4Blob.size);
      setProgress(100);
      setStage("完成，可直接下載 MP4");

      try {
        await ffmpeg.deleteFile("rxv-input.webm");
        await ffmpeg.deleteFile("rxv-output.mp4");
      } catch {}
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "產生 MP4 失敗。");
      setStage("產生失敗");
      setProgress(0);
    } finally {
      bitmaps.forEach((bitmap) => bitmap.close());
      if (audioContext) {
        try {
          await audioContext.close();
        } catch {}
      }
      setBusy(false);
    }
  }

  const selectedRatio = getRatio(ratio);

  return (
    <>
      <SEO
        title="免費圖片轉 MP4｜本機處理、不上傳圖片 - RXV"
        description="免費圖片轉 MP4 工具。圖片與音樂只在你的瀏覽器本機處理，不上傳伺服器，可選 9:16、16:9、1:1、4:5 與 10/15/30 秒影片。"
        keywords="圖片轉MP4,圖片轉影片,免費影片工具,本機影片製作,圖片輪播影片"
        path="/tools/image-to-video"
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              第一版｜純瀏覽器本機處理
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              圖片轉 MP4
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              圖片、MP3 與產出的影片都只在你的裝置處理，不上傳 RXV 伺服器，不需要安裝程式。
            </p>
            <div className="mt-3 rounded-2xl bg-sky-50 p-3 text-xs leading-6 text-sky-800">
              第一次產片會下載 FFmpeg 瀏覽器轉檔引擎；你的圖片與音訊不會傳到該下載來源。第一版採 720p 與最長 30 秒，優先確保一般電腦與手機穩定。
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-black text-slate-900">1. 選圖片</h2>
                    <p className="mt-1 text-xs text-slate-500">1～12 張 JPG / PNG / WebP</p>
                  </div>
                  <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
                    選擇圖片
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={busy}
                      onChange={(event) => handleImages(event.target.files)}
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                        <img src={url} alt={"圖片 " + (index + 1)} className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <h2 className="font-black text-slate-900">2. 設定影片</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">
                    影片比例
                    <select
                      value={ratio}
                      disabled={busy}
                      onChange={(event) => setRatio(event.target.value as RatioValue)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
                    >
                      {ratioOptions.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-bold text-slate-700">
                    影片長度
                    <select
                      value={duration}
                      disabled={busy}
                      onChange={(event) => setDuration(Number(event.target.value) as DurationValue)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
                    >
                      <option value={10}>10 秒</option>
                      <option value={15}>15 秒</option>
                      <option value={30}>30 秒</option>
                    </select>
                  </label>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  第一版固定 720p：{selectedRatio.width} × {selectedRatio.height}，圖片會自動平均輪播、淡入淡出並輕微縮放。
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-black text-slate-900">3. 背景音樂（可不選）</h2>
                    <p className="mt-1 text-xs text-slate-500">MP3 / M4A / WAV，最多 {MAX_AUDIO_MB} MB</p>
                  </div>
                  <label className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    選 MP3
                    <input
                      className="hidden"
                      type="file"
                      accept="audio/*,.mp3,.m4a,.wav"
                      disabled={busy}
                      onChange={(event) => handleAudio(event.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                {audioFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <span className="truncate">{audioFile.name}</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setAudioFile(null)}
                      className="shrink-0 font-bold text-rose-600"
                    >
                      移除
                    </button>
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                <h2 className="font-black text-slate-900">4. 產生 MP4</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  產片會使用你的裝置 CPU / 記憶體。10 秒影片至少需要等待約 10 秒，再加上 MP4 轉檔時間。
                </p>

                <button
                  type="button"
                  disabled={!images.length || busy}
                  onClick={makeMp4}
                  className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-4 text-base font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? "正在本機產生影片…" : "開始產生 MP4"}
                </button>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs font-bold text-slate-600">
                    <span>{stage}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: progress + "%" }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
                    {error}
                  </div>
                )}
              </section>

              {resultUrl && (
                <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
                  <h2 className="font-black text-slate-900">影片完成</h2>
                  <video src={resultUrl} controls playsInline className="mt-4 max-h-[520px] w-full rounded-xl bg-black" />
                  <div className="mt-3 text-xs text-slate-600">
                    MP4 大小：約 {formatBytes(resultSize)}
                  </div>
                  <a
                    href={resultUrl}
                    download={"RXV-圖片轉影片-" + ratio.replace(":", "x") + "-" + duration + "秒.mp4"}
                    className="mt-4 block w-full rounded-2xl bg-blue-600 px-5 py-4 text-center text-base font-black text-white hover:bg-blue-700"
                  >
                    下載 MP4 到我的裝置
                  </a>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 p-4 text-xs leading-6 text-slate-600">
                <div className="font-black text-slate-900">隱私與成本設計</div>
                <p className="mt-2">• 圖片與音訊不會上傳 RXV 後端。</p>
                <p>• 影片不存 Supabase、R2 或 Vercel。</p>
                <p>• 不呼叫付費 AI API。</p>
                <p>• 關閉頁面後，本次選取檔案與影片物件會由瀏覽器釋放。</p>
                <p>• 建議優先使用最新版 Chrome 或 Edge。</p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
`;

await fs.writeFile(PAGE_FILE, page, "utf8");

async function removePublicBlock(file) {
  let text = await fs.readFile(file, "utf8");
  const before = text;
  text = text.replace(/^[\t ]*["']\/tools\/image-to-video["'],\r?\n/gm, "");
  if (text !== before) {
    await fs.writeFile(file, text, "utf8");
    console.log("已解除正式站封鎖：", path.relative(ROOT, file));
  } else {
    console.log("未找到封鎖行或已解除：", path.relative(ROOT, file));
  }
}

await removePublicBlock(LOCAL_LOCK_FILE);
await removePublicBlock(APP_FILE);

console.log("");
console.log("SUCCESS: RXV 圖片轉 MP4 第一版本機版已套用。");
console.log("功能：1～12 張圖片、9:16/16:9/1:1/4:5、10/15/30 秒、本機音樂、MP4 下載。");
console.log("資料：圖片、音訊、影片不送 RXV 後端，不存 Supabase/R2/Vercel，不使用付費 AI API。");
console.log("備份：" + backupDir);
console.log("下一步：npm run build");
