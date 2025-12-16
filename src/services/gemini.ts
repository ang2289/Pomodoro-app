// ⚠️ 已停用：禁止前端直接呼叫 Gemini API（成本與金鑰風險）
// 請改用後端 API：/api/homework-helper 或 Supabase Edge Function

// export async function getGeminiAnswer(
//   prompt: string,
//   mode: 'answerOnly' | 'simple' | 'detailed' | 'examples' = 'simple',
//   language: 'zh' | 'en' | 'ja' = 'zh'
// ): Promise<string> {
//   const apiKey = import.meta.env.VITE_GEMINI_API_KEY_HOMEWORK;

//   if (!apiKey) {
//     console.error("❌ VITE_GEMINI_API_KEY_HOMEWORK 尚未設定");
//     throw new Error("缺少 Gemini API 金鑰");
//   }

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

//   // 語言對應
//   const languageMap = {
//     zh: "繁體中文",
//     en: "English",
//     ja: "日本語"
//   };

//   // 根據模式決定風格提示
//   let finalPrompt = prompt;
//   if (mode === 'answerOnly') {
//     finalPrompt = `請直接給我最簡潔明確的答案，不要解釋，不要廢話：${prompt}`;
//   } else if (mode === 'simple') {
//     finalPrompt = `請用國小程度、簡單有趣的方式回答：${prompt}`;
//   } else if (mode === 'detailed') {
//     finalPrompt = `請詳細、邏輯清楚地回答以下問題，適合中學生閱讀：${prompt}`;
//   } else if (mode === 'examples') {
//     finalPrompt = `請用日常生活的例子來幫助解釋：${prompt}`;
//   }

//   // 加入語言指示
//   finalPrompt = `請使用 ${languageMap[language]} 回答：${finalPrompt}`;

//   const body = {
//     contents: [
//       {
//         parts: [{ text: finalPrompt }],
//       },
//     ],
//   };

//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error("❌ Gemini API 回應錯誤", res.status, errorText);
//       throw new Error("Gemini API 錯誤：" + res.status);
//     }

//     const data = await res.json();
//     const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     return answer || "(沒有回答)";
//   } catch (err) {
//     console.error("❌ Gemini API 呼叫失敗", err);
//     throw err;
//   }
// }
// import { ENV } from "@/lib/env";

// export async function callGemini(prompt: string) {
//   if (!ENV.GEMINI_API_KEY) {
//     throw new Error("GEMINI_API_KEY 未設定");
//   }

//   const res = await fetch(
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
//       ENV.GEMINI_API_KEY,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//       }),
//     }
//   );

//   const data = await res.json();
//   return data;
// }

