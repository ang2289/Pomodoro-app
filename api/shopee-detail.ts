/**
 * @deprecated 此 API 已棄用，不再被使用
 * 新的 shopee-video 功能已改為本地輸入模式，不再依賴外部 API
 * 請使用 /api/shopee-generate-script 和 /api/generate-video 替代
 * 
 * /api/shopee-detail.ts
 * 
 * ✅ 支援短網址解析 (s.shopee.tw)
 * ✅ 支援台灣 Shopee HTML Parser (不需要 API，不會被封)
 */



import type { VercelRequest, VercelResponse } from '@vercel/node';

import * as cheerio from "cheerio";



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const { url } = req.body || req.query;



    if (!url) {

      return res.status(400).json({ error: "缺少網址" });

    }



    let finalUrl = (url as string).trim();



    // 1️⃣ 如果是短網址，先展開

    if (finalUrl.includes("s.shopee.tw")) {

      const res = await fetch(finalUrl, { redirect: "follow" });

      finalUrl = res.url; // 自動跳轉後的正式 URL

    }



    // 2️⃣ 抓取商品 HTML

    const htmlResponse = await fetch(finalUrl);

    const html = await htmlResponse.text();

    const $ = cheerio.load(html);



    // 3️⃣ 解析商品名稱

    const title =

      $('meta[property="og:title"]').attr("content") ||

      $("title").text().replace(" | Shopee台灣", "").trim();



    // 4️⃣ 解析價格

    let price =

      $('meta[property="product:price:amount"]').attr("content") ||

      $(".pqTWkA").first().text().replace(/[^\d]/g, "");



    // 5️⃣ 解析商品描述

    const description =

      $('meta[name="description"]').attr("content") ||

      $(".product-description").text().trim();



    // 6️⃣ 解析銷量（非必要，能抓到就抓）

    let sold = $(".HmQo7V").first().text().replace(/[^\d]/g, "");



    // 7️⃣ 解析商品圖片

    const image =

      $('meta[property="og:image"]').attr("content") ||

      $('img[alt*="商品"]').first().attr("src") ||

      "";



    return res.status(200).json({

      url: finalUrl,

      title,

      price,

      description,

      sold,

      image,

    });

  } catch (err: any) {

    console.error("Shopee 解析錯誤:", err);

    return res.status(500).json({

      error: "無法解析商品資料",

      detail: err.message

    });

  }

}
