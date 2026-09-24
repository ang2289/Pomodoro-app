import { Link } from 'react-router-dom';
import SEO, { getBaseUrl } from '@/components/SEO';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { lineStickerSeoGuides } from '@/data/lineStickerSeoGuides';

export default function LineStickerGuidesIndexPage() {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const pageUrl = `${baseUrl}/guides`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'LINE 貼圖製作教學',
    description: 'LINE 貼圖尺寸、AI 提示詞與完整製作流程教學。',
    url: pageUrl,
    inLanguage: 'zh-TW',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'LINE 貼圖製作教學', item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <SEO
        title="LINE 貼圖製作教學｜尺寸、提示詞、AI 製作流程 - RxV"
        description="整理 LINE 貼圖尺寸與規格、AI 貼圖提示詞範例，以及從產圖、分割、去背到上架準備的完整教學。"
        path="/guides"
        keywords="LINE貼圖製作,LINE貼圖尺寸,LINE貼圖提示詞,AI LINE貼圖"
        jsonLdList={[collectionSchema, breadcrumbSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: '首頁', to: '/' },
          { label: 'LINE 貼圖製作教學' },
        ]}
      />

      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-bold text-violet-700">RxV 免費教學</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          LINE 貼圖製作教學
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          從尺寸規格、AI 提示詞到完整製作流程，先把最容易出錯的步驟整理好，再直接進入 RxV 免費工具處理。
        </p>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {lineStickerSeoGuides.map((guide) => (
          <Link
            key={guide.slug}
            to={guide.path}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
          >
            <h2 className="text-lg font-black leading-7 text-slate-900">{guide.h1}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guide.intro}</p>
            <span className="mt-5 inline-flex text-sm font-bold text-violet-700">查看教學 →</span>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white md:p-8">
        <h2 className="text-xl font-black">直接開始製作</h2>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          已經知道要做什麼時，可以直接使用提示詞產生器與圖片分割工具。
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/tools/sticker-prompt"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-black !text-white hover:bg-violet-500"
          >
            LINE 貼圖提示詞產生器
          </Link>
          <Link
            to="/tools/sticker-splitter"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black !text-white hover:bg-emerald-500"
          >
            LINE 貼圖圖片分割工具
          </Link>
          <Link
            to="/tools/line-sticker"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-500 px-5 py-3 text-sm font-black !text-white hover:bg-slate-800"
          >
            LINE 貼圖工具
          </Link>
        </div>
      </section>
    </div>
  );
}
