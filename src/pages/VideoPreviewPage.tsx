import { isLocalDevelopment } from "@/lib/isLocalDevelopment";
import VideoToolUnavailable from "@/components/VideoToolUnavailable";

export default function VideoPreviewPage() {
  if (!isLocalDevelopment()) {
    return <VideoToolUnavailable />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">影音預覽頁已調整</h1>
      <p className="text-gray-700 mb-2">
        此頁面已改至 Shopee 短影音工具。
      </p>
      <p className="text-gray-700">
        請前往 <code>/tools/shopee-video</code> 使用最新的短影音工具。
      </p>
    </div>
  );
}

