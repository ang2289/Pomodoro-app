export interface ParsedShopeeProduct {
  title: string;
  price: string;
  images: string[];
}

/** 後端 /api/commerce 的 shopeeParse 回傳格式 */
interface CommerceShopeeParseResponse {
  ok: boolean;
  title?: string;
  price?: string;
  imageUrls?: string[];
  finalUrl?: string;
  reason?: string;
}

/**
 * 伺服器端 Shopee 解析 API 封裝
 *
 * 呼叫後端 /api/commerce (POST)，action: "shopeeParse"
 * 傳入 { action: "shopeeParse", url }，回傳 { title, price, images }
 */
export async function parseShopee(url: string): Promise<ParsedShopeeProduct> {
  if (!url || !url.trim()) {
    throw new Error("請提供有效的商品網址");
  }

  const resp = await fetch("/api/commerce", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "shopeeParse", url }),
  });

  if (resp.status === 405) {
    throw new Error("系統呼叫方式錯誤（已修正），請重新整理後再試");
  }

  let data: CommerceShopeeParseResponse & { error?: string; data?: any };
  try {
    data = await resp.json();
  } catch (e) {
    throw new Error("Shopee 可能限制抓取，請改用手動上傳圖片");
  }

  if (!resp.ok || !data?.ok) {
    const msg =
      data?.reason ||
      data?.error ||
      (resp.status === 405
        ? "系統呼叫方式錯誤（已修正），請重新整理後再試"
        : "Shopee 可能限制抓取，請改用手動上傳圖片");
    throw new Error(msg);
  }

  const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
  const result = (data as any).data;

  return {
    title: data.title ?? result?.title ?? "",
    price: data.price ?? result?.price ?? "",
    images: imageUrls.length > 0 ? imageUrls : (Array.isArray(result?.images) ? result.images : []),
  };
}
