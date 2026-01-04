import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { supabase } from '../lib/supabase'
import { deleteChantWish } from '../utils/deleteChantWish'
import { config } from '../config'

interface ChantWish {
  id: string
  wish_no: number
  title: string
  chant_text: string
  chant_target_count: number
  chant_unit: string
  for_person_name?: string
  start_date: string
  end_date: string
  description?: string
  created_by: string
  created_at: string
  user_id?: string
  image_url?: string | null
}

interface ChantWishCardProps {
  wish: ChantWish
}

interface Stats {
  participants: number
  totalChants: number
}

export default function ChantWishCard({ wish }: ChantWishCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ participants: 0, totalChants: 0 })
  const [loading, setLoading] = useState(true)
  const [supportCount, setSupportCount] = useState<number>(0)
  const [commentCount, setCommentCount] = useState<number>(0)
  const [lightCount, setLightCount] = useState<number>(0)
  const [user, setUser] = useState<any>(null)

  // ⚠️ 已移除 Supabase Auth 相關邏輯
  useEffect(() => {
    // 已停用
    setUser(null)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('chant_logs')
          .select('user_name, chanted_count')
          .eq('wish_id', wish.id) // 修正欄位名稱

        if (error) {
          console.error('讀取統計失敗:', error)
          return
        }

        if (data) {
          const participants = new Set(data.map(d => d.user_name)).size
          const totalChants = data.reduce((sum, d) => sum + (d.chanted_count || 0), 0)
          setStats({ participants, totalChants })
        }

        // supports 數量 - 加入容錯機制
        try {
          const { count: sCount, error: sError } = await supabase
            .from('chant_wish_supports')
            .select('*', { count: 'exact', head: true })
            .eq('chant_wish_id', wish.id)
          
          console.log('ChantWishCard 查詢支持數量:', { wishId: wish.id, count: sCount, error: sError })
          
          if (sError) {
            console.error('查詢支持數量失敗:', sError)
            // 如果 count 查詢失敗，嘗試直接查詢資料
            const { data: supportData, error: supportDataError } = await supabase
              .from('chant_wish_supports')
              .select('*')
              .eq('chant_wish_id', wish.id)
            
            const manualCount = supportData?.length || 0
            console.log('ChantWishCard 手動計算支持數量:', manualCount)
            setSupportCount(manualCount)
          } else {
            // 如果查詢成功但數量為 0，可能是 RLS 問題，檢查是否有本地支持記錄
            if (sCount === 0) {
              const hasSupported = localStorage.getItem(`supported-${wish.id}`) === '1'
              if (hasSupported) {
                console.log('ChantWishCard 檢測到本地支持記錄，設置數量為 1')
                setSupportCount(1)
              } else {
                setSupportCount(0)
              }
            } else {
              setSupportCount(sCount || 0)
            }
          }
        } catch (e) {
          console.error('ChantWishCard 查詢支持數量異常:', e)
          setSupportCount(0)
        }

        // comments 數量
        const { count: cCount } = await supabase
          .from('chant_comments') // 修正表名
          .select('*', { count: 'exact', head: true })
          .eq('wish_id', wish.id) // 確保使用正確的欄位
        setCommentCount(cCount || 0)

        // lights 數量
        try {
          const { count: lCount, error: lError } = await supabase
            .from('chant_wish_lights')
            .select('*', { count: 'exact', head: true })
            .eq('chant_wish_id', wish.id)
          
          if (lError) {
            console.error('查詢點燈數量失敗:', lError)
            setLightCount(0)
          } else {
            setLightCount(lCount || 0)
          }
        } catch (e) {
          console.error('查詢點燈數量異常:', e)
          setLightCount(0)
        }
      } catch (err) {
        console.error('讀取統計失敗:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [wish.id])

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const buildShareText = () => {
    // 使用配置中的基礎 URL
    const target = wish.for_person_name || t('all_beings')
    const path = `/chant-wish-detail/${wish.wish_no}`
    const fullUrl = `${config.baseUrl}${path}`
    return t('share_text_template', { 
      title: wish.title, 
      chant_text: wish.chant_text, 
      target: target, 
      url: fullUrl 
    })
  }

  const copyToClipboard = () => {
    const text = buildShareText()
    navigator.clipboard.writeText(text)
    alert(t('share_copied'))
  }

  const handleLineShare = () => {
    // 使用配置中的基礎 URL
    const path = `/chant-wish-detail/${wish.wish_no}`
    const fullUrl = `${config.baseUrl}${path}`
    const text = buildShareText()
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`
    window.open(lineUrl, '_blank')
  }

  const handleJoinChant = () => {
    navigate(`/chant-wish-detail/${wish.wish_no}`)
  }

  const goDetail = () => {
    navigate(`/chant-wish-detail/${wish.wish_no}`)
  }

  const handleDeleteWish = async (id: string, imageUrl?: string | null) => {
    const confirmed = window.confirm(t('confirm_delete_chant_wish'))
    if (!confirmed) return

    const success = await deleteChantWish({ id, imageUrl })
    if (success) {
      alert(t('chant_wish_deleted_success'))
      // 重新載入頁面或觸發父組件重新獲取資料
      window.location.reload()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-gray-100 max-w-md mx-auto w-full">
      {/* 願望編號 */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-pink-600">🪷 {t('wish_number')}: {wish.wish_no}</h1>
      </div>

      {/* 標題和日期 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{wish.title}</h2>
        <p className="text-sm text-gray-500">
          📅 {t('release_date')}: {formatDate(wish.created_at)}
        </p>
      </div>

      {/* 活動詳情 */}
      <div className="space-y-3 mb-4 text-sm sm:text-base">
        <div className="flex items-center text-gray-700">
          <span className="mr-2">📿</span>
          <span className="font-medium">{t('chant')}:</span>
          <span className="ml-1 text-pink-600 font-bold">
            {wish.chant_text} {wish.chant_target_count}{wish.chant_unit}
          </span>
        </div>

        {wish.for_person_name && (
          <div className="flex items-center text-gray-700">
            <span className="mr-2">🎯</span>
            <span className="font-medium">{t('dedication_recipient')}:</span>
            <span className="ml-1 text-blue-600 font-bold">{wish.for_person_name}</span>
          </div>
        )}

        <div className="flex items-center text-gray-700">
          <span className="mr-2">🔥</span>
          <span className="font-medium">{t('creator_name')}:</span>
          <span className="ml-1">{wish.created_by}</span>
        </div>

        {/* 查看詳情按鈕 - 單獨一行 */}
        <div className="pt-3 pb-2">
          <button
            onClick={goDetail}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 !text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-base"
            style={{ color: '#ffffff' }}
          >
            🔎 {t('view_details')}
          </button>
        </div>

        {/* 活動期間 - 單獨一行 */}
        <div className="py-2">
          <div className="flex items-center text-gray-700">
            <span className="mr-2">📅</span>
            <span className="font-medium">{t('activity_period')}:</span>
            <span className="ml-1">{formatDate(wish.start_date)} ~ {formatDate(wish.end_date)}</span>
          </div>
        </div>

        {/* 總唸誦次數 - 單獨一行 */}
        <div className="pt-2 pb-3">
          {loading ? (
            <div className="flex items-center justify-center text-sm text-gray-500 py-4">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('loading_stats')}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600 mb-2">
                  📿 {t('total_chant_count')}: {stats.totalChants} {t('chant_unit')}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-pink-600">👥 {stats.participants} {t('people')}</span>
                  <span className="mx-2">{t('participated')}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 描述 */}
      {wish.description && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">{wish.description}</p>
        </div>
      )}

      {/* 支持 / 留言 / 點燈計數 - 手機版優化 */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-sm text-gray-600 mt-2 px-2">
        <div className="text-center sm:text-left">❤️ {supportCount} {t('people_support')}</div>
        <div className="text-center sm:text-center">💬 {commentCount} {t('comments')}</div>
        <div className="text-center sm:text-right text-yellow-600">🪔 {lightCount} {t('lights')}</div>
      </div>

      {/* 操作按鈕 - 手機版優化 */}
      <div className="flex flex-col gap-3 w-full">
        
        {/* 參加集氣按鈕 - 手機版單獨一行 */}
        <button
          onClick={handleJoinChant}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 !text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-base"
          style={{ color: '#ffffff' }}
        >
          🙏 {t('join_chant')}
        </button>
        
        {/* 分享按鈕 - 手機版也單獨一行 */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleLineShare}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg text-base"
            style={{ background: '#22c55e', color: '#ffffff', border: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#16a34a' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#22c55e' }}
          >
            📱 {t('line_share')}
          </button>
          <button
            onClick={copyToClipboard}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg text-base"
            style={{ background: '#10b981', color: '#ffffff', border: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#059669' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#10b981' }}
          >
            📋 {t('copy_message')}
          </button>
        </div>
        
        {/* 刪除按鈕 - 僅限作者顯示 */}
        {user && wish.user_id === user.id && (
          <button
            onClick={() => handleDeleteWish(wish.id, wish.image_url)}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 !text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            style={{ color: '#ffffff' }}
          >
            🗑️ {t('delete_chant_wish')}
          </button>
        )}
      </div>
    </div>
  )
}
