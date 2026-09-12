function FotorAffiliateBlock() {
  return (
    <section className="mt-10 mb-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
          AI Creator Tools
        </span>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          AI 創作者推薦工具
        </h3>
      </div>
      <p className="mb-5 text-sm text-slate-500 leading-relaxed">
        可搭配本頁工具使用：先用 AI
        產生圖片素材、去背整理，再壓縮、轉尺寸、做成貼圖、QR 圖卡或短影音。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://www.fotor.com/tw/features/ai-image-generator/?via=289886"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            AI
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
              Fotor AI 圖片生成
            </h4>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
              HOT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            不會畫畫也能快速產生商品圖、貼圖角色、社群素材與短影音封面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white group-hover:bg-blue-700">
            立即生成圖片
          </span>
        </a>
        <a
          href="https://www.fotor.com/tw/features/background-remover/?via=289886"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            BG
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
              Fotor AI 去背工具
            </h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
              推薦
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            上架貼圖、商品圖或社群圖前先去背，讓素材更乾淨、更好搭配版面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-purple-600 px-3 py-2 text-xs font-black text-white group-hover:bg-purple-700">
            立即去背圖片
          </span>
        </a>
      </div>
    </section>
  );
}

function DonationLiteInline() {
  return (
    <div
      style={{
        marginTop: 32,
        marginBottom: 32,
        padding: 20,
        borderRadius: 18,
        border: "1px solid #fde68a",
        background: "#fffbeb",
        boxShadow: "0 1px 8px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>
          ❤️ 支持免費工具開發
        </div>
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.7,
          }}
        >
          如果這個工具有幫助到你，可以小額支持；不用也沒關係，有幫助再支持就好
          🙌
        </p>
      </div>
      <div
        style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}
      >
        <a
          href="https://p.ecpay.com.tw/FD7CD6D"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "1 1 220px",
            textAlign: "center",
            padding: "12px 18px",
            borderRadius: 14,
            background: "#f59e0b",
            color: "#fff",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          ☕ 台灣小額支持
        </a>
        <a
          href="https://ko-fi.com/ang2289"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "1 1 220px",
            textAlign: "center",
            padding: "12px 18px",
            borderRadius: 14,
            background: "#2563eb",
            color: "#fff",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          🌍 Ko-fi 海外支持
        </a>
      </div>
      <p
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 12,
          color: "#64748b",
        }}
      >
        建議支持：50 元 / 100 元 / 200 元　｜　💡 功能建議：rxv0227@gmail.com
      </p>
    </div>
  );
}

import React, { useMemo, useRef, useState } from "react";
import SEO from "@/components/SEO";

const API_BASE = import.meta.env.VITE_VIDEO_API_BASE || "http://localhost:3006";

const HEALTH_TIMEOUT_MS = 3000;

const MSG_BACKEND_DOWN_PREFLIGHT =
  "圖片轉影片後端未啟動，請先在專案根目錄執行 npm run server，並確認 http://localhost:3006/health 可打開。";

const MSG_CONNECTION_FAIL =
  "無法連線到影片後端，請確認 npm run server 是否正在執行，且 3006 port 沒被其他程式占用。";

