// 檔案路徑: /api/shopee-search.ts

import { VercelRequest, VercelResponse } from '@vercel/node';

import axios from "axios";



// RapidAPI Shopee API 端點

const API_URL = "https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2";



export default async (req: VercelRequest, res: VercelResponse) => {

  if (req.method !== 'GET') {

    res.setHeader('Allow', ['GET']);

    return res.status(405).end(`Method ${req.method} Not Allowed`);

  }



  const keyword = (req.query.keyword as string)?.trim() || "";

  if (!keyword) {

    console.warn("[Shopee API] ❌ 缺少 keyword");

    return res.status(400).json({ error: "keyword is required", items: [], total: 0 });

  }



  const API_KEY = process.env.RAPIDAPI_KEY;

  const API_HOST = process.env.RAPIDAPI_HOST || "shopee-e-commerce-data.p.rapidapi.com";



  if (!API_KEY) {

    console.error("❌ RAPIDAPI_KEY 尚未設定（請檢查 .env 或 Vercel 設定）");

    return res.status(500).json({ error: "API key not configured", items: [], total: 0 });

  }



  try {

    console.log(`[Shopee API] ✅ 發送請求中: ${keyword}`);



    const response = await axios.get(API_URL, {

      params: {

        site: "tw",

        keyword: keyword,

        page: 1,

        pageSize: 100,

        by: "relevancy",

        order: "desc",

      },

      headers: {

        'X-RapidAPI-Key': API_KEY,

        'X-RapidAPI-Host': API_HOST,

      },

    });



    console.log("[Shopee API] ✅ 原始回傳資料：", response?.data);



    const items =

      response?.data?.data?.items ??

      response?.data?.items ??

      [];



    console.log(`[Shopee API] ✅ 成功抓取 ${items.length} 筆資料`);



    return res.status(200).json({

      items,

      total: items.length,

    });



  } catch (err: any) {

    console.error("[Shopee API] ❌ 發生錯誤：", err?.response?.data || err.message || err);

    return res.status(200).json({ error: "fetch error", items: [], total: 0 });

  }

};
