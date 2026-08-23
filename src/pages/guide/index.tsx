import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO, { getBaseUrl } from '@/components/SEO';
import { guideArticles } from '@/data/toolSeoContent';

export default function GuideIndexPage() {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const guideUrl = `${baseUrl}/guide`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('guideIndex.collectionName'),
    description: t('guideIndex.collectionDesc'),
    url: guideUrl,
    inLanguage: inLang,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav_home'), item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: t('guideIndex.collectionName'), item: guideUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <SEO
        title={t('guideIndex.seo.title')}
        description={t('guideIndex.seo.description')}
        path="/guide"
        jsonLdList={[collectionSchema, breadcrumbSchema]}
      />

      <nav className="mb-4 text-sm text-slate-600">
        <Link to="/" className="hover:underline">{t('nav_home')}</Link> / <span>{t('guideIndex.breadcrumbCurrent')}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('guideIndex.h1')}</h1>
      <p className="mt-3 text-slate-600">
        {t('guideIndex.intro')}
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {guideArticles.map((article) => (
          <Link
            key={article.slug}
            to={article.path}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
          >
            <h2 className="text-base font-semibold text-slate-900">{article.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{article.intro}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
