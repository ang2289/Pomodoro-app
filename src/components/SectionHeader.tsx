import React from 'react'
import PrimaryButton from './ui/PrimaryButton'

interface SectionHeaderProps {
  title: string
  emoji?: string
  actionLabel?: string
  onAction?: () => void
}

export default function SectionHeader({
  title,
  emoji,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  // 自動提取 emoji（如果 title 開頭是 emoji）
  const extractEmoji = (text: string) => {
    const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)
    return emojiMatch ? emojiMatch[0] : null
  }

  const displayEmoji = emoji || extractEmoji(title) || ''
  const displayTitle = emoji ? title : title.replace(/^[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]\s*/u, '').trim()

  return (
    <div className="flex items-center justify-between gap-3 w-full mb-3">
      <h3 className="section-header whitespace-nowrap flex items-center gap-2 flex-1 min-w-0">
        {displayEmoji && <span className="emoji">{displayEmoji}</span>}
        <span className="truncate">{displayTitle}</span>
      </h3>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 transform flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
            actionLabel.includes('摘要') || actionLabel.includes('Summary')
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
          }`}
          style={{
            color: '#ffffff',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

