import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ CORS headers 設定（最上方）
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// console.log("✅ Edge Function 'summary' is running...");

serve(async (req: Request) => {
  // ✅ OPTIONS preflight 處理：必須在 handler 第一行，不能有任何 await 在它前面
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 解析請求 body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("❌ JSON 解析失敗：", parseError);
      return new Response(
        JSON.stringify({ error: "請求格式錯誤" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { content, lang = "zh-TW" } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少內容" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🔒 先檢查點數是否足夠（預估總字數）
    // 預估輸出字數（摘要通常約為輸入的 10-20%）
    const estimatedOutputChars = Math.ceil(inputLength * 0.15); // 預估 15%
    const estimatedTotalChars = inputLength + estimatedOutputChars;
    
    // 先檢查點數是否足夠（不扣點，只讀取）
    const { data: creditCheck, error: creditError } = await supabase
      .from('user_credits')
      .select('remaining_chars')
      .eq('user_id', userIdentifier)
      .single();
    
    if (creditError) {
      console.error("❌ 讀取點數失敗：", creditError);
      return new Response(
        JSON.stringify({ error: "讀取點數失敗" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const currentRemaining = creditCheck?.remaining_chars || 0;
    
    if (currentRemaining < estimatedTotalChars) {
      // 點數不足（即使預估）
      return new Response(
        JSON.stringify({ error: "INSUFFICIENT_CREDITS" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 點數足夠，繼續呼叫 AI
    // ⚠️ 注意：實際扣點會在 AI 回應成功後進行（知道實際的 outputChars）

    // 檢查完成，開始生成摘要
    const isChinese = lang === "zh-TW" || lang === "zh-CN";

    const prompt = isChinese
      ? `請分析以下文章內容，並提供摘要：用 200-300 字總結文章重點。

文章內容：
${content}

請只回覆摘要內容，不需要其他格式。`
      : `Please analyze the following article content and provide a summary: Summarize the key points in 200-300 words.

Article content:
${content}

Please reply with only the summary content, no other format.`;

    // 呼叫 Gemini API
    let geminiRes: Response;
    try {
      geminiRes = await fetch(
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
    } catch (fetchError) {
      console.error("❌ Gemini API fetch 失敗：", fetchError);
      return new Response(
        JSON.stringify({ error: "Gemini API 連線失敗" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!geminiRes.ok) {
      let errorText = "";
      try {
        errorText = await geminiRes.text();
      } catch (e) {
        errorText = "無法讀取錯誤訊息";
      }
      console.error(`❌ Gemini API 狀態碼錯誤：${geminiRes.status}。原始回應：${errorText}`);
      return new Response(
        JSON.stringify({ error: "Gemini API 連線失敗" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 解析 Gemini 回應
    let data: any;
    try {
      data = await geminiRes.json();
    } catch (jsonError) {
      console.error("❌ Gemini API JSON 解析失敗：", jsonError);
      return new Response(
        JSON.stringify({ error: "Gemini API 回應格式錯誤" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (data.error) {
      console.error("❌ Gemini API 錯誤詳細資訊:", data.error);
      return new Response(
        JSON.stringify({ error: data.error.message || "未知錯誤" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output;

    if (!text) {
      console.error("❌ Gemini 回傳格式錯誤或內容空白：", data);
      return new Response(
        JSON.stringify({ error: "Gemini 回傳格式錯誤或內容空白" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 取得摘要文字（去除多餘格式）
    const summaryText = text.trim();

    // 🔒 AI 回應成功後，現在知道實際的輸出字數，執行扣點（在 transaction 中）
    const outputChars = summaryText.length;
    const totalChars = inputLength + outputChars;

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
          return new Response(
            JSON.stringify({ error: "INSUFFICIENT_CREDITS" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 其他錯誤
        console.error("❌ 扣點數失敗：", consumeError);
        return new Response(
          JSON.stringify({ error: consumeError.message || "扣點數失敗" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // 扣點成功，記錄使用紀錄（非同步）
      supabase.from('usage_logs').insert({
        user_id: userIdentifier,
        used_chars: totalChars,
        service_type: 'summary',
        content_preview: content.substring(0, 100), // 只記錄前 100 字
      }).catch((err) => {
        console.error("❌ 記錄使用紀錄失敗：", err);
      });

    } catch (err: any) {
      console.error("❌ 扣點數過程發生錯誤：", err);
      // 即使扣點失敗，仍然回傳 AI 結果（但記錄錯誤）
      // 實際環境中可能需要更嚴格的處理
    }

    // ✅ 成功回傳結果：統一格式 { result: string }
    return new Response(
      JSON.stringify({ result: summaryText }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    // 捕獲所有未預期的 Deno/網路錯誤
    console.error("❌ 伺服器捕獲的未預期錯誤 (Fatal Error):", err);
    return new Response(
      JSON.stringify({ error: err.message || "未知錯誤" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
