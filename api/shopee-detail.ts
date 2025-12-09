// /api/shopee-detail.ts
// 
// Shopee Mobile API 解析服務
// 使用 Shopee 官方 Mobile API，模擬 App 請求，避免 CORS 和被封鎖的問題

import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * 從 Shopee 商品網址中提取 shopId 和 itemId
 * 支援多種 URL 格式：
 * - https://shopee.tw/product/2478934/2450944952
 * - https://shopee.tw/...i.2478934.2450944952
 * - https://shopee.tw/.../2450944952?xxxx
 */
function extractShopIdAndItemId(url: string): { shopId: string | null; itemId: string | null } {
  try {
    // 1. 格式：/product/{shopId}/{itemId}
    const productMatch = url.match(/\/product\/(\d+)\/(\d+)(?:\?|$|\/)/);
    if (productMatch && productMatch[1] && productMatch[2]) {
      return {
        shopId: productMatch[1],
        itemId: productMatch[2],
      };
    }

    // 2. 格式：...i.{shopId}.{itemId} 或 .../i.{shopId}.{itemId}
    const iMatch = url.match(/[\/\.]i\.(\d+)\.(\d+)(?:\?|$|\/)/);
    if (iMatch && iMatch[1] && iMatch[2]) {
      return {
        shopId: iMatch[1],
        itemId: iMatch[2],
      };
    }

    // 3. 格式：查詢參數 ?shopid=xxx&itemid=xxx
    try {
      const urlObj = new URL(url);
      const queryShopId = urlObj.searchParams.get("shopid");
      const queryItemId = urlObj.searchParams.get("itemid");
      if (queryShopId && queryItemId) {
        return {
          shopId: queryShopId,
          itemId: queryItemId,
        };
      }
    } catch {
      // URL 解析失敗，繼續嘗試其他方式
    }

    // 4. 格式：路徑中連續的兩個數字，最後的數字作為 itemId，倒數第二個作為 shopId
    // 例如：https://shopee.tw/something/2478934/2450944952
    const pathParts = url.match(/(\d+)\/(\d+)(?:\?|$|\/)/);
    if (pathParts && pathParts[1] && pathParts[2]) {
      return {
        shopId: pathParts[1],
        itemId: pathParts[2],
      };
    }
  } catch (err) {
    console.error("URL 解析錯誤:", err);
  }

  return { shopId: null, itemId: null };
}

/**
 * 展開短網址（如果需要）
 */
async function expandShortUrl(url: string): Promise<string> {
  if (!url.includes("s.shopee.tw")) {
    return url;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return response.url || url;
  } catch (err) {
    console.error("短網址展開失敗:", err);
    return url;
  }
}

/**
 * 呼叫 Shopee Mobile API 獲取商品詳細資訊
 */
async function fetchShopeeProductDetail(
  shopId: string,
  itemId: string
): Promise<any> {
  const apiUrl = `https://shopee.tw/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Shopee App/3.4.0 (Android; 12)",
        "X-Shopee-Language": "zh-Hant",
        "Referer": "https://shopee.tw/",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error("Shopee Mobile API 呼叫失敗:", err);
    throw err;
  }
}

/**
 * 從 API 回應中提取所需資料
 */
function extractProductData(apiResponse: any): {
  title: string;
  price_min: number;
  price_max: number;
  images: string[];
  sold: number;
  rating: number;
  video: string;
} {
  const item = apiResponse?.data?.item || apiResponse?.item || apiResponse || {};

  // 商品名稱
  const title = item.name || item.item_name || item.title || "";

  // 價格（支援價格區間）
  // Shopee Mobile API v4 價格單位是分（cents），需要除以 100000 轉換為元（TWD）
  let price_min = 0;
  let price_max = 0;

  // 價格轉換函數：Shopee API 返回的價格通常需要除以 100000
  const convertPrice = (priceValue: any): number => {
    if (!priceValue) return 0;
    const price = typeof priceValue === "number" ? priceValue : parseInt(String(priceValue), 10) || 0;
    if (price <= 0) return 0;
    // Shopee Mobile API v4 價格單位：除以 100000 得到元
    return Math.floor(price / 100000);
  };

  // 優先使用 price_min / price_max（價格區間）
  if (item.price_min || item.price_max) {
    price_min = convertPrice(item.price_min);
    price_max = convertPrice(item.price_max) || price_min;
  } 
  // 其次使用 price（單一價格）
  else if (item.price) {
    price_min = convertPrice(item.price);
    price_max = price_min;
  }
  // 最後嘗試 price_before_discount（折扣前價格）
  else if (item.price_before_discount) {
    price_min = convertPrice(item.price_before_discount);
    price_max = price_min;
  }

  // 圖片列表
  const images: string[] = [];
  if (item.images && Array.isArray(item.images)) {
    item.images.forEach((img: string) => {
      if (typeof img === "string" && img) {
        if (img.startsWith("http")) {
          images.push(img);
        } else {
          images.push(`https://cf.shopee.tw/file/${img}`);
        }
      }
    });
  }
  if (item.image && !images.includes(item.image)) {
    if (item.image.startsWith("http")) {
      images.push(item.image);
    } else {
      images.push(`https://cf.shopee.tw/file/${item.image}`);
    }
  }

  // 銷量
  const sold = parseInt(item.historical_sold || item.sold || "0", 10);

  // 評分
  const rating = parseFloat(item.item_rating?.rating_star || item.rating_star || "0") || 0;

  // 影片
  const video = item.video_info_list?.[0]?.video_url || item.video_url || "";

  return {
    title,
    price_min,
    price_max,
    images,
    sold,
    rating,
    video,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 取得 URL 參數
    const productUrl = (req.query.url as string) || "";

    if (!productUrl) {
      return res.status(200).json({
        ok: false,
        error: "缺少商品網址參數 url",
      });
    }

    // 展開短網址（如果需要）
    let finalUrl = await expandShortUrl(productUrl.trim());

    // 從 URL 中提取 shopId 和 itemId
    const { shopId, itemId } = extractShopIdAndItemId(finalUrl);

    if (!shopId || !itemId) {
      return res.status(200).json({
        ok: false,
        error: "無法從網址中解析出 shopId 和 itemId，請確認商品網址格式正確",
      });
    }

    console.log(`解析 Shopee 商品: shopId=${shopId}, itemId=${itemId}`);

    // 呼叫 Shopee Mobile API
    const apiResponse = await fetchShopeeProductDetail(shopId, itemId);

    // 檢查 API 回應是否有效
    if (!apiResponse || (apiResponse.error && apiResponse.error !== 0)) {
      return res.status(200).json({
        ok: false,
        error: "商品解析失敗：API 回應無效",
      });
    }

    // 提取商品資料
    const productData = extractProductData(apiResponse);

    // 檢查是否成功取得商品名稱
    if (!productData.title) {
      return res.status(200).json({
        ok: false,
        error: "商品解析失敗：無法取得商品資訊",
      });
    }

    // 回傳成功結果
    return res.status(200).json({
      ok: true,
      ...productData,
    });
  } catch (err: any) {
    console.error("Shopee Detail API 錯誤:", err);
    return res.status(200).json({
      ok: false,
      error: `商品解析失敗: ${err.message || "未知錯誤"}`,
    });
  }
}
