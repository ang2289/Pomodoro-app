import { useState } from "react";

export function useSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary(content: string) {
    setLoading(true);
    setError(null);

    try {
      if (!import.meta.env.VITE_SUMMARY_FUNCTION_URL) {
        throw new Error("SUMMARY FUNCTION URL 不存在，請確認環境變數 VITE_SUMMARY_FUNCTION_URL 已於 Vercel 設定");
      }

      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error("VITE_SUPABASE_ANON_KEY 不存在，請確認環境變數已於 Vercel 設定");
      }

      console.log("🚀 呼叫摘要 API：", import.meta.env.VITE_SUMMARY_FUNCTION_URL);

      const res = await fetch(import.meta.env.VITE_SUMMARY_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("❌ Summary API Error:", data);
        throw new Error(data?.error ?? "API Error");
      }

      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { generateSummary, loading, error };
}

