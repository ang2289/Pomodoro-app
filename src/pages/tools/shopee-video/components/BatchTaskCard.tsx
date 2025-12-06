// src/pages/tools/shopee-video/components/BatchTaskCard.tsx

import SectionCard from "./SectionCard";
import HighlightsEditor from "./HighlightsEditor";
import ImagesUploader from "./ImagesUploader";
import ScriptCard from "./ScriptCard";
import VideoPreview from "./VideoPreview";
import { BatchTask } from "../hooks/useBatchVideo";

interface BatchTaskCardProps {
  task: BatchTask;
  taskIndex: number;
  onUpdate: (taskId: string, updates: Partial<BatchTask>) => void;
  onGenerateScript: (taskId: string) => void;
  onGenerateVideo: (taskId: string) => void;
  loading?: boolean;
}

export default function BatchTaskCard({
  task,
  taskIndex,
  onUpdate,
  onGenerateScript,
  onGenerateVideo,
  loading = false,
}: BatchTaskCardProps) {
  return (
    <SectionCard title={`任務 #${taskIndex + 1} - ${task.productUrl}`}>
      <div className="space-y-6">
        {/* 商品名稱 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            商品名稱 *
          </label>
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdate(task.id, { title: e.target.value })}
            className="w-full h-[52px] rounded-xl border border-gray-300 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{
              fontSize: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
            placeholder="例如：超值保養品組合"
          />
        </div>

        {/* 商品價格 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            商品價格（選填）
          </label>
          <input
            type="text"
            value={task.price}
            onChange={(e) => onUpdate(task.id, { price: e.target.value })}
            className="w-full h-[52px] rounded-xl border border-gray-300 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{
              fontSize: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
            placeholder="例如：299"
          />
        </div>

        {/* 商品賣點 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            商品賣點 *（可填 1～3 點）
          </label>
          <HighlightsEditor
            highlights={task.highlights}
            onChange={(newHighlights) =>
              onUpdate(task.id, { highlights: newHighlights })
            }
          />
        </div>

        {/* 圖片 URL */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            圖片 URL *（至少 1 張）
          </label>
          <ImagesUploader
            images={task.images}
            onChange={(newImages) => onUpdate(task.id, { images: newImages })}
          />
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-3">
          <button
            onClick={() => onGenerateScript(task.id)}
            disabled={loading || !task.title.trim()}
            className="w-full h-[52px] rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "16px" }}
          >
            產生腳本
          </button>
          <button
            onClick={() => onGenerateVideo(task.id)}
            disabled={loading || !task.script?.trim()}
            className="w-full h-[52px] rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "16px" }}
          >
            產生影片
          </button>
        </div>

        {/* 腳本 / 影片預覽 */}
        {task.script && (
          <ScriptCard
            script={task.script}
            onChange={(newScript) => onUpdate(task.id, { script: newScript })}
          />
        )}

        {task.videoUrl && <VideoPreview videoUrl={task.videoUrl} />}
      </div>
    </SectionCard>
  );
}

