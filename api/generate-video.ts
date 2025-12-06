import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 影片產生 API - 本地輸入模式
 * 接受本地輸入的商品資訊和腳本，不依賴外部 API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, price, images, script } = req.body;

    // 驗證必要欄位
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '缺少商品名稱' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: '至少需要 1 張圖片' });
    }

    if (!script || !script.trim()) {
      return res.status(400).json({ error: '缺少影片腳本' });
    }

    // 目前回傳假影片 URL（後續可整合 FFmpeg 或其他影片生成服務）
    // TODO: 整合實際的影片生成邏輯
    const mockVideoUrl = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";

    return res.status(200).json({
      success: true,
      videoUrl: mockVideoUrl,
      product: {
        title,
        price: price || undefined,
        images,
      },
      script,
    });

  } catch (err: any) {
    console.error('影片產生錯誤:', err);
    return res.status(500).json({ 
      error: 'Server error', 
      detail: err.message || String(err) 
    });
  }
}
