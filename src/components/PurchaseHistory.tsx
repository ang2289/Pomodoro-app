import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PurchaseLog {
  id: string
  user_id: string
  merchant_trade_no: string
  amount: number
  points: number
  status: string
  created_at: string
}

export default function PurchaseHistory() {
  const [logs, setLogs] = useState<PurchaseLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // 取得使用者 ID（使用 localStorage，與系統其他頁面保持一致）
        const userId = localStorage.getItem('userId')
        
        if (!userId) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('purchase_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[PurchaseHistory] Fetch logs error:', error)
          setLoading(false)
          return
        }

        setLogs(data || [])
      } catch (err) {
        console.error('[PurchaseHistory] Fetch logs error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg font-bold mb-4">📜 購點紀錄</h2>
        <p className="text-gray-600">載入中...</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg font-bold mb-4">📜 購點紀錄</h2>
        <p className="text-gray-600">尚無購點紀錄</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
      <h2 className="text-lg font-bold mb-4">📜 購點紀錄</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border-b border-gray-200">訂單編號</th>
              <th className="p-2 text-left border-b border-gray-200">金額</th>
              <th className="p-2 text-left border-b border-gray-200">點數</th>
              <th className="p-2 text-left border-b border-gray-200">狀態</th>
              <th className="p-2 text-left border-b border-gray-200">時間</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{log.merchant_trade_no}</td>
                <td className="p-2">NT${log.amount}</td>
                <td className="p-2">{log.points.toLocaleString()} 點</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.status === 'success' || log.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : log.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.status === 'success' || log.status === 'paid'
                      ? '已完成'
                      : log.status === 'pending'
                      ? '處理中'
                      : '失敗'}
                  </span>
                </td>
                <td className="p-2 text-gray-600">
                  {new Date(log.created_at).toLocaleString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
