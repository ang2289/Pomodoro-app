import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ CORS headers 設定（最上方）
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

console.log("✅ Edge Function 'homework-helper' is running...");

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

    // ✅ 1. 解析請求 body，確保有解構 user_id, deduct, totalChars
    const { 
      prompt, 
      mode = 'answer', 
      language = 'zh', 
      deduct = true,
      user_id,
      totalChars
    } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少題目內容" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ 正規化語言參數
    const normalizedLang = (language === 'zh' || language === 'zh-TW' || language === 'zh-CN') ? 'zh' : 
                          (language === 'ja') ? 'ja' : 'en';

    // ✅ 2. 根據 language 生成硬性語言指令
    let languageInstruction = '';
    if (normalizedLang === 'zh') {
      languageInstruction = '請用繁體中文回答。';
    } else if (normalizedLang === 'en') {
      languageInstruction = 'Please answer in English only.';
    } else if (normalizedLang === 'ja') {
      languageInstruction = '日本語でのみ回答してください。';
    } else {
      languageInstruction = 'Please answer in English only.';
    }

    // ✅ 3. 根據 mode 和 language 生成模式指令（統一合併到 systemInstruction）
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

      return modeMap[mode]?.[lang] || modeMap['answer'][lang] || modeMap['answer']['en'];
    };

    const modeInstruction = getModeInstruction(mode, normalizedLang);

    // ✅ 4. 組合 systemInstruction（語言指令 + mode 指令，統一合併）
    // 使用明確的字串連接，避免 template 字串破壞格式
    const systemInstructionText = languageInstruction + '\n\n' + modeInstruction;

    // ✅ 5. user prompt 僅保留純題目文字（移除所有標籤、指令、語言判斷）
    const userPromptText = prompt.trim();

    // ✅ 6. 呼叫 Gemini API，systemInstruction 作為獨立頂層屬性
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userPromptText }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstructionText }],
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

    const resultText = text.trim();

    // ✅ 2. 當 deduct === true 時，執行扣點邏輯
    if (deduct === true) {
      // 驗證必要參數
      if (!user_id || typeof user_id !== 'string') {
        console.error("❌ 扣點失敗：缺少 user_id");
        return new Response(
          JSON.stringify({ error: "扣點失敗：缺少 user_id" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // 取得 Supabase 客戶端
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Supabase credentials 未設定");
        return new Response(
          JSON.stringify({ error: "扣點失敗：伺服器設定錯誤" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 計算實際的 inputChars 和 outputChars
      const inputChars = prompt.trim().length;
      const outputChars = resultText.length;
      // ✅ 使用實際計算的 totalChars（inputChars + outputChars），不使用前端預估值
      const actualTotalChars = inputChars + outputChars;

      try {
        // 🔒 呼叫核心扣點函數（在單一 transaction 中完成扣點和記錄）
        const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_credits', {
          p_user_id: user_id,
          p_feature: 'homework',
          p_input_chars: inputChars,
          p_output_chars: outputChars,
        });

        if (consumeError) {
          console.error("❌ 扣點失敗：", consumeError);
          
          // 點數不足錯誤
          if (consumeError.message.includes('insufficient_credits') || consumeError.code === 'P0001') {
            return new Response(
              JSON.stringify({ error: "INSUFFICIENT_CREDITS" }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          // 其他錯誤：回傳錯誤，不可靜默略過
          return new Response(
            JSON.stringify({ error: consumeError.message || "扣點失敗" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // ✅ 扣點成功，記錄使用紀錄（非同步）
        supabase.from('usage_logs').insert({
          user_id: user_id,
          used_chars: actualTotalChars,
          service_type: 'homework',
          content_preview: prompt.substring(0, 100), // 只記錄前 100 字
        }).catch((err) => {
          console.error("❌ 記錄使用紀錄失敗：", err);
          // 記錄失敗不影響主流程，但記錄錯誤
        });

        console.log(`✅ 扣點成功：user_id=${user_id}, totalChars=${actualTotalChars}`);

      } catch (err: any) {
        console.error("❌ 扣點過程發生錯誤：", err);
        // ✅ 扣點失敗要回傳錯誤，不可靜默略過
        return new Response(
          JSON.stringify({ error: err.message || "扣點過程發生錯誤" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.log(`🔓 跳過扣點：deduct=false, user_id=${user_id || 'N/A'}`);
    }

    // ✅ 成功回傳結果：統一格式 { result: string }
    return new Response(
      JSON.stringify({
        result: resultText,
      }),
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

