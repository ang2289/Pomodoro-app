import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RelatedToolItem } from '@/data/internalLinks';
import { anchorForTool } from '@/utils/seoAnchorText';

export type RelatedToolsProps = {
  title?: string;
  items: RelatedToolItem[];
  className?: string;
};

/**
 * 相關工具卡片；連結錨點由 seoAnchorText 產生（語意化，非「點這裡」）。
 */
export function RelatedTools({ title, items, className = '' }: RelatedToolsProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('related_tools_section_title');
  if (items.length === 0) return null;

  return (
    <section className={`mt-10 ${className}`} aria-labelledby="seo-related-tools-h2">
      <h2 id="seo-related-tools-h2" className="text-xl font-semibold text-slate-900">
        {resolvedTitle}
      </h2>
      <nav className="mt-4" aria-label={resolvedTitle}>
        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <span className="font-semibold text-blue-700 hover:text-blue-800">{anchorForTool(item.title)}</span>
                {item.category ? (
                  <span className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{item.category}</span>
                ) : null}
                {item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
