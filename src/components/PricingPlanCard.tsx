import { useTranslation } from "react-i18next";

export default function PricingPlanCard() {
  const { t } = useTranslation();

  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <h3 className="font-medium text-gray-800">{t('points_plan_title')}</h3>

      <ul className="space-y-3 text-sm text-gray-700">
        <li>
          🆓 <strong>{t('points_free_trial')}</strong><br />
          {t('points_free_trial_desc')}
        </li>

        <li>
          💳 <strong>{t('points_plan_99')}</strong><br />
          {t('points_plan_99_desc')}
        </li>

        <li>
          🚀 <strong>{t('points_plan_199')}</strong><br />
          {t('points_plan_199_desc')}
        </li>
      </ul>

      <p className="text-xs text-gray-400 mt-2">
        {t('points_deduction_note')}
      </p>
    </div>
  )
}
