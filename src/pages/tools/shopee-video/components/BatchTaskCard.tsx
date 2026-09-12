// src/pages/tools/shopee-video/components/BatchTaskCard.tsx

import { useTranslation } from "react-i18next";
import SectionCard from "./SectionCard";
import HighlightsEditor from "./HighlightsEditor";
import ImagesUploader from "./ImagesUploader";
import ScriptCard from "./ScriptCard";
import { BatchTask } from "../hooks/useBatchVideo";

interface BatchTaskCardProps {
  task: BatchTask;
  taskIndex: number;
  onUpdate: (taskId: string, updates: Partial<BatchTask>) => void;
  onGenerateScript: (taskId: string) => void;
  loading?: boolean;
}

export default function BatchTaskCard({
  task,
  taskIndex,
  onUpdate,
  onGenerateScript,
  loading = false,
}: BatchTaskCardProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={`${t("shopee_video_task_title", { index: taskIndex + 1 })} - ${task.productUrl}`}>
      <div className="space-y-6">
        {/* 商品名稱 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("shopee_video_label_product_name")}
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
            placeholder={t("shopee_video_placeholder_title")}
          />
        </div>

        {/* 商品價格 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("shopee_video_label_price_optional")}
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
            placeholder={t("shopee_video_placeholder_price")}
          />
        </div>

        {/* 推廣連結 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("shopee_video_label_promo_required")}
          </label>
          <input
            type="text"
            value={task.promoUrl}
            onChange={(e) => onUpdate(task.id, { promoUrl: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder={t("shopee_video_placeholder_url")}
          />
          <div className="mt-1 text-xs">
            {task.promoUrl?.trim() ? (
              <a
                href={task.promoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {t("shopee_video_open_promo_link")}
              </a>
            ) : (
              <span className="text-red-500">
                {t("shopee_video_use_promo_for_commission")}
              </span>
            )}
          </div>
        </div>

        {/* 商品賣點 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("shopee_video_label_highlights")}
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
            {t("shopee_video_label_images")}
          </label>
          <ImagesUploader
            images={task.images}
            updateImage={(index, value) => {
              const newImages = [...task.images];
              newImages[index] = value;
              onUpdate(task.id, { images: newImages });
            }}
            addImage={(value) => onUpdate(task.id, { images: [...task.images, value] })}
            removeImage={(index) => {
              const newImages = task.images.filter((_, i) => i !== index);
              onUpdate(task.id, { images: newImages });
            }}
          />
        </div>

        {/* 腳本預覽（若已有腳本才顯示） */}
        {task.script && (
          <ScriptCard
            script={task.script}
            onChange={(newScript) => onUpdate(task.id, { script: newScript })}
          />
        )}
      </div>
    </SectionCard>
  );
}

