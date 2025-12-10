import { useState, useRef, useEffect } from "react";
import { getGeminiAnswer } from "@/services/gemini";
import { googleTTS } from "@/services/googleTTS";
import ReadButton from "@/components/ReadButton";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";
import { useDailyLimit } from "@/hooks/useDailyLimit";
import { UpgradePopup } from "@/components/UpgradePopup";

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
    
    limit.addOne();
    
    setLoading(true);
    try {
      // 使用使用者選擇的語言，不自動偵測
      const res = await getGeminiAnswer(question, mode, language);
      setResult(res);
    } catch (err) {
      console.error("❌ 錯誤", err);
      setResult("❌ 無法取得回答，請稍後再試");
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
          {/* 朗讀按鈕 - 鎖定在輸入框右上角外側，不會遮擋文字 */}
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
            className="absolute -top-2 -right-2 z-10 inline-flex items-center rounded-full px-2 py-1 text-xs border bg-white/80 hover:bg-white transition-colors"
            title={questionVoice.isSpeaking ? "停止朗讀" : "朗讀題目"}
          >
            {questionVoice.isSpeaking ? "⏹ 停止朗讀" : "🔊 朗讀題目"}
          </button>
        </div>
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

        {/* 開始解題按鈕（主要按鈕 - 紫色漸層） */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !question}
          className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-2 ${
            loading || !question
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-md'
              : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
          }`}
          style={
            !loading && question
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
          {loading ? "分析中..." : "🚀 開始解題"}
        </button>
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
                    // TODO: 導向升級頁面
                    setModal(null);
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
