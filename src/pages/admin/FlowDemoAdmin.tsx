import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

type DemoVideo = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  youtubeId: string;
  youtubeUrl: string;
  embedUrl: string;
};
const KEY_STORAGE = "rxv_image_admin_key";

function parseYouTubeId(raw: string) {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return "";
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);
    let id = "";
    if (host === "youtu.be" || host === "www.youtu.be") id = segments[0] || "";
    else if (["www.youtube.com", "youtube.com", "m.youtube.com", "music.youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(host)) {
      if (segments[0] === "watch") id = url.searchParams.get("v") || "";
      else if (["shorts", "live", "embed", "v"].includes(segments[0])) id = segments[1] || "";
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  } catch { return ""; }
}

export default function FlowDemoAdmin() {
  const [key, setKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(KEY_STORAGE) || "";
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const youtubeId = parseYouTubeId(youtubeUrl);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/main?action=flow-demo-list", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "無法讀取影片清單");
      setVideos(Array.isArray(json.videos) ? json.videos : []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "示範影片載入失敗");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function adminRequest(action: string, body: Record<string, unknown>) {
    if (!key.trim()) throw new Error("請輸入管理者金鑰。");
    const response = await fetch("/api/main?action=" + encodeURIComponent(action), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RXV-Image-Admin-Key": key.trim(),
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      if (response.status === 401 || response.status === 403) sessionStorage.removeItem(KEY_STORAGE);
      throw new Error(result.error || "伺服器操作失敗 (HTTP " + response.status + ")");
    }
    return result;
  }

  async function addVideo() {
    if (busy) return;
    if (!youtubeId || !title.trim()) {
      setStatus("請填寫影片名稱並貼上正確的 YouTube 影片或 Shorts 分享網址。");
      return;
    }
    setBusy(true);
    setStatus("正在新增 YouTube 影片連結…");
    try {
      sessionStorage.setItem(KEY_STORAGE, key.trim());
      await adminRequest("flow-demo-add", { youtubeUrl: youtubeUrl.trim(), title: title.trim(), description: description.trim() });
      setStatus("新增成功！公開示範頁現在會顯示這支 YouTube 影片。");
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "無法加入影片");
    } finally {
      setBusy(false);
    }
  }

  async function deleteVideo(id: string, name: string) {
    if (busy || !window.confirm("確定將「" + name + "」從 RXV 示範區移除？不會刪除 YouTube 原片。")) return;
    setBusy(true);
    try {
      sessionStorage.setItem(KEY_STORAGE, key.trim());
      await adminRequest("flow-demo-delete", { id });
      setStatus("已從 RXV 示範區移除：" + name + "（YouTube 原片不受影響）");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "移除失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-slate-800">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">AI 影片示範區｜YouTube 嵌入管理</h1>
        <Link to="/tools/flow-video" className="font-semibold text-blue-700 underline">查看公開示範頁面</Link>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="font-bold">影片放 YouTube，RXV 不儲存 MP4，也不占用 Vercel 或 R2 的影片儲存容量。</p>
        <p className="mt-2 text-sm leading-7">操作：① 到 YouTube Studio 上傳影片，選擇「公開」或「不公開」並確認允許嵌入。② 複製影片或 Shorts 分享網址。③ 在此貼上網址並新增至示範區。</p>
        <p className="mt-2 text-sm leading-7">不公開影片仍可由持有連結的訪客觀看，私人影片無法正常對外嵌入。僅需使用現有圖片後台金鑰；網站僅在 R2 保存少量標題與 YouTube ID 清單，最多 30 筆。</p>
        <a className="mt-3 inline-block font-semibold text-blue-700 underline" href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer">開啟 YouTube Studio 上傳影片 ↗</a>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); void addVideo(); }} className="mt-5 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="block text-sm font-bold">圖片後台管理金鑰
          <input type="password" autoComplete="off" className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={key} onChange={(event) => setKey(event.target.value)} placeholder="僅管理者需要填寫" />
        </label>
        <label className="block text-sm font-bold">YouTube 影片分享網址
          <input required type="url" inputMode="url" className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://youtu.be/XXXXXXXXXXX 或 YouTube Shorts 網址" />
        </label>
        {youtubeUrl && !youtubeId ? <p className="text-sm text-rose-700">無法辨識影片 ID，請確認是完整的 YouTube HTTPS 分享網址。</p> : null}
        {youtubeId ? (
          <div className="max-w-xs overflow-hidden rounded-xl border bg-slate-50">
            <iframe
              className="aspect-[9/16] w-full"
              title="即將新增的 YouTube 影片預覽"
              loading="lazy"
              src={"https://www.youtube-nocookie.com/embed/" + youtubeId}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : null}
        <label className="block text-sm font-bold">示範影片名稱
          <input required maxLength={100} className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：Q 版美甲師｜Flow 8 秒示範" />
        </label>
        <label className="block text-sm font-bold">影片說明（選填）
          <textarea maxLength={400} className="mt-2 w-full rounded-xl border border-slate-300 p-3" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="例如：ChatGPT 生圖，再用 Google Flow 讓角色揮手" />
        </label>
        <button disabled={busy || !key.trim() || !youtubeId || !title.trim()} type="submit" className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "處理中…" : "新增 YouTube 影片到示範區"}
        </button>
        {status ? <p role="status" className="rounded-xl bg-slate-50 p-3 text-sm leading-7">{status}</p> : null}
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-black">目前展示影片（{videos.length} / 30）</h2>
        {videos.length === 0 ? <p className="mt-4 text-slate-600">尚無影片。貼上第一支 YouTube 連結即可新增。</p> : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <article key={video.id} className="rounded-xl border bg-white p-4">
              <div className="aspect-[9/16] max-h-[360px] overflow-hidden rounded-lg bg-slate-50">
                <iframe
                  className="h-full w-full"
                  loading="lazy"
                  title={video.title}
                  src={video.embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="mt-2 font-bold">{video.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a className="text-sm font-semibold text-blue-700 underline" target="_blank" rel="noopener noreferrer" href={video.youtubeUrl}>在 YouTube 查看 ↗</a>
                <button type="button" disabled={busy || !key.trim()} onClick={() => { void deleteVideo(video.id, video.title); }} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">從示範區移除</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
