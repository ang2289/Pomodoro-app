// /api/generate-video.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';



const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  const { productUrl } = req.body;



  if (!productUrl) {

    return res.status(400).json({ error: 'Missing productUrl' });

  }



  // 👉 解析網址中的 shopid 和 itemid

  const match = productUrl.match(/product\/(\d+)\/(\d+)/);

  if (!match) {

    return res.status(400).json({ error: 'Invalid Shopee product URL' });

  }

  const shopid = match[1];

  const itemid = match[2];



  try {

    // 🎯 呼叫 RapidAPI 查詢商品資料

    const response = await fetch(`https://${RAPIDAPI_HOST}/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`, {

      method: 'GET',

      headers: {

        'X-RapidAPI-Key': RAPIDAPI_KEY || '',

        'X-RapidAPI-Host': RAPIDAPI_HOST || '',

      },

    });



    if (!response.ok) {

      const errorText = await response.text();

      console.error('RapidAPI 錯誤：', response.status, errorText);

      return res.status(500).json({ 

        error: 'Failed to fetch product data from RapidAPI',

        detail: errorText 

      });

    }



    const data = await response.json();

    const item = data.data.item;



    // 🧩 組合圖片與價格格式

    const imageUrl = `https://cf.shopee.tw/file/${item.image}`;

    const price = (item.price / 100000).toFixed(0); // 價格單位為 100,000

    const title = item.name;



    // ✅ 回傳資料

    return res.status(200).json({

      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // 假影片

      script: `今天要介紹的商品是：「${title}」，目前售價大約 $${price} 元，看看是否適合你！`,

      subtitle: `商品價格約 $${price} 元，點擊下方了解更多！`,

      product: {

        title,

        imageUrl,

        price,

      },

    });

  } catch (err) {

    console.error('API 錯誤：', err);

    return res.status(500).json({ error: 'Internal Server Error' });

  }

}
