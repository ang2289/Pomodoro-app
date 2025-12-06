// src/pages/tools/shopee-video/utils.ts

// 批次任務共用型別
export interface BatchTask {
  id: string;
  productUrl: string;
  productId: string | null;
  title: string;
  price: string;
  highlights: string[];
  images: string[];
  script?: string;
  videoUrl?: string;
}

// 從 Shopee 網址解析商品 ID（只做純字串解析，不打 API）
export const parseProductId = (url: string): string | null => {
  if (!url) return null;

  // 正式網址格式：/product/{shopid}/{itemid}
  const productMatch = url.match(/\/product\/(\d+)\/(\d+)/);
  if (productMatch) {
    return `${productMatch[1]}_${productMatch[2]}`;
  }

  // 短網址無法直接解析
  if (url.includes("s.shopee.tw")) {
    return null;
  }

  return null;
};

// 展開短網址（只給你完整網址，不抓商品資料）
export const expandShortUrl = async (url: string): Promise<string> => {
  if (!url.includes("s.shopee.tw")) return url;

  const res = await fetch("/api/expand-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();
  if (!data?.success || !data?.url) {
    throw new Error("短網址解析失敗");
  }
  return data.url as string;
};

// 建立空的批次任務
export const createBatchTask = (url: string, index: number): BatchTask => {
  return {
    id: `task-${Date.now()}-${index}`,
    productUrl: url,
    productId: parseProductId(url),
    title: "",
    price: "",
    highlights: [""],
    images: [],
  };
};

// 驗證商品資訊是否完整（單支或批次通用）
export const isProductInfoValid = (args: {
  title: string;
  highlights: string[];
  images: string[];
}): boolean => {
  const title = args.title.trim();
  const highlights = args.highlights.filter((h) => h.trim());
  const images = args.images;

  if (!title) return false;
  if (highlights.length === 0) return false;
  if (images.length === 0) return false;

  return true;
};
