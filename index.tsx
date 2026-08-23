import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import toast from "react-hot-toast";
import SEO from "@/components/SEO";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";

interface ScriptItem {
  title: string;
  price?: string;
  promoUrl: string;
  imageUrls: string[];
  images?: string[];
}

export default function BatchVideoGeneratorPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ScriptItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setItems(data);
        toast.success(`成功讀取 ${data.length} 個商品腳本`);
      } else {
        toast.error("JSON 格式不正確，應為陣列");
      }
    } catch (err) {
      toast.error("讀取檔案失敗，請確認為正確的 scripts.json");
    } finally {
      e.target.value = "";
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: "/ffmpeg-core/ffmpeg-core.js",
      wasmURL: "/ffmpeg-core/ffmpeg-core.wasm",
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const generateBatch = async () => {
    if (items.length === 0) {
      toast.error("請先上傳 scripts.json");
      return;
    }

    setProcessing(true);
    setProgress({ current: 0, total: items.length });

    try {
      const ffmpeg = await loadFFmpeg();

      // 下載支援中文的字體以便 drawtext 使用
      const fontUrl =
        "https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf";
      const fontData = await fetchFile(fontUrl);
      await ffmpeg.writeFile("font.ttf", fontData);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const rawUrls =
          (item.imageUrls?.length ? item.imageUrls : item.images) || [];
        const urls = rawUrls.slice(0, 3);

        if (urls.length === 0) continue;
        while (urls.length < 3) urls.push(urls[0]);

        for (let j = 0; j < 3; j++) {
          const imgData = await fetchFile(urls[j]);
          await ffmpeg.writeFile(`img${j}.jpg`, imgData);
        }

        const texts = ["超熱門好物", "限時優惠", "點擊連結購買"];

        // FFmpeg 濾鏡：縮放至 1080x1920、補黑邊、繪製文字、組合片段
        const filterComplex = [
          `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,drawtext=fontfile=font.ttf:text='${texts[0]}':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=h-300:box=1:boxcolor=black@0.5:boxborderw=20,trim=duration=2[v0];`,
          `[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,drawtext=fontfile=font.ttf:text='${texts[1]}':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=h-300:box=1:boxcolor=black@0.5:boxborderw=20,trim=duration=2[v1];`,
          `[2:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,drawtext=fontfile=font.ttf:text='${texts[2]}':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=h-300:box=1:boxcolor=black@0.5:boxborderw=20,trim=duration=2[v2];`,
          "[v0][v1][v2]concat=n=3:v=1:a=0[v]",
        ].join("");

        await ffmpeg.exec([
          "-loop",
          "1",
          "-t",
          "2",
          "-i",
          "img0.jpg",
          "-loop",
          "1",
          "-t",
          "2",
          "-i",
          "img1.jpg",
          "-loop",
          "1",
          "-t",
          "2",
          "-i",
          "img2.jpg",
          "-filter_complex",
          filterComplex,
          "-map",
          "[v]",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-r",
          "30",
          "output.mp4",
        ]);

        const outputData = await ffmpeg.readFile("output.mp4");
        const blob = new Blob([outputData], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `product-${i + 1}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setProgress((prev) => ({ ...prev, current: i + 1 }));
      }
      toast.success("批次生成完成！影片已自動下載。");
    } catch (err) {
      console.error(err);
      toast.error("生成失敗，請確認圖片連結有效且瀏覽器記憶體足夠");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="批次短影音生成器 | RxV AI 工具"
        description="上傳 scripts.json，一鍵批次生成符合 9:16 短影音格式的商品行銷影片。"
      />

      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/tools"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            返回工具中心
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 mr-5">
                <VideoCameraIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  批次短影音生成器
                </h1>
                <p className="text-slate-500 text-sm">
                  讀取腳本自動產出 1080x1920 (9:16) 影片
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* 上傳區塊 */}
              {!items.length ? (
                <div className="relative border-3 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <DocumentArrowUpIcon className="w-16 h-12 text-slate-300 mx-auto mb-4 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-lg font-semibold text-slate-700">
                    上傳 scripts.json
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    請使用由「Shopee 短影音工具」匯出的腳本檔案
                  </p>
                </div>
              ) : (
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-indigo-900 font-bold text-lg">
                      準備就緒
                    </p>
                    <p className="text-indigo-600 text-sm">
                      共有 {items.length} 個商品待轉換
                    </p>
                  </div>
                  <button
                    onClick={generateBatch}
                    disabled={processing}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
                  >
                    {processing ? "正在處理..." : "開始批次生成"}
                  </button>
                </div>
              )}

              {processing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold text-slate-600">
                    <span>影片生成進度</span>
                    <span>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 預覽清單 */}
              {items.length > 0 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          商品名稱
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          狀態
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx < progress.current ? "bg-emerald-50/50" : ""
                          }
                        >
                          <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 truncate max-w-xs">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold">
                            {idx < progress.current ? (
                              <span className="text-emerald-600">已完成</span>
                            ) : (
                              <span className="text-slate-300">等待中</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
