import { ProductItem } from "./csv-loader";

export interface FilterOptions {
  minPrice?: number;        // 最低價格
  maxPrice?: number;        // 最高價格
  minCommission?: number;   // 最低佣金（% 或 元）
  category?: string;        // 商品分類
  keyword?: string;         // 商品名稱包含的關鍵字
  limit?: number;           // 保留前 N 筆（預設不限制）
}

/**
 * 商品篩選器
 * 用於自動化批次影片的前置整合
 */
export function filterProducts(
  items: ProductItem[],
  options: FilterOptions
): ProductItem[] {
  let result = items;

  // 1️⃣ 過濾最低價格
  if (options.minPrice !== undefined) {
    result = result.filter((i) => i.price >= (options.minPrice || 0));
  }

  // 2️⃣ 過濾最高價格
  if (options.maxPrice !== undefined) {
    result = result.filter((i) => i.price <= (options.maxPrice || Infinity));
  }

  // 3️⃣ 過濾最低佣金（你的自動化最重要的部分）
  if (options.minCommission !== undefined) {
    result = result.filter(
      (i) => i.commission >= (options.minCommission || 0)
    );
  }

  // 4️⃣ 過濾分類
  if (options.category) {
    result = result.filter((i) =>
      i.category.toLowerCase().includes(options.category!.toLowerCase())
    );
  }

  // 5️⃣ 過濾關鍵字
  if (options.keyword) {
    result = result.filter((i) =>
      i.title.toLowerCase().includes(options.keyword!.toLowerCase())
    );
  }

  // 6️⃣ 限制數量（例如只保留前 100 個）
  if (options.limit !== undefined) {
    result = result.slice(0, options.limit);
  }

  return result;
}




