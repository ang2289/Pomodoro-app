## 專案說明

本專案為番茄鐘應用程式（Pomodoro App）。開發與提交請務必遵循專案規範。

### 開發規範

- 請先閱讀並遵循 `project.md` 之規範（程式風格、檔案結構、提交流程、命名等）。
- 若規範與個別檔案有衝突，一律以 `project.md` 為準。

### 本地開發

1. 安裝依賴：
   ```bash
   npm install
   ```
2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

### 其他

- 任何新元件、樣式或重構，請在送審 PR 前對照 `project.md` 的核對清單。

# 番茄鐘應用程式

一個使用 Vite + React + TypeScript 建立的番茄鐘應用程式，支援 Capacitor Android 打包。

## 功能特色

- 🍅 番茄鐘計時器（25分鐘工作 + 5分鐘休息）
- 📝 待辦清單管理
- 📱 支援 Android 打包
- 🎨 現代化 UI 設計
- 📱 固定底部導航
- 📢 廣告區域（可自訂）

## 技術棧

- **前端框架**: React 18 + TypeScript
- **建構工具**: Vite
- **路由**: React Router v6
- **行動端**: Capacitor
- **樣式**: CSS3

## 開發環境設定

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

### 建構專案

```bash
npm run build
```

## Android 打包

### 同步專案到 Android

```bash
npm run cap:add:android
```

### 建構並同步

```bash
npm run build
npx cap sync android
```

### 在 Android Studio 中開啟

```bash
npx cap open android
```

### 直接執行到 Android 裝置

```bash
npm run cap:run:android
```

## 專案結構

```
src/
├── components/          # 共用組件
│   ├── BottomNavigation.tsx
│   └── AdBanner.tsx
├── pages/              # 頁面組件
│   ├── HomePage.tsx
│   ├── PomodoroPage.tsx
│   └── TodoPage.tsx
├── App.tsx             # 主應用程式組件
├── main.tsx            # 應用程式入口
└── index.css           # 全域樣式
```

## 頁面說明

### 首頁 (HomePage)
- 應用程式主畫面
- 提供功能選擇（番茄鐘或待辦清單）

### 番茄鐘頁面 (PomodoroPage)
- 25分鐘工作計時器
- 5分鐘休息計時器
- 開始/暫停/重置功能
- 自動切換工作/休息模式

### 待辦清單頁面 (TodoPage)
- 新增/刪除待辦事項
- 標記完成狀態
- 顯示完成進度

## 自訂設定

### 修改番茄鐘時間
在 `src/pages/PomodoroPage.tsx` 中修改：
- 工作時間：`25 * 60` (25分鐘)
- 休息時間：`5 * 60` (5分鐘)

### 自訂廣告區域
在 `src/components/AdBanner.tsx` 中修改廣告內容。

## 授權

MIT License

