import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function InsuranceOldage2025() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "Labor Insurance Old-Age Benefit Calculation Guide | 2025 Latest Retirement Pension Application | RxV"
            : "勞保老年給付試算懶人包｜2025 最新退休金申請教學｜RxV"}
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? "Quickly understand how to apply for and calculate Labor Insurance old-age benefits. This guide compiles 2025 conditions, calculation methods, and application procedures."
              : "快速了解勞保老年給付申請與試算方式。本文整理 2025 年勞保老年給付條件、金額試算與申請流程。"
          }
        />
        <meta
          name="keywords"
          content={
            isEnglish
              ? "labor insurance pension, old-age benefit, retirement calculation, pension application, RxV"
              : "勞保老年給付, 退休金試算, 勞保申請, 退休規劃, RxV"
          }
        />
        <meta
          property="og:title"
          content={
            isEnglish
              ? "Labor Insurance Old-Age Benefit Calculation Guide | 2025 Latest Retirement Pension Application"
              : "勞保老年給付試算懶人包｜2025 最新退休金申請教學"
          }
        />
        <meta
          property="og:description"
          content={
            isEnglish
              ? "Quickly understand how to apply for and calculate Labor Insurance old-age benefits."
              : "快速了解勞保老年給付申請與試算方式。"
          }
        />
      </Helmet>

      <main className="max-w-3xl mx-auto py-10 px-4 text-lg">
        <h1 className="text-3xl font-bold mb-4">
          {isEnglish
            ? "Labor Insurance Old-Age Benefit Calculation Guide"
            : "勞保老年給付試算懶人包"}
        </h1>

        <p className="text-gray-500 mb-6">2025-11-04</p>

        <p className="mb-4">
          {isEnglish
            ? "Want to know how much labor insurance old-age benefit you can receive after retirement? This guide helps you quickly grasp the latest regulations and calculation methods for 2025."
            : "想了解退休後可以領多少勞保老年給付嗎？本懶人包幫你快速掌握 2025 年最新規定與試算方式。"}
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          {isEnglish ? "Eligibility Requirements" : "申請資格"}
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            {isEnglish
              ? "Age 60 or above, with at least 15 years of insurance coverage."
              : "年滿 60 歲，保險年資達 15 年以上。"}
          </li>
          <li>
            {isEnglish
              ? "Early retirees can choose reduced benefits (earliest application at age 55)."
              : "提前退休者可選擇減額領取（最早可於 55 歲申請）。"}
          </li>
          <li>
            {isEnglish
              ? "If conditions are not met, a lump-sum payment is still available."
              : "若未滿條件，仍可領取一次給付。"}
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          {isEnglish ? "Benefit Amount Calculation" : "給付金額試算"}
        </h2>
        <p className="mb-4">
          {isEnglish ? (
            <>
              Visit the Labor Insurance Bureau's{" "}
              <a
                className="text-blue-600 underline"
                href="https://www.bli.gov.tw"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pension Calculation System
              </a>{" "}
              and enter your monthly insured salary and years of service. The system will
              automatically calculate your monthly benefit amount.
            </>
          ) : (
            <>
              可至勞保局「
              <a
                className="text-blue-600 underline"
                href="https://www.bli.gov.tw"
                target="_blank"
                rel="noopener noreferrer"
              >
                勞保局退休金試算系統
              </a>
              」輸入月投保薪資與年資，系統會自動計算月領金額。
            </>
          )}
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          {isEnglish ? "Application Process" : "申請方式"}
        </h2>
        <ol className="list-decimal pl-6 mb-4">
          <li>
            {isEnglish
              ? "Prepare ID card, personal seal, and bank account cover."
              : "準備身分證、印章、存摺封面。"}
          </li>
          <li>
            {isEnglish
              ? "Download the application form or apply through the 'Labor Insurance Bureau Online Service Portal'."
              : "下載申請書或於「勞保局線上申辦服務網」辦理。"}
          </li>
          <li>
            {isEnglish
              ? "After approval, funds will be directly deposited into your account."
              : "審核完成後，款項直接撥入帳戶。"}
          </li>
        </ol>

        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <strong>⚠️ {isEnglish ? "Note:" : "注意："}</strong>
          <p>
            {isEnglish
              ? "This article is for reference only. Actual benefit amounts are subject to Labor Insurance Bureau announcements and individual years of service."
              : "本文僅供參考，實際給付金額依勞保局公告與個人年資為準。"}
          </p>
        </div>

        <ShareButtons title={isEnglish ? "Labor Insurance Old-Age Benefit Calculation Guide | 2025 Latest Retirement Pension Application" : "勞保老年給付計算指南｜2025 最新退休金申請"} />

        <div className="text-center mt-8">
          <Link
            to="/pension"
            className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block transition"
          >
            {isEnglish ? "← Back to Pension Guide" : "← 回到退休金懶人包"}
          </Link>
        </div>
      </main>
    </>
  );
}

