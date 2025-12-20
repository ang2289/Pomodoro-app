import { ENV } from "@/lib/env";

export async function googleTTS(text: string) {
  const apiKey = ENV.GOOGLE_TTS_KEY;

  if (!apiKey) {
    console.error("❌ GOOGLE TTS API KEY 未設定");
    return;
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const body = {
    input: { text },
    voice: {
      languageCode: "cmn-TW",   // 台灣中文
      name: "cmn-TW-Wavenet-A", // 自然真人音質
      ssmlGender: "FEMALE"
    },
    audioConfig: {
      audioEncoding: "mp3",
      speakingRate: 1.0,
      pitch: 0.0
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      console.error("❌ 無法取得語音資料", data);
      return;
    }

    const audio = new Audio("data:audio/mp3;base64," + audioContent);
    audio.play();
  } catch (err) {
    console.error("❌ Google TTS 發生錯誤", err);
  }
}














