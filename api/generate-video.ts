import type { VercelRequest, VercelResponse } from '@vercel/node';



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const { productUrl, product } = req.body;



    // 支援兩種呼叫方式：productUrl 或 product 物件

    if (!productUrl && !product) {

      return res.status(400).json({ error: 'Missing productUrl or product' });

    }



    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST; // shopee-e-commerce-data.p.rapidapi.com



    if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {

      return res.status(500).json({ error: 'RapidAPI env missing' });

    }



    // 解析 ShopID / ItemID（支援多種格式）

    let shopid: string | null = null;

    let itemid: string | null = null;

    let productInfo: any = null;



    // 如果直接提供 product 物件，使用它

    if (product && product.shopid && product.itemid) {

      shopid = product.shopid;

      itemid = product.itemid;

      productInfo = {

        title: product.title || '未知商品',

        price: product.price || 0,

        image: product.image || '',

      };

    } else if (productUrl) {

      // 格式 1: /product/{shopid}/{itemid}

      const productMatch = productUrl.match(/\/product\/(\d+)\/(\d+)/);

      if (productMatch) {

        shopid = productMatch[1];

        itemid = productMatch[2];

      } else {

        // 格式 2: i.{shopid}.{itemid}

        const iMatch = productUrl.match(/i\.(\d+)\.(\d+)/);

        if (iMatch) {

          shopid = iMatch[1];

          itemid = iMatch[2];

        }

      }



      if (!shopid || !itemid) {

        return res.status(400).json({ error: 'Invalid Shopee URL format' });

      }

    } else {

      return res.status(400).json({ error: 'Missing productUrl or product' });

    }



    // 如果沒有 productInfo，從 RapidAPI 取得

    if (!productInfo && shopid && itemid) {

      // 🔥 正確的 API endpoint

      const apiUrl = `https://${RAPIDAPI_HOST}/shopee/item/get?itemid=${itemid}&shopid=${shopid}&site=tw`;



      const response = await fetch(apiUrl, {

        method: 'GET',

        headers: {

          'x-rapidapi-key': RAPIDAPI_KEY!,

          'x-rapidapi-host': RAPIDAPI_HOST!,

        },

      });



      if (!response.ok) {

        const data = await response.json();

        return res.status(500).json({

          error: 'Failed to fetch product data from RapidAPI',

          detail: data,

        });

      }



      const data = await response.json();

      const item = data?.data || {};



      productInfo = {

        title: item.name || '未知商品',

        price: item.price_min / 100000 || 0,

        image: item.image ? `https://cf.shopee.tw/file/${item.image}` : '',

      };

    }



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
