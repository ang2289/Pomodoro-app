import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

type TopItem = {
  code: string;
  click_count: number;
};

export default function QrTopPage() {
  const [todayTop, setTodayTop] = useState<TopItem[]>([]);
  const [weekTop, setWeekTop] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/main?action=getTopQR");
        const text = await res.text();
        if (!mounted) return;

        let data: { todayTop?: unknown; weekTop?: unknown; error?: string } = {};
        const trimmed = text.trim();
        if (trimmed) {
          try {
            data = JSON.parse(trimmed) as typeof data;
          } catch {
            throw new Error(
              "無法讀取排行榜資料（請確認本機已啟動 API，或稍後再試）"
            );
          }
        }

        if (!res.ok) {
          throw new Error(data?.error || "讀取排行榜失敗");
        }

        setTodayTop(Array.isArray(data?.todayTop) ? data.todayTop : []);
        setWeekTop(Array.isArray(data?.weekTop) ? data.weekTop : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "讀取排行榜失敗");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRanking();
    return () => {
      mounted = false;
    };
  }, []);

  const renderRanking = (items: TopItem[]) => {
    if (loading) return <p className="text-sm text-gray-500">載入中...</p>;
    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!items.length) return <p className="text-sm text-gray-500">目前尚無排行資料</p>;

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">排名</th>
              <th className="px-4 py-3 font-semibold text-gray-700">code</th>
              <th className="px-4 py-3 font-semibold text-gray-700">點擊數</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.code}-${index}`} className="border-t border-gray-100 hover:bg-blue-50/40">
                <td className="px-4 py-3 font-semibold text-gray-900">#{index + 1}</td>
                <td className="px-4 py-3">
                  <Link to={`/s/${item.code}`} className="font-mono text-blue-700 hover:underline">
                    {item.code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-800">{item.click_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>熱門 QR Code 排行榜</title>
        <meta name="description" content="查看最熱門的QR Code" />
        <meta property="og:title" content="熱門 QR Code 排行榜" />
        <meta property="og:description" content="查看最熱門的QR Code" />
      </Helmet>

      <main className="mx-auto max-w-4xl px-4 py-8 pb-20">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">熱門 QR Code 排行榜</h1>

        <section className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="mb-3 text-xl font-semibold text-orange-900">🔥 今日熱門</h2>
          {renderRanking(todayTop)}
        </section>

        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <h2 className="mb-3 text-xl font-semibold text-purple-900">🏆 本週熱門</h2>
          {renderRanking(weekTop)}
        </section>
      </main>
    </>
  );
}

