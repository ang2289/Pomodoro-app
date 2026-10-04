import { useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import SEO from "@/components/SEO";

type Ratio = "9:16" | "16:9" | "1:1" | "4:5";
type Quality = "720p" | "1080p";
type Effect = "static" | "zoom_in" | "zoom_out" | "fade";
type FitMode = "contain" | "cover";

const CORE_BASE =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

const RATIO_SIZE: Record<Ratio, Record<Quality, [number, number]>> = {
  "9:16": { "720p": [720, 1280], "1080p": [1080, 1920] },
  "16:9": { "720p": [1280, 720], "1080p": [1920, 1080] },
  "1:1": { "720p": [720, 720], "1080p": [1080, 1080] },
  "4:5": { "720p": [720, 900], "1080p": [1080, 1350] },
};

function getExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "mp3";
}

async function imageToJpeg(
  file: File,
  width: number,
  height: number,
  fitMode: FitMode,
) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("圖片讀取失敗"));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器無法建立圖片畫布");

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const scale =
      fitMode === "cover"
        ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
        : Math.min(width / img.naturalWidth, height / img.naturalHeight);

    const drawWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const drawHeight = Math.max(1, Math.round(img.naturalHeight * scale));
    const x = Math.round((width - drawWidth) / 2);
    const y = Math.round((height - drawHeight) / 2);

    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error("圖片轉換失敗"))),
        "image/jpeg",
        0.92,
      ),
    );

    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

function effectFilter(effect: Effect, width: number, height: number, seconds: number) {
  const frames = Math.max(1, Math.round(seconds * 30));
  if (effect === "zoom_in") {
    return `zoompan=z='min(zoom+0.0015,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=30`;
  }
  if (effect === "zoom_out") {
    return `zoompan=z='if(lte(on,1),1.12,max(1.0,zoom-0.0015))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=30`;
  }
  if (effect === "fade") {
    const outStart = Math.max(0, seconds - 0.45).toFixed(2);
    return `fps=30,fade=t=in:st=0:d=0.45,fade=t=out:st=${outStart}:d=0.45`;
  }
  return "fps=30";
}

