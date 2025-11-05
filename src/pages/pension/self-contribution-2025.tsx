import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ShareButtons from '@/components/ShareButtons';

export default function SelfContribution2025() {
  const { i18n } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? "Labor Pension Self-Contribution Guide | 2025 Benefits & Application Process | RxV"
            : "勞退金自提教學｜2025 一次看懂自提 6% 的好處與申請流程｜RxV"}
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? "Workers can voluntarily contribute 6% of their salary to their personal pension account, ensuring more secure retirement savings. This article explains the 2025 self-contribution process and benefits."
              : "勞退金可由勞工自願提繳 6%，讓退休金更有保障。本文說明 2025 年自提流程與注意事項。"
          }
        />
        <meta
          name="keywords"
          content={
            isEnglish
              ? "labor pension, self-contribution, retirement savings, tax benefits, pension planning, RxV"
              : "勞退金, 自提, 退休儲蓄, 節稅, 退休規劃, RxV"
          }
        />
        <meta
          property="og:title"
          content={
            isEnglish
              ? "Labor Pension Self-Contribution Guide | 2025 Benefits & Application Process"
              : "勞退金自提教學｜2025 一次看懂自提 6% 的好處與申請流程"
          }
        />
        <meta
          property="og:description"
          content={
            isEnglish
              ? "Workers can voluntarily contribute 6% of their salary to ensure better retirement benefits. Learn how to apply and save on taxes."
              : "勞退金可由勞工自願提繳 6%，讓退休金更有保障。"
          }
        />
      </Helmet>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">
          {isEnglish ? "Labor Pension Self-Contribution Guide" : "勞退金自提教學"}
        </h1>

        <p className="text-gray-500 mb-6">2025-11-04</p>

        <p className="mb-4">
          {isEnglish
            ? "Workers can voluntarily contribute 6% of their monthly salary to their personal pension account, with the government providing guaranteed returns. This system not only strengthens future retirement benefits but also offers tax-saving advantages."
            : "勞工可自願每月提繳薪資的 6% 至個人退休金帳戶，政府同步提供收益保障。這項制度不僅能強化未來退休金，也有節稅效果。"}
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          {isEnglish ? "Three Major Benefits of Self-Contribution" : "自提的三大優點"}
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            {isEnglish
              ? "Increase retirement benefits: Self-contributed portion enjoys compound interest returns."
              : "增加退休金：自提部分享有複利收益。"}
          </li>
          <li>
            {isEnglish
              ? "Tax benefits: Self-contribution amounts can be deducted from income tax."
              : "節稅優惠：自提金額可列入所得稅扣除。"}
          </li>
          <li>
            {isEnglish
              ? "Fully owned by the individual: Receive as a lump sum or installments after retirement."
              : "完全歸個人所有：退休後一次領回或分期領取。"}
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          {isEnglish ? "Application Process" : "申請流程"}
        </h2>
        <ol className="list-decimal pl-6 mb-4">
          <li>
            {isEnglish
              ? "Submit a 'Voluntary Contribution Application' to your company's HR department."
              : "向公司人事單位提出「自願提繳申請書」。"}
          </li>
          <li>
            {isEnglish
              ? "The company will deduct 6% monthly and contribute it to your personal account."
              : "由公司每月代扣 6% 並提繳至個人帳戶。"}
          </li>
          <li>
            {isEnglish
              ? "Log in to the 'Labor Insurance Bureau Labor Pension Personal Portal' to check contribution records and returns."
              : "登入「勞保局勞退個人專區」即可查詢提繳紀錄與收益。"}
          </li>
        </ol>

        <div className="bg-yellow-50 p-4 rounded-lg mt-6">
          <strong>📎 {isEnglish ? "Further Reading:" : "延伸閱讀："}</strong>
          <p>
            {isEnglish ? (
              <>
                You can refer to the{" "}
                <a
                  className="text-blue-600 underline"
                  href="https://www.bli.gov.tw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Labor Insurance Bureau Labor Pension Personal Portal
                </a>{" "}
                to understand self-contribution calculation examples.
              </>
            ) : (
              <>
                可參考「
                <a
                  className="text-blue-600 underline"
                  href="https://www.bli.gov.tw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  勞保局勞退個人專區
                </a>
                」了解自提計算範例。
              </>
            )}
          </p>
        </div>

        <ShareButtons title={isEnglish
          ? "Labor Pension Self-Contribution Guide | 2025 Benefits & Application Process"
          : "勞退金自提教學｜2025 一次看懂自提 6% 的好處與申請流程"} />

        <div className="text-center mt-8">
          <Link
            to="/pension"
            className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block"
          >
            {isEnglish ? "← Back to Pension Guide" : "← 回到退休金懶人包"}
          </Link>
        </div>
      </main>
    </>
  );
}

