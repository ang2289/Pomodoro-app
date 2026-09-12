import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface LightRecord {
  id: string
  user_name?: string
  created_at: string
  message?: string
}

interface LightRecordsModuleProps {
  chantWishId: string
}

export default function LightRecordsModule({ chantWishId }: LightRecordsModuleProps) {
  const [records, setRecords] = useState<LightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLightRecords = async () => {
      if (!chantWishId) {
        console.error('chantWishId 未提供')
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('chant_wish_lights')
          .select('id, user_name, created_at, message')
          .eq('chant_wish_id', chantWishId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('讀取點燈紀錄失敗:', error)
          setError('讀取點燈紀錄失敗')
          return
        }
        
        console.log('點燈紀錄查詢結果:', data)
        setRecords(data || [])
      } catch (err) {
        console.error('讀取點燈紀錄異常:', err)
        setError('讀取點燈紀錄發生錯誤')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLightRecords()
  }, [chantWishId])
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear() - 1911 // Convert to ROC year
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `民國${year}年${month}月${day}日 ${hours}:${minutes}`
  }

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>載入中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>目前尚無點燈紀錄</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow">
      <h3 className="text-lg font-bold text-gray-800 mb-4">點燈紀錄</h3>
      <ul className="space-y-4">
        {records.map((record) => (
          <li key={record.id} className="border-b border-gray-100 pb-4">
            <p className="text-gray-800 font-semibold">
              {record.user_name?.trim() || '匿名善信'}
            </p>
            {record.message && (
              <p className="text-gray-600 mt-1">{record.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(record.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
