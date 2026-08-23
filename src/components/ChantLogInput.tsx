import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ChantLogInputProps {
  wishId: string
  onLogSuccess?: () => void
}

export default function ChantLogInput({ wishId, onLogSuccess }: ChantLogInputProps) {
  const [userName, setUserName] = useState('我')
  const [count, setCount] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLog = async () => {
    if (!count || count <= 0) {
      alert('請輸入有效的念誦次數')
      return
    }

    if (!userName.trim()) {
      alert('請輸入你的名字')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('chant_logs').insert({
        wish_id: wishId,
        user_name: userName.trim(),
        chanted_count: count
      })

      if (error) {
        console.error('記錄失敗:', error)
        alert('記錄失敗：' + error.message)
        return
      }

      alert('✅ 念誦次數已成功記錄！')
      setCount(1)
      
      // 觸發成功回調，讓父組件可以刷新統計
      if (onLogSuccess) {
        onLogSuccess()
      }
    } catch (err) {
      console.error('記錄失敗:', err)
      alert('記錄失敗，請重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🧘</span>
        回報你今天念了幾遍
      </h3>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">你的名字</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="輸入你的名字"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">念誦次數</label>
            <input
              type="number"
              min="1"
              max="1000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <button
          onClick={handleLog}
          disabled={isSubmitting || !userName.trim() || count <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300 !text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          style={{ color: '#ffffff' }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              記錄中...
            </span>
          ) : (
            '📝 記錄念誦次數'
          )}
        </button>
        
        <div className="text-sm text-gray-600 text-center">
          💡 每次念誦完成後都可以來記錄，累積大家的集氣能量
        </div>
      </div>
    </div>
  )
}





