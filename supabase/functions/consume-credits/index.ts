// 核心扣點數服務（交易保護版本）
// ⚠️ 重要：此服務在單一 transaction 中完成扣點和記錄，使用 FOR UPDATE 防止 race condition
//
// 功能：
// - 計算 totalChars = inputChars + outputChars
// - 在 transaction 中 SELECT FOR UPDATE 鎖定行
// - 檢查點數是否足夠
// - 扣除點數
// - 插入使用紀錄
// - 回傳最新剩餘點數

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("✅ Edge Function 'consume-credits' is running...");

// 錯誤類型
export class InsufficientCreditsError extends Error {
  constructor(public remaining: number, public requested: number) {
    super(`Insufficient credits: remaining ${remaining}, requested ${requested}`);
    this.name = 'InsufficientCreditsError';
  }
}

interface ConsumeCreditsRequest {
  userId: string; // UUID 或 TEXT（向後兼容）
  feature: 'summary' | 'homework'; // 功能類型
  inputChars: number; // 輸入字數
  outputChars: number; // 輸出字數
  contentPreview?: string; // 可選內容預覽（保留但不再使用）
}

interface ConsumeCreditsResponse {
  success: boolean;
  remainingChars: number;
  beforeRemaining: number;
  afterRemaining: number;
  totalChars: number;
  error?: string;
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // ✅ OPTIONS preflight request 回傳 status 200
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 取得 Supabase 客戶端（使用 SERVICE_ROLE_KEY 以繞過 RLS）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 解析請求參數
    const { userId, feature, inputChars, outputChars } = await req.json() as ConsumeCreditsRequest;

    // 驗證參數
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing userId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!feature || !['summary', 'homework'].includes(feature)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid feature. Must be 'summary' or 'homework'" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (typeof inputChars !== 'number' || inputChars < 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid inputChars. Must be a non-negative number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (typeof outputChars !== 'number' || outputChars < 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid outputChars. Must be a non-negative number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 計算總使用字數
    const totalChars = inputChars + outputChars;

    console.log(`🔒 開始扣點數交易：user=${userId}, feature=${feature}, input=${inputChars}, output=${outputChars}, total=${totalChars}`);

    // 🛡️ 核心扣點數邏輯（在 PostgreSQL 函數中的單一 transaction）
    // 函數會：
    // 1. SELECT FOR UPDATE 鎖定行
    // 2. 檢查點數是否足夠
    // 3. 扣除點數
    // 4. 插入使用紀錄
    // 5. 回傳結果（自動 COMMIT）
    const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_feature: feature,
      p_input_chars: inputChars,
      p_output_chars: outputChars,
    });

    if (consumeError) {
      console.error("❌ 扣點數失敗：", consumeError);

      // 點數不足錯誤
      if (consumeError.message.includes('insufficient_credits') || consumeError.code === 'P0001') {
        // 取得目前剩餘點數（不鎖定）
        const { data: currentData } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', userId)
          .single();

        const remaining = currentData?.remaining_chars || 0;

        return new Response(
          JSON.stringify({
            success: false,
            error: "INSUFFICIENT_CREDITS",
            message: "點數不足，請先購買點數",
            remainingChars: remaining,
            requested: totalChars,
            inputChars,
            outputChars,
          }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // 其他錯誤
      return new Response(
        JSON.stringify({
          success: false,
          error: consumeError.message || "扣點數失敗",
          code: consumeError.code,
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 扣點成功，解析結果
    // consume_credits 函數回傳格式：{ remaining_chars, before_remaining, after_remaining }
    let remainingChars = 0;
    let beforeRemaining = 0;
    let afterRemaining = 0;

    if (Array.isArray(consumeResult) && consumeResult.length > 0) {
      const result = consumeResult[0];
      remainingChars = result.remaining_chars || 0;
      beforeRemaining = result.before_remaining || 0;
      afterRemaining = result.after_remaining || 0;
    } else if (consumeResult && typeof consumeResult === 'object') {
      remainingChars = consumeResult.remaining_chars || 0;
      beforeRemaining = consumeResult.before_remaining || 0;
      afterRemaining = consumeResult.after_remaining || 0;
    }

    console.log(`✅ 扣點數成功：remaining=${remainingChars}, before=${beforeRemaining}, after=${afterRemaining}`);

    // 回傳成功結果
    const response: ConsumeCreditsResponse = {
      success: true,
      remainingChars,
      beforeRemaining,
      afterRemaining,
      totalChars,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("❌ 伺服器錯誤：", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "伺服器錯誤",
        message: error.message || "未知錯誤",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
