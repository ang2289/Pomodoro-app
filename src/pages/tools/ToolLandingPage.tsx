import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO, { getBaseUrl } from '@/components/SEO';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { PopularPages } from '@/components/seo/PopularPages';
import { RelatedGuides } from '@/components/seo/RelatedGuides';
import { RelatedTools } from '@/components/seo/RelatedTools';
import type { ComparisonSeoPageContent } from '@/data/comparisonSeoContent';
import { comparisonPages } from '@/data/comparisonSeoContent';
import { getGuideItemsForLanding, getPopularItemsForLanding, getRelatedToolsForLanding } from '@/data/internalLinks';
import { getSeoPeerLandingLinks, getSeoToolLandingPage } from '@/data/seoPages';
import { toolLandingPages } from '@/data/toolSeoContent';
import { localizedComparisonPage, localizedToolLandingPage } from '@/lib/seoContentLocale';
import { SeoPageCard } from '@/components/seo/SeoPageCard';

function ComparisonToolLanding({ page }: { page: ComparisonSeoPageContent }) {
  const { t, i18n } = useTranslation();
  const pageLoc = useMemo(() => localizedComparisonPage(page, i18n.language), [page, i18n.language]);
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}${pageLoc.path}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageLoc.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav_home'), item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: t('nav.breadcrumb.toolsHub'), item: `${baseUrl}/tools` },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageLoc.scenarioLabel,
        item: canonicalUrl,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageLoc.h1,
    description: pageLoc.metaDescription,
    url: canonicalUrl,
    inLanguage: inLang,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <SEO
        title={pageLoc.seoTitle}
        description={pageLoc.metaDescription}
        path={pageLoc.path}
        jsonLdList={[webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: t('nav_home'), to: '/' },
          { label: t('nav.breadcrumb.toolsHub'), to: '/tools' },
          { label: pageLoc.scenarioLabel },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{pageLoc.h1}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('compare.section.intro')}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{pageLoc.intro}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('compare.section.table')}</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('compare.section.criterion')}</th>
                <th className="px-4 py-3 font-semibold">{pageLoc.labelA}</th>
                <th className="px-4 py-3 font-semibold">{pageLoc.labelB}</th>
              </tr>
            </thead>
            <tbody>
              {pageLoc.table.map((row) => (
                <tr key={row.criterion} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.criterion}</td>
                  <td className="px-4 py-3">{row.sideA}</td>
                  <td className="px-4 py-3">{row.sideB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">{t('compare.prosConsHeading', { label: pageLoc.labelA })}</h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-700">{t('compare.pros')}</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {pageLoc.prosA.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-amber-800">{t('compare.cons')}</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {pageLoc.consA.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">{t('compare.prosConsHeading', { label: pageLoc.labelB })}</h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-700">{t('compare.pros')}</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {pageLoc.prosB.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-amber-800">{t('compare.cons')}</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {pageLoc.consB.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('compare.section.situations')}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-slate-700">
          {page.situations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('compare.section.faq')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {page.faq.map((item) => (
            <div key={item.q}>
              <p className="font-medium text-slate-900">{item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{t('landing.cta.compare')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('landing.cta.compareDesc')}</p>
        <Link
          to={pageLoc.ctaPath}
          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {pageLoc.ctaLabel}
        </Link>
      </section>

      <RelatedTools items={getRelatedToolsForLanding(pageLoc.relatedToolKey)} title={t('landing.relatedTools')} />
      <RelatedGuides items={getGuideItemsForLanding(pageLoc.relatedToolKey)} />
      <PopularPages items={getPopularItemsForLanding(pageLoc.path, pageLoc.relatedToolKey)} title={t('landing.popularPagesSeo')} />
    </div>
  );
}

export default function ToolLandingPage() {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';
  const { toolSlug, landingSlug, compareSlug } = useParams();
  const path = `/tools/${toolSlug}/${landingSlug}`;
  const page =
    toolLandingPages.find((item) => item.path === path) ?? getSeoToolLandingPage(path);
  const seoPeerLinks = page ? getSeoPeerLandingLinks(path, page.toolKey, 8) : [];
  const pageLoc = useMemo(() => {
    if (!page) return null;
    let loc = localizedToolLandingPage(page, i18n.language);
    if (page.seoI18n) {
      const h1 = t(page.seoI18n.titleKey, { defaultValue: loc.h1 });
      const intro = t(page.seoI18n.descKey, { defaultValue: loc.metaDescription });
      const scenarioLabel = h1.length > 42 ? `${h1.slice(0, 39)}…` : h1;
      loc = {
        ...loc,
        h1,
        intro,
        metaDescription: intro,
        seoTitle: `${h1}｜RxV`,
        scenarioLabel,
      };
    }
    return loc;
  }, [page, i18n.language, t]);

  if (compareSlug) {
    const cmp = comparisonPages.find((item) => item.slug === compareSlug);
    if (!cmp) {
      return <Navigate to="/tools" replace />;
    }
    return <ComparisonToolLanding page={cmp} />;
  }

  if (!page || !pageLoc) {
    return <Navigate to="/tools" replace />;
  }

  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}${pageLoc.path}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageLoc.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav_home'), item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: t('nav.breadcrumb.toolsHub'), item: `${baseUrl}/tools` },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageLoc.breadcrumbParentName,
        item: `${baseUrl}${pageLoc.breadcrumbParentPath}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: pageLoc.scenarioLabel,
        item: canonicalUrl,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageLoc.h1,
    description: pageLoc.metaDescription,
    url: canonicalUrl,
    inLanguage: inLang,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <SEO
        title={pageLoc.seoTitle}
        description={pageLoc.metaDescription}
        path={pageLoc.path}
        jsonLdList={[webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: t('nav_home'), to: '/' },
          { label: t('nav.breadcrumb.toolsHub'), to: '/tools' },
          { label: pageLoc.breadcrumbParentName, to: pageLoc.breadcrumbParentPath },
          { label: pageLoc.scenarioLabel },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{pageLoc.h1}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.intro')}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{pageLoc.intro}</p>
      </section>

      {pageLoc.steps && pageLoc.steps.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.steps')}</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
            {pageLoc.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.situations')}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-slate-700">
          {pageLoc.situations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.faq')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {pageLoc.faq.map((item) => (
            <div key={item.q}>
              <p className="font-medium text-slate-900">{item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{t('landing.cta.primary')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('landing.cta.primaryDesc')}</p>
        <Link
          to={pageLoc.ctaPath}
          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {pageLoc.ctaLabel}
        </Link>
      </section>

      <RelatedTools items={getRelatedToolsForLanding(pageLoc.toolKey)} title={t('landing.relatedTools')} />
      <RelatedGuides items={getGuideItemsForLanding(pageLoc.toolKey)} />
      {seoPeerLinks.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">{t('searchTemplate.relatedLandings')}</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-700">
            {seoPeerLinks.map((item) => (
              <li key={item.path}>
                <SeoPageCard path={item.path} titleKey={item.titleKey} descKey={item.descKey} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <PopularPages items={getPopularItemsForLanding(pageLoc.path, pageLoc.toolKey)} title={t('landing.popularPagesSeo')} />
    </div>
  );
}
