import type { VercelRequest, VercelResponse } from '@vercel/node';

import axios from 'axios';



// 🔥 Step 1：處理短網址與自動跳轉

async function resolveShopeeUrl(url: string): Promise<string> {

  try {

    const resp = await axios.get(url, {

      maxRedirects: 5,

      validateStatus: () => true,

    });



    const finalUrl =

      resp.request?.res?.responseUrl ||

      resp.headers?.location ||

      url;



    console.log("🔗 最終展開網址:", finalUrl);

    return finalUrl;

  } catch (err) {

    console.error("⛔ 無法展開短網址", err);

    return url;

  }

}



// 🔥 Step 2：解析真正商品頁 URL（支援多種格式）

function parseShopeeUrl(url: string) {

  // 格式 1: https://shopee.tw/product/SHOP/ITEM

  let match = url.match(/product\/(\d+)\/(\d+)/);

  if (match) {

    return { shopId: match[1], itemId: match[2] };

  }



  // 格式 2: https://shopee.tw/...shopid=XXX&itemid=XXX...

  const shopId = url.match(/shopid=(\d+)/)?.[1];

  const itemId = url.match(/itemid=(\d+)/)?.[1];

  if (shopId && itemId) return { shopId, itemId };



  return null;

}



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const url = req.query.url as string;

    if (!url) {

      return res.status(400).json({ error: "缺少商品網址" });

    }



    console.log("📌 原始輸入網址:", url);



    // Step 1：展開短網址

    const resolvedUrl = await resolveShopeeUrl(url);



    // Step 2：解析 shopId / itemId

    const parsed = parseShopeeUrl(resolvedUrl);



    if (!parsed) {

      return res.status(400).json({

        error: "無法解析 Shopee 網址",

        detail: resolvedUrl,

      });

    }



    console.log("🛍️ ShopID / ItemID:", parsed);



    // Step 3：呼叫 RapidAPI

    const rapidKey = process.env.RAPIDAPI_KEY;

    if (!rapidKey) {

      return res.status(500).json({ error: "缺少 RAPIDAPI_KEY" });

    }



    const options = {

      method: "GET",

      url: "https://shopee-e-commerce-data.p.rapidapi.com/shopee/item/get",

      params: {

        site: "tw",

        itemid: parsed.itemId,

        shopid: parsed.shopId,

      },

      headers: {

        "X-RapidAPI-Key": rapidKey,

        "X-RapidAPI-Host": "shopee-e-commerce-data.p.rapidapi.com",

      },

    };



    const rapidResponse = await axios.request(options);



    return res.status(200).json({

      success: true,

      product: rapidResponse.data,

      parsedUrl: resolvedUrl,

      shopId: parsed.shopId,

      itemId: parsed.itemId,

    });

  } catch (err: any) {

    console.error("🔥 後端錯誤:", err);

    return res.status(500).json({

      error: "後端錯誤",

      detail: err.message,

    });

  }

}
