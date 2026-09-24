import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SEO, { getBaseUrl } from '@/components/SEO';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { lineStickerSeoGuides } from '@/data/lineStickerSeoGuides';

export default function LineStickerSeoGuidePage() {
  const { slug } = useParams();
  const article = lineStickerSeoGuides.find((item) => item.slug === slug);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  if (!article) {
    return <Navigate to="/guides" replace />;
  }

  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const pageUrl = `${baseUrl}${article.path}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1,
    description: article.metaDescription,
    inLanguage: 'zh-TW',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    datePublished: '2026-09-24',
    dateModified: '2026-09-24',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'LINE 貼圖製作教學', item: `${baseUrl}/guides` },
      { '@type': 'ListItem', position: 3, name: article.h1, item: pageUrl },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const relatedGuides = lineStickerSeoGuides.filter((item) => item.slug !== article.slug);

  const copyPrompt = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLabel(label);
      window.setTimeout(() => {
        setCopiedLabel((current) => (current === label ? null : current));
      }, 1600);
    } catch {
      setCopiedLabel(null);
    }
  };

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
      <SEO
        title={article.seoTitle}
        description={article.metaDescription}
        path={article.path}
        keywords={article.keywords}
        ogType="article"
        jsonLdList={[articleSchema, breadcrumbSchema, faqSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: '首頁', to: '/' },
          { label: 'LINE 貼圖製作教學', to: '/guides' },
          { label: article.h1 },
        ]}
      />

      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-bold text-violet-700">RxV LINE 貼圖教學</p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
          {article.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{article.intro}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {article.ctas.map((cta) => (
            <Link
              key={cta.path}
              to={cta.path}
              className={
                cta.primary
                  ? 'inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-sm hover:bg-violet-700'
                  : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50'
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </header>

      {article.steps?.length ? (
        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-black text-slate-900">完整流程</h2>
          <ol className="mt-4 space-y-3">
            {article.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-black text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="mt-8 space-y-8">
        {article.sections.map((section) => (
          <section key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7">
            <h2 className="text-xl font-black text-slate-900 md:text-2xl">{section.heading}</h2>
            <div className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.bullets?.length ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {article.promptExamples?.length ? (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-900">可直接複製的 LINE 貼圖提示詞</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            可先直接複製，再把角色、文字與動作換成自己的內容。
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {article.promptExamples.map((example) => (
              <div key={example.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-slate-900">{example.label}</h3>
                  <button
                    type="button"
                    onClick={() => copyPrompt(example.label, example.prompt)}
                    className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700"
                  >
                    {copiedLabel === example.label ? '已複製' : '一鍵複製'}
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{example.prompt}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {article.sourceNote ? (
        <aside className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-slate-700">
          <span className="font-bold">規格來源：</span>
          <a
            href={article.sourceNote.url}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-blue-700 underline"
          >
            {article.sourceNote.label}
          </a>
          <span>。平台規格可能更新，正式送審前請再核對官方最新版本。</span>
        </aside>
      ) : null}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-7">
        <h2 className="text-2xl font-black text-slate-900">常見問題 FAQ</h2>
        <div className="mt-5 space-y-5">
          {article.faq.map((item) => (
            <div key={item.q}>
              <h3 className="font-black text-slate-900">{item.q}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white md:p-8">
        <h2 className="text-2xl font-black">直接使用 RxV 免費工具</h2>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          教學看完後可直接接著做，不需要另外建立資料庫或登入新服務。
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {article.ctas.map((cta) => (
            <Link
              key={cta.path}
              to={cta.path}
              className={
                cta.primary
                  ? 'inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-black !text-white hover:bg-violet-500'
                  : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-500 px-5 py-3 text-sm font-black !text-white hover:bg-slate-800'
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black text-slate-900">相關 LINE 貼圖教學</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relatedGuides.map((guide) => (
            <Link
              key={guide.slug}
              to={guide.path}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
              <h3 className="font-black leading-6 text-slate-900">{guide.h1}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{guide.intro}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
