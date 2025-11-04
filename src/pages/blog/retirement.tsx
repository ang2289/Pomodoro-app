import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function RetirementPage() {
  return (
    <>
      <Helmet>
        <title>📊 勞保退休金試算｜RxV 夢想創作工作室</title>
        <meta
          name="description"
          content="提供勞保、勞退與公保退休金試算資訊，幫助您了解退休金金額與申領條件，為未來做好準備。"
        />
        <meta name="keywords" content="勞保退休金, 勞退試算, 公保, 退休金計算, 理財規劃, RxV" />
        <meta property="og:title" content="勞保退休金試算" />
        <meta property="og:description" content="掌握退休金估算方式，協助您提早規劃安穩退休生活。" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://rxv-dreamstudio.vercel.app/retirement" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "勞保退休金試算",
            "url": "https://rxv-dreamstudio.vercel.app/retirement",
            "description": "整合勞保與勞退退休金試算工具，協助您掌握金額與申領方式。",
            "inLanguage": "zh-TW",
            "publisher": {
              "@type": "Organization",
              "name": "RxV 夢想創作工作室",
              "url": "https://rxv-dreamstudio.vercel.app"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-right mb-4">
          <Link
            to="/"
            className="bg-blue-500 !text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            回首頁
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">📊 勞保退休金試算</h1>
        <p className="text-gray-600 mb-6">
          本頁將整合勞保、勞退與公保退休金試算工具，
          提供試算公式、申領年齡說明與金額估算方式。
        </p>
        <p className="text-gray-500 text-sm">
          試算功能開發中，預計下一版本上線。
        </p>
      </div>
    </>
  );
}

