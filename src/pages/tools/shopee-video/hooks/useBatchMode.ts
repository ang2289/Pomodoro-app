import { useState } from "react";
import { generateVideoFromScript } from "@/services/video-api";
import { generateScript } from "@/services/script-api";
import { parseProductId } from "../utils/helpers";
import { validateProductInfo } from "../utils/validators";

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

export function useBatchMode() {
  const [batchUrls, setBatchUrls] = useState("");
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------------
  // 建立批次任務列表
  // -----------------------------------------------------
  const handleBatchUrlsInput = () => {
    if (!batchUrls.trim()) {
      setError("請輸入至少一個商品網址");
      return;
    }

    const urls = batchUrls
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setError("請輸入有效的商品網址");
      return;
    }

    const tasks: BatchTask[] = urls.map((url, index) => {
      const productId = parseProductId(url);

      return {
        id: `task-${Date.now()}-${index}`,
        productUrl: url,
        productId,
        title: "",
        price: "",
        highlights: [""],
        images: [],
        script: "",
        videoUrl: "",
      };
    });

    setBatchTasks(tasks);
    setError("");
  };

  // -----------------------------------------------------
  // 更新單一 Task
  // -----------------------------------------------------
  const updateBatchTask = (taskId: string, updates: Partial<BatchTask>) => {
    setBatchTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  // -----------------------------------------------------
  // 【賣點操作】
  // -----------------------------------------------------
  const addHighlight = (taskId: string) => {
    const task = batchTasks.find((t) => t.id === taskId);
    if (!task) return;

    updateBatchTask(taskId, {
      highlights: [...task.highlights, ""],
    });
  };

  const updateHighlight = (taskId: string, index: number, value: string) => {
    const task = batchTasks.find((t) => t.id === taskId);
    if (!task) return;

    const list = [...task.highlights];
    list[index] = value;

    updateBatchTask(taskId, { highlights: list });
  };

  const removeHighlight = (taskId: string, index: number) => {
    const task = batchTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.highlights.length <= 1) return;

    const updated = task.highlights.filter((_, i) => i !== index);
    updateBatchTask(taskId, { highlights: updated });
  };

  // -----------------------------------------------------
  // 【圖片操作】
  // -----------------------------------------------------
  const addImage = (taskId: string, url: string) => {
    const task = batchTasks.find((t) => t.id === taskId);
    if (!task) return;

    updateBatchTask(taskId, { images: [...task.images, url] });
  };

  const updateImage = (taskId: string, index: number, url: string) => {
    const task = batchTasks.find((t) => t.id === taskId);
    if (!task) return;

    const updated = [...task.images];
    updated[index] = url;

    updateBatchTask(taskId, { images: updated });
  };

  const removeImage = (taskId: string, index: number) => {
    const task = batchTasks.find((t) => t.id === taskId);
    if (!task) return;

    updateBatchTask(taskId, {
      images: task.images.filter((_, i) => i !== index),
    });
  };

  // -----------------------------------------------------
  // 產生腳本（單一批次任務）
  // -----------------------------------------------------
  const handleGenerateScript = async (task: BatchTask) => {
    if (!task.title.trim()) {
      setError("請先輸入商品名稱");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateScript({
        title: task.title,
        price: task.price || undefined,
        highlights: task.highlights.filter((h) => h.trim()),
      });

      updateBatchTask(task.id, { script: result.script || "" });
    } catch (err: any) {
      setError("腳本生成失敗：" + err.message);
    }

    setLoading(false);
  };

  // -----------------------------------------------------
  // 產生影片（單一批次任務）
  // -----------------------------------------------------
  const handleGenerateVideo = async (task: BatchTask) => {
    const ok = validateProductInfo(task);
    if (!ok) {
      setError("請補齊商品資訊：名稱 / 賣點 / 圖片");
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
        images: task.images,
        script: task.script,
      });

      updateBatchTask(task.id, { videoUrl: url });
    } catch (err: any) {
      setError("影片生成失敗：" + err.message);
    }

    setLoading(false);
  };

  return {
    batchUrls,
    setBatchUrls,
    batchTasks,
    loading,
    error,
    setError,

    handleBatchUrlsInput,
    updateBatchTask,

    addHighlight,
    updateHighlight,
    removeHighlight,

    addImage,
    updateImage,
    removeImage,

    handleGenerateScript,
    handleGenerateVideo,
  };
}
