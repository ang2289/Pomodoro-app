import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ 統一模型：gemini-1.5-flash（成本最佳化）
// 🛡️ 點數制：先扣點再呼叫 AI，避免成本浪費

console.log("✅ Edge Function 'auto-summary' is running...");

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 讀取 Gemini API Key
    const apiKey =
      Deno.env.get("VITE_GEMINI_API_KEY_HOMEWORK") || Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("❌ Gemini API Key 未設定！");
      return new Response(
        JSON.stringify({ error: "Gemini API Key 未設定" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { content, lang = "zh-TW" } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少內容" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 🛡️ 點數制：先扣點再呼叫 AI
    const inputLength = content.length;

    // 從請求中取得用戶識別
    const authHeader = req.headers.get("authorization");
    let userIdentifier = "anonymous";
    
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        userIdentifier = token.length > 32 ? token.substring(0, 32) : token;
      } catch (e) {
        userIdentifier = req.headers.get("x-forwarded-for") || "anonymous";
      }
    } else {
      userIdentifier = req.headers.get("x-forwarded-for") || "anonymous";
    }

    // 取得 Supabase 客戶端
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🔒 先檢查點數是否足夠（預估總字數）
    // 預估輸出字數（摘要通常約為輸入的 10-20%）
    const estimatedOutputChars = Math.ceil(inputLength * 0.15); // 預估 15%
    const estimatedTotalChars = inputLength + estimatedOutputChars;
    
    // 先檢查點數是否足夠（不扣點，只讀取）
    const { data: creditCheck } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', userIdentifier)
      .single();
    
    const currentRemaining = creditCheck?.remaining_chars || 0;
    
    if (currentRemaining < estimatedTotalChars) {
      // 點數不足（即使預估）
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: "點數不足，請先購買點數",
          remaining: currentRemaining,
          requested: estimatedTotalChars,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 點數足夠，繼續呼叫 AI
    // ⚠️ 注意：實際扣點會在 AI 回應成功後進行（知道實際的 outputChars）

    // 檢查完成，開始生成摘要
    const isChinese = lang === "zh-TW" || lang === "zh-CN";

    const prompt = isChinese
      ? `請分析以下文章內容，並提供：

1. 摘要：用 200-300 字總結文章重點
2. 關鍵字：提取 5 個最重要的關鍵字，用逗號分隔

文章內容：
${content}

請用以下格式回覆（JSON）：
{
  "summary": "摘要內容",
  "keywords": ["關鍵字1", "關鍵字2", "關鍵字3", "關鍵字4", "關鍵字5"]
}`
      : `Please analyze the following article content and provide:

1. Summary: Summarize the key points in 200-300 words
2. Keywords: Extract 5 most important keywords

Article content:
${content}

Please reply in JSON format:
{
  "summary": "summary content",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    // 呼叫 Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            candidateCount: 1,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error(`❌ Gemini API 狀態碼錯誤：${geminiRes.status}。原始回應：${errorText}`);
      return new Response(
        JSON.stringify({
          error: "Gemini API 連線失敗",
          status: geminiRes.status,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data = await geminiRes.json();

    if (data.error) {
      console.error("❌ Gemini API 錯誤詳細資訊:", data.error);
      return new Response(
        JSON.stringify({
          error: "Gemini API 內部錯誤",
          message: data.error.message || "未知錯誤",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output;

    if (!text) {
      console.error("❌ Gemini 回傳格式錯誤或內容空白：", data);
      return new Response(
        JSON.stringify({
          error: "Gemini 回傳格式錯誤或內容空白",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 解析 JSON 回應
    let result;
    try {
      // 嘗試直接解析 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("無法找到 JSON 格式");
      }
    } catch (e) {
      // 如果解析失敗，嘗試手動提取
      const summaryMatch = isChinese
        ? text.match(/摘要[：:]\s*(.+?)(?=關鍵字|$)/s)
        : text.match(/Summary[：:]\s*(.+?)(?=Keywords|$)/is);
      
      const keywordsMatch = isChinese
        ? text.match(/關鍵字[：:]\s*\[(.+?)\]/)
        : text.match(/Keywords[：:]\s*\[(.+?)\]/i);

      result = {
        summary: summaryMatch ? summaryMatch[1].trim() : text.split("\n\n")[0].trim(),
        keywords: keywordsMatch
          ? keywordsMatch[1]
              .split(",")
              .map((k: string) => k.trim())
              .filter((k: string) => k.length > 0)
              .slice(0, 5)
          : [],
      };
    }

    // 🔒 AI 回應成功後，現在知道實際的輸出字數，執行扣點（在 transaction 中）
    const outputChars = (result.summary || '').length + (result.keywords?.join(', ') || '').length;
    const totalChars = inputLength + outputChars;

    let remainingChars = 0;
    let beforeRemaining = 0;
    let afterRemaining = 0;

    try {
      // 呼叫核心扣點函數（在單一 transaction 中完成扣點和記錄）
      const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_credits', {
        p_user_id: userIdentifier,
        p_feature: 'summary',
        p_input_chars: inputLength,
        p_output_chars: outputChars,
      });

      if (consumeError) {
        // 點數不足（可能在 AI 處理期間被其他請求扣掉了）
        if (consumeError.message.includes('insufficient_credits') || consumeError.code === 'P0001') {
          // 取得目前剩餘點數
          const { data: currentData } = await supabase
            .from('user_credits')
            .select('remaining_chars')
            .eq('user_id', userIdentifier)
            .single();

          const remaining = currentData?.remaining_chars || 0;

          return new Response(
            JSON.stringify({
              error: "INSUFFICIENT_CREDITS",
              message: "點數不足，請先購買點數",
              remaining: remaining,
              requested: totalChars,
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }

        // 其他錯誤
        console.error("❌ 扣點數失敗：", consumeError);
        throw consumeError;
      }

      // 扣點成功，取得剩餘點數
      // consume_credits 函數已經在同一 transaction 中完成扣點和記錄
      if (Array.isArray(consumeResult) && consumeResult.length > 0) {
        const res = consumeResult[0];
        remainingChars = res.remaining_chars || 0;
        beforeRemaining = res.before_remaining || 0;
        afterRemaining = res.after_remaining || 0;
      } else if (typeof consumeResult === 'object' && consumeResult !== null) {
        remainingChars = consumeResult.remaining_chars || 0;
        beforeRemaining = consumeResult.before_remaining || 0;
        afterRemaining = consumeResult.after_remaining || 0;
      }

    } catch (err) {
      console.error("❌ 扣點數失敗：", err);
      // 即使扣點失敗，仍然回傳 AI 結果（但記錄錯誤）
      // 實際環境中可能需要更嚴格的處理
    }

    const finalRemaining = remainingChars;

    return new Response(
      JSON.stringify({
        summary: result.summary || "",
        keywords: result.keywords || [],
        remaining: finalRemaining, // 扣點後的最新剩餘點數
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error("❌ 伺服器捕獲的未預期錯誤:", err);
    return new Response(
      JSON.stringify({
        error: "伺服器致命錯誤",
        message: err.message || "未知錯誤",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

