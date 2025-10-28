import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="w-full bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
      <div className="max-w-screen-md mx-auto px-4">
        <div className="flex flex-col items-center space-y-3 text-sm text-gray-500 dark:text-gray-400">
          {/* 連結區域 */}
          <div className="flex flex-wrap justify-center gap-4 text-blue-600 dark:text-blue-400">
            <Link to="/privacy-policy" className="hover:underline">
              隱私權政策
            </Link>
            <Link to="/terms" className="hover:underline">
              使用條款
            </Link>
            <Link to="/about" className="hover:underline">
              關於我們
            </Link>
          </div>
          
          {/* 聯絡信箱 */}
          <div className="text-center">
            📮 聯絡信箱：
            <a href="mailto:rxv0227@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
              rxv0227@gmail.com
            </a>
          </div>
          
          {/* 版權資訊 */}
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
            © 2025 RxV 夢想創作工作室 — 保留所有權利
          </div>
        </div>
      </div>
    </footer>
  )
}

