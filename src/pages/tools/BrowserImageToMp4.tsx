import { useEffect, useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { QRCodeCanvas } from "qrcode.react";
import SEO from "@/components/SEO";

type Ratio = "9:16" | "16:9" | "1:1" | "4:5";
type Quality = "540p" | "720p" | "1080p";
type Effect =
  | "static"
  | "zoom_in"
  | "zoom_out"
  | "fade"
  | "pan_left"
  | "pan_right"
  | "pan_up"
  | "pan_down";
type FitMode = "contain" | "cover";
type QrPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type CaptionPosition = "top" | "bottom";

const RATIO_SIZE: Record<Ratio, Record<Quality, [number, number]>> = {
  "9:16": {
    "540p": [540, 960],
    "720p": [720, 1280],
    "1080p": [1080, 1920],
  },
  "16:9": {
    "540p": [960, 540],
    "720p": [1280, 720],
    "1080p": [1920, 1080],
  },
  "1:1": {
    "540p": [540, 540],
    "720p": [720, 720],
    "1080p": [1080, 1080],
  },
  "4:5": {
    "540p": [540, 675],
    "720p": [720, 900],
    "1080p": [1080, 1350],
  },
};

function getExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "mp3";
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const chars = Array.from(text.trim());
  const lines: string[] = [];
  let current = "";

  chars.forEach((char) => {
    const candidate = current + char;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  position: CaptionPosition,
  fontSize: number,
) {
  if (!text.trim()) return;

  const scaledFont = Math.max(18, Math.round((fontSize / 1080) * width));
  const paddingX = Math.round(width * 0.055);
  const paddingY = Math.round(height * 0.025);
  const lineHeight = Math.round(scaledFont * 1.3);

  ctx.save();
  ctx.font = `700 ${scaledFont}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapCanvasText(ctx, text, width - paddingX * 2);
  const boxHeight = lines.length * lineHeight + paddingY * 2;
  const boxY =
    position === "top"
      ? Math.round(height * 0.035)
      : height - boxHeight - Math.round(height * 0.035);

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(
    Math.round(width * 0.035),
    boxY,
    Math.round(width * 0.93),
    boxHeight,
  );

  ctx.fillStyle = "#ffffff";
  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      width / 2,
      boxY + paddingY + lineHeight * index + lineHeight / 2,
      width - paddingX * 2,
    );
  });
  ctx.restore();
}

function drawQrOverlay(
  ctx: CanvasRenderingContext2D,
  qrCanvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  position: QrPosition,
  percent: number,
) {
  if (!qrCanvas) return;

  const size = Math.round(Math.min(width, height) * (percent / 100));
  const outerPadding = Math.max(10, Math.round(size * 0.08));
  const edge = Math.max(14, Math.round(Math.min(width, height) * 0.025));
  const boxSize = size + outerPadding * 2;

  const x =
    position.endsWith("right")
      ? width - boxSize - edge
      : edge;
  const y =
    position.startsWith("bottom")
      ? height - boxSize - edge
      : edge;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillRect(x, y, boxSize, boxSize);
  ctx.drawImage(
    qrCanvas,
    x + outerPadding,
    y + outerPadding,
    size,
    size,
  );
  ctx.restore();
}

async function imageToJpeg(
  file: File,
  width: number,
  height: number,
  fitMode: FitMode,
  background: "#000000" | "#ffffff",
  caption: string,
  captionPosition: CaptionPosition,
  captionFontSize: number,
  qrCanvas: HTMLCanvasElement | null,
  qrPosition: QrPosition,
  qrPercent: number,
) {
  const url = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`圖片讀取失敗：${file.name}`));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器無法建立圖片畫布");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const scale =
      fitMode === "cover"
        ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
        : Math.min(width / img.naturalWidth, height / img.naturalHeight);

    const drawWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const drawHeight = Math.max(1, Math.round(img.naturalHeight * scale));
    const x = Math.round((width - drawWidth) / 2);
    const y = Math.round((height - drawHeight) / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    drawCaption(
      ctx,
      caption,
      width,
      height,
      captionPosition,
      captionFontSize,
    );
    drawQrOverlay(
      ctx,
      qrCanvas,
      width,
      height,
      qrPosition,
      qrPercent,
    );

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("圖片轉換失敗")),
        "image/jpeg",
        0.92,
      ),
    );

    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

function effectFilter(
  effect: Effect,
  width: number,
  height: number,
  seconds: number,
  fps: number,
) {
  const frames = Math.max(1, Math.round(seconds * fps));
  const denom = Math.max(1, frames - 1);
  const zoomStep = Math.max(0.0005, 0.14 / frames).toFixed(6);

  if (effect === "zoom_in") {
    return `zoompan=z='min(zoom+${zoomStep},1.14)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "zoom_out") {
    return `zoompan=z='if(lte(on,1),1.14,max(1.0,zoom-${zoomStep}))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_left") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)*(1-on/${denom})':y='(ih-ih/zoom)/2':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_right") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)*(on/${denom})':y='(ih-ih/zoom)/2':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_up") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(1-on/${denom})':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_down") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(on/${denom})':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "fade") {
    const outStart = Math.max(0, seconds - 0.45).toFixed(2);
    return `fps=${fps},fade=t=in:st=0:d=0.35,fade=t=out:st=${outStart}:d=0.35`;
  }
  return `fps=${fps}`;
}

function getNativeMp4MimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4;codecs="avc1.42E01E"',
    "video/mp4",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function loadImageElement(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`圖片讀取失敗：${file.name}`));
      element.src = url;
    });
    return image;
  } finally {
    // Delay revocation until the element has decoded the image data.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function drawNativeVideoFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  fitMode: FitMode,
  background: "#000000" | "#ffffff",
  effect: Effect,
  progress: number,
  caption: string,
  captionPosition: CaptionPosition,
  captionFontSize: number,
  qrCanvas: HTMLCanvasElement | null,
  qrPosition: QrPosition,
  qrPercent: number,
) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const baseScale =
    fitMode === "cover"
      ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
      : Math.min(width / image.naturalWidth, height / image.naturalHeight);

  let motionScale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (effect === "zoom_in") motionScale = 1 + progress * 0.12;
  if (effect === "zoom_out") motionScale = 1.12 - progress * 0.12;

  if (
    effect === "pan_left" ||
    effect === "pan_right" ||
    effect === "pan_up" ||
    effect === "pan_down"
  ) {
    motionScale = 1.08;
    const shiftX = width * 0.055;
    const shiftY = height * 0.04;

    if (effect === "pan_left") offsetX = shiftX - progress * shiftX * 2;
    if (effect === "pan_right") offsetX = -shiftX + progress * shiftX * 2;
    if (effect === "pan_up") offsetY = shiftY - progress * shiftY * 2;
    if (effect === "pan_down") offsetY = -shiftY + progress * shiftY * 2;
  }

  if (effect === "fade") {
    const fadePart = 0.16;
    if (progress < fadePart) ctx.globalAlpha = progress / fadePart;
    else if (progress > 1 - fadePart) {
      ctx.globalAlpha = (1 - progress) / fadePart;
    }
  }

  const drawWidth = image.naturalWidth * baseScale * motionScale;
  const drawHeight = image.naturalHeight * baseScale * motionScale;
  const x = (width - drawWidth) / 2 + offsetX;
  const y = (height - drawHeight) / 2 + offsetY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();

  drawCaption(
    ctx,
    caption,
    width,
    height,
    captionPosition,
    captionFontSize,
  );
  drawQrOverlay(
    ctx,
    qrCanvas,
    width,
    height,
    qrPosition,
    qrPercent,
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function BrowserImageToMp4() {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [ratio, setRatio] = useState<Ratio>("9:16");
  const [quality, setQuality] = useState<Quality>("540p");
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [background, setBackground] = useState<"#000000" | "#ffffff">("#000000");
  const [effect, setEffect] = useState<Effect>("zoom_in");
  const [secondsPerImage, setSecondsPerImage] = useState(2.5);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [caption, setCaption] = useState("");
  const [captionPosition, setCaptionPosition] =
    useState<CaptionPosition>("bottom");
  const [captionFontSize, setCaptionFontSize] = useState(54);
  const [qrEnabled, setQrEnabled] = useState(false);
  const [qrText, setQrText] = useState("");
  const [qrPosition, setQrPosition] =
    useState<QrPosition>("bottom-right");
  const [qrPercent, setQrPercent] = useState(18);
  const [busy, setBusy] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("尚未開始");
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [renderMode, setRenderMode] = useState<"native" | "ffmpeg" | "">("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);

  const [width, height] = RATIO_SIZE[ratio][quality];
  const nativeMp4MimeType = getNativeMp4MimeType();
  const nativeMp4Available =
    Boolean(nativeMp4MimeType) &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype;
  const outputFps = quality === "540p" ? 15 : quality === "720p" ? 18 : 20;
  const encodeTimeoutMs =
    quality === "540p" ? 180_000 : quality === "720p" ? 240_000 : 300_000;

  const totalSeconds = useMemo(
    () => images.length * secondsPerImage,
    [images.length, secondsPerImage],
  );

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const loadFfmpeg = async () => {
    if (loadedRef.current && ffmpegRef.current) return ffmpegRef.current;

    const classWorkerURL = new URL(
      "/ffmpeg-worker/worker.js?v=0.12.15",
      window.location.origin,
    ).href;

    const localBase = new URL("/ffmpeg-core/", window.location.origin).href;
    const sources = [
      {
        label: "本站影片引擎",
        coreURL: `${localBase}ffmpeg-core.js?v=0.12.10`,
        wasmURL: `${localBase}ffmpeg-core.wasm?v=0.12.10`,
      },
      {
        label: "備援影片引擎 1",
        coreURL:
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
        wasmURL:
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
      },
      {
        label: "備援影片引擎 2",
        coreURL:
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
        wasmURL:
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
      },
    ];

    const fetchEngineAsset = async (
      url: string,
      kind: "core" | "wasm",
      label: string,
    ) => {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${label}下載失敗：HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (kind === "core") {
        const head = new TextDecoder()
          .decode(bytes.slice(0, Math.min(bytes.length, 160)))
          .trim()
          .toLowerCase();

        if (
          bytes.length < 100_000 ||
          head.startsWith("<!doctype") ||
          head.startsWith("<html")
        ) {
          throw new Error(
            `${label}不是有效的 FFmpeg JavaScript（可能被網站路由取代）`,
          );
        }

        return URL.createObjectURL(
          new Blob([buffer], { type: "text/javascript" }),
        );
      }

      const isWasm =
        bytes.length > 1_000_000 &&
        bytes[0] === 0x00 &&
        bytes[1] === 0x61 &&
        bytes[2] === 0x73 &&
        bytes[3] === 0x6d;

      if (!isWasm) {
        throw new Error(`${label}不是有效的 WebAssembly 檔案`);
      }

      return URL.createObjectURL(
        new Blob([buffer], { type: "application/wasm" }),
      );
    };

    setStatus("正在檢查影片引擎檔案…");
    setProgress(4);

    const errors: string[] = [];

    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index];
      const ffmpeg = new FFmpeg();
      let coreBlobURL = "";
      let wasmBlobURL = "";

      ffmpeg.on("progress", ({ progress: value }) => {
        const normalized = Number.isFinite(value)
          ? Math.max(0, Math.min(1, value))
          : 0;
        setProgress(Math.max(18, Math.min(90, Math.round(18 + normalized * 72))));
      });

      ffmpeg.on("log", ({ message }) => {
        if (message) console.debug("[RxV FFmpeg]", message);
      });

      try {
        setStatus(
          index === 0
            ? "正在載入本站影片引擎，第一次使用會比較久…"
            : `正在嘗試${source.label}…`,
        );
        setProgress(5 + index * 3);

        // The class worker must be a real same-origin module. Test it first so
        // failures are reported clearly instead of surfacing as "unknown error".
        const workerCheck = await fetch(classWorkerURL, {
          method: "GET",
          cache: "no-store",
        });
        if (!workerCheck.ok) {
          throw new Error(
            `FFmpeg Worker 不存在：HTTP ${workerCheck.status}`,
          );
        }
        const workerHead = (await workerCheck.clone().text())
          .slice(0, 100)
          .trim()
          .toLowerCase();
        if (
          workerHead.startsWith("<!doctype") ||
          workerHead.startsWith("<html")
        ) {
          throw new Error("FFmpeg Worker 被網站首頁取代，尚未正確部署");
        }

        coreBlobURL = await fetchEngineAsset(
          source.coreURL,
          "core",
          source.label,
        );
        wasmBlobURL = await fetchEngineAsset(
          source.wasmURL,
          "wasm",
          source.label,
        );

        const controller = new AbortController();
        const timeoutId = window.setTimeout(
          () => controller.abort(),
          45000,
        );

        try {
          await ffmpeg.load(
            {
              coreURL: coreBlobURL,
              wasmURL: wasmBlobURL,
              classWorkerURL,
            },
            { signal: controller.signal },
          );
        } finally {
          window.clearTimeout(timeoutId);
        }

        ffmpegRef.current = ffmpeg;
        loadedRef.current = true;
        setEngineReady(true);
        setStatus(
          index === 0
            ? "影片引擎已就緒（本站）"
            : `影片引擎已就緒（${source.label}）`,
        );
        setProgress(15);

        window.setTimeout(() => {
          if (coreBlobURL) URL.revokeObjectURL(coreBlobURL);
          if (wasmBlobURL) URL.revokeObjectURL(wasmBlobURL);
        }, 5000);

        return ffmpeg;
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === "AbortError"
            ? `${source.label}初始化超過 45 秒`
            : err instanceof Error
              ? err.message
              : String(err || "未知錯誤");

        errors.push(`${source.label}：${message}`);

        if (coreBlobURL) URL.revokeObjectURL(coreBlobURL);
        if (wasmBlobURL) URL.revokeObjectURL(wasmBlobURL);

        try {
          ffmpeg.terminate();
        } catch {}
      }
    }

    ffmpegRef.current = null;
    loadedRef.current = false;
    setEngineReady(false);

    throw new Error(
      `影片引擎仍無法載入。診斷：${errors.join("｜")}。目前使用 ESM 版 FFmpeg Core；請把這段診斷文字截圖給我。`,
    );
  };

  const preloadEngine = async () => {
    if (busy || engineReady) return;

    setBusy(true);
    setError("");

    try {
      await loadFfmpeg();
    } catch (err) {
      setProgress(0);
      setStatus("影片引擎載入失敗");
      setError(
        err instanceof Error
          ? err.message
          : "無法載入影片引擎，請重新整理後再試。",
      );
    } finally {
      setBusy(false);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const cancelGeneration = () => {
    try {
      ffmpegRef.current?.terminate();
    } catch {}
    ffmpegRef.current = null;
    loadedRef.current = false;
    setEngineReady(false);
    setBusy(false);
    setProgress(0);
    setRenderMode("");
    setStatus("已取消。下次可重新產生。");
  };

  const generateWithNativeRecorder = async () => {
    if (!nativeMp4Available || !nativeMp4MimeType) {
      throw new Error("此瀏覽器沒有原生 MP4 錄製能力");
    }

    setRenderMode("native");
    setStatus("⚡ 使用瀏覽器原生編碼器，正在準備圖片…");
    setProgress(6);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("瀏覽器無法建立影片畫布");

    const loadedImages = await Promise.all(images.map(loadImageElement));
    const videoStream = canvas.captureStream(outputFps);
    const combinedStream = new MediaStream(videoStream.getVideoTracks());

    let audioContext: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;

    if (audio) {
      setStatus("⚡ 正在準備背景音樂…");
      audioContext = new AudioContext();
      await audioContext.resume();

      const audioBuffer = await audioContext.decodeAudioData(
        await audio.arrayBuffer(),
      );
      const destination = audioContext.createMediaStreamDestination();
      const gain = audioContext.createGain();
      gain.gain.value = audioVolume;
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.loop = true;
      audioSource.connect(gain);
      gain.connect(destination);

      destination.stream.getAudioTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });
    }

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(combinedStream, {
      mimeType: nativeMp4MimeType,
      videoBitsPerSecond:
        quality === "1080p"
          ? 5_000_000
          : quality === "720p"
            ? 3_200_000
            : 2_000_000,
      audioBitsPerSecond: 128_000,
    });

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => {
        reject(new Error("瀏覽器原生影片編碼失敗"));
      };
      recorder.onstop = () => resolve();
    });

    try {
      recorder.start(1000);
      audioSource?.start();

      const frameInterval = 1000 / outputFps;
      const totalFrames = Math.max(1, Math.ceil(totalSeconds * outputFps));
      const startedAt = performance.now();

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
        const videoTimeSec = frameIndex / outputFps;
        const imageIndex = Math.min(
          images.length - 1,
          Math.floor(videoTimeSec / secondsPerImage),
        );
        const imageTime =
          videoTimeSec - imageIndex * secondsPerImage;
        const imageProgress = Math.max(
          0,
          Math.min(1, imageTime / secondsPerImage),
        );

        drawNativeVideoFrame(
          ctx,
          loadedImages[imageIndex],
          width,
          height,
          fitMode,
          background,
          effect,
          imageProgress,
          caption,
          captionPosition,
          captionFontSize,
          qrEnabled ? qrCanvasRef.current : null,
          qrPosition,
          qrPercent,
        );

        const targetElapsed = (frameIndex + 1) * frameInterval;
        const actualElapsed = performance.now() - startedAt;
        const delay = targetElapsed - actualElapsed;
        if (delay > 0) await wait(delay);

        const pct = Math.min(
          92,
          10 + Math.round(((frameIndex + 1) / totalFrames) * 82),
        );
        setProgress(pct);
        setStatus(
          `⚡ 快速模式正在產生 MP4：${Math.min(
            totalSeconds,
            (frameIndex + 1) / outputFps,
          ).toFixed(1)} / ${totalSeconds.toFixed(1)} 秒`,
        );
      }

      setProgress(94);
      setStatus("⚡ 影片畫面完成，正在封裝 MP4…");
      await wait(250);
      recorder.stop();
      await stopped;

      const blob = new Blob(chunks, {
        type: recorder.mimeType || nativeMp4MimeType || "video/mp4",
      });
      if (!blob.size) throw new Error("瀏覽器產生的 MP4 是 0KB");

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus(
        `完成！⚡ 原生快速模式，影片大小約 ${(
          blob.size /
          1024 /
          1024
        ).toFixed(1)} MB。`,
      );
      return true;
    } finally {
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {}
      try {
        audioSource?.stop();
      } catch {}
      try {
        await audioContext?.close();
      } catch {}
      combinedStream.getTracks().forEach((track) => track.stop());
      videoStream.getTracks().forEach((track) => track.stop());
    }
  };

  const generate = async () => {
    if (busy) return;

    if (!images.length) {
      setError("請先選擇至少 1 張圖片。");
      return;
    }
    if (images.length > 12) {
      setError("一次最多 12 張圖片，避免手機或瀏覽器記憶體不足。");
      return;
    }
    if (qrEnabled && !qrText.trim()) {
      setError("已開啟 QR Code，請輸入網址或文字。");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("準備開始…");
    setProgress(1);

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }

    let ffmpeg: FFmpeg | null = null;
    const created: string[] = [];

    try {
      if (nativeMp4Available) {
        try {
          const completed = await generateWithNativeRecorder();
          if (completed) return;
        } catch (nativeError) {
          setStatus("⚠️ 原生快速模式失敗，改用 FFmpeg 相容模式…");
          setProgress(3);
          console.warn("[RxV native MP4 fallback]", nativeError);
        }
      }

      setRenderMode("ffmpeg");
      ffmpeg = await loadFfmpeg();

      for (let i = 0; i < images.length; i += 1) {
        setStatus(`處理圖片 ${i + 1} / ${images.length}…`);
        setProgress(
          Math.max(16, Math.round(16 + ((i + 1) / images.length) * 12)),
        );

        const data = await imageToJpeg(
          images[i],
          width,
          height,
          fitMode,
          background,
          caption,
          captionPosition,
          captionFontSize,
          qrEnabled ? qrCanvasRef.current : null,
          qrPosition,
          qrPercent,
        );
        const name = `rxv-img-${i}.jpg`;
        await ffmpeg.writeFile(name, data);
        created.push(name);
      }

      let audioName = "";
      if (audio) {
        setStatus("加入背景音樂…");
        const ext = getExtension(audio.name);
        audioName = `rxv-bgm.${ext}`;
        await ffmpeg.writeFile(audioName, await fetchFile(audio));
        created.push(audioName);
      }

      const args: string[] = [];
      images.forEach((_, i) => {
        args.push(
          "-loop",
          "1",
          "-t",
          String(secondsPerImage),
          "-i",
          `rxv-img-${i}.jpg`,
        );
      });

      if (audioName) {
        args.push("-stream_loop", "-1", "-i", audioName);
      }

      const filters: string[] = [];
      for (let i = 0; i < images.length; i += 1) {
        filters.push(
          `[${i}:v]setsar=1,${effectFilter(
            effect,
            width,
            height,
            secondsPerImage,
            outputFps,
          )},trim=duration=${secondsPerImage},setpts=PTS-STARTPTS[v${i}]`,
        );
      }

      filters.push(
        images.map((_, i) => `[v${i}]`).join("") +
          `concat=n=${images.length}:v=1:a=0[vout]`,
      );

      if (audioName) {
        filters.push(
          `[${images.length}:a]volume=${audioVolume.toFixed(2)}[aout]`,
        );
      }

      args.push(
        "-filter_complex",
        filters.join(";"),
        "-map",
        "[vout]",
      );

      if (audioName) {
        args.push(
          "-map",
          "[aout]",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-shortest",
        );
      } else {
        args.push("-an");
      }

      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        quality === "1080p" ? "26" : quality === "720p" ? "27" : "28",
        "-pix_fmt",
        "yuv420p",
        "-r",
        String(outputFps),
        "-threads",
        "1",
        "-movflags",
        "+faststart",
        "rxv-output.mp4",
      );

      setStatus(
        `相容模式正在產生 MP4（${quality}・${outputFps}fps・約 ${totalSeconds.toFixed(1)} 秒），此模式會比較慢…`,
      );
      setProgress(Math.max(30, progress));

      const exitCode = await ffmpeg.exec(args, encodeTimeoutMs);
      if (exitCode !== 0) {
        const minutes = Math.round(encodeTimeoutMs / 60_000);
        throw new Error(
          `轉檔超過 ${minutes} 分鐘已自動停止。建議改用「540p 快速」或減少圖片張數後再試。`,
        );
      }

      setProgress(94);
      setStatus("影片已編碼完成，正在最後封裝 MP4…");
      await wait(30);

      const file = await ffmpeg.readFile("rxv-output.mp4");
      setProgress(98);
      const bytes = file as Uint8Array;
      const copy = new Uint8Array(bytes.length);
      copy.set(bytes);

      const blob = new Blob([copy], { type: "video/mp4" });
      if (blob.size === 0) throw new Error("產生的影片是 0KB，請重新再試。");

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus(
        `完成！影片大小約 ${(blob.size / 1024 / 1024).toFixed(1)} MB。`,
      );

      try {
        await ffmpeg.deleteFile("rxv-output.mp4");
      } catch {}
    } catch (err) {
      setProgress(0);
      setStatus("產生失敗");
      setError(
        err instanceof Error
          ? err.message
          : "影片產生失敗。建議使用最新版 Chrome／Edge，或先改用 540p、減少圖片張數後再試。",
      );
    } finally {
      if (ffmpeg) {
        for (const name of created) {
          try {
            await ffmpeg.deleteFile(name);
          } catch {}
        }
      }
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `rxv-image-to-mp4-${ratio.replace(":", "x")}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const pickerButtonClass =
    "inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <>
      <SEO
        title="免費圖片轉 MP4｜加音樂、字幕、QR Code｜RxV"
        description="圖片直接在你的瀏覽器轉成 MP4，可設定秒數、MP3/BGM、字幕、QR Code、縮放與平移效果；不上傳伺服器。"
        keywords="圖片轉MP4, 圖片轉影片, JPG轉MP4, PNG轉MP4, QR Code影片, 免費影片工具"
        path="/tools/image-to-mp4"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-sm [overflow-wrap:anywhere] sm:p-7">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                免費・本機處理・不用上傳
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                  nativeMp4Available
                    ? "bg-blue-100 text-blue-800"
                    : engineReady
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {nativeMp4Available
                  ? "⚡ 原生快速 MP4 可用"
                  : engineReady
                    ? "✓ FFmpeg 相容引擎已載入"
                    : "FFmpeg 相容引擎尚未載入"}
              </span>
            </div>

            <h1 className="mt-3 break-words text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              圖片轉 MP4｜音樂・字幕・QR Code・動畫效果
            </h1>
            <p className="mt-2 max-w-4xl break-words leading-7 text-slate-600">
              圖片、音樂與影片都留在你的裝置。先選圖片，再設定每張秒數、畫面比例、特效、字幕與 QR Code，最後由瀏覽器直接產生 MP4。
            </p>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    1
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-base font-black text-slate-900">
                      選擇圖片（最多 12 張）
                    </h2>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      上傳順序就是播放順序；下面可以再調整。
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className={`${pickerButtonClass} mt-4`}
                >
                  🖼️ 選擇圖片
                </button>
                <input
                  ref={imageInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setImages(
                      Array.from(e.target.files || []).slice(0, 12),
                    )
                  }
                />

                <p className="mt-3 break-words text-sm font-bold text-slate-700">
                  已選 {images.length} 張
                  {images.length
                    ? `｜預估影片 ${totalSeconds.toFixed(1)} 秒｜${outputFps} fps`
                    : ""}
                </p>

                {images.length ? (
                  <div className="mt-3 space-y-2">
                    {images.map((file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="grid min-w-0 grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[104px_minmax(0,1fr)]"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {imagePreviewUrls[index] ? (
                            <img
                              src={imagePreviewUrls[index]}
                              alt={`第 ${index + 1} 張預覽：${file.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                              載入中
                            </div>
                          )}
                          <span className="absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-black text-white shadow">
                            {index + 1}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p
                            className="line-clamp-2 break-all text-sm font-bold leading-5 text-slate-800"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveImage(index, -1)}
                              disabled={index === 0 || busy}
                              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30"
                            >
                              ↑ 上移
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(index, 1)}
                              disabled={index === images.length - 1 || busy}
                              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30"
                            >
                              ↓ 下移
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              disabled={busy}
                              className="min-h-9 rounded-lg border border-rose-200 bg-white px-3 text-xs font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-30"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">
                    2
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-base font-black text-slate-900">
                      背景音樂（可不選）
                    </h2>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      支援 MP3／WAV／M4A 等常見音訊，會依影片長度自動截斷。
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className={`${pickerButtonClass} mt-4`}
                >
                  🎵 {audio ? "更換背景音樂" : "選擇 MP3 / 音樂檔"}
                </button>
                <input
                  ref={audioInputRef}
                  className="hidden"
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac"
                  onChange={(e) => setAudio(e.target.files?.[0] || null)}
                />

                {audio ? (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <p className="break-all text-xs font-bold text-slate-700">
                      {audio.name}
                    </p>
                    <label className="mt-3 block text-xs font-black text-slate-700">
                      音樂音量：{Math.round(audioVolume * 100)}%
                      <input
                        className="mt-2 w-full"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioVolume}
                        onChange={(e) =>
                          setAudioVolume(Number(e.target.value))
                        }
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">
                  3
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-base font-black text-slate-900">
                    設定影片效果
                  </h2>
                  <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                    秒數、畫質、動畫、字幕與 QR Code 都在這裡設定。
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="min-w-0 text-sm font-black text-slate-800">
                  影片比例
                  <select
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value as Ratio)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="9:16">9:16 直式</option>
                    <option value="16:9">16:9 橫式</option>
                    <option value="1:1">1:1 方形</option>
                    <option value="4:5">4:5 直式貼文</option>
                  </select>
                  <span className="mt-1 block break-words text-xs font-medium leading-5 text-slate-500">
                    9:16 適合 Shorts／Reels／TikTok；16:9 適合 YouTube。
                  </span>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  畫質
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as Quality)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="540p">540p｜快速（建議）</option>
                    <option value="720p">720p｜標準</option>
                    <option value="1080p">1080p｜較慢</option>
                  </select>
                  <span className="mt-1 block break-words text-xs font-medium leading-5 text-slate-500">
                    540p 最適合瀏覽器快速產生；720p 較清晰；1080p 最吃效能、可能需要較久。
                  </span>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  圖片動畫
                  <select
                    value={effect}
                    onChange={(e) => setEffect(e.target.value as Effect)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="static">靜態</option>
                    <option value="zoom_in">慢慢放大</option>
                    <option value="zoom_out">慢慢縮小</option>
                    <option value="fade">淡入淡出</option>
                    <option value="pan_left">向左平移</option>
                    <option value="pan_right">向右平移</option>
                    <option value="pan_up">向上平移</option>
                    <option value="pan_down">向下平移</option>
                  </select>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  圖片顯示
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as FitMode)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="contain">完整顯示</option>
                    <option value="cover">裁切填滿</option>
                  </select>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  留白背景
                  <select
                    value={background}
                    onChange={(e) =>
                      setBackground(
                        e.target.value as "#000000" | "#ffffff",
                      )
                    }
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="#000000">黑色</option>
                    <option value="#ffffff">白色</option>
                  </select>
                </label>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800">
                    每張圖片停留秒數
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[1, 2, 3, 5].map((seconds) => (
                      <button
                        key={seconds}
                        type="button"
                        onClick={() => setSecondsPerImage(seconds)}
                        className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                          secondsPerImage === seconds
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                        }`}
                      >
                        {seconds} 秒
                      </button>
                    ))}
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                    自訂
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={secondsPerImage}
                      onChange={(e) =>
                        setSecondsPerImage(
                          Math.max(
                            0.5,
                            Math.min(10, Number(e.target.value) || 0.5),
                          ),
                        )
                      }
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1.5"
                    />
                    秒
                  </label>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <p className="text-sm font-black text-violet-900">
                  字幕／宣傳文字（可不填）
                </p>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  maxLength={90}
                  placeholder="例如：更多免費圖片請到 RxV 圖片庫"
                  className="mt-2 w-full resize-y rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm leading-6"
                />
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <label className="text-xs font-black text-slate-700">
                    文字位置
                    <select
                      value={captionPosition}
                      onChange={(e) =>
                        setCaptionPosition(
                          e.target.value as CaptionPosition,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                    >
                      <option value="bottom">下方</option>
                      <option value="top">上方</option>
                    </select>
                  </label>
                  <label className="text-xs font-black text-slate-700">
                    字體大小：{captionFontSize}
                    <input
                      className="mt-2 w-full"
                      type="range"
                      min="36"
                      max="86"
                      step="2"
                      value={captionFontSize}
                      onChange={(e) =>
                        setCaptionFontSize(Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={qrEnabled}
                    onChange={(e) => setQrEnabled(e.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-black text-emerald-900">
                    加入 QR Code
                  </span>
                </label>

                {qrEnabled ? (
                  <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0 space-y-3">
                      <label className="block text-xs font-black text-slate-700">
                        QR Code 網址／文字
                        <input
                          value={qrText}
                          onChange={(e) => setQrText(e.target.value)}
                          placeholder="https://..."
                          className="mt-1 w-full min-w-0 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm"
                        />
                      </label>

                      <div className="grid gap-3 lg:grid-cols-2">
                        <label className="text-xs font-black text-slate-700">
                          QR 位置
                          <select
                            value={qrPosition}
                            onChange={(e) =>
                              setQrPosition(
                                e.target.value as QrPosition,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                          >
                            <option value="bottom-right">右下</option>
                            <option value="bottom-left">左下</option>
                            <option value="top-right">右上</option>
                            <option value="top-left">左上</option>
                          </select>
                        </label>
                        <label className="text-xs font-black text-slate-700">
                          QR 大小：{qrPercent}%
                          <input
                            className="mt-2 w-full"
                            type="range"
                            min="12"
                            max="28"
                            step="1"
                            value={qrPercent}
                            onChange={(e) =>
                              setQrPercent(Number(e.target.value))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-center rounded-xl bg-white p-3 shadow-sm">
                      <QRCodeCanvas
                        ref={qrCanvasRef}
                        value={qrText.trim() || "https://example.com"}
                        size={128}
                        level="M"
                        marginSize={1}
                      />
                    </div>
                  </div>
                ) : (
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value="https://example.com"
                    size={128}
                    className="hidden"
                  />
                )}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                4
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-base font-black text-slate-900">
                  產生 MP4
                </h2>
                <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                  如果你的瀏覽器支援原生 MP4，會優先使用「⚡ 快速模式」，10 秒影片通常接近影片實際秒數即可完成；只有不支援時才使用較慢的 FFmpeg 相容模式。
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!nativeMp4Available && !engineReady ? (
                <button
                  type="button"
                  onClick={preloadEngine}
                  disabled={busy}
                  className="rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md disabled:opacity-50"
                >
                  載入 FFmpeg 相容引擎
                </button>
              ) : null}

              <button
                type="button"
                onClick={generate}
                disabled={busy || images.length === 0}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? renderMode === "native"
                    ? "⚡ 快速產生中…"
                    : "正在處理…"
                  : nativeMp4Available
                    ? "⚡ 快速產生 MP4"
                    : "開始產生 MP4"}
              </button>

              {busy ? (
                <button
                  type="button"
                  onClick={cancelGeneration}
                  className="rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-50"
                >
                  取消
                </button>
              ) : null}

              {resultUrl ? (
                <button
                  type="button"
                  onClick={download}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                >
                  下載 MP4
                </button>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="break-words text-sm font-bold text-slate-700">
                  {status}
                </span>
                <span className="text-xs font-black text-blue-700">
                  {progress}%
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {error ? (
              <p className="mt-3 break-words rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold leading-6 text-rose-700">
                {error}
              </p>
            ) : null}

            {resultUrl ? (
              <video
                className="mt-5 max-h-[620px] w-full rounded-2xl bg-black"
                src={resultUrl}
                controls
                playsInline
              />
            ) : null}
          </section>

          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="break-words rounded-xl bg-emerald-50 p-3">
              <strong className="text-emerald-800">隱私：</strong>
              圖片、音樂與輸出影片留在你的裝置。
            </div>
            <div className="break-words rounded-xl bg-sky-50 p-3">
              <strong className="text-sky-800">成本：</strong>
              影片由使用者瀏覽器運算，不使用 RxV 轉檔伺服器。
            </div>
            <div className="break-words rounded-xl bg-violet-50 p-3">
              <strong className="text-violet-800">用途：</strong>
              適合 Shorts、Reels、TikTok、商品與社群宣傳影片。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
