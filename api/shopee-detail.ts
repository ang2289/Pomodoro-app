import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const API_URL = 'https://shopee-e-commerce-data.p.rapidapi.com/shopee/product/detail';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // 從 Shopee URL 中提取商品 ID 和 shop ID
  // 格式：https://shopee.tw/product/{shop_id}/{item_id}
  const urlMatch = url.match(/shopee\.(tw|com\.tw)\/product\/(\d+)\/(\d+)/);
  
  if (!urlMatch) {
    return res.status(400).json({ error: 'Invalid Shopee URL format' });
  }

  const shopId = urlMatch[2];
  const itemId = urlMatch[3];

  const API_KEY = process.env.RAPIDAPI_KEY;
  const API_HOST = process.env.RAPIDAPI_HOST || 'shopee-e-commerce-data.p.rapidapi.com';

  if (!API_KEY) {
    console.error('❌ RAPIDAPI_KEY 尚未設定');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    console.log(`[Shopee Detail API] 取得商品詳情: shopId=${shopId}, itemId=${itemId}`);

    const response = await axios.get(API_URL, {
      params: {
        site: 'tw',
        shop_id: shopId,
        item_id: itemId,
      },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });

    const productData = response?.data?.data || response?.data || {};

    // 提取需要的欄位
    const result = {
      title: productData.name || productData.title || '',
      image: productData.image || productData.images?.[0] || '',
      price: productData.price || productData.price_min || 0,
      commission: productData.commission || 0,
      category: productData.categories?.[0]?.display_name || productData.category || '',
      description: productData.description || '',
      rating: productData.rating || 0,
      sold: productData.sold || 0,
    };

    console.log(`[Shopee Detail API] ✅ 成功取得商品: ${result.title}`);

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Shopee Detail API] ❌ 發生錯誤：', err?.response?.data || err.message || err);
    return res.status(500).json({ 
      error: 'Failed to fetch product details',
      message: err?.response?.data || err.message 
    });
  }
}

