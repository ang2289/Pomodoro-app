import { Link } from "react-router-dom";

const LINE_STICKER_AUTHOR_URL = "https://store.line.me/stickershop/author/5530587/zh-Hant";

type LineStickerAuthorCardProps = {
  compact?: boolean;
  className?: string;
};

export default function LineStickerAuthorCard({
  compact = false,
  className = "",
}: LineStickerAuthorCardProps) {
  return (
    <section
      className={`${compact ? "mt-6" : "mt-8"} overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white">
          RxV 原創作品
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
          LINE STORE
        </span>
      </div>

      <div className={compact ? "mt-4" : "mt-5 grid gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-center"}>
        <div>
          <h2 className={`${compact ? "text-xl" : "text-2xl"} font-black leading-tight text-slate-900`}>
            想看實際上架作品？
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            這裡整理了 RxV 夢想創意工作室製作的原創 LINE 貼圖與表情貼，包含日常回覆、療癒角色與可愛聊天貼圖。可以先到 LINE STORE 查看目前已上架的作品。
          </p>
        </div>

        <div className={`${compact ? "mt-4" : ""} flex flex-col gap-3 sm:flex-row md:flex-col`}>
          <a
            href={LINE_STICKER_AUTHOR_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow-xl active:scale-[0.98]"
            style={{ color: "#ffffff" }}
          >
            前往 LINE STORE 看貼圖
          </a>
          <Link
            to="/tools/line-sticker"
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-lg active:scale-[0.98]"
          >
            使用本站貼圖工具
          </Link>
        </div>
      </div>
    </section>
  );
}
