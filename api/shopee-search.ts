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

  const API_HOST = process.env.RAPIDAPI_HOST;



  console.log("[debug] keyword:", keyword);

  console.log("[debug] API_KEY:", API_KEY ? "✅ 有讀到" : "❌ 沒有讀到");

  console.log("[debug] API_HOST:", API_HOST);



  if (!API_KEY || !API_HOST) {

    return res.status(500).json({

      error: "Missing API key or host",

      items: [],

      total: 0

    });

  }



  try {

    const response = await axios.get(API_URL, {

      params: {

        site: "tw",

        keyword: keyword,

        page: 1,

        pageSize: 50,

        by: "relevancy",

        order: "desc",

      },

      headers: {

        "X-RapidAPI-Key": API_KEY,

        "X-RapidAPI-Host": API_HOST,

      },

    });



    const items = response?.data?.data?.items ?? [];

    console.log(`[Shopee API] ✅ 抓到 ${items.length} 筆資料`);



    return res.status(200).json({

      items,

      total: items.length,

    });



  } catch (err: any) {

    console.error("[Shopee API] ❌ 錯誤：", err?.response?.data || err.message || err);

    return res.status(200).json({ error: "fetch error", items: [], total: 0 });

  }

};