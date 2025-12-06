import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createClient } from '@supabase/supabase-js';



export default async function handler(req: VercelRequest, res: VercelResponse) {

  try {

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;



    if (!supabaseUrl || !supabaseKey) {

      return res.status(500).json({

        ok: false,

        error: "Supabase 環境變數未設定"

      });

    }



    const supabase = createClient(supabaseUrl, supabaseKey);



    // 用最小量查詢 Ping Supabase

    await supabase.from("wishes").select("id").limit(1);



    res.status(200).json({

      ok: true,

      message: "Supabase keep-alive triggered."

    });

  } catch (error) {

    console.error("Keep-alive error:", error);

    res.status(500).json({

      ok: false,

      error: String(error)

    });

  }

}

