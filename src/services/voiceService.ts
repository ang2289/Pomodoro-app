let audio: HTMLAudioElement | null = null;

interface SpeakOptions {
  text: string;
  lang: string;
  voiceType?: string; // male / female
  onProgress?: (ratio: number) => void;
  onEnd?: () => void;
}

export async function googleSpeak({
  text,
  lang,
  voiceType = "female",
  onProgress,
  onEnd,
}: SpeakOptions) {
  if (!text) return;

  // 停止舊音訊
  if (audio) {
    audio.pause();
    audio = null;
  }

  // Google TTS API
  const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE TTS API KEY 未設定");
    return;
  }

  const GOOGLE_TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const body = {
    input: { text },
    voice: {
      languageCode: lang,
      ssmlGender: voiceType === "male" ? "MALE" : "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0,
    },
  };

  try {
    const res = await fetch(GOOGLE_TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Google TTS API 錯誤", errorData);
      return;
    }

    const data = await res.json();
    if (!data.audioContent) {
      console.error("❌ 無法取得語音資料", data);
      return;
    }

    const audioSrc = "data:audio/mp3;base64," + data.audioContent;

    audio = new Audio(audioSrc);
    audio.play();

    // 追蹤進度條
    audio.ontimeupdate = () => {
      if (audio && audio.duration) {
        const ratio = audio.currentTime / audio.duration;
        onProgress?.(ratio);
      }
    };

    audio.onended = () => {
      onEnd?.();
      audio = null;
    };

    audio.onerror = (err) => {
      console.error("❌ 音訊播放錯誤", err);
      onEnd?.();
      audio = null;
    };
  } catch (err) {
    console.error("❌ Google TTS 發生錯誤", err);
    onEnd?.();
  }
}

export function stopSpeak() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
}





