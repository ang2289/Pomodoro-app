import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface WishInputProps {
  onSuccess?: () => void
}

export default function WishInput({ onSuccess }: WishInputProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (content.trim().length === 0) {
      alert('請輸入願望內容')
      return
    }

    if (content.length > 200) {
      alert('願望內容不能超過 200 字')
      return
    }

    setIsSubmitting(true)

    try {
      const { /* data, */ error } = await supabase
        .from('wishes')
        .insert({
          user_name: '我',
          content: content.trim(),
          is_public: true
        })

      if (error) {
        console.error('許願失敗:', error)
        alert('許願失敗：' + error.message)
        return
      }

      // 成功後清空輸入框
      setContent('')
      
      // 觸發成功回調
      if (onSuccess) {
        onSuccess()
      }

      alert('許願成功！✨')
    } catch (err) {
      console.error('許願失敗:', err)
      alert('許願失敗，請重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">💬 許下你的願望</h2>
      
      <div className="space-y-4">
        <div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={200}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在這裡寫下你的願望..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/200 字
            </span>
            {content.length > 180 && (
              <span className="text-sm text-orange-500">
                即將達到字數限制
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || content.trim().length === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              許願中...
            </span>
          ) : (
            '許願 ✨'
          )}
        </button>
      </div>
    </div>
  )
}


