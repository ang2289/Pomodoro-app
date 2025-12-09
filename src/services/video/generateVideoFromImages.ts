/**
 * 從多張圖片產生 1080×1920 影片
 * @param images 圖片文件陣列
 * @param title 商品名稱
 * @param price 商品價格（可選）
 * @returns 影片 URL
 */
export async function generateVideoFromImages(
  images: File[],
  title: string,
  price?: string
): Promise<string> {
  // TODO: 先用假資料 return，前端可以看到影片元件成功渲染
  // 未來實作：將圖片上傳到伺服器，使用影片生成 API 產生影片
  console.log("generateVideoFromImages 呼叫：", {
    imageCount: images.length,
    title,
    price,
  });

  // 暫時返回假影片 URL
  return "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
}



