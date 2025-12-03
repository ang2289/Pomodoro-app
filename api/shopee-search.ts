import axios from "axios";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { keyword } = req.query;

    // Debug log
    console.log("Shopee API Key:", process.env.RAPIDAPI_KEY);
    console.log("Search keyword:", keyword);
    console.log("HOST 使用中: shopee-e-commerce-data.p.rapidapi.com");

    if (!keyword) {
      return res.status(400).json({ error: "缺少 keyword" });
    }

    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) {
      console.error("RAPIDAPI_KEY is undefined!");
      return res.status(400).json({ error: "未設定 RAPIDAPI_KEY" });
    }

    const options = {
      method: 'GET',
      url: 'https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2',
      params: {
        keyword: keyword,
        page: "1",
        pageSize: "30",
        by: "relevancy",
        order: "desc",
        site: "my"
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'shopee-e-commerce-data.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    return res.status(200).json(response.data);

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "API 錯誤", detail: err.message });
  }
}
