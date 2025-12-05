import React, { useState } from 'react';
import { generateScript } from '@/shopee-video/script-generator';
import type { ProductItem } from '@/shopee-video/csv-loader';

// 展開 Shopee 短網址
async function expandShopeeShortLink(inputUrl: string): Promise<string> {
  if (!inputUrl.startsWith('https://s.shopee.tw/')) {
    return inputUrl;
  }

  try {
    const res = await fetch(inputUrl, {
      method: 'GET',
      redirect: 'follow',
      mode: 'cors',
    });

    const finalUrl = res.url;
    if (finalUrl.includes('/product/')) {
      return finalUrl;
    } else {
      throw new Error('非商品頁');
    }
  } catch (e) {
    throw new Error('需要手動點開展開');
  }
}

// 取得 Shopee 商品資料
async function fetchShopeeData(url: string) {
  const res = await fetch('/api/shopee-detail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '無法取得商品資料');
  }

  return await res.json();
}

// 生成字幕腳本
async function generateSubtitleScript(productData: any): Promise<string> {
  const productItem: ProductItem = {
    product_url: '',
    title: productData.title || productData.name || '商品標題',
    image: productData.image || '',
    price: Number(productData.price) || 0,
    commission: productData.commission || 0,
    category: productData.category || '',
  };

  const scriptResult = generateScript(productItem, 'lazy');
  return scriptResult.lines;
}

// 從腳本產出影片（需要後端 API 支援）
async function generateVideoFromScript(productData: any, subtitle: string): Promise<string> {
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script: subtitle, subtitle }),
  });

  if (!response.ok) {
    throw new Error('影片生成失敗');
  }

  const data = await response.json();
  return data.videoUrl || '';
}

export default function ShopeeVideoScript() {
  const [inputUrl, setInputUrl] = useState('');
  const [status, setStatus] = useState('');
  const [expandedUrl, setExpandedUrl] = useState('');
  const [productData, setProductData] = useState<any>(null);
  const [script, setScript] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateVideo = async () => {
    setStatus('');
    setError('');
    setExpandedUrl('');
    setProductData(null);
    setScript('');
    setSubtitle('');
    setVideoUrl('');
    setLoading(true);

    try {
      // Step 1: 展開短網址
      setStatus('展開網址中...');
      let fullUrl = inputUrl.trim();
      
      if (fullUrl.startsWith('https://s.shopee.tw/')) {
        fullUrl = await expandShopeeShortLink(fullUrl);
      }
      setExpandedUrl(fullUrl);

      // Step 2: 直接呼叫 API 生成影片（使用 productUrl）
      setStatus('產出影片中...');
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUrl: fullUrl, // 使用展開後的完整網址
        }),
      });

      if (!response.ok) {
        throw new Error('影片生成失敗');
      }

      const data = await response.json();

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        if (data.script) setScript(data.script);
        if (data.subtitle) setSubtitle(data.subtitle);
        setStatus('✅ 完成');
      } else {
        console.error('沒有收到影片網址');
        setError('沒有收到影片網址');
        setStatus('❌ 發生錯誤');
      }
    } catch (err: any) {
      console.error('影片產生錯誤：', err);
      setError(err.message || '未知錯誤');
      setStatus('❌ 發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setStatus('');
    setError('');
    setExpandedUrl('');
    setProductData(null);
    setScript('');
    setSubtitle('');
    setVideoUrl('');
    setLoading(true);

    try {
      // Step 1: 展開短網址
      setStatus('展開網址中...');
      let fullUrl = inputUrl.trim();
      
      if (fullUrl.startsWith('https://s.shopee.tw/')) {
        fullUrl = await expandShopeeShortLink(fullUrl);
      }
      setExpandedUrl(fullUrl);

      // Step 2: 取得商品資料
      setStatus('取得商品資料...');
      const data = await fetchShopeeData(fullUrl);
      setProductData(data);

      // Step 3: 生成字幕腳本
      setStatus('生成字幕腳本...');
      const generatedSubtitle = await generateSubtitleScript(data);
      setScript(generatedSubtitle);

      // Step 4: 產出影片
      setStatus('產出影片中...');
      try {
        const video = await generateVideoFromScript(data, generatedSubtitle);
        setVideoUrl(video);
        setStatus('✅ 完成');
      } catch (err: any) {
        console.error(err);
        setError(err.message || '未知錯誤');
        setStatus('⚠️ 字幕稿已生成，影片生成功能開發中');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '未知錯誤');
      setStatus('❌ 發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-4 border rounded-xl bg-white shadow-md">
      <h1 className="text-xl font-bold mb-2">🎬 單筆 Shopee 商品 ➜ 自動影片生成</h1>

      <input
        type="text"
        placeholder="請貼上 Shopee 商品網址（含短網址）"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        disabled={loading}
      />

      <button
        onClick={handleGenerateVideo}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading || !inputUrl}
      >
        {loading ? '處理中...' : '開始產生影片內容'}
      </button>

      {status && <p className="mt-4 text-sm text-gray-700">👉 {status}</p>}
      {error && <p className="text-sm text-red-500">❌ {error}</p>}

      {expandedUrl && (
        <p className="text-xs text-gray-500 break-all mt-2">
          🔗 展開網址：{expandedUrl}
        </p>
      )}

      {productData && (
        <div className="mt-4 text-sm bg-gray-50 border p-3 rounded">
          <p>
            <strong>📌 商品名稱：</strong>
            {productData.title || productData.name}
          </p>
          <p>
            <strong>💰 價格：</strong>
            {productData.price > 100000
              ? `$${(productData.price / 100000).toFixed(2)}`
              : `$${productData.price.toLocaleString()}`}
          </p>
          {productData.description && (
            <p>
              <strong>📋 描述：</strong>
              {productData.description.slice(0, 60)}...
            </p>
          )}
        </div>
      )}

      {script && (
        <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded text-sm whitespace-pre-wrap">
          <strong>📝 字幕稿：</strong>
          <br />
          {script}
        </div>
      )}

      {videoUrl && (
        <div className="mt-4">
          <p>🎬 已產出影片：</p>
          <video
            controls
            src={videoUrl}
            className="w-full max-w-xl rounded border"
          />
        </div>
      )}

      {script && (
        <div className="mt-2">
          <p>📝 產出腳本：</p>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{script}</pre>
        </div>
      )}

      {subtitle && (
        <div className="mt-2">
          <p>🈸 字幕內容：</p>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{subtitle}</pre>
        </div>
      )}

      {/* 測試按鈕：用於測試影片顯示 */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setVideoUrl('https://cdn.example.com/videos/fake-output.mp4')}
          className="mt-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
        >
          測試影片顯示
        </button>
      )}
    </div>
  );
}
