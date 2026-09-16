import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import SEO from "@/components/SEO";

type RatioValue = "9:16" | "16:9" | "4:5" | "1:1";
type TemplateValue = "clean" | "fade" | "zoom" | "product";
type DurationValue = 10 | 15 | 30;
type FitValue = "auto" | "contain" | "cover";
type ResolutionValue = "720p" | "1080p";
type VolumeValue = 0.2 | 0.4 | 0.6;

type RecorderChoice = {
  mimeType: string;
  extension: "mp4" | "webm";
  label: string;
};

type RatioOption = {
  value: RatioValue;
  label: string;
  hint: string;
  sizes: Record<ResolutionValue, { width: number; height: number }>;
};

const MAX_IMAGES = 12;
const MAX_IMAGE_MB = 25;
const MAX_AUDIO_MB = 25;
const FPS = 24;
const FFMPEG_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

const ratioOptions: RatioOption[] = [
  {
    value: "9:16",
    label: "短影音直式 9:16",
    hint: "TikTok／Shorts／Reels",
    sizes: {
      "720p": { width: 720, height: 1280 },
      "1080p": { width: 1080, height: 1920 },
    },
  },
  {
    value: "16:9",
    label: "YouTube 橫式 16:9",
    hint: "一般橫式影片",
    sizes: {
      "720p": { width: 1280, height: 720 },
      "1080p": { width: 1920, height: 1080 },
    },
  },
  {
    value: "4:5",
    label: "IG 貼文 4:5",
    hint: "直式社群貼文",
    sizes: {
      "720p": { width: 720, height: 900 },
      "1080p": { width: 1080, height: 1350 },
    },
  },
  {
    value: "1:1",
    label: "方形 1:1",
    hint: "商品／社群方形",
    sizes: {
      "720p": { width: 720, height: 720 },
      "1080p": { width: 1080, height: 1080 },
    },
  },
];

const templateOptions: Array<{ value: TemplateValue; label: string; hint: string }> = [
  { value: "clean", label: "簡潔輪播", hint: "穩定、清楚、最快" },
  { value: "fade", label: "淡入轉場", hint: "圖片之間柔和切換" },
  { value: "zoom", label: "平穩縮放", hint: "每張圖片輕微放大" },
  { value: "product", label: "商品展示", hint: "完整顯示、乾淨白底" },
];

const fitOptions: Array<{ value: FitValue; label: string }> = [
  { value: "auto", label: "自動判斷（建議）" },
  { value: "contain", label: "完整顯示圖片" },
  { value: "cover", label: "裁切滿版" },
];

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getRecorderChoice(): RecorderChoice | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null;
  const candidates: RecorderChoice[] = [
    {
      mimeType: "video/mp4;codecs=avc1.42E01E",
      extension: "mp4",
      label: "快速模式：瀏覽器直接產生 MP4",
    },
    {
      mimeType: "video/mp4",
      extension: "mp4",
      label: "快速模式：瀏覽器直接產生 MP4",
    },
    {
      mimeType: "video/webm;codecs=vp9,opus",
      extension: "webm",
      label: "相容模式：先本機錄製，再本機轉 MP4",
    },
    {
      mimeType: "video/webm;codecs=vp8,opus",
      extension: "webm",
      label: "相容模式：先本機錄製，再本機轉 MP4",
    },
    {
      mimeType: "video/webm",
      extension: "webm",
      label: "相容模式：先本機錄製，再本機轉 MP4",
    },
  ];

  for (const item of candidates) {
    if (MediaRecorder.isTypeSupported(item.mimeType)) return item;
  }
  return null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  width: number,
  height: number,
  zoom = 1,
) {
  const scale = Math.max(width / imageWidth, height / imageHeight) * zoom;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  width: number,
  height: number,
  zoom = 1,
  paddingRatio = 0.03,
) {
  const maxWidth = width * (1 - paddingRatio * 2);
  const maxHeight = height * (1 - paddingRatio * 2);
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight) * zoom;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawAuto(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  width: number,
  height: number,
  zoom = 1,
) {
  const imageRatio = imageWidth / imageHeight;
  const outputRatio = width / height;
  const difference = Math.abs(imageRatio / outputRatio - 1);

  if (difference <= 0.14) {
    drawCover(ctx, image, imageWidth, imageHeight, width, height, zoom);
    return;
  }

  ctx.save();
  ctx.filter = "blur(30px) brightness(0.55) saturate(0.85)";
  ctx.globalAlpha = 0.92;
  drawCover(ctx, image, imageWidth, imageHeight, width, height, 1.12);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = Math.max(12, width * 0.025);
  drawContain(ctx, image, imageWidth, imageHeight, width, height, zoom, 0.045);
  ctx.restore();
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  width: number,
  height: number,
  fit: FitValue,
  template: TemplateValue,
  zoom = 1,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  if (template === "product") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.shadowColor = "rgba(15,23,42,0.18)";
    ctx.shadowBlur = Math.max(12, width * 0.02);
    drawContain(ctx, image, image.width, image.height, width, height, zoom, 0.055);
    ctx.restore();
    return;
  }

  if (fit === "cover") {
    drawCover(ctx, image, image.width, image.height, width, height, zoom);
  } else if (fit === "contain") {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    drawContain(ctx, image, image.width, image.height, width, height, zoom, 0.025);
  } else {
    drawAuto(ctx, image, image.width, image.height, width, height, zoom);
  }

  ctx.restore();
}

