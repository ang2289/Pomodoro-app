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

    // ✅ 1. 從 request headers 讀取 Authorization
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    let isGuest = true;

    // 取得 Supabase 客戶端（用於驗證 token）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (authHeader && supabaseUrl && supabaseServiceKey) {
      try {
        // 建立 Supabase client（使用 anon key 來驗證 token）
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");
        if (supabaseAnonKey) {
          const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
              headers: {
                Authorization: authHeader,
              },
            },
          });

          // 驗證 token 並取得使用者資訊
          const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
          
          if (!authError && user) {
            userId = user.id;
            isGuest = false;
            console.log(`✅ [認證成功] user_id=${userId}`);
          } else {
            console.log(`⚠️ [認證失敗] 視為訪客模式`, authError);
          }
        }
      } catch (err) {
        console.log(`⚠️ [認證錯誤] 視為訪客模式`, err);
      }
    }

    // ✅ 2. 解析請求 body
    const { 
      prompt, 
      mode = 'answer', 
      language = 'zh'
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

    // ✅ 3. 計算實際使用字數
    const inputChars = prompt.trim().length;
    const outputChars = resultText.length;
    const totalUsedPoints = inputChars + outputChars;

    // ✅ 4. 根據使用者狀態執行扣點邏輯
    if (isGuest) {
      // 🔓 訪客模式：不寫入資料庫，僅回傳使用點數
      console.log(`🔓 [訪客模式] 不寫入資料庫，使用點數=${totalUsedPoints}`);
      
      return new Response(
        JSON.stringify({
          result: resultText,
          guest_used_points: totalUsedPoints,
          is_guest: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // 🔒 登入使用者：執行正式扣點邏輯
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Supabase credentials 未設定");
        return new Response(
          JSON.stringify({ error: "伺服器設定錯誤" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      try {
        // 🔒 步驟 1：查詢使用者點數
        const { data: creditData, error: creditError } = await supabase
          .from('user_credits')
          .select('remaining_chars, total_credits, used_credits')
          .eq('user_id', userId)
          .single();

        if (creditError) {
          // 如果記錄不存在，嘗試初始化
          if (creditError.code === 'PGRST116') {
            console.log(`🆕 [初始化點數] user_id=${userId}`);
            const { error: initError } = await supabase
              .from('user_credits')
              .insert({
                user_id: userId,
                total_credits: 10000,
                used_credits: 0,
                remaining_chars: 10000,
              });

            if (initError) {
              console.error("❌ 初始化點數失敗：", initError);
              return new Response(
                JSON.stringify({ error: "初始化點數失敗" }),
                {
                  status: 500,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }

            // 重新查詢
            const { data: retryData } = await supabase
              .from('user_credits')
              .select('remaining_chars, total_credits, used_credits')
              .eq('user_id', userId)
              .single();

            if (!retryData || retryData.remaining_chars <= 0) {
              return new Response(
                JSON.stringify({ error: "點數不足，請購買" }),
                {
                  status: 400,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }
          } else {
            console.error("❌ 查詢點數失敗：", creditError);
            return new Response(
              JSON.stringify({ error: "查詢點數失敗" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } else {
          // 🔒 步驟 2：檢查點數是否足夠
          if (!creditData || creditData.remaining_chars <= 0) {
            return new Response(
              JSON.stringify({ error: "點數不足，請購買" }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          // 🔒 步驟 3：檢查扣點後是否會超過總額
          if (creditData.remaining_chars < totalUsedPoints) {
            return new Response(
              JSON.stringify({ error: "點數不足，請購買" }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }

        // 🔒 步驟 4：成功產生 AI 回答後，執行扣點
        // 重新查詢以確保取得最新資料
        const { data: currentCreditData, error: lockError } = await supabase
          .from('user_credits')
          .select('remaining_chars, total_credits, used_credits')
          .eq('user_id', userId)
          .single();

        if (lockError || !currentCreditData) {
          console.error("❌ 查詢點數記錄失敗：", lockError);
          return new Response(
            JSON.stringify({ error: "扣點失敗：無法查詢點數記錄" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 再次檢查點數是否足夠（防止在 AI 處理期間點數被其他請求扣除）
        if (currentCreditData.remaining_chars < totalUsedPoints) {
          return new Response(
            JSON.stringify({ error: "點數不足，請購買" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 計算新的已使用點數和剩餘點數
        const currentUsed = currentCreditData.used_credits || 0;
        const currentTotal = currentCreditData.total_credits || 10000;
        const newUsed = currentUsed + totalUsedPoints;
        const newRemaining = currentTotal - newUsed;

        // 更新資料庫：used_credits += 扣點，remaining_chars = total_credits - used_credits
        // 注意：remaining_chars 會由觸發器自動同步，但這裡也明確設定以確保一致性
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            used_credits: newUsed,
            remaining_chars: newRemaining,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error("❌ 扣點失敗：", updateError);
          return new Response(
            JSON.stringify({ error: "扣點失敗" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // ✅ 扣點成功，記錄使用紀錄（非同步）
        supabase.from('usage_logs').insert({
          user_id: userId,
          used_chars: totalUsedPoints,
          service_type: 'homework',
          content_preview: prompt.substring(0, 100), // 只記錄前 100 字
        }).catch((err) => {
          console.error("❌ 記錄使用紀錄失敗：", err);
          // 記錄失敗不影響主流程，但記錄錯誤
        });

        console.log(`✅ [扣點成功] user_id=${userId}, totalUsedPoints=${totalUsedPoints}, remaining=${newRemaining}`);

        // ✅ 成功回傳結果
        return new Response(
          JSON.stringify({
            result: resultText,
            is_guest: false,
            used_points: totalUsedPoints,
            remaining_chars: newRemaining,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );

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
    }
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

