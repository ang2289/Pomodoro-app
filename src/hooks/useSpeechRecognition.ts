// src/hooks/useSpeechRecognition.ts
import { useState, useRef, useEffect } from "react";

export interface UseSpeechRecognitionOptions {
  lang?: string;          // 語言代碼，預設 'zh-TW'
  continuous?: boolean;   // 是否連續辨識，預設 false
  interimResults?: boolean; // 是否回傳中途結果，預設 false
  onFinalResult?: (text: string) => void; // 每次最終辨識結束時的回呼
}

export interface UseSpeechRecognitionResult {
  supported: boolean;         // 瀏覽器是否支援
  listening: boolean;         // 是否正在錄音中
  transcript: string;         // 目前累積的辨識文字
  error: string | null;       // 最近一次錯誤訊息
  start: () => void;          // 開始辨識
  stop: () => void;           // 停止辨識
  reset: () => void;          // 清空 transcript & error
}

// 取得 SpeechRecognition 類別（支援標準與 webkit 前綴）
function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  return Ctor || null;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const onFinalResultRef = useRef(options?.onFinalResult);
  const optionsRef = useRef(options);

  // 更新 refs
  useEffect(() => {
    onFinalResultRef.current = options?.onFinalResult;
    optionsRef.current = options;
  }, [options]);

  // 初始化 recognition 實例
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    
    if (!SpeechRecognitionClass) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    // 處理辨識結果
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      // 更新 transcript（包含最終和臨時結果）
      setTranscript((prev) => {
        const currentOptions = optionsRef.current;
        const newText = prev + finalText + (currentOptions?.interimResults ? interimText : "");
        
        // 如果有最終結果，呼叫回呼函式
        if (finalText && onFinalResultRef.current) {
          onFinalResultRef.current(newText);
        }
        
        return newText;
      });
    };

    // 處理錯誤
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = event.error || "語音辨識發生錯誤";
      setError(errorMessage);
      setListening(false);
      isListeningRef.current = false;
    };

    // 處理辨識結束
    recognition.onend = () => {
      setListening(false);
      isListeningRef.current = false;
    };

    // 清理函式
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // 忽略停止時的錯誤
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // 開始辨識
  const start = () => {
    if (!supported || !recognitionRef.current || isListeningRef.current) {
      return;
    }

    try {
      const currentOptions = optionsRef.current;
      recognitionRef.current.lang = currentOptions?.lang || "zh-TW";
      recognitionRef.current.continuous = currentOptions?.continuous ?? false;
      recognitionRef.current.interimResults = currentOptions?.interimResults ?? false;

      recognitionRef.current.start();
      setListening(true);
      setError(null);
      isListeningRef.current = true;
    } catch (err: any) {
      setError(err.message || "無法啟動語音辨識");
      setListening(false);
      isListeningRef.current = false;
    }
  };

  // 停止辨識
  const stop = () => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // 忽略停止時的錯誤
      }
    }
  };

  // 重置狀態
  const reset = () => {
    setTranscript("");
    setError(null);
  };

  // 伺服器端渲染保護
  if (typeof window === "undefined") {
    return {
      supported: false,
      listening: false,
      transcript: "",
      error: null,
      start: () => {},
      stop: () => {},
      reset: () => {},
    };
  }

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    reset,
  };
}

