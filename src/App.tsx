import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
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
import SettingsPage from './pages/SettingsPage.tsx'
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
import AdminDealsPage from './pages/admin/deals'
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
import QrCodeSeoPage from './pages/blog/qr-code'
import QrArticlePage from './pages/blog/[slug]'
import FreeAiToolsPage from './pages/blog/free-ai-tools'
import AiSummaryGuidePage from './pages/blog/ai-summary-guide'
import HomeworkHelperGuidePage from './pages/blog/homework-helper-guide'
import QrCodeGeneratorGuidePage from './pages/blog/qr-code-generator'
import BlogFinancePage from './pages/blog/finance'
import BlogRetirementPage from './pages/blog/retirement'
import CarImportTariffExplainedPage from './pages/blog/car-import-tariff-explained'
import PolicyExplainedPage from './pages/policy-explained'
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
import AIFreeTools2026Page from './pages/blog/ai-free-tools-2026'
import LineDeletePhotosVideosSafePage from './pages/blog/line-delete-photos-videos-safe'
import LineStickerOutsourcingGuidePage from './pages/blog/line-sticker-outsourcing-guide'
import ShopeeTrashBagRecommendation2026Page from './pages/blog/shopee-trash-bag-recommendation-2026'
import LanguageGuide from './pages/language-guide'
import LazyHome from './pages/blog/LazyHome'
import HomePage from './pages/index'
import FreeResourcesPage from './pages/free'
import GuideIndexPage from './pages/guide/index'
import GuideArticlePage from './pages/guide/[slug]'
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
import SearchSeoSlugPage from './pages/SearchSeoSlugPage'
import ShoppingSearchPage from './pages/shopping/search'
import ShoppingResultsPage from './pages/shopping/results'
import AirfryerPage from './pages/goods/airfryer-keshaui'
import GoodsSharePage from './pages/goods/share'
import AIHome from './pages/AIHome'
import ToolsPage from './pages/tools'
import AISummaryGuide from './pages/tools/ai-summary'
import ShopeeSingleVideoPage from './pages/tools/ShopeeSingleVideoPage'
import ShopeeVideoPage from './pages/tools/shopee-video/index.tsx'
import ImageToVideo from "./pages/tools/ImageToVideo";
import ShopeeCsvPage from './pages/tools/shopee-csv'
import ShopeeDealsPage from './pages/tools/shopee-deals'
import ImageResizePage from './pages/tools/ImageResize'
import ImageCompressPage from './pages/tools/ImageCompress'
import ImageConvertPage from './pages/tools/ImageConvert'
import ImageCropPage from './tools/image-crop/ImageCropPage'
import LineStickerTool from './pages/tools/LineStickerTool'
import LineStickerGuide from './pages/tools/LineStickerGuide'
import StickerPromptGenerator from './pages/tools/StickerPromptGenerator'
import EmotionalValueStickerPrompt from './pages/tools/EmotionalValueStickerPrompt'
import StickerShowcaseGallery from './pages/tools/StickerShowcaseGallery'
import AnimatedStickerPromptGenerator from './pages/tools/AnimatedStickerPromptGenerator'
import AnimatedLineStickerTool from './pages/tools/AnimatedLineStickerTool'
import ImagePromptGenerator from './pages/tools/ImagePromptGenerator'
import PetPromptPage from './pages/tools/PetPromptPage'
import StickerImageSplitter from './pages/tools/StickerImageSplitter'
import ScamCheckPage from './pages/tools/ScamCheckPage'
import QrCodeTool from './pages/tools/QrCodeTool'
import EatNoFatGame from './pages/tools/EatNoFatGame'
import TrafficAccidentSelfProtectionPage from './pages/tools/TrafficAccidentSelfProtectionPage'
import ProductImageUpgradeService from './pages/services/ProductImageUpgradeService'
import DesignCommissionPage from './pages/services/DesignCommissionPage'
import ProductImageGeneratorPage from './pages/tools/ProductImageGeneratorPage'
import ProductShowcaseLandingPage from './pages/tools/ProductShowcaseLandingPage'
import BusinessCardPage from './pages/tools/BusinessCardPage'
import ManualBusinessCardOrderPage from './pages/tools/ManualBusinessCardOrderPage'
import MyBusinessCardOrdersPage from './pages/business-card/MyBusinessCardOrdersPage'
import BusinessCardPaymentPage from './pages/business-card/BusinessCardPaymentPage'
import PublicDigitalBusinessCardPage from './pages/business-card/PublicDigitalBusinessCardPage'
import AdminBusinessCardOrdersPage from './pages/admin/business-card-orders'
import StorefrontSettingsPage from './pages/storefront/StorefrontSettingsPage'
import PublicStorefrontPage from './pages/storefront/PublicStorefrontPage'
import GroupBuyPublicPage from './pages/group-buy/GroupBuyPublicPage'
import GroupBuyOrderPage from './pages/group-buy/GroupBuyOrderPage'
import MyGroupBuyOrdersPage from './pages/group-buy/MyGroupBuyOrdersPage'
import GroupBuyProductDetailPage from './pages/group-buy/GroupBuyProductDetailPage'
import AdminGroupBuyPage from './pages/admin/group-buy'
import ProductImageHistoryPage from './pages/product-image-history/ProductImageHistoryPage'
import MyServicesPage from './pages/my-services/MyServicesPage'
import AdminProductImageHistoryPage from './pages/admin/product-image-history'
import StoreBrandingPortfolio from './pages/portfolio/StoreBrandingPortfolio'
import AdminPortfolioUpload from './pages/portfolio/AdminPortfolioUpload'
import QRPage from './pages/qr/[id]'
import ShortCodeRedirectPage from './pages/s/[code]'
import QrTopPage from './pages/qr-top'
import HomeworkHelper from './pages/tools/homework-helper'
import ToolCategoryPage from './pages/tools/ToolCategoryPage'
import ToolLandingPage from './pages/tools/ToolLandingPage'
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
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/reset'
import ResetPasswordPageNew from './pages/ResetPasswordPage'
import Footer from './components/Footer'
import AdBanner from './components/AdBanner'
// 已移除廣告
import { Toaster } from 'react-hot-toast'
import { useGATracker } from './hooks/useGATracker'
import { KeepAlivePing } from './components/KeepAlivePing'
import ScrollToTop from './components/ScrollToTop'
import ShopeeCopyPage from './pages/tools/shopee-copy'
import RelationshipAiPage from './pages/relationship-ai'
import ImageBundleDownloadPage from './pages/download/image-bundle'

