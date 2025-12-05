import type { VercelRequest, VercelResponse } from '@vercel/node';



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== "POST") {

    return res.status(405).json({ error: "Method not allowed" });

  }



  try {

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;



    const title = body?.title ?? "";

    const description = body?.description ?? "";

    const price = body?.price ?? "";

    const sold = body?.sold ?? "";



    // 避免 description split 錯誤

    const descParts = description ? description.split(".") : [];



    const d1 = descParts[0] || "這款商品具有相當高的實用性。";

    const d2 = descParts[1] || "使用起來方便、省力、提升生活效率。";

    const d3 = descParts[2] || "網路評價普遍正面，是近期熱銷的選擇。";



    // ---------- 影片腳本 ----------

    const script = `

【快速介紹】

這款商品是：「${title}」。

目前售價約為 ${price || "請以蝦皮頁面為主"}，

累積銷量約 ${sold || "未知"} 件。



【痛點】

你是否也遇到以下問題？

- ${d1}



【亮點整理】

1. ${d1}

2. ${d2}

3. ${d3}



【適合族群】

✔ 想提升生活品質  

✔ 想要方便、快速、好用  

✔ 喜歡高 CP 值熱銷品  



【行動 CTA】

覺得不錯的話，歡迎點擊影片下方商品連結看看更多資訊！

    `.trim();



    const subtitles = script.split("\n").filter(l => l.trim() !== "");



    const scenes = [

      { sec: 0, text: "商品名稱 + 商品封面", visual: "主圖展示 + 淡入動畫" },

      { sec: 2, text: "介紹產品與價格", visual: "商品主圖放大 + 文字特效" },

      { sec: 5, text: "使用痛點", visual: "背景模糊 + emoji 氛圍" },

      { sec: 9, text: "亮點 1–3", visual: "三段式輪播" },

      { sec: 14, text: "適合族群", visual: "白底 + icon" },

      { sec: 18, text: "CTA 點擊購買", visual: "按鈕動畫" }

    ];



    return res.status(200).json({

      success: true,

      script,

      subtitles,

      scenes

    });



  } catch (err: any) {

    console.error("SCRIPT API ERROR:", err);

    return res.status(500).json({ error: "腳本生成失敗", detail: err.message });

  }

}
