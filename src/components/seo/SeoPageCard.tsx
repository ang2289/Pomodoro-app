import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSeoFallbackFromKey } from '@/lib/seoPageI18nFallback';

export type SeoPageCardProps = {
  path: string;
  titleKey: string;
  descKey: string;
};

/**
 * Programmatic SEO 內鏈卡片：標題與描述由 i18n key 解析，缺 key 時以 zh-TW 備援。
 */
export function SeoPageCard({ path, titleKey, descKey }: SeoPageCardProps) {
  const { t } = useTranslation();
  const title = t(titleKey, { defaultValue: getSeoFallbackFromKey(titleKey) });
  const desc = t(descKey, { defaultValue: getSeoFallbackFromKey(descKey) });
  return (
    <>
      <Link to={path} className="text-blue-700 hover:text-blue-900 hover:underline">
        {title}
      </Link>
      <span className="text-slate-400"> — {desc}</span>
    </>
  );
}