// TODO: 為了上線摘要與作業功能，暫時隱藏 chant 模組
// 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
const isChantEnabled = import.meta.env.VITE_ENABLE_CHANT === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === 'true';

function PausedAiToolPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <p className="text-sm font-bold text-amber-700">AI 功能暫停開放</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">此功能目前先暫停，避免免費試用產生過高 API 費用</h1>
        <p className="mt-3 text-slate-700 leading-relaxed">
          目前網站先主推 LINE 貼圖工具、圖片工具與商品圖整理服務。摘要與作業解題之後可再重新開放。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/tools/line-sticker" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700">前往 LINE 貼圖工具</Link>
          <Link to="/tools" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">查看免費工具</Link>
        </div>
      </div>
    </div>
  )
}



const ANIMATED_LINE_STICKER_ALLOWED_EMAILS = ['ang2289@yahoo.com.tw', 'ang2289@gmail.com']

function normalizeEmail(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function findCurrentUserEmailFromStorage() {
  if (typeof window === 'undefined') return ''

  const directKeys = [
    'email',
    'userEmail',
    'currentUserEmail',
    'loginEmail',
    'rxv_user_email',
    'rxv_login_email',
    'rxv_current_user_email',
    'loggedInUserEmail',
  ]

  for (const key of directKeys) {
    const email = normalizeEmail(localStorage.getItem(key))
    if (email.includes('@')) return email
  }

  const objectKeys = [
    'user',
    'authUser',
    'currentUser',
    'rxv_user',
    'rxv_auth_user',
    'rxv_current_user',
  ]

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      const email = normalizeEmail(parsed?.email || parsed?.user?.email || parsed?.profile?.email)
      if (email.includes('@')) return email
    } catch {
      const emailMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
      if (emailMatch?.[0]) return normalizeEmail(emailMatch[0])
    }
  }

  // 兼容 Supabase / 自訂登入資料存放於不同 localStorage key 的情況
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key) continue
    const raw = localStorage.getItem(key) || ''
    const emailMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    if (emailMatch?.[0]) return normalizeEmail(emailMatch[0])
  }

  return ''
}

