import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const SHOPEE_API_URL =
  'https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2';
const SHOPEE_API_HOST = 'shopee-e-commerce-data.p.rapidapi.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keywordParam = req.query.keyword;
  const keyword = Array.isArray(keywordParam) ? keywordParam[0] : keywordParam;

  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: '缺少 keyword' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.error(
      '[shopee-search] RAPIDAPI_KEY is not set in environment variables',
    );
    return res
      .status(500)
      .json({ error: 'Server configuration error: RAPIDAPI_KEY not set' });
  }

  try {
    const response = await axios.get(SHOPEE_API_URL, {
      params: {
        site: 'tw',
        by: 'relevancy',
        order: 'desc',
        page: 1,
        pageSize: 50,
        keyword: keyword.trim(),
      },
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': SHOPEE_API_HOST,
      },
    });

    const raw = response.data;
    const items = raw?.data?.items ?? raw?.items ?? [];

    return res.status(200).json({ items, raw });
  } catch (err: any) {
    console.error(
      '[shopee-search] API error:',
      err?.response?.data || err.message || err,
    );
    return res
      .status(500)
      .json({ error: 'API 錯誤', detail: err?.message ?? String(err) });
  }
}

