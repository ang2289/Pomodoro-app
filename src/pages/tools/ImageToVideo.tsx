import React, { useMemo, useRef, useState } from "react";

const MAX_IMAGES = 12;
type Ratio = "9:16" | "1:1" | "16:9";
type Quality = "720p" | "1080p";
type Fit = "contain" | "cover";
type Stage = "idle" | "preparing" | "encoding" | "done" | "error";
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

function pickMp4Mime(hasAudio: boolean) {
  const candidates = hasAudio
    ? [
        'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
        "video/mp4",
      ]
    : [
        'video/mp4;codecs="avc1.42E01E"',
        "video/mp4",
      ];
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
}

function drawBitmap(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
  fit: Fit,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
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
  ctx.restore();
}

async function createBitmaps(files: File[]) {
  const bitmaps: ImageBitmap[] = [];
  for (const file of files) bitmaps.push(await createImageBitmap(file));
  return bitmaps;
}

export default function ImageToVideo() {
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
  const cancelRef = useRef<() => void>(() => {});

  const duration = custom ? Math.min(30, Math.max(5, seconds)) : seconds;
  const [width, height] = sizeOf(ratio, quality);
  const each = images.length ? duration / images.length : 0;
  const busy = stage === "preparing" || stage === "encoding";
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

  const generate = async () => {
    if (!images.length) {
      setStage("error");
      setMessage("請先選圖片。");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setStage("error");
      setMessage("目前瀏覽器不支援影片錄製，請改用最新版 Edge 或 Chrome。");
      return;
    }

    clearResult();
    setStage("preparing");
    setProgress(2);
    setMessage("正在準備圖片與音樂…");

    let bitmaps: ImageBitmap[] = [];
    let audioContext: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;
    let timer = 0;
    let stopped = false;

    try {
      const mimeType = pickMp4Mime(Boolean(music));
      if (!mimeType) throw new Error("這個瀏覽器目前不支援直接輸出 MP4，請使用最新版 Edge 或 Chrome。");

      bitmaps = await createBitmaps(images.map((x) => x.file));
      setProgress(8);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("瀏覽器無法建立影片畫布。");

      drawBitmap(ctx, bitmaps[0], width, height, fit);
      const canvasStream = canvas.captureStream(15);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      if (music) {
        audioContext = new AudioContext();
        await audioContext.resume();
        const decoded = await audioContext.decodeAudioData(await music.arrayBuffer());
        const dest = audioContext.createMediaStreamDestination();
        const gain = audioContext.createGain();
        gain.gain.value = Math.max(0, Math.min(1, volume / 100));
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = decoded;
        audioSource.loop = true;
        audioSource.connect(gain);
        gain.connect(dest);
        tracks.push(...dest.stream.getAudioTracks());
      }

      const stream = new MediaStream(tracks);
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: quality === "1080p" ? 5_000_000 : 2_500_000,
        audioBitsPerSecond: music ? 128_000 : undefined,
      });

      const done = new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = (event) => reject((event as any).error || new Error("影片錄製失敗"));
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/mp4" }));
      });

      setStage("encoding");
      setProgress(10);
      setMessage(`正在產生 ${duration} 秒 MP4；這版採即時生成，大約需要 ${duration} 秒，請保持此分頁開啟。`);

      const totalMs = duration * 1000;
      const perMs = totalMs / bitmaps.length;
      const transitionMs = Math.min(300, perMs * 0.2);
      const start = performance.now();

      recorder.start(1000);
      audioSource?.start(0);

      const renderFrame = () => {
        if (stopped) return;
        const elapsed = Math.min(totalMs, performance.now() - start);
        const rawIndex = Math.min(bitmaps.length - 1, Math.floor(elapsed / perMs));
        const local = elapsed - rawIndex * perMs;
        const nextIndex = Math.min(bitmaps.length - 1, rawIndex + 1);

        drawBitmap(ctx, bitmaps[rawIndex], width, height, fit);
        if (nextIndex !== rawIndex && local > perMs - transitionMs) {
          const alpha = Math.min(1, (local - (perMs - transitionMs)) / transitionMs);
          drawBitmap(ctx, bitmaps[nextIndex], width, height, fit, alpha);
        }

        setProgress(Math.min(99, 10 + Math.round((elapsed / totalMs) * 89)));
        if (elapsed >= totalMs) {
          stopped = true;
          try { audioSource?.stop(); } catch { /* noop */ }
          recorder.stop();
          return;
        }
        timer = window.setTimeout(renderFrame, 1000 / 15);
      };

      cancelRef.current = () => {
        stopped = true;
        window.clearTimeout(timer);
        try { audioSource?.stop(); } catch { /* noop */ }
        if (recorder.state !== "inactive") recorder.stop();
      };

      renderFrame();
      const blob = await done;
      if (!blob.size) throw new Error("影片檔案為空，請再試一次。");
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setProgress(100);
      setStage("done");
      setMessage(`完成：${images.length} 張、${duration} 秒、${width}×${height}，可直接下載 MP4。`);
    } catch (error) {
      console.error(error);
      setStage("error");
      setProgress(0);
      const text = error instanceof Error ? error.message : String(error || "未知錯誤");
      setMessage(`產生失敗：${text}`);
    } finally {
      window.clearTimeout(timer);
      bitmaps.forEach((bitmap) => bitmap.close());
      try { await audioContext?.close(); } catch { /* noop */ }
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
    idle: "準備中", preparing: "整理素材", encoding: "產生 MP4", done: "完成", error: "需要調整",
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
