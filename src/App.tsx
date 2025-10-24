import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { notificationService } from './services/notificationService'
import MainLayout from './layouts/MainLayout'
import ChantCounter from './pages/ChantCounter'
import TodoPage from './pages/TodoPage'
import PomodoroPage from './pages/PomodoroPage'
import WishWallPage from './pages/WishWallPage'
import SettingsPage from './pages/SettingsPage'
import GroupCreatePage from './pages/GroupCreatePage'
import GroupHomePage from './pages/GroupHomePage'
import CreatePurchasePage from './pages/CreatePurchasePage'
import PurchaseDetailPage from './pages/PurchaseDetailPage'
import PurchaseFillPage from './pages/PurchaseFillPage'
import PurchasePage from './pages/PurchasePage'
import EventPage from './pages/EventPage'
import JoinGroupPage from './pages/JoinGroupPage'
import CreateGroupTaskPage from './pages/CreateGroupTaskPage'
import GroupTaskDetailPage from './pages/GroupTaskDetailPage'
import TestDataPage from './pages/TestDataPage'
import FocusProjectsPage from './pages/FocusProjectsPage'
import CategoryManagerPage from './pages/CategoryManagerPage'
import BackupPage from './pages/BackupPage'
import TimeTestPage from './pages/TimeTestPage'
import TimeTestPage2 from './pages/TimeTestPage2'
import ShareWishPage from './pages/ShareWishPage'
import CreateChantWishPage from './pages/CreateChantWishPage'
import ChantWishWallPage from './pages/ChantWishWallPage'
import ChantWishDetailPage from './pages/ChantWishDetailPage'
import ChantStatsPage from './pages/ChantStatsPage'
import ChantRankingPage from './pages/ChantRankingPage'
import ChantSupportRankingPage from './pages/ChantSupportRankingPage'
import SupportRankingPage from './pages/SupportRankingPage'
import Footer from './components/Footer'
import AdBanner from './components/AdBanner'
// 已移除廣告
import { Toaster } from 'react-hot-toast'

function App() {
  const [showAd, setShowAd] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // 初始化主題設定
  useEffect(() => {
    // 從 localStorage 讀取並套用主題設定
    const savedTheme = localStorage.getItem('theme')
    const savedFontSize = localStorage.getItem('fontSize')
    
    if (savedTheme === 'dark') {
      document.body.classList.add('dark')
    }
    
    if (savedFontSize === 'large') {
      document.body.classList.add('text-xl')
    }

    // 廣告已停用
    setShowAd(false)

    // 初始化通知服務
    notificationService.initialize().then(hasPermission => {
      console.log('通知權限初始化完成:', hasPermission)
    }).catch(error => {
      console.error('通知權限初始化失敗:', error)
    })
  }, [])

  // AdMob 初始化
  useEffect(() => {
    import('@capacitor-community/admob').then(({ AdMob }) => {
      AdMob.initialize()
    })
  }, [])

  // 載入訂閱狀態
  useEffect(() => {
    const sub = localStorage.getItem('isSubscribed')
    setIsSubscribed(sub === 'true')
  }, [])

  return (
    <div className="w-full min-h-screen">
      <main>
        <Routes>
          {/* 主要巢狀路由 - 使用 MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<PomodoroPage />} />
            <Route path="chant" element={<ChantCounter />} />
            <Route path="todo" element={<TodoPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="wish" element={<WishWallPage />} />
          </Route>
          
          {/* 其他獨立頁面 */}
          <Route path="/projects" element={<FocusProjectsPage />} />
          <Route path="/category-manager" element={<CategoryManagerPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/group/create" element={<GroupCreatePage />} />
          <Route path="/group/:id" element={<GroupHomePage />} />
          <Route path="/group/:id/purchase/create" element={<CreatePurchasePage />} />
          <Route path="/group/:id/purchase/:purchaseId/fill" element={<PurchaseFillPage />} />
          <Route path="/group/:id/purchase/:purchaseId" element={<PurchaseDetailPage />} />
          <Route path="/group/:id/purchase" element={<PurchasePage />} />
          <Route path="/group/:id/event" element={<EventPage />} />
          <Route path="/group/join" element={<JoinGroupPage />} />
          <Route path="/group/task/create" element={<CreateGroupTaskPage />} />
          <Route path="/group/task/:taskId" element={<GroupTaskDetailPage />} />
          <Route path="/test-data" element={<TestDataPage />} />
          <Route path="/time-test" element={<TimeTestPage />} />
          <Route path="/time-test2" element={<TimeTestPage2 />} />
          <Route path="/share/:id" element={<ShareWishPage />} />
          <Route path="/chant-wish-create" element={<CreateChantWishPage />} />
          <Route path="/chant-wish-wall" element={<ChantWishWallPage />} />
          <Route path="/chant-wish-detail/:wishNo" element={<ChantWishDetailPage />} />
          <Route path="/chant-stats" element={<ChantStatsPage />} />
          <Route path="/chant-ranking" element={<ChantRankingPage />} />
          <Route path="/chant-support-ranking" element={<ChantSupportRankingPage />} />
          <Route path="/support-ranking" element={<SupportRankingPage />} />
          <Route path="/chant-support-leaderboard" element={<SupportRankingPage />} />
        </Routes>
      </main>
      
      {/* 底部導覽 - 已移除 */}
      {/* <Footer /> */}
      
      {/* AdBanner 廣告 */}
      <AdBanner />
      
      {/* Toast 通知 */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

export default App
