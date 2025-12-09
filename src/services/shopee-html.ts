export async function parseShopeeHTML(url: string) {
  try {
    // 加上 Shopee 需要的 headers（避免被視為 bot）
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept-Language": "zh-TW,zh;q=0.9",
        "User-Agent": navigator.userAgent, // 使用真瀏覽器 UA
      },
    });

    const html = await response.text();

    // 利用 DOMParser 解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 解析商品名稱
    const title =
      doc.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      doc.querySelector("title")?.innerText ||
      "";

    // 解析商品圖片
    const image =
      doc.querySelector("meta[property='og:image']")?.getAttribute("content") || "";

    // 解析價格（Shopee 新版有放在 JSON 片段）
    let price = "";
    const priceJson = html.match(/"price":"([\d.]+)"/);
    if (priceJson) {
      price = priceJson[1];
    }

    return {
      title: title.replace(" | Shopee", "").trim(),
      price,
      image,
    };
  } catch (err) {
    console.error("解析 Shopee HTML 失敗：", err);
    return { title: "", price: "", image: "" };
  }
}



