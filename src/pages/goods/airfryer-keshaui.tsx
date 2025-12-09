// /src/pages/goods/airfryer-keshaui.tsx
import React from "react";
import SEO from "@/components/SEO";

export default function AirfryerPage() {
  // 🎬 影片配置：選擇其中一種方式
  // 方式一：本地影片
  const localVideoSrc = "/videos/airfryer-demo.mp4";
  
  // 方式二：YouTube 嵌入（填入 YouTube 影片 ID）
  const youtubeVideoId = ""; // 例如："dQw4w9WgXcQ"
  
  // 方式三：其他 CDN 或影音連結
  const cdnVideoUrl = ""; // 例如："https://example.com/video.mp4"
  
  // 決定使用哪種影片來源（優先順序：YouTube > CDN > 本地）
  const videoType = youtubeVideoId ? "youtube" : cdnVideoUrl ? "cdn" : "local";

  return (
    <>
      <SEO
        title="氣炸控必看🔥 科帥 AF606 液晶氣炸鍋｜限時贈品＋超值12件組"
        description="超高 CP 值氣炸鍋推薦，5.5L 超大容量＋液晶觸控＋360°熱風循環。送烘焙12件組＋清潔泡泡，數量有限送完為止！"
        keywords="氣炸鍋, 科帥, AF606, 氣炸鍋推薦, 5.5L, 液晶觸控, 烘焙組"
        url="https://pomodoro-app-eight-rouge.vercel.app/goods/airfryer-keshaui"
        image="/assets/airfryer-keshaui-cover.png"
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">🔥 氣炸控必看！科帥 AF606 氣炸鍋限時大促＋送 12 件超值烘焙組</h1>

        {/* ✅ 封面圖片 */}
        <img 
          src="/assets/airfryer-keshaui-cover.png" 
          alt="氣炸鍋封面圖" 
          className="w-full rounded-lg mb-4" 
        />

        {/* ✅ 影片區塊：支援本地影片、YouTube 嵌入、或其他 CDN 連結 */}
        {videoType === "youtube" && youtubeVideoId && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden border shadow-lg">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title="氣炸鍋推薦影片"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {videoType === "cdn" && cdnVideoUrl && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden border shadow-lg">
            <video 
              controls 
              className="w-full h-full"
              preload="metadata"
            >
              <source src={cdnVideoUrl} type="video/mp4" />
              您的瀏覽器不支援播放影片
            </video>
          </div>
        )}

        {videoType === "local" && localVideoSrc && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden border shadow-lg">
            <video 
              controls 
              className="w-full h-full"
              preload="metadata"
            >
              <source src={localVideoSrc} type="video/mp4" />
              您的瀏覽器不支援播放影片
            </video>
          </div>
        )}

        <p className="mb-4">
          如果你正在找一台「大容量、操作簡單、清洗方便」的氣炸鍋，這台
          <strong>科帥 AF606 液晶氣炸鍋</strong> 真的可以列入考慮！容量 5.5L、觸控操作、七種內建菜單，加上 360°熱風循環功能，炸雞、薯條、牛排、烤魚都難不倒它！
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">✅ 超值 12 件烘焙組＋清潔泡泡</h2>
        <img 
          src="/assets/airfryer-keshaui/feature-2.png" 
          alt="附贈烘焙配件" 
          className="w-full rounded-lg mb-4" 
        />
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>8 吋披薩盤、雙層烤架、矽膠刷、夾子、蛋糕模、油紙、隔熱手套…</li>
          <li>再加送氣炸鍋專用清潔泡泡，懶人清洗好幫手</li>
          <li><strong className="text-red-500">數量有限，贈品以賣場實際為準，送完為止！</strong></li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">🎯 為什麼推薦這台？</h2>
        <img 
          src="/assets/airfryer-keshaui/feature-3.png" 
          alt="氣炸鍋推薦功能" 
          className="w-full rounded-lg mb-4" 
        />
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>液晶觸控介面＋七大預設模式（薯條、蝦子、雞翅、牛排…）</li>
          <li>一鍵啟動，懶人也能快速上手</li>
          <li>內膽不沾塗層，烹調不沾黏、清洗超省事</li>
          <li>大容量 5.5L，整隻雞、披薩、雞翅同時放得下</li>
          <li>360° 高速熱風循環，炸物無油更健康</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">🔗 立即搶購</h2>
        <a
          href="https://s.shopee.tw/4VVYsj4w4v"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-pink-600 text-white px-4 py-2 rounded-full font-bold hover:bg-pink-700"
        >
          👉 前往蝦皮搶購（限時送贈品）
        </a>

        <h2 className="text-xl font-semibold mt-6 mb-2">📌 商品資訊</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-700 text-sm">
          <li>品牌／型號：科帥 AF606</li>
          <li>容量：5.5L（內鍋 3.6L）</li>
          <li>操作介面：液晶觸控螢幕／攝氏溫度顯示</li>
          <li>溫度範圍：80°C ~ 200°C</li>
          <li>功率：1400W｜電壓：110V</li>
          <li>保固一年（超過鑑賞期，買家需負擔運費）</li>
        </ul>

        <p className="text-xs text-gray-500 mt-6">
          ※ 本文為個人使用經驗與公開資料整理，非官方開箱，僅作為導購參考。圖片來源：蝦皮賣場。如有侵權請來信告知，我們會立即下架。
        </p>
      </div>
    </>
  );
}

