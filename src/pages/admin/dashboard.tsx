// 管理員 Dashboard 頁面
// 僅管理員可訪問，提供管理功能的總覽入口

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { Helmet } from 'react-helmet-async'

interface DashboardStats {
  todayCount: number
  todayAmount: number
  pendingCount: number
  totalRevenue: number
}

interface PendingPayment {
  id: string
  email: string
  plan_id: '99' | '199'
  amount_ntd: number
  account_last_five: string
  created_at: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)

  // 頁面初始化：檢查管理員權限
  useEffect(() => {
    const initializePage = async () => {
      if (!user) {
        // 未登入，導向登入頁
        return
      }

      try {
        setLoading(true)

        // 呼叫 Supabase RPC is_admin()
        const { data, error: rpcError } = await supabase.rpc('is_admin')

        if (rpcError) {
          console.error('❌ 檢查管理者權限失敗：', rpcError)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const adminStatus = data === true
        setIsAdmin(adminStatus)

        // 如果是管理員，載入統計數據和待處理匯款
        if (adminStatus) {
          await Promise.all([
            loadDashboardStats(),
            loadPendingPayments()
          ])
        }
      } catch (err: any) {
        console.error('❌ 檢查管理者權限失敗：', err)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [user])

  // 載入 Dashboard 統計數據
  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true)

      // 取得今日的開始和結束時間（UTC）
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStart = today.toISOString()
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)
      const todayEndISO = todayEnd.toISOString()

      // 卡片 1：今日匯款筆數
      // SQL: select count(*) from payment_reports where created_at::date = current_date;
      const { count: todayCount } = await supabase
        .from('payment_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .lte('created_at', todayEndISO)

      // 卡片 2：今日匯款總金額
      // SQL: select coalesce(sum(amount_ntd),0) from payment_reports where created_at::date = current_date;
      const { data: todayData } = await supabase
        .from('payment_reports')
        .select('amount_ntd')
        .gte('created_at', todayStart)
        .lte('created_at', todayEndISO)
      
      const todayAmount = todayData?.reduce((sum, item) => sum + (item.amount_ntd || 0), 0) || 0

      // 卡片 3：待處理筆數
      // SQL: select count(*) from payment_reports where processed = false;
      const { count: pendingCount } = await supabase
        .from('payment_reports')
        .select('*', { count: 'exact', head: true })
        .eq('processed', false)

      // 卡片 4：總累積營收
      // SQL: select coalesce(sum(amount_ntd),0) from payment_reports where processed = true;
      const { data: processedData } = await supabase
        .from('payment_reports')
        .select('amount_ntd')
        .eq('processed', true)
      
      const totalRevenue = processedData?.reduce((sum, item) => sum + (item.amount_ntd || 0), 0) || 0

      setStats({
        todayCount: todayCount || 0,
        todayAmount,
        pendingCount: pendingCount || 0,
        totalRevenue,
      })
    } catch (err: any) {
      console.error('❌ 載入統計數據失敗：', err)
    } finally {
      setStatsLoading(false)
    }
  }

  // 載入待處理匯款列表
  const loadPendingPayments = async () => {
    try {
      setPaymentsLoading(true)

      // SQL: select id, email, plan_id, amount_ntd, account_last_five, created_at
      //      from payment_reports
      //      where processed = false
      //      order by created_at asc;
      const { data, error } = await supabase
        .from('payment_reports')
        .select('id, email, plan_id, amount_ntd, account_last_five, created_at')
        .eq('processed', false)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ 載入待處理匯款失敗：', error)
        return
      }

      setPendingPayments(data || [])
    } catch (err: any) {
      console.error('❌ 載入待處理匯款失敗：', err)
    } finally {
      setPaymentsLoading(false)
    }
  }

  // 格式化日期
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

  // 取得方案名稱
  const getPlanName = (planId: '99' | '199') => {
    return planId === '99' ? '標準方案' : '進階方案'
  }

  // 載入中
  if (loading) {
    return (
      <>
        <Helmet>
          <title>管理員 Dashboard - 載入中</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">載入中...</p>
          </div>
        </div>
      </>
    )
  }

  // 非管理員：顯示無權限訊息
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

  // 管理員：顯示 Dashboard
  return (
    <>
      <Helmet>
        <title>管理員 Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              管理員 Dashboard
            </h1>

            {/* 統計卡片區塊 */}
            {statsLoading ? (
              <div className="mb-8 text-center text-gray-500">
                載入統計數據中...
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* 卡片 1：今日匯款筆數 */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">
                    今日匯款
                  </h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.todayCount} 筆
                  </p>
                </div>

                {/* 卡片 2：今日匯款總金額 */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-green-700 mb-2">
                    今日金額
                  </h3>
                  <p className="text-2xl font-bold text-green-900">
                    NT${stats.todayAmount.toLocaleString()}
                  </p>
                </div>

                {/* 卡片 3：待處理筆數 */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-amber-700 mb-2">
                    待處理
                  </h3>
                  <p className="text-2xl font-bold text-amber-900">
                    {stats.pendingCount} 筆
                  </p>
                </div>

                {/* 卡片 4：總累積營收 */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-purple-700 mb-2">
                    總營收
                  </h3>
                  <p className="text-2xl font-bold text-purple-900">
                    NT${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : null}

            {/* 待處理匯款表格 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                待處理匯款（請今日完成）
              </h2>
              
              {paymentsLoading ? (
                <div className="text-center text-gray-500 py-8">
                  載入中...
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-green-700 font-medium">✅ 目前沒有待處理的匯款</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            方案
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
                        {pendingPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getPlanName(payment.plan_id)}
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
                              <Link to="/admin/payments">
                                <PrimaryButton size="sm" fullWidth={false}>
                                  前往處理
                                </PrimaryButton>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* 每日營運檢查清單 */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-yellow-900 mb-4">
                每日營運檢查清單（30 秒）
              </h2>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">☐</span>
                  <span>今天是否有新的匯款？</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">☐</span>
                  <span>是否所有 pending 都已補點？</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">☐</span>
                  <span>user_credits 是否正常增加？</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">☐</span>
                  <span>是否有使用者回報問題？</span>
                </li>
              </ul>
            </div>

            {/* 功能入口區塊 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 付款管理 */}
              <Link to="/admin/payments" className="block">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors">
                  <h2 className="text-xl font-bold text-blue-900 mb-2">
                    💳 付款管理
                  </h2>
                  <p className="text-gray-700 mb-4">
                    查看並處理匯款回報，為使用者補點
                  </p>
                  <PrimaryButton fullWidth>
                    前往付款管理
                  </PrimaryButton>
                </div>
              </Link>

              {/* 預留其他管理功能 */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  📊 其他功能
                </h2>
                <p className="text-gray-600 mb-4">
                  更多管理功能即將推出
                </p>
                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  即將推出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

