export const config = {
  runtime: "nodejs",
};

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "缺少 keyword" });
  }

  try {
    const url = `https://shopeeapi.tw/api/search?keyword=${encodeURIComponent(String(keyword))}&limit=100`;

    const response = await fetch(url);

    const json = await response.json();

    const items = json?.data?.items || [];

    const cleanData = items.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        url: item.url,
        sold: item.sold,
        rating: item.rating,
      };
    });

    res.status(200).json(cleanData);
  } catch (err) {
    res.status(500).json({ error: "抓取蝦皮資料時發生錯誤", detail: String(err) });
  }
}

