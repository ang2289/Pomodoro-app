import type { VercelRequest, VercelResponse } from "@vercel/node";

// 從 Shopee URL 抽取 shopid + itemid
function extractIds(url: string) {
  const match = url.match(/product\/(\d+)\/(\d+)/);
  if (!match) return null;
  return { shopid: match[1], itemid: match[2] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ ok: false, msg: "缺少 url 參數" });
    }

    const ids = extractIds(url);
    if (!ids) {
      return res.status(400).json({ ok: false, msg: "商品網址格式錯誤" });
    }

    const apiUrl = `https://shopee.tw/api/v4/item/get?itemid=${ids.itemid}&shopid=${ids.shopid}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const json = await response.json();
    const item = json.data;

    if (!item) {
      return res.status(500).json({ ok: false, msg: "Shopee Mobile API 無資料" });
    }

    const title = item.name || "";
    const price = (item.price / 100000).toString();
    const images =
      item.images?.map((img: string) => `https://cf.shopee.tw/file/${img}`) || [];

    return res.status(200).json({
      ok: true,
      title,
      price,
      images,
      sold: item.historical_sold,
      rating: item.item_rating?.rating_star || 0,
      raw: item
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      msg: "解析錯誤",
      error: String(err)
    });
  }
}
