// 檔案路徑: /api/shopee-search.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from "axios";

// RapidAPI Shopee API 端點
const API_URL = "https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2";

export default async (req: VercelRequest, res: VercelResponse) => {
  // 僅允許 GET 方法
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 抓取查詢參數
  const keyword = (req.query.keyword as string)?.trim() || "";
  if (!keyword) {
    console.warn("[Shopee API] ❌ 缺少 keyword");
    return res.status(400).json({ error: "keyword is required", items: [], total: 0 });
  }

  // 從環境變數讀取 RapidAPI Key
  const API_KEY = process.env.RAPIDAPI_KEY;
  if (!API_KEY) {
    console.error("❌ RAPIDAPI_KEY 尚未設定（請檢查 .env.local）");
    return res.status(500).json({ error: "API key not configured", items: [], total: 0 });
  }

  try {
    console.log(`[Shopee API] ✅ 搜尋中: ${keyword}`);

    const response = await axios.get(API_URL, {
      params: {
        site: "tw",             // 台灣站
        keyword: keyword,       // 搜尋關鍵字
        page: 1,
        pageSize: 100,
        by: "relevancy",        // 依相關性排序
        order: "desc",
      },
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "shopee-e-commerce-data.p.rapidapi.com",
      },
    });

    const items = response?.data?.data?.items ?? [];
    console.log(`[Shopee API] ✅ 回傳商品數量: ${items.length}`);

    return res.status(200).json({
      items,
      total: items.length,
    });

  } catch (err: any) {
    console.error("[Shopee API] ❌ 錯誤:", err?.response?.data || err.message || err);
    return res.status(200).json({ error: "fetch error", items: [], total: 0 });
  }
};