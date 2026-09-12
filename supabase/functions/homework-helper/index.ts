import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * homework-helper Edge Function (Supabase / Deno)
 * 目標：
 * - 不簡化既有功能：mode / language / userId / 點數預檢 / consume_credits 扣點 / 回傳 remaining_chars
 * - 修正 Gemini 502：改用穩定 v1 REST endpoint，避免 systemInstruction 與 v1beta 相容性問題
 * - 錯誤回傳更可讀（可選 debug=true 取得 attempts）
 */

// ✅ CORS
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

// ✅ Gemini endpoint：使用 v1（穩定）
// 注意：不要用 systemInstruction；語氣/語言指令合併進 userPrompt
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1/models";

// ✅ 多模型 fallback（第一個成功就用）
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-pro",
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeLang(lang: string): "zh" | "en" | "ja" {
  const l = (lang || "").toLowerCase();
  if (l === "zh" || l === "zh-tw" || l === "zh-cn") return "zh";
  if (l === "ja" || l === "jp") return "ja";
  return "en";
}

function getModeInstruction(mode: string, lang: "zh" | "en" | "ja"): string {
  const modeMap: Record<string, Record<"zh" | "en" | "ja", string>> = {
    answer: {
      zh: "請直接給出這個問題的答案，簡潔明瞭。只需要答案，不需要解釋過程。",
      en: "Please provide a direct answer, concise and clear. Only the answer is needed, no steps.",
      ja: "この質問に対する答えを簡潔に示してください。答えのみで、説明は不要です。",
    },
    easy: {
      zh: "請用兒童可以理解的方式，用非常白話的語氣回答。避免專業術語，必要時用比喻說明。",
      en: "Answer in very simple language a child can understand. Avoid technical terms; use analogies if needed.",
      ja: "子供にも分かるように、とても平易な言葉で答えてください。専門用語は避け、必要なら比喩を使ってください。",
    },
    pro: {
      zh: "請用專業且有條理的方式，分段逐步說明解題過程與答案。",
      en: "Explain step-by-step in a professional, logical way and provide the final answer.",
      ja: "専門的で論理的に、段階的に解法を説明し、最後に答えを示してください。",
    },
    example: {
      zh: "先給答案，再用生活中的具體例子說明，讓學生更容易理解。",
      en: "Give the answer first, then explain with concrete everyday examples.",
      ja: "まず答えを示し、その後に日常の具体例で説明してください。",
    },
    // 向後相容
    answerOnly: {
      zh: "請直接給出這個問題的答案，簡潔明瞭。只需要答案，不需要解釋過程。",
      en: "Please provide a direct answer, concise and clear. Only the answer is needed, no steps.",
      ja: "この質問に対する答えを簡潔に示してください。答えのみで、説明は不要です。",
    },
    simple: {
      zh: "請用兒童可以理解的方式，用非常白話的語氣回答。避免專業術語，必要時用比喻說明。",
      en: "Answer in very simple language a child can understand. Avoid technical terms; use analogies if needed.",
      ja: "子供にも分かるように、とても平易な言葉で答えてください。専門用語は避け、必要なら比喩を使ってください。",
    },
    detailed: {
      zh: "請用專業且有條理的方式，分段逐步說明解題過程與答案。",
      en: "Explain step-by-step in a professional, logical way and provide the final answer.",
      ja: "専門的で論理的に、段階的に解法を説明し、最後に答えを示してください。",
    },
    examples: {
      zh: "先給答案，再用生活中的具體例子說明，讓學生更容易理解。",
      en: "Give the answer first, then explain with concrete everyday examples.",
      ja: "まず答えを示し、その後に日常の具体例で説明してください。",
    },
    kid: {
      zh: "請用兒童可以理解的方式，用非常白話的語氣回答。避免專業術語，必要時用比喻說明。",
      en: "Answer in very simple language a child can understand. Avoid technical terms; use analogies if needed.",
      ja: "子供にも分かるように、とても平易な言葉で答えてください。専門用語は避け、必要なら比喩を使ってください。",
    },
  };

  return modeMap[mode]?.[lang] || modeMap["answer"]?.[lang] || modeMap["answer"]["en"];
}

function getLanguageInstruction(lang: "zh" | "en" | "ja"): string {
  if (lang === "zh") return "請用繁體中文回答。";
  if (lang === "ja") return "日本語でのみ回答してください。";
  return "Please answer in English only.";
}

function getQuestionLabel(lang: "zh" | "en" | "ja"): string {
  if (lang === "zh") return "題目：";
  if (lang === "ja") return "質問：";
  return "Question: ";
}

