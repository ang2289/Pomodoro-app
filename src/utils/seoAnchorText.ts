/**
 * 語意化內部連結錨點（禁止「點這裡」「更多」「連結」「看這裡」）。
 * 若標題已含「工具／教學／指南／頁面」等，避免重複贅字。
 */

export function anchorForTool(title: string): string {
  const t = title.trim();
  if (!t) return '';
  if (/產生器$|中心總覽$/.test(t)) return `前往${t}`;
  if (/工具$|助手$/.test(t)) return `開啟${t}`;
  if (/鐘$|待辦|Todo/i.test(t)) return `使用${t}`;
  return `使用${t}`;
}

export function anchorForGuide(title: string): string {
  const t = title.trim();
  if (!t) return '';
  if (/教學$|指南$|方法$|整理$|懶人包$/.test(t)) return `閱讀${t}`;
  if (/怎麼|如何/.test(t)) return `了解${t}`;
  return `閱讀《${t}》`;
}

export function anchorForPopular(title: string): string {
  const t = title.trim();
  if (!t) return '';
  if (/頁$|頁面$/.test(t)) return `查看${t}`;
  return `查看${t}主題頁`;
}