/** GET /health，逾時或失敗回傳 false */
async function checkVideoServerHealth(
  timeoutMs = HEALTH_TIMEOUT_MS,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

function isConnectionErrorMessage(raw: string): boolean {
  if (!raw) return false;
  return (
    raw === "Failed to fetch" ||
    raw.includes("NetworkError") ||
    raw.includes("CONNECTION_REFUSED") ||
    raw.includes("Load failed") ||
    raw.includes("ERR_CONNECTION_REFUSED")
  );
}

type RatioValue = "9:16" | "16:9" | "1:1" | "4:5";
type ResolutionValue = "1080p" | "4k";
type EffectValue =
  | "static"
  | "zoom_in"
  | "zoom_out"
  | "pan_left"
  | "pan_right"
  | "pan_up"
  | "pan_down"
  | "drift";
type SparkleValue = "none" | "sparkle1" | "sparkle2" | "gold" | "moving_dots";
type TimeUnit = "seconds" | "minutes" | "hours";
type PlatformPresetValue = "youtube_landscape" | "shorts_vertical" | "ig_portrait" | "square_product";
type StickerVideoMode = "single_motion" | "multi_slideshow" | "sticker_pop";
type AudioPresetValue = "none" | "cute_pop" | "sparkle" | "soft_bgm" | "upbeat_bgm";
type OutputFormatValue = "mp4" | "gif";
type VoiceModeValue = "none" | "natural_male" | "warm_male" | "female";
type SubtitlePositionValue = "bottom" | "middle" | "top";

type ServerStatus = "idle" | "ok" | "down";

const ratioOptions: {
  value: RatioValue;
  label: string;
  size1080: string;
  size4k: string;
}[] = [
  {
    value: "9:16",
    label: "YouTube Shorts／Reels 直式 9:16",
    size1080: "1080 × 1920",
    size4k: "2160 × 3840",
  },
  {
    value: "16:9",
    label: "YouTube 橫式影片 16:9",
    size1080: "1920 × 1080",
    size4k: "3840 × 2160",
  },
  {
    value: "1:1",
    label: "蝦皮／商品方形 1:1",
    size1080: "1080 × 1080",
    size4k: "2160 × 2160",
  },
  {
    value: "4:5",
    label: "IG 貼文 4:5",
    size1080: "1080 × 1350",
    size4k: "2160 × 2700",
  },
];

const effectOptions: { value: EffectValue; label: string }[] = [
  { value: "static", label: "靜態無動畫" },
  { value: "zoom_in", label: "平穩放大" },
  { value: "zoom_out", label: "平穩縮小" },
  { value: "pan_left", label: "向左平移" },
  { value: "pan_right", label: "向右平移" },
  { value: "pan_up", label: "向上平移" },
  { value: "pan_down", label: "向下平移" },
  { value: "drift", label: "漂浮移動" },
];

const sparkleOptions: { value: SparkleValue; label: string }[] = [
  { value: "none", label: "無" },
  { value: "sparkle1", label: "閃爍星光" },
  { value: "sparkle2", label: "柔和星光" },
  { value: "gold", label: "金色星光" },
  { value: "moving_dots", label: "移動圓點星光" },
];

const platformPresetOptions: {
  value: PlatformPresetValue;
  label: string;
  hint: string;
}[] = [
  { value: "youtube_landscape", label: "YouTube 橫式", hint: "16:9｜1920×1080" },
  { value: "shorts_vertical", label: "Shorts／Reels", hint: "9:16｜1080×1920" },
  { value: "ig_portrait", label: "IG 貼文", hint: "4:5｜1080×1350" },
  { value: "square_product", label: "商品方形", hint: "1:1｜1080×1080" },
];

const stickerModeOptions: { value: StickerVideoMode; label: string; hint: string }[] = [
  { value: "single_motion", label: "單張貼圖海報動態", hint: "適合 4×4 總圖、宣傳封面、風格整理圖" },
  { value: "multi_slideshow", label: "多張貼圖輪播", hint: "適合 3～20 張貼圖／作品依序展示" },
  { value: "sticker_pop", label: "貼圖彈跳展示", hint: "適合透明 PNG 貼圖、單張貼圖彈出感" },
];

const audioPresetOptions: { value: AudioPresetValue; label: string; hint: string }[] = [
  { value: "none", label: "無音效", hint: "最安全，適合先測試輸出" },
  { value: "cute_pop", label: "可愛啵啵音", hint: "適合貼圖彈出、LINE 貼圖宣傳" },
  { value: "sparkle", label: "閃亮提示音", hint: "適合星光、療癒、女生向封面" },
  { value: "soft_bgm", label: "柔和背景音", hint: "適合療癒系、男友感、寵物貼圖" },
  { value: "upbeat_bgm", label: "輕快背景音", hint: "適合職業貼圖、店家宣傳、短影音" },
];


const voiceModeOptions: { value: VoiceModeValue; label: string; hint: string }[] = [
  { value: "none", label: "不加口白", hint: "只輸出畫面與背景音" },
  { value: "natural_male", label: "自然男聲", hint: "zh-TW-YunJheNeural，較適合男友感／商品導購" },
  { value: "warm_male", label: "溫柔男聲", hint: "zh-TW-YunJheNeural，語速略慢、音量柔和" },
  { value: "female", label: "自然女聲", hint: "zh-TW-HsiaoChenNeural，適合教學與溫柔旁白" },
];
function getOutputSize(ratio: RatioValue, resolution: ResolutionValue) {
  const item = ratioOptions.find((x) => x.value === ratio);
  if (!item) return "";
  return resolution === "4k" ? item.size4k : item.size1080;
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function timeToSeconds(value: number, unit: TimeUnit) {
  if (unit === "hours") return value * 3600;
  if (unit === "minutes") return value * 60;
  return value;
}

function secondsToTimeText(seconds: number) {
  if (seconds >= 3600)
    return `${(seconds / 3600).toFixed(seconds % 3600 === 0 ? 0 : 1)} 小時`;
  if (seconds >= 60)
    return `${(seconds / 60).toFixed(seconds % 60 === 0 ? 0 : 1)} 分鐘`;
  return `${seconds} 秒`;
}

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  leftText?: string;
  rightText?: string;
  suffix?: string;
  onChange: (value: number) => void;
};

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  leftText = "低",
  rightText = "高",
  suffix = "",
  onChange,
}: SliderControlProps) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div
      style={{
        gridColumn: "span 2",
        marginBottom: 18,
        padding: 14,
        border: "1px solid #dbeafe",
        borderRadius: 16,
        background: "linear-gradient(180deg,#ffffff,#f8fbff)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {label}：
        </label>
        <div style={{ fontWeight: 800, color: "#1d4ed8" }}>
          {Number(value).toFixed(step < 0.1 ? 2 : 1)}
          {suffix}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(clampNumber(Number(e.target.value), min, max))
        }
        style={{
          width: "100%",
          marginTop: 10,
          accentColor: "#2563eb",
          cursor: "pointer",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#64748b",
          fontSize: 13,
          marginTop: 4,
        }}
      >
        <span>{leftText}</span>
        <span>{rightText}</span>
      </div>

      <div
        style={{
          marginTop: 8,
          height: 6,
          borderRadius: 999,
          background: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg,#38bdf8,#2563eb,#7c3aed)",
          }}
        />
      </div>
    </div>
  );
}

