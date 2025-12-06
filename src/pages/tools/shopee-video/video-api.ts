// src/pages/tools/shopee-video/video-api.ts

import { generateVideoFromScript } from "@/services/video-api";

export interface GenerateVideoPayload {
  title: string;
  price?: string;
  images: string[];
  script: string;
}

// 包一層，讓未來要換成別的影片服務比較好改
export async function generateProductVideo(
  payload: GenerateVideoPayload
): Promise<string> {
  // 這裡可以加 log 或 debug
  console.log("[shopee-video] generateProductVideo payload:", payload);

  const url = await generateVideoFromScript({
    title: payload.title,
    price: payload.price,
    images: payload.images,
    script: payload.script,
  });

  return url;
}
