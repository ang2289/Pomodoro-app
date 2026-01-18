// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, visibility",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ⚠️ 原樣保留（不換 preview）
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

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
          parts: [{ text: `${SYSTEM_PROMPT}\n\nArticle Content:\n${content}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.35,
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

    // 🔒 MINIMAL GUARD ①：避免 Gemini 回錯直接炸
    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({
          error: "Gemini API error",
          detail: errText,
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // 🔒 防止 Gemini 回傳空結構時直接丟 500
    if (!rawText) {
      return new Response(
        JSON.stringify({
          title,
          summary: "",
          result: "",
          keywords: [],
          traffic_keywords: [],
          modelUsed: GEMINI_MODEL,
          status: "empty"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // 🔒 MINIMAL GUARD ②：JSON parse 防護
    let ai: any;
    try {
      ai = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid AI JSON response",
          raw: rawText,
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const summaryText = ai.summary ?? "";

    return new Response(
      JSON.stringify({
        title,
        summary: summaryText,
        result: summaryText,
        keywords: Array.isArray(ai.keywords) ? ai.keywords.slice(0, 5) : [],
        traffic_keywords: Array.isArray(ai.traffic_keywords)
          ? ai.traffic_keywords.slice(0, 5)
          : [],
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
    // 🔒 MINIMAL GUARD ③：確保不再 FUNCTION_INVOCATION_FAILED
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
