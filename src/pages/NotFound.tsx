import { Link } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">頁面不存在</p>
        <Link to="/" className="block">
          <PrimaryButton fullWidth={false}>
            返回首頁
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}























