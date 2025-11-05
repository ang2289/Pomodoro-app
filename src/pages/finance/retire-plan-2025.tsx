import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FAQ from '@/components/FAQ';
import ShareButtons from '@/components/ShareButtons';

export default function RetirePlan2025() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 leading-8">
      <article className="bg-white p-6 md:p-8 rounded-xl shadow-sm border text-lg">

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isEnglish
            ? "🧘‍♂️ Retirement Health Triangle | Balancing Medical Care, Savings, and Quality of Life"
            : "🧘‍♂️ 退休健康金三角｜醫療、儲蓄與生活品質兼顧"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isEnglish ? "Updated: " : "更新："}{new Date().toISOString().slice(0, 10)}
        </p>

        <p>
          {isEnglish
            ? "As life expectancy increases, retirement may last 20 to 30 years. Without comprehensive health and financial planning, retirement life may fall into situations where \"money is sufficient but health fails\" or \"health is good but finances are tight.\" Therefore, the \"Retirement Health Triangle\" has become an essential life stability framework for modern people."
            : "隨著平均壽命延長，退休生活可能長達 20 至 30 年。若沒有完整的健康與財務規劃，晚年生活可能落入「錢夠用但身體撐不住」或「身體健康但財務吃緊」的情況。因此，「退休健康金三角」成為現代人必修的生活穩定架構。"}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "What is the Retirement Health Triangle?" : "什麼是退休健康金三角？"}
        </h2>
        <p>
          {isEnglish
            ? "The triangle consists of three core components:"
            : "金三角由三大核心組成："}
        </p>

        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong>{isEnglish ? "Medical Coverage: " : "醫療保障："}</strong>
            {isEnglish
              ? "Ensure health insurance, long-term care, and major illness care are in place"
              : "確保健保、長照及重大疾病照護到位"}
          </li>
          <li>
            <strong>{isEnglish ? "Financial Reserves: " : "財務儲備："}</strong>
            {isEnglish
              ? "Plan sustainable retirement living expenses and emergency reserves"
              : "規劃可持續的退休生活費與緊急備用金"}
          </li>
          <li>
            <strong>{isEnglish ? "Quality of Life: " : "生活品質："}</strong>
            {isEnglish
              ? "Maintain social connections, activity interests, and sources of mental health"
              : "保留社交、活動興趣與心理健康來源"}
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "1) Medical and Long-term Care Coverage" : "1) 醫療與長照保障"}
        </h2>
        <p>
          {isEnglish
            ? "Health is the prerequisite for retirement life. The following are actionable check items:"
            : "健康是退休生活的前提。以下是可直接執行的檢查項目："}
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            {isEnglish
              ? "Confirm if you meet the conditions for a "
              : "確認是否符合 "}
            <strong>{isEnglish ? "Catastrophic Illness Card" : "重大傷病卡"}</strong>
            {isEnglish
              ? " (can reduce medical out-of-pocket expenses)"
              : " 條件（可降低醫療自費）"}
          </li>
          <li>
            {isEnglish
              ? "Understand the "
              : "了解 "}
            <strong>{isEnglish ? "Long-term Care 2.0 Service Application Process" : "長照 2.0 服務申請流程"}</strong>
          </li>
          <li>
            {isEnglish
              ? "Establish \"Emergency Medical Contact and Medical Data Backup\" at home"
              : "家中建立「就醫緊急聯絡與醫療資料備存」"}
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "2) Financial Reserves: Living Expenses + Emergency Fund" : "2) 財務儲備：生活費 + 緊急金"}
        </h2>
        <p>
          {isEnglish
            ? "Retirement finances are not about pursuing more, but about pursuing \"predictable and sustainable over the long term.\""
            : "退休財務不是追求越多越好，而是追求「可預測、可長期維持」。"}
        </p>

        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <strong>{isEnglish ? "Recommended Allocation:" : "建議配置："}</strong>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              {isEnglish
                ? "Daily living expenses: Use \"Monthly necessary expenses × 12\" as the annual amount"
                : "日常生活費：以「每月必要支出 × 12」為一年額度"}
            </li>
            <li>
              {isEnglish
                ? "Emergency medical reserve: 3-6 months of living expenses"
                : "緊急醫療備用金：3～6 個月生活費"}
            </li>
            <li>
              {isEnglish
                ? "Investment tools should focus on stable types, such as: fixed deposits, bonds, diversified retirement plans"
                : "投資工具以穩定型為主，如：定存、債券、分散式退休方案"}
            </li>
          </ul>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">
          {isEnglish ? "3) Quality of Life: Maintaining Physical and Mental Vitality" : "3) 生活品質：保持身心活力"}
        </h2>
        <p>
          {isEnglish
            ? "Retirement is not \"stopping,\" but \"changing the rhythm.\""
            : "退休不是「停下來」，而是「換節奏」。"}
        </p>

        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            {isEnglish
              ? "Regular weekly walks, stretching, or simple exercises"
              : "每週固定散步、拉筋或簡易運動"}
          </li>
          <li>
            {isEnglish
              ? "Maintain stable social frequency with friends or communities"
              : "與朋友或社群保持穩定社交頻率"}
          </li>
          <li>
            {isEnglish
              ? "Establish life rituals: such as tea drinking, reading, handicrafts, gardening"
              : "建立生活儀式感：例如喝茶、看書、手作、園藝"}
          </li>
        </ul>

        <FAQ
          title={isEnglish ? "FAQ Q&A" : "常見問題 Q&A"}
          items={isEnglish
            ? [
                { q: "Is more retirement money always better?", a: "Not necessarily. A configuration that is sustainable long-term, low-stress, and risk-controllable is the most suitable retirement model for yourself." },
                { q: "What if I don't have much savings?", a: "The key to quality of life is not spending, but rhythm, health, and social support structure." },
                { q: "Will medical expenses become a retirement burden?", a: "Catastrophic Illness Card, Long-term Care 2.0, and NHI special subsidies can significantly reduce medical expense pressure." },
                { q: "Will I feel empty after retirement?", a: "You can establish \"anticipatable daily life\": weekly walks, handicrafts, reading, or volunteer activities can stabilize psychological needs." }
              ]
            : [
                { q: "退休金越多越好嗎？", a: "不一定。可長期維持、壓力低、風險可控的配置，才是最適合自己的退休金模式。" },
                { q: "沒有太多存款怎麼辦？", a: "生活品質的關鍵不在花費，而在節奏、健康與社交支持結構。" },
                { q: "醫療費會不會造成退休負擔？", a: "重大傷病卡、長照 2.0 與健保特殊補助，可大幅降低醫療支出壓力。" },
                { q: "退休後會覺得空虛嗎？", a: "可建立「可期待的日常」：每周散步、手作、讀書或志工活動，即能穩定心理需求。" }
              ]}
        />

        <ShareButtons title={isEnglish
          ? "🧘‍♂️ Retirement Health Triangle | Balancing Medical Care, Savings, and Quality of Life"
          : "🧘‍♂️ 退休健康金三角｜醫療、儲蓄與生活品質兼顧"} />

        <section className="mt-10 text-sm text-gray-500">
          <p>{isEnglish ? "Data Sources:" : "資料來源："}</p>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            <li>
              <a className="text-blue-600 underline" href="https://1966.gov.tw" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "Ministry of Health and Welfare - Long-term Care Resource Integration Platform (1966)"
                  : "衛生福利部 長照資源整合平台（1966）"}
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://www.nhi.gov.tw/" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "NHIA Official Website"
                  : "健保署官方網站（NHIA）"}
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://www.nhi.gov.tw/Content_List.aspx?n=11623" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "NHIA - Public Health Data and Service Portal"
                  : "健保署 民眾健康資料與服務入口"}
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://165.npa.gov.tw/" target="_blank" rel="noopener noreferrer">
                {isEnglish
                  ? "National Police Agency - 165 Anti-Fraud Section"
                  : "內政部警政署 165 反詐騙專區"}
              </a>
            </li>
          </ul>
          <p className="italic mt-2">
            {isEnglish
              ? "This site is an information compilation platform, not a government agency. Final content is subject to official announcements."
              : "本站為資訊整理平台，非政府機關。最終內容請以官方公告為準。"}
          </p>
        </section>

        <div className="mt-10">
          <Link
            to="/finance"
            className="inline-block bg-blue-600 !text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            style={{ color: '#ffffff' }}
          >
            {isEnglish ? "← Back to Health & Finance Column" : "← 回到健康與理財專欄"}
          </Link>
        </div>
      </article>
    </main>
  );
}
