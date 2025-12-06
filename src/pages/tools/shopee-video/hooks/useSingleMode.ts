import { useState } from "react";
import { generateVideoFromScript } from "@/services/video-api";
import { generateScript } from "@/services/script-api";
import { parseProductId, expandShortUrl } from "../utils/helpers";
import { validateProductInfo } from "../utils/validators";

export function useSingleMode() {
  const [productUrl, setProductUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [images, setImages] = useState<string[]>([]);
  const [script, setScript] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- URL 處理 ---
  const handleUrlInput = async () => {
    if (!productUrl.trim()) {
      setError("請輸入商品網址");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let finalUrl = productUrl;

      if (productUrl.includes("s.shopee.tw")) {
        try {
          finalUrl = await expandShortUrl(productUrl);
        } catch {}
      }

      const productId = parseProductId(finalUrl);
      if (!productId && !finalUrl.includes("/product/")) {
        setError("無法解析商品 ID，請確認網址格式");
      }
    } catch {
      setError("網址處理失敗");
    }

    setLoading(false);
  };

  // --- 賣點 ---
  const addHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const updateHighlight = (index: number, text: string) => {
    const list = [...highlights];
    list[index] = text;
    setHighlights(list);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((_, i) => i !== index));
    }
  };

  // --- 圖片 ---
  const addImage = (url: string) => {
    setImages([...images, url]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // --- 產生腳本 ---
  const handleGenerateScript = async () => {
    if (!title.trim()) {
      setError("請輸入商品名稱");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateScript({
        title,
        price: price || undefined,
        highlights: highlights.filter((h) => h.trim()),
      });

      setScript(result.script || "");
    } catch (err: any) {
      setError("腳本生成失敗：" + err.message);
    }

    setLoading(false);
  };

  // --- 產生影片 ---
  const handleGenerateVideo = async () => {
    const ok = validateProductInfo({ title, price, highlights, images });
    if (!ok) {
      setError("請補齊商品資訊：名稱 / 賣點 / 圖片");
      return;
    }

    if (!script) {
      setError("請先產生腳本");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = await generateVideoFromScript({
        title,
        price,
        images,
        script,
      });

      setVideoUrl(url);
    } catch (err: any) {
      setError("影片產生失敗：" + err.message);
    }

    setLoading(false);
  };

  return {
    productUrl, setProductUrl,
    title, setTitle,
    price, setPrice,
    highlights, setHighlights,
    images, setImages,
    script, setScript,
    videoUrl,
    loading,
    error, setError,

    handleUrlInput,
    addHighlight,
    updateHighlight,
    removeHighlight,
    addImage,
    removeImage,
    handleGenerateScript,
    handleGenerateVideo,
  };
}
