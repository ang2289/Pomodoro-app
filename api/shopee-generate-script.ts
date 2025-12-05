import type { VercelRequest, VercelResponse } from '@vercel/node';

import axios from "axios";



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== "POST") {

    return res.status(405).json({ error: "Method not allowed" });

  }



  try {

    const { title, description, price, sold } = req.body;



    if (!title) {

      return res.status(400).json({ error: "缺少必要欄位：title" });

    }



    // ---------- 生成短影片腳本 ----------

    const script = `

【快速介紹】

這款商品是：「${title}」。

目前售價約為 ${price ? price + "元" : "🔍 價格以頁面為主"}，

累積銷量達到 ${sold ?? "未知"} 件，是近期在蝦皮上很受歡迎的熱銷商品！



【痛點】

你是否也遇到這些問題？

${description ? "- " + description.split(".")[0] : "- 產品特色在官網上多有提到，但使用後會更有感！"}



【亮點】

這款商品的亮點包含：

1. ${description?.split(".")[1] ?? "設計簡潔好用，日常生活超方便"}

2. ${description?.split(".")[2] ?? "網路評價高，許多使用者都持續回購"}

3. CP 值高，屬於小資族也能輕鬆入手的好選擇



【誰適合】

如果你是：

✔ 想要提升生活品質

✔ 喜歡方便、快速、好用商品

✔ 喜歡高 CP 值熱銷品  

那你一定會喜歡這款！



【行動 CTA】

如果你也覺得不錯，

可以直接點擊下方連結看看更多細節👇  

影片下方有蝦皮商品連結，記得去看看！

    `.trim();



    // ---------- 字幕切段 ----------

    const subtitles = script.split("\n").filter(line => line.trim() !== "");



    // ---------- 視覺鏡頭腳本 ----------

    const scenes = [

      { sec: 0,  text: "商品名稱 + 商品封面圖", visual: "顯示商品主圖，加入光暈與文字動畫" },

      { sec: 2,  text: "快速介紹商品亮點", visual: "放大商品照片，簡單過場動畫" },

      { sec: 5,  text: "帶出使用痛點", visual: "弱光背景 + 簡單 emoji 製造情緒" },

      { sec: 9,  text: "展示亮點 1～3", visual: "圖片輪播 or 商品細節特寫" },

      { sec: 14, text: "誰適合使用",   visual: "顯示 3 個 bullet points + Emoji" },

      { sec: 18, text: "CTA：點擊連結購買", visual: "加入購買按鈕動畫 + Shake 效果" }

    ];



    return res.status(200).json({

      success: true,

      script,

      subtitles,

      scenes

    });



  } catch (err: any) {

    return res.status(500).json({ error: err.message });

  }

}

