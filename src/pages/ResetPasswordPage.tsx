// ✅ 新增 src/pages/ResetPasswordPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('兩次輸入的密碼不一致')
      return
    }

    if (newPassword.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    setLoading(true)
    try {
      const apiBase = import.meta.env.VITE_API_BASE || ''
      const apiUrl = apiBase ? `${apiBase}/api/auth` : '/api/auth'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', email, password: newPassword })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '變更失敗')

      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-xl font-bold mb-4 text-center">重設密碼</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            required
            disabled={loading}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="新密碼"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            required
            disabled={loading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次輸入新密碼"
            className="w-full px-3 py-2 border rounded-lg"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">密碼已更新，請重新登入</div>}
          <PrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? '變更中...' : '重設密碼'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  )
}
