import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* 主要內容區域 */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
