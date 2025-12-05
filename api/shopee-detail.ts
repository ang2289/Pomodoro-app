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



    // RapidAPI call - 使用 /shopee/item/get endpoint

    const apiUrl = `https://shopee-e-commerce-data.p.rapidapi.com/shopee/item/get?site=${site}&itemid=${itemid}&shopid=${shopid}`;



    const response = await fetch(apiUrl, {

      method: 'GET',

      headers: {

        "x-rapidapi-host": "shopee-e-commerce-data.p.rapidapi.com",

        "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? ""

      }

    });



    if (!response.ok) {

      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

      console.error('RapidAPI Error:', errorData);

      return res.status(500).json({

        error: "RapidAPI 商品讀取失敗",

        detail: errorData

      });

    }



    const data = await response.json();



    // 處理 RapidAPI 回傳格式

    const itemBasic = data?.data?.item_basic || data?.data || data;



    if (!itemBasic || (!itemBasic.name && !itemBasic.title)) {

      return res.status(500).json({

        error: "RapidAPI 回傳資料格式錯誤",

        detail: data

      });

    }



    return res.status(200).json({

      ok: true,

      item: {

        name: itemBasic.name || itemBasic.title || "",

        price: itemBasic.price_min ? itemBasic.price_min / 100000 : (itemBasic.price ? itemBasic.price / 100000 : 0),

        images: itemBasic.images || (itemBasic.image ? [itemBasic.image] : []),

        sold: itemBasic.historical_sold || itemBasic.sold || 0,

        rating: itemBasic.item_rating?.rating_star || itemBasic.rating_star || itemBasic.rating || 0

      }

    });

  } catch (err: any) {

    console.error('Shopee Detail API Error:', err);

    return res.status(500).json({ 

      error: "後端獲取商品資訊失敗",

      detail: err.message || String(err)

    });

  }

}
