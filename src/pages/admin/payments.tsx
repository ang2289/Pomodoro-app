import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { Helmet } from 'react-helmet-async'

interface PaymentReport {
  id: string
  email: string
  amount_ntd: number
  account_last_five: string
  plan_id: string
  status: 'pending' | 'processed' | 'rejected'
  note: string | null
  created_at: string
}

interface DigitalProductOrder {
  id: string
  order_no: string
  product_code: string
  email: string
  amount_ntd: number
  account_last_five: string
  transfer_date: string
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  download_token: string | null
  download_expires_at: string | null
  download_count: number
  download_limit: number
  created_at: string
}

interface ApprovedOrderResult {
  order_no: string
  download_token: string
  download_expires_at: string
}

export default function AdminPaymentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentReport[]>([])
  const [digitalOrders, setDigitalOrders] = useState<DigitalProductOrder[]>([])
  const [error, setError] = useState('')
  const [digitalWarning, setDigitalWarning] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [downloadLinks, setDownloadLinks] = useState<Record<string, string>>({})

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const loadPaymentReports = async () => {
    const { data, error: fetchError } = await supabase
      .from('payment_reports')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('載入點數付款回報失敗：', fetchError)
      setError('點數付款回報載入失敗')
      return
    }

    setPayments((data || []) as PaymentReport[])
  }

  const loadDigitalOrders = async () => {
    const { data, error: fetchError } = await supabase
      .from('digital_product_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      console.error('載入數位商品訂單失敗：', fetchError)
      setDigitalWarning('數位商品訂單功能尚未完成資料庫 migration，或目前帳號無權限。')
      setDigitalOrders([])
      return
    }

    setDigitalWarning('')
    setDigitalOrders((data || []) as DigitalProductOrder[])
  }

  useEffect(() => {
    const initialize = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      setLoading(true)
      setError('')

      try {
        const { data, error: rpcError } = await supabase.rpc('is_admin')
        if (rpcError || data !== true) {
          if (rpcError) console.error('檢查管理者權限失敗：', rpcError)
          setIsAdmin(false)
          return
        }

        setIsAdmin(true)
        await Promise.all([loadPaymentReports(), loadDigitalOrders()])
      } catch (err: any) {
        console.error('付款後台初始化失敗：', err)
        setError(err?.message || '付款後台初始化失敗')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [user, navigate])

  const handleAddCredits = async (paymentId: string) => {
    setProcessingId(paymentId)
    setError('')
    setSuccessMessage('')

    try {
      const { data, error: rpcError } = await supabase.rpc('process_payment_and_add_credits', {
        p_payment_id: paymentId,
      })

      if (rpcError || data !== true) {
        console.error('補點失敗：', rpcError)
        setError(rpcError?.message || '補點失敗，請稍後再試')
        return
      }

      setPayments((prev) => prev.filter((item) => item.id !== paymentId))
      setSuccessMessage('補點完成')
    } catch (err: any) {
      setError(err?.message || '補點失敗')
    } finally {
      setProcessingId(null)
    }
  }

  const handleApproveDigitalOrder = async (order: DigitalProductOrder) => {
    setProcessingId(order.id)
    setError('')
    setSuccessMessage('')

    try {
      const { data, error: rpcError } = await supabase.rpc('approve_digital_product_order', {
        p_order_id: order.id,
      })

      if (rpcError) {
        console.error('數位商品核准失敗：', rpcError)
        setError(rpcError.message || '核准失敗')
        return
      }

      const result = Array.isArray(data) ? (data[0] as ApprovedOrderResult | undefined) : undefined
      if (!result?.download_token) {
        setError('沒有取得下載 Token；訂單可能已處理或資料庫函數尚未更新。')
        return
      }

      const link = `${window.location.origin}/api/digital-product-download?token=${encodeURIComponent(result.download_token)}`
      setDownloadLinks((prev) => ({ ...prev, [order.id]: link }))
      setSuccessMessage(`已核准 ${result.order_no}，可複製專屬下載連結給客戶。`)
      await loadDigitalOrders()
    } catch (err: any) {
      setError(err?.message || '核准失敗')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectDigitalOrder = async (order: DigitalProductOrder) => {
    if (!window.confirm(`確定拒絕訂單 ${order.order_no}？`)) return

    setProcessingId(order.id)
    setError('')

    try {
      const { data, error: rpcError } = await supabase.rpc('reject_digital_product_order', {
        p_order_id: order.id,
      })

      if (rpcError || data !== true) {
        setError(rpcError?.message || '拒絕訂單失敗')
        return
      }

      setSuccessMessage(`已拒絕 ${order.order_no}`)
      await loadDigitalOrders()
    } catch (err: any) {
      setError(err?.message || '拒絕訂單失敗')
    } finally {
      setProcessingId(null)
    }
  }

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link)
    setSuccessMessage('下載連結已複製')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">載入中...</div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-600 font-semibold mb-4">無權限存取</p>
          <PrimaryButton onClick={() => navigate('/')}>返回首頁</PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>付款回報管理</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">付款回報管理</h1>
              <p className="text-sm text-gray-500 mt-1">點數加值與圖片 ZIP 訂單共用人工核對後台</p>
            </div>
            <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-900">返回首頁</button>
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}
          {successMessage && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">{successMessage}</div>}
          {digitalWarning && <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">{digitalWarning}</div>}

          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">圖片 ZIP 數位商品訂單</h2>
                <p className="text-sm text-gray-500">先用網銀核對金額＋後五碼，再按「確認收款並開放下載」。</p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                待核對 {digitalOrders.filter((item) => item.status === 'pending').length} 筆
              </span>
            </div>

            {digitalOrders.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">目前沒有數位商品訂單</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">訂單／Email</th>
                      <th className="px-4 py-3 text-left">金額</th>
                      <th className="px-4 py-3 text-left">後五碼</th>
                      <th className="px-4 py-3 text-left">匯款日期</th>
                      <th className="px-4 py-3 text-left">狀態</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {digitalOrders.map((order) => {
                      const cachedLink = downloadLinks[order.id]
                      const existingLink = order.download_token
                        ? `${window.location.origin}/api/digital-product-download?token=${encodeURIComponent(order.download_token)}`
                        : ''
                      const link = cachedLink || existingLink

                      return (
                        <tr key={order.id} className="align-top">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{order.order_no}</div>
                            <div className="text-gray-600">{order.email}</div>
                            <div className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</div>
                          </td>
                          <td className="px-4 py-4 font-semibold">NT${order.amount_ntd}</td>
                          <td className="px-4 py-4 font-mono font-semibold">{order.account_last_five}</td>
                          <td className="px-4 py-4">{order.transfer_date}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {order.status === 'pending' ? '待核對' : order.status === 'approved' ? '已開放下載' : '已拒絕'}
                            </span>
                            {order.status === 'approved' && (
                              <div className="text-xs text-gray-500 mt-2">
                                已下載 {order.download_count}/{order.download_limit}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 min-w-[220px]">
                            {order.status === 'pending' && (
                              <div className="space-y-2">
                                <PrimaryButton
                                  size="sm"
                                  fullWidth={false}
                                  disabled={processingId !== null}
                                  onClick={() => handleApproveDigitalOrder(order)}
                                >
                                  {processingId === order.id ? '處理中...' : '確認收款並開放下載'}
                                </PrimaryButton>
                                <button
                                  type="button"
                                  disabled={processingId !== null}
                                  onClick={() => handleRejectDigitalOrder(order)}
                                  className="block text-xs text-red-600 hover:underline disabled:opacity-50"
                                >
                                  拒絕此筆回報
                                </button>
                              </div>
                            )}

                            {order.status === 'approved' && link && (
                              <button
                                type="button"
                                onClick={() => copyLink(link)}
                                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                              >
                                複製客戶下載連結
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">原有點數匯款回報</h2>
                <p className="text-sm text-gray-500">保留原本付款與補點流程，不與 ZIP 訂單混用。</p>
              </div>
              <span className="text-sm font-semibold text-blue-700">待處理 {payments.length} 筆</span>
            </div>

            {payments.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">尚無待處理的點數付款回報</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">方案</th>
                      <th className="px-4 py-3 text-left">金額</th>
                      <th className="px-4 py-3 text-left">後五碼</th>
                      <th className="px-4 py-3 text-left">提交時間</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-4">{payment.email}</td>
                        <td className="px-4 py-4">{payment.plan_id}</td>
                        <td className="px-4 py-4">NT${payment.amount_ntd}</td>
                        <td className="px-4 py-4 font-mono">{payment.account_last_five}</td>
                        <td className="px-4 py-4 text-gray-500">{formatDate(payment.created_at)}</td>
                        <td className="px-4 py-4">
                          <PrimaryButton
                            size="sm"
                            fullWidth={false}
                            disabled={processingId !== null}
                            onClick={() => handleAddCredits(payment.id)}
                          >
                            {processingId === payment.id ? '處理中...' : '確認補點'}
                          </PrimaryButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
