import type { VercelRequest, VercelResponse } from '@vercel/node';



export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  }



  try {

    const { url } = req.body;



    if (!url) {

      return res.status(400).json({ success: false, error: '缺少 URL' });

    }



    // 進行 HEAD 請求 → 自然展開短網址

    const response = await fetch(url, {

      method: "HEAD",

      redirect: "follow",

    });



    const finalUrl = response.url;



    if (!finalUrl) {

      return res.status(400).json({ success: false, error: '無法展開網址' });

    }



    return res.status(200).json({

      success: true,

      url: finalUrl,

    });



  } catch (err: any) {

    console.error("短網址展開錯誤:", err);

    return res.status(500).json({

      success: false,

      error: String(err)

    });

  }

}

