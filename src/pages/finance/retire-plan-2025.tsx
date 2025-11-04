import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function RetirePlan2025() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <>
      <Helmet>
        {lang.startsWith("zh") ? (
          <>
            <title>退休健康金三角｜醫療、儲蓄與生活品質兼顧｜RxV 理財生活</title>
            <meta
              name="description"
              content="退休規劃不只理財，還要兼顧健康與生活品質。了解醫療保障、儲蓄策略與心理健康的金三角平衡。"
            />
            <meta
              name="keywords"
              content="退休理財, 醫療保險, 退休健康, 生活品質, RxV 專欄"
            />
            <meta property="og:title" content="退休健康金三角｜醫療、儲蓄與生活品質兼顧" />
            <meta
              property="og:description"
              content="從醫療保障、財務儲備與生活品質三角構面打造幸福退休人生。"
            />
          </>
        ) : (
          <>
            <title>Retirement Wellness Triangle｜Health, Savings & Quality of Life｜RxV Finance</title>
            <meta
              name="description"
              content="Retirement isn't just about money — it's about health, savings, and happiness. Learn to balance the three for a fulfilling life."
            />
            <meta
              name="keywords"
              content="retirement planning, health insurance, senior wellness, lifestyle finance, RxV blog"
            />
            <meta property="og:title" content="Retirement Wellness Triangle｜Health, Savings & Quality of Life" />
            <meta
              property="og:description"
              content="Build your golden years on three pillars: medical security, financial savings, and joyful living."
            />
          </>
        )}
      </Helmet>
      <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-4">
        {lang.startsWith("zh")
          ? "🧘‍♀️ 退休健康金三角｜醫療、儲蓄與生活品質兼顧"
          : "🧘‍♀️ Retirement Wellness Triangle｜Health, Savings & Quality of Life"}
      </h1>

      <p className="text-gray-600 mb-4">2025-11-04</p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            隨著平均壽命延長，退休生活可能長達 20 至 30 年。
            若沒有完善的健康與財務規劃，晚年生活可能陷入「錢夠用但身體撐不住」的困境。
            因此，建立「退休健康金三角」成為現代人必修課。
          </>
        ) : (
          <>
            As average life expectancy increases, retirement life may last 20 to 30 years. Without
            proper health and financial planning, later life may fall into the dilemma of "having
            enough money but not enough physical strength." Therefore, establishing the "Retirement
            Wellness Triangle" has become essential for modern people.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            這個金三角包括三大核心：
            <strong>醫療保障、財務儲備、生活品質。</strong>
            第一，確保醫療與長照保險到位，減輕突發醫療支出壓力；
            第二，持續儲蓄與穩健投資，讓資金能支撐長期生活；
            第三，維持社交與興趣活動，避免心理孤立與失能。
          </>
        ) : (
          <>
            This golden triangle includes three core elements:{" "}
            <strong>medical security, financial reserves, and quality of life.</strong> First,
            ensure medical and long-term care insurance are in place to reduce the burden of sudden
            medical expenses. Second, maintain savings and stable investments so funds can support
            long-term living. Third, maintain social connections and interest activities to avoid
            psychological isolation and disability.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            建議從中年階段開始規劃，預留「健康基金」與「快樂基金」：
            前者用於醫療與保健開銷，後者專門投資於學習、旅行或創作等生活成就。
            這樣的分配能同時照顧身心與精神層面。
          </>
        ) : (
          <>
            It's recommended to start planning from middle age, setting aside a "Health Fund" and a
            "Happiness Fund": the former for medical and healthcare expenses, the latter
            specifically for investing in life achievements such as learning, travel, or creative
            pursuits. This allocation can simultaneously care for physical, mental, and spiritual
            aspects.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            許多人認為理財只是為了退休金數字夠大，
            但真正的退休力在於「能自由選擇過什麼樣的生活」。
            若健康在、心境穩、金流順，退休後的每一天都能活得更自在。
          </>
        ) : (
          <>
            Many people think financial management is just about having a large retirement fund,
            but true retirement power lies in "the freedom to choose what kind of life to live."
            If health is present, the mind is stable, and cash flow is smooth, every day after
            retirement can be lived more freely.
          </>
        )}
      </p>

      <div className="text-center mt-8">
        <Link
          to="/finance"
          className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block"
        >
          {lang.startsWith("zh") ? "← 回到健康與理財專欄" : "← Back to Health & Finance"}
        </Link>
      </div>
      </div>
    </>
  );
}

