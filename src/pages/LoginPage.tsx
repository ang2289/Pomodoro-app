// 登入/註冊頁面
// 使用傳統帳號密碼，不使用 Supabase Auth

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 登入處理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const apiBase = import.meta.env.VITE_API_BASE || ''
      const apiUrl = apiBase ? `${apiBase}/api/auth` : '/api/auth'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '登入失敗')
        setLoading(false)
        return
      }

      if (data.success && data.userId) {
        // 成功時：儲存 userId 到 localStorage
        localStorage.setItem('userId', data.userId)
        // 導向 /summary
        navigate('/summary')
      } else {
        setError('登入失敗：未收到使用者 ID')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[LoginPage] Login error:', err)
      setError(err.message || '登入時發生錯誤')
      setLoading(false)
    }
  }

  // 註冊處理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const apiBase = import.meta.env.VITE_API_BASE || ''
      const apiUrl = apiBase ? `${apiBase}/api/auth` : '/api/auth'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'register', email, password }),
      })

      if (!response.ok) {
        // 處理不同錯誤狀態
        let errorMsg = '註冊失敗'
        try {
          const errorData = await response.json()
          if (response.status === 409) {
            errorMsg = '此 Email 已註冊，請直接登入'
          } else {
            errorMsg = errorData.error || errorMsg
          }
        } catch {
          if (response.status === 409) {
            errorMsg = '此 Email 已註冊，請直接登入'
          } else {
            errorMsg = `註冊失敗 (${response.status})`
          }
        }
        setError(errorMsg)
        setLoading(false)
        return
      }

      const data = await response.json()

      // 規格：響應格式為 { "userId": "<users.id>" }
      if (data.userId) {
        // 成功時：儲存 userId 到 localStorage
        localStorage.setItem('userId', data.userId)
        // 導向 /summary
        navigate('/summary')
      } else {
        setError('註冊失敗：未收到使用者 ID')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[LoginPage] Register error:', err)
      setError(err.message || '註冊時發生錯誤')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg px-8 py-10 mx-auto mt-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">登入 RxV AI 工具中心</h1>

        {/* 副標 */}
        <p className="text-sm text-gray-500 mt-2 mb-6 text-center">使用 Email 和密碼登入或註冊</p>

        {/* Email / 密碼表單 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <Link
                to="/reset"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                忘記密碼？
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="至少 6 個字元"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : '登入'}
            </button>

            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              註冊
            </button>
          </div>

          {/* 忘記密碼連結 */}
          <div className="mt-4 text-center">
            <Link to="/reset-password" className="text-sm text-blue-600 hover:underline">
              忘記密碼？
            </Link>
          </div>
        </form>

        {/* 返回首頁連結 */}
        <Link to="/" className="block mt-4">
          <PrimaryButton
            fullWidth
            className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 active:bg-blue-100"
          >
            返回首頁
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}
