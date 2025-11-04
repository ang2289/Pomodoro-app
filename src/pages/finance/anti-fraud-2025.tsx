import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OfficialSourceNote from '@/components/OfficialSourceNote';

export default function AntiFraud2025() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEnglish = !lang.startsWith("zh");

  return (
    <>
      <Helmet>
        {isEnglish ? (
          <>
            <title>⚠️ NT$10,000 Universal Subsidy Reminder｜Beware of Scams!｜RxV Finance</title>
            <meta
              name="description"
              content="The government has launched the NT$10,000 Universal Cash Subsidy program. Citizens can apply through the official portal https://10000.gov.tw. However, beware of fake links or phishing SMS pretending to be the government."
            />
            <meta
              name="keywords"
              content="relief subsidy, anti-fraud, government subsidy, financial security, RxV blog"
            />
            <meta property="og:title" content="⚠️ NT$10,000 Universal Subsidy Reminder｜Beware of Scams!" />
            <meta
              property="og:description"
              content="The government has launched the NT$10,000 Universal Cash Subsidy program. Beware of scams and verify the official website."
            />
          </>
        ) : (
          <>
            <title>⚠️ 普發一萬元補助提醒｜認明官網防詐騙！｜RxV 健康理財專欄</title>
            <meta
              name="description"
              content="全民普發現金即將開放，提醒大家小心詐騙、認明 10000.gov.tw 官網。"
            />
            <meta
              name="keywords"
              content="普發補助, 防詐騙, 政府補助, 理財安全, RxV 專欄"
            />
            <meta property="og:title" content="⚠️ 普發一萬元補助提醒｜認明官網防詐騙！" />
            <meta
              property="og:description"
              content="政府推出全民普發現金一萬元政策，請務必認明官方網站，小心詐騙。"
            />
          </>
        )}
      </Helmet>
      <div className="max-w-3xl mx-auto p-6 bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-sm mt-6 mb-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ⚠️ {isEnglish
            ? 'NT$10,000 Universal Subsidy Reminder｜Beware of Scams!'
            : '普發一萬元補助提醒｜認明官網防詐騙！'}
        </h1>

        <p className="text-gray-500 mb-4">2025-11-04</p>

        <p className="text-gray-700 leading-relaxed mb-4">
          {isEnglish
            ? 'The government has launched the "NT$10,000 Universal Cash Subsidy" program. Citizens can apply through the official portal https://10000.gov.tw. However, beware of fake links or phishing SMS pretending to be the government.'
            : '政府推出「全民普發現金一萬元」政策，民眾可透過官網申請登記：https://10000.gov.tw。然而近期詐騙簡訊頻傳，請務必認明官方網站！'}
        </p>

        <h2 className="font-semibold text-gray-800 mb-2">
          {isEnglish ? '⚠️ Anti-Fraud Reminder:' : '防詐騙提醒：'}
        </h2>

        <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
          <li>
            {isEnglish
              ? 'The government will never call, text, or ask you to operate an ATM.'
              : '政府不會以電話或簡訊要求你匯款或操作 ATM。'}
          </li>
          <li>
            {isEnglish
              ? 'Applications are free. No deposit or fee is required.'
              : '所有申請皆不需手續費或保證金。'}
          </li>
          <li>
            {isEnglish
              ? 'If you receive suspicious messages, call 165 Anti-Fraud Hotline for verification.'
              : '收到可疑簡訊請撥打 165 反詐騙專線查詢。'}
          </li>
          <li>
            {isEnglish
              ? 'Stay calm and remind family and friends not to click suspicious links.'
              : '領補助請安心，勿急著點擊不明連結，提醒長輩親友一起防詐！'}
          </li>
        </ul>

        <div className="flex justify-center mt-6">
          <Link
            to="/finance"
            className="px-5 py-2 bg-blue-600 !text-white rounded-full shadow hover:bg-blue-700 transition"
          >
            {isEnglish ? '← Back to Health & Finance Section' : '← 回到健康與理財專欄'}
          </Link>
        </div>

        <OfficialSourceNote />
      </div>
    </>
  );
}

