import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { featureFlags } from '@/config/featureFlags';
import { isLoggedIn, logout } from '@/lib/auth';
import { trackEvent } from '@/utils/analytics';

interface ToolCard {
  id: string;
  title: string;
  badge?: string;
  description: string;
  icon: string;
  href: string | null;
  disabled?: boolean;
  category: string;
  ringColor: string;
  hoverColor: string;
  badgeColor?: string;
  onClick?: (e: React.MouseEvent) => void;
  extraContent?: React.ReactNode;
  featureFlag?: keyof typeof featureFlags;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    document.title = 'AI 工具與生活服務中心 | RxV Pomodoro';
    // 檢查登入狀態
    setLoggedIn(isLoggedIn());
    
    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      setLoggedIn(isLoggedIn());
    };
    window.addEventListener('storage', handleStorageChange);
    
    // 定期檢查登入狀態
    const interval = setInterval(() => {
      setLoggedIn(isLoggedIn());
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 登出處理
  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    alert('已登出');
    navigate('/');
  };

  // TODO: 為了上線摘要與作業功能，暫時隱藏集氣願望模組
  // 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
  const isChantWishEnabled = import.meta.env.VITE_ENABLE_CHANT === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === 'true';

  // 判斷是否為 localhost 環境（僅在本地端顯示管理工具）
  const isLocalhost =
    typeof window !== "undefined" &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // 工具卡資料陣列
  const toolCards: ToolCard[] = [
    {
      id: "ai-summary",
      title: "AI 摘要工具",
      description: "貼上文章 / 網站 / 字幕內容，一鍵產出摘要與關鍵字，可搭配 Ko-fi 模板做成自己的 API。",
      icon: "🤖",
      href: "/summary",
      category: "AI 工具",
      ringColor: "ring-sky-100",
      hoverColor: "hover:bg-sky-50",
      badgeColor: "text-sky-600"
    },
    {
      id: "images",
      title: "圖片素材",
      description: "免費圖片＋會員解鎖素材，可直接下載使用",
      icon: "🖼️",
      href: "/images",
      category: "設計工具",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700"
    },
    {
      id: "homework-helper",
      title: "作業助手（解題輔助）",
      description: "遇到不會的功課題目，可以直接輸入題目取得解題說明。",
      icon: "📘",
      href: "/tools/homework-helper",
      category: "學習工具",
      ringColor: "ring-amber-100",
      hoverColor: "hover:bg-amber-50",
      badgeColor: "text-amber-700"
    },
    {
      id: "price-compare",
      title: "商品搜尋與比價工具",
      description: "輸入想找的商品，未來可整合蝦皮 / 比價結果，幫你找出划算選項。",
      icon: "🛒",
      href: "/shopping/search",
      category: "生活工具",
      ringColor: "ring-emerald-100",
      hoverColor: "hover:bg-emerald-50",
      badgeColor: "text-emerald-700",
      featureFlag: "priceCompare"
    },
    {
      id: "video-tool",
      title: "AI 短影音工具",
      badge: "即將推出",
      description: "自動產生短影音內容，目前功能規劃中，敬請期待。",
      icon: "🎬",
      href: "/video-preview",
      disabled: false,
      category: "AI 工具",
      ringColor: "ring-purple-100",
      hoverColor: "hover:bg-purple-50",
      badgeColor: "text-purple-700"
    },
    {
      id: "pomodoro",
      title: "番茄鐘專注計時",
      description: "固定節奏工作＋休息，搭配提醒音效與統計表，幫你慢慢找回節奏。",
      icon: "🍅",
      href: "/pomodoro",
      category: "生產力",
      ringColor: "ring-rose-100",
      hoverColor: "hover:bg-rose-50",
      badgeColor: "text-rose-700"
    },
    {
      id: "todo",
      title: "待辦清單",
      description: "依照狀態分類（未開始 / 進行中 / 已完成），可搭配番茄鐘使用。",
      icon: "✅",
      href: "/todo",
      category: "任務管理",
      ringColor: "ring-amber-100",
      hoverColor: "hover:bg-amber-50",
      badgeColor: "text-amber-700"
    },
    {
      id: "chant",
      title: "唸經 / 念佛計數器",
      description: "支援多種經文或祈禱內容，可記錄次數、時間與備註，適合每日練習。",
      icon: "🔔",
      href: "/chant",
      category: "靜心工具",
      ringColor: "ring-indigo-100",
      hoverColor: "hover:bg-indigo-50",
      badgeColor: "text-indigo-700"
    },
    // TODO: 為了上線摘要與作業功能，暫時隱藏集氣願望模組
    // 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
    ...(isChantWishEnabled ? [{
      id: "chant-wish-wall",
      title: "集氣願望牆 & 排行榜",
      description: "發起集氣活動、許願、查看排行榜與統計，讓祈願不再只是自己一個人默默努力。",
      icon: "🕯",
      href: "/chant-wish-wall",
      category: "社群集氣",
      ringColor: "ring-purple-100",
      hoverColor: "hover:bg-purple-50",
      badgeColor: "text-purple-700",
      extraContent: (
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-purple-700">
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate('/chant-wish-create');
            }}
            className="underline cursor-pointer hover:text-purple-900"
          >
            ➕ 發起新的集氣活動
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate('/chant-stats');
            }}
            className="underline cursor-pointer hover:text-purple-900"
          >
            📊 看集氣統計
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate('/chant-ranking');
            }}
            className="underline cursor-pointer hover:text-purple-900"
          >
            🏅 祈願排行
          </div>
        </div>
      )
    }] : []),
    // 圖片管理工具（僅在本地端顯示）
    ...(isLocalhost ? [
      {
        id: "admin-images-upload",
        title: "圖片上傳後台",
        description: "上傳圖片到 Supabase Storage 並寫入資料表",
        icon: "📤",
        href: "/admin/images",
        category: "管理工具",
        ringColor: "ring-red-100",
        hoverColor: "hover:bg-red-50",
        badgeColor: "text-red-700"
      },
      {
        id: "admin-images-list",
        title: "圖片清單管理",
        description: "查看所有已上傳的圖片清單",
        icon: "📋",
        href: "/admin/images/list",
        category: "管理工具",
        ringColor: "ring-red-100",
        hoverColor: "hover:bg-red-50",
        badgeColor: "text-red-700"
      }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50">
      {/* 登入/登出按鈕 - 右上角固定位置 */}
      <div className="fixed top-4 right-4 z-50">
        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            登出
          </button>
        ) : (
          <Link
            to="/login"
            className="login-button-white inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors text-sm"
            style={{ color: '#ffffff !important', fontWeight: 'bold' }}
          >
            登入
          </Link>
        )}
      </div>
      
      {/* 頁面最大寬度 */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 lg:py-12">
        {/* Hero 區：標題＋主推工具 */}
        <section className="mb-10 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-sky-100 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-3">
              <p className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                🌟 RxV AI 工具與生活服務中心
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                一站整合 <span className="text-sky-600">AI 工具、專注力、集氣祈願</span>，
                幫你顧好工作、生活與身心平衡
              </h1>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                這裡是你的個人效率與生活小宇宙：上網查資料可以用
                <span className="font-semibold text-sky-700"> AI 摘要工具</span>，
                工作時用 <span className="font-semibold">番茄鐘 + 待辦</span>，
                需要安靜下來就用 <span className="font-semibold">唸經集氣 & 許願牆</span>。
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                {/* 主 CTA：開始解題 */}
                <Link
                  to="/tools/homework-helper"
                  onClick={() => {
                    trackEvent('click_homework_entry', {
                      source_page: 'home'
                    });
                  }}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                  style={{ color: '#ffffff !important', fontWeight: 'bold' }}
                >
                  📘 開始解題
                </Link>
                {/* 次要 CTA：AI 摘要工具 */}
                <Link
                  to="/summary"
                  className="summary-button-white inline-flex items-center rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
                >
                  🤖 AI 摘要工具
                </Link>
                <a
                  href="https://ko-fi.com/s/b5b4180ff1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  🧩 給開發者用的 Supabase 模板
                </a>
              </div>

              {/* 🔒 RxV AI 自動短影音工具 - 使用功能開關控制 */}
              {/* TODO: 影音工具正式上線後再開啟入口 */}
              {/* 路由：/tools/shopee-video */}
              {featureFlags.videoTool && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{
                    padding: "16px 20px",
                    width: "100%",
                    fontSize: "18px",
                    opacity: 0.6,
                    cursor: "not-allowed",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    textAlign: "center"
                  }}>
                    🎬 RxV AI 自動短影音工具（V2 專業版）
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    🚧 即將開放（目前為功能規劃中）
                  </p>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    目前此工具尚未開放使用，請期待未來更新。
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500">
                ✅ 支援中英文內容 · ✅ 穩定 JSON Schema · ✅ 適合部落客 / 開發者 / 內容創作者
              </p>
            </div>

            {/* 右側：主力工具小卡片 */}
            <div className="flex-1">
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/tools/homework-helper"
                  onClick={() => {
                    trackEvent('click_homework_entry', {
                      source_page: 'home',
                      position: 'hero_card'
                    });
                  }}
                  className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">📘 作業解題</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      Hot
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-blue-50">
                    遇到不會的題目？貼上題目，快速取得解題說明與步驟。
                  </p>
                </Link>

                <Link
                  to="/summary"
                  className="flex flex-col justify-between rounded-2xl bg-white p-4 text-slate-900 shadow-md ring-1 ring-sky-100 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🤖 AI 摘要工具</span>
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                      Free
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    一鍵整理長文、文章或 YouTube 字幕，支援中英文摘要＋關鍵字。
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 快速工具入口 */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            快速工具入口
          </h3>
          
          {/* 你現在卡在哪？情境選擇 */}
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              💡 你現在卡在哪？
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/tools/homework-helper"
                onClick={() => {
                  trackEvent('click_homework_entry', {
                    source_page: 'home',
                    scenario: 'math_problem'
                  });
                }}
                className="block p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-2xl mb-2">📐</div>
                <h5 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                  數學題不會算
                </h5>
                <p className="text-xs text-gray-600">
                  貼上題目，取得解題步驟
                </p>
              </Link>
              
              <Link
                to="/tools/homework-helper"
                onClick={() => {
                  trackEvent('click_homework_entry', {
                    source_page: 'home',
                    scenario: 'homework_stuck'
                  });
                }}
                className="block p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-2xl mb-2">📚</div>
                <h5 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                  作業卡關了
                </h5>
                <p className="text-xs text-gray-600">
                  需要解題思路與說明
                </p>
              </Link>
              
              <Link
                to="/tools/homework-helper"
                onClick={() => {
                  trackEvent('click_homework_entry', {
                    source_page: 'home',
                    scenario: 'need_explanation'
                  });
                }}
                className="block p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-2xl mb-2">💭</div>
                <h5 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                  需要解題說明
                </h5>
                <p className="text-xs text-gray-600">
                  了解解題過程與概念
                </p>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 作業解題神器 */}
            <Link
              to="/tools/homework-helper"
              onClick={() => {
                trackEvent('click_homework_entry', {
                  source_page: 'home',
                  position: 'quick_tools'
                });
              }}
              className="block p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
            >
              <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 text-lg">
                作業解題神器
              </h4>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                貼上題目，快速產生解題結果與扣點資訊。
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 text-sm">
                前往 →
              </div>
            </Link>

            {/* 文章摘要工具 */}
            <Link
              to="/summary"
              className="block p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
            >
              <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-2 text-lg">
                文章摘要工具
              </h4>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                貼上文章，一鍵摘要並顯示本次使用字數。
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-600 group-hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 text-sm">
                前往 →
              </div>
            </Link>
          </div>
        </section>

        {/* 📋 政策白話解釋（突出顯示） */}
        <section className="mb-10">
          <Link
            to="/blog/policy-explained"
            className="block p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  政策白話解釋
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  看不懂政策新聞沒關係，幫你整理「跟你有沒有關係」
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 leading-relaxed">
                用簡單易懂的方式解釋複雜的政策，快速了解哪些政策跟你有關
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-600 group-hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 text-sm ml-4">
                查看 →
              </div>
            </div>
          </Link>
        </section>

        {/* 區塊 2：AI / 生產力 / 靜心工具卡片 */}
        <section className="mb-10 space-y-6">
          {/* 標題列 */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                🧰 工具總覽
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                把你常用的功能集中在一起：AI、番茄鐘、待辦、唸經、集氣牆與比價工具。
              </p>
            </div>
          </div>

          {/* 卡片群組 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {toolCards
              .filter((card) => !card.featureFlag || featureFlags[card.featureFlag])
              .map((card) => {
                // disabled 狀態的樣式：停用 hover 效果，加上視覺提示
                const baseClassName = `flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ${card.ringColor} ${
                  card.disabled
                    ? 'opacity-60 cursor-not-allowed pointer-events-none'
                    : `group hover:-translate-y-0.5 ${card.hoverColor} hover:shadow-md transition`
                }`;

                const cardContent = (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-900">
                        {card.icon} {card.title}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* disabled 時強制顯示「即將開放」badge */}
                        {(card.disabled || card.badge) && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            {card.badge || '即將開放'}
                          </span>
                        )}
                        <span className={`text-xs ${card.badgeColor || 'text-slate-600'}`}>
                          {card.category}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {card.description}
                    </p>
                    {card.extraContent && !card.disabled && card.extraContent}
                  </>
                );

                if (card.disabled || !card.href) {
                  return (
                    <div key={card.id} className={baseClassName}>
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={card.id}
                    to={card.href}
                    className={baseClassName}
                    onClick={(e) => {
                      if (card.disabled) {
                        e.preventDefault();
                        return;
                      }
                      if (card.onClick) {
                        card.onClick(e);
                      }
                    }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
          </div>
        </section>

        {/* 區塊 3：文章專區（Blog） */}
        <section className="mb-10 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 sm:p-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                📝 文章專區（Blog）
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                不只是工具，你也可以閱讀關於專注力、健康、理財、補助與退休金的長期整理文章。
              </p>
            </div>
            <Link
              to="/blog"
              className="text-xs font-medium text-sky-700 hover:text-sky-800"
            >
              查看全部文章 →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/blog"
              className="flex flex-col rounded-xl bg-sky-50/80 p-4 hover:bg-sky-100"
            >
              <span className="text-sm font-semibold text-sky-900">
                🎯 專注力與番茄鐘系列
              </span>
              <p className="mt-1 text-xs text-sky-800">
                從呼吸、冥想到番茄工作法，如何在混亂的日常中慢慢找回「可以專心一下」的空間。
              </p>
            </Link>

            <Link
              to="/finance"
              className="flex flex-col rounded-xl bg-emerald-50/80 p-4 hover:bg-emerald-100"
            >
              <span className="text-sm font-semibold text-emerald-900">
                💰 健康理財與反詐騙
              </span>
              <p className="mt-1 text-xs text-emerald-800">
                不追爆賺，只談「活得久、活得穩」的理財與風險防護，搭配政府資源整理。
              </p>
            </Link>

            <Link
              to="/aids"
              className="flex flex-col rounded-xl bg-amber-50/80 p-4 hover:bg-amber-100"
            >
              <span className="text-sm font-semibold text-amber-900">
                🏛 補助懶人包與退休金
              </span>
              <p className="mt-1 text-xs text-amber-800">
                租屋、長照、交通補助與退休金制度懶人整理，讓你少跑一點冤枉路。
              </p>
            </Link>
          </div>
        </section>

        {/* 🛒 好物推薦入口區塊 - 首頁 */}
        <section className="py-10 border-t mt-8 mb-10">
          <h2 className="text-2xl font-bold mb-4">🛒 好物推薦</h2>
          <p className="text-gray-600 mb-6">嚴選超值商品推薦，每篇皆附影片＋文字分析</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 商品卡片 1 */}
            <Link 
              to="/goods/airfryer-keshaui" 
              className="block border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <img 
                src="/assets/airfryer-keshaui-cover.png" 
                alt="氣炸鍋推薦" 
                className="w-full rounded mb-2 object-cover"
              />
              <h3 className="font-semibold text-lg">科帥氣炸鍋 AF606</h3>
              <p className="text-sm text-gray-500">5.5L 大容量＋液晶觸控，附 12 件烘焙組</p>
            </Link>
            {/* 可加第 2 個商品卡片（未來擴充） */}
          </div>

          <div className="mt-4 text-right">
            <Link to="/goods" className="text-blue-600 hover:underline">
              👉 查看全部好物推薦
            </Link>
          </div>
        </section>

        {/* 區塊 4：網站說明 / SEO 區塊 */}
        <section className="mb-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4 text-xs text-slate-600 sm:text-sm">
          <p>
            本站由「RxV 番茄鐘任務管理」延伸發展，目標是整合
            <span className="font-semibold"> AI 工具、效率工具與生活資訊</span>，
            讓你在同一個網站就能處理工作、學習、身心與金錢相關的事情。
          </p>
          <p className="mt-1">
            未來會持續更新：更多 AI 工具、JSON API 模板、以及補助與理財文章。
          </p>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
