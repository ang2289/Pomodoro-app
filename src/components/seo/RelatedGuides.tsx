import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RelatedGuideItem } from '@/data/internalLinks';
import { anchorForGuide } from '@/utils/seoAnchorText';

export type RelatedGuidesProps = {
  title?: string;
  items: RelatedGuideItem[];
  className?: string;
};

/**
 * 相關教學文章；錨點文字語意化。
 */
export function RelatedGuides({ title, items, className = '' }: RelatedGuidesProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('guide.related.title');
  const uniqueItems = Array.from(
    new Map(items.map((item) => [item.href || item.title, item])).values(),
  );

  if (uniqueItems.length === 0) return null;

  return (
    <section className={`mt-10 ${className}`} aria-labelledby="seo-related-guides-h2">
      <h2 id="seo-related-guides-h2" className="text-xl font-semibold text-slate-900">
        {resolvedTitle}
      </h2>
      <nav className="mt-4" aria-label={resolvedTitle}>
        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
          {uniqueItems.map((item) => (
            <li key={item.href || item.title}>
              <Link
                to={item.href}
                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <span className="font-semibold text-blue-700 hover:text-blue-800">{anchorForGuide(item.title)}</span>
                {item.tag ? (
                  <span className="mt-1 text-xs font-medium text-slate-400">{item.tag}</span>
                ) : null}
                {item.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
