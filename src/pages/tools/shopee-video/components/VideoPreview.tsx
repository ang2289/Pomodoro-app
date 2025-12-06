// src/pages/tools/shopee-video/components/VideoPreview.tsx

interface VideoPreviewProps {
  videoUrl: string;
}

export default function VideoPreview({ videoUrl }: VideoPreviewProps) {
  if (!videoUrl) return null;

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        影片預覽
      </label>
      <div className="flex justify-center">
        <video
          controls
          src={videoUrl}
          className="w-full rounded-xl border border-gray-200 max-w-full"
        />
      </div>
    </div>
  );
}

