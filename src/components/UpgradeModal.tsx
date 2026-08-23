import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  requiredChars: number
  remainingChars: number
  lang?: 'zh-tw' | 'en'
}

export default function UpgradeModal({
  isOpen,
  onClose,
  requiredChars,
  remainingChars,
  lang = 'zh-tw',
}: UpgradeModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!isOpen) return null

  const isQuotaExhausted = remainingChars === 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t('upgrade_trial_exhausted')}
        </h3>
        <p className="text-gray-700 mb-4 whitespace-pre-line">
          {t('upgrade_quota_low')}
        </p>
        {isQuotaExhausted && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            ⚠️ {t('upgrade_quota_low')}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition"
          >
            {t('upgrade_close')}
          </button>
          {!isQuotaExhausted && (
            <button
              onClick={() => {
                onClose()
                navigate('/points')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              {t('upgrade_learn_plan')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

