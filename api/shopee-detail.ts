console.log("🔥 RAPID KEY =", process.env.RAPIDAPI_KEY);

import type { VercelRequest, VercelResponse } from '@vercel/node';

import axios from 'axios';



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  const { url } = req.body;



  if (!url || typeof url !== "string") {

    return res.status(400).json({ error: "URL is required" });

  }



  // 🔍 解析 Shopee 商品網址

  // 格式：https://shopee.tw/product/{shopId}/{itemId}

  const match = url.match(/product\/(\d+)\/(\d+)/);

  if (!match) {

    return res.status(400).json({ error: "Invalid Shopee URL format" });

  }



  const shopId = match[1];

  const itemId = match[2];



  const RAPID_KEY = process.env.RAPIDAPI_KEY;

  const RAPID_HOST = process.env.RAPIDAPI_HOST || "shopee-e-commerce-data.p.rapidapi.com";



  if (!RAPID_KEY) {

    return res.status(500).json({ error: "RAPIDAPI_KEY not configured" });

  }



  try {

    // 🚀 呼叫 RapidAPI v2 商品詳情

    const response = await axios.get(

      "https://shopee-e-commerce-data.p.rapidapi.com/shopee/product/details",

      {

        params: {

          site: "tw",

          productId: itemId,

          shopId: shopId

        },

        headers: {

          "X-RapidAPI-Key": RAPID_KEY,

          "X-RapidAPI-Host": RAPID_HOST

        }

      }

    );



    const p = response?.data?.data;



    if (!p) {

      return res.status(500).json({ error: "No product data returned" });

    }



    // 🎯 整理回傳資料

    const result = {

      title: p.title ?? "",

      price: p.price ?? 0,

      image: p.image ?? p.images?.[0] ?? "",

      rating: p.rating ?? 0,

      sold: p.historicalSold ?? 0,

      description: p.description ?? ""

    };



    return res.status(200).json(result);



  } catch (err: any) {

    console.error("Shopee API Error:", err?.response?.data || err.message);



    return res.status(500).json({

      error: "Failed to fetch product data from RapidAPI",

      detail: err?.response?.data || err.message

    });

  }

}
