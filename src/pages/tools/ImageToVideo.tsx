import React, { useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_IMAGES = 12;
const CORE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
type Ratio = "9:16" | "1:1" | "16:9";
type Quality = "720p" | "1080p";
type Fit = "contain" | "cover";
type Stage = "idle" | "loading" | "preparing" | "encoding" | "done" | "error";
type Item = { id: string; file: File; url: string };

const ratioInfo: Record<Ratio, { label: string; platforms: string }> = {
  "9:16": { label: "直式 9:16", platforms: "Reels／TikTok／YouTube Shorts" },
  "1:1": { label: "方形 1:1", platforms: "Facebook／Instagram 貼文" },
  "16:9": { label: "橫式 16:9", platforms: "YouTube／Facebook 橫式影片" },
};

function sizeOf(ratio: Ratio, quality: Quality) {
  const high = quality === "1080p";
  if (ratio === "9:16") return high ? [1080, 1920] : [720, 1280];
  if (ratio === "16:9") return high ? [1920, 1080] : [1280, 720];
  return high ? [1080, 1080] : [720, 720];
}

function toJpeg(file: File, width: number, height: number, fit: Fit): Promise<Blob> {
  return createImageBitmap(file).then((bitmap) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器無法處理圖片");
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    const scale = fit === "cover"
      ? Math.max(width / bitmap.width, height / bitmap.height)
      : Math.min(width / bitmap.width, height / bitmap.height);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, Math.round((width - w) / 2), Math.round((height - h) / 2), w, h);
    bitmap.close();
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("圖片轉換失敗")), "image/jpeg", 0.9),
    );
  });
}

