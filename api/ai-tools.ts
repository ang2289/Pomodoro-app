// AI 工具統一 API（合併 summary、ai、homework）
// 使用 req.body.action 判斷要執行哪個功能

import { createClient } from '@supabase/supabase-js'
// import type { VercelRequest, VercelResponse } from '@vercel/node'

// ===== Gemini API 配置 =====
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ===== 最小可回應版本（加上 Gemini API 錯誤診斷）=====

export default async function handler(req: any, res: any) {
  // 如果沒有 action 或不是 summary，返回基本回應
  if (!req.body?.action || req.body.action !== 'summary') {
    return res.status(200).json({
      ok: true,
      step: 'FUNCTION_ALIVE',
      body: req.body
    })
  }

  // 診斷用：直接呼叫 Gemini API 並加上完整錯誤處理
  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    console.log('[ENV CHECK]', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    });
    if (!GEMINI_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY_MISSING",
        message: "GEMINI_API_KEY environment variable is not set"
      })
    }

    const { content, title, userId } = req.body;
    if (!content) {
      return res.status(400).json({
        error: "CONTENT_MISSING",
        message: "content is required"
      })
    }

    // ✅ 使用與 Edge Function 相同的 SYSTEM_PROMPT 和 JSON Schema
    const SYSTEM_PROMPT = `
Analyze the provided article content.
Ensure the output language matches the article language.

You must complete ALL tasks below:

1. Generate a concise summary (summary) of about 50 words.
2. Extract 5 core keywords (keywords). Each must be a short noun phrase.
3. Generate 5 traffic-oriented SEO search queries (traffic_keywords):
   - They must look like real Google searches
   - Question-style or intent-based
   - Avoid repeated structure

Respond ONLY in valid JSON. No explanation text.
`;

    const RESPONSE_SCHEMA = {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" },
        keywords: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        traffic_keywords: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
      required: ["summary", "keywords", "traffic_keywords"],
      propertyOrdering: ["summary", "keywords", "traffic_keywords"],
    };

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nArticle Content:\n${content}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.35,
      },
    };

    // ✅ 1️⃣ 如果 res.ok === false：完整錯誤輸出
    const geminiRes = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!geminiRes.ok) {
      const responseText = await geminiRes.text();
      return res.status(500).json({
        error: "GEMINI_API_FAILED",
        status: geminiRes.status,
        responseText: responseText,
        model: GEMINI_MODEL
      })
    }

    const data = await geminiRes.json();
    
    // ✅ 解析 Gemini 回應，提取結構化 JSON
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      return res.status(200).json({
        ok: true,
        step: 'GEMINI_SUCCESS_EMPTY',
        summary: "",
        result: "",
        keywords: [],
        traffic_keywords: [],
        data: data
      })
    }
    
    // 解析 JSON
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
      console.log('[API] Parsed JSON keys:', Object.keys(parsed));
      console.log('[API] Parsed JSON summary exists?', !!parsed.summary);
      console.log('[API] Parsed JSON keywords exists?', !!parsed.keywords);
      console.log('[API] Parsed JSON traffic_keywords exists?', !!parsed.traffic_keywords);
      console.log('[API] Parsed JSON:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('[API] JSON parse error:', e);
      return res.status(200).json({
        ok: true,
        step: 'GEMINI_SUCCESS_PARSE_ERROR',
        summary: rawText, // 如果解析失敗，至少回傳原始文字
        result: rawText,
        keywords: [],
        traffic_keywords: [],
        parseError: e instanceof Error ? e.message : String(e),
        rawText: rawText.substring(0, 200)
      })
    }
    
    // ✅ 計算字數
    const inputChars = content.length;
    const outputChars = (parsed.summary ?? "").length;
    const totalChars = inputChars + outputChars;

    // ✅ 如果是登入用戶，執行扣點
    let remainingChars: number | undefined;
    if (userId) {
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          // 呼叫 consume_credits RPC
          const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_credits', {
            p_user_id: userId,
            p_feature: 'summary',
            p_input_chars: inputChars,
            p_output_chars: outputChars,
          });

          if (consumeError) {
            console.error('[API] Credit deduction failed:', consumeError);
            
            // 點數不足錯誤
            if (consumeError.message.includes('insufficient_credits') || consumeError.code === 'P0001') {
              // 取得目前剩餘點數
              const { data: currentData } = await supabase
                .from('user_credits')
                .select('remaining_chars')
                .eq('user_id', userId)
                .single();
              
              const remaining = currentData?.remaining_chars || 0;
              
              return res.status(403).json({
                ok: false,
                error: "INSUFFICIENT_CREDITS",
                code: "CREDITS_NOT_ENOUGH",
                message: "點數不足，請先購買點數",
                remainingChars: remaining,
                requested: totalChars,
              });
            }
            
            // 其他扣點錯誤，但不阻擋回應（記錄錯誤但仍回傳摘要）
            console.warn('[API] Credit deduction error (non-blocking):', consumeError);
          } else {
            // 扣點成功
            if (Array.isArray(consumeResult) && consumeResult.length > 0) {
              remainingChars = consumeResult[0].remaining_chars;
            } else if (consumeResult && typeof consumeResult === 'object') {
              remainingChars = consumeResult.remaining_chars;
            }
            console.log('[API] Credit deduction successful, remaining:', remainingChars);
          }
        } else {
          console.warn('[API] Supabase credentials not configured, skipping credit deduction');
        }
      } catch (deductError: any) {
        // 扣點錯誤不阻擋回應，只記錄
        console.error('[API] Credit deduction error (non-blocking):', deductError);
      }
    }

    // ✅ 回傳與 Edge Function 相同的結構
    const response: any = {
      ok: true,
      step: 'GEMINI_SUCCESS',
      title: title || "AI Summary",
      summary: parsed.summary ?? "",
      result: parsed.summary ?? "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
      traffic_keywords: Array.isArray(parsed.traffic_keywords) ? parsed.traffic_keywords.slice(0, 5) : [],
      modelUsed: GEMINI_MODEL,
      status: "success"
    };
    
    // 如果有剩餘點數，加入回應
    if (typeof remainingChars === 'number') {
      response.balance = remainingChars;
      response.remaining_chars = remainingChars;
    }
    
    console.log('[API] Final response keys:', Object.keys(response));
    console.log('[API] Final response keywords:', response.keywords);
    console.log('[API] Final response traffic_keywords:', response.traffic_keywords);
    console.log('[API] Final response remaining_chars:', response.remaining_chars);
    
    return res.status(200).json(response)

  } catch (err: any) {
    // ✅ 2️⃣ 如果 fetch throw error：完整錯誤輸出
    return res.status(500).json({
      error: "FETCH_THROW",
      message: err.message,
      stack: err.stack
    })
  }
}
