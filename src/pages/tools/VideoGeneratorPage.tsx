import React, { useState } from "react";

export default function VideoGeneratorPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCsvFile(f);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1); // skip header
      const parsed = lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => {
          const [title, url, img] = l.split(",");
          return { title, url, img };
        });

      setItems(parsed);
    };
    reader.readAsText(f);
  }

  async function startGenerate() {
    if (items.length === 0) return;
    setIsGenerating(true);
    setLogs((prev) => [...prev, `開始產生 ${items.length} 支影片…`]);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      setLogs((prev) => [...prev, `▶ 處理第 ${i + 1} 支：${it.title}`]);

      await new Promise((res) => setTimeout(res, 800)); // 模擬影片產生
      setLogs((prev) => [...prev, `✔ 完成：${it.title}`]);
    }

    setLogs((prev) => [...prev, "🎉 所有影片已完成"]);
    setIsGenerating(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">批次短影音產生器（MVP）</h1>

      <div className="border p-4 rounded-lg mb-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">上傳 CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="border px-3 py-2 rounded"
        />
      </div>

      {items.length > 0 && (
        <div className="border p-4 rounded-lg mb-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">
            商品清單（共 {items.length} 項）
          </h2>
          <ul className="list-disc ml-6 text-gray-700">
            {items.slice(0, 10).map((it, i) => (
              <li key={i}>{it.title}</li>
            ))}
          </ul>
          {items.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">
              …其餘 {items.length - 10} 項省略
            </p>
          )}
        </div>
      )}

      <button
        onClick={startGenerate}
        disabled={isGenerating || items.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded disabled:opacity-50"
      >
        {isGenerating ? "處理中…" : "開始批次產生影片"}
      </button>

      <div className="border p-4 rounded-lg mt-6 bg-gray-50 h-64 overflow-auto text-sm">
        <pre>{logs.join("\n")}</pre>
      </div>
    </div>
  );
}

