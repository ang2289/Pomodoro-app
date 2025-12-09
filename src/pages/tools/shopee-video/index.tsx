// src/pages/tools/shopee-video/index.tsx

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useSingleVideo } from "./hooks/useSingleVideo";
import { useBatchVideo } from "./hooks/useBatchVideo";
import { canGenerateScript, canGenerateVideo } from "./utils/validators";
import { parseShopeeViaIframe } from "@/services/shopee-iframe";
import { generateVideoFromImages } from "@/services/video/generateVideoFromImages";
import { generateShopeeVideo } from "@/services/videoGenerator";
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
  const [product, setProduct] = useState<{ title: string; price: string; image: string } | null>(null);
  const [manualImage, setManualImage] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [manualVideoUrl, setManualVideoUrl] = useState<string>("");
  const [loadingStage, setLoadingStage] = useState<"idle" | "loading-ffmpeg" | "generating-video">("idle");
  const [videoError, setVideoError] = useState<Error | null>(null);

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

  // ⭐ 使用 iframe 解析 Shopee 商品（無法被封鎖的瀏覽器行為）
  const [parsing, setParsing] = useState(false);
  const handleParse = async () => {
    if (!productUrl.trim()) return;
    setParsing(true);
    try {
      console.log("開始解析 Shopee（Iframe 版本）:", productUrl.trim());

      const data = await parseShopeeViaIframe(productUrl.trim());
      
      console.log("Shopee 解析結果：", data);

      if (!data.title || data.title === "") {
        toast.error("商品解析失敗");
      } else {
        // 儲存商品資料用於預覽
        setProduct(data);

        // 設定商品名稱
        if (data.title) {
          setTitle(data.title);
        }

        // 設定價格
        if (data.price) {
          setPrice(data.price);
        }

        // 設定圖片（單張圖片）
        if (data.image) {
          // 清除現有圖片
          while (images.length > 0) {
            removeImage(0);
          }
          // 添加新圖片
          addImage(data.image);
        }

        toast.success("解析成功！");
      }
    } catch (err) {
      console.error("解析錯誤:", err);
      toast.error("抓取失敗，請換成完整的蝦皮商品頁網址（不能用短網址）");
    }
    setParsing(false);
  };

  // 安全版單張圖片上傳（保留原有功能）
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // 確保 Base64 正常存入
      setManualImage(String(reader.result));
    };
    reader.onerror = () => {
      console.error("圖片讀取失敗");
      toast.error("圖片讀取失敗");
    };
    reader.readAsDataURL(file);
  };

  // 多圖片上傳處理函式（累加模式，不覆蓋前一張）
  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    // 保留舊圖片 + 新選的圖片（累加模式）
    setUploadedImages(prev => [...prev, ...newFiles]);

    // 重置 input value，允許再次選擇相同的文件
    e.target.value = "";
  };

  // 根據狀態對應進度條百分比
  const getProgressPercent = () => {
    switch (loadingStage) {
      case "loading-ffmpeg":
        return 33;
      case "generating-video":
        return 66;
      default:
        return 100;
    }
  };

  // 從上傳的圖片產生影片
  const handleGenerateVideo = async () => {
    if (!uploadedImages || uploadedImages.length === 0) {
      toast.error("請至少上傳 1 張圖片！");
      return;
    }

    console.log("開始生成影片，圖片數量:", uploadedImages.length);
    setParsing(true);
    setLoadingStage("loading-ffmpeg");
    setVideoError(null);
    toast.loading("正在生成影片，請稍候...", { id: "video-generating" });

    try {
      console.log("調用 generateShopeeVideo...");
      const videoUrl = await generateShopeeVideo(uploadedImages, (stage) => {
        setLoadingStage(stage);
      });
      console.log("影片生成成功，URL:", videoUrl);
      
      if (!videoUrl) {
        throw new Error("影片 URL 為空");
      }
      
      // 清除舊的影片 URL（如果存在）
      setManualVideoUrl((prevUrl) => {
        if (prevUrl) {
          console.log("清除舊的影片 URL");
          URL.revokeObjectURL(prevUrl);
        }
        return videoUrl;
      });
      
      console.log("影片 URL 已設置到 state");
      localStorage.setItem("ffmpegCached", "true"); // 記錄快取狀態
      setLoadingStage("idle");
      toast.success("影片生成成功！", { id: "video-generating" });
    } catch (err: any) {
      console.error("影片生成錯誤:", err);
      console.error("錯誤詳情:", {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      const errorMessage = err?.message || "影片生成失敗，請再試一次";
      setVideoError(err);
      setLoadingStage("idle");
      toast.error(errorMessage, { id: "video-generating" });
      // 確保在錯誤時清除 loading 狀態和影片 URL
      setManualVideoUrl("");
    } finally {
      setParsing(false);
    }
  };

  // 為上傳的圖片創建 Object URL（用於預覽）
  const imagePreviewUrls = useMemo(() => {
    return uploadedImages.map((img) => URL.createObjectURL(img));
  }, [uploadedImages]);

  // 清理 Object URL 以避免內存洩漏
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

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
          {/* (A) 商品資訊 */}
          <SectionCard title="(A) 商品資訊">
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

              {/* 商品預覽（如果有解析結果） */}
              {product && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                  {product.title && (
                    <p className="text-gray-700 mb-1">商品名稱：{product.title}</p>
                  )}
                  {product.price && (
                    <p className="text-gray-700 mb-2">商品價格：{product.price}</p>
                  )}
                  {product.image && (
                    <img
                      src={product.image}
                      alt="product"
                      className="w-40 mt-2 border rounded"
                    />
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          {/* (B) 多圖片上傳 */}
          <SectionCard title="(B) 多圖片上傳">
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImages}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {/* 圖片預覽區 */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={imagePreviewUrls[i]}
                        alt={`預覽 ${i + 1}`}
                        className="w-full h-40 object-cover rounded shadow"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = uploadedImages.filter((_, idx) => idx !== i);
                          setUploadedImages(newImages);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="刪除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* (C) 產生影片 */}
          <SectionCard title="(C) 產生影片">
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGenerateVideo}
                disabled={parsing || loading || uploadedImages.length === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition"
              >
                {parsing ? "⏳ 正在生成..." : "🎬 產生影片"}
              </button>

              {/* ✅ 進度條區塊 */}
              {loadingStage !== "idle" && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${getProgressPercent()}%` }}
                  ></div>
                </div>
              )}

              {/* 狀態提示區塊 */}
              {loadingStage === "loading-ffmpeg" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold">
                    🛠️ FFmpeg 載入中...
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    正在從 CDN 下載約 20~30MB 的引擎文件，請保持網路穩定
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    首次使用可能需要 2-5 分鐘，請耐心等待...
                  </p>
                  <div className="mt-2">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </div>
              )}
              {loadingStage === "generating-video" && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 font-semibold">
                    🎬 正在合成影片中，請稍候...
                  </p>
                  <div className="mt-2">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                </div>
              )}
              {videoError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">
                    ❌ 影片產生錯誤
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {videoError.message}
                  </p>
                </div>
              )}

              {/* ✅ FFmpeg 已快取提示 */}
              {typeof window !== "undefined" && localStorage.getItem("ffmpegCached") === "true" && loadingStage === "idle" && manualVideoUrl && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700 text-center">
                    ⚡ FFmpeg 引擎已快取，下次使用將更快！
                  </p>
                </div>
              )}

              {/* 影片預覽 */}
              {manualVideoUrl && !parsing && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">生成的影片：</p>
                  <video
                    key={manualVideoUrl} // 強制重新渲染
                    controls
                    autoPlay
                    src={manualVideoUrl}
                    className="w-full max-w-md rounded-lg shadow mx-auto"
                    onError={(e) => {
                      console.error("影片載入錯誤:", e);
                      console.error("影片 URL:", manualVideoUrl);
                      toast.error("影片載入失敗，請檢查控制台");
                    }}
                    onLoadedData={() => {
                      console.log("影片載入成功，URL:", manualVideoUrl);
                    }}
                    onLoadStart={() => {
                      console.log("開始載入影片，URL:", manualVideoUrl);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    影片 URL: {manualVideoUrl.substring(0, 50)}...
                  </p>
                </div>
              )}
              
              {/* 調試信息（開發環境） */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-xs text-gray-400">
                  <p>Debug: manualVideoUrl = {manualVideoUrl ? "已設置" : "未設置"}</p>
                  <p>Debug: parsing = {parsing ? "true" : "false"}</p>
                  <p>Debug: uploadedImages.length = {uploadedImages.length}</p>
                </div>
              )}
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
