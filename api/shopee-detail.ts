import type { VercelRequest, VercelResponse } from "@vercel/node";



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const url = req.query.url as string;



    if (!url) {

      return res.status(400).json({ error: "缺少 URL" });

    }



    // 解析 Shopee URL

    const cleanUrl = url.split("?")[0]; 

    const parts = cleanUrl.split("/product/")[1];



    if (!parts) {

      return res.status(400).json({

        error: "無法解析 Shopee URL，請確認格式是否為 /product/{shopid}/{itemid}"

      });

    }



    const [shopid, itemid] = parts.split("/");



    if (!shopid || !itemid) {

      return res.status(400).json({

        error: "無法解析 Shopee URL，請確認格式是否為 /product/{shopid}/{itemid}"

      });

    }



    // 自動偵測 site 從網址

    let site = "tw";

    if (cleanUrl.includes("shopee.my")) site = "my";

    else if (cleanUrl.includes("shopee.ph")) site = "ph";

    else if (cleanUrl.includes("shopee.sg")) site = "sg";

    else if (cleanUrl.includes("shopee.com.tw")) site = "tw";

    else if (cleanUrl.includes("shopee.tw")) site = "tw";



    // RapidAPI call

    const apiUrl = `https://shopee-e-commerce-data.p.rapidapi.com/item_detail?site=${site}&itemid=${itemid}&shopid=${shopid}`;



    const response = await fetch(apiUrl, {

      headers: {

        "x-rapidapi-host": "shopee-e-commerce-data.p.rapidapi.com",

        "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? ""

      }

    });



    const data = await response.json();



    if (!response.ok || data.error) {

      return res.status(500).json({

        error: "RapidAPI 商品讀取失敗",

        detail: data

      });

    }



    return res.status(200).json({

      ok: true,

      item: {

        name: data.title || data.name || "",

        price: data.price || data.price_min ? data.price_min / 100000 : 0,

        images: data.images || (data.image ? [data.image] : []),

        sold: data.historical_sold || data.sold || 0,

        rating: data.item_rating?.rating_star || data.rating || 0

      }

    });

  } catch (err: any) {

    return res.status(500).json({ error: err.message });

  }

}
