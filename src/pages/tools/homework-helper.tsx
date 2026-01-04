import { useState, useRef, useEffect } from "react";
// ⚠️ 已停用前端直呼 Gemini：import { getGeminiAnswer } from "@/services/gemini";
import { googleTTS } from "@/services/googleTTS";
import ReadButton from "@/components/ReadButton";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";
import { useDailyLimit } from "@/hooks/useDailyLimit";
import { UpgradePopup } from "@/components/UpgradePopup";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Google TTS 播放函式
async function playGoogleTTS(text: string, lang: string = "zh-TW") {
  const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE TTS API KEY 未設定");
    return;
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const body = {
    input: { text },
    voice: { languageCode: lang, ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.audioContent) {
      const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
      audio.play();
    } else {
      console.error("❌ 無法取得語音資料", data);
    }
  } catch (err) {
    console.error("❌ Google TTS 發生錯誤", err);
  }
}

// 共用朗讀 Hook（支援多語言）
function useTTS(language: 'zh' | 'en' | 'ja' = 'zh') {
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    if (synthRef.current) {
      const loadVoices = () => {
        voicesRef.current = synthRef.current?.getVoices() || [];
      };
      loadVoices();
      synthRef.current.addEventListener("voiceschanged", loadVoices);
      return () => synthRef.current?.removeEventListener("voiceschanged", loadVoices);
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const pickVoice = () => {
    if (!voicesRef.current.length && synthRef.current) {
      voicesRef.current = synthRef.current.getVoices() || [];
    }
    
    // 根據語言選擇語音
    if (language === 'zh') {
      const zhVoice = voicesRef.current.find((v) => 
        v.lang?.toLowerCase().startsWith("zh-tw") || 
        v.lang?.toLowerCase().startsWith("zh-cn")
      );
      return zhVoice || voicesRef.current.find((v) => v.lang?.includes("zh")) || voicesRef.current[0] || null;
    } else if (language === 'en') {
      const enVoice = voicesRef.current.find((v) => 
        v.lang?.toLowerCase().startsWith("en")
      );
      return enVoice || voicesRef.current[0] || null;
    } else if (language === 'ja') {
      const jaVoice = voicesRef.current.find((v) => 
        v.lang?.toLowerCase().startsWith("ja")
      );
      return jaVoice || voicesRef.current[0] || null;
    }
    
    return voicesRef.current[0] || null;
  };

  const speak = (text: string) => {
    if (!text || !synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }

    const voice = pickVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 設定語言代碼
    if (language === 'zh') {
      utterance.lang = voice?.lang || "zh-TW";
    } else if (language === 'en') {
      utterance.lang = voice?.lang || "en-US";
    } else if (language === 'ja') {
      utterance.lang = voice?.lang || "ja-JP";
    }
    
    utterance.voice = voice || null;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.speak(utterance);
    setSpeaking(true);
  };

  return { speak, speaking };
}

// 自動語言偵測
function detectLanguage(text: string): 'zh' | 'en' | 'ja' {
  if (!text.trim()) return 'zh';
  
  // 計算各語言字符比例
  const englishPattern = /[a-zA-Z]/g;
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g;
  const chinesePattern = /[\u4E00-\u9FAF]/g;
  
  const englishMatches = (text.match(englishPattern) || []).length;
  const japaneseMatches = (text.match(japanesePattern) || []).length;
  const chineseMatches = (text.match(chinesePattern) || []).length;
  
  const totalChars = text.length;
  
  // 如果英文比例超過 50%，判定為英文
  if (englishMatches / totalChars > 0.5) {
    return 'en';
  }
  
  // 如果包含日文假名，判定為日文
  if (japaneseMatches > 0 && japaneseMatches / totalChars > 0.2) {
    return 'ja';
  }
  
  // 預設為中文
  return 'zh';
}

// 模式文字對照表
const modeLabelMap: Record<string, string> = {
  answer: '只秀答案',
  easy: '簡單解釋',
  pro: '詳細說明',
  example: '舉例模式',
}

export default function HomeworkHelper() {
  // ✅ 正式上線：移除 localhost 限制，允許所有環境存取

  // 🔍 判斷是否為本地端／開發環境
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('127.') ||
    window.location.hostname.startsWith('192.168.') ||
    import.meta.env.DEV || // Vite 開發模式
    import.meta.env.MODE === 'development' // 開發模式
  )

  // 🔍 判斷是否為預覽模式（正式環境設為 false）
  const isPreview = false // 正式環境：設為 false，表示會實際扣點

  // Mode 映射表：將前端模式映射到 Edge Function / Gemini 支援的模式
  const modeMap: Record<string, string> = {
    answer: 'easy',
    easy: 'kid',
    pro: 'pro',
    example: 'pro',
    // 保留舊的映射以向後相容
    answerOnly: 'easy',
    simple: 'kid',
    detailed: 'pro',
    examples: 'pro',
    kid: 'kid',
  }

  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<'answer' | 'easy' | 'pro' | 'example'>('answer');
  const [language, setLanguage] = useState<"zh" | "en" | "ja">("zh");

  // TODO: 之後改成從 Supabase / RevenueCat 取得用戶方案
  // 目前先用 localStorage 模擬：'free' | 'premium'
  const [plan, setPlan] = useState<"free" | "premium">(() => {
    if (typeof window === "undefined") return "free";
    const saved = window.localStorage.getItem("rxv-homework-plan");
    return saved === "premium" ? "premium" : "free";
  });

  const isPremium = plan === "premium";
  const limit = useDailyLimit("homework", 3);
  const [showPopup, setShowPopup] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    upgradeButton?: string;
  } | null>(null);
  // ⚠️ 已移除點數不足提示狀態
  const navigate = useNavigate();

  // 本次使用點數資訊
  const [lastUsedPoints, setLastUsedPoints] = useState<{
    inputLength: number;
    outputLength: number;
    totalUsedPoints: number;
  } | null>(null);

  // ⚠️ 已移除所有點數相關邏輯
  
  // 錯誤訊息狀態
  const [error, setError] = useState<string>("")

  // 字數檢查函式
  function checkTtsLimit(text: string, userPlan: string) {
    const length = text.length;

    const limits: Record<string, number> = {
      free: 300,
      pro: 700,
      plus: 1500,
    };

    const limit = limits[userPlan] || limits.free;

    if (length > limit) {
      return {
        ok: false,
        overBy: length - limit,
        limit,
      };
    }

    return { ok: true };
  }
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);

  // 將語言選擇轉換為 Speech API 語言代碼（只使用使用者選擇的語言，不自動偵測）
  const getSpeechLang = (lang: "zh" | "en" | "ja"): "zh-TW" | "en-US" | "ja-JP" => {
    if (lang === "zh") return "zh-TW";
    if (lang === "en") return "en-US";
    if (lang === "ja") return "ja-JP";
    return "zh-TW"; // 預設中文
  };

  // 題目朗讀器（依方案切換免費 / 付費）
  const questionVoice = useVoiceEngine({
    mode: isPremium ? "premium" : "free",
    lang: getSpeechLang(language),
  });

  // 答案朗讀器
  const answerVoice = useVoiceEngine({
    mode: isPremium ? "premium" : "free",
    lang: getSpeechLang(language),
  });

  // 免費機器音朗讀器（用於免費用戶超過限制時降級使用）
  const freeVoice = useVoiceEngine({
    mode: "free",
    lang: getSpeechLang(language),
  });

  // 清理語音辨識結果，去除重複文字
  const cleanTranscript = (text: string): string => {
    if (!text) return "";
    
    // 1. 去除完全重複的片段（例如："今天 今天 今天是星期幾" → "今天是星期幾"）
    let cleaned = text;
    
    // 2. 去除連續重複詞彙（"今天今天是星期幾" → "今天是星期幾"）
    // 匹配連續重複的中文字詞（2-10個字）
    cleaned = cleaned.replace(/([\u4e00-\u9fa5]{2,10})\1+/g, "$1");
    
    // 3. 去除完全重複的片段（以空格分隔的完整詞組）
    const words = cleaned.split(/\s+/);
    const uniqueWords: string[] = [];
    let lastWord = "";
    
    for (const word of words) {
      if (word && word !== lastWord) {
        uniqueWords.push(word);
        lastWord = word;
      }
    }
    
    cleaned = uniqueWords.join(" ");
    
    // 4. 去除語音 API 的時間戳重複截斷（例如："今天 今天" → "今天"）
    // 再次檢查是否有連續重複的詞（包括空格）
    cleaned = cleaned.replace(/([\u4e00-\u9fa5]+)\s+\1+/g, "$1");
    
    return cleaned.trim();
  };

  // 語音輸入功能
  const {
    supported: sttSupported,
    listening: sttListening,
    transcript: sttTranscript,
    error: sttError,
    start: startStt,
    stop: stopStt,
    reset: resetStt,
  } = useSpeechRecognition({
    lang: "zh-TW",
    continuous: false,
    interimResults: true,
    onFinalResult: (text) => {
      // 語音辨識完成後，清理重複文字並附加到題目輸入框
      const cleanedText = cleanTranscript(text);
      if (cleanedText) {
        setQuestion((prev) => (prev ? prev + " " + cleanedText : cleanedText));
      }
    },
  });

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.max(150, el.scrollHeight);
    el.style.height = `${next}px`;
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("複製失敗", err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      // TODO: 預留 API 呼叫
    }
  };

  // 記錄上次成功解題的題目（避免重複呼叫）
  const lastSolvedQuestionRef = useRef<string>("");

  const handleAnalyze = async () => {
    // console.log('[DEBUG] startHomeworkSolve clicked');
    
    // 🛡️ 防呆機制 1：當正在載入時禁止再次送出
    // ⚠️ 暫時註解：確認 API 請求可以被送出
    // if (loading) {
    //   console.log('[DEBUG] return: 正在處理中，請稍候');
    //   return;
    // }

    // ⚠️ 暫時註解：確認 API 請求可以被送出
    // if (limit.isExceeded) {
    //   console.log('[DEBUG] return: 超過每日限制');
    //   setShowPopup(true);
    //   return;
    // }

      // ✅ 保留：prompt 是否為空的檢查
      if (!question || !question.trim()) {
        // console.log('[DEBUG] return: 題目為空');
        return;
      }

      // 🛡️ 防呆機制 2：同一題目未變更時不重複呼叫 API
      // ⚠️ 暫時註解：確認 API 請求可以被送出
      // if (question.trim() === lastSolvedQuestionRef.current) {
      //   console.log('[DEBUG] return: 同一題目已解答過，不重複呼叫');
      //   return;
      // }
      
      // 使用共用的扣點檢查邏輯：在送出請求前先檢查字數是否足夠
      // ⚠️ 暫時註解：確認 API 請求可以被送出
      // if (!creditCheck.canProceed) {
      //   console.log('[DEBUG] return: 點數不足（共用檢查邏輯）');
      //   // 阻擋送出請求，不呼叫任何 API
      //   setModal({
      //     title: '剩餘字數不足',
      //     message: creditCheck.errorMessage || '剩餘字數不足，請升級方案（尚未開放）',
      //   })
      //   return
      // }
      
      limit.addOne();
      
      // ⚠️ 已移除 checkCreditBeforeApiCall（使用 trialManager），改為直接檢查登入狀態
      // 登入檢查已在函數最前面完成
      
      setLoading(true);
      setError(''); // 清除之前的錯誤
      try {
        // ✅ 直接呼叫 API，不進行任何阻擋
        // console.log('[DEBUG] 呼叫 Supabase Edge Function：homework-helper')
        
        // ✅ 直接傳送前端 mode 值（'answer' | 'easy' | 'pro' | 'example'）
        // 後端會根據 mode 值進行相應處理
        
        // 📝 送出前：記錄 payload
        const payload = {
          prompt: question.trim(),
          mode: mode, // 直接傳送 'answer' | 'easy' | 'pro' | 'example'
          language: language, // ✅ 傳送語言參數 'zh' | 'en' | 'ja'
        }
        // console.log('[Homework] invoke Edge Function payload:', payload)
        
        const { data, error } = await supabase.functions.invoke('homework-helper', {
          body: payload,
          headers: { Authorization: undefined },
        })

        // ✅ 1. 若 supabase.functions.invoke 回傳 error，顯示錯誤訊息但不阻擋結果顯示
        if (error) {
          // 📝 失敗：記錄 error
          // console.log('[Homework] Edge Function error:', error)
          
          // 處理錯誤（僅顯示提示，不阻擋）
          const errorMessage = error.message || String(error) || ''
          if (errorMessage.includes('INSUFFICIENT_CREDITS') || errorMessage.includes('insufficient')) {
            // 點數不足：僅顯示錯誤訊息，不阻擋結果顯示
            setError('使用額度不足，請先查看使用方案說明')
          } else {
            // 其他錯誤：顯示友善錯誤訊息
            console.error('❌ [作業解題 API] 錯誤：', error)
            setError('AI 服務暫時異常，請稍後再試')
          }
          // 不 return，讓結果可以顯示（如果有）
        }

        // ✅ 2. 若成功，僅使用 data.result 顯示 AI 回答
        // 禁止任何 JSON.parse(text) 類型的處理，Supabase SDK 已自動處理 JSON
        if (data && typeof data === 'object' && typeof data.result === 'string') {
          // 直接使用 data.result，不進行任何 JSON 解析
          const resultText = data.result
          
          // 📝 成功後：記錄 result
          // console.log('[Homework] Edge Function result:', resultText)
          
          // 🛡️ 記錄已解答的題目（避免重複呼叫）
          lastSolvedQuestionRef.current = question.trim();
          
          // 計算本次實際使用的點數（總額，用於顯示）
          const inputLength = question.trim().length
          const outputLength = resultText.length
          const totalAmount = inputLength + outputLength
          
          // ✅ 記錄本次使用點數（用於顯示）
          setLastUsedPoints({
            inputLength,
            outputLength,
            totalUsedPoints: totalAmount,
          });
          
          // ✅ 設定結果
          setResult(resultText)
        } else if (data) {
          // 回傳格式錯誤，但仍有資料，顯示錯誤訊息
          console.error('❌ [作業解題 API] 回傳格式錯誤', data)
          setError('AI 服務暫時異常，請稍後再試')
        }
    } catch (err: any) {
      // 📝 失敗：記錄未預期錯誤
      // console.log('[Homework] Edge Function error:', err)
      // 統一錯誤處理：UI 僅顯示友善錯誤訊息，不顯示 raw error string
      console.error("❌ [作業解題 API] 未預期錯誤：", err);
      setResult("AI 服務暫時異常，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 自動滾動到回答區底部（使用 ref 追蹤，避免依賴 result/loading 導致不必要的重新執行）
  const prevResultRef = useRef<string>("");
  useEffect(() => {
    // 只有當 result 真的改變時才滾動（忽略 loading 狀態變化）
    if (result !== prevResultRef.current && answerRef.current) {
      prevResultRef.current = result;
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [result]); // 只依賴 result，loading 狀態變化不觸發滾動

  // 自動分段顯示回答
  const formatAnswer = (text: string) => {
    // 檢查是否包含編號格式（1. 2. 3. 等）
    if (/\d+\./.test(text)) {
      const parts = text.split(/(\d+\.\s*)/);
      return (
        <div className="space-y-2">
          {parts.map((part, index) => {
            if (/\d+\.\s*/.test(part)) {
              return (
                <div key={index} className="font-semibold text-blue-600 mt-3 first:mt-0">
                  {part}
                </div>
              );
            }
            if (part.trim()) {
              return (
                <div key={index} className="ml-4">
                  {part}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return <div>{text}</div>;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">🎓 作業解題神器</h1>

      {/* ⚠️ 已移除點數狀態顯示 */}

      {/* 【一、四種回答模式按鈕（grid 2x2）】 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { 
            key: "answer", 
            label: "🎯 只秀答案",
            activeGradient: "from-blue-500 to-cyan-500",
            hoverGradient: "hover:from-blue-600 hover:to-cyan-600",
            inactiveGradient: "from-blue-400 to-cyan-400",
            inactiveHover: "hover:from-blue-500 hover:to-cyan-500"
          },
          { 
            key: "easy", 
            label: "👶 簡單解釋",
            activeGradient: "from-green-500 to-emerald-500",
            hoverGradient: "hover:from-green-600 hover:to-emerald-600",
            inactiveGradient: "from-green-400 to-emerald-400",
            inactiveHover: "hover:from-green-500 hover:to-emerald-500"
          },
          { 
            key: "pro", 
            label: "📘 詳細說明",
            activeGradient: "from-purple-500 to-indigo-500",
            hoverGradient: "hover:from-purple-600 hover:to-indigo-600",
            inactiveGradient: "from-purple-400 to-indigo-400",
            inactiveHover: "hover:from-purple-500 hover:to-indigo-500"
          },
          { 
            key: "example", 
            label: "✨ 舉例模式",
            activeGradient: "from-orange-500 to-pink-500",
            hoverGradient: "hover:from-orange-600 hover:to-pink-600",
            inactiveGradient: "from-orange-400 to-pink-400",
            inactiveHover: "hover:from-orange-500 hover:to-pink-500"
          },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setMode(item.key as any)}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 bg-gradient-to-r ${
              mode === item.key
                ? `${item.activeGradient} ${item.hoverGradient}`
                : `${item.inactiveGradient} ${item.inactiveHover}`
            }`}
            style={{ color: '#ffffff' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 【二、語言切換（縮小版）】 */}
      <div className="flex justify-center gap-3 mb-5">
        {[
          { 
            key: "zh", 
            label: "中文",
            gradient: "from-indigo-500 to-purple-500",
            hoverGradient: "hover:from-indigo-600 hover:to-purple-600"
          },
          { 
            key: "en", 
            label: "English",
            gradient: "from-blue-500 to-cyan-500",
            hoverGradient: "hover:from-blue-600 hover:to-cyan-600"
          },
          { 
            key: "ja", 
            label: "日本語",
            gradient: "from-pink-500 to-rose-500",
            hoverGradient: "hover:from-pink-600 hover:to-rose-600"
          },
        ].map((item) => {
          const isActive = language === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setLanguage(item.key as "zh" | "en" | "ja")}
              className={`w-20 h-8 rounded-lg text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 bg-gradient-to-r ${
                isActive
                  ? `${item.gradient} ${item.hoverGradient}`
                  : `from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600`
              }`}
              style={{ color: '#ffffff' }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 語音輸入小提示 - 暫時隱藏 */}
      {false && (
        <div className="mt-2 text-xs text-gray-500 mb-3">
          💡 小提示：不想打字可以點右上角「🎤 語音輸入」，直接唸題目給 AI 聽，系統會自動幫你轉成文字。
        </div>
      )}

      {/* ===== 問題輸入框區塊 START ===== */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-5 relative">
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onInput={autoResizeTextarea}
            placeholder="請輸入你想問的問題，例如：為什麼天空是藍色？"
            className="w-full p-4 border rounded-xl text-lg outline-none resize-none"
            style={{ minHeight: "150px" }}
            rows={4}
          />
          {/* MVP 版本：移除題目區朗讀按鈕，僅保留文字輸入 */}
        </div>
        
        {/* 語音辨識狀態顯示 - 暫時隱藏 */}
        {false && (sttSupported && (sttListening || sttError || sttTranscript)) && (
          <div className="mt-1 text-xs text-gray-500">
            {sttListening && <span>🎙 正在聽你說話…</span>}
            {sttError && !sttListening && (
              <span>⚠ 語音辨識發生錯誤：{sttError}</span>
            )}
            {sttTranscript && !sttListening && !sttError && (
              <span>📝 已辨識文字（會自動加到題目框）：{sttTranscript}</span>
            )}
          </div>
        )}
      </div>
      {/* ===== 問題輸入框區塊 END ===== */}

      {/* ===== 按鈕區 START ===== */}
      <div className="space-y-3 mb-5">
        {/* MVP 版本：圖片上傳功能暫時隱藏，Phase 2 實作 */}

        {/* 🔍 預覽模式說明文字（僅在 isPreview 為 true 時顯示） */}
        {isPreview && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            字數僅供顯示，不會實際扣除
          </p>
        )}

        {/* 開始解題按鈕（主要按鈕 - 紫色漸層） */}
        <button
          onClick={() => {
            console.log("[HOMEWORK] button clicked")
            handleAnalyze()
          }}
          className="w-full font-bold py-4 px-4 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          style={{
            color: '#ffffff',
          }}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? "分析中..." : "🚀 開始解題"}
          <span className="ml-3 text-xs text-gray-400">
            模式：{modeLabelMap[mode]}
          </span>
        </button>
        
        {/* 簡易提示 */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          <Link to="/points" className="text-blue-600 hover:underline">
            查看完整使用說明 →
          </Link>
        </div>
      </div>
      {/* ===== 按鈕區 END ===== */}

      {/* ===== AI 回答區塊 START ===== */}
      <div className="shadow-md border rounded-2xl p-5 bg-white transition mb-5">
        {/* 模式標籤顯示（在結果上方） */}
        {result && (
          <div className="mb-2 text-sm text-gray-500">
            目前解題模式：
            <span className="ml-1 font-semibold text-indigo-600">
              {modeLabelMap[mode]}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">🧠 AI 回答</h2>
          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="複製答案"
              >
                {copied ? (
                  <span className="text-green-600 text-sm font-medium">✓ 已複製</span>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              {/* MVP 版本：暫時移除朗讀功能，避免額外 API 成本 */}
            </div>
          )}
        </div>
        <div 
          ref={answerRef}
          className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${
            result ? '' : 'text-gray-400 italic'
          }`}
          style={{ 
            maxHeight: '420px', 
            overflowY: result ? 'auto' : 'visible' 
          }}
        >
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : result ? (
            formatAnswer(result)
          ) : (
            <span>尚未開始解題，請輸入題目…</span>
          )}
        </div>
        
        {/* 本次使用顯示 */}
        {lastUsedPoints && result && !loading && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">本次使用：</span>
              <span className="text-purple-600 font-semibold">{lastUsedPoints.totalUsedPoints.toLocaleString()} 字</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              （輸入 {lastUsedPoints.inputLength.toLocaleString()} 字 + 回答 {lastUsedPoints.outputLength.toLocaleString()} 字）
            </p>
          </div>
        )}
      </div>
      {/* ===== AI 回答區塊 END ===== */}

      {/* ⚠️ 已移除點數相關提示和狀態顯示 */}

      {/* 簡易點數顯示：僅顯示連結到完整說明頁 */}
      {result && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          <Link to="/points" className="text-blue-600 hover:underline">
            查看完整使用說明 →
          </Link>
        </div>
      )}

      {/* ===== 免責聲明卡片 START（僅在有答案時顯示） ===== */}
      {result && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold mb-2 text-gray-700">免責聲明</p>
              <p className="mb-1">本工具之答案由 AI 生成，僅供學習參考，不保證 100% 正確。</p>
              <p>請使用者自行判斷與驗算，本工具不提供代寫作業服務。</p>
            </div>
          </div>
        </div>
      )}
      {/* ===== 免責聲明卡片 END ===== */}

      {/* 字數超限 Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-4">{modal.title}</h3>
            <p className="text-gray-700 mb-6">{modal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                關閉
              </button>
              {modal.upgradeButton && (
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    navigate('/points');
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {modal.upgradeButton}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 延伸資源說明 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-2 flex-wrap">
          <span>
            部分使用者在進行此類任務時，也會搭配其他輔助工具以提升專注與效率。
          </span>
          <a
            href="#extended-tools-resources"
            className="text-gray-500 hover:text-gray-700 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('extended-tools-resources');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                // 如果找不到元素，滾動到頁面底部
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }}
          >
            查看延伸資源 →
          </a>
        </p>
      </div>
    </div>
  );
}
