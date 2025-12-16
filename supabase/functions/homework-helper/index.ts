import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ 統一模型：gemini-1.5-flash（成本最佳化）
// 🛡️ 點數制：先扣點再呼叫 AI，避免成本浪費

console.log("✅ Edge Function 'homework-helper' is running...");

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ✅ 讀取金鑰，優先作業專用，其次通用金鑰
    const apiKey =
      Deno.env.get("VITE_GEMINI_API_KEY_HOMEWORK") || Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("❌ Gemini API Key 未設定！");
      return new Response("Missing Gemini API Key", { status: 500 });
    }

    const { prompt, mode } = await req.json();

    // 檢查是否有提供 prompt，如果沒有，回傳 400 錯誤
    if (!prompt) {
      return new Response(JSON.stringify({ error: "缺少 prompt" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 🛡️ 點數制：先扣點再呼叫 AI
    const inputLength = prompt.length;

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

    // 🔒 先扣點數（原子操作）
    try {
      const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_user_credits', {
        p_user_id: userIdentifier,
        p_used_chars: inputLength,
      });

      if (consumeError) {
        // 點數不足
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
              requested: inputLength,
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

      // 扣點成功，記錄使用紀錄（非同步）
      supabase.from('usage_logs').insert({
        user_id: userIdentifier,
        used_chars: inputLength,
        service_type: 'homework',
        content_preview: prompt.substring(0, 100), // 只記錄前 100 字
      }).catch((err) => {
        console.error("❌ 記錄使用紀錄失敗：", err);
      });

      // ✅ 扣點成功，繼續執行 AI 呼叫
    } catch (err) {
      console.error("❌ 扣點數過程發生錯誤：", err);
      return new Response(
        JSON.stringify({
          error: "扣點數失敗",
          message: err.message || "未知錯誤",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const systemPromptMap: Record<string, string> = {
      kid: "請用兒童可以理解的方式，用非常白話的語氣回答這個問題。",
      easy: "請用一般人可以理解的方式，簡單清楚地解釋這個問題。",
      pro: "請用專業邏輯的語氣，完整逐步說明這個問題的解題過程與答案。",
    };

    const promptInstruction = systemPromptMap[mode] || systemPromptMap["easy"];

    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${promptInstruction}\n\n${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        candidateCount: 1,
      },
    };

    console.log("🛠️ 嘗試呼叫 Gemini API...");

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    // 檢查連線狀態碼是否為 200，如果不是，則讀取錯誤訊息
    if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        console.error(`❌ Gemini API 狀態碼錯誤：${geminiRes.status}。原始回應：${errorText}`);
        return new Response(
            JSON.stringify({
                error: "Gemini API 連線失敗或狀態碼非 200",
                status: geminiRes.status,
                raw: errorText,
            }),
            {
                status: 502, // 使用 502 Bad Gateway 更能表達上游服務錯誤
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
    
    // 如果連線成功，解析 JSON
    const data = await geminiRes.json();
    console.log("✅ 成功收到 Gemini API 回應，開始解析。");


    // 檢查 Gemini 回傳的 JSON 中是否有明確的錯誤 (例如金鑰無效/配額用盡)
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
      data?.candidates?.[0]?.output ??
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // 檢查回傳的文字是否為空
    if (!text) {
      console.error("❌ Gemini 回傳格式錯誤或內容空白：", data);
      return new Response(
        JSON.stringify({
          error: "Gemini 回傳格式錯誤或內容空白",
          raw: data,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 成功回傳結果
    return new Response(JSON.stringify({ result: text }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
    
  } catch (err: any) {
    // 捕獲所有未預期的 Deno/網路錯誤
    console.error("❌ 伺服器捕獲的未預期錯誤 (Fatal Error):", err);
    return new Response(
      JSON.stringify({ error: "伺服器致命錯誤", message: err.message || "未知錯誤" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});