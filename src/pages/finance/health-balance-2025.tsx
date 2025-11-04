import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function HealthBalance2025() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <>
      <Helmet>
        {lang.startsWith("zh") ? (
          <>
            <title>身心平衡理財術｜讓健康與財務穩定同行｜RxV 健康理財專欄</title>
            <meta
              name="description"
              content="現代人常陷入要健康還是要錢的兩難，其實健康與理財並不衝突。從睡眠、運動與理財分配開始，打造平衡人生。"
            />
            <meta
              name="keywords"
              content="健康理財, 身心平衡, 財務規劃, 健康投資, RxV 專欄"
            />
            <meta property="og:title" content="身心平衡理財術｜讓健康與財務穩定同行" />
            <meta
              property="og:description"
              content="保持健康即是最好的投資，學會同時管理身心與財務，讓人生更穩定更安心。"
            />
          </>
        ) : (
          <>
            <title>Balanced Wellness & Finance｜Stay Healthy, Stay Wealthy｜RxV Finance Insight</title>
            <meta
              name="description"
              content="Health and wealth are not opposites. With balanced routines and mindful financial planning, you can achieve both stability and peace."
            />
            <meta
              name="keywords"
              content="health finance, financial wellness, life balance, healthy investment, RxV blog"
            />
            <meta property="og:title" content="Balanced Wellness & Finance｜Stay Healthy, Stay Wealthy" />
            <meta
              property="og:description"
              content="Health is the best investment — learn how to balance your body, mind, and financial goals for a steady life."
            />
          </>
        )}
      </Helmet>
      <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-4">
        {lang.startsWith("zh")
          ? "💖 身心平衡理財術｜讓健康與財務穩定同行"
          : "💖 Balanced Wellness & Finance｜Stay Healthy, Stay Wealthy"}
      </h1>

      <p className="text-gray-600 mb-4">2025-11-04</p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            現代人常陷入「要健康還是要錢？」的兩難，其實兩者並不衝突。健康與理財的關鍵，
            在於平衡。保持良好的睡眠、規律運動與飲食控制，不僅能減少醫療支出，
            也能延長工作與創造收入的時間。
          </>
        ) : (
          <>
            Many people face the dilemma of "health or wealth?" but in reality, they are not
            conflicting. The key to health and finance lies in balance. Maintaining good sleep,
            regular exercise, and dietary control not only reduces medical expenses but also
            extends the time available for work and income generation.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            理財方面，應採取「分配式理財」策略：
            固定儲蓄健康預算（例如健身、營養餐、檢查費用），
            並將健康視為長期投資的一部分。
            這樣的做法能讓人生財務結構更穩定，也更安心。
          </>
        ) : (
          <>
            In terms of financial management, adopt a "distributed financial planning" strategy:
            regularly save a health budget (such as fitness, nutritious meals, check-up costs),
            and treat health as part of a long-term investment. This approach makes life's financial
            structure more stable and reassuring.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            在未來的理財觀中，「健康」將是最大的資產。
            當你把健康放入預算規劃中，不只是花錢，而是在投資未來。
            因為真正的財富，不只是銀行帳戶裡的數字，
            而是能自由享受時間與身體狀態的能力。
          </>
        ) : (
          <>
            In the future view of financial management, "health" will be the greatest asset. When
            you incorporate health into your budget planning, you're not just spending money—you're
            investing in the future. Because true wealth is not just the numbers in a bank account,
            but the ability to freely enjoy time and physical well-being.
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

