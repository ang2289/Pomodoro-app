import { Link } from "react-router-dom";
import {
  ARTICLE_CTA_LINKS,
  type ArticleCtaToolKey,
} from "@/config/articleCtaLinks";

export type ArticleCTAPlacement = "start" | "middle" | "afterFaq" | "bottom";

export interface ArticleCTAProps {
  /** 區塊位置（影響標題與間距） */
  placement: ArticleCTAPlacement;
  /** 主要按鈕導向哪一類工具 */
  focus?: ArticleCtaToolKey;
  className?: string;
}

const placementTitle: Record<ArticleCTAPlacement, string> = {
  start: "免費線上工具｜快速整理與實作",
  middle: "需要把內容變短、變清楚？",
  afterFaq: "動手試試站內工具",
  bottom: "探索更多免費工具",
};

const placementMargin: Record<ArticleCTAPlacement, string> = {
  start: "my-6",
  middle: "my-8",
  afterFaq: "my-8",
  bottom: "mt-10 mb-4",
};

const focusLabel: Record<ArticleCtaToolKey, string> = {
  qr: "開啟 QR Code 產生器",
  summary: "開啟 AI 摘要",
  homework: "開啟作業解題",
  tools: "前往工具中心",
};

export default function ArticleCTA({
  placement,
  focus = "tools",
  className = "",
}: ArticleCTAProps) {
  const primary = ARTICLE_CTA_LINKS[focus] ?? ARTICLE_CTA_LINKS.tools;
  const primaryLabel = focusLabel[focus] ?? focusLabel.tools;

  return (
    <aside
      className={`not-prose rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 md:p-6 shadow-sm ${placementMargin[placement]} ${className}`}
    >
      <p className="text-sm font-semibold text-slate-900">
        {placementTitle[placement]}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        站內提供{" "}
        <Link
          to={ARTICLE_CTA_LINKS.summary}
          className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
        >
          AI 摘要
        </Link>
        、
        <Link
          to={ARTICLE_CTA_LINKS.homework}
          className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
        >
          作業解題
        </Link>
        、
        <Link
          to={ARTICLE_CTA_LINKS.qr}
          className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
        >
          QR Code
        </Link>{" "}
        等工具，也可到{" "}
        <Link
          to={ARTICLE_CTA_LINKS.tools}
          className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
        >
          工具中心
        </Link>
        一次瀏覽。
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={primary}
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition"
        >
          {primaryLabel}
        </Link>
        <Link
          to={ARTICLE_CTA_LINKS.tools}
          className="inline-flex items-center justify-center border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
        >
          瀏覽全部工具
        </Link>
      </div>
    </aside>
  );
}