export default function ImageToVideo() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [images, setImages] = useState<Item[]>([]);
  const [purpose, setPurpose] = useState("通用短影音");
  const [ratio, setRatio] = useState<Ratio>("9:16");
  const [quality, setQuality] = useState<Quality>("720p");
  const [fit, setFit] = useState<Fit>("contain");
  const [seconds, setSeconds] = useState(15);
  const [custom, setCustom] = useState(false);
  const [music, setMusic] = useState<File | null>(null);
  const [volume, setVolume] = useState(35);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const duration = custom ? Math.min(30, Math.max(5, seconds)) : seconds;
  const [width, height] = sizeOf(ratio, quality);
  const each = images.length ? duration / images.length : 0;
  const busy = stage === "loading" || stage === "preparing" || stage === "encoding";
  const outputName = useMemo(() => `RXV_${ratio.replace(":", "x")}_${duration}s.mp4`, [ratio, duration]);

  const clearResult = () => {
    setMessage("");
    setProgress(0);
    setStage("idle");
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    clearResult();
    const left = MAX_IMAGES - images.length;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith("image/") && f.size <= 12 * 1024 * 1024)
      .slice(0, left)
      .map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        url: URL.createObjectURL(file),
      }));
    setImages((prev) => [...prev, ...added]);
    if (Array.from(files).length > left) setMessage(`最多 ${MAX_IMAGES} 張，已自動保留前面的圖片。`);
  };

  const remove = (id: string) => {
    clearResult();
    setImages((prev) => {
      const hit = prev.find((x) => x.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  const move = (index: number, delta: number) => {
    clearResult();
    setImages((prev) => {
      const next = [...prev];
      const to = index + delta;
      if (to < 0 || to >= next.length) return prev;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  };

  const getFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStage("loading");
    setMessage("第一次使用會載入免費影片引擎，請稍候。");
    let ffmpeg = new FFmpeg();
    const onProgress = ({ progress: p }: { progress: number }) => {
      if (Number.isFinite(p)) setProgress(Math.min(99, Math.max(0, Math.round(p * 100))));
    };
    ffmpeg.on("progress", onProgress);
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE}/ffmpeg-core.wasm`, "application/wasm"),
      });
    } catch {
      try { ffmpeg.terminate(); } catch { /* noop */ }
      ffmpeg = new FFmpeg();
      ffmpeg.on("progress", onProgress);
      await ffmpeg.load({
        coreURL: "/ffmpeg-core/ffmpeg-core.js",
        wasmURL: "/ffmpeg-core/ffmpeg-core.wasm",
      });
    }
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const generate = async () => {
    if (!images.length) {
      setStage("error");
      setMessage("請先選圖片。");
      return;
    }
    clearResult();
    setProgress(1);
    try {
      const ffmpeg = await getFfmpeg();
      setStage("preparing");
      setMessage(`正在整理 ${images.length} 張圖片…`);
      const names: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const blob = await toJpeg(images[i].file, width, height, fit);
        const name = `img_${i}.jpg`;
        names.push(name);
        await ffmpeg.writeFile(name, await fetchFile(blob));
        setProgress(Math.round(((i + 1) / images.length) * 18));
      }
      const per = duration / images.length;
      let list = "";
      names.forEach((name) => {
        list += `file '${name}'\nduration ${per.toFixed(3)}\n`;
      });
      list += `file '${names[names.length - 1]}'\n`;
      await ffmpeg.writeFile("input.txt", list);
      if (music) await ffmpeg.writeFile("bgm.mp3", await fetchFile(music));

      setStage("encoding");
      setMessage("正在產生 MP4，手機請不要關閉頁面。");
      const inputs = ["-f", "concat", "-safe", "0", "-i", "input.txt"];
      if (music) inputs.push("-stream_loop", "-1", "-i", "bgm.mp3");
      const maps = music ? ["-map", "0:v:0", "-map", "1:a:0"] : ["-map", "0:v:0", "-an"];
      const audio = music
        ? ["-c:a", "aac", "-b:a", "128k", "-af", `volume=${(volume / 100).toFixed(2)},afade=t=out:st=${Math.max(duration - 1, 0)}:d=1`]
        : [];
      const tail = [
        "-vf", `fps=30,format=yuv420p,fade=t=in:st=0:d=.25,fade=t=out:st=${Math.max(duration - 0.5, 0)}:d=.5`,
        "-r", "30", "-pix_fmt", "yuv420p", ...audio,
        "-t", String(duration), "-shortest", "-movflags", "+faststart",
      ];
      let out = "output.mp4";
      try {
        await ffmpeg.exec([...inputs, ...maps, ...tail, "-c:v", "libx264", "-preset", "ultrafast", "-crf", "24", out]);
      } catch {
        out = "output2.mp4";
        await ffmpeg.exec([...inputs, ...maps, ...tail, "-c:v", "mpeg4", "-q:v", "5", out]);
      }
      const data = (await ffmpeg.readFile(out)) as Uint8Array;
      const copy = new Uint8Array(data.length);
      copy.set(data);
      setVideoUrl(URL.createObjectURL(new Blob([copy], { type: "video/mp4" })));
      setProgress(100);
      setStage("done");
      setMessage(`完成：${images.length} 張、${duration} 秒、${width}×${height}。`);
    } catch (error) {
      console.error(error);
      setStage("error");
      setProgress(0);
      setMessage(error instanceof Error ? `產生失敗：${error.message}` : "產生失敗，請改用 720p 或減少圖片再試。");
    }
  };

  const download = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = outputName;
    a.click();
  };

  const stageText: Record<Stage, string> = {
    idle: "準備中", loading: "載入引擎", preparing: "整理圖片", encoding: "產生 MP4", done: "完成", error: "需要調整",
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 text-white shadow-xl md:p-10">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">免費使用</span>
            <span className="rounded-full bg-white/10 px-3 py-1">圖片／MP3 不上傳</span>
            <span className="rounded-full bg-white/10 px-3 py-1">本機產生 MP4</span>
          </div>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">RXV 一鍵短影音製作器</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-200">不會剪影片也能用：選圖片、秒數、平台尺寸、MP3，按一下就產生 MP4。</p>
        </section>

        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          <b>零後端影片運算：</b>圖片、MP3、成品都留在使用者裝置；不用 Supabase、不用付費 AI API，也不把影片存到 Vercel。
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-xl font-black">1. 選圖片 <span className="text-sm text-slate-500">({images.length}/{MAX_IMAGES})</span></h2>
            <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-7 text-center">
              <span className="text-3xl">🖼️</span><b className="mt-2">點這裡選 1～12 張圖片</b>
              <span className="mt-1 text-xs text-slate-500">JPG／PNG／WebP，每張 12MB 以內</span>
              <input className="hidden" type="file" accept="image/*" multiple disabled={busy || images.length >= MAX_IMAGES}
                onChange={(e) => { addImages(e.target.files); e.currentTarget.value = ""; }} />
            </label>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((item, i) => (
                  <div key={item.id} className="overflow-hidden rounded-xl border">
                    <img src={item.url} alt={`素材${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                    <div className="flex items-center justify-between p-2 text-xs">
                      <button disabled={busy || i === 0} onClick={() => move(i, -1)}>←</button>
                      <button disabled={busy} onClick={() => remove(item.id)} className="font-bold text-rose-600">刪除</button>
                      <button disabled={busy || i === images.length - 1} onClick={() => move(i, 1)}>→</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-7 border-t pt-6">
              <h2 className="text-xl font-black">2. 選用途與平台</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <select value={purpose} disabled={busy} onChange={(e) => setPurpose(e.target.value)} className="rounded-xl border p-3">
                  {['通用短影音','房仲帶看','商品介紹','美髮作品','餐飲／店家','作品展示'].map((x) => <option key={x}>{x}</option>)}
                </select>
                <select value={quality} disabled={busy} onChange={(e) => setQuality(e.target.value as Quality)} className="rounded-xl border p-3">
                  <option value="720p">720p（手機推薦、較穩）</option><option value="1080p">1080p（桌機推薦）</option>
                </select>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(Object.keys(ratioInfo) as Ratio[]).map((r) => (
                  <button key={r} disabled={busy} onClick={() => setRatio(r)} className={`rounded-2xl border p-4 text-left ${ratio === r ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : ''}`}>
                    <b>{ratioInfo[r].label}</b><span className="mt-1 block text-xs leading-5 text-slate-500">{ratioInfo[r].platforms}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                <span><b>原圖不是短影音尺寸也可用：</b>系統會自動排版。</span>
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => setFit('contain')} className={`rounded-lg px-3 py-2 text-xs font-bold ${fit === 'contain' ? 'bg-slate-900 text-white' : 'border bg-white'}`}>完整顯示</button>
                  <button disabled={busy} onClick={() => setFit('cover')} className={`rounded-lg px-3 py-2 text-xs font-bold ${fit === 'cover' ? 'bg-slate-900 text-white' : 'border bg-white'}`}>填滿裁切</button>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t pt-6">
              <h2 className="text-xl font-black">3. 選影片秒數</h2>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[8,15,30].map((n) => <button key={n} disabled={busy} onClick={() => { setCustom(false); setSeconds(n); }} className={`rounded-xl border py-3 font-black ${!custom && seconds === n ? 'border-blue-500 bg-blue-50' : ''}`}>{n}秒</button>)}
                <button disabled={busy} onClick={() => setCustom(true)} className={`rounded-xl border py-3 font-black ${custom ? 'border-blue-500 bg-blue-50' : ''}`}>自訂</button>
              </div>
              {custom && <div className="mt-3 flex items-center gap-3"><input className="flex-1" type="range" min={5} max={30} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}/><b>{duration}秒</b></div>}
              <p className={`mt-3 rounded-xl p-3 text-sm ${each && each < .8 ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-700'}`}>
                {images.length ? <>系統自動平均安排，每張約 <b>{each.toFixed(1)} 秒</b>{each < .8 ? '，切換較快，建議選15秒。' : '，不用自己算時間軸。'}</> : '選好圖片後，系統會自動安排每張停留時間。'}
              </p>
            </div>

            <div className="mt-7 border-t pt-6">
              <h2 className="text-xl font-black">4. 選 MP3 背景音樂</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
                <label className="cursor-pointer rounded-xl border p-4">
                  <b>{music ? music.name : '不加音樂也可以'}</b><span className="mt-1 block text-xs text-slate-500">選自己的 MP3，20MB 以內</span>
                  <input className="hidden" type="file" accept=".mp3,audio/mpeg" disabled={busy} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size <= 20 * 1024 * 1024) setMusic(f); else if (f) setMessage('MP3 請控制在 20MB 以內。');
                    e.currentTarget.value = '';
                  }}/>
                </label>
                <div className="rounded-xl border p-4 text-sm"><div className="flex justify-between"><b>音量</b><span>{volume}%</span></div><input className="mt-2 w-full" type="range" min={0} max={100} value={volume} disabled={!music || busy} onChange={(e) => setVolume(Number(e.target.value))}/>{music && <button onClick={() => setMusic(null)} className="mt-2 text-xs font-bold text-rose-600">移除音樂</button>}</div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><span>用途<br/><b>{purpose}</b></span><span>尺寸<br/><b>{ratio}</b></span><span>長度<br/><b>{duration}秒</b></span><span>畫質<br/><b>{width}×{height}</b></span></div>
              <button disabled={busy || !images.length} onClick={generate} className="mt-5 w-full rounded-xl bg-blue-500 py-4 text-lg font-black disabled:bg-slate-700">{busy ? `${stageText[stage]}中…` : '一鍵產生 MP4'}</button>
              <div className="mt-3 flex justify-between text-xs text-slate-300"><span>{stageText[stage]}</span><span>{progress}%</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-blue-400" style={{width: `${progress}%`}}/></div>
              {message && <p className={`mt-3 text-sm leading-6 ${stage === 'error' ? 'text-rose-300' : 'text-slate-300'}`}>{message}</p>}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-black">新手只要 5 步</h2><ol className="mt-3 space-y-2 text-sm text-slate-600"><li>1. 選圖片</li><li>2. 選平台尺寸</li><li>3. 選 8／15／30 秒</li><li>4. 可選 MP3</li><li>5. 下載 MP4</li></ol></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><h2 className="font-black">免費版穩定限制</h2><p className="mt-2 leading-6">最多 12 張、最長 30 秒、MP3 20MB。手機先用 720p 最穩。這是為避免手機記憶體不足，不是 Vercel 收費限制。</p></div>
          </aside>
        </div>

        {videoUrl && <section className="mt-6 rounded-3xl border border-emerald-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">影片完成</h2><button onClick={download} className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white">下載 MP4</button></div><video src={videoUrl} controls playsInline className="mx-auto mt-4 max-h-[70vh] max-w-full rounded-xl bg-black"/><p className="mt-2 text-center text-xs text-slate-500">{ratioInfo[ratio].platforms}｜{outputName}</p></section>}

        <section className="mt-7 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 p-6 md:p-8">
          <h2 className="text-2xl font-black">做影片缺圖片？直接用 RXV 素材包</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">房仲、店家、美髮、商品介紹都能用。現成素材不合需求，也可另外加價客製圖片。</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4"><b>房仲帶看宣傳圖片包</b><div className="mt-1 text-2xl font-black text-orange-600">91張｜NT$99</div><span className="text-xs text-slate-500">83張橫式＋8張直式短影音圖</span></div><div className="rounded-2xl bg-white p-4"><b>綜合圖片素材</b><div className="mt-1 text-2xl font-black text-rose-600">1672張｜NT$199</div><span className="text-xs text-slate-500">多主題社群、網站、商業素材</span></div></div>
          <a href="/image-packs.html" className="mt-4 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-black text-white">查看圖片包</a>
        </section>
        <p className="mt-4 text-xs leading-6 text-slate-500">背景音樂請使用自己擁有權利、已取得授權或可商用的 MP3；各平台上傳規格仍以平台當下規則為準。</p>
      </div>
    </main>
  );
}
