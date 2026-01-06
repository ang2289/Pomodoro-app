import { useState } from 'react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    setMessage('')

    try {
      const apiBase = import.meta.env.VITE_API_BASE || ''
      const apiUrl = apiBase ? `${apiBase}/api/auth` : '/api/auth'

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '發送失敗')

      setMessage('請查看 Email 中的密碼重設連結')
    } catch (err: any) {
      setMessage(err.message || '處理時發生錯誤')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg px-8 py-10">
        <h1 className="text-2xl font-bold text-center mb-4">忘記密碼</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">請輸入 Email 以重設密碼</p>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? '發送中...' : '發送重設連結'}
        </button>

        {message && <p className="text-sm text-center text-gray-700 mt-4">{message}</p>}
      </div>
    </div>
  )
}
