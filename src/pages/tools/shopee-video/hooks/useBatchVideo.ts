// src/pages/tools/shopee-video/hooks/useBatchVideo.ts

import { useState } from "react";
import { generateVideoFromScript } from "@/services/video-api";

export interface BatchTask {
  id: string;
  productUrl: string;
  productId: string | null;
  title: string;
  price: string;
  highlights: string[];
  images: string[];
  script?: string;
  videoUrl?: string;
}

export function useBatchVideo() {
  const [batchUrls, setBatchUrls] = useState("");
  const [tasks, setTasks] = useState<BatchTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // 解析 Shopee 商品 ID（網址解析，不抓 API）
  // --------------------------------------------------
  const parseProductId = (url: string): string | null => {
    if (!url) return null;

    // 正式格式：/product/{shopid}/{itemid}
    const match = url.match(/\/product\/(\d+)\/(\d+)/);
    if (match) return `${match[1]}_${match[2]}`;

    return null; // 無法解析
  };

  // --------------------------------------------------
  // 建立批次任務
  // --------------------------------------------------
  const createBatchTasks = () => {
    if (!batchUrls.trim()) {
      setError("請輸入至少 1 個商品網址");
      return;
    }

    const lines = batchUrls
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError("請輸入至少 1 個商品網址");
      return;
    }

    const newTasks: BatchTask[] = lines.map((url, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      productUrl: url,
      productId: parseProductId(url),
      title: "",
      price: "",
      highlights: [""],
      images: [],
      script: "",
      videoUrl: "",
    }));

    setTasks(newTasks);
    setError("");
  };

  // --------------------------------------------------
  // 更新 Task 欄位
  // --------------------------------------------------
  const updateTask = (taskId: string, updates: Partial<BatchTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  // --------------------------------------------------
  // 賣點管理（新增 / 更新 / 刪除）
  // --------------------------------------------------
  const addHighlight = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, highlights: [...t.highlights, ""] }
          : t
      )
    );
  };

  const updateHighlight = (taskId: string, index: number, value: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const list = [...t.highlights];
        list[index] = value;
        return { ...t, highlights: list };
      })
    );
  };

  const removeHighlight = (taskId: string, index: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        if (t.highlights.length <= 1) return t; // 至少保留 1 個

        return {
          ...t,
          highlights: t.highlights.filter((_, i) => i !== index),
        };
      })
    );
  };

  // --------------------------------------------------
  // 圖片管理
  // --------------------------------------------------
  const addImage = (taskId: string) => {
    updateTask(taskId, { images: [...(tasks.find(t => t.id === taskId)?.images ?? []), ""] });
  };

  const updateImage = (taskId: string, index: number, value: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const list = [...t.images];
        list[index] = value;
        return { ...t, images: list };
      })
    );
  };

  const removeImage = (taskId: string, index: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        return {
          ...t,
          images: t.images.filter((_, i) => i !== index),
        };
      })
    );
  };

  // --------------------------------------------------
  // 驗證 Task 是否可產生影片
  // --------------------------------------------------
  const validateTask = (task: BatchTask) => {
    if (!task.title.trim()) return false;
    if (task.highlights.filter((h) => h.trim()).length === 0) return false;
    if (task.images.length === 0) return false;
    return true;
  };

  // --------------------------------------------------
  // 單 Task：產生腳本
  // --------------------------------------------------
  const generateScript = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.title.trim()) {
      setError("請填商品名稱");
      return;
    }

    const cleanHighlights = task.highlights.filter((h) => h.trim());
    if (cleanHighlights.length === 0) {
      setError("請至少填 1 個賣點");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shopee-generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          price: task.price || undefined,
          highlights: cleanHighlights,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError("腳本生成失敗：" + data.error);
        setLoading(false);
        return;
      }

      updateTask(taskId, { script: data.script });
    } catch (err: any) {
      setError("腳本生成失敗：" + (err.message || "未知錯誤"));
    }

    setLoading(false);
  };

  // --------------------------------------------------
  // 單 Task：產生影片
  // --------------------------------------------------
  const generateVideo = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!validateTask(task)) {
      setError("請補齊商品資訊（名稱、賣點、至少 1 張圖片）");
      return;
    }

    if (!task.script) {
      setError("請先產生腳本");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = await generateVideoFromScript({
        title: task.title,
        price: task.price || undefined,
        script: task.script,
        images: task.images,
      });

      updateTask(taskId, { videoUrl: url });
    } catch (err: any) {
      setError("影片產生失敗：" + (err.message || "未知錯誤"));
    }

    setLoading(false);
  };

  return {
    batchUrls,
    tasks,
    loading,
    error,

    setBatchUrls,
    createBatchTasks,
    updateTask,

    addHighlight,
    updateHighlight,
    removeHighlight,

    addImage,
    updateImage,
    removeImage,

    generateScript,
    generateVideo,
  };
}

