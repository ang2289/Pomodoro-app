import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const API_BASE = "http://localhost:3006";
const DEFAULT_TARGET = "https://pomodoro-app-eight-rouge.vercel.app/images";

const PLATFORM_OPTIONS = [
  { key: "facebook", label: "Facebook Reels" },
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Instagram Reels" },
  { key: "youtube_shorts", label: "YouTube Shorts" },
  { key: "threads", label: "Threads" },
  { key: "x", label: "X" },
] as const;

type PlatformKey = (typeof PLATFORM_OPTIONS)[number]["key"];

function buildCopy(title: string, targetUrl: string) {
  const subject = title.trim() || "圖片素材分享";
  return [
    `今天分享幾張${subject}，可直接拿來做社群貼文或短影音素材。`,
    "想看更多同類型圖片，可到 RXV 圖片區瀏覽。",
    targetUrl.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function addCampaignParam(url: string) {
  const raw = url.trim() || DEFAULT_TARGET;
  try {
    const parsed = new URL(raw);
    parsed.searchParams.set("rxv_campaign", Date.now().toString(36));
    return parsed.toString();
  } catch {
    return `${DEFAULT_TARGET}?rxv_campaign=${Date.now().toString(36)}`;
  }
}

export default function AutoVideoPublisherPage() {
  const [title, setTitle] = useState("美髮圖片分享");
  const [targetUrl, setTargetUrl] = useState(DEFAULT_TARGET);
  const [imageUrls, setImageUrls] = useState(["", "", ""]);
  const [caption, setCaption] = useState(() => buildCopy("美髮圖片分享", DEFAULT_TARGET));
  const [hashtags, setHashtags] = useState("#RXV #圖片素材 #免費圖片");
  const [selected, setSelected] = useState<PlatformKey[]>(["facebook", "tiktok"]);
  const [status, setStatus] = useState("尚未開始");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [publisherStatus, setPublisherStatus] = useState<any>(null);

  const validImages = useMemo(
    () => imageUrls.map((x) => x.trim()).filter(Boolean),
    [imageUrls],
  );

  const togglePlatform = (key: PlatformKey) => {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((x) => x !== key)
        : [...current, key],
    );
  };

  const refreshPublisherStatus = async () => {
    const response = await fetch(`${API_BASE}/publisher/status`);
    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.ok !== false) {
      setPublisherStatus(data);
    }
    return data;
  };

  const handleGenerateAndQueue = async () => {
    if (!title.trim()) {
      setStatus("請先輸入短影音主題。");
      return;
    }
    if (validImages.length !== 3) {
      setStatus("第一版需要 3 張不同的公開圖片網址。");
      return;
    }
    if (!selected.length) {
      setStatus("請至少選一個發布平台。");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      setStatus("檢查本機影片服務...");
      const health = await fetch(`${API_BASE}/health`);
      if (!health.ok) throw new Error("本機 3006 影片服務尚未啟動");

      const finalCopy = caption.trim() || buildCopy(title, targetUrl);
      const target = targetUrl.trim() || DEFAULT_TARGET;
      const campaignUrl = addCampaignParam(target);
      const cleanTags = hashtags.trim() || "#RXV #圖片素材";
      const voiceText = `今天分享${title.trim()}。三張圖片自動整理成十五秒短影音。想看更多同類型圖片，可以到 RXV 圖片區瀏覽。`;

      setStatus("正在用 FFmpeg 產生 15 秒直式短影音...");
      const renderResponse = await fetch(`${API_BASE}/render-from-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: {
            title: title.trim(),
            productUrl: campaignUrl,
            promoUrl: "",
            affiliateUrl: "",
            imageUrls: validImages,
            selectedPlatforms: selected,
            skipUpload: true,
            sceneTitles: [
              title.trim(),
              "3 張圖片自動做短影音",
              "更多圖片到 RXV",
            ],
            sceneSubtitles: [
              "社群貼文與 Reels 可用",
              "本機 FFmpeg・15 秒",
              "看免費圖片與更多分類",
            ],
            voiceText,
            shortTitle: title.trim(),
            shortDescription: finalCopy,
            fullPost: finalCopy,
            facebookPost: finalCopy,
            instagramCaption: finalCopy,
            tiktokCaption: finalCopy,
            youtubeShortsTitle: title.trim().slice(0, 90),
            youtubeShortsDescription: finalCopy,
            youtubeVideoTitle: title.trim().slice(0, 90),
            youtubeVideoDescription: finalCopy,
            threadsPost: finalCopy,
            xPost: finalCopy,
            hashtags: cleanTags,
            facebookHashtags: cleanTags,
            instagramHashtags: cleanTags,
            tiktokHashtags: cleanTags,
            youtubeHashtags: cleanTags,
          },
        }),
      });
      const renderData = await renderResponse.json().catch(() => ({}));
      if (!renderResponse.ok || renderData?.ok === false) {
        throw new Error(renderData?.message || renderData?.error || "產片失敗");
      }

      setStatus("影片完成，正在加入多平台發布佇列...");
      const syncResponse = await fetch(`${API_BASE}/publisher/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const syncData = await syncResponse.json().catch(() => ({}));
      if (!syncResponse.ok || syncData?.ok === false) {
        throw new Error(syncData?.message || syncData?.error || "影片完成，但發布佇列同步失敗");
      }

      const pStatus = await refreshPublisherStatus();
      setResult({ ...renderData, publisherSync: syncData, publisherStatus: pStatus });
      setStatus("完成：MP4 已產生並加入選定平台的發布佇列。");
    } catch (error: any) {
      setStatus(error?.message || "執行失敗");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = () => {
    setCaption(buildCopy(title, targetUrl));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SEO
        title="RXV 自動短影音發布器｜圖片轉 MP4＋Facebook／TikTok 多平台佇列"
        description="本機零成本優先：3 張公開圖片網址自動做成 15 秒直式 MP4，並加入 Facebook、TikTok、Instagram、YouTube Shorts 等發布佇列。"
        keywords="自動短影音, Facebook Reels, TikTok, Instagram Reels, YouTube Shorts, 圖片轉影片"
        path="/tools/auto-video-publisher"
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-violet-600">RXV 本機自動化工具</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              自動短影音＋多平台發布
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              第一版先走最快、零雲端影片儲存方案：貼 3 張公開圖片網址，自動用本機 FFmpeg 做成 15 秒直式 MP4，再加入 Facebook、TikTok、IG、YouTube Shorts 等發布佇列。
            </p>
          </div>
          <Link
            to="/tools/shopee-video"
            className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700"
          >
            開啟完整發布中心
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          需要先啟動本機 3006 影片服務。這一頁不會把 MP4 上傳 Supabase；影片留在本機 D:\\out_mp4。平台是否自動送出，依你在完整發布中心目前的 API／Helper 與自動發布設定。
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="font-bold text-slate-800">短影音主題</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
              placeholder="例如：美髮圖片分享"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-bold text-slate-800">導流網址</span>
            <input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
              placeholder={DEFAULT_TARGET}
            />
          </label>

          <div>
            <div className="font-bold text-slate-800">3 張圖片網址</div>
            <p className="mt-1 text-xs text-slate-500">
              先用你網站／R2 已公開的圖片網址。三張必須是不同圖片。
            </p>
            <div className="mt-3 grid gap-3">
              {imageUrls.map((value, index) => (
                <input
                  key={index}
                  value={value}
                  onChange={(e) =>
                    setImageUrls((current) =>
                      current.map((item, idx) => (idx === index ? e.target.value : item)),
                    )
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                  placeholder={`圖片 ${index + 1} 公開網址`}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-800">要加入哪些發布平台</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((item) => {
                const active = selected.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => togglePlatform(item.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${
                      active
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {active ? "✓ " : ""}{item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-800">發布文案</span>
              <button
                type="button"
                onClick={applyTemplate}
                className="text-sm font-bold text-violet-700 underline"
              >
                重新套用圖片導流文案
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={7}
              className="rounded-xl border border-slate-300 px-4 py-3 leading-7"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-bold text-slate-800">Hashtags</span>
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
          </label>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerateAndQueue}
            className="rounded-2xl bg-slate-900 px-5 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "處理中..." : "一鍵產生 15 秒 MP4＋加入發布佇列"}
          </button>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-bold text-slate-900">目前狀態</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{status}</p>
          </div>

          {result?.publicVideoUrl ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="font-black text-emerald-900">影片已完成</div>
              <video
                src={result.publicVideoUrl}
                controls
                playsInline
                className="mt-3 max-h-[520px] w-full rounded-xl bg-black"
              />
              <p className="mt-3 break-all text-xs text-emerald-900">
                本機檔案：{String(result.output || "")}
              </p>
            </div>
          ) : null}

          {publisherStatus?.counts ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
              發布佇列：等待 {Number(publisherStatus.counts.queued || 0)} ／
              排程 {Number(publisherStatus.counts.scheduled || 0)} ／
              已發布 {Number(publisherStatus.counts.published || 0)} ／
              失敗 {Number(publisherStatus.counts.failed || 0)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
