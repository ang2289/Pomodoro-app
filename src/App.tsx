import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { generateUUID } from './services/taskRegistrationService'
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
import ServiceDescription from './pages/ServiceDescription'
import PointsPage from './pages/points'
import PaymentInfo from './pages/PaymentInfo'
import SystemStatus from './pages/SystemStatus'
import FeaturesPage from './pages/FeaturesPage'
// ⚠️ DEPRECATED: 以下 import 已棄用，保留僅供參考
// import TopupReportPage from './pages/topup/report'
// import TopupAdminPage from './pages/topup/admin'
import BankTransferPage from './pages/payment/bank-transfer'
import PaymentReportPage from './pages/payment/report'
import PaymentSuccessRedirectPage from './pages/payment/success'
import DeprecatedPage from './pages/DeprecatedPage'
import AdminPaymentsPage from './pages/admin/payments'
import HelpPage from './pages/help/index'
import AdminDashboardPage from './pages/admin/dashboard'
import AdminImagesPage from './pages/admin/images'
import AdminImagesListPage from './pages/admin/images-list'
// ⚠️ 已移除 UpgradeSuccessToast 和 useAuthCredits
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
import CarImportTariffExplainedPage from './pages/blog/car-import-tariff-explained'
import PolicyExplainedPage from './pages/blog/policy-explained'
import HouseTaxExplainedPage from './pages/blog/house-tax-explained'
import SubsidyEligibilityExplainedPage from './pages/blog/subsidy-eligibility-explained'
import Clause232ExplainedPage from './pages/blog/232-clause-explained'
import TariffAdjustmentImpactPage from './pages/blog/tariff-adjustment-impact'
import TaiwanUSTariffExplainedPage from './pages/blog/taiwan-us-tariff-explained'
import ChengLiChunPolicyRoleExplainedPage from './pages/blog/cheng-li-chun-policy-role-explained'
import IncomeTaxBracketsExplainedPage from './pages/blog/income-tax-brackets-explained'
import MinimumWageExplainedPage from './pages/blog/minimum-wage-explained'
import LaborInsuranceExplainedPage from './pages/blog/labor-insurance-explained'
import LaborInsurancePensionExplainedPage from './pages/blog/labor-insurance-pension-explained'
import LongTermCareSubsidyExplainedPage from './pages/blog/long-term-care-subsidy-explained'
import CollegeEntranceExamExplainedPage from './pages/blog/college-entrance-exam-explained'
import HSRBookingSystemExplainedPage from './pages/blog/hsr-booking-system-explained'
import MinimumWageImpactExplainedPage from './pages/blog/minimum-wage-impact-explained'
import NHIPremiumExplainedPage from './pages/blog/nhi-premium-explained'
import UnemploymentBenefitExplainedPage from './pages/blog/unemployment-benefit-explained'
import LaborPensionNewSystemExplainedPage from './pages/blog/labor-pension-new-system-explained'
import HouseholdRegistrationExplainedPage from './pages/blog/household-registration-explained'
import GovernmentAnnouncementImpactExplainedPage from './pages/blog/government-announcement-impact-explained'
import IncomeTaxExemptionExplainedPage from './pages/blog/income-tax-exemption-explained'
import SubsidyVisibilityExplainedPage from './pages/blog/subsidy-visibility-explained'
import OvertimePayExplainedPage from './pages/blog/overtime-pay-explained'
import DependentDeductionExplainedPage from './pages/blog/dependent-deduction-explained'
import PolicyDesignRealityExplainedPage from './pages/blog/policy-design-reality-explained'
import LanguageGuide from './pages/language-guide'
import LazyHome from './pages/blog/LazyHome'
import HomePage from './pages/index'
import AidsPage from './pages/blog/aids'
import FinancePage from './pages/finance/index'
import SummaryPage from './pages/summary/index'
import SummaryLanding from './pages/summary-landing'
// ⚠️ DEPRECATED: 以下 import 已棄用，保留僅供參考
// import PricingPage from './pages/PricingPage'
import PricingPageNew from './pages/pricing/index'
import PaymentSuccessPage from './pages/pricing/success'
import PaymentCancelPage from './pages/pricing/cancel'
import PurchaseFailPage from './pages/pricing/fail'
import SearchPage from './pages/SearchPage'
import ShoppingSearchPage from './pages/shopping/search'
import ShoppingResultsPage from './pages/shopping/results'
import AirfryerPage from './pages/goods/airfryer-keshaui'
import AIHome from './pages/AIHome'
import AISummaryGuide from './pages/tools/ai-summary'
import ShopeeSingleVideoPage from './pages/tools/ShopeeSingleVideoPage'
import ShopeeVideoPage from './pages/tools/shopee-video/index.tsx'
import HomeworkHelper from './pages/tools/homework-helper'
import ImagesPage from './pages/images'
import RxVAutoShortsPage from './pages/RxVAutoShortsPage'
import RedirectShorts from './pages/rxv-auto-shorts'
import NotFoundPage from './pages/NotFound'
import VideoPreviewPage from './pages/VideoPreviewPage'
import RetirementPage from './pages/retirement/index'
import RentalSubsidy2025 from './pages/aids/rental-subsidy-2025'
import LTC2025Update from './pages/aids/ltc-2025-update'
import YouthEmployment2026 from './pages/aids/youth-employment-2026'
import ChildcareSubsidy2026 from './pages/aids/childcare-subsidy-2026'
import LowIncomeSubsidy2026 from './pages/aids/low-income-subsidy-2026'
import LTCMedicalSubsidy2026 from './pages/aids/ltc-medical-subsidy-2026'
import SubsidyConcurrentQA2026 from './pages/aids/subsidy-concurrent-qa-2026'
import SubsidyOverview2026 from './pages/aids/subsidy-overview-2026'
import SubsidySelfCheck2026 from './pages/aids/subsidy-self-check-2026'
import SubsidySelectionGuide2026 from './pages/aids/subsidy-selection-guide-2026'
import SeniorTransportAid2025 from './pages/aids/senior-transport-2025'
import HealthBalance2025 from './pages/finance/health-balance-2025'
import RetirePlan2025 from './pages/finance/retire-plan-2025'
import AntiFraud2025 from './pages/finance/anti-fraud-2025'
import DebtReliefGuide2026 from './pages/finance/debt-relief-guide-2026'
import DebtSelfAssessment2026 from './pages/finance/debt-self-assessment-2026'
import DebtSystemsComparison2026 from './pages/finance/debt-systems-comparison-2026'
import DebtRecoveryGuide2026 from './pages/finance/debt-recovery-guide-2026'
import FinanceGuide2026 from './pages/finance/finance-guide-2026'
import HealthPage from './pages/health/index'
import SleepBalance2025 from './pages/health/sleep-balance-2025'
import DietMind2025 from './pages/health/diet-mind-2025'
import PensionPage from './pages/pension/index'
import InsuranceOldage2025 from './pages/pension/insurance-oldage-2025'
import SelfContribution2025 from './pages/pension/self-contribution-2025'
import Announcements from './pages/Announcements'
import LoginPage from './pages/LoginPage'
import ResetPasswordPage from './pages/reset'
import ResetPasswordPageNew from './pages/ResetPasswordPage'
import Footer from './components/Footer'
import AdBanner from './components/AdBanner'
// 已移除廣告
import { Toaster } from 'react-hot-toast'
import { useGATracker } from './hooks/useGATracker'
import { KeepAlivePing } from './components/KeepAlivePing'
import ScrollToTop from './components/ScrollToTop'

