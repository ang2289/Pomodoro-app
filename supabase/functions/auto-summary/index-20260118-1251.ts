// deno-lint-ignore-file no-explicit-any
// ============================================
// Edge Function：auto-summary
// ============================================
// ⚠️ 重要：此 Edge Function 僅負責 AI 功能
// 
// 功能：
//   - 接收文字內容
//   - 呼叫 Gemini API 產生摘要、關鍵字、流量關鍵字
//   - 回傳 AI 結果
//
// 禁止事項：
//   ❌ 不得包含任何扣點邏輯
//   ❌ 不得寫入 user_credits 表
//   ❌ 不得更新使用量
//   ❌ 不得呼叫 consume_credits 相關 RPC
//
// 扣點邏輯：
//   ✅ 扣點應在前端完成（使用 consume_user_credits RPC）
//   ✅ Edge Function 只負責 AI，不負責扣點
// ============================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, visibility",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 沿用您要求的 2.5 預覽版模型名稱
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * ✅ System Prompt（僅保留 1.摘要 2.關鍵字 3.流量關鍵字）
 */
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

/**
 * ✅ Response Schema（移除 high_intent_content 相關定義）
 */
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
  // 必須確保這三個欄位都存在
  required: ["summary", "keywords", "traffic_keywords"],
  propertyOrdering: [
    "summary",
    "keywords",
    "traffic_keywords",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const content = body.content || "";
    const title = body.title || "AI Summary";

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) {
      throw new Error("GEMINI_API_KEY not set");
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nArticle Content:\n${content}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.35, // 沿用您原始設定的隨機度
      },
    };

    const res = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty Gemini response");

    const ai = JSON.parse(rawText);

    // 統一欄位名稱：同時包含 summary 和 result 以確保前端相容性
    const summaryText = ai.summary ?? "";

    return new Response(
      JSON.stringify({
        title,
        summary: summaryText, // 對應摘要結果
        result: summaryText, // 與前端 result 顯示需求對齊
        keywords: Array.isArray(ai.keywords)
          ? ai.keywords.slice(0, 5)
          : [],
        traffic_keywords: Array.isArray(ai.traffic_keywords)
          ? ai.traffic_keywords.slice(0, 5)
          : [], // 對應流量關鍵字
        modelUsed: GEMINI_MODEL,
        status: "success",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error('SUMMARY API ERROR', err);
    return new Response(
      JSON.stringify({ 
        error: 'SUMMARY_FAILED',
        message: err?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});