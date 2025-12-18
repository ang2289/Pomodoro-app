// src/hooks/useVoiceEngine.ts
import { useCallback, useRef, useState } from "react";

export type VoiceMode = "free" | "premium";

export interface UseVoiceEngineOptions {
  mode: VoiceMode;            // free = 機器音, premium = Google TTS
  lang?: "zh-TW" | "en-US" | "ja-JP";
}

export function useVoiceEngine({ mode, lang = "zh-TW" }: UseVoiceEngineOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0); // 目前朗讀進度 0~1
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    try {
      // 停止瀏覽器語音
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }

      // 停止 Google TTS 播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    } catch (e) {
      console.warn("停止語音時發生例外", e);
    } finally {
      setIsSpeaking(false);
      setProgress(0);
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const content = (text || "").trim();
      if (!content) return;

      // 若正在播放，再按一次就停止
      if (isSpeaking) {
        stop();
        return;
      }

      setIsSpeaking(true);
      setProgress(0);

      // ✅ 免費版：使用瀏覽器 SpeechSynthesis（零成本）
      if (mode === "free") {
        try {
          if (!("speechSynthesis" in window)) {
            console.warn("此瀏覽器不支援語音朗讀");
            setIsSpeaking(false);
            return;
          }

          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(content);
          utterance.lang = lang;
          utterance.rate = 1.0;

          utterance.onend = () => {
            setIsSpeaking(false);
            setProgress(1);
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
          };

          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error("免費語音朗讀錯誤", e);
          setIsSpeaking(false);
        }
        return;
      }

      // ✅ 付費版：呼叫 Google TTS API，播放真人音
      try {
        const res = await fetch("/api/google-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: content,
            lang:
              lang === "zh-TW"
                ? "cmn-TW"
                : lang === "ja-JP"
                ? "ja-JP"
                : "en-US",
          }),
        });

        if (!res.ok) {
          console.error("Google TTS API 錯誤", res.status);
          setIsSpeaking(false);
          return;
        }

        const data = await res.json();
        if (!data.audioContent) {
          console.error("TTS 回傳沒有 audioContent");
          setIsSpeaking(false);
          return;
        }

        // base64 → audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audioRef.current = audio;

        audio.addEventListener("timeupdate", () => {
          if (!audio.duration) return;
          setProgress(audio.currentTime / audio.duration);
        });

        audio.addEventListener("ended", () => {
          setIsSpeaking(false);
          setProgress(1);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio 播放錯誤", e);
          setIsSpeaking(false);
        });

        audio.play().catch((e) => {
          console.error("無法播放 TTS audio", e);
          setIsSpeaking(false);
        });
      } catch (e) {
        console.error("付費語音朗讀錯誤", e);
        setIsSpeaking(false);
      }
    },
    [isSpeaking, lang, mode, stop]
  );

  return {
    isSpeaking,
    progress,
    speak,
    stop,
  };
}









