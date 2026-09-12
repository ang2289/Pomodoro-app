/** 文章內 CTA 與工具頁對應（短網址別名由路由提供） */
export const ARTICLE_CTA_LINKS = {
  qr: "/tools/qr",
  summary: "/tools/summary",
  homework: "/tools/homework-helper",
  tools: "/tools",
} as const;

export type ArticleCtaToolKey = keyof typeof ARTICLE_CTA_LINKS;
