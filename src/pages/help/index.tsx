// 使用說明頁：目前採「登入後購買點數」模式，不提供免費點數或試用額度。

import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buildSEO } from '../../lib/seo'

type FaqItem = {
  question: string
  answer: string
}

export default function HelpPage() {
  const { i18n } = useTranslation()
  const isEnglish = i18n.language?.startsWith('en')

  const copy = useMemo(
    () =>
      isEnglish
        ? {
            seoTitle: 'Usage Guide',
            seoDescription: 'Learn how to sign in, purchase points, use the AI product image tool, and manage your storefront page.',
            heroTitle: 'Usage Guide',
            heroSubtitle: 'Sign in, purchase points, generate product images, and manage your storefront page.',
            loginTitle: 'Sign-in and usage guide',
            loginHeading: 'Registration and sign-in',
            loginItems: [
              'Register and sign in with your email address before purchasing points or using account-based AI features.',
              'After signing in, use the same account for checkout and for the product image tool.',
            ],
            hint: 'Tip: If you have just completed payment, wait a few seconds and refresh the page. Make sure you are signed in to the same account used at checkout.',
            creditsTitle: 'How points work',
            creditsHeading: 'Point usage rules',
            creditsItems: [
              'Points are prepaid, one-time purchases. There is no automatic renewal.',
              'Points do not expire and can be used until they are exhausted.',
              'Text tools may deduct points by input and output length. Image tools deduct fixed points by the selected generation style.',
            ],
            exampleHeading: 'Examples',
            examples: [
              'AI product image: point cost is shown before you generate.',
              'Different styles may use different point amounts.',
            ],
            warning: 'Once points are used to generate a service result, that use is treated as completed and cannot be refunded.',
            paymentTitle: 'Purchase and payment',
            flowHeading: 'Steps to start using the AI product image tool',
            flowItems: [
              'Sign in to your account.',
              'Open the point plans page and choose a package.',
              'Complete payment through the checkout page.',
              'Return to the product image tool, upload a product photo, choose a style, and generate.',
            ],
            storefrontHeading: 'Bonus storefront page',
            storefrontText: 'Selected NT$99 / NT$199 product image point packages include a storefront page with a public URL and QR Code. You can add product descriptions and contact links, then share it through business cards, menu cards, table signs, or social posts.',
            reminderTitle: 'Important reminders',
            reminderItems: [
              'Use clear original product photos whenever possible.',
              'Do not share your account password or payment information with others.',
            ],
            pricingCta: 'View point plans',
            productToolCta: 'Open product image tool',
          }
        : {
            seoTitle: '使用說明',
            seoDescription: '說明登入、購買點數、使用 AI 商品圖工具與設定店家商品展示頁的流程。',
            heroTitle: '使用說明',
            heroSubtitle: '登入、購買點數、生成商品圖與設定店家商品頁的完整流程。',
            loginTitle: '登入與使用說明',
            loginHeading: '註冊與登入',
            loginItems: [
              '購買點數或使用需要帳號的 AI 功能前，請先使用 Email 註冊並登入。',
              '付款與使用商品圖工具時，請使用同一個登入帳號。',
            ],
            hint: '提示：剛完成付款時，請等候幾秒後重新整理頁面；並確認已登入付款時使用的同一個帳號。',
            creditsTitle: '點數計算方式',
            creditsHeading: '點數使用原則',
            creditsItems: [
              '點數為一次購買，不會自動續費。',
              '點數沒有使用期限，用完為止。',
              '文字工具可能依輸入與輸出內容扣點；圖片工具則依所選生成風格固定扣點。',
            ],
            exampleHeading: '使用範例',
            examples: [
              'AI 商品圖工具會在生成前顯示所需點數。',
              '不同生成風格使用的點數可能不同。',
            ],
            warning: '點數一經用於生成服務結果，即視為該次服務完成，恕無法退款。',
            paymentTitle: '購買與付款流程',
            flowHeading: '使用 AI 商品圖工具的步驟',
            flowItems: [
              '先登入帳號。',
              '前往點數方案頁選擇適合的方案。',
              '完成付款。',
              '回到商品圖工具，上傳商品照、選擇風格後開始生成。',
            ],
            storefrontHeading: '指定點數包加贈店家商品展示頁',
            storefrontText: '購買指定 NT$99／NT$199 商品圖點數包，可建立店家商品展示頁，取得公開網址與 QR Code。可放商品介紹、LINE、電話、Email、Facebook 或下單連結，適合用在名片、小卡、菜單、桌牌與社群貼文。',
            reminderTitle: '重要提醒',
            reminderItems: [
              '建議上傳商品完整、清楚的原始照片。',
              '請勿將帳號密碼或付款資料提供給他人。',
            ],
            pricingCta: '查看點數方案',
            productToolCta: '前往商品圖工具',
          },
    [isEnglish]
  )

  const faqs: FaqItem[] = useMemo(
    () =>
      isEnglish
        ? [
            {
              question: 'Do you offer free points or a trial?',
              answer: 'No. Free points and trial credits are not currently offered. Purchase points before using the AI product image generation feature.',
            },
            {
              question: 'Do points expire?',
              answer: 'No. Points are one-time purchases with no expiration date and no automatic renewal.',
            },
            {
              question: 'When can I use points after payment?',
              answer: 'Usually after payment is confirmed. If the balance does not update immediately, wait a few seconds, refresh, and confirm you are signed in to the same account.',
            },
            {
              question: 'What is included with selected product image point packages?',
              answer: 'Selected packages include a storefront page with a public URL and QR Code for sharing your products and contact details.',
            },
          ]
        : [
            {
              question: '目前有免費點數或試用額度嗎？',
              answer: '目前沒有提供免費點數或試用額度。要使用 AI 商品圖生成，請先購買點數方案。',
            },
            {
              question: '點數有使用期限嗎？',
              answer: '沒有。點數為一次購買、不自動續費，會保留到使用完為止。',
            },
            {
              question: '付款後多久可以使用點數？',
              answer: '通常付款確認後即可使用。若點數沒有立即顯示，請等候幾秒、重新整理頁面，並確認已登入付款時使用的同一帳號。',
            },
            {
              question: '指定商品圖點數包加贈什麼？',
              answer: '可建立店家商品展示頁，取得公開網址與 QR Code，方便放商品介紹、聯絡方式並分享給客人。',
            },
          ],
    [isEnglish]
  )

  const seo = useMemo(
    () =>
      buildSEO({
        title: copy.seoTitle,
        description: copy.seoDescription,
        url: '/help',
        titleSuffix: isEnglish ? 'RxV AI Tools' : 'RxV AI 工具與生活服務中心',
      }),
    [copy, isEnglish]
  )

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }),
    [faqs]
  )

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={copy.seoDescription} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-black text-slate-950">{copy.heroTitle}</h1>
            <p className="mt-2 text-slate-600">{copy.heroSubtitle}</p>
          </header>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center text-2xl font-black text-slate-950">
              <span className="mr-2">🔐</span>
              {copy.loginTitle}
            </h2>

            <div className="mt-5 space-y-5 text-slate-700">
              <div>
                <h3 className="mb-2 font-black text-slate-950">{copy.loginHeading}</h3>
                <ul className="list-disc space-y-2 pl-5">
                  {copy.loginItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border-l-4 border-blue-400 bg-blue-50 p-4">
                <p className="text-sm font-semibold leading-relaxed text-blue-900">💡 {copy.hint}</p>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center text-2xl font-black text-slate-950">
              <span className="mr-2">📊</span>
              {copy.creditsTitle}
            </h2>

            <div className="mt-5 space-y-5 text-slate-700">
              <div>
                <h3 className="mb-2 font-black text-slate-950">{copy.creditsHeading}</h3>
                <ul className="list-disc space-y-2 pl-5">
                  {copy.creditsItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-black text-slate-950">{copy.exampleHeading}</h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                    {copy.examples.map((item) => (
                      <li key={item} className="flex items-start">
                        <span className="mr-2 text-blue-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4">
                <p className="text-sm font-semibold leading-relaxed text-amber-900">⚠️ {copy.warning}</p>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center text-2xl font-black text-slate-950">
              <span className="mr-2">💳</span>
              {copy.paymentTitle}
            </h2>

            <div className="mt-5 space-y-6 text-slate-700">
              <div>
                <h3 className="mb-2 font-black text-slate-950">{copy.flowHeading}</h3>
                <ol className="list-decimal space-y-2 pl-5">
                  {copy.flowItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-5">
                <h3 className="font-black text-emerald-800">🎁 {copy.storefrontHeading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{copy.storefrontText}</p>
                <Link
                  to="/shop/rxv"
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                >
                  {isEnglish ? 'View storefront example' : '查看商品頁示範'}
                </Link>
              </div>

              <div>
                <h3 className="mb-3 font-black text-slate-950">{isEnglish ? 'Frequently asked questions' : '常見問題'}</h3>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <article key={faq.question} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-black text-slate-950">{faq.question}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border-l-4 border-rose-400 bg-rose-50 p-4">
                <p className="text-sm font-black text-rose-900">📌 {copy.reminderTitle}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-rose-800">
                  {copy.reminderItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              {copy.pricingCta}
            </Link>
            <Link
              to="/tools/product-image-generator"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-md"
            >
              {copy.productToolCta}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
