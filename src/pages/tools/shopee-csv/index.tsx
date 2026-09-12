import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isLocalDevelopment } from "@/lib/isLocalDevelopment";
import VideoToolUnavailable from "@/components/VideoToolUnavailable";
import SEO from "@/components/SEO";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface ScriptItem {
  title: string;
  price: string;
  promoUrl: string;
  productId?: string;
  sold?: string;
  image: string;
  images: string[];
}

type RawRow = Record<string, any>;

function normalizeNumber(val: unknown): string {
  if (val == null) return "";
  const s = String(val).replace(/[,$]/g, "").trim();
  return s;
}

function pickRowValue(row: RawRow, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

function downloadJson(filename: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function parseFile(file: File): Promise<ScriptItem[]> {
  const name = file.name.toLowerCase();
  let rows: RawRow[] = [];

  if (name.endsWith(".csv")) {
    const text = await file.text();
    const parsed = Papa.parse<RawRow>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors?.length) {
      // 只提示前幾個錯誤作為警告
      console.warn("CSV 解析警告：", parsed.errors.slice(0, 3));
    }
    rows = (parsed.data as RawRow[]) || [];
  } else {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  }

  const scripts: ScriptItem[] = rows
    .map((row) => {
      const productId = pickRowValue(row, ["商品編號", "商品ID", "itemid", "item_id"]);
      const title = pickRowValue(row, ["商品名稱", "商品标题", "title", "name"]);
      const price = normalizeNumber(
        pickRowValue(row, ["商品價格", "價格", "price"])
      );
      const sold = pickRowValue(row, ["銷售量", "销量", "sold"]);

      // 統一推廣連結欄位 mapping（必填）
      const promoUrl = pickRowValue(row, [
        "推廣連結",
        "推薦連結",
        "推廣網址",
        "推广链接",
        "promo_url",
        "promotion_url",
      ]);

      const productUrl = pickRowValue(row, [
        "商品連結",
        "商品链接",
        "product_url",
        "url",
      ]);

      return {
        title,
        price,
        promoUrl,
        productId: productId || undefined,
        sold: sold || undefined,
        // 保留在資料中方便後續使用
        // 但 scripts.json 格式的 image/images 先留空
        image: "",
        images: [] as string[],
        // 額外資訊可以塞進 highlights 或忽略，此處先不產生腳本內容
      } as ScriptItem & { productUrl?: string };
    })
    // 過濾掉沒有 title 或沒有 promoUrl 的列
    .filter((x) => x.title && x.promoUrl);

  return scripts;
}

function ShopeeCsvPageInner() {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setScripts([]);
    setLoading(true);

    try {
      const result = await parseFile(file);
      setScripts(result);
      if (result.length === 0) {
        setError(t("shopee_csv_no_data"));
      } else {
        toast.success(t("shopee_csv_parsed", { count: result.length }));
      }
    } catch (err: any) {
      console.error("解析檔案失敗:", err);
      setError(err?.message || t("shopee_csv_parse_failed"));
      toast.error(t("shopee_csv_parse_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!scripts.length) {
      toast.error(t("shopee_csv_no_export"));
      return;
    }
    downloadJson("scripts.json", scripts);
    toast.success(t("shopee_csv_downloaded"));
  };

  const preview = scripts.slice(0, 20);

  return (
    <>
      <SEO
        title="Shopee CSV 腳本工具｜免費Shopee CSV 腳本工具 - RxV AI工具中心"
        description="免費Shopee CSV 腳本工具，支援線上使用，快速完成任務，無需下載。"
        keywords="Shopee CSV 腳本工具, AI工具, 免費工具"
        path="/tools/shopee-csv"
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shopee CSV 腳本工具（免費）｜AI工具推薦</h1>
      <p className="text-gray-600 mb-6 text-sm">
        這是一款免費Shopee CSV 腳本工具，可用於匯入商品資料並快速整理短影音腳本欄位，支援線上使用，不需下載，快速完成任務。
      </p>

      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t("shopee_csv_upload_label")}
        </label>
        <input
          type="file"
          accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {fileName && (
          <p className="text-xs text-gray-500">{t("shopee_csv_file_selected", { fileName })}</p>
        )}
        <p className="text-xs text-gray-500">
          {t("shopee_csv_upload_hint")}
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          {t("shopee_csv_valid_count", { count: scripts.length })}
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading || !scripts.length}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {t("shopee_csv_btn_download")}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
          {t("shopee_csv_preview_title")}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border-b">#</th>
                <th className="px-4 py-2 border-b">{t("shopee_csv_th_product_name")}</th>
                <th className="px-4 py-2 border-b">{t("shopee_csv_th_price")}</th>
                <th className="px-4 py-2 border-b">{t("shopee_csv_th_promo")}</th>
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    {t("shopee_csv_empty")}
                  </td>
                </tr>
              ) : (
                preview.map((item, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border-b text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-800">
                      {item.title}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {item.price}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {item.promoUrl ? (
                        <a
                          href={item.promoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline break-all"
                        >
                          {item.promoUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400">{t("shopee_csv_no_promo")}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">什麼是Shopee CSV 腳本工具？</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Shopee CSV 腳本工具是一種常見的AI工具，可幫助使用者提升效率，適合用於工作、學習與日常應用。
        </p>

        <h2 className="mt-6 text-xl font-semibold text-slate-900">為什麼使用這個工具？</h2>
        <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
          <li>免費使用</li>
          <li>不需安裝</li>
          <li>支援快速處理</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold text-slate-900">更多相關工具</h2>
        <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
          <li><a href="/tools" className="text-blue-600 hover:underline">工具中心</a></li>
          <li><a href="/summary" className="text-blue-600 hover:underline">AI摘要工具</a></li>
          <li><a href="/tools/homework-helper" className="text-blue-600 hover:underline">AI作業解題</a></li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Shopee CSV 腳本工具是資料整理型AI工具，可加速商品腳本產生流程。這款免費工具讓匯入與檢查更直覺，讓 Shopee CSV 腳本工具在日常營運更穩定。若你在建立完整的AI工具與免費工具流程，Shopee CSV 腳本工具會很關鍵。
        </p>
        <div className="mt-8">
          <a href="/tools" className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]">
            👉 查看更多 AI 工具
          </a>
        </div>
      </section>
      </div>
    </>
  );
}

export default function ShopeeCsvPage() {
  if (!isLocalDevelopment()) {
    return <VideoToolUnavailable />;
  }
  return <ShopeeCsvPageInner />;
}

