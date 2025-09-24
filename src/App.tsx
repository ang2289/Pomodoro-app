import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import PomodoroPage from './pages/PomodoroPage'
import TodoPage from './pages/TodoPage'
import SettingsPage from './pages/SettingsPage'
import ChantCounter from './pages/ChantCounter'
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
import AdBanner from './components/AdBanner'

function App() {
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
  }, [])

  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/projects" element={<FocusProjectsPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/chant" element={<ChantCounter />} />
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
        </Routes>
      </main>
      
      <AdBanner />
    </div>
  )
}

export default App
