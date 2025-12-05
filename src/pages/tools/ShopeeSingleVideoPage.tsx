// src/pages/tools/shopee-video.tsx

import { useState } from 'react';



export default function ShopeeSingleVideoPage() {

  const [inputUrl, setInputUrl] = useState('');

  const [videoUrl, setVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4'); // 預設影片

  const [script, setScript] = useState('這是一個範例腳本：今天我們來介紹一款熱賣商品！立即點擊下方購買！');

  const [subtitle, setSubtitle] = useState('限時優惠，超低價格，現在入手最划算！');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');



  const [productInfo, setProductInfo] = useState<{

    title: string;

    imageUrl: string;

    price: string;

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

        setProductInfo(data.product);

      }

    } catch (err) {

      console.error('❌ 網路或格式錯誤：', err);

      setError('無法連線至 API，請稍後再試');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">🎬 Shopee 單支影片產生工具</h1>



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

        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"

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

            <p className="text-red-600 font-bold mt-2 text-xl">${productInfo.price}</p>

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

    </div>

  );

}
