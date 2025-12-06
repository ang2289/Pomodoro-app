// src/pages/tools/shopee-video/index.tsx

import { useState } from "react";
import toast from "react-hot-toast";
import { useSingleVideo } from "./hooks/useSingleVideo";
import { useBatchVideo } from "./hooks/useBatchVideo";
import { canGenerateScript, canGenerateVideo } from "./utils/validators";
import TabSwitcher from "./components/TabSwitcher";
import SectionCard from "./components/SectionCard";
import HighlightsEditor from "./components/HighlightsEditor";
import ImagesUploader from "./components/ImagesUploader";
import ScriptCard from "./components/ScriptCard";
import VideoPreview from "./components/VideoPreview";
import BatchTaskCard from "./components/BatchTaskCard";

export default function ShopeeVideoPage() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [productUrl, setProductUrl] = useState("");

  // 單支模式 hook
  const {
    title,
    price,
    highlights,
    images,
    script,
    setTitle,
    setPrice,
    setScript,
    updateHighlight,
    addHighlight,
    removeHighlight,
    updateImage,
    setImage,
    addImage,
    removeImage,
    generateScript,
    generateVideo,
    videoUrl,
    loading,
  } = useSingleVideo();

  // 解析 Shopee 商品網址（使用 Mobile API）
  const [parsing, setParsing] = useState(false);
  const handleParse = async () => {
    const cleanUrl = productUrl.trim();
    if (!cleanUrl) {
      toast.error("請輸入蝦皮網址");
      return;
    }

    setParsing(true);
    try {
      const res = await fetch(`/api/shopee-parse?url=${encodeURIComponent(cleanUrl)}`);
      const data = await res.json();

      console.log("Shopee 解析結果:", data);

      // 處理新的回應格式 (success) 或舊格式 (ok)
      if (data.error || (!data.success && !data.ok)) {
        toast.error(data.message || data.msg || "無法解析商品網址");
        setParsing(false);
        return;
      }

      // 自動填入商品名稱
      setTitle(data.title || "");

      // 自動填入價格（如果有的話）
      if (data.price) {
        setPrice(data.price);
      }

      // 處理圖片：新格式使用 image（單張），舊格式使用 images（陣列）
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        // 舊格式：多張圖片陣列
        while (images.length > 0) {
          removeImage(0);
        }
        data.images.forEach((img: string) => {
          addImage(img);
        });
      } else if (data.image) {
        // 新格式：單張圖片
        if (images.length === 0) {
          addImage(data.image);
        } else {
          setImage(0, data.image);
        }
      }

      toast.success("解析成功！");
    } catch (err) {
      console.error("解析錯誤：", err);
      toast.error("解析錯誤");
    } finally {
      setParsing(false);
    }
  };

  // 批次模式 hook
  const {
    batchUrls,
    setBatchUrls,
    tasks,
    loading: batchLoading,
    createBatchTasks,
    updateTask,
    generateScript: generateBatchScript,
    generateVideo: generateBatchVideo,
  } = useBatchVideo();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 頁面標題 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">
          🎬 Shopee 自動短影片產生器
        </h1>
        <p className="text-gray-600">
          輸入商品網址與資訊 → 自動產生短影音腳本與影片
        </p>
      </div>

      {/* 模式切換 */}
      <TabSwitcher currentMode={mode} onChange={setMode} />

      {/* URL 輸入區塊（最上方） */}
      {mode === "single" && (
        <SectionCard title="商品網址解析">
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-2">
              商品網址
            </label>
            <div style={{ display: "flex", gap: "16px", width: "100%", alignItems: "center" }}>
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                disabled={false}
                readOnly={false}
                style={{
                  fontSize: "16px",
                  minHeight: "52px",
                  height: "52px",
                  lineHeight: "1.5",
                  flex: "1 1 0%",
                  minWidth: "300px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  margin: "0",
                  outline: "none",
                  display: "block",
                  pointerEvents: "auto",
                  cursor: "text",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="例如：https://shopee.tw/product/344095175/8554568924"
              />
              <button
                type="button"
                onClick={handleParse}
                disabled={parsing || loading || !productUrl.trim()}
                style={{ 
                  minWidth: "100px", 
                  height: "52px",
                  fontSize: "16px",
                  fontWeight: "600",
                  flexShrink: "0",
                  padding: "0 20px",
                  borderRadius: "12px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  cursor: parsing || loading || !productUrl.trim() ? "not-allowed" : "pointer",
                  opacity: parsing || loading || !productUrl.trim() ? 0.5 : 1,
                  margin: "0",
                }}
              >
                解析
              </button>
            </div>
            <p className="text-sm text-gray-500">
              貼上商品網址後點擊「解析」，將自動填入商品名稱和封面圖片
            </p>
          </div>
        </SectionCard>
      )}

      {/* 單支模式 */}
      {mode === "single" && (
        <div className="space-y-10">
          {/* (A) 影片資訊輸入 */}
          <SectionCard title="(A) 影片資訊輸入">
            <div className="space-y-6">

              {/* 商品名稱 */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  商品名稱 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-[52px] rounded-xl border border-gray-300 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="例如：超值保養品組合"
                />
              </div>

              {/* 商品價格 */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  商品價格（選填）
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-[52px] rounded-xl border border-gray-300 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="例如：299"
                />
              </div>

              {/* 商品賣點 */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  商品賣點 *（可填 1～3 點）
                </label>
                <HighlightsEditor
                  highlights={highlights}
                  onChange={(newHighlights) => {
                    // 同步整個陣列：先更新現有的，再新增/刪除
                    const maxLen = Math.max(highlights.length, newHighlights.length);
                    for (let i = 0; i < maxLen; i++) {
                      if (i < newHighlights.length && i < highlights.length) {
                        if (newHighlights[i] !== highlights[i]) {
                          updateHighlight(i, newHighlights[i]);
                        }
                      } else if (i < newHighlights.length && i >= highlights.length) {
                        addHighlight();
                        updateHighlight(i, newHighlights[i]);
                      }
                    }
                    // 移除多餘的
                    while (highlights.length > newHighlights.length) {
                      removeHighlight(highlights.length - 1);
                    }
                  }}
                />
              </div>
            </div>
          </SectionCard>

          {/* (B) 圖片上傳區 */}
          <ImagesUploader
            images={images}
            updateImage={updateImage}
            addImage={addImage}
            removeImage={removeImage}
          />

          {/* (C) 產生腳本與影片 */}
          <SectionCard title="(C) 產生腳本與影片">
            <div className="space-y-6">
              {/* 按鈕 */}
              <div className="space-y-3">
                <button
                  onClick={generateScript}
                  disabled={loading || !canGenerateScript({ title, price, highlights, images })}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ 產生腳本
                </button>
                <button
                  onClick={generateVideo}
                  disabled={loading || !canGenerateVideo(script, images)}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎥 產生影片
                </button>
              </div>

              {/* 腳本 */}
              <ScriptCard script={script} onChange={setScript} />

              {/* 影片預覽 */}
              <VideoPreview videoUrl={videoUrl} />
            </div>
          </SectionCard>
        </div>
      )}

      {/* 批次模式 */}
      {mode === "batch" && (
        <div className="space-y-10">
          {/* 批次網址輸入 */}
          <SectionCard title="批次網址輸入">
            <div className="space-y-4">
              <textarea
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                style={{
                  fontSize: "16px",
                  minHeight: "150px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
                placeholder="每行一個商品網址&#10;例如：&#10;https://shopee.tw/product/344095175/8554568924&#10;https://shopee.tw/product/123456/789012"
              />
              <button
                onClick={createBatchTasks}
                className="w-full h-[52px] rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition"
              >
                建立批次任務
              </button>
            </div>
          </SectionCard>

          {/* 批次任務列表 */}
          {tasks.map((task, idx) => (
            <BatchTaskCard
              key={task.id}
              task={task}
              taskIndex={idx}
              onUpdate={updateTask}
              onGenerateScript={generateBatchScript}
              onGenerateVideo={generateBatchVideo}
              loading={batchLoading}
            />
          ))}
        </div>
      )}

      {/* Loading 狀態 */}
      {(loading || batchLoading) && (
        <div className="text-center text-lg text-indigo-600 mt-6">
          ⏳ 處理中…請稍候
        </div>
      )}
    </div>
  );
}
