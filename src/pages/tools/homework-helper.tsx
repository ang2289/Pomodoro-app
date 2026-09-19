import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
// ⚠️ 已停用前端直呼 Gemini：import { getGeminiAnswer } from "@/services/gemini";
import { googleTTS } from "@/services/googleTTS";
import ReadButton from "@/components/ReadButton";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";
import { useDailyLimit } from "@/hooks/useDailyLimit";
import { UpgradePopup } from "@/components/UpgradePopup";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentCreditSummary, getCustomSessionToken } from "@/lib/accountApi";
import { isLoggedIn } from "@/lib/auth.ts";
import PricingPlanCard from "@/components/PricingPlanCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { PLANS } from "../../config";
import { getPlanChars } from "../../lib/usagePlans";
import { trackEvent } from "@/utils/analytics";
import SEO from "@/components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";

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
    audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

function FotorAffiliateBlock() {
  return (
    <section className="mt-10 mb-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
          AI Creator Tools
        </span>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          AI 創作者推薦工具
        </h3>
      </div>
      <p className="mb-5 text-sm text-slate-500 leading-relaxed">
        可搭配本頁工具使用：先用 AI
        產生圖片素材、去背整理，再壓縮、轉尺寸、做成貼圖、QR 圖卡或短影音。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://www.fotor.com/tw/features/ai-image-generator/?via=289886"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            AI
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
              Fotor AI 圖片生成
            </h4>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
              HOT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            不會畫畫也能快速產生商品圖、貼圖角色、社群素材與短影音封面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white group-hover:bg-blue-700">
            立即生成圖片
          </span>
        </a>
        <a
          href="https://www.fotor.com/tw/features/background-remover/?via=289886"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            BG
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
              Fotor AI 去背工具
            </h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
              推薦
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            上架貼圖、商品圖或社群圖前先去背，讓素材更乾淨、更好搭配版面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-purple-600 px-3 py-2 text-xs font-black text-white group-hover:bg-purple-700">
            立即去背圖片
          </span>
        </a>
      </div>
    </section>
  );
}

