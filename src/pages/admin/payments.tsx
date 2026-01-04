// 管理者付款回報檢視頁
// 顯示所有未處理的 payment_reports 記錄

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { Helmet } from 'react-helmet-async'

interface PaymentReport {
  id: string
  email: string
  amount_ntd: number
  account_last_five: string
  plan_id: '99' | '199'
  status: 'pending' | 'processed' | 'rejected'
  processed_by: string | null
  processed_at: string | null
  note: string | null
  created_at: string
}

export default function AdminPaymentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentReport[]>([])
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // 頁面初始化流程：先呼叫 Supabase RPC is_admin()
  useEffect(() => {
    const initializePage = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        setError('')

        // 步驟 1：呼叫 Supabase RPC is_admin()
        const { data, error: rpcError } = await supabase.rpc('is_admin')

        if (rpcError) {
          console.error('❌ 檢查管理者權限失敗：', rpcError)
          setError('檢查權限失敗，請稍後再試')
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const adminStatus = data === true

        // 步驟 2：若回傳 false，顯示「無權限存取」，不載入任何資料
        if (!adminStatus) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // 步驟 3：若回傳 true，繼續載入匯款資料
        setIsAdmin(true)
        await loadPaymentReports()
      } catch (err: any) {
        console.error('❌ 檢查管理者權限失敗：', err)
        setError(err.message || '檢查權限失敗')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [user, navigate])

  const loadPaymentReports = async () => {
    try {
      // 使用 Supabase client 讀取 payment_reports 資料表
      // 條件：processed = false，依 created_at asc 排序
      const { data, error: fetchError } = await supabase
        .from('payment_reports')
        .select('*')
        .eq('processed', false) // 條件：processed = false
        .order('created_at', { ascending: true }) // 依 created_at asc 排序

      if (fetchError) {
        console.error('❌ 載入付款回報失敗：', fetchError)
        setError('載入失敗，請重新整理頁面')
        return
      }

      // 將結果存成 payments state
      setPayments(data || [])
    } catch (err: any) {
      console.error('❌ 載入付款回報失敗：', err)
      setError(err.message || '載入失敗')
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

  // 處理加點按鈕點擊事件
  const handleAddCredits = async (paymentId: string) => {
    try {
      setProcessingId(paymentId)
      setError('')
      setSuccessMessage('')

      // 呼叫 Supabase RPC process_payment_and_add_credits
      const { data, error: rpcError } = await supabase.rpc('process_payment_and_add_credits', {
        p_payment_id: paymentId,
      })

      if (rpcError) {
        console.error('❌ 補點失敗：', rpcError)
        setError(rpcError.message || '補點失敗，請稍後再試')
        return
      }

      // 檢查 RPC 回傳值
      if (data === true) {
        // 成功：顯示成功提示，從 payments state 中移除該筆資料
        setSuccessMessage('補點完成')
        
        // 從 payments state 中移除該筆資料
        setPayments(prev => prev.filter(p => p.id !== paymentId))
        
        // 3 秒後清除成功訊息
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      } else {
        // 回傳 false 或其他值，視為失敗
        setError('補點失敗，請稍後再試')
      }
    } catch (err: any) {
      console.error('❌ 補點時發生錯誤：', err)
      setError(err.message || '補點時發生錯誤，請稍後再試')
    } finally {
      setProcessingId(null)
    }
  }

  // 載入中
  if (loading) {
    return (
      <>
        <Helmet>
          <title>付款回報管理 - 載入中</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">載入中...</p>
          </div>
        </div>
      </>
    )
  }

  // 步驟 2：若回傳 false，顯示「無權限存取」，不載入任何資料
  if (isAdmin === false) {
    return (
      <>
        <Helmet>
          <title>無權限存取</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-red-600 font-semibold mb-4">無權限存取</p>
            <p className="text-gray-600 mb-6">你沒有權限存取此頁面</p>
            <Link to="/pricing">
              <PrimaryButton>前往方案頁</PrimaryButton>
            </Link>
          </div>
        </div>
      </>
    )
  }

  // 步驟 3：若回傳 true，顯示付款回報清單
  return (
    <>
      <Helmet>
        <title>付款回報管理</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  付款回報管理
                </h1>
                <p className="text-sm text-gray-600">
                  待處理匯款筆數：<span className="font-semibold text-blue-600">{payments.length}</span>
                </p>
              </div>
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

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">尚無待處理的付款回報</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      方案 ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      帳號後五碼
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      提交時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.plan_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        NT${payment.amount_ntd}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {payment.account_last_five}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <PrimaryButton
                          size="sm"
                          fullWidth={false}
                          disabled={processingId === payment.id || processingId !== null}
                          onClick={() => handleAddCredits(payment.id)}
                        >
                          {processingId === payment.id ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              處理中...
                            </span>
                          ) : (
                            '確認補點'
                          )}
                        </PrimaryButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}

