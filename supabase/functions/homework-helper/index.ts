import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ CORS headers 設定（最上方）
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

// console.log("✅ Edge Function 'homework-helper' is running...");

serve(async (req: Request) => {
  console.log('[HOMEWORK API] called')
  
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

    // ✅ 1. 解析請求 body，從 body 直接取得 userId（與摘要一致）
    const body = await req.json();
    const { prompt, mode = 'answer', language = 'zh', userId } = body;

    const isGuest = !userId;
    console.log("[HOMEWORK] isGuest:", isGuest, "userId:", userId);
    const authHeader = req.headers.get("authorization");
    console.log('[HOMEWORK AUTH]', { hasAuthHeader: !!authHeader, userId, isGuest });

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少題目內容" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 🛡️ 點數制：取得使用者 ID 並準備扣點
    const inputLength = prompt.trim().length;
    
    // 取得 Supabase 客戶端
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let supabase: any = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // 預先檢查點數是否足夠（預估輸出字數為輸入的 50%）
      if (userId && supabase) {
        const estimatedOutputChars = Math.ceil(inputLength * 0.5);
        const estimatedTotalChars = inputLength + estimatedOutputChars;
        
        const { data: creditData, error: creditError } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', userId)
          .single();
        
        const currentRemaining = creditData?.remaining_chars || 0;
        
        // 如果點數不足（即使預估），回傳錯誤
        if (currentRemaining < estimatedTotalChars) {
          return new Response(
            JSON.stringify({ 
              error: "INSUFFICIENT_CREDITS",
              message: "點數不足，請先購買點數",
            }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    // ✅ 2. 根據 language 動態生成模式提示（不寫死任何語言）
    const getModeInstruction = (mode: string, lang: string): string => {
      const modeMap: Record<string, Record<string, string>> = {
        answer: {
          zh: '請直接給出這個問題的答案，簡潔明瞭。只需要答案，不需要解釋過程。',
          en: 'Please provide a direct answer to this question, concise and clear. Only the answer is needed, no explanation process required.',
          ja: 'この質問に対する直接的な答えを簡潔に示してください。答えだけでよく、説明は不要です。',
        },
        easy: {
          zh: '請用兒童可以理解的方式，用非常白話的語氣回答這個問題。禁止使用專業詞彙，請用故事＋比喻說明。',
          en: 'Please answer this question in a way that children can understand, using very plain language. Do not use technical terms, use stories and analogies to explain.',
          ja: '子供が理解できる方法で、非常に平易な言葉でこの質問に答えてください。専門用語の使用を禁止し、物語と比喩で説明してください。',
        },
        pro: {
          zh: '請用專業邏輯的語氣，完整逐步說明這個問題的解題過程與答案。請分段寫出解題過程。',
          en: 'Please use a professional and logical tone to fully explain the problem-solving process and answer step by step. Please write out the solution process in sections.',
          ja: '専門的で論理的な口調で、この問題の解法と答えを完全に段階的に説明してください。解法プロセスをセクションに分けて記述してください。',
        },
        example: {
          zh: '請用具體的例子來解釋這個問題，讓學生更容易理解。先給答案，再用生活中的例子說明。',
          en: 'Please use specific examples to explain this question, making it easier for students to understand. First give the answer, then explain with examples from daily life.',
          ja: '具体的な例を使用してこの問題を説明し、学生が理解しやすくしてください。まず答えを提示し、その後日常生活の例で説明してください。',
        },
        // 向後相容
        answerOnly: {
          zh: '請直接給出這個問題的答案，簡潔明瞭。只需要答案，不需要解釋過程。',
          en: 'Please provide a direct answer to this question, concise and clear. Only the answer is needed, no explanation process required.',
          ja: 'この質問に対する直接的な答えを簡潔に示してください。答えだけでよく、説明は不要です。',
        },
        simple: {
          zh: '請用兒童可以理解的方式，用非常白話的語氣回答這個問題。禁止使用專業詞彙，請用故事＋比喻說明。',
          en: 'Please answer this question in a way that children can understand, using very plain language. Do not use technical terms, use stories and analogies to explain.',
          ja: '子供が理解できる方法で、非常に平易な言葉でこの質問に答えてください。専門用語の使用を禁止し、物語と比喩で説明してください。',
        },
        detailed: {
          zh: '請用專業邏輯的語氣，完整逐步說明這個問題的解題過程與答案。請分段寫出解題過程。',
          en: 'Please use a professional and logical tone to fully explain the problem-solving process and answer step by step. Please write out the solution process in sections.',
          ja: '専門的で論理的な口調で、この問題の解法と答えを完全に段階的に説明してください。解法プロセスをセクションに分けて記述してください。',
        },
        examples: {
          zh: '請用具體的例子來解釋這個問題，讓學生更容易理解。先給答案，再用生活中的例子說明。',
          en: 'Please use specific examples to explain this question, making it easier for students to understand. First give the answer, then explain with examples from daily life.',
          ja: '具体的な例を使用してこの問題を説明し、学生が理解しやすくしてください。まず答えを提示し、その後日常生活の例で説明してください。',
        },
        kid: {
          zh: '請用兒童可以理解的方式，用非常白話的語氣回答這個問題。禁止使用專業詞彙，請用故事＋比喻說明。',
          en: 'Please answer this question in a way that children can understand, using very plain language. Do not use technical terms, use stories and analogies to explain.',
          ja: '子供が理解できる方法で、非常に平易な言葉でこの質問に答えてください。専門用語の使用を禁止し、物語と比喩で説明してください。',
        },
      };

      const normalizedLang = (lang === 'zh' || lang === 'zh-TW' || lang === 'zh-CN') ? 'zh' : 
                            (lang === 'ja') ? 'ja' : 'en';
      return modeMap[mode]?.[normalizedLang] || modeMap['answer'][normalizedLang] || modeMap['answer']['en'];
    };

    const modeInstruction = getModeInstruction(mode, language);

    // ✅ 3. 根據 language 生成硬性語言指令（用於 systemInstruction）
    let systemLanguageInstruction = '';
    if (language === 'zh' || language === 'zh-TW' || language === 'zh-CN') {
      systemLanguageInstruction = '請用繁體中文回答。';
    } else if (language === 'en') {
      systemLanguageInstruction = 'Please answer in English only.';
    } else if (language === 'ja') {
      systemLanguageInstruction = '日本語でのみ回答してください。';
    } else {
      // 預設英文
      systemLanguageInstruction = 'Please answer in English only.';
    }

    // ✅ 4. 根據 language 動態生成題目標籤（不寫死任何語言）
    const getQuestionLabel = (lang: string): string => {
      if (lang === 'zh' || lang === 'zh-TW' || lang === 'zh-CN') {
        return '題目：';
      } else if (lang === 'ja') {
        return '質問：';
      } else {
        return 'Question: ';
      }
    };

    // ✅ 5. 組合 user prompt（不包含語言指令，語言指令放在 systemInstruction）
    const userPrompt = `${modeInstruction}\n\n${getQuestionLabel(language)}${prompt}`;

    // ✅ 6. 呼叫 Gemini API，語言指令放在 systemInstruction（system role）
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemLanguageInstruction }],
          },
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
        JSON.stringify({ error: "Gemini API 連線失敗" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await geminiRes.json();

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

    const outputLength = text.trim().length;
    const usedPoints = inputLength + outputLength;

    // ✅ 正式扣點（使用 consume_credits RPC，統一格式）
    let remainingChars: number | undefined;
    
    if (userId && supabase) {
      try {
        console.log('[HOMEWORK][CREDITS] before rpc', {
          userId,
          inputChars: inputLength,
          outputChars: outputLength,
          usedPoints,
        });
        
        const { data: creditResult, error: creditError } = await supabase.rpc("consume_credits", {
          p_user_id: userId,
          p_chars: usedPoints,
        });
        
        console.log('[HOMEWORK][CREDITS] after rpc', { data: creditResult, error: creditError });

        if (creditError) {
          console.error("[HOMEWORK] consume_credits error", creditError);
          return new Response(
            JSON.stringify({ result: "點數不足或扣點失敗" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        remainingChars = creditResult?.[0]?.remaining_chars;
      } catch (deductError: any) {
        console.error("❌ [HOMEWORK] 扣點時發生錯誤：", deductError);
        return new Response(
          JSON.stringify({ 
            result: "點數不足或扣點失敗",
            error: deductError.message || "扣點失敗"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // ✅ 回傳結果，包含剩餘點數
    const response: any = {
      result: text.trim(),
      used_points: usedPoints,
      remaining_chars: remainingChars,
      is_guest: isGuest,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("❌ 伺服器捕獲的未預期錯誤:", err);
    return new Response(
      JSON.stringify({ error: err.message || "未知錯誤" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

