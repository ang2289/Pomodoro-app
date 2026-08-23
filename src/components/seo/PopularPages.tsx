import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PopularPageItem } from '@/data/internalLinks';
import { getSeoToolLandingPage } from '@/data/seoPages';
import { toolLandingPages } from '@/data/toolSeoContent';
import { isEnLocale, localizedToolLandingPage } from '@/lib/seoContentLocale';
import { anchorForPopular } from '@/utils/seoAnchorText';

export type PopularPagesProps = {
  title?: string;
  items: PopularPageItem[];
  className?: string;
};

/**
 * 單卡：若 href 對應工具／程式化 SEO 落地頁，依語系套用與 ToolLandingPage 相同的本地化（含 seoI18n）。
 */
function PopularPageLinkItem({ item }: { item: PopularPageItem }) {
  const { t, i18n } = useTranslation();
  const page = toolLandingPages.find((p) => p.path === item.href) ?? getSeoToolLandingPage(item.href);

  let linkText: string;
  let body: string | undefined;

  if (page) {
    let loc = localizedToolLandingPage(page, i18n.language);
    if (page.seoI18n) {
      const h1 = t(page.seoI18n.titleKey, { defaultValue: loc.h1 });
      const meta = t(page.seoI18n.descKey, { defaultValue: loc.metaDescription });
      loc = { ...loc, h1, metaDescription: meta };
    }
    linkText = isEnLocale(i18n.language) ? loc.h1 : anchorForPopular(loc.h1);
    body = loc.metaDescription;
  } else {
    linkText = anchorForPopular(item.title);
    body = item.description;
  }

  return (
    <li>
      <Link
        to={item.href}
        className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <span className="font-semibold text-blue-700 hover:text-blue-800">{linkText}</span>
        {item.badge ? (
          <span className="mt-1 text-xs font-medium text-amber-700/90">{item.badge}</span>
        ) : null}
        {body ? <p className="mt-2 line-clamp-2 text-sm text-slate-600">{body}</p> : null}
      </Link>
    </li>
  );
}

/**
 * 熱門 SEO 落地頁內連。
 */
export function PopularPages({ title, items, className = '' }: PopularPagesProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('landing.popularPagesDefault');
  if (items.length === 0) return null;

  return (
    <section className={`mt-10 ${className}`} aria-labelledby="seo-popular-pages-h2">
      <h2 id="seo-popular-pages-h2" className="text-xl font-semibold text-slate-900">
        {resolvedTitle}
      </h2>
      <nav className="mt-4" aria-label={resolvedTitle}>
        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PopularPageLinkItem key={item.href} item={item} />
          ))}
        </ul>
      </nav>
    </section>
  );
}
