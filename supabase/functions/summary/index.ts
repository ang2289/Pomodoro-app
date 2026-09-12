import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function parseStructuredText(raw: string) {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned);
  const summary = String(parsed?.summary || "").trim();
  if (!summary) throw new Error("INVALID_AI_RESPONSE");
  return {
    summary,
    keywords: Array.isArray(parsed?.keywords) ? parsed.keywords.map(String).slice(0, 5) : [],
    traffic_keywords: Array.isArray(parsed?.traffic_keywords)
      ? parsed.traffic_keywords.map(String).slice(0, 5)
      : [],
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY_SUMMARY") || Deno.env.get("GEMINI_API_KEY");
    if (!supabaseUrl || !serviceRoleKey || !geminiKey) return json({ error: "SERVER_NOT_CONFIGURED" }, 500);

    const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!bearer || bearer !== serviceRoleKey) return json({ error: "FORBIDDEN" }, 403);

    const body = await req.json().catch(() => ({}));
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const internalUserId = body?.internalUserId;
    const lang = body?.lang === "en" ? "en" : "zh-TW";
    if (!isUuid(internalUserId)) return json({ error: "INVALID_INTERNAL_USER" }, 403);
    if (!content || content.length > 20_000) return json({ error: "INVALID_CONTENT" }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const estimated = content.length + Math.ceil(content.length * 0.15);
    const { data: credits, error: creditError } = await supabase
      .from("user_credits")
      .select("remaining_chars")
      .eq("user_id", internalUserId)
      .single();
    if (creditError) return json({ error: "CREDITS_PRECHECK_FAILED" }, 500);
    if (Number(credits?.remaining_chars || 0) < estimated) return json({ error: "INSUFFICIENT_CREDITS" }, 403);

    const languageRule = lang === "en" ? "Use English." : "使用自然的台灣繁體中文。";
    const prompt = `${languageRule}\n請根據文章輸出有效 JSON，不要 Markdown。欄位必須為 summary、keywords、traffic_keywords。summary 約 200 至 300 字；keywords 與 traffic_keywords 各 5 筆。\n\n文章：\n${content}`;
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    if (!geminiResponse.ok) return json({ error: "GEMINI_API_FAILED" }, 502);
    const geminiData = await geminiResponse.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof raw !== "string" || !raw.trim()) return json({ error: "EMPTY_AI_RESPONSE" }, 502);
    const result = parseStructuredText(raw);

    const outputChars = result.summary.length + result.keywords.join("").length + result.traffic_keywords.join("").length;
    const { data: consumed, error: consumeError } = await supabase.rpc("consume_credits", {
      p_user_id: internalUserId,
      p_input_chars: content.length,
      p_output_chars: outputChars,
      p_feature: "summary",
    });
    if (consumeError) {
      const insufficient = /insufficient/i.test(consumeError.message || "");
      return json({ error: insufficient ? "INSUFFICIENT_CREDITS" : "CREDIT_DEBIT_FAILED" }, insufficient ? 403 : 500);
    }
    const row = Array.isArray(consumed) ? consumed[0] : consumed;
    const remainingChars = row?.remaining_chars ?? row?.after_remaining;
    return json({
      ...result,
      result: result.summary,
      usage_chars: content.length + outputChars,
      remaining_chars: remainingChars,
      balance: remainingChars,
    });
  } catch (error) {
    console.error("SUMMARY_INTERNAL_ERROR", error instanceof Error ? error.message : "unknown");
    return json({ error: "INTERNAL_ERROR" }, 500);
  }
});
