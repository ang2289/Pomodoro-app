// api/google-tts.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GOOGLE_TTS_API_KEY) {
    console.error("❌ GOOGLE_TTS_API_KEY 未設定");
    return res.status(500).json({ error: "TTS 設定錯誤，請稍後再試" });
  }

  try {
    const { text, lang = "cmn-TW", voiceName, speakingRate = 1.0 } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "缺少 text 文字內容" });
    }

    // ✅ 單次朗讀字數限制（避免成本爆掉）
    const limitedText = text.slice(0, 700);

    const payload = {
      input: { text: limitedText },
      // 預設使用台灣中文 WaveNet 女聲，可依 lang 切換
      voice: {
        languageCode: lang,
        name: voiceName || (lang === "ja-JP"
          ? "ja-JP-Wavenet-A"
          : lang === "en-US"
          ? "en-US-Wavenet-F"
          : "cmn-TW-Wavenet-A"),
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate,
      },
    };

    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      console.error("❌ Google TTS 回應錯誤", ttsRes.status, errorText);
      return res.status(500).json({
        error: "TTS 服務錯誤",
        status: ttsRes.status,
        detail: errorText,
      });
    }

    const data = await ttsRes.json();

    if (!data.audioContent) {
      return res.status(500).json({ error: "TTS 回傳內容錯誤（沒有 audioContent）" });
    }

    // 回傳 base64，前端用 Audio 播放
    return res.status(200).json({
      audioContent: data.audioContent,
    });
  } catch (err) {
    console.error("❌ Google TTS API 例外錯誤", err);
    return res.status(500).json({ error: "TTS 服務發生錯誤" });
  }
}













