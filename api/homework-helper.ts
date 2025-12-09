import type { VercelRequest, VercelResponse } from "@vercel/node";

const MODEL = "gemini-pro"; // ✅ 改為穩定模型

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY_HOMEWORK;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY 未設定" });
    }

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "缺少題目 question" });
    }

    const prompts = {
      simple: `
你是一位國小老師，請用完全生活化的小學生語氣解釋這題：

「${question}」

禁止使用專業詞彙，請用故事＋比喻說明。`,

      normal: `
請用「一般白話 + 簡單公式」解釋這題：

「${question}」

適合一般學生理解。`,

      pro: `
你是一位家教老師，請用「完整推導 + 公式 + 單位檢查」解題：

「${question}」

請分段寫出解題過程。`,

    };

    async function askGemini(prompt: string) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Gemini API 錯誤：", data);
        return `❌ Gemini API 錯誤：${data.error?.message || "未知錯誤"}`;
      }

      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "（AI 無回覆）";
    }

    const [simple, normal, pro] = await Promise.all([
      askGemini(prompts.simple),
      askGemini(prompts.normal),
      askGemini(prompts.pro),
    ]);

    return res.status(200).json({ simple, normal, pro });
  } catch (err) {
    console.error("❌ Server 錯誤：", err);
    return res.status(500).json({ error: "伺服器錯誤" });
  }
}
