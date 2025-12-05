import { useState } from "react";

import { fetchShopeeProduct } from "@/services/shopee-api";

import { generateVideoFromScript } from "@/services/video-api";



export default function ShopeeVideoPage() {

  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState(null);

  const [videoUrl, setVideoUrl] = useState("");

  const [error, setError] = useState("");



  async function fetchProduct() {

    setError("");

    setProduct(null);

    setVideoUrl("");



    setLoading(true);

    try {

      const data = await fetchShopeeProduct(url);

      // 取得商品資訊後，也取得腳本和字幕

      try {

        const scriptResponse = await fetch('/api/generate-video', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({

            productUrl: url,

            product: data,

          }),

        });



        if (scriptResponse.ok) {

          const scriptData = await scriptResponse.json();

          setProduct({

            ...data,

            script: scriptData.script || '',

            subtitle: scriptData.subtitle || '',

          });

        } else {

          setProduct(data);

        }

      } catch (scriptErr) {

        // 如果取得腳本失敗，仍然顯示商品資訊

        setProduct(data);

      }

    } catch (err: any) {

      setError("無法取得商品資訊，請確認網址或 RapidAPI 設定。");

    }

    setLoading(false);

  }



  async function generateVideo() {

    if (!product) return;



    setLoading(true);

    setError("");



    try {

      const video = await generateVideoFromScript({

        title: product.title,

        price: product.price,

        image: product.image,

      });

      setVideoUrl(video);

    } catch (err) {

      setError("影片產生失敗，請稍後再試。");

    }



    setLoading(false);

  }



  return (

    <div className="w-full max-w-3xl mx-auto px-4 py-10">



      <h1 className="text-3xl font-bold mb-2 text-center">

        🎬 Shopee 自動短影片產生器（V2.6 專業版）

      </h1>

      <p className="text-gray-600 text-center mb-8">

        輸入商品網址 → 自動抓資料 → 產生短影音腳本、字幕與影片。

      </p>



      {/* 商品網址輸入 */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <label className="font-medium">蝦皮商品網址</label>

        <input

          type="text"

          className="w-full border rounded p-3 mt-2"

          placeholder="請輸入蝦皮網址：如 https://shopee.tw/product/xxx"

          value={url}

          onChange={(e) => setUrl(e.target.value)}

        />



        <button

          onClick={fetchProduct}

          disabled={loading}

          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg mt-4 text-lg font-semibold hover:opacity-90 transition"

          style={{ color: '#ffffff' }}

        >

          🔍 抓取商品資訊

        </button>



        {error && <p className="text-red-500 mt-3">❌ {error}</p>}

      </div>



      {/* 影片播放器（未輸入也顯示） */}

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



      {/* 商品資訊（預設灰底） */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-3">📦 商品資訊</h2>



        {product ? (

          <>

            <img src={product.image} className="w-40 h-40 object-cover rounded mb-4" />

            <p className="font-medium">{product.title}</p>

            <p className="text-green-600 text-lg font-bold">NT$ {product.price}</p>

          </>

        ) : (

          <div className="space-y-3">

            <div className="w-40 h-40 bg-gray-200 rounded"></div>

            <div className="h-4 bg-gray-200 w-2/3 rounded"></div>

            <div className="h-4 bg-gray-200 w-1/3 rounded"></div>

          </div>

        )}

      </div>



      {/* 腳本（預設灰底） */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-3">📝 影片腳本</h2>



        {product ? (

          <p className="leading-relaxed">{product.script || "產生腳本中…"}</p>

        ) : (

          <div className="space-y-2">

            <div className="h-4 w-full bg-gray-200 rounded"></div>

            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>

            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>

          </div>

        )}

      </div>



      {/* 字幕（預設灰底） */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-3">💬 字幕內容</h2>



        {product ? (

          <p>{product.subtitle || "字幕產生中…"}</p>

        ) : (

          <div className="space-y-2">

            <div className="h-4 bg-gray-200 w-3/4 rounded"></div>

            <div className="h-4 bg-gray-200 w-2/4 rounded"></div>

            <div className="h-4 bg-gray-200 w-4/6 rounded"></div>

          </div>

        )}

      </div>



      {/* 產生影片按鈕 */}

      {product && (

        <button

          onClick={generateVideo}

          disabled={loading}

          className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-700"

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
