// functions/v1/homework-helper.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MODEL = "gemini-pro";

serve(async (req) => {
  try {
    const { question } = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY 未設定" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!question) {
      return new Response(JSON.stringify({ error: "缺少題目內容 question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompts = {
      simple: `你是一位國小老師，請用完全生活化的小學生語氣解釋這題：\n「${question}」\n禁止使用專業詞彙，請用故事＋比喻說明。`,
      normal: `請用「一般白話 + 簡單公式」解釋這題：\n「${question}」\n適合一般學生理解。`,
      pro: `你是一位家教老師，請用「完整推導 + 公式 + 單位檢查」解題：\n「${question}」\n請分段寫出解題過程。`,
    };

    async function askGemini(prompt: string) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Gemini API 錯誤：", data);
        return `❌ Gemini API 錯誤：${data.error?.message || "未知錯誤"}`;
      }

      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "（AI 無回覆）";
    }

    const [simple, normal, pro] = await Promise.all([
      askGemini(prompts.simple),
      askGemini(prompts.normal),
      askGemini(prompts.pro),
    ]);

    return new Response(JSON.stringify({ simple, normal, pro }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Edge Function 錯誤：", err);
    return new Response(JSON.stringify({ error: "伺服器錯誤" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});





