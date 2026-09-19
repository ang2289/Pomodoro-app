// src/pages/tools/shopee-video/components/VideoPreview.tsx

interface VideoPreviewProps {
  videoUrl: string;
  title?: string;
}

function buildDownloadFileName(rawTitle?: string): string {
  if (!rawTitle || !rawTitle.trim()) {
    return "shopee-video.mp4";
  }

  // 移除不合法字元 / \ : * ? " < > |
  const sanitized = rawTitle
    .replace(/[\/\\:*?"<>|]+/g, "")
    .trim()
    .replace(/\s+/g, "_"); // 空白改成底線

  if (!sanitized) {
    return "shopee-video.mp4";
  }

  return `${sanitized}.mp4`;
}

export default function VideoPreview({ videoUrl, title }: VideoPreviewProps) {
  if (!videoUrl) return null;

  const handleDownload = () => {
    try {
      const fileName = buildDownloadFileName(title);
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("下載影片失敗:", error);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        影片預覽
      </label>
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <div className="flex-1 flex justify-center">
          <video
            controls
            src={videoUrl}
            className="w-full rounded-xl border border-gray-200 max-w-full"
          />
        </div>
        <div className="mt-3 sm:mt-0 sm:w-40 flex sm:flex-col justify-center">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold shadow hover:bg-emerald-600 active:bg-emerald-700 transition"
          >
            下載 mp4
          </button>
        </div>
      </div>
    </div>
  );
}

