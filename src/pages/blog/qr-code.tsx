import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { qrArticles } from "@/data/qrArticles";
import ArticleCTA from "@/components/ArticleCTA";

export default function QrCodeArticlesPage() {
  return (
    <>
      <Helmet>
        <title>QR Code 文章專區｜完整教學與行銷實戰</title>
        <meta
          name="description"
          content="精選 10 篇 QR Code 主題文章，涵蓋製作教學、Logo 設計、尺寸建議、行銷應用、安全風險與熱門排行榜。"
        />
        <meta property="og:title" content="QR Code 文章專區" />
        <meta
          property="og:description"
          content="一次看懂 QR Code 製作、商用、線下引流、短網址與安全性，並快速套用到你的業務場景。"
        />
        <meta property="og:type" content="article" />
      </Helmet>

      <main className="mx-auto max-w-5xl px-4 py-10 pb-24">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">QR Code 主題文章</h1>
          <p className="mx-auto mt-4 max-w-3xl text-gray-600">
            這裡整理了 10 篇可直接閱讀與實作的 QR Code 主題文章。每篇都包含實作教學、用途拆解、常見問題與站內相關連結，
            方便你快速找到適合的場景，並在實務中套用。
          </p>
        </header>
        <ArticleCTA placement="start" focus="qr" />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {qrArticles.map((article, idx) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">文章 #{idx + 1}</p>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-blue-700">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">{article.desc}</p>
              <p className="mt-4 text-sm font-medium text-blue-600">閱讀完整內容 →</p>
            </Link>
          ))}
        </section>
        <ArticleCTA placement="middle" focus="qr" />

        <section className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-900">從內容直接行動</h2>
          <p className="mt-2 text-emerald-800">
            看完文章後，你可以直接建立自己的 QR Code，或先查看目前最熱門的使用案例，快速複製可行做法。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/tools/qr-code"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              👉 免費產生 QR Code
            </Link>
            <Link
              to="/qr-top"
              className="rounded-xl border border-emerald-400 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
            >
              👉 查看熱門排行榜
            </Link>
          </div>
        </section>
        <ArticleCTA placement="afterFaq" focus="qr" />
        <ArticleCTA placement="bottom" focus="qr" />
      </main>
    </>
  );
}
