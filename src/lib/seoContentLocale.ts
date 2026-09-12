import type { ComparisonSeoPageContent } from '@/data/comparisonSeoContent';
import type { SearchSeoPageData } from '@/data/searchSeoPages';
import type { GuideArticle, ToolLandingPageContent, ToolLandingToolKey } from '@/data/toolSeoContent';
import {
  guideArticleEnBySlug,
  toolLandingBaseEn,
  toolLandingPageEnById,
  comparisonPageEnBySlug,
  searchSeoPageEnBySlug,
} from '@/data/seoContentEn';

export function isEnLocale(lng: string | undefined): boolean {
  return Boolean(lng && (lng === 'en' || lng === 'en-US' || lng.startsWith('en')));
}

function mergeDefined<T extends Record<string, unknown>>(base: T, patch: Partial<T> | undefined): T {
  if (!patch) return base;
  return { ...base, ...patch } as T;
}

/** 工具落地頁：英文模式下合併基底文案（CTA、麵包屑、相關工具）與各頁英文內容 */
export function localizedToolLandingPage(
  page: ToolLandingPageContent,
  lng: string | undefined
): ToolLandingPageContent {
  if (!isEnLocale(lng)) return page;
  const base = toolLandingBaseEn[page.toolKey];
  const byId = toolLandingPageEnById[page.id];
  if (!base && !byId) return page;
  const merged = { ...page, ...base, ...byId } as ToolLandingPageContent;
  if (byId?.faq) merged.faq = byId.faq;
  if (byId?.situations) merged.situations = byId.situations;
  if (byId?.steps) merged.steps = byId.steps;
  return merged;
}

export function localizedSearchSeoPage(page: SearchSeoPageData, lng: string | undefined): SearchSeoPageData {
  if (!isEnLocale(lng)) return page;
  const en = searchSeoPageEnBySlug[page.slug];
  if (!en) return page;
  const merged = mergeDefined(page, en);
  if (en.faqs) merged.faqs = [...en.faqs];
  return merged;
}

export function localizedComparisonPage(
  page: ComparisonSeoPageContent,
  lng: string | undefined
): ComparisonSeoPageContent {
  if (!isEnLocale(lng)) return page;
  const en = comparisonPageEnBySlug[page.slug];
  if (!en) return page;
  const merged = mergeDefined(page, en);
  if (en.table) merged.table = [...en.table];
  if (en.faq) merged.faq = [...en.faq];
  if (en.prosA) merged.prosA = [...en.prosA];
  if (en.consA) merged.consA = [...en.consA];
  if (en.prosB) merged.prosB = [...en.prosB];
  if (en.consB) merged.consB = [...en.consB];
  if (en.situations) merged.situations = [...en.situations];
  return merged;
}

export function localizedGuideArticle(article: GuideArticle, lng: string | undefined): GuideArticle {
  if (!isEnLocale(lng)) return article;
  const en = guideArticleEnBySlug[article.slug];
  if (!en) return article;
  const merged = mergeDefined(article, en as Partial<GuideArticle>);
  if (en.cta && article.cta) merged.cta = { ...article.cta, ...en.cta };
  if (en.paragraphs) merged.paragraphs = [...en.paragraphs];
  if (en.steps) merged.steps = [...en.steps];
  if (en.faq) merged.faq = [...en.faq];
  return merged;
}
