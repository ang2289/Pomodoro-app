import Papa from "papaparse";

export interface ProductItem {
  product_url: string;
  title: string;
  image: string;
  price: number;
  commission: number;
  category: string;
}

export interface LoadCSVResult {
  items: ProductItem[];
  errors: string[];
}

/**
 * 讀取 Shopee 匯出的 CSV 檔案
 * 支援：商品網址 / 標題 / 圖片 / 價格 / 佣金 / 類別
 */
export async function loadCSV(file: File): Promise<LoadCSVResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const items: ProductItem[] = [];

        for (const row of results.data as any[]) {
          try {
            const item: ProductItem = {
              product_url: row["product_url"] || "",
              title: row["title"] || "",
              image: row["image"] || "",
              price: Number(row["price"] || 0),
              commission: Number(row["commission"] || 0),
              category: row["category"] || "",
            };

            // 基礎欄位檢查
            if (!item.product_url) errors.push("缺少 URL");
            if (!item.title) errors.push(`缺少商品名稱: ${item.product_url}`);

            items.push(item);
          } catch (err: any) {
            errors.push("資料格式錯誤：" + JSON.stringify(row));
          }
        }

        resolve({ items, errors });
      },
      error: (err) => {
        resolve({
          items: [],
          errors: ["CSV 解析失敗：" + err.message],
        });
      },
    });
  });
}

