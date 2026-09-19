// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, visibility",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * ✅ 不再鎖定 preview（preview 常下線）
 * 依序嘗試：2.0 flash → 1.5 flash（可自行加）
 */
const GEMINI_MODELS = ["gemini-2.6-flash"];

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
 * ⚠️ responseSchema / responseMimeType 在某些模型/版本可能 400
 * 所以：先帶 schema 試；若失敗再「移除 schema」重試（同一模型）
 */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    keywords: { type: "ARRAY", items: { type: "STRING" } },
    traffic_keywords: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["summary", "keywords", "traffic_keywords"],
  propertyOrdering: ["summary", "keywords", "traffic_keywords"],
};

function pickGeminiKey(): string | null {
  // ✅ Edge Secrets 常見命名都支援（你畫面有 GEMINI_API_KEY）
  return (
    Deno.env.get("GEMINI_API_KEY") ||
    Deno.env.get("GEMINI_API_KEY_SUMMARY") ||
    Deno.env.get("VITE_GEMINI_API_KEY") ||
    Deno.env.get("VITE_GEMINI_API_KEY_SUMMARY") ||
    null
  );
}

async function callGemini(model: string, apiKey: string, payload: any) {
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  return { res, status: res.status, text, json };
}

function safeParseAiJson(rawText: string) {
  try {
    return { ok: true, value: JSON.parse(rawText) };
  } catch {
    return { ok: false, value: null };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!serviceRoleKey || bearer !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: "FORBIDDEN" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const internalUserId = body?.internalUserId;
    if (
      typeof internalUserId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(internalUserId)
    ) {
      return new Response(JSON.stringify({ error: "INVALID_INTERNAL_USER" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const content = (body?.content || "").toString();
    const title = (body?.title || "AI Summary").toString();

    if (!content.trim()) {
      return new Response(JSON.stringify({ error: "Missing content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = pickGeminiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY not set",
          hint: "請到 Supabase Dashboard → Edge Functions → Secrets 設定 GEMINI_API_KEY",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ 先用 schema 版本的 payload
    const payloadWithSchema = {
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

    // ✅ 移除 schema 的備援 payload（避免 400）
    const payloadNoSchema = {
      contents: payloadWithSchema.contents,
      generationConfig: {
        temperature: 0.35,
      },
    };

    const attempts: any[] = [];

    // 依序嘗試 model；每個 model：先帶 schema → 不行再不帶 schema
    for (const model of GEMINI_MODELS) {
      // A) with schema
      const a = await callGemini(model, apiKey, payloadWithSchema);
      attempts.push({
        model,
        variant: "with_schema",
        status: a.status,
        body: a.text,
      });

      if (a.res.ok) {
        const rawText = a.json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = safeParseAiJson(rawText);
          if (parsed.ok) {
            const ai = parsed.value || {};
            const summaryText = (ai.summary ?? "").toString();

            return new Response(
              JSON.stringify({
                title,
                summary: summaryText,
                result: summaryText,
                keywords: Array.isArray(ai.keywords) ? ai.keywords.slice(0, 5) : [],
                traffic_keywords: Array.isArray(ai.traffic_keywords)
                  ? ai.traffic_keywords.slice(0, 5)
                  : [],
                model_used: model,
                status: "success",
                attempts,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            // schema 成功但模型回傳不是 JSON：改走 no-schema 重試，或下一個 model
          }
        }
      }

      // B) no schema
      const b = await callGemini(model, apiKey, payloadNoSchema);
      attempts.push({
        model,
        variant: "no_schema",
        status: b.status,
        body: b.text,
      });

      if (b.res.ok) {
        // no-schema 時，通常回傳是純文字；我們仍要求 JSON，所以取 candidates text 再 JSON.parse
        const rawText = b.json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = safeParseAiJson(rawText);
          if (parsed.ok) {
            const ai = parsed.value || {};
            const summaryText = (ai.summary ?? "").toString();

            return new Response(
              JSON.stringify({
                title,
                summary: summaryText,
                result: summaryText,
                keywords: Array.isArray(ai.keywords) ? ai.keywords.slice(0, 5) : [],
                traffic_keywords: Array.isArray(ai.traffic_keywords)
                  ? ai.traffic_keywords.slice(0, 5)
                  : [],
                model_used: model,
                status: "success",
                attempts,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            // 如果模型回傳「非 JSON」，就把原文透出，方便你 debug / 也不至於 500
            return new Response(
              JSON.stringify({
                error: "Invalid AI JSON response",
                title,
                model_tried: model,
                raw: rawText,
                attempts,
              }),
              { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // 全部失敗：回傳最後一次錯誤（含 attempts）
    return new Response(
      JSON.stringify({
        error: "Gemini API failed",
        model_tried: GEMINI_MODELS,
        attempts,
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
