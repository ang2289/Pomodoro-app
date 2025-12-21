import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export function useSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary(content: string) {
    setLoading(true);
    setError(null);

    try {
      // ✅ 使用 supabase.functions.invoke 呼叫 auto-summary Edge Function
      console.log("🚀 呼叫 Supabase Edge Function：auto-summary");

      // 自動偵測語言
      const chineseRegex = /[\u4e00-\u9fa5]/;
      const detectedLang = chineseRegex.test(content) ? 'zh-TW' : 'en';

      const { data, error: invokeError } = await supabase.functions.invoke('auto-summary', {
        body: {
          content,
          lang: detectedLang,
        },
      });

      // 🛡️ 統一錯誤處理：使用 Supabase invoke 回傳的 error 物件判斷
      if (invokeError) {
        const errorMessage = invokeError.message || String(invokeError) || '';
        console.error("❌ Summary API Error:", invokeError);
        throw new Error(errorMessage || "API Error");
      }

      // 🛡️ 防呆：檢查 data 是否為有效物件
      if (!data || typeof data !== 'object') {
        console.error("❌ Summary API 回傳格式錯誤：data 不是物件", data);
        throw new Error("API 回傳格式錯誤");
      }

      // 處理回傳格式：統一讀取 data.result 作為摘要文字
      if (!data.result) {
        console.error("❌ Summary API 回傳格式錯誤：缺少 result 欄位", data);
        throw new Error("API 回傳格式錯誤");
      }

      return {
        summary: typeof data.result === 'string' ? data.result : String(data.result),
        result: typeof data.result === 'string' ? data.result : String(data.result),
      };
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { generateSummary, loading, error };
}

