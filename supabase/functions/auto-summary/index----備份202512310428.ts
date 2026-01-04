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

// ✅ 確認 Edge Function 有被呼叫
console.log('[auto-summary] invoked')

serve(async (req: Request) => {
  // ✅ OPTIONS preflight 處理：必須在 handler 第一行，不能有任何 await 在它前面
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // 🔒 檢查登入者身份（必須在開頭）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase 設定未完成");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 從 request headers 取得 authorization token
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 從 token 取得使用者身份
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    // 如果沒有 user，返回 401
    if (!user || authError) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 讀取 Gemini API Key
    const apiKey =
      Deno.env.get("VITE_GEMINI_API_KEY_HOMEWORK") || Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("❌ Gemini API Key 未設定！");
      const summary = "Gemini API Key 未設定";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
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

    // ✅ 防呆：安全取得 body，避免直接 throw
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("❌ 無法解析請求 body:", err);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { content, lang = "zh-TW" } = body;

    // ✅ 防呆：嚴格檢查 content 是否存在且為字串
    if (!content || typeof content !== "string") {
      console.error("❌ content is required and must be a string");
      return new Response(
        JSON.stringify({ error: "content is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (content.trim().length === 0) {
      console.error("❌ content cannot be empty");
      return new Response(
        JSON.stringify({ error: "content cannot be empty" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 🛡️ 點數制：扣點已在 useSummaryAction.ts 中完成（呼叫 consume_credits RPC）
    const inputLength = content.length;

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
3. SEO 流量關鍵字（traffic_keywords）：根據文章內容產生 5 個 SEO 流量關鍵字
   - 這些關鍵字應該模擬一般人在 Google 搜尋時會實際輸入的完整問題或敘述句
   - 例如：「...怎麼處理」、「...準備什麼」、「...如何申請」、「...哪裡可以買」、「...多少錢」等完整搜尋語句
   - 每個關鍵字應該是完整的搜尋查詢，而非單一詞彙
   - 關鍵字應該與文章內容相關，能夠幫助使用者找到相關資訊

文章內容：
${content}

請用以下格式回覆（嚴格 JSON 格式，不要包含 Markdown 標籤）：
{
  "summary": "摘要內容",
  "keywords": ["關鍵字1", "關鍵字2", "關鍵字3", "關鍵字4", "關鍵字5"],
  "traffic_keywords": ["SEO 流量長尾關鍵字1", "SEO 流量長尾關鍵字2", "SEO 流量長尾關鍵字3", "SEO 流量長尾關鍵字4", "SEO 流量長尾關鍵字5"]
}`
      : promptLanguage === 'ja'
      ? `${languageInstruction}

以下の記事内容を分析し、以下を提供してください：

1. 要約：200-300文字で記事の要点をまとめてください
2. キーワード：最も重要なキーワードを5つ抽出してください
3. SEO トラフィックキーワード（traffic_keywords）：記事内容に基づいて5つの SEO トラフィックキーワードを生成
   - これらのキーワードは、一般の人が Google で検索する際に実際に入力する完全な質問や叙述文を模擬する必要があります
   - 例：「...どう処理するか」、「...何を準備するか」、「...申請方法」、「どこで購入できるか」、「いくらかかるか」などの完全な検索クエリ
   - 各キーワードは単一の語彙ではなく、完全な検索クエリである必要があります
   - キーワードは記事内容に関連し、ユーザーが関連情報を見つけるのに役立つ必要があります

記事内容：
${content}

以下の形式（厳密な JSON 形式、Markdown タグを含めない）で回答してください：
{
  "summary": "要約内容",
  "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"],
  "traffic_keywords": ["SEO トラフィックロングテールキーワード1", "SEO トラフィックロングテールキーワード2", "SEO トラフィックロングテールキーワード3", "SEO トラフィックロングテールキーワード4", "SEO トラフィックロングテールキーワード5"]
}`
      : `${languageInstruction}

Please analyze the following article content and provide:

1. Summary: Summarize the key points in 200-300 words
2. Keywords: Extract 5 most important keywords
3. SEO traffic keywords (traffic_keywords): Generate 5 SEO traffic keywords based on the article content
   - These keywords should simulate complete questions or statements that people would actually type when searching on Google
   - Examples: "...how to handle", "...what to prepare", "...how to apply", "...where to buy", "...how much does it cost", etc.
   - Each keyword should be a complete search query, not a single word
   - Keywords should be relevant to the article content and help users find related information

Article content:
${content}

Please reply in strict JSON format (do not include Markdown tags):
{
  "summary": "summary content",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "traffic_keywords": ["SEO traffic long-tail keyword 1", "SEO traffic long-tail keyword 2", "SEO traffic long-tail keyword 3", "SEO traffic long-tail keyword 4", "SEO traffic long-tail keyword 5"]
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
            temperature: 0.1,
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
      // console.log("AUTO_SUMMARY_RETURN", { result: summaryText });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
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
      // console.log("AUTO_SUMMARY_RETURN", { result: summaryText });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
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
      // console.log("AUTO_SUMMARY_RETURN", { result: summaryText });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // 解析 JSON 回應
    let result;
    try {
      // 優化 JSON 解析：移除 AI 可能帶入的 Markdown 標籤
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      // 嘗試直接解析 JSON
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
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
        traffic_keywords: [], // Fallback 時不產生 traffic_keywords
      };
    }

    // 如果 result 為 null（JSON 解析失敗且無法提取），回傳錯誤
    if (!result) {
      const summary = "無法解析 AI 回應格式";
      const summaryText = typeof summary === "string"
        ? summary
        : JSON.stringify(summary);
      // console.log("AUTO_SUMMARY_RETURN", { result: summaryText });
      return new Response(
        JSON.stringify({
          result: summaryText
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // 🔒 扣點已在 useSummaryAction.ts 中完成（呼叫 consume_credits RPC）

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

    // 產生 traffic_keywords 陣列（SEO 流量長尾關鍵字）
    const traffic_keywords: string[] = Array.isArray(result.traffic_keywords) && result.traffic_keywords.length > 0
      ? result.traffic_keywords
          .map((k: any) => typeof k === "string" ? k.trim() : String(k).trim())
          .filter((k: string) => k.length > 0)
          .slice(0, 5) // 最多 5 個 SEO 流量長尾關鍵字
      : []; // 如果沒有 traffic_keywords，回傳空陣列

    // 計算 usage_chars（可計費字數）
    // 包含：content（使用者輸入全文）+ summary + keywords + traffic_keywords
    let usage_chars = 0;
    
    // 1. content（使用者輸入全文）的字數
    usage_chars += inputLength;
    
    // 2. summary 字數
    usage_chars += summaryText.length;
    
    // 3. keywords 每個字串字數加總
    if (Array.isArray(keywords) && keywords.length > 0) {
      usage_chars += keywords.reduce((sum, keyword) => sum + (typeof keyword === 'string' ? keyword.length : 0), 0);
    }
    
    // 4. traffic_keywords 每個字串字數加總
    if (traffic_keywords.length > 0) {
      usage_chars += traffic_keywords.reduce((sum, keyword) => sum + (typeof keyword === 'string' ? keyword.length : 0), 0);
    }

    // console.log("AUTO_SUMMARY_RETURN", {
    //   summary: summaryText,
    //   result: summaryText,
    //   keywords: keywords,
    //   traffic_keywords: traffic_keywords,
    //   usage_chars: usage_chars
    // });

    // 🔒 扣點已在 useSummaryAction.ts 中完成（呼叫 consume_credits RPC）
    // Edge Function 不再需要重複扣點

    // 統一欄位名稱：同時包含 summary 和 result 以確保前端相容性
    return new Response(
      JSON.stringify({
        summary: summaryText,
        result: summaryText,
        keywords: keywords,
        traffic_keywords: traffic_keywords,
        usage_chars: usage_chars
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
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
    // console.log("AUTO_SUMMARY_RETURN", { result: summaryText });
    return new Response(
      JSON.stringify({
        result: summaryText
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});