async function callGeminiWithFallback(opts: {
  apiKey: string;
  userPrompt: string;
  debug?: boolean;
}) {
  const attempts: Array<{ model: string; status: number; body: string }> = [];

  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${opts.apiKey}`;
    const payload = {
      // ✅ 最穩定格式（v1）：不要 systemInstruction
      contents: [{ parts: [{ text: opts.userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        candidateCount: 1,
        // 保守上限，避免爆點數
        maxOutputTokens: 2048,
      },
    };

    let res: Response | null = null;
    let text = "";
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      text = await res.text();
      attempts.push({ model, status: res.status, body: text.slice(0, 2000) });

      if (!res.ok) {
        // 失敗就換下一個 model
        continue;
      }

      // 解析 JSON
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        // 非 JSON 也當失敗
        continue;
      }

      const out =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.output;

      if (typeof out === "string" && out.trim().length > 0) {
        return { ok: true as const, model, text: out.trim(), attempts };
      }
      // 空回應，繼續 fallback
    } catch (e) {
      attempts.push({ model, status: 0, body: String(e).slice(0, 2000) });
      continue;
    }
  }

  return { ok: false as const, attempts };
}

serve(async (req: Request) => {
  // ✅ OPTIONS preflight：必須最先處理
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({} as any));

    const prompt = body?.prompt;
    const mode = body?.mode ?? "answer";
    const languageRaw = body?.language ?? "zh";
    const userId = body?.internalUserId;
    const debug = false;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return jsonResponse({ error: "缺少題目內容（prompt）" }, 400);
    }

    // ✅ 讀取 Gemini API Key（依你目前 Secrets 命名兼容）
    const apiKey =
      Deno.env.get("VITE_GEMINI_API_KEY_HOMEWORK") ||
      Deno.env.get("GEMINI_API_KEY_HOMEWORK") ||
      Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("❌ Gemini API Key 未設定（請在 Edge Functions > Secrets 設定 GEMINI_API_KEY_HOMEWORK 或 GEMINI_API_KEY）");
      return jsonResponse({ error: "Gemini API Key 未設定" }, 500);
    }

    // ✅ Supabase service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const validInternalUser = typeof userId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
    if (!supabaseServiceKey || bearer !== supabaseServiceKey || !validInternalUser) {
      return jsonResponse({ error: "FORBIDDEN" }, 403);
    }

    let supabase: any = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.error("[HOMEWORK][ENV ERROR]", {
        supabaseUrlExists: !!supabaseUrl,
        serviceRoleKeyExists: !!supabaseServiceKey,
      });
    }

    // ✅ 點數預檢（不改你原本策略：預估輸出=輸入50%）
    const inputLength = prompt.trim().length;

    if (supabase) {
      const estimatedOutputChars = Math.ceil(inputLength * 0.5);
      const estimatedTotalChars = inputLength + estimatedOutputChars;

      const { data: creditData, error: creditError } = await supabase
        .from("user_credits")
        .select("remaining_chars")
        .eq("user_id", userId)
        .single();

      if (creditError) {
        console.error("[HOMEWORK][CREDITS] precheck error", creditError);
        // 這裡不直接當點數不足，因為可能是 RLS/表不存在/連線等
        // 但仍可繼續讓 Gemini 回答？依你原本行為：有 userId 就要扣點，所以這裡直接擋更安全
        return jsonResponse({ error: "CREDITS_PRECHECK_FAILED" }, 500);
      }

      const currentRemaining = creditData?.remaining_chars ?? 0;
      if (currentRemaining < estimatedTotalChars) {
        return jsonResponse(
          { error: "INSUFFICIENT_CREDITS", message: "點數不足，請先購買點數" },
          403,
        );
      }
    }

    // ✅ 組 prompt（把 systemInstruction 內容合併進 userPrompt，避免 Gemini REST 不相容）
    const lang = normalizeLang(languageRaw);
    const modeInstruction = getModeInstruction(String(mode), lang);
    const languageInstruction = getLanguageInstruction(lang);
    const qLabel = getQuestionLabel(lang);

    const userPrompt =
      `${languageInstruction}\n` +
      `${modeInstruction}\n\n` +
      `${qLabel}${prompt.trim()}`;

    // ✅ 呼叫 Gemini（多模型 fallback）
    const geminiCall = await callGeminiWithFallback({ apiKey, userPrompt, debug });

    if (!geminiCall.ok) {
      console.error("❌ Gemini API 全部模型失敗", geminiCall.attempts);
      return jsonResponse(
        {
          error: "GEMINI_API_FAILED",
          model_tried: GEMINI_MODELS,
          attempts: debug ? geminiCall.attempts : undefined,
        },
        502,
      );
    }

    const text = geminiCall.text;

    // ✅ 扣點
    const outputLength = text.trim().length;
    const usedPoints = inputLength + outputLength;

    let remainingChars: number | undefined;

    if (supabase) {
      try {
        const { data: consumeResult, error: consumeError } = await supabase.rpc("consume_credits", {
          p_user_id: userId,
          p_feature: "homework",
          p_input_chars: inputLength,
          p_output_chars: outputLength,
        });

        if (consumeError) {
          console.error("[HOMEWORK] consume_credits error", consumeError);
          return jsonResponse(
            { result: "點數不足或扣點失敗", remaining_chars: null },
            403,
          );
        }

        const row = Array.isArray(consumeResult) ? consumeResult[0] : (consumeResult as any);
        remainingChars = row?.after_remaining ?? row?.remaining_chars;
      } catch (e) {
        console.error("❌ [HOMEWORK] 扣點時發生錯誤：", e);
        return jsonResponse(
          { result: "點數不足或扣點失敗", remaining_chars: null },
          403,
        );
      }
    }

    const response: any = {
      result: text.trim(),
      used_points: usedPoints,
      remaining_chars: remainingChars,
      is_guest: false,
      model_used: geminiCall.model,
    };
    if (typeof remainingChars === "number") response.balance = remainingChars;
    if (debug) response.attempts = geminiCall.attempts;

    return jsonResponse(response, 200);
  } catch (err: any) {
    console.error("❌ 伺服器捕獲的未預期錯誤:", err);
    return jsonResponse({ error: err?.message || "未知錯誤" }, 500);
  }
});
