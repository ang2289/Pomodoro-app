import { useState } from "react";

import { generateVideoFromScript } from "@/services/video-api";



export default function ShopeeVideoPage() {

  const [productUrl, setProductUrl] = useState("");

  const [title, setTitle] = useState("");

  const [price, setPrice] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [description, setDescription] = useState("");

  const [sold, setSold] = useState("");

  const [script, setScript] = useState("");

  const [subtitle, setSubtitle] = useState("");

  const [videoScript, setVideoScript] = useState("");

  const [subtitles, setSubtitles] = useState<string[]>([]);

  const [scenes, setScenes] = useState<any[]>([]);

  const [videoUrl, setVideoUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  // 抓取商品資訊

  const handleFetchProduct = async () => {

    setLoading(true);

    setError("");



    try {

      const res = await fetch("/api/shopee-detail", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ url: productUrl }),

      });



      const data = await res.json();



      if (data.error) {

        setError("❌ 商品無法解析，請確認網址是否正確");

        setLoading(false);

        return;

      }



      // 自動填入欄位

      setTitle(data.title || "");

      setPrice(data.price || "");

      setDescription(data.description || "");

      setSold(data.sold || "");

      setImageUrl(data.image || "");



      setLoading(false);



    } catch (err) {

      setError("❌ 解析失敗，請稍後再試");

      setLoading(false);

    }

  };



  // 自動生成腳本功能

  async function generateShortScript(product: any) {

    try {

      const resp = await fetch("/api/shopee-generate-script", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          title: product.title,

          description: product.description,

          price: product.price,

          sold: product.historical_sold || product.sold

        })

      });



      if (!resp.ok) {

        throw new Error("腳本生成失敗");

      }

      return await resp.json();

    } catch (err) {

      console.error("腳本生成失敗:", err);

      return null;

    }

  }



  // 自動產生腳本與字幕

  const handleGenerateScripts = async () => {

    if (!title.trim()) {

      setError("請輸入商品名稱");

      return;

    }



    setLoading(true);

    setError("");



    try {

      // 使用新的腳本生成 API

      const scriptData = await generateShortScript({

        title: title,

        description: description,

        price: price ? parseFloat(price) : 0,

        sold: sold ? parseInt(sold) : undefined,

      });



      if (scriptData && scriptData.success) {

        setVideoScript(scriptData.script);

        setSubtitles(scriptData.subtitles || []);

        setScenes(scriptData.scenes || []);

        // 保留舊的 script 和 subtitle 以向後相容

        setScript(scriptData.script);

        setSubtitle(scriptData.subtitles?.join("\n") || "");

      } else {

        setError("產生腳本失敗，請稍後再試。");

      }

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

        輸入商品網址或手動輸入商品資訊 → 自動產生短影音腳本、字幕與影片。

      </p>



      {/* 商品網址輸入與抓取 */}

      <div className="bg-white p-5 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-4">🔍 商品網址抓取</h2>

        <div className="space-y-4">

          <div>

            <label className="block font-medium mb-2">蝦皮商品網址</label>

            <input

              type="text"

              value={productUrl}

              onChange={(e) => setProductUrl(e.target.value)}

              className="w-full border rounded p-3"

              placeholder="例如：https://shopee.tw/product/xxx 或 https://s.shopee.tw/xxx"

            />

          </div>



          <button

            onClick={handleFetchProduct}

            disabled={loading || !productUrl.trim()}

            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"

            style={{ color: '#ffffff' }}

          >

            🔍 抓取商品資訊

          </button>

        </div>

      </div>



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



          <div>

            <label className="block font-medium mb-2">商品描述（可選填）</label>

            <textarea

              value={description}

              onChange={(e) => setDescription(e.target.value)}

              className="w-full border rounded p-3"

              placeholder="例如：高品質材質，適合日常使用。設計簡潔大方。網路評價高。"

              rows={3}

            />

          </div>



          <div>

            <label className="block font-medium mb-2">累積銷量（可選填）</label>

            <input

              type="number"

              value={sold}

              onChange={(e) => setSold(e.target.value)}

              className="w-full border rounded p-3"

              placeholder="例如：1000"

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



      {/* 短影片腳本 */}

      {videoScript && (

        <div className="bg-white p-5 rounded-xl shadow mb-8">

          <h3 className="text-lg font-bold mb-3">🎤 自動生成短影片腳本</h3>

          <pre className="whitespace-pre-wrap mt-2 text-gray-700 bg-gray-50 p-4 rounded border">{videoScript}</pre>

        </div>

      )}



      {/* 字幕 */}

      {subtitles && subtitles.length > 0 && (

        <div className="bg-white p-5 rounded-xl shadow mb-8">

          <h3 className="text-lg font-bold mb-3">💬 自動字幕</h3>

          <ul className="mt-2 space-y-1">

            {subtitles.map((line, idx) => (

              <li key={idx} className="text-gray-700">• {line}</li>

            ))}

          </ul>

        </div>

      )}



      {/* 分鏡腳本 */}

      {scenes && scenes.length > 0 && (

        <div className="bg-white p-5 rounded-xl shadow mb-8">

          <h3 className="text-lg font-bold mb-3">🎞️ 分鏡腳本</h3>

          <ul className="space-y-2 mt-2">

            {scenes.map((scene, idx) => (

              <li key={idx} className="text-gray-700">

                <strong>{scene.sec}s：</strong> {scene.text}（{scene.visual}）

              </li>

            ))}

          </ul>

        </div>

      )}



      {/* 字幕內容（保留舊版相容） */}

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
