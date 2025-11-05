import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function SleepBalance2025() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <>
      <Helmet>
        {lang.startsWith("zh") ? (
          <>
            <title>睡眠力回春｜每天多睡一小時，健康財富都變好｜RxV 健康專欄</title>
            <meta
              name="description"
              content="睡眠不足會讓身體老化、決策力下降。多睡一小時，讓健康、財富與效率同步提升。"
            />
            <meta
              name="keywords"
              content="睡眠健康, 壓力調節, 生理時鐘, 睡眠品質, RxV 健康專欄"
            />
            <meta property="og:title" content="睡眠力回春｜每天多睡一小時，健康財富都變好" />
            <meta
              property="og:description"
              content="每天多睡一小時，修復身體與心靈能量，讓生活更有效率、更幸福。"
            />
          </>
        ) : (
          <>
            <title>Power of Sleep｜One More Hour for Health & Wealth｜RxV Health Insight</title>
            <meta
              name="description"
              content="Lack of sleep harms both your body and your mind. Sleeping an extra hour restores energy and improves productivity and wealth."
            />
            <meta
              name="keywords"
              content="sleep health, circadian rhythm, productivity, recovery, RxV blog"
            />
            <meta property="og:title" content="Power of Sleep｜One More Hour for Health & Wealth" />
            <meta
              property="og:description"
              content="Recharge your life by improving sleep quality — a small change that multiplies your focus and happiness."
            />
          </>
        )}
      </Helmet>
      <div className="max-w-3xl mx-auto py-10 px-6 text-lg">
      <h1 className="text-2xl font-bold mb-4">
        {lang.startsWith("zh")
          ? "😴 睡眠力回春｜每天多睡一小時，健康財富都變好"
          : "😴 Power of Sleep｜One More Hour for Health & Wealth"}
      </h1>

      <p className="text-gray-600 mb-4">2025-11-04</p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            你知道嗎？根據衛福部調查，台灣成年人平均每天睡不到 6 小時，
            長期睡眠不足除了導致免疫力下降，也會影響理財與決策力。
          </>
        ) : (
          <>
            Did you know? According to the Ministry of Health and Welfare survey, Taiwanese adults
            average less than 6 hours of sleep per day. Long-term sleep deprivation not only leads
            to decreased immunity but also affects financial management and decision-making ability.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            睡眠其實是最划算的「免費投資」。只要每天提早入睡一小時，
            不僅皮膚變好、記憶力提升，更能減少衝動消費與焦慮。
            國外研究顯示，睡得好的人年均醫療支出可少 15%。
          </>
        ) : (
          <>
            Sleep is actually the most cost-effective "free investment." Just going to bed one hour
            earlier each day not only improves skin and memory but also reduces impulsive spending
            and anxiety. International research shows that people who sleep well can reduce their
            annual medical expenses by 15%.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            建議養成「固定睡眠儀式」：放下手機、泡腳或做伸展，
            並設定「睡眠鬧鐘」提醒自己該休息。讓生活節奏回歸自然，
            你的健康與財務都會更有餘裕。
          </>
        ) : (
          <>
            It's recommended to develop a "fixed sleep ritual": put down your phone, soak your feet
            or do stretches, and set a "sleep alarm" to remind yourself to rest. Return your life
            rhythm to nature, and both your health and finances will have more room.
          </>
        )}
      </p>

      <div className="text-center mt-8">
        <Link
          to="/health"
          className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block"
        >
          {lang.startsWith("zh") ? "← 回到健康生活專欄" : "← Back to Health Living"}
        </Link>
      </div>
      </div>
    </>
  );
}