function makeFileName() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `RXV-image-to-mp4-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.mp4`;
}

export default function ImageToVideo() {
  const [ratio, setRatio] = useState<RatioValue>("9:16");
  const [template, setTemplate] = useState<TemplateValue>("fade");
  const [duration, setDuration] = useState<DurationValue>(10);
  const [fit, setFit] = useState<FitValue>("auto");
  const [resolution, setResolution] = useState<ResolutionValue>("720p");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [volume, setVolume] = useState<VolumeValue>(0.4);
  const [audioFade, setAudioFade] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("請先選擇圖片");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [outputSize, setOutputSize] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadedRef = useRef(false);
  const cancelledRef = useRef(false);

  const recorderChoice = useMemo(() => getRecorderChoice(), []);
  const currentRatio = useMemo(
    () => ratioOptions.find((item) => item.value === ratio) ?? ratioOptions[0],
    [ratio],
  );
  const outputDimensions = currentRatio.sizes[resolution];

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  function onSelectImages(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setDownloadUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });
    setOutputSize(0);

    const selected = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!selected.length) {
      setImageFiles([]);
      setStatus("請選擇 JPG、PNG 或 WebP 圖片");
      return;
    }

    if (selected.length > MAX_IMAGES) {
      setError(`第一版最多 ${MAX_IMAGES} 張圖片，已自動取前 ${MAX_IMAGES} 張。`);
    }

    const trimmed = selected.slice(0, MAX_IMAGES);
    const oversized = trimmed.find((file) => file.size > MAX_IMAGE_MB * 1024 * 1024);
    if (oversized) {
      setError(`圖片「${oversized.name}」超過 ${MAX_IMAGE_MB} MB，請換較小的圖片。`);
      event.target.value = "";
      return;
    }

    setImageFiles(trimmed);
    setStatus(`已選 ${trimmed.length} 張圖片，可以開始產生影片`);
  }

  function onSelectAudio(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setAudioFile(null);
      return;
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      setError(`MP3 第一版上限 ${MAX_AUDIO_MB} MB。`);
      event.target.value = "";
      setAudioFile(null);
      return;
    }
    setAudioFile(file);
  }

  async function ensureFFmpeg() {
    if (ffmpegLoadedRef.current && ffmpegRef.current) return ffmpegRef.current;

    setStatus("第一次載入本機 MP4 相容轉檔核心，請稍候…");
    const ffmpeg = ffmpegRef.current ?? new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on("progress", ({ progress: value }) => {
      if (!Number.isFinite(value)) return;
      setProgress(88 + Math.max(0, Math.min(11, Math.round(value * 11))));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegLoadedRef.current = true;
    return ffmpeg;
  }

  async function convertWebmToMp4(webmBlob: Blob) {
    const ffmpeg = await ensureFFmpeg();
    setStatus("相容模式：正在您的裝置內轉成 MP4…");
    setProgress(88);

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
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      resolution === "1080p" ? "26" : "28",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "rxv-output.mp4",
    ]);

    const data = await ffmpeg.readFile("rxv-output.mp4");
    if (typeof data === "string") throw new Error("MP4 轉檔結果格式不正確");
    return new Blob([new Uint8Array(data)], { type: "video/mp4" });
  }

  async function generateMp4() {
    setError("");
    if (isGenerating) return;
    if (!imageFiles.length) {
      setError("請先選擇至少 1 張圖片。")
      return;
    }
    if (!recorderChoice) {
      setError("目前瀏覽器不支援本機影片錄製，請改用最新版 Chrome 或 Edge。")
      return;
    }
    if (!canvasRef.current || typeof canvasRef.current.captureStream !== "function") {
      setError("目前瀏覽器不支援 Canvas 影片輸出，請改用最新版 Chrome 或 Edge。")
      return;
    }

    cancelledRef.current = false;
    setIsGenerating(true);
    setProgress(1);
    setStatus("正在讀取本機圖片…");
    setDownloadUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });
    setOutputSize(0);

    const bitmaps: ImageBitmap[] = [];
    let audioContext: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;
    let rafId = 0;
    let recorder: MediaRecorder | null = null;
    let mediaStream: MediaStream | null = null;

    try {
      for (let index = 0; index < imageFiles.length; index += 1) {
        if (cancelledRef.current) throw new Error("已取消產生影片");
        bitmaps.push(await createImageBitmap(imageFiles[index]));
        setProgress(Math.max(2, Math.round(((index + 1) / imageFiles.length) * 8)));
      }

      const canvas = canvasRef.current;
      canvas.width = outputDimensions.width;
      canvas.height = outputDimensions.height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("無法建立影片畫布");

      const canvasStream = canvas.captureStream(FPS);
      const audioTracks: MediaStreamTrack[] = [];

      if (audioFile) {
        setStatus("正在讀取本機 MP3…");
        const AudioContextClass =
          window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) throw new Error("目前瀏覽器不支援本機音訊處理");

        audioContext = new AudioContextClass();
        await audioContext.resume();
        const audioBuffer = await audioContext.decodeAudioData(await audioFile.arrayBuffer());
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.loop = true;

        const gain = audioContext.createGain();
        const destination = audioContext.createMediaStreamDestination();
        audioSource.connect(gain);
        gain.connect(destination);

        const now = audioContext.currentTime;
        const fadeSeconds = Math.min(0.8, duration / 4);
        gain.gain.cancelScheduledValues(now);
        if (audioFade) {
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume, now + fadeSeconds);
          gain.gain.setValueAtTime(volume, now + Math.max(fadeSeconds, duration - fadeSeconds));
          gain.gain.linearRampToValueAtTime(0, now + duration);
        } else {
          gain.gain.setValueAtTime(volume, now);
        }
        audioTracks.push(...destination.stream.getAudioTracks());
      }

      mediaStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ]);

      const chunks: Blob[] = [];
      recorder = new MediaRecorder(mediaStream, {
        mimeType: recorderChoice.mimeType,
        videoBitsPerSecond: resolution === "1080p" ? 8_000_000 : 4_000_000,
        audioBitsPerSecond: 128_000,
      });

      const stopped = new Promise<Blob>((resolve, reject) => {
        if (!recorder) {
          reject(new Error("影片錄製器建立失敗"));
          return;
        }
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => reject(new Error("瀏覽器影片錄製失敗"));
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: recorderChoice.mimeType }));
        };
      });

      setStatus("正在您的裝置內產生影片…");
      setProgress(10);
      recorder.start(500);
      audioSource?.start();

      const startedAt = performance.now();
      const slotSeconds = duration / bitmaps.length;
      let lastUiUpdate = 0;

      await new Promise<void>((resolve) => {
        const render = (now: number) => {
          const elapsed = Math.min(duration, (now - startedAt) / 1000);
          const rawIndex = Math.floor(elapsed / slotSeconds);
          const index = Math.min(bitmaps.length - 1, rawIndex);
          const localTime = Math.max(0, elapsed - index * slotSeconds);
          const localProgress = Math.min(1, localTime / slotSeconds);
          const nextIndex = Math.min(bitmaps.length - 1, index + 1);

          ctx.fillStyle = template === "product" ? "#ffffff" : "#0f172a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (template === "fade" && nextIndex !== index && localProgress >= 0.74) {
            const mix = Math.min(1, (localProgress - 0.74) / 0.26);
            drawImage(ctx, bitmaps[index], canvas.width, canvas.height, fit, template, 1, 1 - mix);
            drawImage(ctx, bitmaps[nextIndex], canvas.width, canvas.height, fit, template, 1, mix);
          } else {
            const zoom =
              template === "zoom"
                ? 1 + localProgress * 0.065
                : template === "product"
                  ? 1 + localProgress * 0.025
                  : 1;
            drawImage(ctx, bitmaps[index], canvas.width, canvas.height, fit, template, zoom, 1);
          }

          if (now - lastUiUpdate > 120) {
            lastUiUpdate = now;
            setProgress(10 + Math.round((elapsed / duration) * 76));
          }

          if (cancelledRef.current || elapsed >= duration) {
            resolve();
            return;
          }
          rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);
      });

      if (recorder.state !== "inactive") recorder.stop();
      const recordedBlob = await stopped;
      if (cancelledRef.current) throw new Error("已取消產生影片");

      setProgress(87);
      let finalBlob: Blob;
      if (recorderChoice.extension === "mp4") {
        finalBlob = new Blob([recordedBlob], { type: "video/mp4" });
      } else {
        finalBlob = await convertWebmToMp4(recordedBlob);
      }

      if (cancelledRef.current) throw new Error("已取消產生影片");
      const url = URL.createObjectURL(finalBlob);
      const fileName = makeFileName();
      setDownloadUrl(url);
      setDownloadName(fileName);
      setOutputSize(finalBlob.size);
      setProgress(100);
      setStatus("完成！影片只存在您的裝置，請下載 MP4。")
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      if (message.includes("已取消")) {
        setStatus("已取消，不會留下任何上傳檔案。")
      } else {
        console.error(cause);
        setError(`產生失敗：${message}`);
        setStatus("產生失敗，請依錯誤訊息重試。")
      }
    } finally {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        if (recorder && recorder.state !== "inactive") recorder.stop();
      } catch {}
      try {
        audioSource?.stop();
      } catch {}
      try {
        await audioContext?.close();
      } catch {}
      mediaStream?.getTracks().forEach((track) => track.stop());
      bitmaps.forEach((bitmap) => bitmap.close());
      setIsGenerating(false);
    }
  }

  function cancelGeneration() {
    cancelledRef.current = true;
    setStatus("正在取消…");
  }

  function removeImage(index: number) {
    if (isGenerating) return;
    setImageFiles((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <>
      <SEO
        title="免費圖片轉 MP4｜純本機處理、不上傳圖片 - RXV"
        description="免費圖片轉 MP4 工具。圖片、MP3 與影片皆在您的瀏覽器裝置內處理，不上傳素材，不需安裝軟體。"
        keywords="圖片轉MP4,圖片轉影片,免費圖片轉影片,本機影片工具,短影音製作"
        path="/tools/image-to-video"
      />

      <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 md:py-10">
        <div className="mx-auto max-w-6xl">
          <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-teal-700 to-sky-700 px-6 py-7 text-white shadow-lg md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  RXV 免費圖片轉 MP4 v1.0
                </h1>
                <p className="mt-2 text-sm font-semibold text-cyan-50 md:text-base">
                  純本機處理｜免安裝｜不需登入｜不使用付費 API
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur">
                {recorderChoice?.label ?? "請使用最新版 Chrome／Edge"}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">影片用途</span>
                <select
                  value={ratio}
                  onChange={(event) => setRatio(event.target.value as RatioValue)}
                  disabled={isGenerating}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500"
                >
                  {ratioOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">{currentRatio.hint}</span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">影片模板</span>
                <select
                  value={template}
                  onChange={(event) => setTemplate(event.target.value as TemplateValue)}
                  disabled={isGenerating}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500"
                >
                  {templateOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  {templateOptions.find((item) => item.value === template)?.hint}
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">影片長度</span>
                <select
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value) as DurationValue)}
                  disabled={isGenerating}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500"
                >
                  <option value={10}>10 秒</option>
                  <option value={15}>15 秒</option>
                  <option value={30}>30 秒</option>
                </select>
                <span className="mt-1 block text-xs text-slate-500">第一版最長 30 秒</span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">圖片顯示方式</span>
                <select
                  value={fit}
                  onChange={(event) => setFit(event.target.value as FitValue)}
                  disabled={isGenerating}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500"
                >
                  {fitOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  自動模式會盡量保留完整圖片
                </span>
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[260px_1fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">影片畫質</span>
                <select
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value as ResolutionValue)}
                  disabled={isGenerating}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500"
                >
                  <option value="720p">720p（建議，速度快）</option>
                  <option value="1080p">1080p（較清晰、較吃效能）</option>
                </select>
              </label>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
                輸出：{outputDimensions.width} × {outputDimensions.height}。圖片、MP3、產出的影片都不會上傳到 RXV、Supabase 或 R2；轉檔使用您目前的裝置完成。
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-black text-slate-800">選 1～{MAX_IMAGES} 張圖片</span>
                <span className="text-xs font-semibold text-slate-500">目前 {imageFiles.length} 張</span>
              </div>
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center transition hover:border-teal-500 hover:bg-teal-50">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={onSelectImages}
                  disabled={isGenerating}
                  className="hidden"
                />
                <span>
                  <strong className="block text-base text-slate-800">選擇圖片</strong>
                  <span className="mt-1 block text-xs text-slate-500">JPG／PNG／WebP，每張最多 {MAX_IMAGE_MB} MB</span>
                </span>
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {previewUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img src={url} alt={`第 ${index + 1} 張`} className="aspect-square h-full w-full object-cover" />
                      {!isGenerating && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs font-black text-white"
                          aria-label={`移除第 ${index + 1} 張圖片`}
                        >
                          ×
                        </button>
                      )}
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">背景音樂 MP3（選填）</span>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,.mp3"
                  onChange={onSelectAudio}
                  disabled={isGenerating}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-bold"
                />
                {audioFile && (
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {audioFile.name}｜{formatBytes(audioFile.size)}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">背景音樂音量</span>
                <select
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value) as VolumeValue)}
                  disabled={isGenerating || !audioFile}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 disabled:bg-slate-100"
                >
                  <option value={0.2}>輕聲 20%</option>
                  <option value={0.4}>一般 40%</option>
                  <option value={0.6}>明顯 60%</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:mt-7">
                <input
                  type="checkbox"
                  checked={audioFade}
                  onChange={(event) => setAudioFade(event.target.checked)}
                  disabled={isGenerating || !audioFile}
                  className="h-4 w-4 accent-teal-600"
                />
                <span>
                  <strong className="block text-sm text-slate-800">音樂自動淡入／淡出</strong>
                  <span className="text-xs text-slate-500">MP3 太長會自動循環使用</span>
                </span>
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <strong className="text-slate-800">{status}</strong>
                <span className="font-black text-teal-700">{progress}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-teal-600 transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generateMp4}
                disabled={isGenerating || !imageFiles.length || !recorderChoice}
                className="flex-1 rounded-2xl bg-teal-700 px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isGenerating ? "正在產生 MP4…" : "開始產生 MP4"}
              </button>
              {isGenerating && (
                <button
                  type="button"
                  onClick={cancelGeneration}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-700"
                >
                  取消
                </button>
              )}
            </div>

            {downloadUrl && (
              <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center">
                <div className="text-lg font-black text-emerald-900">MP4 已完成</div>
                <p className="mt-1 text-sm text-emerald-800">檔案大小：約 {formatBytes(outputSize)}</p>
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="mt-4 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-800"
                >
                  下載 MP4
                </a>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
              <strong>隱私與費用：</strong>本工具不把您的圖片、MP3 或成品影片上傳到 RXV 伺服器。影片由您的瀏覽器與裝置運算，因此不會因您產生影片而使用 RXV 的影片運算 API 或雲端影片儲存額度。若瀏覽器無法直接輸出 MP4，第一次會載入相容轉檔核心，轉檔仍在您的裝置內完成。
            </div>
          </section>

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>
      </main>
    </>
  );
}
