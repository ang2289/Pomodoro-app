// React import not needed in modern TSX
import IconButton from './ui/IconButton'

interface TimeSettingCardProps {
  workMinutes: number
  breakMinutes: number
  onWorkMinutesChange: (value: number) => void
  onBreakMinutesChange: (value: number) => void
  onStart: () => void
  disabled?: boolean
}

export default function TimeSettingCard({
  workMinutes,
  breakMinutes,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onStart,
  disabled = false
}: TimeSettingCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-lg p-6 w-full max-w-xs text-center">
      <div className="text-xl font-bold mb-2">⏰ 時間設定</div>

      {/* 工作時間 */}
      <div className="mt-4">
        <div className="text-gray-700 font-medium mb-2">工作時間</div>
        <div className="flex items-center justify-center gap-2">
          <IconButton
            label="減"
            variant="primary"
            onClick={() => onWorkMinutesChange(Math.max(1, workMinutes - 1))}
            disabled={workMinutes <= 1}
            className="hover:scale-105"
          />
          <span className="text-2xl font-bold w-16">{workMinutes}</span>
          <IconButton
            label="加"
            variant="primary"
            onClick={() => onWorkMinutesChange(workMinutes + 1)}
            className="hover:scale-105"
          />
        </div>
      </div>

      {/* 分隔線 */}
      <div className="my-4 border-t border-gray-200" />

      {/* 休息時間 */}
      <div className="mt-4">
        <div className="text-gray-700 font-medium mb-2">休息時間</div>
        <div className="flex items-center justify-center gap-2">
          <IconButton
            label="減"
            variant="primary"
            onClick={() => onBreakMinutesChange(Math.max(1, breakMinutes - 1))}
            disabled={breakMinutes <= 1}
            className="hover:scale-105"
          />
          <span className="text-2xl font-bold w-16">{breakMinutes}</span>
          <IconButton
            label="加"
            variant="primary"
            onClick={() => onBreakMinutesChange(breakMinutes + 1)}
            className="hover:scale-105"
          />
        </div>
      </div>

      {/* 開始按鈕 */}
      <div className="mt-6">
        <IconButton
          label="開始"
          variant="primary"
          onClick={onStart}
          disabled={disabled}
          className="hover:scale-105 w-full"
        />
      </div>
    </div>
  )
}