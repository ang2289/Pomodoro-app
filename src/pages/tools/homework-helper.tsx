import { useState } from "react";
import { getGeminiAnswer } from "@/services/gemini";

export default function HomeworkHelper() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"answerOnly" | "simple" | "detailed" | "examples">("answerOnly");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!question) return;
    setLoading(true);
    setResult("思考中...");
    try {
      const res = await getGeminiAnswer(question, mode);
      setResult(res);
    } catch (err) {
      console.error("❌ 錯誤", err);
      setResult("❌ 無法取得回答，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎓 作業解題神器</h1>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as any)}
        className="mb-4 border rounded p-2"
      >
        <option value="answerOnly">🎯 只秀答案（預設）</option>
        <option value="simple">🧒 簡單解釋模式（小學生）</option>
        <option value="detailed">📘 詳細說明模式（中學生）</option>
        <option value="examples">🧠 舉例模式（生活應用）</option>
      </select>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="請輸入你想問的問題，例如：為什麼天空是藍色？"
        className="w-full p-2 border rounded mb-4"
        rows={4}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "分析中..." : "開始解題"}
      </button>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded whitespace-pre-wrap">
          <h2 className="font-semibold mb-2">🧠 AI 回答：</h2>
          {result}
        </div>
      )}
    </div>
  );
}