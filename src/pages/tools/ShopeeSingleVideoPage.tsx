/**
 * ⚠️ 注意：此檔案為舊版單支影片產生工具
 * 
 * 路由：/tools/shopee-single-video
 * 
 * 主要功能頁面請使用：
 * - 路由：/tools/shopee-video
 * - 檔案：src/pages/tools/shopee-video/index.tsx
 * - 元件：ShopeeVideoPage（包含最新 UI 重構與完整功能）
 * 
 * 此檔案保留用於向後相容，未來可能移除。
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { featureFlags } from '@/config/featureFlags';
import { isLocalDevelopment } from '@/lib/isLocalDevelopment';
import VideoToolUnavailable from '@/components/VideoToolUnavailable';
import SEO from '@/components/SEO';

function ShopeeSingleVideoPageInner() {
  const [inputUrl, setInputUrl] = useState('');

  const [videoUrl, setVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4'); // 預設影片

  const [script, setScript] = useState('這是一個範例腳本：今天我們來介紹一款熱賣商品！立即點擊下方購買！');

  const [subtitle, setSubtitle] = useState('限時優惠，超低價格，現在入手最划算！');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');



  const [productInfo, setProductInfo] = useState<{

    title: string;

    imageUrl: string;

    price: number;

  } | null>(null);



  const handleGenerate = async () => {

    if (!inputUrl.trim()) return;



    setLoading(true);

    setError('');

    setVideoUrl('');

    setScript('');

    setSubtitle('');

    setProductInfo(null);



    try {

      const response = await fetch('/api/generate-video', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ productUrl: inputUrl }),

      });



      if (!response.ok) {

        const text = await response.text();

        console.error('❌ API 回應錯誤：', response.status, text);

        setError(`API 錯誤 (${response.status})`);

        return;

      }



      const data = await response.json();

      console.log('✅ API 回傳資料：', data);



      setVideoUrl(data.videoUrl);

      setScript(data.script);

      setSubtitle(data.subtitle);



      if (data.product) {

        setProductInfo({

          title: data.product.title || '未知商品',

          imageUrl: data.product.image || '',

          price: data.product.price || 0,

        });

      }

    } catch (err) {

      console.error('❌ 網路或格式錯誤：', err);

      setError('無法連線至 API，請稍後再試');

    } finally {

      setLoading(false);

    }

  };

  if (!featureFlags.videoTool) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SEO
        title="Shopee 單支影片工具｜免費Shopee 單支影片工具 - RxV AI工具中心"
        description="免費Shopee 單支影片工具，支援線上使用，快速完成任務，無需下載。"
        keywords="Shopee 單支影片工具, AI工具, 免費工具"
        path="/tools/shopee-single-video"
      />
      <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-2">Shopee 單支影片工具（免費）｜AI工具推薦</h1>
      <p className="text-gray-600 text-sm mb-4">
        這是一款免費Shopee 單支影片工具，可用於單一商品快速產生短影音內容，支援線上使用，不需下載，快速完成任務。
      </p>



      <input

        type="text"

        placeholder="請貼上 Shopee 商品網址"

        value={inputUrl}

        onChange={(e) => setInputUrl(e.target.value)}

        className="w-full p-2 border rounded mb-3"

      />



      <button

        onClick={handleGenerate}

        disabled={loading}

        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"

      >

        {loading ? '產生中...' : '開始產生影片內容'}

      </button>



      {error && <p className="text-red-600 mt-3">{error}</p>}



      {/* 商品資訊區塊 */}

      {productInfo && (

        <div className="flex items-start gap-4 mt-6 border p-4 rounded bg-white shadow-sm">

          <img

            src={productInfo.imageUrl}

            alt="商品圖片"

            className="w-24 h-24 object-cover rounded border"

          />

          <div className="flex flex-col justify-between">

            <h2 className="text-lg font-semibold">{productInfo.title}</h2>

            <p className="text-red-600 font-bold mt-2 text-xl">

              ${productInfo.price}

            </p>

          </div>

        </div>

      )}



      {/* 顯示影片與腳本、字幕 */}

      {(videoUrl || script || subtitle) && (

        <div className="mt-6">

          {videoUrl && (

            <>

              <p className="mb-2 text-lg font-semibold">🎞️ 預覽影片</p>

              <video

                src={videoUrl}

                controls

                className="w-full rounded border mb-4"

              />

            </>

          )}



          {script && (

            <>

              <p className="font-semibold">📜 產出腳本</p>

              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">{script}</pre>

            </>

          )}



          {subtitle && (

            <>

              <p className="font-semibold mt-4">🈸 字幕內容</p>

              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">{subtitle}</pre>

            </>

          )}

        </div>

      )}

        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">什麼是Shopee 單支影片工具？</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Shopee 單支影片工具是一種常見的AI工具，可幫助使用者提升效率，適合用於工作、學習與日常應用。
          </p>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">為什麼使用這個工具？</h2>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
            <li>免費使用</li>
            <li>不需安裝</li>
            <li>支援快速處理</li>
          </ul>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">更多相關工具</h2>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
            <li><a href="/tools" className="text-blue-600 hover:underline">工具中心</a></li>
            <li><a href="/summary" className="text-blue-600 hover:underline">AI摘要工具</a></li>
            <li><a href="/tools/homework-helper" className="text-blue-600 hover:underline">AI作業解題</a></li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Shopee 單支影片工具是電商常見的AI工具，可針對單一商品快速生成內容。這款免費工具能降低剪輯門檻，讓 Shopee 單支影片工具更適合快速上架流程。若你要擴充AI工具與免費工具組合，Shopee 單支影片工具很值得加入。
          </p>
          <div className="mt-8">
            <a href="/tools" className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]">
              👉 查看更多 AI 工具
            </a>
          </div>
        </section>
      </div>
    </>

  );

}

export default function ShopeeSingleVideoPage() {
  if (!isLocalDevelopment()) {
    return <VideoToolUnavailable />;
  }
  return <ShopeeSingleVideoPageInner />;
}
