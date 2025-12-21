import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ 統一模型：gemini-1.5-flash（成本最佳化）
// 🛡️ 點數制：先扣點再呼叫 AI，避免成本浪費

// ✅ CORS headers 設定（最上方）
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

console.log("✅ Edge Function 'auto-summary' is running...");

serve(async (req: Request) => {
  // 🔍 DEBUG: 檢查所有相關 headers
  console.log('🔍 [Edge Function] Request received:', {
    method: req.method,
    url: req.url,
    hasAuthHeader: !!req.headers.get('authorization'),
    authHeader: req.headers.get('authorization')?.substring(0, 50) + '...',
    hasApikey: !!req.headers.get('apikey'),
  })

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
      const summary = "Gemini API Key 未設定";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      console.log("AUTO_SUMMARY_RETURN", {
        result: summaryText
      });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const { content, lang = "zh-TW" } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      const summary = "缺少內容";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      console.log("AUTO_SUMMARY_RETURN", {
        result: summaryText
      });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // 🛡️ 點數制：先扣點再呼叫 AI
    const inputLength = content.length;

    // 🔓 允許匿名（訪客）呼叫，不檢查認證
    // 註解：原本的用戶識別和點數檢查邏輯已移除，允許訪客直接使用
    // const authHeader = req.headers.get("authorization");
    // let userIdentifier = "anonymous";
    // ... (已註解，允許匿名呼叫)

    // 取得 Supabase 客戶端（僅用於可能的資料庫操作，不進行認證檢查）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // 註解：Supabase 客戶端建立保留，但不進行認證檢查
    // const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🔓 訪客模式：跳過點數檢查，直接執行摘要
    // 註解：原本的點數檢查邏輯已移除
    // const estimatedOutputChars = Math.ceil(inputLength * 0.15);
    // const estimatedTotalChars = inputLength + estimatedOutputChars;
    // ... (已註解，允許訪客直接使用)

    // 檢查完成，開始生成摘要
    // ✅ 根據 language 參數強制指定回復語言（不允許模型自行判斷）
    let languageInstruction = '';
    let promptLanguage = '';
    
    if (lang === "zh-TW" || lang === "zh-CN" || lang === "zh") {
      languageInstruction = '請用繁體中文回答。';
      promptLanguage = 'zh';
    } else if (lang === "en") {
      languageInstruction = 'Please answer in English only.';
      promptLanguage = 'en';
    } else if (lang === "ja") {
      languageInstruction = '日本語でのみ回答してください。';
      promptLanguage = 'ja';
    } else {
      // 預設繁體中文
      languageInstruction = '請用繁體中文回答。';
      promptLanguage = 'zh';
    }

    const prompt = promptLanguage === 'zh'
      ? `${languageInstruction}

請分析以下文章內容，並提供：

1. 摘要：用 200-300 字總結文章重點
2. 關鍵字：提取 5 個最重要的關鍵字，用逗號分隔

文章內容：
${content}

請用以下格式回覆（JSON）：
{
  "summary": "摘要內容",
  "keywords": ["關鍵字1", "關鍵字2", "關鍵字3", "關鍵字4", "關鍵字5"]
}`
      : promptLanguage === 'ja'
      ? `${languageInstruction}

以下の記事内容を分析し、以下を提供してください：

1. 要約：200-300文字で記事の要点をまとめてください
2. キーワード：最も重要なキーワードを5つ抽出してください

記事内容：
${content}

以下の形式（JSON）で回答してください：
{
  "summary": "要約内容",
  "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"]
}`
      : `${languageInstruction}

Please analyze the following article content and provide:

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
      const summary = "Gemini API 連線失敗";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      console.log("AUTO_SUMMARY_RETURN", {
        result: summaryText
      });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const data = await geminiRes.json();

    if (data.error) {
      console.error("❌ Gemini API 錯誤詳細資訊:", data.error);
      const summary = data.error.message || "未知錯誤";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      console.log("AUTO_SUMMARY_RETURN", {
        result: summaryText
      });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output;

    if (!text) {
      console.error("❌ Gemini 回傳格式錯誤或內容空白：", data);
      const summary = "Gemini 回傳格式錯誤或內容空白";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      console.log("AUTO_SUMMARY_RETURN", {
        result: summaryText
      });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
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
        // 無法找到 JSON 格式，使用 fallback 邏輯
        result = null;
      }
    } catch (e) {
      // 如果解析失敗，嘗試手動提取
      const summaryMatch = promptLanguage === 'zh'
        ? text.match(/摘要[：:]\s*(.+?)(?=關鍵字|$)/s)
        : promptLanguage === 'ja'
        ? text.match(/要約[：:]\s*(.+?)(?=キーワード|$)/s)
        : text.match(/Summary[：:]\s*(.+?)(?=Keywords|$)/is);
      
      const keywordsMatch = promptLanguage === 'zh'
        ? text.match(/關鍵字[：:]\s*\[(.+?)\]/)
        : promptLanguage === 'ja'
        ? text.match(/キーワード[：:]\s*\[(.+?)\]/)
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

    // 如果 result 為 null（JSON 解析失敗且無法提取），回傳錯誤
    if (!result) {
      const summary = "無法解析 AI 回應格式";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      console.log("AUTO_SUMMARY_RETURN", {
        result: summaryText
      });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // 🔓 訪客模式：不執行扣點邏輯
    // 註解：原本的扣點邏輯已移除，訪客模式不扣點
    // const outputChars = (result.summary || '').length + (result.keywords?.join(', ') || '').length;
    // ... (已註解，訪客模式不扣點)

    // 產生摘要完成後，將摘要文字存入 summaryText 變數
    const summary = typeof result.summary === 'string' 
      ? result.summary 
      : (result.summary || text.split("\n\n")[0].trim() || "");
    const summaryText = typeof summary === "string"
      ? summary
      : JSON.stringify(summary);

    // 產生 keywords 陣列（字串陣列）
    const keywords: string[] = Array.isArray(result.keywords) && result.keywords.length > 0
      ? result.keywords
          .map((k: any) => typeof k === "string" ? k.trim() : String(k).trim())
          .filter((k: string) => k.length > 0)
          .slice(0, 5) // 最多 5 個關鍵字
      : []; // 如果沒有關鍵字，回傳空陣列

    console.log("AUTO_SUMMARY_RETURN", {
      result: summaryText,
      keywords: keywords
    });

    return new Response(
      JSON.stringify({
        result: summaryText,
        keywords: keywords
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err: any) {
    console.error("❌ 伺服器捕獲的未預期錯誤:", err);
    console.error("❌ 錯誤詳細資訊:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    const summary = err.message || "未知錯誤";
    const summaryText = typeof summary === "string"
      ? summary
      : JSON.stringify(summary);
    console.log("AUTO_SUMMARY_RETURN", {
      result: summaryText
    });
    return new Response(
      JSON.stringify({
        result: summaryText
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
});

