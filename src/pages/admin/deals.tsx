import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { getAdminDeals, updateAdminDealAffiliate } from "@/lib/contentApi";
import PrimaryButton from "@/components/ui/PrimaryButton";

export type DealItemAdminRow = {
  id: string;
  title: string | null;
  price: number | null;
  sale_end_time: string | null;
  product_url: string | null;
  affiliate_url: string | null;
};

function formatPrice(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return `NT$${Number(n).toLocaleString("zh-TW")}`;
}

function formatSaleEnd(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDealsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<DealItemAdminRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [onlyEmptyAffiliate, setOnlyEmptyAffiliate] = useState(false);
  /** 每列 affiliate_url 編輯草稿（key = deal_items.id） */
  const [affiliateDrafts, setAffiliateDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoadError(null);
    const { deals: data } = await getAdminDeals();
    const error = null;

    if (error) {
      setLoadError(error.message || "讀取失敗");
      setRows([]);
      return;
    }
    const list = (data as DealItemAdminRow[]) || [];
    setRows(list);
    const drafts: Record<string, string> = {};
    for (const r of list) {
      drafts[r.id] = r.affiliate_url ?? "";
    }
    setAffiliateDrafts(drafts);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setIsAdmin(null);

      try {
        await loadRows();
        const adminFlag = true;
        const rpcError = null;

        if (rpcError) {
          console.error("檢查管理者權限失敗：", rpcError);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (adminFlag !== true) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        await loadRows();
      } catch (e) {
        console.error(e);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [navigate, loadRows]);

  const displayRows = useMemo(() => {
    if (!onlyEmptyAffiliate) return rows;
    return rows.filter((r) => !String(r.affiliate_url ?? "").trim());
  }, [rows, onlyEmptyAffiliate]);

  const handleAffiliateChange = (id: string, value: string) => {
    setAffiliateDrafts((prev) => ({ ...prev, [id]: value }));
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleSave = async (id: string) => {
    const raw = affiliateDrafts[id] ?? "";
    const trimmed = raw.trim();
    setSavingId(id);
    setSaveMessage(null);
    setSaveError(null);

    try {
      await updateAdminDealAffiliate(id, trimmed.length > 0 ? trimmed : null);
      const error = null;

      if (error) {
        setSaveError(error.message || "更新失敗");
        return;
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, affiliate_url: trimmed.length > 0 ? trimmed : null } : r
        )
      );
      setSaveMessage("已儲存");
      window.setTimeout(() => setSaveMessage(null), 2500);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>管理：deal_items - 載入中</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="mx-auto max-w-6xl rounded-xl bg-white p-8 text-center shadow-lg">
            <p className="text-gray-500">載入中…</p>
          </div>
        </div>
      </>
    );
  }

  if (isAdmin === false) {
    return (
      <>
        <Helmet>
          <title>無權限</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
            <p className="mb-4 font-semibold text-red-600">無權限存取</p>
            <p className="mb-6 text-gray-600">你沒有權限存取此頁面</p>
            <Link to="/pricing">
              <PrimaryButton>前往方案頁</PrimaryButton>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>管理：deal_items</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                to="/admin/dashboard"
                className="mb-2 inline-block text-sm text-gray-600 hover:text-gray-900"
              >
                ← 管理 Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">deal_items 管理</h1>
              <p className="mt-1 text-sm text-gray-600">
                編輯分潤網址（affiliate_url）後按「儲存」寫回 Supabase。
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={onlyEmptyAffiliate}
                onChange={(e) => setOnlyEmptyAffiliate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              只顯示 affiliate_url 為空的商品
            </label>
            <button
              type="button"
              onClick={() => void loadRows()}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              重新載入
            </button>
            <span className="text-sm text-gray-500">
              共 {rows.length} 筆
              {onlyEmptyAffiliate ? `，篩選後 ${displayRows.length} 筆` : ""}
            </span>
          </div>

          {loadError ? (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {loadError}
            </div>
          ) : null}
          {saveError ? (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {saveError}
            </div>
          ) : null}
          {saveMessage ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {saveMessage}
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 font-semibold text-gray-700">title</th>
                  <th className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">price</th>
                  <th className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">
                    sale_end_time
                  </th>
                  <th className="px-3 py-3 font-semibold text-gray-700 min-w-[12rem]">product_url</th>
                  <th className="px-3 py-3 font-semibold text-gray-700 min-w-[14rem]">affiliate_url</th>
                  <th className="px-3 py-3 font-semibold text-gray-700 w-28">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                      沒有資料
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-gray-50/80">
                      <td className="px-3 py-3 text-gray-900 max-w-xs">
                        <span className="line-clamp-3">{row.title ?? "—"}</span>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-gray-800 whitespace-nowrap">
                        {formatPrice(row.price)}
                      </td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                        {formatSaleEnd(row.sale_end_time)}
                      </td>
                      <td className="px-3 py-3">
                        {row.product_url ? (
                          <a
                            href={row.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-blue-600 hover:underline"
                          >
                            {row.product_url}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="url"
                          name={`affiliate-${row.id}`}
                          value={affiliateDrafts[row.id] ?? ""}
                          onChange={(e) => handleAffiliateChange(row.id, e.target.value)}
                          placeholder="https://"
                          className="w-full min-w-[12rem] rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => void handleSave(row.id)}
                          disabled={savingId === row.id}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {savingId === row.id ? "儲存中…" : "儲存"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
