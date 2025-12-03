# 網站架構文件

## 📋 專案概述

**專案名稱**: Pomodoro App  
**技術棧**: React 18 + TypeScript + Vite + Tailwind CSS  
**部署平台**: Vercel  
**網址**: https://pomodoro-app-eight-rouge.vercel.app

---

## 🏗️ 專案結構

```
pomodoro-app/
├── src/
│   ├── pages/              # 頁面元件
│   ├── components/         # 共用元件
│   ├── hooks/              # 自訂 Hooks
│   ├── services/           # 服務層
│   ├── utils/              # 工具函數
│   ├── lib/                # 函式庫
│   ├── layouts/            # 佈局元件
│   ├── locales/            # 多語言資源
│   ├── types/              # TypeScript 類型定義
│   ├── store/              # 狀態管理
│   ├── data/               # 靜態資料
│   ├── config.ts           # 網站配置
│   ├── i18n.ts             # 多語言設定
│   └── App.tsx             # 主應用程式
├── public/                 # 靜態資源
├── api/                    # API 相關（Edge Functions）
└── scripts/                # 建置腳本
```

---

## 🗺️ 路由架構

### 主要功能路由（使用 MainLayout）

#### 🏠 首頁與核心功能
- `/` - 首頁（Web 模式顯示功能入口，App 模式顯示番茄鐘）
- `/pomodoro` - 番茄鐘計時器
- `/todo` - 待辦清單
- `/chant` - 唸經計數器
- `/summary` - AI 摘要工具
- `/search` - 搜尋功能

#### 🛍️ 購物與工具
- `/shopping/search` - 商品搜尋
- `/shopping/results` - 搜尋結果
- `/tools/ai-summary` - AI 工具教學
- `/language-guide` - 語系切換教學

#### 📰 內容專區
- `/blog` - 文章專區（整合所有文章）
- `/aids` - 補助懶人包
- `/finance` - 健康理財專欄
- `/health` - 健康生活專欄
- `/pension` - 退休金專欄
- `/retirement` - 退休規劃

#### 📝 詳細文章路由
- `/blog/*` - 專注力相關文章（30+ 篇）
- `/aids/*` - 補助相關文章
- `/finance/*` - 理財相關文章
- `/health/*` - 健康相關文章
- `/pension/*` - 退休金相關文章

### 獨立頁面路由

#### ⚙️ 設定與管理
- `/settings` - 設定頁面
- `/projects` - 專注任務管理
- `/category-manager` - 分類管理
- `/backup` - 備份還原

#### 🙏 集氣與願望
- `/wish` - 集氣牆
- `/chant-wish-create` - 建立集氣願望
- `/chant-wish-wall` - 集氣願望牆
- `/chant-wish-detail/:id` - 願望詳情
- `/chant-stats` - 統計頁面
- `/chant-ranking` - 排行榜

#### 👥 群組功能
- `/group/create` - 建立群組
- `/group/:id` - 群組首頁
- `/group/:id/purchase/*` - 群組採買功能
- `/group/:id/event` - 群組活動
- `/group/task/*` - 群組任務

#### 📄 網站基本頁面
- `/privacy-policy` - 隱私政策
- `/terms` - 使用條款
- `/about` - 關於我們
- `/contact` - 聯絡我們
- `/features` - 功能介紹

---

## 📁 頁面分類

### 核心功能頁面
- `PomodoroPage.tsx` - 番茄鐘計時器
- `TodoPage.tsx` - 待辦清單
- `ChantCounter.tsx` - 唸經計數器
- `SummaryPage` (`summary/index.tsx`) - AI 摘要工具

### 內容頁面
- `index.tsx` - 首頁（功能入口）
- `BlogPage` (`blog/index.tsx`) - 文章專區
- `LanguageGuide` (`language-guide.tsx`) - 語系教學
- `AidsPage` (`blog/aids.tsx`) - 補助懶人包
- `FinancePage` (`finance/index.tsx`) - 理財專欄
- `HealthPage` (`health/index.tsx`) - 健康專欄
- `PensionPage` (`pension/index.tsx`) - 退休金專欄

### 工具與教學
- `AISummaryGuide` (`tools/ai-summary.tsx`) - AI 工具教學
- `SearchPage.tsx` - 搜尋頁面
- `ShoppingSearchPage` (`shopping/search.tsx`) - 商品搜尋

### 文章頁面（30+ 篇）
專注力相關：
- `ArticleTemplate.tsx` - 番茄鐘專注
- `ChantFocusArticle.tsx` - 唸經專注
- `MorningMeditationArticle.tsx` - 清晨靜坐
- `FocusReset.tsx` - 專注力重啟
- ... 等 30+ 篇文章

---

## 🧩 核心元件架構

### Hooks (`src/hooks/`)
- `useSummary.ts` - AI 摘要功能
- `useGATracker.ts` - Google Analytics 追蹤
- `useAdFree.ts` - 廣告管理
- `useLocalStorage.ts` - 本地儲存
- `useTheme.ts` - 主題管理
- `useNotification.ts` - 通知服務

