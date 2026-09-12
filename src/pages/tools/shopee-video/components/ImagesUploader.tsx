// src/pages/tools/shopee-video/components/ImagesUploader.tsx

import SectionCard from "./SectionCard";

interface ImagesUploaderProps {
  images: string[];
  updateImage: (index: number, value: string) => void;
  addImage: (value: string) => void;
  removeImage: (index: number) => void;
}

export default function ImagesUploader({
  images,
  updateImage,
  addImage,
  removeImage,
}: ImagesUploaderProps) {
  return (
    <SectionCard title="(B) 圖片上傳區">
      <div className="space-y-4">
        {images.map((img, index) => (
          <div
            key={index}
            className="border p-4 rounded-xl shadow-sm bg-white flex flex-col gap-2"
          >
            <label className="text-sm text-gray-600">圖片 URL</label>
            <input
              type="text"
              value={img}
              placeholder="輸入圖片網址，例如：https://..."
              onChange={(e) => updateImage(index, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />

            {/* 預覽區 */}
            {img && (
              <img
                src={img}
                alt="preview"
                className="w-full h-40 object-cover rounded-md border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' x='50%' text-anchor='middle'%3E圖片載入失敗%3C/text%3E%3C/svg%3E";
                }}
              />
            )}

            {/* 刪除按鈕 */}
            <button
              onClick={() => removeImage(index)}
              className="text-red-600 text-sm self-end hover:underline"
            >
              🗑️ 刪除圖片
            </button>
          </div>
        ))}

        {/* 新增圖片按鈕 */}
        <button
          onClick={() => addImage("")}
          className="w-full py-2 border rounded-xl text-blue-600 hover:bg-blue-50"
        >
          ＋ 新增圖片
        </button>
      </div>
    </SectionCard>
  );
}
