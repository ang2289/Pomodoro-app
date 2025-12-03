export const config = {
  runtime: "nodejs18.x",
};

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "缺少 keyword" });
  }

  try {
    const url =
      "https://shopee.tw/api/v4/search/search_items?keyword=" +
      encodeURIComponent(String(keyword)) +
      "&limit=100&offset=0";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "x-api-source": "pc",
      },
    });

    const json = await response.json();

    const items = json?.items || [];

    const cleanData = items.map((item: any) => {
      const data = item.item_basic;
      return {
        id: data.itemid,
        name: data.name,
        price: data.price / 100000,
        image: "https://cf.shopee.tw/file/" + data.image,
        url: `https://shopee.tw/product/${data.shopid}/${data.itemid}`,
        sold: data.sold,
        rating: data.item_rating?.rating_star || 0,
      };
    });

    res.status(200).json(cleanData);
  } catch (err) {
    res.status(500).json({ error: "抓取蝦皮資料時發生錯誤", detail: String(err) });
  }
}