### 服務層 (`src/services/`)
- `notificationService.ts` - 通知服務
- 其他業務邏輯服務

### 工具函數 (`src/utils/`)
- `supabaseClient.ts` - Supabase 客戶端
- 其他工具函數

### 配置檔案
- `config.ts` - 網站配置（API URL、環境變數）
- `i18n.ts` - 多語言設定（支援 zh-TW、en）

---

## 🌐 多語言支援

### 支援語系
- 繁體中文 (zh-TW) - 預設
- 英文 (en)

### 語言資源
- `src/locales/zh-TW.json` - 繁體中文翻譯
- `src/locales/en-US.json` - 英文翻譯

### 語言切換
- 自動偵測：querystring → localStorage → navigator → htmlTag
- 手動切換：使用 `i18n.changeLanguage()`

---

## 🔌 API 整合

### Supabase
- **URL**: 透過 `VITE_SUPABASE_URL` 環境變數
- **Edge Functions**:
  - `/functions/v1/auto-summary` - AI 摘要功能
- **認證**: 使用 `VITE_SUPABASE_ANON_KEY`

### 環境變數
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUMMARY_FUNCTION_URL=
```

---

## 📦 主要依賴套件

### 核心框架
- `react` (18.2.0) - UI 框架
- `react-router-dom` (6.20.1) - 路由管理
- `typescript` (5.2.2) - 類型系統

### UI 與樣式
- `tailwindcss` (4.1.13) - CSS 框架
- `framer-motion` (12.23.22) - 動畫
- `lucide-react` (0.544.0) - 圖示
- `@radix-ui/*` - UI 元件庫

### 功能增強
- `i18next` (25.6.0) + `react-i18next` (16.2.3) - 多語言
- `react-helmet-async` (2.0.5) - SEO
- `react-hot-toast` (2.6.0) - 通知
- `zustand` (5.0.8) - 狀態管理
- `@supabase/supabase-js` (2.58.0) - 後端服務

### 行動裝置
- `@capacitor/core` (5.7.8) - 跨平台框架
- `@capacitor/android` (5.7.8) - Android 支援
- `@capacitor-community/admob` (7.0.3) - 廣告

---

## 🎨 設計系統

### 佈局
- **最大寬度**: `max-w-screen-md` (768px)
- **響應式**: 手機優先設計
- **主要佈局**: `MainLayout` 元件

### 顏色系統
- 使用 Tailwind CSS 預設顏色
- 卡片樣式：白色背景 + 陰影
- Hover 效果：邊框變色 + 陰影增強

### 元件樣式
- 卡片：`rounded-2xl shadow-md`
- 按鈕：漸層背景 + hover 效果
- 標籤：圓角徽章樣式

---

## 🚀 建置與部署

### 開發
```bash
npm run dev          # 啟動開發伺服器
npm run lint         # 程式碼檢查
```

### 建置
```bash
npm run build        # 建置生產版本
npm run preview      # 預覽建置結果
```

### 自動化腳本
- `generate-sitemap` - 生成網站地圖
- `generate-rss` - 生成 RSS Feed
- `i18n:scan` - 掃描翻譯 key

### 部署
- **平台**: Vercel
- **自動部署**: 推送到 GitHub main 分支
- **建置命令**: `npm run vercel-build`

---

## 📊 功能模組

### 1. 番茄鐘模組
- 計時功能（25 分鐘專注 + 5 分鐘休息）
- 任務管理
- 統計分析

### 2. 待辦清單模組
- 新增/完成任務
- 分類管理
- 進度追蹤

### 3. 唸經計數模組
- 計數功能
- 集氣願望
- 排行榜與統計

### 4. AI 摘要模組
- 文章摘要
- 關鍵字提取
- 多語言支援

### 5. 內容管理模組
- 文章系統（30+ 篇）
- 分類管理（健康、理財、補助等）
- SEO 優化

### 6. 群組功能模組
- 群組建立與管理
- 採買清單
- 任務分配

---

## 🔐 安全性

### 環境變數
- 敏感資訊存放在環境變數中
- Vercel 環境變數設定

### API 認證
- Supabase Edge Functions 使用 Bearer Token
- 環境變數驗證

---

## 📈 SEO 優化

### 實作方式
- `react-helmet-async` 動態設定 meta tags
- 自動生成 sitemap.xml
- 自動生成 RSS feed
- 結構化資料

### 內容策略
- 每週更新文章
- 多語言內容（中英文）
- 分類明確的文章結構

---

## 📝 備註

### 檔案命名規範
- 頁面元件：PascalCase（如 `PomodoroPage.tsx`）
- 工具函數：camelCase（如 `useSummary.ts`）
- 路由檔案：小寫 + 連字號（如 `language-guide.tsx`）

### 程式碼組織
- 頁面元件放在 `src/pages/`
- 共用元件放在 `src/components/`
- 業務邏輯放在 `src/services/`
- 工具函數放在 `src/utils/`

---

**最後更新**: 2025-01-15  
**維護者**: 專案團隊




