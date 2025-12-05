import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'AI 工具與生活服務中心 | RxV Pomodoro';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50">
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
                <Link
                  to="/summary"
                  className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
                >
                  🚀 直接試用 AI 摘要工具
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

              <div style={{ marginTop: "20px" }}>
                <Link to="/tools/shopee-video">
                  <button style={{
                    padding: "16px 20px",
                    width: "100%",
                    fontSize: "18px"
                  }}>
                    🎬 RxV AI 自動短影音工具（V2 專業版）
                  </button>
                </Link>
              </div>

              <p className="text-xs text-slate-500">
                ✅ 支援中英文內容 · ✅ 穩定 JSON Schema · ✅ 適合部落客 / 開發者 / 內容創作者
              </p>
            </div>

            {/* 右側：主力工具小卡片 */}
            <div className="flex-1">
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/summary"
                  className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 p-4 text-white shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🤖 AI 摘要工具</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      Free
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-sky-50">
                    一鍵整理長文、文章或 YouTube 字幕，支援中英文摘要＋關鍵字。
                  </p>
                </Link>

                <Link
                  to="/pomodoro"
                  className="flex flex-col justify-between rounded-2xl bg-white p-4 text-slate-900 shadow-md ring-1 ring-sky-100 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🍅 番茄鐘 + 待辦</span>
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                      專注模式
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    自訂工作 / 休息長度、任務分類與統計，幫你建立穩定節奏。
                  </p>
                </Link>
              </div>
            </div>
          </div>
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
            {/* AI 工具 */}
            <Link
              to="/summary"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-sky-100 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  🤖 AI 摘要工具
                </span>
                <span className="text-xs text-sky-600">AI 工具</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                貼上文章 / 網站 / 字幕內容，一鍵產出摘要與關鍵字，可搭配 Ko-fi 模板做成自己的 API。
              </p>
            </Link>

            <Link
              to="/shopping/search"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  🛒 商品搜尋與比價工具
                </span>
                <span className="text-xs text-emerald-700">生活工具</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                輸入想找的商品，未來可整合蝦皮 / 比價結果，幫你找出划算選項。
              </p>
            </Link>

            <Link
              to="/tools/shopee-video"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-purple-100 hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  🎬 RxV AI 自動短影音工具（V2 專業版）
                </span>
                <span className="text-xs text-purple-700">AI 工具</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                自動抓商品資訊 + 一鍵生成商品短影音（支援蝦皮分潤、字幕、腳本、圖片處理）。
              </p>
            </Link>

            {/* 生產力工具 */}
            <Link
              to="/pomodoro"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-rose-100 hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  🍅 番茄鐘專注計時
                </span>
                <span className="text-xs text-rose-700">生產力</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                固定節奏工作＋休息，搭配提醒音效與統計表，幫你慢慢找回節奏。
              </p>
            </Link>

            <Link
              to="/todo"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-amber-100 hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  ✅ 待辦清單
                </span>
                <span className="text-xs text-amber-700">任務管理</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                依照狀態分類（未開始 / 進行中 / 已完成），可搭配番茄鐘使用。
              </p>
            </Link>

            {/* 靜心與集氣工具 */}
            <Link
              to="/chant"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-indigo-100 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  🔔 唸經 / 念佛計數器
                </span>
                <span className="text-xs text-indigo-700">靜心工具</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                支援多種經文或祈禱內容，可記錄次數、時間與備註，適合每日練習。
              </p>
            </Link>

            <Link
              to="/chant-wish-wall"
              className="group flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-purple-100 hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  🕯 集氣願望牆 & 排行榜
                </span>
                <span className="text-xs text-purple-700">社群集氣</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                發起集氣活動、許願、查看排行榜與統計，讓祈願不再只是自己一個人默默努力。
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-purple-700">
                <Link to="/chant-wish-create" className="underline">
                  ➕ 發起新的集氣活動
                </Link>
                <Link to="/chant-stats" className="underline">
                  📊 看集氣統計
                </Link>
                <Link to="/chant-ranking" className="underline">
                  🏅 祈願排行
                </Link>
              </div>
            </Link>
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
