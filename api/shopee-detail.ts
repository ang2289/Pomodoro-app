import type { VercelRequest, VercelResponse } from "@vercel/node";

import axios from "axios";



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const url = req.query.url as string;



    if (!url) {

      return res.status(400).json({ error: "缺少商品網址 url 參數" });

    }



    // 解析商品網址 (https://shopee.tw/product/{shopid}/{itemid})

    const match = url.match(/product\/(\d+)\/(\d+)/);

    if (!match) {

      return res.status(400).json({ error: "無法解析商品網址，請確認格式是否正確" });

    }



    const shopId = match[1];

    const itemId = match[2];



    const API_KEY = process.env.RAPIDAPI_KEY;

    const API_HOST = "shopee-e-commerce-data.p.rapidapi.com";



    if (!API_KEY) {

      return res.status(500).json({ error: "後端 RAPIDAPI_KEY 未設定" });

    }



    const response = await axios.get(

      `https://${API_HOST}/shopee/item/get`,

      {

        params: {

          itemid: itemId,

          shopid: shopId,

          site: "tw",

        },

        headers: {

          "X-RapidAPI-Key": API_KEY,

          "X-RapidAPI-Host": API_HOST,

        },

      }

    );



    return res.status(200).json(response.data);

  } catch (err: any) {

    return res.status(500).json({

      error: "後端獲取商品資訊失敗",

      detail: err.response?.data || err.message,

    });

  }

}
