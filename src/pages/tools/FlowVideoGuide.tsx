import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

type DemoVideo = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  videoUrl: string;
};

const FLOW_URL = "https://labs.google/fx/tools/flow";
const SUBJECTS = ["Q 版 LINE 貼圖角色", "療癒花卉", "夢幻風景", "商品宣傳", "房仲形象", "美甲師"];
const MOTIONS = ["自然微動與眨眼", "鏡頭緩慢推進", "溫柔光影與風吹", "揮手微笑與展示商品"];

export default function FlowVideoGuide() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [motion, setMotion] = useState(MOTIONS[0]);
  const [copied, setCopied] = useState(false);
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [videoStatus, setVideoStatus] = useState("正在載入示範影片…");

  const prompt = useMemo(() => {
    return [
      "Animate the uploaded reference image as a polished 8-second vertical 9:16 video.",
      "Subject: " + subject + ".",
      "Motion: " + motion + ".",
      "Preserve the original subject, identity, colors, outfit and illustration style.",
      "Natural smooth movements, consistent composition, cinematic lighting, no flicker.",
      "Keep the complete subject within the safe frame. No additional fingers or limbs.",
      "Do not generate captions, words, logos or watermarks.",
    ].join(" ");
  }, [subject, motion]);

  useEffect(() => {
    let active = true;
    fetch("/api/main?action=flow-demo-list")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.ok) throw new Error("無法讀取影片");
        return json;
      })
      .then((json) => {
        if (!active) return;
        setVideos(Array.isArray(json.videos) ? json.videos : []);
        setVideoStatus("");
      })
      .catch(() => { if (active) setVideoStatus("示範影片目前暫時無法載入，教學與 Flow 連結仍可正常使用。"); });
    return () => { active = false; };
  }, []);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
      window.prompt("請複製以下提示詞：", prompt);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-slate-800">
      <Helmet>
        <title>免費 AI 圖生影片教學｜Google Flow × RXV</title>
        <meta name="description" content="教你用 Google Flow 將圖片製作成 8 秒 AI 影片，免費提示詞、影片展示與 RXV MP4 後製工具。" />
      </Helmet>
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6 md:p-10">
        <p className="text-sm font-bold text-indigo-700">RXV 免費工具教學｜使用 Google 官方外部服務</p>
        <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">一張圖片，變成 8 秒 AI 動態影片</h1>
        <p className="mt-3 max-w-3xl text-base leading-8">
          Google Flow 可使用 Veo 生成影片。Google 公告的免訂閱方案含每日 50 點 Flow 點數；
          每次實際消耗、模型和影片秒數依 Flow 畫面為準，點數不由 RXV 提供。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={FLOW_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">
            前往 Google Flow（外部網站） ↗
          </a>
          <a href="#flow-demos" className="rounded-xl border border-indigo-200 bg-white px-6 py-3 font-bold text-indigo-700 hover:bg-indigo-50">先看示範影片</a>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Flow 需要符合資格的 Google 帳號；服務可用性、影片長度和免費額度均可能改變。
        </p>
      </div>

      <section className="mt-9 grid gap-4 md:grid-cols-3" aria-label="影片製作教學">
        {[
          ["① 準備圖片", "可用 ChatGPT 生成 Q 版貼圖角色、療癒風景或商品圖片；保留主角四周空間。"],
          ["② Google Flow 動起來", "在 Flow 選擇圖片生成影片，放入圖片與提示詞，確認點數消耗後再生成。"],
          ["③ RXV 後製並發布", "下載 MP4，回到 RXV 免費工具加入字幕、音樂及片尾 QR Code，分享至社群。"],
        ].map(([title, desc]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-indigo-900">{title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-2xl font-black">免費圖生影片提示詞產生器</h2>
        <p className="mt-2 text-slate-600">選好主題與動作，複製英文提示詞到 Flow，再自行上傳圖片。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-bold">圖片主題
            <select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base" value={subject} onChange={(event) => {setSubject(event.target.value);setCopied(false);}}>
              {SUBJECTS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">動畫方式
            <select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base" value={motion} onChange={(event) => {setMotion(event.target.value);setCopied(false);}}>
              {MOTIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <textarea aria-label="影片提示詞" className="mt-4 min-h-[160px] w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6" readOnly value={prompt} />
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" onClick={copyPrompt} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">{copied ? "已複製提示詞" : "一鍵複製提示詞"}</button>
          <a target="_blank" rel="noopener noreferrer" href={FLOW_URL} className="rounded-xl border border-indigo-200 bg-white px-5 py-3 font-bold text-indigo-700">帶著提示詞去 Flow ↗</a>
        </div>
      </section>

      <section id="flow-demos" className="mt-10 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black">AI 影片示範區</h2>
            <p className="mt-1 text-slate-600">由 RXV 管理者上傳 MP4 示範影片；點擊即可播放。影片儲存在 Cloudflare R2，不會放進 Vercel 部署檔案。</p>
          </div>
          <Link to="/admin/flow-demos" className="text-sm font-bold text-indigo-700 underline">管理者上傳影片</Link>
        </div>
        {videoStatus ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{videoStatus}</p> : null}
        {!videoStatus && videos.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center">
            <p className="font-bold">示範影片準備中</p>
            <p className="mt-2 text-sm text-slate-600">管理者上傳第一支 MP4 後，影片會自動出現在這裡。</p>
          </div>
        ) : null}
        {videos.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <video controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-slate-100 object-contain" src={video.videoUrl}>
                  您的瀏覽器不支援 MP4 播放。
                </video>
                <div className="p-4">
                  <h3 className="font-bold">{video.title}</h3>
                  {video.description ? <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{video.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
      <section className="mt-10 rounded-2xl bg-indigo-50 p-6">
        <h2 className="text-xl font-black">影片後製：接回 RXV 免費工具</h2>
        <p className="mt-2 text-slate-700">Flow 主要負責生成短片；片尾 QR Code、正確繁體中文和多段影片合成，建議使用後製工具處理，避免 AI 把文字或 QR Code 畫錯。</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/tools/image-to-mp4" className="rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm">RXV 免費 MP4 工具</Link>
          <Link to="/tools/line-sticker" className="rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm">RXV LINE 貼圖工具</Link>
        </div>
      </section>
      <p className="mt-6 text-xs text-slate-500">本頁為獨立教學與素材展示，非 Google 官方服務，不能在 RXV 網站直接使用 Google Flow 點數生成影片。</p>
    </main>
  );
}
