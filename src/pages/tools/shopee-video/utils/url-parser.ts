// src/pages/tools/shopee-video/utils/url-parser.ts

export interface ParsedShopeeUrl {
  title: string;
  image: string;
}

/**
 * 解析 Shopee 商品網址（僅解析 og:title 和 og:image）
 * 不呼叫任何 API，僅從 HTML 中提取資訊
 */
export async function parseShopeeUrl(url: string): Promise<ParsedShopeeUrl> {
  try {
    // 確保 URL 格式正確
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    // 使用 fetch 取得 HTML
    const res = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();

    // 解析 og:title
    let title = "";
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // 解析 og:image
    let image = "";
    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (imageMatch && imageMatch[1]) {
      image = imageMatch[1].trim();
    }

    return {
      title: title || "",
      image: image || "",
    };
  } catch (err) {
    console.error("URL 解析錯誤:", err);
    return {
      title: "",
      image: "",
    };
  }
}

