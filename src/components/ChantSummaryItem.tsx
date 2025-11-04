import { format } from 'date-fns'
import { zhTW, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

interface ChantLog {
  id: string
  chanted_count: number
  created_at: string
  user_name: string
}

interface ChantSummaryItemProps {
  log: ChantLog
  wishTitle?: string
}

export default function ChantSummaryItem({ log, wishTitle }: ChantSummaryItemProps) {
  const { t } = useTranslation()
  const locale = i18n.language === 'zh_TW' ? zhTW : enUS
  const formattedDate = format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale })

  return (
    <div className="bg-gray-50 border border-pink-100 rounded-lg p-3 sm:p-4 shadow-sm">
      <div>
        {wishTitle && (
          <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('activity')}: {wishTitle}</p>
        )}
        <p className="text-xs sm:text-sm text-gray-400 mb-2">{formattedDate}</p>
        <p className="text-pink-600 font-semibold text-base sm:text-lg">
          🙋 {t('i_chanted_template', { count: log.chanted_count, name: log.user_name })}
        </p>
      </div>
    </div>
  )
}
