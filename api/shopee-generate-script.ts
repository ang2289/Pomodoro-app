import type { VercelRequest, VercelResponse } from '@vercel/node';

import { GoogleGenerativeAI } from "@google/generative-ai";



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method Not Allowed' });

  }



  try {

    const { title, price, description, sold } = req.body;



    if (!title) {

      return res.status(400).json({ error: "缺少商品名稱" });

    }



    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {

      return res.status(500).json({ error: "Gemini API 金鑰未設定" });

    }



    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



    const prompt = `

你是一位短影音腳本生成師，請根據以下資料生成 20 秒影片腳本 + 逐字稿（中文字幕）：



商品名稱：${title}

價格：${price || "未提供"}

商品描述：${description || "未提供"}

累積銷量：${sold || "未提供"}



請以「強烈吸睛的 TikTok / Reels 風格」輸出：



【最終必須回傳 JSON，格式如下，不要多字】

{

  "script": "三段式影片腳本，每段 1–2 句",

  "subtitles": ["字幕1", "字幕2", "字幕3", ...]

}

`;



    const result = await model.generateContent(prompt);

    const text = result.response.text();



    // 嘗試解析 JSON

    let jsonData;

    try {

      jsonData = JSON.parse(text);

    } catch (e) {

      // 如果直接解析失敗，嘗試提取 JSON 部分

      const match = text.match(/\{[\s\S]*\}/);

      if (match) {

        jsonData = JSON.parse(match[0]);

      } else {

        throw new Error("AI 回傳格式錯誤，無法解析 JSON");

      }

    }



    return res.status(200).json({

      success: true,

      ...jsonData

    });



  } catch (err: any) {

    console.error("AI 腳本生成錯誤:", err);

    return res.status(500).json({

      error: "腳本生成失敗",

      detail: err.message

    });

  }

}
