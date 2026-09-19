import { Link } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold mb-4 text-gray-900">密碼重設功能維護中</h1>
        <p className="text-sm leading-6 text-gray-600">
          此功能目前暫停使用。若需要協助重設密碼，請先聯絡客服處理。
        </p>
        <Link to="/login" className="mt-6 block">
          <PrimaryButton type="button" fullWidth>
            返回登入
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}
