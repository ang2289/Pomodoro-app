import { useState } from "react";

import { generateVideoFromScript } from "@/services/video-api";



export default function ShopeeVideoPage() {

  const [title, setTitle] = useState("");

  const [price, setPrice] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [script, setScript] = useState("");

  const [subtitle, setSubtitle] = useState("");

  const [videoUrl, setVideoUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  // 自動產生腳本與字幕

  const handleGenerateScripts = async () => {

    if (!title.trim()) {

      setError("請輸入商品名稱");

      return;

    }



    setLoading(true);

    setError("");



    try {

      // 呼叫 generate-video API 來產生腳本和字幕

      const response = await fetch('/api/generate-video', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          product: {

            title: title,

            price: price ? parseFloat(price) : 0,

            image: imageUrl,

          },

        }),

      });



      if (!response.ok) {

        const err = await response.json();

        setError(err.error || "產生腳本失敗");

        setLoading(false);

        return;

      }



      const data = await response.json();

      setScript(data.script || "");

      setSubtitle(data.subtitle || "");

    } catch (err) {

      setError("產生腳本失敗，請稍後再試。");

    }



    setLoading(false);

  };



  // 產生影片

  const handleGenerateVideo = async () => {

    if (!title.trim()) {

      setError("請輸入商品名稱");

      return;

    }



    setLoading(true);

    setError("");



    try {

      const video = await generateVideoFromScript({

        title: title,

        price: price ? parseFloat(price) : 0,

        image: imageUrl,

      });

      setVideoUrl(video);

    } catch (err) {

      setError("影片產生失敗，請稍後再試。");

    }



    setLoading(false);

  };



  return (

    <div className="w-full max-w-3xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-2 text-center">

        🎬 Shopee 自動短影片產生器（V2.6 專業版）

      </h1>

      <p className="text-gray-600 text-center mb-8">

        手動輸入商品資訊 → 自動產生短影音腳本、字幕與影片。

      </p>



      {/* 手動輸入模式 */}

      <div className="bg-white p-5 rounded-xl shadow mb-8 manual-mode">

        <h2 className="text-xl font-bold mb-4">手動輸入商品資訊</h2>



        <div className="space-y-4">

          <div>

            <label className="block font-medium mb-2">商品名稱 *</label>

            <input

              type="text"

              value={title}

              onChange={(e) => setTitle(e.target.value)}

              className="w-full border rounded p-3"

              placeholder="例如：超值保養品組合"

            />

          </div>



          <div>

            <label className="block font-medium mb-2">商品主圖片 URL</label>

            <input

              type="text"

              value={imageUrl}

              onChange={(e) => setImageUrl(e.target.value)}

              className="w-full border rounded p-3"

              placeholder="https://cf.shopee.tw/file/xxx.jpg"

            />

          </div>



          <div>

            <label className="block font-medium mb-2">價格（可選填）</label>

            <input

              type="number"

              value={price}

              onChange={(e) => setPrice(e.target.value)}

              className="w-full border rounded p-3"

              placeholder="例如：299"

            />

          </div>



          <button

            onClick={handleGenerateScripts}

            disabled={loading || !title.trim()}

            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"

            style={{ color: '#ffffff' }}

          >

            ✨ 自動產生腳本與字幕

          </button>



          {error && <p className="text-red-500 mt-3">❌ {error}</p>}

        </div>

      </div>



      {/* 影片播放器 */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-3">🎞 影片預覽</h2>

        {videoUrl ? (

          <video controls src={videoUrl} className="w-full rounded" />

        ) : (

          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded text-gray-500">

            尚未產生影片

          </div>

        )}

      </div>



      {/* 商品資訊預覽 */}

      {(title || imageUrl) && (

        <div className="bg-white p-5 rounded-xl shadow mb-8">

          <h2 className="text-xl font-bold mb-3">📦 商品資訊預覽</h2>

          {imageUrl && (

            <img src={imageUrl} className="w-40 h-40 object-cover rounded mb-4" alt={title} />

          )}

          {title && <p className="font-medium">{title}</p>}

          {price && <p className="text-green-600 text-lg font-bold">NT$ {price}</p>}

        </div>

      )}



      {/* 腳本內容 */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-3">📝 影片腳本</h2>

        {script ? (

          <textarea

            value={script}

            readOnly

            className="w-full border rounded p-3 h-32"

          />

        ) : (

          <div className="space-y-2">

            <div className="h-4 w-full bg-gray-200 rounded"></div>

            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>

            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>

          </div>

        )}

      </div>



      {/* 字幕內容 */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-3">💬 字幕內容</h2>

        {subtitle ? (

          <textarea

            value={subtitle}

            readOnly

            className="w-full border rounded p-3 h-32"

          />

        ) : (

          <div className="space-y-2">

            <div className="h-4 bg-gray-200 w-3/4 rounded"></div>

            <div className="h-4 bg-gray-200 w-2/4 rounded"></div>

            <div className="h-4 bg-gray-200 w-4/6 rounded"></div>

          </div>

        )}

      </div>



      {/* 產生影片按鈕 */}

      {script && (

        <button

          onClick={handleGenerateVideo}

          disabled={loading}

          className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 disabled:opacity-50"

          style={{ color: '#ffffff' }}

        >

          🎥 產生短影片

        </button>

      )}



      {/* Loading */}

      {loading && (

        <p className="text-center text-lg text-indigo-600 mt-4">⏳ 處理中…請稍候</p>

      )}

    </div>

  );

}
