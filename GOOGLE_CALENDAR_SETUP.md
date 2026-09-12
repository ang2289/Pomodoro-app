# Google 日曆同步功能設定說明

## 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google Calendar API

## 2. 設定 OAuth 同意畫面

1. 在 Google Cloud Console 中，前往「OAuth 同意畫面」
2. 選擇「外部」用戶類型（除非您有 Google Workspace）
3. 填寫應用程式資訊：
   - 應用程式名稱：Pomodoro App
   - 使用者支援電子郵件：您的電子郵件
   - 開發人員聯絡資訊：您的電子郵件
4. 在「範圍」頁面，添加 `https://www.googleapis.com/auth/calendar.events`
5. 在「測試使用者」頁面，添加您的 Google 帳號（測試階段）

## 3. 建立 OAuth 2.0 憑證

1. 在 Google Cloud Console 中，前往「憑證」頁面
2. 點擊「建立憑證」>「OAuth 2.0 用戶端 ID」
3. 應用程式類型選擇「網頁應用程式」
4. 在「已授權的 JavaScript 來源」中添加：
   - `http://localhost:3000` (開發環境)
   - `http://localhost:3001`, `http://localhost:3002` 等（如果端口被佔用）
   - 您的生產環境網址
5. 在「已授權的重新導向 URI」中添加：
   - `http://localhost:3000` (開發環境)
   - `http://localhost:3001` (如果 3000 被佔用)
   - 您的生產環境網址

## 4. 建立 API 金鑰

1. 在「憑證」頁面中，點擊「建立憑證」>「API 金鑰」
2. 複製 API 金鑰

## 5. 設定環境變數

在專案根目錄建立 `.env` 檔案：

```env
VITE_GOOGLE_API_KEY=你的_Google_API_金鑰
VITE_GOOGLE_CALENDAR_CLIENT_ID=你的_Google_Calendar_Client_ID
```

## 6. 功能說明

- 使用者可以選擇是否將任務同步到 Google 日曆
- 同步的內容包括：
  - 任務名稱 → 日曆事件標題
  - 開始/結束時間 → Google 事件時間
  - 任務分類、優先級、狀態 → 事件描述
- 需要 Google 帳號登入才能使用同步功能
- 未登入時，任務仍會儲存在本地資料中

## 7. 重要注意事項

- **OAuth 同意畫面必須設定**：否則會出現「此應用程式未驗證」錯誤
- **已授權的 JavaScript 來源**：必須包含您的網域，否則會被拒絕授權
- **測試使用者**：在開發階段，必須將您的 Google 帳號加入測試使用者清單
- **環境變數前綴**：必須使用 `VITE_` 前綴，Vite 才會將變數注入前端程式
- **檔案位置**：`.env` 檔案必須放在專案根目錄（與 `vite.config.ts` 同層）
- **API 金鑰安全**：請妥善保管，不要提交到版本控制系統
- **生產環境**：請使用 HTTPS 網址