function AdminOnlyAnimatedLineStickerRoute() {
  // 動態 LINE 貼圖 APNG 打包工具已先免費開放給客戶使用。
  // 保留此元件名稱只是為了相容舊路由或舊引用，不再做白名單檢查。
  return <AnimatedLineStickerTool />
}

// 客戶公開商品頁不使用 MainLayout，避免帶入 RxV 工具站的頁首、導覽、長頁尾與行動版底部工具列。
// 最下方僅保留輕量來源標示與支援入口，不搶客戶店家／商品內容的主視覺。
function PublicStorefrontStandalonePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicStorefrontPage />
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs leading-relaxed text-slate-500">
        <span>由 </span>
        <Link to="/" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
          RxV 商品展示頁
        </Link>
        <span> 提供｜</span>
        <Link to="/contact" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
          聯絡支援
        </Link>
      </footer>
    </div>
  )
}

// 團購功能暫停：改回 true 即可重新開放相關前台／會員／後台路由。
const GROUP_BUY_ENABLED = false

function App() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isBusinessCardPage = location.pathname.startsWith('/tools/business-card') || location.pathname.startsWith('/tools/product-showcase-page') || location.pathname.startsWith('/business-card/payment') || location.pathname.startsWith('/my-business-card-orders') || location.pathname.startsWith('/my-product-images') || location.pathname.startsWith('/my-services') || location.pathname.startsWith('/card/') || location.pathname.startsWith('/admin/business-card-orders') || location.pathname.startsWith('/admin/product-image-history')
  const isStorefrontPage = location.pathname.startsWith('/settings/storefront') || location.pathname.startsWith('/shop/')
  const isGroupBuyPage = GROUP_BUY_ENABLED && (location.pathname.startsWith('/group-buy/') || location.pathname.startsWith('/admin/group-buy') || location.pathname.startsWith('/my/group-buy-orders'))
  useGATracker()
  const [showAd, setShowAd] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Affiliates.One：預設禁止自動呼叫（避免 api.pub.affiliates.one 404/429 影響主流程）
  useEffect(() => {
    if (typeof window === 'undefined') return
    const anyWin = window as any
    if (anyWin.__rxv_affiliates_one_fetch_patched) return
    anyWin.__rxv_affiliates_one_fetch_patched = true

    const originalFetch: typeof window.fetch = window.fetch.bind(window)
    let lastCallAt = 0
    let lastToastAt = 0

    const toastOnce = async (msg: string) => {
      const now = Date.now()
      if (now - lastToastAt < 15000) return
      lastToastAt = now
      try {
        const mod = await import('react-hot-toast')
        mod.toast.error(msg, { id: 'affiliates-one-api' })
      } catch {
        // ignore
      }
    }

    const isAffiliatesGenerateUrl = (u: string) => {
      return /api\.pub\.affiliates\.one\/api\/v2\/affiliates\/links\/generate/i.test(u)
    }

    window.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : (input?.url as string) || ''
      if (!url || !isAffiliatesGenerateUrl(url)) {
        return originalFetch(input, init)
      }

      const enabled = localStorage.getItem('rxv_affiliates_one_enabled') === '1'
      if (!enabled) {
        toastOnce('聯盟服務已暫停自動呼叫（不影響主要功能）')
        return new Response(JSON.stringify({ ok: false, error: 'AFFILIATES_ONE_DISABLED' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const now = Date.now()
      if (now - lastCallAt < 1200) {
        return new Response(JSON.stringify({ ok: false, error: 'AFFILIATES_ONE_THROTTLED' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      lastCallAt = now

      try {
        const res = await originalFetch(input, init)
        if (res.status === 404) toastOnce('聯盟服務 API 404（不影響主要功能）')
        if (res.status === 429) toastOnce('聯盟服務請求過於頻繁（429），已暫停連打')
        return res
      } catch (e: any) {
        toastOnce('聯盟服務暫時無法連線（不影響主要功能）')
        return new Response(JSON.stringify({ ok: false, error: 'AFFILIATES_ONE_NETWORK_ERROR', message: e?.message || 'NETWORK_ERROR' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }) as any
  }, [])
  
  // ⚠️ 已移除所有 Auth 相關邏輯
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
    <div className={isBusinessCardPage || isStorefrontPage || isGroupBuyPage ? "w-full min-h-screen" : "w-full min-h-screen max-w-screen-md mx-auto"}>
      {/* ⚠️ 已移除升級成功提示 */}
      
      {/* Auth buttons removed for testing */}
      <ScrollToTop />
      <Routes>
          {/* 主要巢狀路由 - 使用 MainLayout */}
          <Route path="/" element={<MainLayout />}>
            {/* 首頁：App／手機／Web 皆與網站相同（功能入口）；番茄鐘仍為 /pomodoro */}
            <Route index element={<HomePage />} />
            <Route path="free" element={<FreeResourcesPage />} />
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

            <Route path="services/product-image-upgrade" element={<ProductImageUpgradeService />} />
            <Route path="services/design-commission" element={<DesignCommissionPage />} />
            <Route path="tools/commercial-image" element={<Navigate to="/tools/product-image-generator" replace />} />
            <Route path="tools/product-image-generator" element={<ProductImageGeneratorPage />} />
            <Route path="tools/product-showcase-page" element={<ProductShowcaseLandingPage />} />
            <Route path="tools/business-card" element={<BusinessCardPage />} />
            <Route path="tools/business-card-order" element={<ManualBusinessCardOrderPage />} />
            <Route path="business-card/payment" element={<BusinessCardPaymentPage />} />
            <Route path="my-business-card-orders" element={<MyBusinessCardOrdersPage />} />
            <Route path="my-product-images" element={<ProductImageHistoryPage />} />
            <Route path="my-services" element={<MyServicesPage />} />
            <Route path="card/:slug" element={<PublicDigitalBusinessCardPage />} />
            <Route path="admin/business-card-orders" element={<AdminBusinessCardOrdersPage />} />
            <Route path="admin/product-image-history" element={<AdminProductImageHistoryPage />} />
            <Route path="settings/storefront" element={<StorefrontSettingsPage />} />
            {GROUP_BUY_ENABLED && <Route path="group-buy/:slug" element={<GroupBuyPublicPage />} />}
            {GROUP_BUY_ENABLED && <Route path="group-buy/:campaignSlug/product/:productId" element={<GroupBuyProductDetailPage />} />}
            {GROUP_BUY_ENABLED && <Route path="group-buy/order/:orderCode" element={<GroupBuyOrderPage />} />}
            {GROUP_BUY_ENABLED && <Route path="group-buy/order-lookup" element={<Navigate to="/my/group-buy-orders" replace />} />}
            {GROUP_BUY_ENABLED && <Route path="group-buy/recover" element={<Navigate to="/my/group-buy-orders" replace />} />}
            {GROUP_BUY_ENABLED && <Route path="my/group-buy-orders" element={<MyGroupBuyOrdersPage />} />}
            {GROUP_BUY_ENABLED && <Route path="admin/group-buy" element={<AdminGroupBuyPage />} />}
            <Route path="portfolio/store-branding" element={<StoreBrandingPortfolio />} />
            <Route path="admin/portfolio-upload" element={<AdminPortfolioUpload />} />
            <Route path="tools/shopee-copy" element={<ShopeeCopyPage />} />

            <Route path="pricing/success" element={<PaymentSuccessPage />} />
            <Route path="pricing/cancel" element={<PaymentCancelPage />} />
            <Route path="pricing/fail" element={<PurchaseFailPage />} />

            {/* 客戶付款流程：納入 MainLayout，統一顯示網站頁首與頁尾 */}
            <Route path="payment/bank-transfer" element={<BankTransferPage />} />
            <Route path="payment/report" element={<PaymentReportPage />} />
            <Route path="payment/success" element={<PaymentSuccessRedirectPage />} />

            {/* ⚠️ DEPRECATED: 舊版方案頁，已改為顯示棄用提示 */}
            <Route path="pricing-old" element={<DeprecatedPage oldPath="/pricing-old" newPath="/pricing" messageKey="deprecated_pricing_message" />} />
            {/* 作業解題功能暫停開放 */}
            <Route path="homework-helper" element={<PausedAiToolPage />} />
            <Route path="shopping/search" element={<NotFoundPage />} />
            <Route path="shopee-video" element={<NotFoundPage />} />
            {/* 若你其他工具也要暫時封鎖可以繼續加 */}
            
            <Route path="summary-landing" element={<SummaryLanding />} />
            <Route path="search/:slug" element={<SearchSeoSlugPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="shopping/results" element={<ShoppingResultsPage />} />
            
            {/* 商品頁面 */}
            <Route path="goods/airfryer-keshaui" element={<AirfryerPage />} />
            <Route path="goods/share" element={<GoodsSharePage />} />
            
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
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/eat-no-fat-game" element={<EatNoFatGame />} />
            <Route path="tools/traffic-accident" element={<TrafficAccidentSelfProtectionPage />} />
            <Route path="tools/ai-summary" element={<PausedAiToolPage />} />
            <Route path="tools/summary" element={<PausedAiToolPage />} />
            <Route path="tools/shopee-single-video" element={<ShopeeSingleVideoPage />} />
            {/* Shopee 自動短影音工具（已啟用入口） */}
            <Route path="tools/shopee-video" element={<ShopeeVideoPage />} />
            <Route path="tools/shopee-csv" element={<ShopeeCsvPage />} />
            <Route path="tools/shopee-deals" element={<ShopeeDealsPage />} />
            <Route path="tools/image-resize" element={<ImageResizePage />} />
            <Route path="tools/image-compress" element={<ImageCompressPage />} />
            <Route path="tools/image-convert" element={<ImageConvertPage />} />
            <Route path="tools/image-crop" element={<ImageCropPage />} />
            <Route path="tools/line-sticker" element={<LineStickerTool />} />
            <Route path="tools/line-sticker-guide" element={<LineStickerGuide />} />
            <Route path="tools/sticker-prompt" element={<StickerPromptGenerator />} />
            <Route path="tools/emotional-value-sticker-prompt" element={<EmotionalValueStickerPrompt />} />
            <Route path="tools/sticker-showcase" element={<StickerShowcaseGallery />} />
            <Route path="tools/animated-sticker-prompt" element={<AnimatedStickerPromptGenerator />} />
            <Route path="tools/animated-line-sticker" element={<AdminOnlyAnimatedLineStickerRoute />} />
            <Route path="tools/image-prompt" element={<ImagePromptGenerator />} />
            <Route path="tools/pet-prompt" element={<PetPromptPage />} />
            <Route path="tools/sticker-splitter" element={<StickerImageSplitter />} />
            <Route path="tools/scam-check" element={<ScamCheckPage />} />
            <Route path="tools/qr-code" element={<QrCodeTool />} />
            <Route path="tools/qr" element={<QrCodeTool />} />
            <Route path="tools/ai" element={<ToolCategoryPage categoryKey="ai" />} />
            <Route path="tools/image" element={<ToolCategoryPage categoryKey="image" />} />
            <Route path="tools/productivity" element={<ToolCategoryPage categoryKey="productivity" />} />
            <Route path="tools/life" element={<ToolCategoryPage categoryKey="life" />} />
            <Route path="compare/:compareSlug" element={<ToolLandingPage />} />
            <Route path="tools/:toolSlug/:landingSlug" element={<ToolLandingPage />} />
            {/* 作業解題功能暫停開放 */}
            <Route path="tools/homework-helper" element={<PausedAiToolPage />} />
            {/* 圖片素材 */}
            <Route path="images" element={<ImagesPage />} />
            <Route path="automation" element={<AIHome />} />
            <Route path="rxv-auto-shorts" element={<RedirectShorts />} />
            <Route path="video-preview" element={<VideoPreviewPage />} />
            <Route path="language-guide" element={<LanguageGuide />} />
            <Route path="blog" element={<BlogHome />} />
            <Route path="blog/qr-code" element={<QrCodeSeoPage />} />
            <Route path="blog/ai-tools" element={<AIFreeTools2026Page />} />
            <Route path="blog/free-ai-tools" element={<FreeAiToolsPage />} />
            <Route path="blog/ai-summary-guide" element={<AiSummaryGuidePage />} />
            <Route path="blog/homework-helper-guide" element={<HomeworkHelperGuidePage />} />
            <Route path="blog/qr-code-generator" element={<QrCodeGeneratorGuidePage />} />
            <Route path="blog/finance" element={<BlogFinancePage />} />
            <Route path="blog/retirement" element={<BlogRetirementPage />} />
            <Route path="policy-explained" element={<PolicyExplainedPage />} />
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
            <Route path="blog/ai-free-tools-2026" element={<AIFreeTools2026Page />} />
            <Route path="blog/line-delete-photos-videos-safe" element={<LineDeletePhotosVideosSafePage />} />
            <Route path="blog/line-sticker-outsourcing-guide" element={<LineStickerOutsourcingGuidePage />} />
            <Route path="blog/shopee-trash-bag-recommendation-2026" element={<ShopeeTrashBagRecommendation2026Page />} />
            <Route path="blog/:slug" element={<QrArticlePage />} />
            <Route path="guide" element={<GuideIndexPage />} />
            <Route path="guide/:slug" element={<GuideArticlePage />} />
          </Route>
          
          {/* 客戶公開商品頁：獨立於 MainLayout，避免顯示 RxV 工具站的頁首與長頁尾 */}
          <Route path="/shop/:slug" element={<PublicStorefrontStandalonePage />} />

          {/* 其他獨立頁面 */}
          <Route path="/relationship-ai" element={<RelationshipAiPage />} />
          <Route path="/download/image-bundle" element={<ImageBundleDownloadPage />} />
          <Route path="/projects" element={<FocusProjectsPage />} />
          <Route path="/category-manager" element={<CategoryManagerPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/qr/:id" element={<QRPage />} />
          <Route path="/qr-top" element={<QrTopPage />} />
          <Route path="/s/:code" element={<ShortCodeRedirectPage />} />
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
          <Route path="/register" element={<RegisterPage />} />
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
          <Route path="/topup/report" element={<DeprecatedPage oldPath="/topup/report" newPath="/payment/report" messageKey="deprecated_topup_report_message" />} />
          <Route path="/topup/admin" element={<DeprecatedPage oldPath="/topup/admin" newPath="/admin/payments" messageKey="deprecated_topup_admin_message" />} />
          
          {/* 管理者頁面 */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/images" element={<AdminImagesPage />} />
          <Route path="/admin/images/list" element={<AdminImagesListPage />} />
          <Route path="/admin/deals" element={<AdminDealsPage />} />
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
          {/*自動短影音 */}
          <Route path="/tools/image-to-video" element={<ImageToVideo />} />
          
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
