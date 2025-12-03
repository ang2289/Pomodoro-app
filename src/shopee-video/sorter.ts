import { ProductItem } from "./csv-loader";

export type SortType =
  | "commission_desc"   // 佣金由高到低（最常用）
  | "commission_asc"    // 佣金由低到高
  | "price_desc"        // 價格高到低
  | "price_asc"         // 價格低到高
  | "title_asc";        // 商品名稱排序

export function sortProducts(
  items: ProductItem[],
  sortType: SortType
): ProductItem[] {
  const result = [...items];

  switch (sortType) {
    case "commission_desc":
      return result.sort((a, b) => b.commission - a.commission);

    case "commission_asc":
      return result.sort((a, b) => a.commission - b.commission);

    case "price_desc":
      return result.sort((a, b) => b.price - a.price);

    case "price_asc":
      return result.sort((a, b) => a.price - b.price);

    case "title_asc":
      return result.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return result;
  }
}

