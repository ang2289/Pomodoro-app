import { Routes, Route, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import i18n from './i18n'
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
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import About from './pages/About'
import Contact from './pages/Contact'
import FeaturesPage from './pages/FeaturesPage'
import ArticleTemplate from './pages/blog/ArticleTemplate'
import ChantFocusArticle from './pages/blog/ChantFocusArticle'
import MorningMeditationArticle from './pages/blog/MorningMeditationArticle'
import EveningDetox from './pages/blog/EveningDetox'
import PerfectBreakfastTime from './pages/blog/PerfectBreakfastTime'
import EveningMeditation from './pages/blog/evening-meditation'
import AfternoonStretch from './pages/blog/AfternoonStretch'
import HealthyLunch from './pages/blog/HealthyLunch'
import HydrationMeditation from './pages/blog/HydrationMeditation'
import MorningRitual from './pages/blog/MorningRitual'
import NightReset from './pages/blog/NightReset'
import SelfDialogueMeditation from './pages/blog/SelfDialogueMeditation'
import EmotionalDetox from './pages/blog/EmotionalDetox'
import FocusReset from './pages/blog/FocusReset'
import FocusAndEmotion from './pages/blog/FocusAndEmotion'
import FocusMeditation from './pages/blog/FocusMeditation'
import MorningBreath from './pages/blog/MorningBreath'
import EveningBreath from './pages/blog/EveningBreath'
import WeeklyBreathChallenge from './pages/blog/WeeklyBreathChallenge'
import CalmBreath from './pages/blog/CalmBreath'
import FocusBreath from './pages/blog/FocusBreath'
import BreathPrayer from './pages/blog/BreathPrayer'
import GratitudeBreathJournal from './pages/blog/GratitudeBreathJournal'
import ChantEnergyBreath from './pages/blog/ChantEnergyBreath'
import MoonlightMeditationBreath from './pages/blog/MoonlightMeditationBreath'
import SleepSoundTherapy from './pages/blog/SleepSoundTherapy'
import EveningGratitudeJournal from './pages/blog/EveningGratitudeJournal'
import MorningAffirmations from './pages/blog/MorningAffirmations'
import PowerOfSilence from './pages/blog/PowerOfSilence'
import ThreeMinuteMeditation from './pages/blog/ThreeMinuteMeditation'
import AboutSpiritualGrowth from './pages/blog/AboutSpiritualGrowth'
import BlogHome from './pages/blog/BlogHome'
import BlogPage from './pages/blog/index'
import LanguageGuide from './pages/language-guide'
import LazyHome from './pages/blog/LazyHome'
import HomePage from './pages/index'
import AidsPage from './pages/blog/aids'
import FinancePage from './pages/finance/index'
import SummaryPage from './pages/summary/index'
import SummaryLanding from './pages/summary-landing'
import SearchPage from './pages/SearchPage'
import ShoppingSearchPage from './pages/shopping/search'
import ShoppingResultsPage from './pages/shopping/results'
import AirfryerPage from './pages/goods/airfryer-keshaui'
import AIHome from './pages/AIHome'
import AISummaryGuide from './pages/tools/ai-summary'
import ShopeeSingleVideoPage from './pages/tools/ShopeeSingleVideoPage'
import ShopeeVideoPage from './pages/tools/shopee-video/index.tsx'
import HomeworkHelper from './pages/tools/homework-helper'
import RxVAutoShortsPage from './pages/RxVAutoShortsPage'
import RedirectShorts from './pages/rxv-auto-shorts'
import RetirementPage from './pages/retirement/index'
import RentalSubsidy2025 from './pages/aids/rental-subsidy-2025'
import LTC2025Update from './pages/aids/ltc-2025-update'
import SeniorTransportAid2025 from './pages/aids/senior-transport-2025'
import HealthBalance2025 from './pages/finance/health-balance-2025'
import RetirePlan2025 from './pages/finance/retire-plan-2025'
import AntiFraud2025 from './pages/finance/anti-fraud-2025'
import HealthPage from './pages/health/index'
import SleepBalance2025 from './pages/health/sleep-balance-2025'
import DietMind2025 from './pages/health/diet-mind-2025'
import PensionPage from './pages/pension/index'
import InsuranceOldage2025 from './pages/pension/insurance-oldage-2025'
import SelfContribution2025 from './pages/pension/self-contribution-2025'
import Announcements from './pages/Announcements'
import Footer from './components/Footer'
import AdBanner from './components/AdBanner'
// 已移除廣告
import { Toaster } from 'react-hot-toast'
import { useGATracker } from './hooks/useGATracker'
import { KeepAlivePing } from './components/KeepAlivePing'

function App() {
  const { t } = useTranslation()
  useGATracker()
  const [showAd, setShowAd] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  // 自動偵測目前執行模式（App/PWA 或 Web）
  const isApp =
    (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    /Capacitor|Android|iPhone|iPad/i.test(navigator.userAgent)

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

  // 更新頁面標題
  useEffect(() => {
    const updateTitle = () => {
      const appName = t('app_name')
      document.title = appName
    }
    
    // 初始設置
    updateTitle()
    
    // 監聽語言變更
    i18n.on('languageChanged', updateTitle)
    
    return () => {
      i18n.off('languageChanged', updateTitle)
    }
  }, [t])

  return (
    <div className="w-full min-h-screen max-w-screen-md mx-auto">
      <Routes>
          {/* 主要巢狀路由 - 使用 MainLayout */}
          <Route path="/" element={<MainLayout />}>
            {/* 首頁根據執行模式顯示不同頁面：App → 番茄鐘；Web → 功能入口首頁 */}
            <Route index element={isApp ? <PomodoroPage /> : <HomePage />} />
            <Route path="chant" element={<ChantCounter />} />
            <Route path="todo" element={<TodoPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="wish" element={<WishWallPage />} />
            <Route path="summary" element={<SummaryPage />} />
            <Route path="summary-landing" element={<SummaryLanding />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="shopping/search" element={<ShoppingSearchPage />} />
            <Route path="shopping/results" element={<ShoppingResultsPage />} />
            
            {/* 商品頁面 */}
            <Route path="goods/airfryer-keshaui" element={<AirfryerPage />} />
            
            {/* 退休理財懶人包頁面 */}
            <Route path="aids" element={<AidsPage />} />
            <Route path="aids/rental-subsidy-2025" element={<RentalSubsidy2025 />} />
            <Route path="aids/ltc-2025-update" element={<LTC2025Update />} />
            <Route path="aids/senior-transport-2025" element={<SeniorTransportAid2025 />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="finance/health-balance-2025" element={<HealthBalance2025 />} />
            <Route path="finance/retire-plan-2025" element={<RetirePlan2025 />} />
            <Route path="finance/anti-fraud-2025" element={<AntiFraud2025 />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="health/sleep-balance-2025" element={<SleepBalance2025 />} />
            <Route path="health/diet-mind-2025" element={<DietMind2025 />} />
            <Route path="pension" element={<PensionPage />} />
            <Route path="pension/insurance-oldage-2025" element={<InsuranceOldage2025 />} />
            <Route path="pension/self-contribution-2025" element={<SelfContribution2025 />} />
            <Route path="retirement" element={<RetirementPage />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="ai-home" element={<AIHome />} />
            {/* 預留功能路由 */}
            <Route path="tools" element={<AIHome />} />
            <Route path="tools/ai-summary" element={<AISummaryGuide />} />
            <Route path="tools/shopee-single-video" element={<ShopeeSingleVideoPage />} />
            <Route path="tools/shopee-video" element={<ShopeeVideoPage />} />
            <Route path="tools/homework-helper" element={<HomeworkHelper />} />
            <Route path="automation" element={<AIHome />} />
            <Route path="rxv-auto-shorts" element={<RedirectShorts />} />
            <Route path="language-guide" element={<LanguageGuide />} />
            <Route path="blog" element={<BlogPage />} />
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
          {/* 添加對 /chant-wish/:id 格式的支持，以兼容現有連結 */}
          <Route path="/chant-wish/:id" element={<ChantWishDetailPage />} />
          <Route path="/chant-stats" element={<ChantStatsPage />} />
          <Route path="/chant-ranking" element={<ChantRankingPage />} />
          <Route path="/chant-support-ranking" element={<ChantSupportRankingPage />} />
          <Route path="/support-ranking" element={<SupportRankingPage />} />
          <Route path="/chant-support-leaderboard" element={<SupportRankingPage />} />
          
          {/* 網站基本頁面 */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<FeaturesPage />} />
          
          {/* Blog 教學文章 */}
          <Route path="/blog" element={<BlogHome />} />
          <Route path="/blog/pomodoro-focus" element={<ArticleTemplate />} />
          <Route path="/blog/chant-focus" element={<ChantFocusArticle />} />
          <Route path="/blog/morning-meditation" element={<MorningMeditationArticle />} />
          <Route path="/blog/evening-detox" element={<EveningDetox />} />
          <Route path="/blog/perfect-breakfast-time" element={<PerfectBreakfastTime />} />
          <Route path="/blog/evening-meditation" element={<EveningMeditation />} />
          <Route path="/blog/afternoon-stretch" element={<AfternoonStretch />} />
          <Route path="/blog/healthy-lunch" element={<HealthyLunch />} />
          <Route path="/blog/hydration-meditation" element={<HydrationMeditation />} />
          <Route path="/blog/morning-ritual" element={<MorningRitual />} />
          <Route path="/blog/night-reset" element={<NightReset />} />
          <Route path="/blog/self-dialogue-meditation" element={<SelfDialogueMeditation />} />
          <Route path="/blog/emotional-detox" element={<EmotionalDetox />} />
          <Route path="/blog/focus-reset" element={<FocusReset />} />
          <Route path="/blog/focus-and-emotion" element={<FocusAndEmotion />} />
          <Route path="/blog/focus-meditation" element={<FocusMeditation />} />
          <Route path="/blog/morning-breath" element={<MorningBreath />} />
          <Route path="/blog/evening-breath" element={<EveningBreath />} />
          <Route path="/blog/weekly-breath-challenge" element={<WeeklyBreathChallenge />} />
          <Route path="/blog/calm-breath" element={<CalmBreath />} />
          <Route path="/blog/focus-breath" element={<FocusBreath />} />
          <Route path="/blog/breath-prayer" element={<BreathPrayer />} />
          <Route path="/blog/gratitude-breath-journal" element={<GratitudeBreathJournal />} />
          <Route path="/blog/chant-energy-breath" element={<ChantEnergyBreath />} />
          <Route path="/blog/moonlight-meditation-breath" element={<MoonlightMeditationBreath />} />
          <Route path="/blog/sleep-sound-therapy" element={<SleepSoundTherapy />} />
          <Route path="/blog/evening-gratitude-journal" element={<EveningGratitudeJournal />} />
          <Route path="/blog/morning-affirmations" element={<MorningAffirmations />} />
          <Route path="/blog/power-of-silence" element={<PowerOfSilence />} />
          <Route path="/blog/three-minute-meditation" element={<ThreeMinuteMeditation />} />
          <Route path="/blog/about-spiritual-growth" element={<AboutSpiritualGrowth />} />
        </Routes>
      
      {/* Keep-Alive Ping */}
      <KeepAlivePing />
      
      {/* AdBanner 廣告 */}
      {false && <AdBanner />}
      
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
