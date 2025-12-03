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

// 下載 CSV 工具函式
function exportToCSV(items: any[]) {
  if (!items || items.length === 0) {
    console.error("商品陣列為空，無法下載 CSV");
    return;
  }

  // CSV 標題列
  const headers = [
    "title",
    "price",
    "discount_price",
    "product_link",
    "image",
    "shop_name",
    "sold",
    "rating",
    "price_min",
    "price_max"
  ];

  // 轉換資料為 CSV 格式
  const csvRows = [headers.join(",")];

  items.forEach((item) => {
    const row = [
      `"${(item.title || item.name || "").replace(/"/g, '""')}"`, // title
      item.price || item.price_min || "", // price
      item.discount_price || "", // discount_price
      `"${(item.product_link || item.url || "").replace(/"/g, '""')}"`, // product_link
      `"${(item.image || "").replace(/"/g, '""')}"`, // image
      `"${(item.shop_name || item.shop || "").replace(/"/g, '""')}"`, // shop_name
      item.sold || "", // sold
      item.rating || "", // rating
      item.price_min || item.price || "", // price_min
      item.price_max || item.price || "" // price_max
    ];
    csvRows.push(row.join(","));
  });

  // 建立 CSV 內容（UTF-8 BOM 確保 Excel 正確顯示中文）
  const csvContent = "\uFEFF" + csvRows.join("\n");

  // 建立 Blob 並下載
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shopee_items.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// 生成短影音腳本函式
function generateVideoScript(item: any) {
  const title = item.title || item.name || "商品";
  const price = item.price || item.discount_price || 0;
  const sold = item.sold || 0;
  const rating = item.rating || 0;

  // Hook Line（開場吸引）
  const hookLines = [
    `這個你一定要看！${title}竟然只要${price}元？`,
    `我找到一個超好用的${title}，價格超驚人！`,
    `${title}開箱實測，結果讓我超意外！`,
    `這個${title}真的值得買嗎？我來告訴你真相！`,
    `發現一個超值的${title}，CP值爆表！`
  ];
  const hook_line = hookLines[Math.floor(Math.random() * hookLines.length)];

  // Selling Points（亮點文案，3-5 點）
  const sellingPoints = [];
  
  if (price < 500) {
    sellingPoints.push(`超低價只要 ${price} 元，CP值超高`);
  } else if (price < 2000) {
    sellingPoints.push(`價格 ${price} 元，性價比超優`);
  } else {
    sellingPoints.push(`高品質商品，價格 ${price} 元`);
  }

  if (sold > 1000) {
    sellingPoints.push(`熱銷 ${sold}+ 件，超多人買過`);
  } else if (sold > 100) {
    sellingPoints.push(`已售出 ${sold} 件，口碑不錯`);
  }

  if (rating >= 4.5) {
    sellingPoints.push(`評價 ${rating} 顆星，品質有保證`);
  } else if (rating >= 4.0) {
    sellingPoints.push(`評價 ${rating} 顆星，值得信賴`);
  }

  sellingPoints.push(`商品名稱：${title}`);
  sellingPoints.push(`點連結查看詳細資訊`);

  const selling_points = sellingPoints.slice(0, Math.min(5, sellingPoints.length)).join(" | ");

  // Short Video Script（10-15 秒腳本，3 段式）
  const scriptParts = [
    hook_line,
    "",
    selling_points,
    "",
    `👉 想看更多詳情，我把連結放在下方！\n趕快點進去看看，錯過就沒了！`
  ];
  const short_video_script = scriptParts.join("\n");

  // Suggested Hashtags
  const categoryKeywords = title.split(/[\s\-_]+/).filter(w => w.length > 1).slice(0, 3);
  const hashtags = [
    "#蝦皮購物",
    "#好物推薦",
    "#CP值",
    ...categoryKeywords.map(k => `#${k}`),
    "#開箱",
    "#購物分享"
  ].slice(0, 8).join(" ");

  // Target Audience
  let target_audience = "一般消費者";
  if (price < 500) {
    target_audience = "預算有限、追求CP值的消費者";
  } else if (price < 2000) {
    target_audience = "注重性價比的中等預算消費者";
  } else {
    target_audience = "追求品質的高預算消費者";
  }

  return {
    hook_line,
    selling_points,
    short_video_script,
    suggested_hashtags: hashtags,
    target_audience
  };
}

// 下載短影音 CSV（高佣分析＋腳本版）
function exportToVideoCSV(items: any[]) {
  if (!items || items.length === 0) {
    console.error("商品陣列為空，無法下載 CSV");
    return;
  }

  // CSV 標題列
  const headers = [
    "title",
    "price",
    "discount_price",
    "sold",
    "rating",
    "image_url",
    "product_link",
    "commission_rate",
    "estimated_commission",
    "commission_category",
    "hook_line",
    "selling_points",
    "short_video_script",
    "suggested_hashtags",
    "target_audience"
  ];

  // 轉換資料為 CSV 格式
  const csvRows = [headers.join(",")];

  items.forEach((item) => {
    const price = parseFloat(item.price || item.discount_price || 0);
    const discountPrice = parseFloat(item.discount_price || item.price || 0);
    
    // 計算佣金率（預設 0.10，若價格 < 500 改為 0.03）
    const commission_rate = price < 500 ? 0.03 : 0.10;
    
    // 計算預估佣金
    const estimated_commission = discountPrice * commission_rate;
    
    // 佣金分類
    let commission_category = "低佣";
    if (commission_rate >= 0.10) {
      commission_category = "高佣";
    } else if (commission_rate >= 0.05) {
      commission_category = "中佣";
    }

    // 生成短影音腳本
    const scriptData = generateVideoScript(item);

    const row = [
      `"${(item.title || item.name || "").replace(/"/g, '""')}"`, // title
      price || "", // price
      discountPrice || "", // discount_price
      item.sold || "", // sold
      item.rating || "", // rating
      `"${(item.image_url || item.image || "").replace(/"/g, '""')}"`, // image_url
      `"${(item.product_link || item.url || "").replace(/"/g, '""')}"`, // product_link
      commission_rate.toFixed(2), // commission_rate
      estimated_commission.toFixed(2), // estimated_commission
      commission_category, // commission_category
      `"${scriptData.hook_line.replace(/"/g, '""')}"`, // hook_line
      `"${scriptData.selling_points.replace(/"/g, '""')}"`, // selling_points
      `"${scriptData.short_video_script.replace(/"/g, '""').replace(/\n/g, '\\n')}"`, // short_video_script
      `"${scriptData.suggested_hashtags.replace(/"/g, '""')}"`, // suggested_hashtags
      `"${scriptData.target_audience.replace(/"/g, '""')}"` // target_audience
    ];
    csvRows.push(row.join(","));
  });

  // 建立 CSV 內容（UTF-8 BOM 確保 Excel 正確顯示中文）
  const csvContent = "\uFEFF" + csvRows.join("\n");

  // 建立 Blob 並下載
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shopee_video_materials.csv";
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
                  console.log("搜尋結果：", data);
                  
                  // 處理新的 API 回應格式：可能是 data.items 或 data.data
                  const items = data.items || data.data || [];
                  setItems(items);
                  
                  // 顯示商品筆數
                  const itemCount = items.length;
                  if (itemCount > 0) {
                    console.log(`找到 ${itemCount} 筆商品`);
                  } else {
                    console.log("未找到商品");
                  }
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
                  <h3>共找到 {items.length} 筆商品</h3>

                  {/* 下載 CSV 按鈕 */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => exportToCSV(items)}
                      disabled={items.length === 0}
                      style={{
                        padding: "8px 16px",
                        background: items.length === 0 ? "#ccc" : "#28a745",
                        color: "white",
                        borderRadius: "4px",
                        border: "none",
                        cursor: items.length === 0 ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      下載 CSV（{items.length} 筆商品）
                    </button>

                    {/* 下載短影音 CSV（高佣分析＋腳本版） */}
                    <button
                      onClick={() => exportToVideoCSV(items)}
                      disabled={items.length === 0}
                      style={{
                        padding: "8px 16px",
                        background: items.length === 0 ? "#ccc" : "#6a5acd",
                        color: "white",
                        borderRadius: "4px",
                        border: "none",
                        cursor: items.length === 0 ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      }}
                    >
                      下載短影音 CSV（高佣分析＋腳本版）
                    </button>
                  </div>

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
