import type { VercelRequest, VercelResponse } from '@vercel/node';



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const { productUrl } = req.body;



    if (!productUrl) {

      return res.status(400).json({ error: 'Missing productUrl' });

    }



    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST; // shopee-api.p.rapidapi.com



    if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {

      return res.status(500).json({ error: 'RapidAPI env missing' });

    }



    // 解析 ShopID / ItemID

    const match = productUrl.match(/\/product\/(\d+)\/(\d+)/);

    if (!match) {

      return res.status(400).json({ error: 'Invalid Shopee URL format' });

    }



    const shopid = match[1];

    const itemid = match[2];



    // 🔥 正確的 v2 API endpoint

    const apiUrl = `https://${RAPIDAPI_HOST}/v2/item/get?itemid=${itemid}&shopid=${shopid}`;



    const response = await fetch(apiUrl, {

      method: 'GET',

      headers: {

        'x-rapidapi-key': RAPIDAPI_KEY!,

        'x-rapidapi-host': RAPIDAPI_HOST!,

      },

    });



    const data = await response.json();



    if (!response.ok) {

      return res.status(500).json({

        error: 'Failed to fetch product data from RapidAPI',

        detail: data,

      });

    }



    // 商品資訊

    const item = data?.data || {};



    const productInfo = {

      title: item.name || '未知商品',

      price: item.price_min / 100000 || 0,

      image: item.image ? `https://cf.shopee.tw/file/${item.image}` : '',

    };



    // 先回傳假影片，後面再整合 FFMPEG

    return res.status(200).json({

      success: true,

      product: productInfo,

      videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",

      script: `這是「${productInfo.title}」的影片腳本示範`,

      subtitle: `字幕示範：商品價格為 NT$${productInfo.price}`,

    });



  } catch (err) {

    return res.status(500).json({ error: 'Server error', detail: String(err) });

  }

}
