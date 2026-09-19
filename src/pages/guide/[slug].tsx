import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO, { getBaseUrl } from '@/components/SEO';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { PopularPages } from '@/components/seo/PopularPages';
import { RelatedGuides } from '@/components/seo/RelatedGuides';
import { RelatedTools } from '@/components/seo/RelatedTools';
import {
  getPopularPageItems,
  getRelatedGuideItems,
  getRelatedToolsItems,
  inferInternalLinkKeyFromGuideCta,
  type InternalLinkKey,
} from '@/data/internalLinks';
import { guideArticles } from '@/data/toolSeoContent';
import { localizedGuideArticle } from '@/lib/seoContentLocale';

export default function GuideArticlePage() {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const article = guideArticles.find((item) => item.slug === slug);
  const articleLoc = useMemo(
    () => (article ? localizedGuideArticle(article, i18n.language) : null),
    [article, i18n.language]
  );

  if (!article || !articleLoc) {
    return <Navigate to="/guide" replace />;
  }

  const pageTitle = articleLoc.seoTitle ?? t('guideArticle.defaultSeoTitle', { title: articleLoc.title });
  const metaDescription = articleLoc.metaDescription ?? articleLoc.intro;

  const linkKey: InternalLinkKey | undefined =
    articleLoc.internalLinkKey ?? inferInternalLinkKeyFromGuideCta(articleLoc.cta.path);

  const relatedToolItems = linkKey ? getRelatedToolsItems(linkKey) : [];
  const relatedGuideItems = linkKey
    ? getRelatedGuideItems(linkKey).filter((g) => g.href !== articleLoc.path)
    : [];
  const popularItems = linkKey ? getPopularPageItems(linkKey) : [];

  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleLoc.title,
    description: metaDescription,
    inLanguage: inLang,
    url: `${baseUrl}${articleLoc.path}`,
    mainEntityOfPage: `${baseUrl}${articleLoc.path}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav_home'), item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: t('guideIndex.breadcrumbCurrent'), item: `${baseUrl}/guide` },
      { '@type': 'ListItem', position: 3, name: articleLoc.title, item: `${baseUrl}${articleLoc.path}` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: articleLoc.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
      <SEO
        title={pageTitle}
        description={metaDescription}
        path={articleLoc.path}
        jsonLdList={[articleSchema, breadcrumbSchema, faqSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: t('nav_home'), to: '/' },
          { label: t('guideIndex.breadcrumbCurrent'), to: '/guide' },
          { label: articleLoc.title },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{articleLoc.title}</h1>
      <p className="mt-3 text-slate-600 leading-relaxed">{articleLoc.intro}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('guideArticle.sectionHighlights')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {articleLoc.paragraphs.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('guideArticle.sectionSteps')}</h2>
        <ol className="mt-3 list-decimal pl-5 space-y-1 text-sm text-slate-700">
          {articleLoc.steps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.faq')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {articleLoc.faq.map((item) => (
            <div key={item.q}>
              <p className="font-medium text-slate-900">{item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{t('guideArticle.ctaHeading')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('guideArticle.ctaBody')}</p>
        <Link
          to={articleLoc.cta.path}
          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t('guideArticle.ctaButton', { name: articleLoc.cta.name })}
        </Link>
      </section>

      {linkKey ? (
        <>
          <RelatedTools items={relatedToolItems} title="相關工具" />
          <RelatedGuides items={relatedGuideItems} title="相關教學" />
          <PopularPages items={popularItems} title="熱門主題頁" />
        </>
      ) : null}
    </div>
  );
}