export default function BrowserImageToMp4() {
  const [images, setImages] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [ratio, setRatio] = useState<Ratio>("9:16");
  const [quality, setQuality] = useState<Quality>("720p");
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [effect, setEffect] = useState<Effect>("zoom_in");
  const [secondsPerImage, setSecondsPerImage] = useState(2.5);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("尚未開始");
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);

  const [width, height] = RATIO_SIZE[ratio][quality];
  const totalSeconds = useMemo(
    () => Math.max(1, images.length) * secondsPerImage,
    [images.length, secondsPerImage],
  );

  const loadFfmpeg = async () => {
    if (!ffmpegRef.current) {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress: value }) => {
        const normalized = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
        setProgress(Math.max(12, Math.round(12 + normalized * 84)));
      });
      ffmpegRef.current = ffmpeg;
    }

    if (!loadedRef.current) {
      setStatus("第一次載入影片引擎，請稍候…");
      setProgress(4);
      const coreURL = await toBlobURL(
        `${CORE_BASE}/ffmpeg-core.js`,
        "text/javascript",
      );
      const wasmURL = await toBlobURL(
        `${CORE_BASE}/ffmpeg-core.wasm`,
        "application/wasm",
      );
      await ffmpegRef.current.load({ coreURL, wasmURL });
      loadedRef.current = true;
      setProgress(10);
    }

    return ffmpegRef.current;
  };

  const generate = async () => {
    if (busy) return;
    if (!images.length) {
      setError("請先選擇至少 1 張圖片。");
      return;
    }
    if (images.length > 12) {
      setError("公開版一次最多 12 張圖片，避免手機或瀏覽器記憶體不足。");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("準備圖片…");
    setProgress(1);

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }

    const ffmpeg = await loadFfmpeg();
    const created: string[] = [];

    try {
      for (let i = 0; i < images.length; i += 1) {
        setStatus(`處理圖片 ${i + 1} / ${images.length}…`);
        const data = await imageToJpeg(images[i], width, height, fitMode);
        const name = `rxv-img-${i}.jpg`;
        await ffmpeg.writeFile(name, data);
        created.push(name);
      }

      let audioName = "";
      if (audio) {
        const ext = getExtension(audio.name);
        audioName = `rxv-bgm.${ext}`;
        await ffmpeg.writeFile(audioName, await fetchFile(audio));
        created.push(audioName);
      }

      const args: string[] = [];
      images.forEach((_, i) => {
        args.push("-loop", "1", "-t", String(secondsPerImage), "-i", `rxv-img-${i}.jpg`);
      });

      if (audioName) {
        args.push("-stream_loop", "-1", "-i", audioName);
      }

      const filters: string[] = [];
      for (let i = 0; i < images.length; i += 1) {
        filters.push(
          `[${i}:v]scale=${width}:${height},setsar=1,${effectFilter(effect, width, height, secondsPerImage)},trim=duration=${secondsPerImage},setpts=PTS-STARTPTS[v${i}]`,
        );
      }
      filters.push(
        images.map((_, i) => `[v${i}]`).join("") +
          `concat=n=${images.length}:v=1:a=0[vout]`,
      );

      args.push(
        "-filter_complex",
        filters.join(";"),
        "-map",
        "[vout]",
      );

      if (audioName) {
        args.push(
          "-map",
          `${images.length}:a:0`,
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
        quality === "1080p" ? "24" : "25",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "30",
        "-movflags",
        "+faststart",
        "rxv-output.mp4",
      );

      setStatus("瀏覽器正在產生 MP4，請不要關閉頁面…");
      setProgress(Math.max(progress, 12));
      await ffmpeg.exec(args);

      const file = await ffmpeg.readFile("rxv-output.mp4");
      const bytes = file as Uint8Array;
      const copy = new Uint8Array(bytes.length);
      copy.set(bytes);
      const blob = new Blob([copy], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus("完成，影片只在你的裝置中產生。");

      try {
        await ffmpeg.deleteFile("rxv-output.mp4");
      } catch {}
    } catch (err) {
      setProgress(0);
      setStatus("產生失敗");
      setError(
        err instanceof Error
          ? err.message
          : "影片產生失敗。可先改用 720p、減少圖片數量後再試。",
      );
    } finally {
      for (const name of created) {
        try {
          await ffmpeg.deleteFile(name);
        } catch {}
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

  return (
    <>
      <SEO
        title="免費圖片轉 MP4｜瀏覽器本機製作短影片｜RxV"
        description="圖片直接在你的瀏覽器轉成 MP4，可加 MP3/BGM、縮放與淡入淡出效果；不上傳伺服器。"
        keywords="圖片轉MP4, 圖片轉影片, JPG轉MP4, PNG轉MP4, 免費影片工具"
        path="/tools/image-to-mp4"
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              免費・本機處理・不用上傳
            </span>
            <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
              圖片轉 MP4
            </h1>
            <p className="mt-2 leading-relaxed text-slate-600">
              選圖片後直接使用你自己的電腦或手機瀏覽器產生 MP4。圖片、MP3 與輸出影片不會上傳到 RxV 伺服器。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-sm font-black text-slate-800">
                1. 選擇圖片（最多 12 張）
              </label>
              <input
                className="mt-3 block w-full text-sm"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 12))}
              />
              <p className="mt-2 text-xs text-slate-500">
                已選 {images.length} 張；總長約 {totalSeconds.toFixed(1)} 秒。
              </p>

              <label className="mt-5 block text-sm font-black text-slate-800">
                2. 背景音樂（可不選）
              </label>
              <input
                className="mt-3 block w-full text-sm"
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac"
                onChange={(e) => setAudio(e.target.files?.[0] || null)}
              />
              <p className="mt-2 text-xs text-slate-500">
                支援 MP3／WAV／M4A 等常見音訊；音樂會依影片長度自動截斷。
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-black text-slate-800">
                  影片比例
                  <select
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value as Ratio)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="9:16">9:16 Shorts／Reels</option>
                    <option value="16:9">16:9 YouTube</option>
                    <option value="1:1">1:1 方形</option>
                    <option value="4:5">4:5 IG 貼文</option>
                  </select>
                </label>

                <label className="text-sm font-black text-slate-800">
                  畫質
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as Quality)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="720p">720p（手機建議）</option>
                    <option value="1080p">1080p（電腦建議）</option>
                  </select>
                </label>

                <label className="text-sm font-black text-slate-800">
                  圖片效果
                  <select
                    value={effect}
                    onChange={(e) => setEffect(e.target.value as Effect)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="static">靜態</option>
                    <option value="zoom_in">慢慢放大</option>
                    <option value="zoom_out">慢慢縮小</option>
                    <option value="fade">淡入淡出</option>
                  </select>
                </label>

                <label className="text-sm font-black text-slate-800">
                  圖片填滿方式
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as FitMode)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="contain">完整顯示（可能留黑邊）</option>
                    <option value="cover">裁切填滿</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 block text-sm font-black text-slate-800">
                每張停留秒數：{secondsPerImage.toFixed(1)} 秒
                <input
                  className="mt-2 w-full"
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={secondsPerImage}
                  onChange={(e) => setSecondsPerImage(Number(e.target.value))}
                />
              </label>

              <p className="mt-3 text-xs leading-relaxed text-amber-700">
                第一次使用會下載瀏覽器影片引擎，可能需要一些時間。手機若轉檔失敗，請改用 720p 或減少圖片張數。
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={generate}
                disabled={busy || images.length === 0}
                className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "正在產生…" : "開始產生 MP4"}
              </button>
              {resultUrl ? (
                <button
                  type="button"
                  onClick={download}
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white shadow"
                >
                  下載 MP4
                </button>
              ) : null}
              <span className="text-sm font-semibold text-slate-600">{status}</span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {error ? (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            ) : null}

            {resultUrl ? (
              <video
                className="mt-5 max-h-[560px] w-full rounded-2xl bg-black"
                src={resultUrl}
                controls
                playsInline
              />
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <strong className="text-emerald-800">隱私：</strong>圖片與音樂留在你的裝置。
            </div>
            <div className="rounded-xl bg-sky-50 p-3">
              <strong className="text-sky-800">成本：</strong>影片由使用者瀏覽器運算，不使用 RxV 轉檔伺服器。
            </div>
            <div className="rounded-xl bg-violet-50 p-3">
              <strong className="text-violet-800">用途：</strong>適合 Shorts、Reels、社群宣傳與商品影片。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
