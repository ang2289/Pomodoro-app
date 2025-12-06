// src/pages/tools/shopee-video/product-api.ts

import { parseProductId, expandShortUrl } from "./utils";

export interface ParsedProductResult {
  finalUrl: string;
  productId: string | null;
}

/**
 * 只負責：
 * 1. 展開短網址
 * 2. 嘗試從網址解析商品 ID
 * 目前不打任何外部商品 API（避免被封鎖）
 */
export async function parseShopeeProductUrl(
  url: string
): Promise<ParsedProductResult> {
  let finalUrl = url;

  // 嘗試展開短網址
  if (url.includes("s.shopee.tw")) {
    try {
      finalUrl = await expandShortUrl(url);
    } catch (err) {
      console.warn("[shopee-video] 短網址展開失敗，改用原網址繼續", err);
      finalUrl = url;
    }
  }

  const productId = parseProductId(finalUrl);
  return { finalUrl, productId };
}
