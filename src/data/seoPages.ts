import raw from './seoPages.json';
import type { SearchSeoPageData } from './searchSeoPages';
import { getSeoZhFallback } from '@/lib/seoPageI18nFallback';
import {
  landingBaseByKey,
  toolLandingPages,
  type SeoFaqItem,
  type ToolLandingPageContent,
  type ToolLandingToolKey,
} from './toolSeoContent';

export type SeoPageJson = {
  slug: string;
  tool: string;
  titleKey: string;
  descKey: string;
  keywords: string;
  faq: SeoFaqItem[];
  useCases: string[];
};

const TOOL_TO_KEY: Record<string, ToolLandingToolKey> = {
  'image-resize': 'image-resize',
  'image-compress': 'image-compress',
  'image-convert': 'image-convert',
  'image-crop': 'image-crop',
  'qr-code': 'qr-code',
  'ai-summary': 'ai-summary',
  pomodoro: 'productivity',
};

const GUIDE_SLUGS: Record<ToolLandingToolKey, readonly string[]> = {
  'image-resize': ['instagram-post-size', 'ig-image-size', 'tiktok-cover-size-guide'],
  'image-compress': ['how-to-compress-images', 'jpg-vs-png-difference', 'compress-image-large-files'],
  'image-convert': ['jpg-vs-png-difference', 'how-to-compress-images', 'compress-image-large-files'],
  'image-crop': ['instagram-post-size', 'ig-image-size', 'youtube-thumbnail-size'],
  'qr-code': ['qr-code-business-usage', 'wifi-qr-code-how-to', 'qr-code-with-logo'],
  'ai-summary': ['ai-summary-best-practices', 'summarize-long-article', 'pdf-summary-how-to'],
  'homework-helper': ['homework-solution-step-by-step', 'ai-summary-best-practices', 'summarize-long-article'],
  productivity: ['meeting-notes-to-action-summary', 'summarize-long-article', 'ai-summary-best-practices'],
};

export const seoPagesData: SeoPageJson[] = raw as SeoPageJson[];

function mapTool(tool: string): ToolLandingToolKey {
  const k = TOOL_TO_KEY[tool];
  if (!k) throw new Error(`Unknown seo tool: ${tool}`);
  return k;
}

function buildLanding(entry: SeoPageJson): ToolLandingPageContent {
  const toolKey = mapTool(entry.tool);
  const base = landingBaseByKey[toolKey];
  const title = getSeoZhFallback(entry.slug, 'title');
  const description = getSeoZhFallback(entry.slug, 'desc');
  const scenario = title.length > 42 ? `${title.slice(0, 39)}…` : title;
  return {
    id: `${toolKey}-${entry.slug}`,
    toolKey,
    toolLabel: base.toolLabel,
    slug: entry.slug,
    path: `/tools/${base.segment}/${entry.slug}`,
    seoI18n: { titleKey: entry.titleKey, descKey: entry.descKey },
    scenarioLabel: scenario,
    h1: title,
    seoTitle: `${title}｜RxV`,
    metaDescription: description,
    intro: description,
    situations: entry.useCases,
    faq: entry.faq,
    ctaPath: base.ctaPath,
    ctaLabel: base.ctaLabel,
    relatedTools: base.relatedTools,
    breadcrumbParentPath: base.breadcrumbParentPath,
    breadcrumbParentName: base.breadcrumbParentName,
  };
}

const seoLandings: ToolLandingPageContent[] = seoPagesData.map(buildLanding);

export const seoLandingByPath = new Map<string, ToolLandingPageContent>(
  seoLandings.map((p) => [p.path, p])
);

function peerPathsFor(toolKey: ToolLandingToolKey, excludePath: string, limit = 8): string[] {
  const out: string[] = [];
  for (const p of seoLandings) {
    if (p.toolKey !== toolKey || p.path === excludePath) continue;
    out.push(p.path);
    if (out.length >= limit) break;
  }
  return out;
}

function buildSearchData(entry: SeoPageJson): SearchSeoPageData {
  const toolKey = mapTool(entry.tool);
  const base = landingBaseByKey[toolKey];
  const landingPath = `/tools/${base.segment}/${entry.slug}`;
  const peers = peerPathsFor(toolKey, landingPath, 8);
  const title = getSeoZhFallback(entry.slug, 'title');
  const description = getSeoZhFallback(entry.slug, 'desc');
  const keyword =
    entry.keywords.split(',')[0]?.trim() || title.replace(/\s+/g, ' ');

  return {
    slug: entry.slug,
    seoI18n: { titleKey: entry.titleKey, descKey: entry.descKey },
    keyword,
    seoTitle: `${title}｜搜尋｜RxV`,
    metaDescription: description,
    h1: title,
    intro: description,
    relatedToolKey: toolKey,
    relatedLandingPaths: peers,
    relatedGuideSlugs: [...(GUIDE_SLUGS[toolKey] ?? [])],
    popularPagePaths: peers,
    faqs: entry.faq,
    ctaPath: base.ctaPath,
    ctaLabel: base.ctaLabel,
  };
}

const seoSearchBySlug = new Map<string, SearchSeoPageData>();
for (const e of seoPagesData) {
  seoSearchBySlug.set(e.slug, buildSearchData(e));
}

export function getSeoToolLandingPage(path: string): ToolLandingPageContent | undefined {
  return seoLandingByPath.get(path);
}

export function getSeoSearchPageBySlug(slug: string): SearchSeoPageData | undefined {
  return seoSearchBySlug.get(slug);
}

export type LandingPreview = {
  path: string;
  h1: string;
  label: string;
  metaDescription: string;
  titleKey?: string;
  descKey?: string;
};

export function getLandingPreviewByPath(path: string): LandingPreview | undefined {
  const legacy = toolLandingPages.find((p) => p.path === path);
  if (legacy) {
    return {
      path: legacy.path,
      h1: legacy.h1,
      label: legacy.scenarioLabel,
      metaDescription: legacy.metaDescription,
    };
  }
  const seo = seoLandingByPath.get(path);
  if (seo) {
    return {
      path: seo.path,
      h1: seo.h1,
      label: seo.scenarioLabel,
      metaDescription: seo.metaDescription,
      ...(seo.seoI18n ?? {}),
    };
  }
  return undefined;
}

/** 同工具之 SEO 主題頁（不含自己），供落地頁內鏈 */
export function getSeoPeerLandingLinks(
  excludePath: string,
  toolKey: ToolLandingToolKey,
  limit = 8
): { path: string; titleKey: string; descKey: string }[] {
  const out: { path: string; titleKey: string; descKey: string }[] = [];
  for (const p of seoLandings) {
    if (p.toolKey !== toolKey || p.path === excludePath) continue;
    const keys = p.seoI18n;
    if (!keys) continue;
    out.push({ path: p.path, titleKey: keys.titleKey, descKey: keys.descKey });
    if (out.length >= limit) break;
  }
  return out;
}

export const seoPagesToolRoutePaths: string[] = seoLandings.map((p) => p.path);
export const seoPagesSearchIndexablePaths: string[] = seoPagesData.map((e) => `/search/${e.slug}`);
export const seoPagesSearchSlugSet = new Set(seoPagesData.map((e) => e.slug));
