import { Link } from 'react-router-dom'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg px-8 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">密碼重設功能維護中</h1>
        <p className="text-sm leading-6 text-gray-600">
          此功能目前暫停使用。若需要協助重設密碼，請先聯絡客服處理。
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          返回登入
        </Link>
      </div>
    </div>
  )
}
