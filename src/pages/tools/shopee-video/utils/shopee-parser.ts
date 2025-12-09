export interface ShopeeParsedResult {
  title: string;
  price: string;
  images: string[];
  rawHtml?: string;
}

/**
 * 使用 AllOrigins 代理 + DOMParser
 * 直接在前端解析 Shopee 商品資訊
 */
export async function parseShopeeProduct(url: string): Promise<ShopeeParsedResult> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    // 取得商品頁 HTML
    const res = await fetch(proxyUrl);
    const html = await res.text();

    // 建立 DOM 解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // ------------------------------
    // 1️⃣ 商品標題 og:title
    // ------------------------------
    const title =
      doc.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      doc.title ||
      "";

    // ------------------------------
    // 2️⃣ 主圖片 og:image
    // ------------------------------
    const ogImg = doc
      .querySelector("meta[property='og:image']")
      ?.getAttribute("content");

    const images = new Set<string>();
    if (ogImg) images.add(ogImg);

    // ------------------------------
    // 3️⃣ 從 JSON 內抓取 images[]（Shopee 放在 script 裡）
    // ------------------------------
    const scriptTags = doc.querySelectorAll("script");
    scriptTags.forEach((script) => {
      const text = script.textContent || "";
      if (text.includes('"images":[')) {
        const match = text.match(/"images":\[(.*?)\]/);
        if (match) {
          match[1]
            .replace(/"/g, "")
            .split(",")
            .forEach((id) => {
              images.add(`https://cf.shopee.tw/file/${id}`);
            });
        }
      }
    });

    // ------------------------------
    // 4️⃣ 從 JSON 解析價格 price
    // ------------------------------
    let price = "";
    scriptTags.forEach((script) => {
      const text = script.textContent || "";
      const match = text.match(/"price":\s*(\d+)/);
      if (match) {
        price = match[1];
      }
    });

    return {
      title: title || "未找到商品名稱",
      price,
      images: Array.from(images),
      rawHtml: html
    };
  } catch (err) {
    console.error("Shopee Parser Error:", err);
    return { title: "", price: "", images: [] };
  }
}



