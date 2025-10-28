import { Outlet } from 'react-router-dom'
import WebAdBanner from '../components/WebAdBanner'
import SiteFooter from '../components/SiteFooter'

export default function MainLayout() {
  return (
    <>
      {/* 主要內容區域 */}
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="max-w-screen-md mx-auto px-4 py-4 min-h-screen">
          <Outlet />
        </div>
      </div>
      
      {/* 底部廣告 */}
      {false && <WebAdBanner />}
      
      {/* 網站頁腳 */}
      <SiteFooter />
    </>
  )
}