function useTTS(language: "zh" | "en" | "ja" = "zh") {
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
      return () =>
        synthRef.current?.removeEventListener("voiceschanged", loadVoices);
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
    if (language === "zh") {
      const zhVoice = voicesRef.current.find(
        (v) =>
          v.lang?.toLowerCase().startsWith("zh-tw") ||
          v.lang?.toLowerCase().startsWith("zh-cn"),
      );
      return (
        zhVoice ||
        voicesRef.current.find((v) => v.lang?.includes("zh")) ||
        voicesRef.current[0] ||
        null
      );
    } else if (language === "en") {
      const enVoice = voicesRef.current.find((v) =>
        v.lang?.toLowerCase().startsWith("en"),
      );
      return enVoice || voicesRef.current[0] || null;
    } else if (language === "ja") {
      const jaVoice = voicesRef.current.find((v) =>
        v.lang?.toLowerCase().startsWith("ja"),
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
    if (language === "zh") {
      utterance.lang = voice?.lang || "zh-TW";
    } else if (language === "en") {
      utterance.lang = voice?.lang || "en-US";
    } else if (language === "ja") {
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
function detectLanguage(text: string): "zh" | "en" | "ja" {
  if (!text.trim()) return "zh";

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
    return "en";
  }

  // 如果包含日文假名，判定為日文
  if (japaneseMatches > 0 && japaneseMatches / totalChars > 0.2) {
    return "ja";
  }

  // 預設為中文
  return "zh";
}

// 模式 key 對照（實際顯示文字改由 t() 取得）
const modeKeyMap: Record<string, string> = {
  answer: "hw_btn_answer",
  easy: "hw_btn_easy",
  pro: "hw_btn_pro",
  example: "hw_btn_example",
};

export default function HomeworkHelper() {
  const { t } = useTranslation();
  const canonicalUrl =
    "https://pomodoro-app-eight-rouge.vercel.app/tools/homework-helper";
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "作業解題工具",
    description: "作業解題工具，協助整理題目重點並產生步驟化解法。",
    url: canonicalUrl,
    inLanguage: "zh-TW",
  };
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "作業解題工具",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: "支援多模式解題與說明，適合學習與作業輔助。",
    url: canonicalUrl,
  };
  // ✅ 正式上線：移除 localhost 限制，允許所有環境存取

  // 🔍 判斷是否為本地端／開發環境
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("127.") ||
      window.location.hostname.startsWith("192.168.") ||
      import.meta.env.DEV || // Vite 開發模式
      import.meta.env.MODE === "development"); // 開發模式

  // 🔍 判斷是否為預覽模式（正式環境設為 false）
  const isPreview = false; // 正式環境：設為 false，表示會實際扣點

  // Mode 映射表：將前端模式映射到 Edge Function / Gemini 支援的模式
  const modeMap: Record<string, string> = {
    answer: "easy",
    easy: "kid",
    pro: "pro",
    example: "pro",
    // 保留舊的映射以向後相容
    answerOnly: "easy",
    simple: "kid",
    detailed: "pro",
    examples: "pro",
    kid: "kid",
  };

  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"answer" | "easy" | "pro" | "example">(
    "answer",
  );
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

  // 點數狀態
  const [remainingChars, setRemainingChars] = useState<number | null>(null);
  const [totalPurchasedPoints, setTotalPurchasedPoints] = useState<number>(0);
  const [totalUsedChars, setTotalUsedChars] = useState<number>(0);

  // 追蹤頁面瀏覽事件
  useEffect(() => {
    trackEvent("view_homework_solver");
  }, []);

  // 獲取用戶點數和購買總額
  useEffect(() => {
    if (!isLoggedIn()) return;

    const fetchUserCredits = async () => {
      try {
        // 1. 查詢剩餘點數（使用 remaining_chars 欄位）
        const data = await getCurrentCreditSummary();
        const error = null;

        if (error) {
          console.error("[HomeworkHelper] Fetch credits error:", error);
          return;
        }

        if (data) {
          setRemainingChars(data.remaining_chars ?? null);
        } else {
          // 如果沒有記錄，不自動初始化（讓 Edge Function 或後端處理）
          setRemainingChars(null);
        }

        // 2. 查詢用戶購買的總點數（從 purchase_logs 累加所有成功購買的 points）
        const purchaseLogs = [{ points: data.total_purchased_points }];
        const purchaseError = null;

        if (purchaseError) {
          console.error(
            "[HomeworkHelper] Fetch purchase logs error:",
            purchaseError,
          );
          setTotalPurchasedPoints(0);
          // 不 return，繼續執行後續的 usage_logs 查詢，確保已用點數能正確計算
        } else {
          // 計算總購買點數
          const totalPoints = purchaseLogs
            ? purchaseLogs.reduce((sum, log) => sum + (log.points || 0), 0)
            : 0;
          setTotalPurchasedPoints(totalPoints);
        }

        // 3. 查詢已用點數（從 usage_logs 累加）
        const usageLogs = [{ total_chars: data.total_used_chars }];
        const usageError = null;

        if (usageError) {
          console.error("[HomeworkHelper] Fetch usage logs error:", usageError);
          setTotalUsedChars(0);
        } else {
          // 計算總已用點數
          const totalUsed = usageLogs
            ? usageLogs.reduce((sum, log) => sum + (log.total_chars || 0), 0)
            : 0;
          setTotalUsedChars(totalUsed);
        }
      } catch (err) {
        console.error("[HomeworkHelper] Fetch credits error:", err);
      }
    };

    fetchUserCredits();
  }, []);

  // 錯誤訊息狀態
  const [error, setError] = useState<string>("");

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
  const getSpeechLang = (
    lang: "zh" | "en" | "ja",
  ): "zh-TW" | "en-US" | "ja-JP" => {
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

    // ✅ API 呼叫前檢查：正式開放後改為登入與點數制，不再提供基礎額度
    if (!isLoggedIn()) {
      alert(t("hw_please_login"));
      navigate("/login");
      return;
    }

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
    setError(""); // 清除之前的錯誤
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
      };

      // ✅ 如果有 userId，加入 payload（讓 Edge Function 可以扣點）
      const accessToken = getCustomSessionToken();
      if (!accessToken) {
        setError("請先登入後再使用作業助手");
        return;
      }

      const response = await fetch('/api/main?action=homework', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      const error = response.ok ? null : new Error(String(data?.error || 'HOMEWORK_REQUEST_FAILED'));

      // ✅ 1. 若 supabase.functions.invoke 回傳 error，顯示錯誤訊息但不阻擋結果顯示
      if (error) {
        // 📝 失敗：記錄 error
        // console.log('[Homework] Edge Function error:', error)

        // 處理錯誤（僅顯示提示，不阻擋）
        const errorMessage = error.message || String(error) || "";
        if (
          errorMessage.includes("INSUFFICIENT_CREDITS") ||
          errorMessage.includes("insufficient")
        ) {
          // 點數不足：僅顯示錯誤訊息，不阻擋結果顯示
          setError(t("hw_insufficient_credits"));
          // 追蹤基礎額度不足事件
          trackEvent("reach_homework_free_limit");
        } else {
          // 其他錯誤：顯示友善錯誤訊息
          console.error("❌ [作業解題 API] 錯誤：", error);
          setError(t("hw_error_retry"));
        }
        return;
      }

      // ✅ 2. 若成功，僅使用 data.result 顯示 AI 回答
      // 禁止任何 JSON.parse(text) 類型的處理，Supabase SDK 已自動處理 JSON
      if (data && typeof data === "object" && typeof data.result === "string") {
        // 直接使用 data.result，不進行任何 JSON 解析
        const resultText = data.result;

        // 📝 成功後：記錄 result
        // console.log('[Homework] Edge Function result:', resultText)

        // 🛡️ 記錄已解答的題目（避免重複呼叫）
        lastSolvedQuestionRef.current = question.trim();

        // 計算本次實際使用的點數（總額，用於顯示）
        const inputLength = question.trim().length;
        const outputLength = resultText.trim().length; // 使用 trim() 移除前後空白字符
        const totalAmount = inputLength + outputLength;

        // ✅ 記錄本次使用點數（用於顯示）
        setLastUsedPoints({
          inputLength,
          outputLength,
          totalUsedPoints: totalAmount,
        });

        // ✅ 更新點數（從 API response 讀取，與 SummaryPage 相同邏輯）
        const updateUsageStats = async () => {
          const usageSummary = await getCurrentCreditSummary();
          setTotalUsedChars(usageSummary.total_used_chars);
          setRemainingChars(usageSummary.remaining_chars);
        };

        const hasSession = isLoggedIn();
        // ✅ 更新點數：與摘要完全相同，先從 API 讀 balance / remaining_chars 再 setResult
        if (typeof data.balance === "number") {
          setRemainingChars(data.balance);
          if (hasSession) {
            await updateUsageStats();
          }
        } else if (typeof data.remaining_chars === "number") {
          setRemainingChars(data.remaining_chars);
          if (hasSession) {
            await updateUsageStats();
          }
        }

        // ✅ 設定結果（點數已先更新，與摘要 UI 流程一致）
        setResult(resultText);

        // 追蹤作業解題成功事件
        trackEvent("use_homework_solver", {
          subject: mode, // 'answer' | 'easy' | 'pro' | 'example'
          input_chars: inputLength,
          output_chars: outputLength,
        });
      } else if (data) {
        // 回傳格式錯誤，但仍有資料，顯示錯誤訊息
        console.error("❌ [作業解題 API] 回傳格式錯誤", data);
        setError(t("hw_error_retry"));
      }
    } catch (err: any) {
      // 📝 失敗：記錄未預期錯誤
      // console.log('[Homework] Edge Function error:', err)
      // 統一錯誤處理：UI 僅顯示友善錯誤訊息，不顯示 raw error string
      console.error("❌ [作業解題 API] 未預期錯誤：", err);
      setResult(t("hw_error_retry"));
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
                <div
                  key={index}
                  className="font-semibold text-blue-600 mt-3 first:mt-0"
                >
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
      <SEO
        title="作業解題助手｜步驟化解題與多語說明｜RxV"
        description="貼上題目取得步驟化說明與觀念提示；線上使用、無需下載。請依課程規範使用 AI，並自行驗算與改寫。"
        keywords="作業解題, AI 解題, 步驟說明, 學習工具"
        path="/tools/homework-helper"
        jsonLdList={[webPageJsonLd, softwareJsonLd]}
      />
      <section className="mb-5">
        <p className="text-sm font-semibold text-gray-800">
          適合誰用：學生段考複習、證照題檢核、需要步驟說明而非只要答案時。
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          作業解題工具可整理題目重點、產生步驟解析與多語言說明；線上使用、不需下載。請依課程規範使用
          AI，下方可搭配「相關工具／教學」延伸摘要與專注節奏。
        </p>
      </section>
      {/* 頁面標題與首頁按鈕 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex-1 text-center">
          🎓 {t("hw_title")}
        </h1>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base text-white"
          style={{ color: "#ffffff" }}
        >
          <span style={{ color: "#ffffff" }}>{t("hw_home")}</span>
        </Link>
      </div>

      {/* ⚠️ 已移除點數狀態顯示 */}

      {/* 【一、四種回答模式按鈕（grid 2x2）】 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { key: "answer", label: `🎯 ${t("hw_btn_answer")}` },
          { key: "easy", label: `👶 ${t("hw_btn_easy")}` },
          { key: "pro", label: `📘 ${t("hw_btn_pro")}` },
          { key: "example", label: `✨ ${t("hw_btn_example")}` },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setMode(item.key as any)}
            className={`w-full px-4 py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
              mode === item.key
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-blue-200 text-blue-600 bg-white hover:bg-blue-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 【二、語言切換（三顆同寬同高、文字置中）】 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { key: "zh", label: t("hw_lang_zh") },
          { key: "en", label: "English" },
          { key: "ja", label: t("hw_lang_ja") },
        ].map((item) => {
          const isActive = language === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setLanguage(item.key as "zh" | "en" | "ja")}
              className={`w-full h-11 inline-flex items-center justify-center rounded-xl text-sm font-semibold leading-none transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
                isActive
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-blue-200 text-blue-600 bg-white hover:bg-blue-50"
              }`}
            >
              <span className="block leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 語音輸入小提示 - 暫時隱藏 */}
      {false && (
        <div className="mt-2 text-xs text-gray-500 mb-3">
          💡 小提示：不想打字可以點右上角「🎤 語音輸入」，直接唸題目給 AI
          聽，系統會自動幫你轉成文字。
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
            placeholder={t("hw_placeholder")}
            className="w-full p-4 border rounded-xl text-lg outline-none resize-none"
            style={{ minHeight: "150px" }}
            rows={4}
          />
          {/* MVP 版本：移除題目區朗讀按鈕，僅保留文字輸入 */}
        </div>

        {/* 語音辨識狀態顯示 - 暫時隱藏 */}
        {false &&
          sttSupported &&
          (sttListening || sttError || sttTranscript) && (
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
            {t("hw_preview_hint")}
          </p>
        )}

        {/* 開始解題按鈕（主要按鈕 - 紫色漸層） */}
        <button
          onClick={() => {
            console.log("[HOMEWORK] button clicked");
            handleAnalyze();
          }}
          className="w-full font-bold py-4 px-4 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          style={{
            color: "#ffffff",
          }}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {loading ? t("hw_analyzing") : `🚀 ${t("hw_start_solve")}`}
          <span className="ml-3 text-xs text-white">
            {t("hw_mode_prefix")}
            {t(modeKeyMap[mode])}
          </span>
        </button>

        {/* 簡易提示 */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          <Link to="/points" className="text-blue-600 hover:underline">
            {t("hw_view_instructions")}
          </Link>
        </div>
      </div>
      {/* ===== 按鈕區 END ===== */}

      {/* ===== AI 回答區塊 START ===== */}
      <div className="shadow-md border rounded-2xl p-5 bg-white transition mb-5">
        {/* 模式標籤顯示（在結果上方） */}
        {result && (
          <div className="mb-2 text-sm text-gray-500">
            {t("hw_current_mode")}
            <span className="ml-1 font-semibold text-indigo-600">
              {t(modeKeyMap[mode])}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">🧠 {t("hw_ai_answer")}</h2>
          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={t("hw_copy_title")}
              >
                {copied ? (
                  <span className="text-green-600 text-sm font-medium">
                    ✓ {t("hw_copied")}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
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
            result ? "" : "text-gray-400 italic"
          }`}
          style={{
            maxHeight: "420px",
            overflowY: result ? "auto" : "visible",
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
            <span>{t("hw_not_started")}</span>
          )}
        </div>

        {/* 本次使用顯示 */}
        {lastUsedPoints && result && !loading && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t("hw_this_use")}</span>
              <span className="text-purple-600 font-semibold">
                {lastUsedPoints.totalUsedPoints.toLocaleString()}{" "}
                {t("hw_chars")}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("hw_input_output", {
                input: lastUsedPoints.inputLength.toLocaleString(),
                output: lastUsedPoints.outputLength.toLocaleString(),
              })}
            </p>
          </div>
        )}

        {/* 點數顯示 */}
        <div className="mt-3 text-sm text-gray-500 space-y-1">
          {isLoggedIn() ? (
            (() => {
              const FREE_TRIAL_CREDITS = 10000;
              // 總方案上限計算：
              // 1. 如果有購買記錄，則總額 = 購買總額 + 基礎額度
              // 2. 如果沒有購買記錄但剩餘點數 > 基礎額度，則總額 = 剩餘點數 + 已用點數（從 usage_logs）
              // 3. 否則總額 = 基礎額度
              const totalPlanLimit =
                totalPurchasedPoints > 0
                  ? totalPurchasedPoints + FREE_TRIAL_CREDITS // 購買的點數 + 基礎額度
                  : remainingChars !== null &&
                      remainingChars > FREE_TRIAL_CREDITS
                    ? remainingChars + totalUsedChars // 沒有購買記錄但剩餘點數超過基礎額度，使用剩餘點數 + 已用點數作為上限
                    : FREE_TRIAL_CREDITS; // 沒有購買，只顯示基礎額度

              // 已用點數計算：
              // 1. 優先使用從 usage_logs 查詢的已用點數（如果 > 0）
              // 2. 如果 usage_logs 沒有資料或為 0，但 remainingChars 有值，則計算已用點數
              // 3. 計算邏輯：
              //    - 如果有購買記錄：已用 = (購買點數 + 基礎額度) - 剩餘點數
              //    - 如果沒有購買記錄但剩餘點數 <= 基礎額度：已用 = 基礎額度 - 剩餘點數
              //    - 如果沒有購買記錄但剩餘點數 > 基礎額度：已用 = 總方案上限 - 剩餘點數
              let usedPoints = 0;

              if (totalUsedChars > 0) {
                // 優先使用從 usage_logs 查詢的已用點數
                usedPoints = totalUsedChars;
              } else if (remainingChars !== null) {
                if (totalPurchasedPoints > 0) {
                  // 如果有購買記錄，使用購買點數 + 基礎額度作為總額
                  const totalLimit = totalPurchasedPoints + FREE_TRIAL_CREDITS;
                  const calculatedUsed = totalLimit - remainingChars;
                  usedPoints = Math.max(0, calculatedUsed);
                } else if (remainingChars <= FREE_TRIAL_CREDITS) {
                  // 如果剩餘點數 <= 基礎額度，使用基礎額度計算
                  const calculatedUsed = FREE_TRIAL_CREDITS - remainingChars;
                  usedPoints = Math.max(0, calculatedUsed);
                } else {
                  // 如果沒有購買記錄但剩餘點數 > 基礎額度
                  // 嘗試從 totalPlanLimit 計算
                  if (totalPlanLimit > remainingChars) {
                    const calculatedUsed = totalPlanLimit - remainingChars;
                    usedPoints = Math.max(0, calculatedUsed);
                  } else {
                    // 如果無法準確計算，至少嘗試顯示差額
                    // 這種情況可能是用戶剛購買但 purchase_logs 還沒查詢到
                    usedPoints = 0;
                  }
                }
              }

              return (
                <>
                  <div>
                    {t("hw_used_points")}
                    {usedPoints.toLocaleString()}
                  </div>
                  <div>
                    {t("hw_remaining_points")}
                    {remainingChars !== null
                      ? remainingChars.toLocaleString()
                      : "—"}
                  </div>
                </>
              );
            })()
          ) : (
            <div className="text-gray-500">
              請登入後使用點數執行 AI 功能。
            </div>
          )}
        </div>

        {/* AI 回答免責聲明 */}
        {result && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("hw_disclaimer_ai")}
            </p>
          </div>
        )}
      </div>
      {/* ===== AI 回答區塊 END ===== */}

      {/* 💡 數學題輸入範例提示區塊 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-blue-600 text-lg">💡</span>
          <h3 className="font-semibold text-blue-900 text-sm">
            {t("hw_examples_title")}
          </h3>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <div className="font-medium text-blue-800 mb-1">
              {t("hw_example_1_title")}
            </div>
            <div className="text-gray-700 pl-2">{t("hw_example_1_desc")}</div>
          </div>

          <div>
            <div className="font-medium text-blue-800 mb-1">
              {t("hw_example_2_title")}
            </div>
            <div className="text-gray-700 pl-2">{t("hw_example_2_desc")}</div>
          </div>

          <div>
            <div className="font-medium text-blue-800 mb-1">
              {t("hw_example_3_title")}
            </div>
            <div className="text-gray-700 pl-2">{t("hw_example_3_desc")}</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-600">
          {t("hw_no_photo")}
        </div>
      </div>

      {/* 購買點數方案區塊 */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t("hw_purchase_title")}
          </h2>
          <p className="text-sm text-gray-700">{t("hw_purchase_desc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 標準方案 NT$99 */}
          <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-sm hover:shadow-md transition">
            <div className="text-center mb-4">
              <span className="text-3xl mb-2 block">💎</span>
              <h3 className="text-lg font-bold text-blue-900 mb-1">
                {t("hw_plan_standard")}
              </h3>
              <p className="text-xl font-bold text-blue-900">
                NT${PLANS.plan99.price}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getPlanChars("pack99").toLocaleString()}
                {t("hw_points_unit")}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                {t("hw_plan_standard_desc")}
              </p>
            </div>

            <Link
              to="/pricing"
              onClick={(e) => {
                if (!isLoggedIn()) {
                  e.preventDefault();
                  alert(t("hw_please_login"));
                  navigate("/login");
                  return;
                }
                trackEvent("click_homework_upgrade");
              }}
              className="block"
            >
              <PrimaryButton fullWidth className="mt-4">
                {t("hw_buy_points")}
              </PrimaryButton>
            </Link>
          </div>

          {/* 進階方案 NT$199 */}
          <div className="bg-white rounded-lg p-5 border-2 border-purple-300 shadow-sm hover:shadow-md transition">
            <div className="text-center mb-4">
              <span className="text-3xl mb-2 block">💎</span>
              <h3 className="text-lg font-bold text-purple-900 mb-1">
                {t("hw_plan_advanced")}
              </h3>
              <p className="text-xl font-bold text-purple-900">
                NT${PLANS.plan199.price}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getPlanChars("pack199").toLocaleString()}
                {t("hw_points_unit")}
              </p>
              <p className="text-sm text-purple-600 mt-2">
                {t("hw_plan_advanced_desc")}
              </p>
            </div>

            <Link
              to="/pricing"
              onClick={(e) => {
                if (!isLoggedIn()) {
                  e.preventDefault();
                  alert(t("hw_please_login"));
                  navigate("/login");
                  return;
                }
                trackEvent("click_homework_upgrade");
              }}
              className="block"
            >
              <PrimaryButton fullWidth className="mt-4">
                {t("hw_buy_points")}
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 方案說明卡片 */}
      <div className="mt-6">
        <PricingPlanCard />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">如何使用此工具？</h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          AI 協助解題工具，幫助理解作業題目並提供解題步驟。
        </p>

        <h3 className="font-semibold mt-4 mb-2">使用步驟</h3>
        <ol className="list-decimal ml-5 text-gray-600 space-y-1">
          <li>貼上題目</li>
          <li>生成解題說明</li>
          <li>檢查步驟</li>
        </ol>

        <h3 className="font-semibold mt-4 mb-2">適合使用情境</h3>
        <ul className="list-disc ml-5 text-gray-600 space-y-1">
          <li>數學作業</li>
          <li>理科題目</li>
          <li>課後複習</li>
        </ul>
      </section>

      {/* ===== 教學模式說明區塊 START ===== */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t("hw_teaching_title")}
        </h2>
        <div className="space-y-3 text-gray-700">
          <p className="text-sm leading-relaxed mb-4">
            {t("hw_teaching_intro")}
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔵</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("hw_mode_answer_teaching")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t("hw_mode_answer_desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl">🟢</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("hw_mode_easy_teaching")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t("hw_mode_easy_desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl">🟣</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("hw_mode_pro_teaching")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t("hw_mode_pro_desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl">🟠</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {t("hw_mode_example_teaching")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t("hw_mode_example_desc")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">{t("hw_supported_lang")}</p>
          </div>
        </div>
      </div>
      {/* ===== 教學模式說明區塊 END ===== */}

      {/* ⚠️ 已移除點數相關提示和狀態顯示 */}

      {/* 簡易點數顯示：僅顯示連結到完整說明頁 */}
      {result && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          <Link to="/points" className="text-blue-600 hover:underline">
            {t("hw_view_instructions")}
          </Link>
        </div>
      )}

      {/* ===== 免責聲明卡片 START（僅在有答案時顯示） ===== */}
      {result && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold mb-2 text-gray-700">
                {t("hw_disclaimer_title")}
              </p>
              <p className="mb-1">{t("hw_disclaimer_1")}</p>
              <p>{t("hw_disclaimer_2")}</p>
            </div>
          </div>
        </div>
      )}
      {/* ===== 免責聲明卡片 END ===== */}

      {/* SEO 內鏈 */}
      <p className="mt-6 text-sm text-gray-600 text-center">
        {t("hw_summary_promo")}{" "}
        <Link
          to="/summary"
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          {t("hw_summary_link")}
        </Link>
        {t("hw_summary_promo_suffix")}
      </p>

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
                {t("hw_modal_close")}
              </button>
              {modal.upgradeButton && (
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    trackEvent("click_homework_upgrade");
                    navigate("/points");
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
          <span>{t("hw_extended_desc")}</span>
          <a
            href="#extended-tools-resources"
            className="text-gray-500 hover:text-gray-700 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(
                "extended-tools-resources",
              );
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              }
            }}
          >
            {t("hw_extended_link")}
          </a>
        </p>
      </div>

      <section
        id="extended-tools-resources"
        className="mt-12 rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900">
          什麼是作業解題工具？
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          作業解題工具是一種常見的AI工具，可幫助使用者提升效率，適合用於工作、學習與日常應用。
        </p>

        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          為什麼使用這個工具？
        </h2>
        <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-600">
          <li>依實際使用點數扣除</li>
          <li>不需安裝</li>
          <li>支援快速處理</li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          常見使用情境
        </h3>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
          <li>段考與證照題：需要拆解步驟、比對自己是否算錯。</li>
          <li>申論與報告：先釐清題意再自行組織論點，避免直接交 AI 全文。</li>
          <li>
            語言切換：需英文／日文簡化說明時，可搭配語言按鈕理解後再重寫。
          </li>
        </ul>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          推薦搭配工具
        </h3>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          解題前可先用{" "}
          <Link to="/summary" className="text-blue-600 hover:underline">
            AI 摘要
          </Link>
          整理講義；排讀書計畫搭配{" "}
          <Link to="/pomodoro" className="text-blue-600 hover:underline">
            番茄鐘
          </Link>
          與{" "}
          <Link to="/todo" className="text-blue-600 hover:underline">
            待辦清單
          </Link>
          。下方「相關工具」卡片與教學連結與內鏈模組一致，可延伸閱讀。
        </p>

        <FotorAffiliateBlock />
        <RelatedTools
          items={getRelatedToolsItems("homework-helper")}
          title="相關工具"
        />
        <RelatedGuides items={getRelatedGuideItems("homework-helper")} />
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          作業解題工具是學習場景常見的 AI 工具，能幫你快速整理解題步驟，可用於複習與預習，讓日常功課更省時。若你想持續使用 AI 工具提升效率，作業解題工具很值得固定使用。
        </p>
        <div className="mt-8">
          <Link
            to="/tools"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
          >
            前往 RxV 工具中心瀏覽完整工具清單
          </Link>
        </div>
      </section>
    </div>
  );
}
