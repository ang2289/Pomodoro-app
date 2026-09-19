import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO, { getBaseUrl } from '@/components/SEO';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { PopularPages } from '@/components/seo/PopularPages';
import { RelatedGuides } from '@/components/seo/RelatedGuides';
import { RelatedTools } from '@/components/seo/RelatedTools';
import {
  getCategoryInternalLinkKeys,
  getCategoryPopularMerged,
  getCategoryRelatedGuidesMerged,
  getCategoryRelatedToolsMerged,
} from '@/data/internalLinks';
import { toolCategoryPages, type ToolCategoryKey } from '@/data/toolSeoContent';

type Props = {
  categoryKey: ToolCategoryKey;
};

export default function ToolCategoryPage({ categoryKey }: Props) {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const category = toolCategoryPages.find((item) => item.key === categoryKey);

  if (!category) {
    return null;
  }

  const categoryKeys = getCategoryInternalLinkKeys(categoryKey);
  const categoryPopular = getCategoryPopularMerged(categoryKeys);
  const categoryGuides = getCategoryRelatedGuidesMerged(categoryKeys);
  const categoryTools = getCategoryRelatedToolsMerged(categoryKeys);

  const canonicalUrl = `${baseUrl}${category.path}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav_home'), item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: t('nav.breadcrumb.toolsHub'), item: `${baseUrl}/tools` },
      { '@type': 'ListItem', position: 3, name: category.h1, item: canonicalUrl },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: category.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: category.h1,
    description: category.intro,
    url: canonicalUrl,
    inLanguage: inLang,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <SEO
        title={t('toolCategory.seoTitle', { h1: category.h1 })}
        description={category.intro}
        path={category.path}
        jsonLdList={[webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <BreadcrumbNav
        items={[
          { label: t('nav_home'), to: '/' },
          { label: t('nav.breadcrumb.toolsHub'), to: '/tools' },
          { label: category.h1 },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{category.h1}</h1>
      <p className="mt-3 text-slate-600 leading-relaxed">{category.intro}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('toolCategory.sectionIntro')}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-slate-700">
          {category.purpose.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('toolCategory.sectionToolCards')}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {category.tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
            >
              <h3 className="text-base font-semibold text-slate-900">{tool.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('toolCategory.sectionUsage')}</h2>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
          {t('toolCategory.sectionUsageP')}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">{t('landing.section.faq')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {category.faq.map((item) => (
            <div key={item.q}>
              <p className="font-medium text-slate-900">{item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PopularPages title={t('toolCategory.popularTitle')} items={categoryPopular} />
      <RelatedGuides title={t('toolCategory.guidesTitle')} items={categoryGuides} />
      <RelatedTools title={t('toolCategory.toolsTitle')} items={categoryTools} />
    </div>
  );
}
