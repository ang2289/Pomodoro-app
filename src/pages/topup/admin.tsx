/*
⚠️ DEPRECATED（已棄用）
此頁面已由新版流程取代，請勿再使用或修改。
正式流程請見：
- 方案頁：/pricing
- 匯款頁：/payment/bank-transfer
- 匯款回報：/payment/report
- 後台管理：/admin/payments
*/

// 管理者檢視頁
// 顯示所有待審核的匯款回報，並可核准加點

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import PrimaryButton from '@/components/ui/PrimaryButton'

interface TopupRecord {
  id: string
  user_id: string
  amount_chars: number
  amount_ntd: number
  account_last_five: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  note: string | null
  created_at: string
  user_email?: string
}

export default function TopupAdminPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topups, setTopups] = useState<TopupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [note, setNote] = useState<string>('')

  // 檢查是否為管理者（這裡使用環境變數或硬編碼的管理者 ID）
  // ⚠️ 實際部署時應該從環境變數或資料庫讀取
  // 注意：這裡需要與 Edge Function 中的 ADMIN_USER_IDS 保持一致
  const ADMIN_USER_IDS = (import.meta.env.VITE_ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(id => id.length > 0)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // 檢查是否為管理者
    if (!ADMIN_USER_IDS.includes(user.id)) {
      setError('您沒有權限存取此頁面')
      return
    }

    loadTopups()
  }, [user, navigate])

  const loadTopups = async () => {
    try {
      setLoading(true)
      setError('')

      if (!user) return

      // ✅ 使用 Supabase client 統一呼叫 Edge Function（最穩）
      const { data: result, error } = await supabase.functions.invoke('list-topups', {
        method: 'GET',
      })

      if (error || !result || !result.success) {
        throw new Error(result?.error || error?.message || '載入失敗')
      }

      setTopups(result.topups || [])
    } catch (err: any) {
      console.error('❌ 載入加點紀錄失敗：', err)
      setError(err.message || '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (topupId: string) => {
    if (!user) return

    setApprovingId(topupId)
    setError('')

    try {
      // ✅ 使用 Supabase client 統一呼叫 Edge Function（最穩）
      const { data: result, error } = await supabase.functions.invoke('approve-topup', {
        body: {
          topupId,
          note: note || null,
        },
      })

      if (error || !result || !result.success) {
        throw new Error(result?.error || error?.message || '核准失敗')
      }

      // 重新載入列表
      await loadTopups()
      setNote('')
      alert('核准成功！')
    } catch (err: any) {
      console.error('❌ 核准失敗：', err)
      setError(err.message || '核准失敗，請稍後再試')
    } finally {
      setApprovingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: '待審核',
      approved: '已核准',
      rejected: '已拒絕',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || ''}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (!user) {
    return null
  }

  if (!ADMIN_USER_IDS.includes(user.id)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-600 font-semibold">您沒有權限存取此頁面</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            返回首頁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              加點紀錄管理
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              返回首頁
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">載入中...</p>
            </div>
          ) : topups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">尚無加點紀錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topups.map((topup) => (
                <div
                  key={topup.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(topup.status)}
                        <span className="text-sm text-gray-600">
                          {topup.user_email}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">金額：</span>
                          <span className="font-semibold">NT${topup.amount_ntd}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">字數：</span>
                          <span className="font-semibold">{topup.amount_chars.toLocaleString()} 字</span>
                        </div>
                        <div>
                          <span className="text-gray-600">帳號後五碼：</span>
                          <span className="font-mono">{topup.account_last_five}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">提交時間：</span>
                          <span>{formatDate(topup.created_at)}</span>
                        </div>
                      </div>
                      {topup.approved_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          核准時間：{formatDate(topup.approved_at)}
                        </div>
                      )}
                      {topup.note && (
                        <div className="mt-2 text-xs text-gray-600">
                          備註：{topup.note}
                        </div>
                      )}
                    </div>
                    {topup.status === 'pending' && (
                      <div className="ml-4 flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="備註（選填）"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <PrimaryButton
                          onClick={() => handleApprove(topup.id)}
                          disabled={approvingId === topup.id}
                          fullWidth={false}
                          size="sm"
                        >
                          {approvingId === topup.id ? '處理中...' : '核准'}
                        </PrimaryButton>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