// TODO: 為了上線摘要與作業功能，暫時隱藏 chant 模組
// 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
const isChantEnabled = import.meta.env.VITE_ENABLE_CHANT === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === 'true';

function App() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useGATracker()
  const [showAd, setShowAd] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  
  // ⚠️ 已移除所有 Auth 相關邏輯
  // 自動偵測目前執行模式（App/PWA 或 Web）
  const isApp =
    (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    /Capacitor|Android|iPhone|iPad/i.test(navigator.userAgent)

  // ⚠️ 已移除匿名使用者初始化邏輯
  
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
      // console.log('通知權限初始化完成:', hasPermission)
    }).catch(error => {
      console.error('通知權限初始化失敗:', error)
    })

    // ⚠️ 已移除：OAuth callback 處理邏輯
    // const handleOAuthCallback = async () => {
    //   try {
    //     // 檢查 URL hash 中是否有 access_token（OAuth callback 標記）
    //     if (window.location.hash.includes('access_token')) {
    //       const { data: { session } } = await supabase.auth.getSession()
    //       if (session?.user) {
    //         // OAuth 登入成功，導向 /summary
    //         navigate('/summary', { replace: true })
    //       }
    //     }
    //   } catch (error) {
    //     console.error('處理 OAuth callback 失敗:', error)
    //   }
    // }
    // handleOAuthCallback()
  }, [navigate])

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
      {/* ⚠️ 已移除升級成功提示 */}
      
      {/* Auth buttons removed for testing */}
      <ScrollToTop />
      <Routes>
          {/* 主要巢狀路由 - 使用 MainLayout */}
          <Route path="/" element={<MainLayout />}>
            {/* 首頁根據執行模式顯示不同頁面：App → 番茄鐘；Web → 功能入口首頁 */}
            <Route index element={isApp ? <PomodoroPage /> : <HomePage />} />
            <Route path="chant" element={<ChantCounter />} />
            <Route path="todo" element={<TodoPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            {/* TODO: 為了上線摘要與作業功能，暫時隱藏集氣願望模組 */}
            {/* 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟 */}
            {isChantEnabled && <Route path="wish" element={<WishWallPage />} />}
            
            {/*
             =====================================================
             ✅ 摘要功能已啟用
             =====================================================
            */}
            <Route path="summary" element={<SummaryPage />} />
            <Route path="pricing" element={<PricingPageNew />} />
            <Route path="pricing/success" element={<PaymentSuccessPage />} />
            <Route path="pricing/cancel" element={<PaymentCancelPage />} />
            <Route path="pricing/fail" element={<PurchaseFailPage />} />
            {/* ⚠️ DEPRECATED: 舊版方案頁，已改為顯示棄用提示 */}
            <Route path="pricing-old" element={<DeprecatedPage oldPath="/pricing-old" newPath="/pricing" message="此頁面已棄用，請前往新版方案頁" />} />
            {/* 作業解題功能 */}
            <Route path="homework-helper" element={<HomeworkHelper />} />
            <Route path="shopping/search" element={<NotFoundPage />} />
            <Route path="shopee-video" element={<NotFoundPage />} />
            {/* 若你其他工具也要暫時封鎖可以繼續加 */}
            
            <Route path="summary-landing" element={<SummaryLanding />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="shopping/results" element={<ShoppingResultsPage />} />
            
            {/* 商品頁面 */}
            <Route path="goods/airfryer-keshaui" element={<AirfryerPage />} />
            
            {/* 退休理財懶人包頁面 */}
            <Route path="aids" element={<AidsPage />} />
            <Route path="aids/rental-subsidy-2025" element={<RentalSubsidy2025 />} />
            <Route path="aids/ltc-2025-update" element={<LTC2025Update />} />
            <Route path="aids/senior-transport-2025" element={<SeniorTransportAid2025 />} />
            <Route path="aids/youth-employment-2026" element={<YouthEmployment2026 />} />
            <Route path="aids/childcare-subsidy-2026" element={<ChildcareSubsidy2026 />} />
            <Route path="aids/low-income-subsidy-2026" element={<LowIncomeSubsidy2026 />} />
            <Route path="aids/ltc-medical-subsidy-2026" element={<LTCMedicalSubsidy2026 />} />
            <Route path="aids/subsidy-concurrent-qa-2026" element={<SubsidyConcurrentQA2026 />} />
            <Route path="aids/subsidy-overview-2026" element={<SubsidyOverview2026 />} />
            <Route path="aids/subsidy-self-check-2026" element={<SubsidySelfCheck2026 />} />
            <Route path="aids/subsidy-selection-guide-2026" element={<SubsidySelectionGuide2026 />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="finance/guide-2026" element={<FinanceGuide2026 />} />
            <Route path="finance/health-balance-2025" element={<HealthBalance2025 />} />
            <Route path="finance/retire-plan-2025" element={<RetirePlan2025 />} />
            <Route path="finance/anti-fraud-2025" element={<AntiFraud2025 />} />
            <Route path="finance/debt-relief-guide-2026" element={<DebtReliefGuide2026 />} />
            <Route path="finance/debt-self-assessment-2026" element={<DebtSelfAssessment2026 />} />
            <Route path="finance/debt-systems-comparison-2026" element={<DebtSystemsComparison2026 />} />
            <Route path="finance/debt-recovery-guide-2026" element={<DebtRecoveryGuide2026 />} />
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
            {/* 工具路由封鎖 */}
            <Route path="tools/shopee-video" element={<NotFoundPage />} />
            {/* 作業解題功能 */}
            <Route path="tools/homework-helper" element={<HomeworkHelper />} />
            {/* 圖片素材 */}
            <Route path="images" element={<ImagesPage />} />
            <Route path="automation" element={<AIHome />} />
            <Route path="rxv-auto-shorts" element={<RedirectShorts />} />
            <Route path="video-preview" element={<VideoPreviewPage />} />
            <Route path="language-guide" element={<LanguageGuide />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/policy-explained" element={<PolicyExplainedPage />} />
            <Route path="blog/car-import-tariff-explained" element={<CarImportTariffExplainedPage />} />
            <Route path="blog/house-tax-explained" element={<HouseTaxExplainedPage />} />
            <Route path="blog/subsidy-eligibility-explained" element={<SubsidyEligibilityExplainedPage />} />
            <Route path="blog/232-clause-explained" element={<Clause232ExplainedPage />} />
            <Route path="blog/tariff-adjustment-impact" element={<TariffAdjustmentImpactPage />} />
            <Route path="blog/taiwan-us-tariff-explained" element={<TaiwanUSTariffExplainedPage />} />
            <Route path="blog/cheng-li-chun-policy-role-explained" element={<ChengLiChunPolicyRoleExplainedPage />} />
            <Route path="blog/income-tax-brackets-explained" element={<IncomeTaxBracketsExplainedPage />} />
            <Route path="blog/minimum-wage-explained" element={<MinimumWageExplainedPage />} />
            <Route path="blog/labor-insurance-explained" element={<LaborInsuranceExplainedPage />} />
            <Route path="blog/labor-insurance-pension-explained" element={<LaborInsurancePensionExplainedPage />} />
            <Route path="blog/long-term-care-subsidy-explained" element={<LongTermCareSubsidyExplainedPage />} />
            <Route path="blog/college-entrance-exam-explained" element={<CollegeEntranceExamExplainedPage />} />
            <Route path="blog/hsr-booking-system-explained" element={<HSRBookingSystemExplainedPage />} />
            <Route path="blog/minimum-wage-impact-explained" element={<MinimumWageImpactExplainedPage />} />
            <Route path="blog/nhi-premium-explained" element={<NHIPremiumExplainedPage />} />
            <Route path="blog/unemployment-benefit-explained" element={<UnemploymentBenefitExplainedPage />} />
            <Route path="blog/labor-pension-new-system-explained" element={<LaborPensionNewSystemExplainedPage />} />
            <Route path="blog/household-registration-explained" element={<HouseholdRegistrationExplainedPage />} />
            <Route path="blog/government-announcement-impact-explained" element={<GovernmentAnnouncementImpactExplainedPage />} />
            <Route path="blog/income-tax-exemption-explained" element={<IncomeTaxExemptionExplainedPage />} />
            <Route path="blog/subsidy-visibility-explained" element={<SubsidyVisibilityExplainedPage />} />
            <Route path="blog/overtime-pay-explained" element={<OvertimePayExplainedPage />} />
            <Route path="blog/dependent-deduction-explained" element={<DependentDeductionExplainedPage />} />
            <Route path="blog/policy-design-reality-explained" element={<PolicyDesignRealityExplainedPage />} />
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
          {/* TODO: 為了上線摘要與作業功能，暫時隱藏 chant 模組 */}
          {/* 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟 */}
          {isChantEnabled && <Route path="/chant-wish-create" element={<CreateChantWishPage />} />}
          {isChantEnabled && <Route path="/chant-wish-wall" element={<ChantWishWallPage />} />}
          {isChantEnabled && <Route path="/chant-wish-detail/:wishNo" element={<ChantWishDetailPage />} />}
          {/* 添加對 /chant-wish/:id 格式的支持，以兼容現有連結 */}
          {isChantEnabled && <Route path="/chant-wish/:id" element={<ChantWishDetailPage />} />}
          {isChantEnabled && <Route path="/chant-stats" element={<ChantStatsPage />} />}
          {isChantEnabled && <Route path="/chant-ranking" element={<ChantRankingPage />} />}
          {isChantEnabled && <Route path="/chant-support-ranking" element={<ChantSupportRankingPage />} />}
          {isChantEnabled && <Route path="/support-ranking" element={<SupportRankingPage />} />}
          {isChantEnabled && <Route path="/chant-support-leaderboard" element={<SupportRankingPage />} />}
          
          {/* 網站基本頁面 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPageNew />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service-description" element={<ServiceDescription />} />
          <Route path="/payment-info" element={<PaymentInfo />} />
          <Route path="/status" element={<SystemStatus />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/points" element={<PointsPage />} />
          
          {/* ⚠️ DEPRECATED: 舊版加點相關頁面，已改為顯示棄用提示 */}
          <Route path="/topup/report" element={<DeprecatedPage oldPath="/topup/report" newPath="/payment/report" message="此頁面已棄用，請前往新版匯款回報頁" />} />
          <Route path="/topup/admin" element={<DeprecatedPage oldPath="/topup/admin" newPath="/admin/payments" message="此頁面已棄用，請前往新版後台管理頁" />} />
          
          {/* 管理者頁面 */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/images" element={<AdminImagesPage />} />
          <Route path="/admin/images/list" element={<AdminImagesListPage />} />
          
          {/* 付款相關頁面 */}
          <Route path="/payment/bank-transfer" element={<BankTransferPage />} />
          <Route path="/payment/report" element={<PaymentReportPage />} />
          <Route path="/payment/success" element={<PaymentSuccessRedirectPage />} />
          
          {/* 使用說明 */}
          <Route path="/help" element={<HelpPage />} />
          
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
          
          {/* 404 - 必須放在最後 */}
          <Route path="*" element={<NotFoundPage />} />
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
