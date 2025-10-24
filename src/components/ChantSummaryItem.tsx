import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

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
  const formattedDate = format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })

  return (
    <div className="bg-gray-50 border border-pink-100 rounded-lg p-3 sm:p-4 shadow-sm">
      <div>
        {wishTitle && (
          <p className="text-xs sm:text-sm text-gray-500 mb-1">活動：{wishTitle}</p>
        )}
        <p className="text-xs sm:text-sm text-gray-400 mb-2">{formattedDate}</p>
        <p className="text-pink-600 font-semibold text-base sm:text-lg">
          🙋 我 念了 <span className="font-bold">{log.chanted_count}</span> 遍
        </p>
      </div>
    </div>
  )
}
