import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import SEO, { getBaseUrl } from '@/components/SEO';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { PopularPages } from '@/components/seo/PopularPages';
import { RelatedGuides } from '@/components/seo/RelatedGuides';
import { RelatedTools } from '@/components/seo/RelatedTools';
import {
  getSearchSeoPageBySlug,
  mergeSearchGuides,
  mergeSearchPopular,
  resolveSearchCanonicalPath,
  resolveSearchLandingLinks,
} from '@/data/searchSeoPages';
import { getRelatedToolsForLanding } from '@/data/internalLinks';
import { localizedSearchSeoPage } from '@/lib/seoContentLocale';
import { SeoPageCard } from '@/components/seo/SeoPageCard';

export default function SearchSeoSlugPage() {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';
  const { slug = '' } = useParams<{ slug: string }>();
  const page = getSearchSeoPageBySlug(slug);
  const pageLoc = useMemo(() => {
    if (!page) return null;
    let loc = localizedSearchSeoPage(page, i18n.language);
    if (page.seoI18n) {
      const h1 = t(page.seoI18n.titleKey, { defaultValue: loc.h1 });
      const intro = t(page.seoI18n.descKey, { defaultValue: loc.intro });
      loc = {
        ...loc,
        h1,
        intro,
        metaDescription: intro,
        seoTitle: `${h1}｜搜尋｜RxV`,
      };
    }
    return loc;
  }, [page, i18n.language, t]);
  const baseUrl = getBaseUrl().replace(/\/$/, '');

  if (!page || !pageLoc) {
    const canonicalPath = resolveSearchCanonicalPath(slug);
    const slugDisplay = slug || '…';
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <SEO
          title={t('searchTemplate.fallbackSeoTitle')}
          description={t('searchTemplate.fallbackSeoDesc')}
          path={canonicalPath}
          noindex
        />
        <BreadcrumbNav
          items={[
            { label: t('nav_home'), to: '/' },
            { label: t('nav.breadcrumb.search'), to: '/search' },
            { label: slugDisplay },
          ]}
        />
        <h1 className="text-xl font-bold text-slate-900">{t('searchTemplate.fallbackH1')}</h1>
        <p className="mt-3 text-slate-600 leading-relaxed">
          <Trans
            i18nKey="searchTemplate.fallbackBody"
            values={{ slug: slugDisplay }}
            components={{
              searchLink: (
                <Link to="/search" className="text-blue-700 underline hover:text-blue-900" />
              ),
              toolsLink: <Link to="/tools" className="text-blue-700 underline hover:text-blue-900" />,
            }}
          />
        </p>
      </div>
    );
  }

  const path = `/search/${pageLoc.slug}`;
  const canonicalUrl = `${baseUrl}${path}`;

  const landingLinks = resolveSearchLandingLinks(pageLoc.relatedLandingPaths);
  const tools = getRelatedToolsForLanding(pageLoc.relatedToolKey);
  const guides = mergeSearchGuides(pageLoc.relatedToolKey, pageLoc.relatedGuideSlugs);
  const popular = mergeSearchPopular(pageLoc.relatedToolKey, pageLoc.popularPagePaths, path);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageLoc.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav_home'), item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: t('nav.breadcrumb.search'), item: `${baseUrl}/search` },
      { '@type': 'ListItem', position: 3, name: pageLoc.keyword, item: canonicalUrl },
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
        path={path}
        jsonLdList={[webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: t('nav_home'), to: '/' },
          { label: t('nav.breadcrumb.search'), to: '/search' },
          { label: pageLoc.keyword },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{pageLoc.h1}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.intro')}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{pageLoc.intro}</p>
      </section>

      <RelatedTools items={tools} title={t('searchTemplate.relatedTools')} />

      {landingLinks.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">{t('searchTemplate.relatedLandings')}</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-700">
            {landingLinks.map((item) => (
              <li key={item.path}>
                {item.titleKey && item.descKey ? (
                  <SeoPageCard path={item.path} titleKey={item.titleKey} descKey={item.descKey} />
                ) : (
                  <>
                    <Link to={item.path} className="text-blue-700 hover:text-blue-900 hover:underline">
                      {item.h1}
                    </Link>
                    <span className="text-slate-400"> — {item.label}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelatedGuides items={guides} title={t('searchTemplate.guides')} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.faq')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {pageLoc.faqs.map((item) => (
            <div key={item.q}>
              <p className="font-medium text-slate-900">{item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{t('searchTemplate.ctaTitle')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('searchTemplate.ctaDesc')}</p>
        <Link
          to={pageLoc.ctaPath}
          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {pageLoc.ctaLabel}
        </Link>
      </section>

      <PopularPages items={popular} title={t('landing.popularPagesSeo')} />
    </div>
  );
}
