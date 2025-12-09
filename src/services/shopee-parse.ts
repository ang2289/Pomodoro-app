import axios from "axios";

export interface ShopeeProduct {
  title: string;
  price: string;
  images: string[];
}

export async function parseShopeeProduct(url: string): Promise<ShopeeProduct> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      responseType: "text",
    });

    const html = response.data as string;

    // ---- 解析商品名稱 ----
    const titleMatch =
      html.match(/<meta property="og:title" content="([^"]+)"/) ||
      html.match(/<title>([^<]+)<\/title>/);

    const title = titleMatch ? decodeURIComponent(titleMatch[1]) : "未找到商品名稱";

    // ---- 解析商品價格 ----
    let price = "";

    const priceMatch =
      html.match(/"price":"(\d+\.?\d*)"/) ||
      html.match(/"price_before_discount":"(\d+\.?\d*)"/) ||
      html.match(/"price_min":"(\d+\.?\d*)"/);

    if (priceMatch) price = priceMatch[1];

    // ---- 解析商品圖片 ----
    const images: string[] = [];
    const imageRegex = /https:\/\/cf\.shopee\.tw\/file\/[a-zA-Z0-9]+/g;

    const foundImages = html.match(imageRegex);
    if (foundImages) {
      foundImages.forEach((img) => {
        if (!images.includes(img)) images.push(img);
      });
    }

    return {
      title,
      price,
      images,
    };
  } catch (error) {
    console.error("❌ Shopee HTML 解析失敗:", error);
    return {
      title: "解析失敗",
      price: "",
      images: [],
    };
  }
}



