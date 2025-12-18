// src/pages/tools/shopee-video/hooks/useSingleVideo.ts

import { useState } from "react";
import { generateVideoFromScript } from "@/services/video-api";

export function useSingleVideo() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [images, setImages] = useState<string[]>([]);
  const [script, setScript] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------------
  //   賣點管理
  // -------------------------
  const updateHighlight = (index: number, value: string) => {
    const list = [...highlights];
    list[index] = value;
    setHighlights(list);
  };

  const addHighlight = () => {
    if (highlights.length >= 3) return;
    setHighlights([...highlights, ""]);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length <= 1) return;
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // -------------------------
  //   圖片管理
  // -------------------------
  const updateImage = (index: number, value: string) => {
    const list = [...images];
    list[index] = value;
    setImages(list);
  };

  const setImage = (index: number, value: string) => {
    // 如果 index 超出範圍，先擴展陣列
    if (index >= images.length) {
      const newImages = [...images];
      while (newImages.length <= index) {
        newImages.push("");
      }
      newImages[index] = value;
      setImages(newImages);
    } else {
      updateImage(index, value);
    }
  };

  const addImage = (value: string = "") => {
    setImages([...images, value]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // -------------------------
  //   產生腳本 API
  // -------------------------
  const generateScript = async () => {
    if (!title.trim()) {
      setError("請輸入商品名稱");
      return;
    }

    const cleanHighlights = highlights.filter((h) => h.trim());
    if (cleanHighlights.length === 0) {
      setError("請至少填 1 個賣點");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/commerce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "shopeeGenerateScript",
          title,
          price: price || undefined,
          highlights: cleanHighlights,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setScript(data.script || "");
    } catch (err: any) {
      setError("腳本產生失敗：" + (err.message || "未知錯誤"));
    }

    setLoading(false);
  };

  // -------------------------
  //   產生影片 API
  // -------------------------
  const generateVideo = async () => {
    const cleanHighlights = highlights.filter((h) => h.trim());

    if (!title.trim() || cleanHighlights.length === 0 || images.length === 0) {
      setError("請補齊商品資訊（名稱、賣點、圖片）再產生影片");
      return;
    }

    if (!script) {
      setError("請先產生腳本");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const outputUrl = await generateVideoFromScript({
        title,
        price: price || undefined,
        images,
        script,
      });

      setVideoUrl(outputUrl);
    } catch (err: any) {
      setError("影片產生失敗：" + (err.message || "未知錯誤"));
    }

    setLoading(false);
  };

  return {
    title,
    price,
    highlights,
    images,
    script,
    videoUrl,
    loading,
    error,

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
  };
}

