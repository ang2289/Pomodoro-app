import zhTW from '../locales/zh-TW.json';

type Slugs = Record<string, { title?: string; desc?: string }>;

function getSlugs(): Slugs | undefined {
  return (zhTW as { seoPages?: { slugs?: Slugs } }).seoPages?.slugs;
}

/** 供 SSR／靜態資料使用：依 slug 從 zh-TW 讀標題或描述；缺漏時回傳 slug。 */
export function getSeoZhFallback(slug: string, field: 'title' | 'desc'): string {
  const v = getSlugs()?.[slug]?.[field];
  return typeof v === 'string' && v.trim().length > 0 ? v : slug;
}

/**
 * 解析 `seoPages.slugs.{slug}.title|desc`，回傳 zh-TW 字串作為 i18n `defaultValue`；
 * 無法解析時回傳原 key，避免顯示空白。
 */
export function getSeoFallbackFromKey(key: string): string {
  const m = /^seoPages\.slugs\.([^.]+)\.(title|desc)$/.exec(key);
  if (!m) return key;
  const field = m[2] === 'title' ? 'title' : 'desc';
  return getSeoZhFallback(m[1], field);
}
