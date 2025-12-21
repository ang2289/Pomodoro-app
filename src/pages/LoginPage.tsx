import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔍 DEBUG: 檢查頁面載入時的 session（用於 OAuth callback 後驗證）
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔍 [LoginPage] 頁面載入時檢查 session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError,
      })
    }
    checkSession()
  }, [])

  // Google 登入
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [LoginPage] 開始 Google OAuth 登入流程...')

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (signInError) {
        console.error('❌ [LoginPage] Google OAuth 登入錯誤:', signInError)
        setError('Google 登入失敗：' + signInError.message)
        setLoading(false)
      } else {
        console.log('✅ [LoginPage] Google OAuth 登入請求已送出，即將跳轉到 Google...')
        // 如果成功，會自動跳轉到 Google，不需要手動處理
      }
    } catch (err: any) {
      console.error('❌ [LoginPage] Google OAuth 登入例外:', err)
      setError('Google 登入失敗：' + (err.message || '未知錯誤'))
      setLoading(false)
    }
  }

  // Email 登入
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('請輸入 Email 和密碼')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('❌ [LoginPage] Email 登入錯誤:', signInError)
        setError('Email 或密碼錯誤')
        setLoading(false)
        return
      }

      // 🔍 DEBUG: 登入成功後檢查 session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔍 [LoginPage] Email 登入成功，檢查 session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError,
      })

      // 登入成功，導向首頁
      navigate('/')
    } catch (err: any) {
      setError('登入失敗：' + (err.message || '未知錯誤'))
      setLoading(false)
    }
  }

  // Email 註冊
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('請輸入 Email 和密碼')
      return
    }

    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('已存在')) {
          setError('此 Email 已存在，請直接登入')
        } else {
          setError('註冊失敗：' + signUpError.message)
        }
        setLoading(false)
        return
      }

      // 註冊成功，導向首頁
      navigate('/')
    } catch (err: any) {
      setError('註冊失敗：' + (err.message || '未知錯誤'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">登入</h1>

        {/* Google 登入按鈕 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          使用 Google 登入（推薦）
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或</span>
          </div>
        </div>

        {/* Email / 密碼表單 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="至少 6 個字元"
              required
            />
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 按鈕組 */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : 'Email 登入'}
            </button>

            <button
              type="button"
              onClick={handleEmailSignUp}
              disabled={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Email 註冊
            </button>
          </div>
        </form>

        {/* 返回首頁連結 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  )
}



