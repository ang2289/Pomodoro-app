/**
 * 解析蝦皮商品網址，取得商品 ID
 * 支援格式：
 *  - https://shopee.tw/xxxxxx-i.12345678.9876543210
 *  - https://shopee.tw/product/12345678/9876543210
 *  - https://shope.ee/xxxxx（短網址，之後可擴充）
 */

export function parseProductId(url: string): string | null {
  if (!url) return null;

  try {
    const cleanUrl = url.trim();

    // ---------------------------------------------
    // 1️⃣ 官方格式：https://shopee.tw/xxx-i.shopId.itemId
    // ---------------------------------------------
    const regex1 = /i\.(\d+)\.(\d+)/;
    const match1 = cleanUrl.match(regex1);

    if (match1 && match1.length >= 3) {
      const shopId = match1[1];
      const itemId = match1[2];
      return `${shopId}-${itemId}`;
    }

    // ---------------------------------------------
    // 2️⃣ 另一種格式：https://shopee.tw/product/shopId/itemId
    // ---------------------------------------------
    const regex2 = /product\/(\d+)\/(\d+)/;
    const match2 = cleanUrl.match(regex2);

    if (match2 && match2.length >= 3) {
      const shopId = match2[1];
      const itemId = match2[2];
      return `${shopId}-${itemId}`;
    }

    // ---------------------------------------------
    // 3️⃣ shope.ee 短網址（待補充）
    // ---------------------------------------------
    if (cleanUrl.includes("shope.ee")) {
      return "SHORT_URL"; // 可在未來加入自動展開
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * 將 highlights 字串陣列清洗：
 * - 去除空白
 * - 過濾空字串
 */
export function cleanHighlights(highlights: string[]): string[] {
  return highlights.map((h) => h.trim()).filter((h) => h.length > 0);
}

/**
 * 驗證圖片 URL（暫時只做基礎檢查）
 */
export function isValidImage(url: string): boolean {
  if (!url) return false;
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url);
}
