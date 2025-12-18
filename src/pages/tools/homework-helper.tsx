import { useState, useRef, useEffect } from "react";
// ⚠️ 已停用前端直呼 Gemini：import { getGeminiAnswer } from "@/services/gemini";
import { googleTTS } from "@/services/googleTTS";
import ReadButton from "@/components/ReadButton";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";
import { useDailyLimit } from "@/hooks/useDailyLimit";
import { UpgradePopup } from "@/components/UpgradePopup";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAuthCredits } from "@/hooks/useAuthCredits";
import CreditUsageNotice from "@/components/CreditUsageNotice";
import CreditStatusBar, { updateUsedCharsAfterSuccess } from "@/components/CreditStatusBar";
import { applyCreditFromApiResponse } from "@/utils/creditCalculator";
import { useNavigate, Link } from "react-router-dom";
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
  // ✅ 正式上線：移除 localhost 限制，允許所有環境存取

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

  // 本次使用點數資訊
  const [lastUsedPoints, setLastUsedPoints] = useState<{
    inputLength: number;
    outputLength: number;
    totalUsedPoints: number;
  } | null>(null);

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

  // 記錄上次成功解題的題目（避免重複呼叫）
  const lastSolvedQuestionRef = useRef<string>("");

  const handleAnalyze = async () => {
    console.log('[DEBUG] startHomeworkSolve clicked');
    
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
      console.log('[DEBUG] return: 題目為空');
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
    
    setLoading(true);
    try {
      // ✅ 使用 Vercel API 處理作業解題
      // 直接傳遞前端 mode（後端已支援四種模式）

      // 根據語言調整 prompt
      const languageMap: Record<string, string> = {
        zh: "請使用繁體中文回答：",
        en: "Please answer in English:",
        ja: "日本語で回答してください：",
      };
      const languagePrefix = languageMap[language] || "";

      console.log('[DEBUG] about to call homework-helper API');
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "homework",
          prompt: `${languagePrefix}${question}`,
          mode: mode,  // 直接傳遞前端 mode
        }),
      });

      const data = await response.json().catch(() => ({ success: false }));

      // 處理點數不足錯誤（403 或 NEED_PURCHASE）
      if (response.status === 403 && (data.error === 'INSUFFICIENT_CREDITS' || data.error === 'NEED_PURCHASE')) {
        console.log('[DEBUG] return: 點數不足錯誤（403）');
        await refreshCredits()
        setModal({
          title: '點數不足',
          message: '目前點數不足，請先查看點數方案說明。',
          upgradeButton: '了解點數方案',
        })
        return
      }

      // 處理 API 錯誤（顯示學生友善訊息）
      if (!response.ok || data.success === false) {
        console.log('[DEBUG] return: API 錯誤（response.ok 為 false 或 data.success 為 false）');
        setResult("❌ 目前無法取得解題結果\n\n可能是系統暫時忙碌，請稍後再試一次。");
        return;
      }

      // 成功取得結果
      if (data.result) {
        setResult(data.result);
        
        // 🛡️ 記錄已解答的題目（避免重複呼叫）
        lastSolvedQuestionRef.current = question.trim();
        
        // ✅ 使用工具函數解析後端實際扣點數（不自行組合 input + output）
        const usedPoints = applyCreditFromApiResponse(data);
        
        // ✅ 記錄本次使用點數（用於顯示）- 僅使用 API 回傳的數值
        if (data.inputLength !== undefined && data.outputLength !== undefined) {
          setLastUsedPoints({
            inputLength: data.inputLength,
            outputLength: data.outputLength,
            totalUsedPoints: usedPoints, // 使用解析後的 usedPoints，不自行計算
          });
        } else {
          // API 未回傳明細時，不顯示點數明細
          setLastUsedPoints(null);
        }
        
        // ✅ AI 回答成功後才扣點（使用後端實際回傳的點數）
        updateUsedCharsAfterSuccess(usedPoints);
        console.log(`✅ 扣點成功：${usedPoints} 點${data.inputLength !== undefined && data.outputLength !== undefined ? `（輸入 ${data.inputLength} + 回答 ${data.outputLength}）` : ''}`);
      } else {
        // 🛡️ API 失敗時不扣點
        console.log('[DEBUG] return: API 失敗（data.result 不存在）');
        setResult("❌ 目前無法取得解題結果\n\n可能是系統暫時忙碌，請稍後再試一次。");
      }
    } catch (err: any) {
      // 網路錯誤或其他未預期錯誤（顯示學生友善訊息）
      console.error("❌ 錯誤", err);
      setResult("❌ 目前無法取得解題結果\n\n可能是系統暫時忙碌，請稍後再試一次。");
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
                請先查看點數方案說明
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
          {/* MVP 版本：移除題目區朗讀按鈕，僅保留文字輸入 */}
        </div>
        
        {/* 點數說明文字 */}
        <div className="mt-2 text-xs text-gray-500">
          本功能使用點數計算，依實際輸入與產出字數扣點。{' '}
          <Link to="/points" className="text-gray-600 hover:text-gray-800 underline">
            查看點數說明
          </Link>
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
        {/* MVP 版本：圖片上傳功能暫時隱藏，Phase 2 實作 */}

        {/* 共用狀態列元件 */}
        <CreditStatusBar
          inputChars={question.length}
          isLoading={loading}
          featureName="homework"
          lang="zh-tw"
        />

        {/* ===== CTA 說明區塊 ===== */}
        <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🚀</span>
            用多少算多少，不綁約、不訂閱
          </h3>
          <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>點數為一次購買制，不會自動扣款</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>沒有使用期限，可慢慢用</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>摘要與作業功能共用點數</span>
            </li>
          </ul>
        </div>

        {/* 📌 扣點規則說明 */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-3">
          <p className="font-medium text-gray-600 mb-1">📌 本功能將依實際使用字數扣點：</p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-500">
            <li>題目輸入字數</li>
            <li>AI 回答產生字數</li>
          </ul>
          <p className="mt-1 text-gray-400">（1 字 = 1 點）</p>
        </div>

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
            buttonText = "點數不足"
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
        
        {/* 扣點提示 */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          <span>使用本功能將扣除點數，詳見</span>{' '}
          <Link to="/points" className="text-blue-600 hover:underline font-medium">
            【點數說明】
          </Link>
          <span className="text-gray-400 text-[10px] ml-1">（符合台灣金流規範，安心付款）</span>
        </div>
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
        
        {/* 本次使用點數顯示 */}
        {lastUsedPoints && result && !loading && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">本次使用點數：</span>
              <span className="text-purple-600 font-semibold">{lastUsedPoints.totalUsedPoints.toLocaleString()} 點</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              （輸入 {lastUsedPoints.inputLength.toLocaleString()} 字 + 回答 {lastUsedPoints.outputLength.toLocaleString()} 字）
            </p>
          </div>
        )}
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
