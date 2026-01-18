import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAdminGuard } from '@/hooks/useAdminGuard'

interface AdminGuardProps {
  children: ReactNode
}

/**
 * Admin Guard 元件
 * 保護需要管理員權限的頁面
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, loading, isAuthenticated } = useAdminGuard()

  // 載入中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">載入中…</p>
        </div>
      </div>
    )
  }

  // 未登入
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            請先登入
          </h2>
          <p className="text-gray-600 mb-6">
            此頁面需要登入才能存取
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往登入
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            或前往首頁，在右上角進行登入
          </p>
          <Link
            to="/"
            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            返回首頁 →
          </Link>
        </div>
      </div>
    )
  }

  // 已登入但非管理員
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            無權限存取此頁面
          </h2>
          <p className="text-gray-600 mb-6">
            此頁面僅限管理員使用
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  // 通過權限檢查，顯示內容
  return <>{children}</>
}
