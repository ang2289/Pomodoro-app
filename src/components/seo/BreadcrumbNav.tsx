import { Link } from 'react-router-dom';

export type BreadcrumbCrumb = { label: string; to?: string };

type Props = {
  items: BreadcrumbCrumb[];
  className?: string;
};

/**
 * 簡潔麵包屑（與分類頁、Guide 既有結構一致，僅抽出共用）
 */
export function BreadcrumbNav({ items, className = '' }: Props) {
  if (items.length === 0) return null;

  return (
    <nav className={`mb-4 text-sm text-slate-600 ${className}`} aria-label="麵包屑">
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`}>
          {i > 0 ? ' / ' : null}
          {c.to ? (
            <Link to={c.to} className="hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="text-slate-700">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
