import SupportButton from './SupportButton'

interface Props {
  supportCount: number
  supported: boolean
  onSupport: () => Promise<void>
  commentCount: number
}

export default function SupportSection({ supportCount, supported, onSupport, commentCount }: Props) {
  console.log('SupportSection rendered with count:', supportCount, 'comments:', commentCount)
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-pink-500 text-lg">💖</span>
          <span>已支持（{supportCount}）</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-purple-500 text-lg">💬</span>
          <span>留言 {commentCount} 則</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">每人對每個活動僅能按一次支持</p>
    </div>
  )
}


