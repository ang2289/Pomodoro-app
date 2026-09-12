import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type AuthMode = 'login' | 'register'

type AuthResponse = {
  success?: boolean
  ok?: boolean
  message?: string
  error?: string
  token?: string
  user?: any
  userId?: string
  id?: string
  email?: string
}

function persistLogin(data: AuthResponse, email: string) {
  const userId = String(data.userId || data.id || data.user?.id || email)
  const userEmail = String(data.email || data.user?.email || email)
  const token = String(data.token || '').trim()
  const user = data.user || { id: userId, email: userEmail }

  if (!token) {
    throw new Error('登入驗證失敗，請重新登入')
  }

  localStorage.setItem('token', token)
  localStorage.setItem('auth_token', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('user_id', userId)
  localStorage.setItem('userId', userId)
  localStorage.setItem('user_email', userEmail)
  localStorage.setItem('email', userEmail)
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('rxv_logged_in', '1')
}

function getSafeReturnTo() {
  const params = new URLSearchParams(window.location.search)
  const candidate = params.get('returnTo') || sessionStorage.getItem('rxv_auth_return_to') || '/'

  // 僅允許本站相對路徑，避免外部網址導向。
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return '/'
  return candidate
}

export default function LoginPage() {
  const navigate = useNavigate()
  const returnTo = getSafeReturnTo()
  const initialMode: AuthMode = window.location.pathname.includes('register') ? 'register' : 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isRegister = mode === 'register'

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
    setMessage('')
    setConfirmPassword('')
    const nextPath = nextMode === 'register' ? '/register' : '/login'
    const nextUrl = returnTo !== '/' ? `${nextPath}?returnTo=${encodeURIComponent(returnTo)}` : nextPath
    window.history.replaceState(null, '', nextUrl)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setError('請輸入 Email 與密碼')
      return
    }

    if (cleanPassword.length < 6) {
      setError('密碼至少 6 個字元')
      return
    }

    if (isRegister && cleanPassword !== confirmPassword.trim()) {
      setError('兩次輸入的密碼不一致')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/main?action=auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, email: cleanEmail, password: cleanPassword }),
      })

      const data = (await res.json().catch(() => ({}))) as AuthResponse
      if (!res.ok) {
        const fallback =
          res.status === 401
            ? '帳號或密碼錯誤'
            : res.status === 409
              ? '此 Email 已註冊，請直接登入'
              : isRegister
                ? '註冊失敗，請稍後再試'
                : '登入失敗，請稍後再試'
        throw new Error(data?.error || data?.message || fallback)
      }
      if (res.ok && (data.ok === true || data.success === true) && !data.token) {
        throw new Error('登入驗證失敗，請重新登入')
      }

      const isSuccess = res.ok && (data.ok === true || data.success === true) && Boolean(data.token)

      if (!isSuccess) {
        throw new Error(data?.error || data?.message || (isRegister ? '註冊失敗，請稍後再試' : '登入失敗，請確認帳密'))
      }

      persistLogin(data, cleanEmail)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('rxv_logged_in', '1')
      localStorage.setItem('user_email', cleanEmail)
      localStorage.setItem('email', cleanEmail)
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new Event('auth-changed'))
      window.dispatchEvent(new CustomEvent('rxv-auth-changed'))
      setMessage(isRegister ? '註冊成功，已自動登入' : '登入成功')

      try {
        sessionStorage.removeItem('rxv_auth_return_to')
      } catch {
        // 不影響登入流程。
      }
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRegister ? '註冊失敗，請稍後再試' : '登入失敗，請稍後再試'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{isRegister ? '註冊帳號' : '會員登入'}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister ? '建立帳號後即可使用點數、摘要與短影音等功能' : '登入後可使用點數、摘要與短影音等功能'}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${!isRegister ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${isRegister ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
          >
            註冊
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="請輸入 Email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="請輸入密碼"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {isRegister ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">確認密碼</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="請再次輸入密碼"
                autoComplete="new-password"
                required
              />
            </div>
          ) : null}

          {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
          {message ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (isRegister ? '註冊中…' : '登入中…') : (isRegister ? '註冊並登入' : '登入')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/reset-password" className="text-blue-600 hover:underline">
            忘記密碼
          </Link>
          <button
            type="button"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? '已有帳號，去登入' : '註冊帳號'}
          </button>
        </div>
      </div>
    </div>
  )
}
