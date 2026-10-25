import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type DemoVideo = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  videoUrl: string;
};
const KEY_STORAGE = "rxv_image_admin_key";
const MAX_BYTES = 40 * 1024 * 1024;

export default function FlowDemoAdmin() {
  const [key, setKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(KEY_STORAGE) || "";
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/main?action=flow-demo-list", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "無法讀取影片");
      setVideos(Array.isArray(json.videos) ? json.videos : []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "示範影片載入失敗");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function adminRequest(action: string, body: Record<string, unknown>) {
    if (!key.trim()) throw new Error("請先輸入管理者金鑰。");
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

  async function upload() {
    if (busy) return;
    if (!file || !title.trim()) { setStatus("請先選擇 MP4 並填寫影片名稱。"); return; }
    if (!/\.mp4$/i.test(file.name) || file.type !== "video/mp4") {
      setStatus("僅支援真正的 MP4 影片，請先轉成 MP4。"); return;
    }
    if (file.size < 1 || file.size > MAX_BYTES) {
      setStatus("單支影片大小上限 40 MB，請先壓縮影片。"); return;
    }
    setBusy(true);
    setStatus("正在取得安全上傳網址…");
    try {
      sessionStorage.setItem(KEY_STORAGE, key.trim());
      const { id, uploadUrl } = await adminRequest("flow-demo-prepare", {
        filename: file.name,
        size: file.size,
      });
      setStatus("正在直接上傳 Cloudflare R2，請勿關閉本頁…");
      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=86400",
        },
        body: file,
      });
      if (!putResponse.ok) throw new Error("R2 上傳失敗 (HTTP " + putResponse.status + ")。");
      setStatus("上傳完成，正在建立公開展示資料…");
      await adminRequest("flow-demo-complete", {
        id,
        title: title.trim(),
        description: description.trim(),
      });
      setStatus("影片上傳成功，已加入示範影片區！");
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const corsHint = /Failed to fetch|NetworkError|fetch/i.test(message)
        ? "（若卡在直傳 R2，請檢查公共 R2 bucket 的 CORS 是否允許本網站來源 PUT 與 Content-Type、Cache-Control。）"
        : "";
      setStatus(message + corsHint);
    } finally {
      setBusy(false);
    }
  }

  async function deleteVideo(id: string, name: string) {
    if (busy || !window.confirm("確定要刪除「" + name + "」？將同步刪除 R2 中的影片，無法復原。")) return;
    setBusy(true);
    try {
      await adminRequest("flow-demo-delete", { id });
      setStatus("已刪除示範影片：" + name);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "刪除失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-slate-800">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">AI 影片示範區｜管理者上傳</h1>
        <Link to="/tools/flow-video" className="font-semibold text-blue-700 underline">查看公開示範頁面</Link>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="font-bold">影片上傳到 Cloudflare R2，不會存進 Vercel 部署檔。</p>
        <p className="mt-2 text-sm leading-7">僅管理者可新增或刪除；使用既有「圖片後台管理金鑰」。影片是公開示範內容，請勿上傳未取得授權的影片、私人或付費限定素材。</p>
        <p className="mt-2 text-sm leading-7">一次一支 MP4、每支限 40 MB。建議 9:16、8～20 秒、H.264 格式。R2 必須允許瀏覽器從網站網域直傳 PUT。</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void upload(); }} className="mt-5 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="block text-sm font-bold">圖片後台管理金鑰
          <input type="password" autoComplete="off" className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={key} onChange={(e) => setKey(e.target.value)} placeholder="僅管理者需要填寫" />
        </label>
        <label className="block text-sm font-bold">示範影片名稱
          <input required maxLength={100} className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：Q 版美甲師揮手｜Flow 8 秒示範" />
        </label>
        <label className="block text-sm font-bold">影片簡介（選填）
          <textarea maxLength={400} className="mt-2 w-full rounded-xl border border-slate-300 p-3" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="簡述主題與製作步驟" />
        </label>
        <label className="block text-sm font-bold">MP4 影片檔案
          <input ref={fileInput} required type="file" accept="video/mp4,.mp4" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {file ? <p className="text-sm text-slate-600">已選檔：{file.name}（{(file.size / 1024 / 1024).toFixed(1)} MB）</p> : null}
        <button disabled={busy || !key.trim()} type="submit" className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "處理中，請勿關閉" : "上傳 MP4 到示範區"}
        </button>
        {status ? <p role="status" className="rounded-xl bg-slate-50 p-3 text-sm leading-7">{status}</p> : null}
      </form>
      <section className="mt-8">
        <h2 className="text-xl font-black">目前上架的示範影片（{videos.length}）</h2>
        {videos.length === 0 ? <p className="mt-4 text-slate-600">目前沒有公開示範影片。</p> : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <div key={video.id} className="rounded-xl border bg-white p-4">
              <video controls preload="metadata" playsInline src={video.videoUrl} className="h-72 w-full rounded-lg bg-slate-100 object-contain" />
              <p className="mt-2 font-bold">{video.title}</p>
              <button type="button" disabled={busy || !key.trim()} onClick={() => { void deleteVideo(video.id, video.title); }} className="mt-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">刪除此影片</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