function ImageToVideoInner() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [stickerMode, setStickerMode] = useState<StickerVideoMode>("single_motion");
  const [secondsPerImage, setSecondsPerImage] = useState<number>(1.2);
  const [titleText, setTitleText] = useState<string>("");
  const [subtitleText, setSubtitleText] = useState<string>("");
  const [audioPreset, setAudioPreset] = useState<AudioPresetValue>("none");
  const [postAudioPreset, setPostAudioPreset] = useState<AudioPresetValue>("none");
  const [postBgmVolume, setPostBgmVolume] = useState<number>(0.18);
  const [outputFormat, setOutputFormat] = useState<OutputFormatValue>("mp4");
  const [voiceMode, setVoiceMode] = useState<VoiceModeValue>("none");
  const [voiceText, setVoiceText] = useState<string>("今天很累吧？先休息一下。別太累，我在這裡。");
  const [voiceRate, setVoiceRate] = useState<number>(0.92);
  const [voiceVolume, setVoiceVolume] = useState<number>(1);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(true);
  const [postSubtitleText, setPostSubtitleText] = useState<string>("今天很累吧？\n先休息一下。\n別太累，我在這裡。");
  const [burnSubtitles, setBurnSubtitles] = useState<boolean>(true);
  const [subtitlePosition, setSubtitlePosition] = useState<SubtitlePositionValue>("bottom");
  const [bgmFile, setBgmFile] = useState<File | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState<string[]>([]);
  const [ratio, setRatio] = useState<RatioValue>("16:9");
  const [resolution, setResolution] = useState<ResolutionValue>("1080p");
  const [effect, setEffect] = useState<EffectValue>("static");
  const [sparkle, setSparkle] = useState<SparkleValue>("none");

  const [timeValue, setTimeValue] = useState<number>(10);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("seconds");

  const [fps, setFps] = useState<number>(30);
  const [speed, setSpeed] = useState<number>(1);
  const [intensity, setIntensity] = useState<number>(0.55);
  const [density, setDensity] = useState<number>(0.45);
  const [dotSize, setDotSize] = useState<number>(0.5);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("尚未開始");
  const [errorText, setErrorText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("image-to-video.mp4");
  const [previewUrl, setPreviewUrl] = useState("");
  const [serverStatus, setServerStatus] = useState<ServerStatus>("idle");

  const abortRef = useRef<AbortController | null>(null);
  const fakeTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const bgmInputRef = useRef<HTMLInputElement | null>(null);

  const outputSizeText = useMemo(
    () => getOutputSize(ratio, resolution),
    [ratio, resolution],
  );
  const totalSeconds = useMemo(
    () => clampNumber(timeToSeconds(timeValue, timeUnit), 1, 21600),
    [timeValue, timeUnit],
  );

  const serverStatusLabel =
    serverStatus === "idle"
      ? "未檢查"
      : serverStatus === "ok"
        ? "正常"
        : "未啟動";

  const performanceWarning =
    resolution === "4k"
      ? "4K 轉檔會明顯變慢，建議先用 1080P 測試確認畫面。"
      : totalSeconds > 60
        ? "影片超過 60 秒會比較久，公開工具不建議讓訪客產生太長影片。"
        : sparkle === "moving_dots"
          ? "移動圓點星光效果較吃效能，若轉檔太久可先改成無星光或柔和星光。"
          : imageFiles.length > 8
            ? "多張貼圖輪播會依張數增加轉檔時間，建議先用 3～6 張測試。"
            : voiceMode !== "none"
              ? "口白會使用後端 edge-tts 產生自然語音；若電腦尚未安裝 edge-tts，後端會回傳錯誤或改用備援。"
              : audioPreset !== "none"
                ? "音效／背景音需要後端支援；若目前後端尚未整合，會先以無聲影片輸出。"
                : "";

  const clearFakeProgress = () => {
    if (fakeTimerRef.current) {
      window.clearInterval(fakeTimerRef.current);
      fakeTimerRef.current = null;
    }
  };

  const startFakeProgress = () => {
    clearFakeProgress();
    setProgress(2);

    const heavyTask =
      resolution === "4k" || sparkle === "moving_dots" || totalSeconds > 30;

    fakeTimerRef.current = window.setInterval(
      () => {
        setProgress((prev) => {
          if (prev >= 92) return prev;
          const step = heavyTask
            ? prev < 20
              ? 2.5
              : prev < 55
                ? 1.2
                : 0.4
            : prev < 30
              ? 6
              : prev < 60
                ? 3
                : 1.2;
          return Math.min(prev + step, 92);
        });
      },
      heavyTask ? 900 : 700,
    );
  };

  const resetResultUrl = () => {
    if (videoUrl && videoUrl.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
  };

  const triggerDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "image-to-video.mp4";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const fetchAsBlobUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`下載影片失敗（${res.status}）`);
    }
    const blob = await res.blob();
    if (!blob || blob.size === 0) {
      throw new Error("影片檔案內容為空。");
    }
    return URL.createObjectURL(blob);
  };

  const clearPreviewUrls = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    videoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const handlePickFiles = (files: FileList | File[] | null) => {
    setErrorText("");
    resetResultUrl();
    clearPreviewUrls();

    const picked = Array.from(files || []);
    if (!picked.length) {
      setImageFile(null);
      setImageFiles([]);
      setPreviewUrl("");
      setPreviewUrls([]);
      return;
    }

    const invalid = picked.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setImageFile(null);
      setImageFiles([]);
      setPreviewUrl("");
      setPreviewUrls([]);
      setErrorText("請只上傳圖片檔，例如 JPG、PNG 或 WebP。");
      return;
    }

    const oversized = picked.find((file) => file.size > 15 * 1024 * 1024);
    if (oversized) {
      setImageFile(null);
      setImageFiles([]);
      setPreviewUrl("");
      setPreviewUrls([]);
      setErrorText("單張圖片檔案過大，建議每張先壓縮到 15MB 以下再轉影片。");
      return;
    }

    const safeFiles = picked.slice(0, 20);
    const urls = safeFiles.map((file) => URL.createObjectURL(file));
    setImageFiles(safeFiles);
    setImageFile(safeFiles[0] || null);
    setPreviewUrls(urls);
    setPreviewUrl(urls[0] || "");

    if (safeFiles.length > 1 && stickerMode === "single_motion") {
      setStickerMode("multi_slideshow");
    }
  };

  const handlePickFile = (file: File | null) => {
    handlePickFiles(file ? [file] : null);
  };

  const handlePickVideos = (files: FileList | File[] | null) => {
    setErrorText("");
    resetResultUrl();
    videoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));

    const picked = Array.from(files || []);
    if (!picked.length) {
      setVideoFiles([]);
      setVideoPreviewUrls([]);
      return;
    }

    const invalid = picked.find((file) => !file.type.startsWith("video/"));
    if (invalid) {
      setVideoFiles([]);
      setVideoPreviewUrls([]);
      setErrorText("請只上傳影片檔，例如 MP4、MOV 或 WebM。");
      return;
    }

    const oversized = picked.find((file) => file.size > 200 * 1024 * 1024);
    if (oversized) {
      setVideoFiles([]);
      setVideoPreviewUrls([]);
      setErrorText("單支影片檔案過大，建議先壓縮到 200MB 以下再處理。");
      return;
    }

    const safeFiles = picked.slice(0, 6);
    setVideoFiles(safeFiles);
    setVideoPreviewUrls(safeFiles.map((file) => URL.createObjectURL(file)));
  };

  const handlePostProcessVideos = async () => {
    if (!videoFiles.length) {
      setErrorText("請先上傳要後製的 MP4／影片檔。");
      return;
    }
    if (voiceMode !== "none" && !voiceText.trim()) {
      setErrorText("已選擇口白，請先輸入口白文字。");
      return;
    }

    setErrorText("");
    setStatusText("檢查後端服務…");
    const healthy = await checkVideoServerHealth();
    if (!healthy) {
      setServerStatus("down");
      setLoading(false);
      setProgress(0);
      setStatusText("後端未啟動");
      setErrorText(MSG_BACKEND_DOWN_PREFLIGHT);
      return;
    }

    setServerStatus("ok");
    resetResultUrl();
    setLoading(true);
    setStatusText("上傳影片並合成口白…");
    startFakeProgress();

    const formData = new FormData();
    videoFiles.forEach((file) => formData.append("videos", file));
    formData.append("voiceMode", voiceMode);
    formData.append("voiceText", voiceText.trim());
    formData.append("voiceRate", String(clampNumber(voiceRate, 0.65, 1.25)));
    formData.append("voiceVolume", String(clampNumber(voiceVolume, 0.1, 2)));
    formData.append("muteOriginalAudio", muteOriginalAudio ? "1" : "0");
    formData.append("audioPreset", postAudioPreset);
    formData.append("bgmVolume", String(clampNumber(postBgmVolume, 0, 1)));
    if (bgmFile) formData.append("bgm", bgmFile);
    formData.append("ratio", ratio);
    formData.append("burnSubtitles", burnSubtitles ? "1" : "0");
    formData.append("subtitleText", postSubtitleText.trim());
    formData.append("subtitlePosition", subtitlePosition);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/postprocess-video`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = `影片後製失敗（${res.status}）`;
        try {
          const data = await res.json();
          message = data?.message || data?.error || message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      const rawUrl = data?.videoUrl || data?.downloadUrl || "";
      if (!rawUrl) throw new Error("後端已回應，但沒有回傳影片網址。");
      const fullUrl = rawUrl.startsWith("http") ? rawUrl : `${API_BASE}${rawUrl.startsWith("/") ? rawUrl : "/" + rawUrl}`;
      const blobUrl = await fetchAsBlobUrl(`${fullUrl}${fullUrl.includes("?") ? "&" : "?"}t=${Date.now()}`);
      clearFakeProgress();
      setProgress(100);
      setStatusText("完成");
      setVideoName(`voice-merged-${Date.now()}.mp4`);
      setVideoUrl(blobUrl);
      triggerDownload(blobUrl, `voice-merged-${Date.now()}.mp4`);
    } catch (error: unknown) {
      clearFakeProgress();
      setProgress(0);
      const err = error as { name?: string; message?: string };
      if (err?.name === "AbortError") setStatusText("已取消");
      else {
        setStatusText("失敗");
        setErrorText(error instanceof Error ? error.message : "影片後製失敗，請檢查後端。 ");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const cancelGenerate = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearFakeProgress();
    setLoading(false);
    setStatusText("已取消");
    setProgress(0);
  };

  const handleQuickPreset = (
    preset: "fast_test" | "quality_short" | "long_video" | "sticker_short",
  ) => {
    if (preset === "fast_test") {
      setResolution("1080p");
      setEffect("static");
      setSparkle("none");
      setTimeValue(5);
      setTimeUnit("seconds");
      setFps(24);
      return;
    }

    if (preset === "quality_short") {
      setResolution("1080p");
      setEffect("zoom_in");
      setSparkle("moving_dots");
      setTimeValue(10);
      setTimeUnit("seconds");
      setFps(30);
      return;
    }

    if (preset === "sticker_short") {
      setRatio("9:16");
      setResolution("1080p");
      setEffect("drift");
      setSparkle("sparkle2");
      setStickerMode(imageFiles.length > 1 ? "multi_slideshow" : "sticker_pop");
      setSecondsPerImage(1.2);
      setAudioPreset("cute_pop");
      setTimeValue(8);
      setTimeUnit("seconds");
      setFps(30);
      return;
    }

    setResolution("1080p");
    setEffect("static");
    setSparkle("none");
    setTimeValue(1);
    setTimeUnit("minutes");
    setFps(24);
  };

  const handlePlatformPreset = (preset: PlatformPresetValue) => {
    setResolution("1080p");
    setTimeUnit("seconds");
    setTimeValue(8);
    setFps(30);

    if (preset === "youtube_landscape") {
      setRatio("16:9");
      setEffect("zoom_in");
      setSparkle("none");
      return;
    }

    if (preset === "shorts_vertical") {
      setRatio("9:16");
      setEffect("zoom_in");
      setSparkle("sparkle2");
      return;
    }

    if (preset === "ig_portrait") {
      setRatio("4:5");
      setEffect("drift");
      setSparkle("none");
      return;
    }

    setRatio("1:1");
    setEffect("static");
    setSparkle("none");
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setErrorText("請先選擇圖片檔案。");
      return;
    }

    setErrorText("");
    setStatusText("檢查後端服務…");

    const healthy = await checkVideoServerHealth();
    if (!healthy) {
      setServerStatus("down");
      setLoading(false);
      setProgress(0);
      setStatusText("後端未啟動");
      setErrorText(MSG_BACKEND_DOWN_PREFLIGHT);
      return;
    }

    setServerStatus("ok");

    resetResultUrl();
    setLoading(true);
    setStatusText("準備上傳圖片...");
    startFakeProgress();

    const formData = new FormData();
    formData.append("image", imageFile);
    imageFiles.forEach((file) => formData.append("images", file));
    formData.append("imageCount", String(imageFiles.length || 1));
    formData.append("stickerMode", stickerMode);
    formData.append("secondsPerImage", String(clampNumber(secondsPerImage, 0.5, 5)));
    formData.append("titleText", titleText.trim());
    formData.append("subtitleText", subtitleText.trim());
    formData.append("audioPreset", audioPreset);
    formData.append("voiceMode", voiceMode);
    formData.append("voiceText", voiceText.trim());
    formData.append("voiceRate", String(clampNumber(voiceRate, 0.65, 1.25)));
    formData.append("voiceVolume", String(clampNumber(voiceVolume, 0.1, 2)));
    formData.append("muteOriginalAudio", muteOriginalAudio ? "1" : "0");
    formData.append("outputFormat", outputFormat);
    formData.append("ratio", ratio);
    formData.append("resolution", resolution);
    formData.append("effect", effect);
    formData.append("sparkle", sparkle);
    formData.append("seconds", String(totalSeconds));
    formData.append("fps", String(clampNumber(fps, 12, 60)));
    formData.append("speed", String(clampNumber(speed, 0.2, 3)));
    formData.append("intensity", String(clampNumber(intensity, 0, 1)));
    formData.append("density", String(clampNumber(density, 0, 1)));
    formData.append("dotSize", String(clampNumber(dotSize, 0.1, 2)));

    const ext = resolution === "4k" ? "4k" : "1080p";
    const safeName = imageFile.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\u4e00-\u9fff-]+/g, "-");
    setVideoName(
      `${safeName || "sticker-video"}-${ratio.replace(":", "x")}-${ext}-${totalSeconds}s.${outputFormat}`,
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const heavyTask =
        resolution === "4k" || sparkle === "moving_dots" || totalSeconds > 30;

      setStatusText(
        heavyTask
          ? "伺服器轉檔中，這組設定會比較久，請稍候..."
          : "伺服器轉檔中，請稍候...",
      );

      const res = await fetch(`${API_BASE}/generate-video`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = `轉檔失敗（${res.status}）`;
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {
            //
          }
        }
        throw new Error(message);
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        const rawUrl =
          data?.videoUrl || data?.downloadUrl || data?.path || data?.url || "";

        if (!rawUrl) {
          throw new Error("後端已回應，但沒有回傳可播放的影片網址。");
        }

        const fullUrl =
          rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
            ? rawUrl
            : `${API_BASE}${rawUrl.startsWith("/") ? rawUrl : "/" + rawUrl}`;

        console.log("video url =", fullUrl);

        const fullUrlWithTs = `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
        const blobUrl = await fetchAsBlobUrl(fullUrlWithTs);

        clearFakeProgress();
        setProgress(100);
        setStatusText("完成");
        setVideoUrl(blobUrl);
        triggerDownload(blobUrl, videoName);
      } else {
        const blob = await res.blob();
        if (!blob || blob.size === 0) {
          throw new Error("後端有回應，但影片檔內容是空的。");
        }

        const url = URL.createObjectURL(blob);

        clearFakeProgress();
        setProgress(100);
        setStatusText("完成");
        setVideoUrl(url);
        triggerDownload(url, videoName);
      }
    } catch (error: unknown) {
      clearFakeProgress();
      setProgress(0);

      const err = error as { name?: string; message?: string };
      if (err?.name === "AbortError") {
        setStatusText("已取消");
      } else {
        setStatusText("失敗");
        const raw = error instanceof Error ? error.message : "";
        const isConnFail = isConnectionErrorMessage(raw);
        setErrorText(
          isConnFail
            ? MSG_CONNECTION_FAIL
            : raw || "轉檔失敗，請檢查後端是否正常啟動。",
        );
        if (isConnFail) setServerStatus("down");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d7dce5",
    fontSize: 16,
    boxSizing: "border-box",
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 700,
    marginBottom: 8,
    color: "#0f172a",
  };

  const groupStyle: React.CSSProperties = {
    marginBottom: 18,
  };

  const infoBoxStyle: React.CSSProperties = {
    padding: 14,
    borderRadius: 14,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    lineHeight: 1.7,
    marginTop: 16,
  };

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "24px auto",
        padding: 20,
      }}
    >
      <SEO
        title="貼圖短影音工具｜LINE 貼圖宣傳影片與圖片轉短影音 - RxV AI工具中心"
        description="貼圖短影音工具，支援單張圖、多張貼圖輪播、星光效果與短影音尺寸，適合 LINE 貼圖宣傳、職業貼圖展示與社團測市場。"
        keywords="貼圖短影音工具, LINE貼圖宣傳, 圖片轉影片, 職業貼圖, AI工具"
        path="/tools/image-to-video"
      />
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 20,
          padding: 22,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            lineHeight: 1.15,
            margin: "0 0 14px",
            color: "#0f172a",
            fontWeight: 800,
          }}
        >
          貼圖短影音工具｜LINE 貼圖、職業貼圖、社群圖轉影片
        </h1>

        <p
          style={{ margin: 0, color: "#475569", fontSize: 18, lineHeight: 1.8 }}
        >
          上傳貼圖總圖、職業貼圖示範圖或多張貼圖素材，選擇 Shorts、IG、方形或 YouTube 尺寸，即可在本機後端轉成 MP4 短影音。適合 LINE 貼圖宣傳、職業貼圖展示、社團測市場與短影音封面測試。
        </p>

        <div style={infoBoxStyle}>
          <div>
            <strong>目前轉很久通常是這三種原因：</strong>
          </div>
          <div>1. 選了 4K</div>
          <div>2. 選了移動圓點星光</div>
          <div>3. 時間太長</div>
          <div style={{ marginTop: 8 }}>
            建議先用「快速測試」確認可正常輸出，再改成高畫質或較長時間。
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            fontSize: 14,
            color: "#334155",
          }}
        >
          後端狀態：<strong>{serverStatusLabel}</strong>
          <span style={{ marginLeft: 8, color: "#64748b" }}>
            （按下「開始生成影片」時會檢查 {API_BASE}/health）
          </span>
        </div>


        <div
          style={{
            marginTop: 18,
            padding: 18,
            borderRadius: 18,
            background: "#fff7ed",
            border: "2px solid #fb923c",
            boxShadow: "0 8px 20px rgba(249, 115, 22, 0.10)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, color: "#0f172a", marginBottom: 6 }}>
                影片後製模式｜Flow 影片加口白／字幕／合併
              </div>
              <p style={{ margin: 0, color: "#7c2d12", lineHeight: 1.7 }}>
                這一區是給已經有 MP4 的影片使用，不是圖片轉影片。建議 Flow 先輸出無聲影片，再到這裡加自然男聲口白、燒錄字幕、合併 1～6 支影片。
              </p>
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              style={{
                padding: "13px 18px",
                borderRadius: 14,
                border: "none",
                background: "#ea580c",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              上傳 MP4 影片後製
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 16 }}>
            <div>
              <label style={labelStyle}>口白聲音：</label>
              <select value={voiceMode} onChange={(e) => setVoiceMode(e.target.value as VoiceModeValue)} style={fieldStyle}>
                {voiceModeOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}｜{item.hint}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>原影片聲音：</label>
              <select value={muteOriginalAudio ? "mute" : "keep"} onChange={(e) => setMuteOriginalAudio(e.target.value === "mute")} style={fieldStyle}>
                <option value="mute">移除原音，避免 Flow 奇怪女聲</option>
                <option value="keep">保留原音並疊加口白</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>字幕：</label>
              <select value={burnSubtitles ? "on" : "off"} onChange={(e) => setBurnSubtitles(e.target.value === "on")} style={fieldStyle}>
                <option value="on">燒錄字幕到影片</option>
                <option value="off">不加字幕</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>字幕位置：</label>
              <select value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value as SubtitlePositionValue)} style={fieldStyle}>
                <option value="bottom">下方｜最適合 Shorts／Reels</option>
                <option value="middle">中間｜適合情緒重點句</option>
                <option value="top">上方｜避免遮到人物</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>背景音樂：</label>
              <select value={postAudioPreset} onChange={(e) => setPostAudioPreset(e.target.value as AudioPresetValue)} style={fieldStyle}>
                <option value="none">不加背景音樂</option>
                <option value="soft_bgm">柔和背景音｜療癒／男友感</option>
                <option value="upbeat_bgm">輕快背景音｜職業／社群短片</option>
                <option value="sparkle">閃亮提示音｜貼圖展示</option>
                <option value="cute_pop">可愛啵啵音｜彈跳貼圖</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>自訂 BGM 檔：</label>
              <button
                type="button"
                onClick={() => bgmInputRef.current?.click()}
                style={{ ...fieldStyle, textAlign: "left", cursor: "pointer", fontWeight: 800 }}
              >
                {bgmFile ? `已選：${bgmFile.name}` : "選擇 MP3／M4A／WAV（可不選）"}
              </button>
            </div>
            <SliderControl label="BGM 音量" value={postBgmVolume} min={0} max={1} step={0.05} leftText="關" rightText="大聲" suffix="x" onChange={setPostBgmVolume} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>口白文字：</label>
              <textarea
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                rows={4}
                placeholder="例如：今天很累吧？先休息一下。別太累，我在這裡。"
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>
            <div>
              <label style={labelStyle}>影片字幕文字：</label>
              <textarea
                value={postSubtitleText}
                onChange={(e) => setPostSubtitleText(e.target.value)}
                rows={4}
                placeholder={"每行一句，系統會平均分配在影片時間軸上。\n今天很累吧？\n先休息一下。\n別太累，我在這裡。"}
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 14 }}>
            <SliderControl label="口白語速" value={voiceRate} min={0.65} max={1.25} step={0.05} leftText="慢一點" rightText="快一點" suffix="x" onChange={setVoiceRate} />
            <SliderControl label="口白音量" value={voiceVolume} min={0.1} max={2} step={0.1} leftText="小聲" rightText="大聲" suffix="x" onChange={setVoiceVolume} />
          </div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "#334155", fontWeight: 800 }}>
              {videoFiles.length ? `已選擇 ${videoFiles.length} 支影片，可直接後製` : "尚未選擇影片"}
            </span>
            <button
              onClick={handlePostProcessVideos}
              disabled={loading || !videoFiles.length}
              style={{
                padding: "14px 20px",
                borderRadius: 14,
                border: "none",
                fontSize: 16,
                fontWeight: 900,
                cursor: loading || !videoFiles.length ? "not-allowed" : "pointer",
                background: loading || !videoFiles.length ? "#fdba74" : "#ea580c",
                color: "#fff",
              }}
            >
              影片加口白／字幕並輸出 MP4
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <button
            onClick={() => handleQuickPreset("fast_test")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            快速測試
          </button>
          <button
            onClick={() => handleQuickPreset("quality_short")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            短片品質版
          </button>
          <button
            onClick={() => handleQuickPreset("sticker_short")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #f9a8d4",
              background: "#fdf2f8",
              color: "#9d174d",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            貼圖短影音版
          </button>
          <button
            onClick={() => handleQuickPreset("long_video")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            長影片起手式
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            background: "#eef6ff",
            border: "1px solid #bfdbfe",
          }}
        >
          <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
            快速選平台尺寸
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {platformPresetOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handlePlatformPreset(item.value)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 14,
                  border: "1px solid #93c5fd",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: 800,
                }}
              >
                <div>{item.label}</div>
                <div style={{ marginTop: 4, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                  {item.hint}
                </div>
              </button>
            ))}
          </div>
        </div>

        {performanceWarning ? (
          <div
            style={{
              marginTop: 12,
              marginBottom: 18,
              padding: 12,
              borderRadius: 12,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            ⚠️ {performanceWarning}
          </div>
        ) : null}

        <div style={groupStyle}>
          <label style={labelStyle}>上傳貼圖圖片：</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handlePickFiles(e.target.files || null)}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #d7dce5",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: "none",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                background: "#2563eb",
                color: "#fff",
              }}
            >
              選擇圖片
            </button>
            <span
              style={{
                fontSize: 15,
                color: imageFile ? "#0f172a" : "#64748b",
                wordBreak: "break-all",
              }}
            >
              {imageFiles.length > 1
                ? `已選擇 ${imageFiles.length} 張圖片`
                : imageFile
                  ? imageFile.name
                  : "尚未選擇檔案"}
            </span>
          </div>
        </div>

        {previewUrl ? (
          <div
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{ fontWeight: 700, marginBottom: 12, color: "#0f172a" }}
            >
              圖片預覽
            </div>
            {previewUrls.length > 1 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: 10,
                }}
              >
                {previewUrls.map((url, index) => (
                  <div
                    key={url}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 8,
                      background: "#fff",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 6 }}>
                      #{index + 1}
                    </div>
                    <img
                      src={url}
                      alt={`預覽 ${index + 1}`}
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 10,
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="預覽"
                style={{
                  maxWidth: "100%",
                  maxHeight: 320,
                  borderRadius: 14,
                  display: "block",
                  objectFit: "contain",
                  margin: "0 auto",
                }}
              />
            )}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div style={{ ...groupStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>貼圖短影音模式：</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
              {stickerModeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStickerMode(item.value)}
                  style={{
                    padding: "12px 12px",
                    borderRadius: 14,
                    border: stickerMode === item.value ? "2px solid #ec4899" : "1px solid #e2e8f0",
                    background: stickerMode === item.value ? "#fdf2f8" : "#fff",
                    color: "#0f172a",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  <div>{item.label}</div>
                  <div style={{ marginTop: 5, color: "#64748b", fontSize: 12, lineHeight: 1.5, fontWeight: 700 }}>
                    {item.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>比例：</label>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value as RatioValue)}
              style={fieldStyle}
            >
              {ratioOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}（
                  {resolution === "4k" ? item.size4k : item.size1080}）
                </option>
              ))}
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>解析度：</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as ResolutionValue)}
              style={fieldStyle}
            >
              <option value="1080p">1080P</option>
              <option value="4k">4K</option>
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>輸出尺寸：</label>
            <div
              style={{
                ...fieldStyle,
                background: "#f8fafc",
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              {outputSizeText}
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>動態效果：</label>
            <select
              value={effect}
              onChange={(e) => setEffect(e.target.value as EffectValue)}
              style={fieldStyle}
            >
              {effectOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>星光效果：</label>
            <select
              value={sparkle}
              onChange={(e) => setSparkle(e.target.value as SparkleValue)}
              style={fieldStyle}
            >
              {sparkleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>每張停留秒數：</label>
            <input
              type="number"
              min={0.5}
              max={5}
              step={0.1}
              value={secondsPerImage}
              onChange={(e) =>
                setSecondsPerImage(clampNumber(Number(e.target.value), 0.5, 5))
              }
              style={fieldStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>輸出格式：</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormatValue)}
              style={fieldStyle}
            >
              <option value="mp4">MP4 影片</option>
              <option value="gif">GIF 動圖（需後端支援）</option>
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>音效／背景音：</label>
            <select
              value={audioPreset}
              onChange={(e) => setAudioPreset(e.target.value as AudioPresetValue)}
              style={fieldStyle}
            >
              {audioPresetOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}｜{item.hint}
                </option>
              ))}
            </select>
          </div>

          <div style={{ ...groupStyle, gridColumn: "1 / -1" }}>
            <div
              style={{
                padding: 16,
                borderRadius: 18,
                border: "1px solid #bae6fd",
                background: "#f0f9ff",
              }}
            >
              <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 18 }}>
                口白設定｜自然語音
              </div>
              <p style={{ margin: "8px 0 14px", color: "#475569", lineHeight: 1.7 }}>
                建議 Flow 先輸出無聲影片，再用這裡加自然男聲口白，可避免跑出奇怪女聲或雜音。
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div>
                  <label style={labelStyle}>口白聲音：</label>
                  <select
                    value={voiceMode}
                    onChange={(e) => setVoiceMode(e.target.value as VoiceModeValue)}
                    style={fieldStyle}
                  >
                    {voiceModeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}｜{item.hint}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>原影片聲音：</label>
                  <select
                    value={muteOriginalAudio ? "mute" : "keep"}
                    onChange={(e) => setMuteOriginalAudio(e.target.value === "mute")}
                    style={fieldStyle}
                  >
                    <option value="mute">移除原音，避免奇怪人聲</option>
                    <option value="keep">保留原音並疊加口白</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>口白文字：</label>
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={4}
                  placeholder="例如：今天很累吧？先休息一下。別太累，我在這裡。"
                  style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 14 }}>
                <SliderControl
                  label="口白語速"
                  value={voiceRate}
                  min={0.65}
                  max={1.25}
                  step={0.05}
                  leftText="慢一點"
                  rightText="快一點"
                  suffix="x"
                  onChange={setVoiceRate}
                />
                <SliderControl
                  label="口白音量"
                  value={voiceVolume}
                  min={0.1}
                  max={2}
                  step={0.1}
                  leftText="小聲"
                  rightText="大聲"
                  suffix="x"
                  onChange={setVoiceVolume}
                />
              </div>
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>影片標題文字：</label>
            <input
              type="text"
              value={titleText}
              maxLength={28}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="例如：早餐店老闆 LINE 貼圖"
              style={fieldStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>影片副標文字：</label>
            <input
              type="text"
              value={subtitleText}
              maxLength={36}
              onChange={(e) => setSubtitleText(e.target.value)}
              placeholder="例如：接單、提醒、回覆都能用"
              style={fieldStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>時間數值：</label>
            <input
              type="number"
              min={1}
              max={
                timeUnit === "hours" ? 6 : timeUnit === "minutes" ? 360 : 21600
              }
              value={timeValue}
              onChange={(e) =>
                setTimeValue(clampNumber(Number(e.target.value), 1, 21600))
              }
              style={fieldStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>時間單位：</label>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
              style={fieldStyle}
            >
              <option value="seconds">秒</option>
              <option value="minutes">分</option>
              <option value="hours">時</option>
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>送出總時間：</label>
            <div
              style={{
                ...fieldStyle,
                background: "#f8fafc",
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              {secondsToTimeText(totalSeconds)}
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>FPS：</label>
            <input
              type="number"
              min={12}
              max={60}
              value={fps}
              onChange={(e) =>
                setFps(clampNumber(Number(e.target.value), 12, 60))
              }
              style={fieldStyle}
            />
          </div>

          <SliderControl
            label="動畫速度"
            value={speed}
            min={0.2}
            max={3}
            step={0.1}
            leftText="慢"
            rightText="快"
            suffix="x"
            onChange={setSpeed}
          />

          {sparkle !== "none" ? (
            <>
              <SliderControl
                label="星光亮度"
                value={intensity}
                min={0}
                max={1}
                step={0.05}
                leftText="淡"
                rightText="亮"
                onChange={setIntensity}
              />

              <SliderControl
                label="星光數量"
                value={density}
                min={0}
                max={1}
                step={0.05}
                leftText="少"
                rightText="多"
                onChange={setDensity}
              />

              <SliderControl
                label="星光大小"
                value={dotSize}
                min={0.1}
                max={2}
                step={0.1}
                leftText="小"
                rightText="大"
                onChange={setDotSize}
              />
            </>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 18,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20, color: "#0f172a", marginBottom: 8 }}>
            短影音後製｜合併影片＋加自然口白
          </div>
          <p style={{ margin: "0 0 14px", color: "#7c2d12", lineHeight: 1.7 }}>
            適合 Flow 產出的無聲 8 秒短片：可上傳 1～6 支 MP4，自動合併，並加上自然口白與字幕。
          </p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handlePickVideos(e.target.files || null)}
          />
          <input
            ref={bgmInputRef}
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.aac"
            style={{ display: "none" }}
            onChange={(e) => setBgmFile(e.target.files?.[0] || null)}
          />
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "none",
                background: "#f97316",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              選擇影片
            </button>
            <span style={{ color: "#334155", fontWeight: 700 }}>
              {videoFiles.length ? `已選擇 ${videoFiles.length} 支影片` : "尚未選擇影片"}
            </span>
          </div>
          {videoPreviewUrls.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 14 }}>
              {videoPreviewUrls.map((url, index) => (
                <video
                  key={url}
                  src={url}
                  controls
                  muted
                  playsInline
                  style={{ width: "100%", borderRadius: 12, background: "#000", maxHeight: 220 }}
                  title={`影片 ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
          <button
            onClick={handlePostProcessVideos}
            disabled={loading || !videoFiles.length}
            style={{
              marginTop: 16,
              padding: "14px 20px",
              borderRadius: 14,
              border: "none",
              fontSize: 16,
              fontWeight: 900,
              cursor: loading || !videoFiles.length ? "not-allowed" : "pointer",
              background: loading || !videoFiles.length ? "#fdba74" : "#ea580c",
              color: "#fff",
              minWidth: 220,
            }}
          >
            合併影片並加入口白／字幕
          </button>
        </div>

        <div
          style={{
            marginTop: 10,
            padding: 16,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10, color: "#0f172a" }}>
            轉檔進度
          </div>
          <div
            style={{
              width: "100%",
              height: 16,
              background: "#e2e8f0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                transition: "width 0.35s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 10,
              fontSize: 14,
              color: "#475569",
              flexWrap: "wrap",
            }}
          >
            <span>狀態：{statusText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {errorText ? (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontWeight: 600,
            }}
          >
            {errorText}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "14px 20px",
              borderRadius: 14,
              border: "none",
              fontSize: 16,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              minWidth: 180,
            }}
          >
            {loading ? "生成中..." : "開始生成影片"}
          </button>

          <button
            onClick={cancelGenerate}
            disabled={!loading}
            style={{
              padding: "14px 20px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              fontWeight: 700,
              cursor: !loading ? "not-allowed" : "pointer",
              background: "#fff",
              color: "#0f172a",
              minWidth: 140,
            }}
          >
            取消轉檔
          </button>
        </div>

        {videoUrl ? (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 18,
              border: "1px solid #dbeafe",
              background: "#eff6ff",
            }}
          >
            <div
              style={{ fontWeight: 800, marginBottom: 12, color: "#1e3a8a" }}
            >
              輸出結果
            </div>
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              preload="auto"
              style={{
                width: "100%",
                maxHeight: 560,
                borderRadius: 14,
                background: "#000",
              }}
            />
            <div style={{ marginTop: 12 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  triggerDownload(videoUrl, videoName);
                }}
                style={{
                  display: "inline-block",
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "#1d4ed8",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                下載影片
              </a>
            </div>
          </div>
        ) : null}

        <DonationLiteInline />

        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            什麼是圖片轉短影音工具？
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            這個工具可把靜態圖片、貼圖總圖或多張貼圖素材轉成短影音素材，適合 YouTube Shorts、Reels、IG 貼文、職業 LINE 貼圖展示、社團測市場與商品宣傳影片。
          </p>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">
            為什麼使用這個工具？
          </h2>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
            <li>免費使用</li>
            <li>不需安裝</li>
            <li>支援快速處理</li>
          </ul>

          <FotorAffiliateBlock />
          <h2 className="mt-6 text-xl font-semibold text-slate-900">
            更多相關工具
          </h2>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
            <li>
              <a href="/tools" className="text-blue-600 hover:underline">
                工具中心
              </a>
            </li>
            <li>
              <a href="/summary" className="text-blue-600 hover:underline">
                AI摘要工具
              </a>
            </li>
            <li>
              <a
                href="/tools/homework-helper"
                className="text-blue-600 hover:underline"
              >
                AI作業解題
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            建議先用 1080P 與快速測試確認影片能正常輸出，再依需求改成星光效果、平移、縮放或較長秒數。若要製作商品圖升級、社群宣傳圖或 YouTube 封面素材，也可先用圖片尺寸工具整理比例，再轉成短影音。
          </p>
          <div className="mt-8">
            <a
              href="/tools"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
            >
              👉 查看更多 AI 工具
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ImageToVideo() {
  return <ImageToVideoInner />;
}
