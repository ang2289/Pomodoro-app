/*
⚠️ DEPRECATED（已棄用）
此頁面已由新版流程取代，請勿再使用或修改。
正式流程請見：
- 方案頁：/pricing
- 匯款頁：/payment/bank-transfer
- 匯款回報：/payment/report
- 後台管理：/admin/payments
*/

import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { buildSEO } from '../lib/seo'
import SectionHeader from '../components/SectionHeader'
import { PLANS } from '../config'
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function PricingPage() {
  const { t, i18n } = useTranslation()
  const [showNotAvailableModal, setShowNotAvailableModal] = useState(false)

  const seo = useMemo(
    () =>
      buildSEO({
        title: t('pricingLegacy.seo.title'),
        description: t('pricingLegacy.seo.description'),
        url: 'https://pomodoro-app-eight-rouge.vercel.app/pricing',
        image: '/seo/pricing.png',
        titleSuffix: t('seoTitleSuffix'),
      }),
    [t, i18n.language]
  )

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={t('pricingLegacy.seo.description')} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 bg-[#EFF5FF] min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('pricingLegacy.hero.title')}</h1>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 whitespace-pre-line">{t('pricingLegacy.trial.notice')}</p>
        </div>

        <div className="space-y-6">
          <div className="shadow-md border rounded-2xl p-6 bg-white">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🆓</span>
              <h2 className="text-xl font-bold text-gray-900">{t('pricingLegacy.plan.free_title')}</h2>
            </div>

            <div className="text-gray-700 space-y-3">
              <p className="text-2xl font-bold text-gray-900 mb-3">
                {t('pricingLegacy.plan.free_chars', { count: PLANS.free.monthlyQuota })}
              </p>
              <ul className="list-disc ml-5 space-y-2 text-sm">
                <li>{t('pricingLegacy.plan.free_li1')}</li>
                <li>{t('pricingLegacy.plan.free_li2')}</li>
                <li>{t('pricingLegacy.plan.free_li3')}</li>
              </ul>
            </div>
          </div>

          <div className="shadow-md border-2 border-blue-300 rounded-2xl p-6 bg-blue-50">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">💎</span>
              <h2 className="text-xl font-bold text-blue-900">
                {t('pricingLegacy.plan.plan99_title')} (NT${PLANS.plan99.price})
              </h2>
            </div>

            <div className="text-blue-800 space-y-3">
              <p className="text-2xl font-bold text-blue-900 mb-3">
                {t('pricingLegacy.plan.paid_chars', { count: PLANS.plan99.monthlyQuota })}
              </p>

              <ul className="list-disc ml-5 space-y-2 text-sm">
                <li>{t('pricingLegacy.plan.paid_li1')}</li>
                <li>
                  <Trans i18nKey="pricingLegacy.plan.paid_li2" components={{ strong: <strong /> }} />
                </li>
                <li>
                  <Trans i18nKey="pricingLegacy.plan.paid_li3" components={{ strong: <strong /> }} />
                </li>
              </ul>

              <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">{t('pricingLegacy.plan.license_note')}</p>

              <button
                type="button"
                onClick={() => setShowNotAvailableModal(true)}
                className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {t('pricingLegacy.plan.buy_btn')}
              </button>
            </div>
          </div>

          <div className="shadow-md border-2 border-purple-300 rounded-2xl p-6 bg-purple-50">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">💎</span>
              <h2 className="text-xl font-bold text-purple-900">
                {t('pricingLegacy.plan.plan199_title')} (NT${PLANS.plan199.price})
              </h2>
            </div>

            <div className="text-purple-800 space-y-3">
              <p className="text-2xl font-bold text-purple-900 mb-3">
                {t('pricingLegacy.plan.paid_chars', { count: PLANS.plan199.monthlyQuota })}
              </p>

              <ul className="list-disc ml-5 space-y-2 text-sm">
                <li>{t('pricingLegacy.plan.paid_li1')}</li>
                <li>
                  <Trans i18nKey="pricingLegacy.plan.paid_li2" components={{ strong: <strong /> }} />
                </li>
                <li>
                  <Trans i18nKey="pricingLegacy.plan.paid_li3" components={{ strong: <strong /> }} />
                </li>
              </ul>

              <p className="text-xs text-purple-600 mt-3 pt-3 border-t border-purple-200">{t('pricingLegacy.plan.license_note')}</p>

              <button
                type="button"
                onClick={() => setShowNotAvailableModal(true)}
                className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {t('pricingLegacy.plan.buy_btn')}
              </button>
            </div>
          </div>

          <div className="shadow-md border rounded-2xl p-6 bg-white">
            <SectionHeader title={t('pricingLegacy.usage.section_title')} />

            <div className="text-gray-700 space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-800 mb-2">{t('pricingLegacy.usage.new_user_title')}</p>
                <p className="text-gray-700 leading-relaxed">
                  {t('pricingLegacy.usage.new_user_body', { count: PLANS.free.monthlyQuota })}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-2">{t('pricingLegacy.usage.paid_title')}</p>
                <p
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: t('pricingLegacy.usage.paid_body', {
                      c99: PLANS.plan99.monthlyQuota.toLocaleString(),
                      c199: PLANS.plan199.monthlyQuota.toLocaleString(),
                    }),
                  }}
                />
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-2">{t('pricingLegacy.usage.calc_title')}</p>
                <p className="text-gray-700 leading-relaxed">{t('pricingLegacy.usage.calc_body')}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p
                  className="text-xs text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t('pricingLegacy.usage.important') }}
                />
              </div>
            </div>
          </div>

          <div className="shadow-md border rounded-2xl p-6 bg-white">
            <SectionHeader title={t('pricingLegacy.charCount.header')} />

            <div className="text-gray-700 space-y-2 text-sm">
              <ul className="list-disc ml-5 space-y-2">
                <li>{t('pricingLegacy.charCount.li1')}</li>
                <li>{t('pricingLegacy.charCount.li2')}</li>
                <li>{t('pricingLegacy.charCount.li3')}</li>
              </ul>
            </div>
          </div>

          <div className="shadow-md border rounded-2xl p-6 bg-blue-50">
            <SectionHeader title={t('pricingLegacy.charExplain.header')} />

            <div className="text-blue-800 space-y-3 text-sm">
              <p>{t('pricingLegacy.charExplain.p1')}</p>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="font-medium mb-2 text-blue-900">{t('pricingLegacy.charExplain.example_title')}</p>
                <ul className="list-disc ml-5 space-y-1 text-blue-700">
                  <li>{t('pricingLegacy.charExplain.ex1')}</li>
                  <li>{t('pricingLegacy.charExplain.ex2')}</li>
                </ul>
              </div>

              <p className="font-medium text-blue-900">{t('pricingLegacy.charExplain.p2')}</p>
            </div>
          </div>

          <div className="shadow-md border rounded-2xl p-6 bg-gray-50">
            <SectionHeader title={t('pricingLegacy.fairness.header')} />

            <div className="text-gray-700 space-y-2 text-sm">
              <ul className="list-disc ml-5 space-y-2">
                <li>{t('pricingLegacy.fairness.li1')}</li>
                <li>{t('pricingLegacy.fairness.li2')}</li>
                <li>{t('pricingLegacy.fairness.li3')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/summary" className="block">
            <PrimaryButton fullWidth={false}>{t('pricingLegacy.back_summary')}</PrimaryButton>
          </Link>
        </div>
      </div>

      {showNotAvailableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{t('pricingLegacy.modal.title')}</h3>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {t('pricingLegacy.modal.body', { count: PLANS.free.monthlyQuota })}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowNotAvailableModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {t('pricingLegacy.modal.ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
