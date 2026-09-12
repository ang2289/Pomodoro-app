import { cleanHighlights } from './helpers';

export interface VideoTaskInput {
  title: string;
  price: string;
  highlights: string[];
  images: string[];
}

/**
 * 驗證單一商品資料是否完整
 */
export function validateSingleTask(input: VideoTaskInput) {
  const errors: string[] = [];

  if (!input.title.trim()) {
    errors.push("商品名稱必填");
  }

  if (!input.price.trim()) {
    errors.push("商品價格必填");
  }

  const cleanedHighlights = cleanHighlights(input.highlights);
  if (cleanedHighlights.length === 0) {
    errors.push("至少需要 1 個商品賣點");
  }

  const cleanedImages = input.images.filter((img) => img.trim().length > 0);
  if (cleanedImages.length === 0) {
    errors.push("至少需要 1 張圖片");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * 批次任務驗證
 * - URL 已解析
 * - 基本欄位是否準備好
 */
export function validateBatchTask(task: any) {
  const errors: string[] = [];

  if (!task.id) {
    errors.push("無法解析商品網址");
  }

  if (!task.title?.trim()) {
    errors.push("商品名稱必填");
  }

  if (!task.price?.trim()) {
    errors.push("商品價格必填");
  }

  const highlights = cleanHighlights(task.highlights || []);
  if (highlights.length === 0) {
    errors.push("至少需要 1 個賣點");
  }

  const images = (task.images || []).filter((i: string) => i.trim().length > 0);
  if (images.length === 0) {
    errors.push("至少需要 1 張圖片");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * 驗證是否可產生影片腳本
 */
export function canGenerateScript(input: VideoTaskInput): boolean {
  return (
    input.title.trim().length > 0 &&
    input.price.trim().length > 0 &&
    cleanHighlights(input.highlights).length > 0 &&
    input.images.filter((i) => i.trim().length > 0).length > 0
  );
}

/**
 * 驗證是否可產生影片（需要腳本 + 已選圖片）
 */
export function canGenerateVideo(script: string, images: string[]): boolean {
  if (!script.trim()) return false;
  const validImages = images.filter((i) => i.trim().length > 0);
  return validImages.length > 0;
}
