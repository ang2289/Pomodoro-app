import { useState } from "react";

export function useSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary(content: string) {
    setLoading(true);
    setError(null);

    try {
      // 🧩 使用統一的摘要 API：/api/summary
      // 不再需要檢查環境變數，直接使用 /api/summary
      console.log("🚀 呼叫摘要 API：/api/summary");

      // 🧩 使用統一的摘要 API：/api/summary
      // 透過 action: "generate" 來產生摘要
      const res = await fetch('/api/summary', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action: 'generate',
          content 
        }),
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

