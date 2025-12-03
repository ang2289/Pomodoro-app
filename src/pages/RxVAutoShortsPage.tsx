import React, { useState } from "react";

// 下載 JSON 工具函式
function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RxVAutoShortsPage() {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);
  const [scriptLoading, setScriptLoading] = useState(false);

  return (
    <div style={{ padding: "24px" }}>
      <h1>RxV AI 自動短影音工廠</h1>

      {/* Step 1：來源選擇區塊 */}
      <div style={{ marginTop: "20px", paddingBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <h2>選擇內容來源</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>

          {/* A：蝦皮（可用） */}
          <button
            onClick={() => setSelectedSource("A")}
            style={{ padding: "12px", border: "1px solid #aaa" }}
          >
            來源 A：蝦皮商品（自動抓取前 100 筆）
          </button>

          {/* B：文章（Disable） */}
          <button
            disabled
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              color: "#999",
              background: "#f7f7f7",
              cursor: "not-allowed"
            }}
          >
            來源 B：文章網址 → 自動摘要短影音（開發中）
          </button>

          {/* C：YouTube（Disable） */}
          <button
            disabled
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              color: "#999",
              background: "#f7f7f7",
              cursor: "not-allowed"
            }}
          >
            來源 C：YouTube → Shorts 腳本（開發中）
          </button>

          {/* D：文字 → 影片（Disable） */}
          <button
            disabled
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              color: "#999",
              background: "#f7f7f7",
              cursor: "not-allowed"
            }}
          >
            來源 D：自訂文字 → 自動影片（開發中）
          </button>

          {/* E：DM（Disable） */}
          <button
            disabled
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              color: "#999",
              background: "#f7f7f7",
              cursor: "not-allowed"
            }}
          >
            來源 E：圖片 + 亮點文字 → DM 短影音（開發中）
          </button>

        </div>
      </div>

      {/* Step 2：動態 UI */}
      <div style={{ marginTop: "32px" }}>
        {selectedSource === "" && <p>請先選擇來源 A（蝦皮）。</p>}

        {/* 只有來源 A 可以使用 */}
        {selectedSource === "A" && (
          <div>
            <h2>來源 A：蝦皮商品</h2>
            <label>輸入商品關鍵字：</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例如：保養、奶茶杯、氣炸鍋"
              style={{ padding: "8px", width: "260px", marginRight: "8px" }}
            />
            <button
              onClick={async () => {
                if (!keyword) return alert("請輸入關鍵字");

                setLoading(true);

                try {
                  const res = await fetch(`/api/shopee-search?keyword=${encodeURIComponent(keyword)}`);
                  const data = await res.json();
                  setItems(data);
                } catch (error) {
                  console.error("抓取商品失敗:", error);
                  alert("抓取商品失敗，請稍後再試");
                } finally {
                  setLoading(false);
                }
              }}
              style={{ padding: "8px 16px" }}
              disabled={loading}
            >
              {loading ? "抓取中…" : "抓取前 100 筆商品"}
            </button>

            {/* 顯示商品清單 */}
            <div style={{ marginTop: "30px" }}>
              {loading && <p>抓取中…</p>}

              {items.length > 0 && (
                <div>
                  <h3>共 {items.length} 筆結果</h3>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "16px",
                    marginTop: "20px"
                  }}>
                    {items.map(item => (
                      <div key={item.id} style={{ border: "1px solid #ccc", padding: "12px", borderRadius: "8px" }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", borderRadius: "6px" }} />
                        <h4 style={{ marginTop: "8px", fontSize: "16px" }}>{item.name}</h4>
                        <p>價格：${item.price}</p>
                        <p>已售：{item.sold}</p>
                        <p>⭐ {item.rating}</p>
                        <a href={item.url} target="_blank" rel="noreferrer">查看商品</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 批次產生腳本按鈕 */}
            {items.length > 0 && (
              <>
                <button
                  style={{ padding: "12px 20px", marginTop: "30px", background: "#6a5acd", color: "white", borderRadius: "6px" }}
                  onClick={async () => {
                    if (items.length === 0) return alert("請先抓商品");

                    setScriptLoading(true);

                    try {
                      const res = await fetch("/api/shopee-batch-script", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ items })
                      });

                      const data = await res.json();
                      setScripts(data);
                    } catch (error) {
                      console.error("產生腳本失敗:", error);
                      alert("產生腳本失敗，請稍後再試");
                    } finally {
                      setScriptLoading(false);
                    }
                  }}
                  disabled={scriptLoading}
                >
                  {scriptLoading ? "正在產生腳本…" : "產生 100 筆短影片腳本"}
                </button>

                {scriptLoading && <p>正在產生腳本，請稍候…</p>}

                {scripts.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <h3>已產生 {scripts.length} 筆影片腳本</h3>

                    <button
                      style={{
                        padding: "8px 16px",
                        marginBottom: "12px",
                        background: "#4caf50",
                        color: "white",
                        borderRadius: "4px",
                      }}
                      onClick={() => downloadJSON(scripts, "scripts.json")}
                    >
                      下載全部腳本（scripts.json）
                    </button>

                    <pre style={{ background: "#f4f4f4", padding: "12px", borderRadius: "8px", maxHeight: "400px", overflow: "auto" }}>
                      {JSON.stringify(scripts[0], null, 2)}
                    </pre>

                    <p>（僅顯示第 1 筆預覽，實際已產生全部）</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
