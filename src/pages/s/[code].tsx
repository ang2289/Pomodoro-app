import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { QRCodeCanvas } from "qrcode.react";

export default function ShortCodeRedirectPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalClicks: number; todayClicks: number } | null>(null);

  const currentShortUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/s/${code ?? ""}`;
  }, [code]);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      if (!code) {
        if (mounted) {
          setError("短網址代碼不存在");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 點擊統計（不阻擋主流程）
        fetch(`/api/main?action=recordClick&code=${encodeURIComponent(code)}`).catch(() => undefined);
        fetch(`/api/main?action=getStats&code=${encodeURIComponent(code)}`)
          .then((r) => r.json())
          .then((s) => {
            if (!mounted) return;
            if (typeof s?.totalClicks === "number" && typeof s?.todayClicks === "number") {
              setStats({ totalClicks: s.totalClicks, todayClicks: s.todayClicks });
            }
          })
          .catch(() => undefined);

        const res = await fetch(`/api/main?action=getShort&code=${encodeURIComponent(code)}`);
        const data = await res.json();

        if (!mounted) return;

        if (!res.ok || !data?.original_url) {
          setError(typeof data?.error === "string" ? data.error : "找不到對應短網址");
          setLoading(false);
          return;
        }

        setOriginalUrl(data.original_url);
        setCreatedAt(data.created_at ?? null);
        setLoading(false);

        // 顯示 fallback 內容後，自動轉址（0.8 秒）
        timer = setTimeout(() => {
          window.location.href = data.original_url;
        }, 800);
      } catch {
        if (!mounted) return;
        setError("短網址查詢失敗");
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [code]);

  const title = "QR Code 分享｜快速跳轉";
  const description = "掃描 QR Code 或點擊立即前往";
  const ogImage = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
    currentShortUrl || "https://pomodoro-app-eight-rouge.vercel.app",
  )}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="QR Code 分享" />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={currentShortUrl} />
      </Helmet>

      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{error ? "無法開啟連結" : "正在跳轉..."}</h1>
        <p className="mt-3 text-sm text-gray-500">
          {error
            ? "此短網址可能已失效或代碼不正確。"
            : loading
              ? "正在為你開啟原始網址"
              : "若未自動跳轉，請點擊下方原網址"}
        </p>
        {error ? (
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              回到首頁
            </Link>
          </div>
        ) : null}

        {!error ? (
          <>
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">原網址</p>
              <p className="break-all text-sm text-gray-800">{originalUrl || "查詢中..."}</p>
              {createdAt ? <p className="mt-2 text-xs text-gray-400">建立時間：{new Date(createdAt).toLocaleString()}</p> : null}
            </div>

            <div className="mt-6 flex justify-center">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <QRCodeCanvas value={originalUrl || currentShortUrl || "https://pomodoro-app-eight-rouge.vercel.app"} size={220} />
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              這是供搜尋引擎與社群平台辨識的短網址落地頁，將導向你的目標連結。
            </p>

            {originalUrl ? (
              <a
                className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                href={originalUrl}
                rel="noopener noreferrer"
              >
                前往原網址
              </a>
            ) : null}

            <div className="fixed bottom-4 right-4 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-sm">
              <p>總點擊：{stats?.totalClicks ?? 0}</p>
              <p>今日點擊：{stats?.todayClicks ?? 0}</p>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

