// src/pages/tools/shopee-video/hooks/useBatchVideo.ts

import { useState } from "react";
import type { TFunction } from "i18next";

export interface BatchTask {
  id: string;
  productUrl: string;
  productId: string | null;
  title: string;
  price: string;
  promoUrl: string;
  highlights: string[];
  images: string[];
  /** 由 shopeeParse 補圖 API 回傳的圖片網址，下載 scripts.json 時優先使用 */
  imageUrls?: string[];
  /** 自動補圖狀態：pending=尚未處理 filled=已補到圖 manual=被擋需手動補圖 */
  imageFillStatus?: "pending" | "filled" | "manual";
  /** 補圖失敗時的原因（供 UI 顯示） */
  imageFillReason?: string;
  /** 補圖失敗時後端回傳的 debug 物件（開發模式可展開） */
  imageFillDebug?: unknown;
  script?: string;
  videoUrl?: string;
}

export function useBatchVideo(t: TFunction) {
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
      setError(t("shopee_video_enter_url"));
      return;
    }

    const lines = batchUrls
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError(t("shopee_video_enter_url"));
      return;
    }

    const newTasks: BatchTask[] = lines.map((url, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      productUrl: url,
      productId: parseProductId(url),
      title: "",
      price: "",
      promoUrl: "",
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
  // 單 Task：產生腳本
  // --------------------------------------------------
  const generateScript = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.title.trim()) {
      setError(t("shopee_video_enter_name"));
      return;
    }

    const cleanHighlights = task.highlights.filter((h) => h.trim());
    if (cleanHighlights.length === 0) {
      setError(t("shopee_video_enter_highlights"));
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
          title: task.title,
          price: task.price || undefined,
          highlights: cleanHighlights,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(t("shopee_video_script_failed", { error: data.error }));
        setLoading(false);
        return;
      }

      updateTask(taskId, { script: data.script });
    } catch (err: any) {
      setError(t("shopee_video_script_failed", { error: err.message || t("shopee_video_script_unknown") }));
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
    setTasks,

    addHighlight,
    updateHighlight,
    removeHighlight,

    addImage,
    updateImage,
    removeImage,

    generateScript,
  };
}

