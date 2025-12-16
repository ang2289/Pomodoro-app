import { useState, useRef, useEffect } from "react";
// ⚠️ 已停用前端直呼 Gemini：import { getGeminiAnswer } from "@/services/gemini";
import { googleTTS } from "@/services/googleTTS";
import ReadButton from "@/components/ReadButton";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";
import { useDailyLimit } from "@/hooks/useDailyLimit";
import { UpgradePopup } from "@/components/UpgradePopup";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import NotFoundPage from "@/pages/NotFound";
import { useAuthCredits } from "@/hooks/useAuthCredits";
import CreditUsageNotice from "@/components/CreditUsageNotice";
import CreditStatusBar, { updateUsedCharsAfterSuccess } from "@/components/CreditStatusBar";
import { useNavigate } from "react-router-dom";
import { useCreditCheck } from "@/hooks/useCreditCheck";

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

export default function HomeworkHelper() {
  // 判斷是否為 localhost 環境
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1" ||
     window.location.hostname === "::1");

  // 非 localhost 環境一律顯示 NotFound
  if (!isLocalhost) {
    return <NotFoundPage />;
  }

  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"answerOnly" | "simple" | "detailed" | "examples">("answerOnly");
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
  const navigate = useNavigate();

  // 使用 useAuthCredits Hook 自動取得並更新剩餘點數
  const { remainingChars, loading: creditsLoading, refresh: refreshCredits } = useAuthCredits()
  
  // 使用共用的扣點檢查邏輯
  const creditCheck = useCreditCheck(question.length)

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

  const handleAnalyze = async () => {
    if (limit.isExceeded) {
      setShowPopup(true);
      return;
    }

    if (!question) return;
    
    // 使用共用的扣點檢查邏輯：在送出請求前先檢查字數是否足夠
    if (!creditCheck.canProceed) {
      // 阻擋送出請求，不呼叫任何 API
      setModal({
        title: '剩餘字數不足',
        message: creditCheck.errorMessage || '剩餘字數不足，請升級方案（尚未開放）',
      })
      return
    }
    
    limit.addOne();
    
    setLoading(true);
    try {
      // ✅ 改用後端 API（禁止前端直呼 Gemini）
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://icuxwmpdpsfhztsbyeds.supabase.co";
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase 環境變數未設定");
      }

      // 將前端 mode 映射到後端 mode
      const modeMap: Record<string, string> = {
        answerOnly: "easy",  // 簡潔答案
        simple: "kid",       // 簡單解釋
        detailed: "pro",     // 詳細說明
        examples: "easy",    // 舉例模式（暫時用 easy）
      };

      const backendMode = modeMap[mode] || "easy";

      // 根據語言調整 prompt
      const languageMap = {
        zh: "請使用繁體中文回答：",
        en: "Please answer in English:",
        ja: "日本語で回答してください：",
      };
      const languagePrefix = languageMap[language] || "";

      const response = await fetch(
        `${supabaseUrl}/functions/v1/homework-helper`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            prompt: `${languagePrefix}${question}`,
            mode: backendMode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 處理點數不足錯誤（403 或 NEED_PURCHASE）
        if (response.status === 403 && (errorData.error === 'INSUFFICIENT_CREDITS' || errorData.error === 'NEED_PURCHASE')) {
          // 重新取得最新剩餘點數
          await refreshCredits()
          
          const currentRemaining = remainingChars || errorData.remaining || 0
          const requested = question.length
          
          setModal({
            title: '點數不足',
            message: `你目前剩餘 ${currentRemaining.toLocaleString()} 字，本次需要 ${requested.toLocaleString()} 字\n點數不足，請購買點數繼續使用`,
            upgradeButton: '前往購買點數',
          })
          return
        }
        
        throw new Error(errorData.error || errorData.message || `API 錯誤：${response.status}`);
      }

      const data = await response.json();
      setResult(data.result || "❌ 無法取得回答");
      
      // 接收後端回傳的最新剩餘點數（扣點後），並更新本地狀態
      if (data.remaining !== undefined) {
        // 使用 refreshCredits 來更新點數（會自動更新 useAuthCredits 的狀態）
        await refreshCredits()
        
        // 更新已使用字數（用於未登入狀態的 localStorage）
        const deductedChars = question.length
        updateUsedCharsAfterSuccess(deductedChars)
      }
    } catch (err: any) {
      console.error("❌ 錯誤", err);
      setResult(`❌ 無法取得回答：${err.message || "請稍後再試"}`);
    } finally {
      setLoading(false);
    }
  };

  // 自動滾動到回答區底部
  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [result, loading]);

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
      {/* 測試中提示 */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-sm text-yellow-800">
          ⚠️ 測試中，未正式上線
        </p>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center">🎓 作業解題神器</h1>

      {/* 目前狀態顯示（用於 homework 頁面） */}
      {!creditsLoading && remainingChars !== null && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            您的狀態：
          </p>
          {remainingChars > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-sm font-medium text-gray-900">
                  免費體驗使用中
                </span>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                剩餘：{remainingChars.toLocaleString()} 字
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠</span>
                <span className="text-sm font-medium text-gray-900">
                  免費體驗已用完
                </span>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                請購買點數以繼續使用
              </p>
            </div>
          )}
        </div>
      )}
      {creditsLoading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-500">載入點數中…</p>
        </div>
      )}

      {/* 測試用：訂閱方案切換按鈕 */}
      <div className="mb-3 flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>
          目前方案：
          <span className={isPremium ? "text-emerald-600 font-semibold" : "text-slate-700"}>
            {isPremium ? "付費｜真人音" : "免費｜機器音"}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            const next = isPremium ? "free" : "premium";
            setPlan(next);
            if (typeof window !== "undefined") {
              window.localStorage.setItem("rxv-homework-plan", next);
            }
          }}
          className="rounded-full border px-2 py-1 hover:bg-slate-50"
        >
          （測試）切換方案
        </button>
      </div>

      {/* 【一、四種回答模式按鈕（grid 2x2）】 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { 
            key: "answerOnly", 
            label: "🎯 只秀答案",
            activeGradient: "from-blue-500 to-cyan-500",
            hoverGradient: "hover:from-blue-600 hover:to-cyan-600",
            inactiveGradient: "from-blue-400 to-cyan-400",
            inactiveHover: "hover:from-blue-500 hover:to-cyan-500"
          },
          { 
            key: "simple", 
            label: "👶 簡單解釋",
            activeGradient: "from-green-500 to-emerald-500",
            hoverGradient: "hover:from-green-600 hover:to-emerald-600",
            inactiveGradient: "from-green-400 to-emerald-400",
            inactiveHover: "hover:from-green-500 hover:to-emerald-500"
          },
          { 
            key: "detailed", 
            label: "📘 詳細說明",
            activeGradient: "from-purple-500 to-indigo-500",
            hoverGradient: "hover:from-purple-600 hover:to-indigo-600",
            inactiveGradient: "from-purple-400 to-indigo-400",
            inactiveHover: "hover:from-purple-500 hover:to-indigo-500"
          },
          { 
            key: "examples", 
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

      {/* 【三、問題輸入框（白色圓角卡片）】 */}
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
          {/* 按鈕容器 - 固定在輸入框右上角，水平排列 */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            {/* 語音輸入按鈕 - 暫時隱藏 */}
            {false && (
              <button
                type="button"
                onClick={() => {
                  if (!sttSupported) return;
                  if (sttListening) {
                    stopStt();
                  } else {
                    resetStt();
                    startStt();
                  }
                }}
                disabled={!sttSupported}
                className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-white/80 hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={sttListening ? "停止語音輸入" : sttSupported ? "開始語音輸入" : "瀏覽器不支援語音輸入"}
              >
                {sttListening ? (
                  "⏹ 停止語音"
                ) : sttSupported ? (
                  "🎤 語音輸入"
                ) : (
                  "瀏覽器不支援"
                )}
              </button>
            )}
            
            {/* 朗讀按鈕 */}
            <button
              type="button"
              onClick={() => {
                const checkResult = checkTtsLimit(question, plan);
                if (!checkResult.ok) {
                  // 免費用戶超過限制：改用機器音（不花錢）
                  if (plan === "free") {
                    setModal({
                      title: "朗讀字數超限",
                      message: "你已超過免費方案的朗讀字數限制（300 字）。\n升級 Pro 即可使用真人語音，並提升至 700 字朗讀上限。",
                      upgradeButton: "🔼 升級 Pro（199/月）",
                    });
                    // 強制使用機器音（免費模式，0成本）
                    freeVoice.speak(question);
                    return;
                  }
                  // Pro 用戶超過限制
                  if (plan === "premium") {
                    setModal({
                      title: "朗讀字數超限",
                      message: "本次內容超過 700 字，無法朗讀。\n升級 PlusPro 可支援一次 1500 字。",
                      upgradeButton: "🔼 升級 PlusPro（299/月）",
                    });
                    return; // ⛔ 停止朗讀
                  }
                  // PlusPro 用戶超過限制
                  setModal({
                    title: "朗讀字數超限",
                    message: "單次朗讀上限為 1500 字，請將題目分段朗讀。",
                  });
                  return; // ⛔ 停止朗讀
                }
                questionVoice.speak(question);
              }}
              className="inline-flex items-center rounded-full px-2 py-1 text-xs border bg-white/80 hover:bg-white transition-colors"
              title={questionVoice.isSpeaking ? "停止朗讀" : "朗讀題目"}
            >
              {questionVoice.isSpeaking ? "⏹ 停止朗讀" : "🔊 朗讀題目"}
            </button>
          </div>
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

      {/* 【四、按鈕區】 */}
      <div className="space-y-3 mb-5">
        {/* 上傳圖片按鈕（次要樣式） */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            📷 上傳題目圖片
          </button>
          {uploadedImage && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">已選擇：{uploadedImage.name}</p>
            </div>
          )}
        </div>

        {/* 共用狀態列元件 */}
        <CreditStatusBar
          inputChars={question.length}
          isLoading={loading}
          featureName="homework"
          lang="zh-tw"
        />

        {/* 開始解題按鈕（主要按鈕 - 紫色漸層） */}
        {(() => {
          // 🔒 使用共用的扣點檢查邏輯
          const inputChars = question.length
          const isQuotaInsufficient = !creditCheck.canProceed && inputChars > 0
          // 狀態 0 / A：可點擊；狀態 B / C：disabled
          // 初始化時（inputChars === 0）按鈕也應該 disabled，提示先輸入內容
          const isButtonDisabled = loading || creditsLoading || isQuotaInsufficient || inputChars === 0
          
          // 按鈕文字
          let buttonText = loading ? "分析中..." : "🚀 開始解題"
          if (isQuotaInsufficient && !loading) {
            buttonText = "點數不足，請先購買"
          } else if (inputChars === 0 && !loading) {
            buttonText = "請先輸入題目"
          }
          
          // Hover 提示文字（disabled 時顯示）
          const tooltipText = isQuotaInsufficient && creditCheck.remainingChars !== null
            ? `本次需要 ${inputChars.toLocaleString()} 字，剩餘點數為 ${creditCheck.remainingChars.toLocaleString()} 字`
            : inputChars === 0
            ? '請先輸入題目'
            : ''
          
          return (
            <button
              onClick={handleAnalyze}
              disabled={isButtonDisabled}
              title={tooltipText}
              className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-2 ${
                isButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-md'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
              style={
                !isButtonDisabled
                  ? {
                      color: '#ffffff',
                    }
                  : undefined
              }
            >
              {loading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {buttonText}
            </button>
          )
        })()}
      </div>

      {/* 【四、AI 回答卡片】- 始終顯示 */}
      <div className="shadow-md border rounded-2xl p-5 bg-white transition mb-5">
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
              <button
                type="button"
                onClick={() => {
                  const checkResult = checkTtsLimit(result, plan);
                  if (!checkResult.ok) {
                    // 免費用戶超過限制：改用機器音（不花錢）
                    if (plan === "free") {
                      setModal({
                        title: "朗讀字數超限",
                        message: "你已超過免費方案的朗讀字數限制（300 字）。\n升級 Pro 即可使用真人語音，並提升至 700 字朗讀上限。",
                        upgradeButton: "🔼 升級 Pro（199/月）",
                      });
                      // 強制使用機器音（免費模式，0成本）
                      freeVoice.speak(result);
                      return;
                    }
                    // Pro 用戶超過限制
                    if (plan === "premium") {
                      setModal({
                        title: "朗讀字數超限",
                        message: "本次內容超過 700 字，無法朗讀。\n升級 PlusPro 可支援一次 1500 字。",
                        upgradeButton: "🔼 升級 PlusPro（299/月）",
                      });
                      return; // ⛔ 停止朗讀
                    }
                    // PlusPro 用戶超過限制
                    setModal({
                      title: "朗讀字數超限",
                      message: "單次朗讀上限為 1500 字，請將題目分段朗讀。",
                    });
                    return; // ⛔ 停止朗讀
                  }
                  answerVoice.speak(result);
                }}
                className="inline-flex items-center rounded-full px-2 py-1 text-xs border bg-white/80 hover:bg-white transition-colors"
                title={answerVoice.isSpeaking ? "停止朗讀" : "朗讀答案"}
              >
                {answerVoice.isSpeaking ? "⏹ 停止朗讀" : "🔊 朗讀答案"}
              </button>
            </div>
          )}
        </div>
        <div 
          ref={answerRef}
          className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${
            result ? '' : 'text-gray-400 italic'
          }`}
          style={{ 
            maxHeight: '300px', 
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
      </div>

      {/* 【五、免責聲明卡片】 */}
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
                    navigate('/pricing');
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
    </div>
  );
}
