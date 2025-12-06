import type { VercelRequest, VercelResponse } from "@vercel/node";



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== "POST") {

    return res.status(405).json({ success: false, message: "Method not allowed" });

  }



  try {

    const { url } = req.body;



    // HEAD 請求讓短網址自動跳轉

    const response = await fetch(url, { method: "HEAD", redirect: "follow" });



    const finalUrl = response.url;



    if (!finalUrl) {

      return res.status(400).json({ success: false, message: "短網址解析失敗" });

    }



    return res.json({

      success: true,

      url: finalUrl,

    });



  } catch (err: any) {

    return res.status(500).json({

      success: false,

      error: err.message || err.toString(),

    });

  }

}

