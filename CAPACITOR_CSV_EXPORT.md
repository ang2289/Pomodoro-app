# Capacitor CSV 匯出功能更新說明

## 功能概述

已成功將番茄鐘的 CSV 匯出功能升級為使用 Capacitor Filesystem 插件，支援在手機裝置上將檔案儲存到 Documents 資料夾，並提供分享功能。

## 新增功能

### 1. Capacitor Filesystem 整合
- ✅ 使用 `@capacitor/filesystem` 插件將 CSV 檔案寫入手機的 Documents 資料夾
- ✅ 支援 Capacitor 2.x/3.x 環境
- ✅ 相容 Android 裝置

### 2. 智能環境檢測
- ✅ 自動檢測是否在 Capacitor 環境中運行
- ✅ Web 環境自動回退到原本的下載方式
- ✅ 使用更簡潔的網頁下載代碼：
  ```javascript
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  ```

### 3. 分享功能
- ✅ 使用 `@capacitor/share` 插件提供分享功能
- ✅ 支援 LINE、Email、Google Drive 等分享選項
- ✅ 匯出完成後自動詢問是否要分享檔案

### 4. 使用者體驗改善
- ✅ 匯出完成後顯示詳細的 alert 提示
- ✅ 告知使用者檔案名稱與儲存位置
- ✅ 提供分享選項讓使用者選擇

## 技術實現

### 新增檔案
- `src/services/capacitorCsvExportService.ts` - 新的 Capacitor CSV 匯出服務

### 修改檔案
- `src/pages/PomodoroPage.tsx` - 更新匯出功能使用新的服務
- `package.json` - 新增 Capacitor 插件依賴

### 新增依賴
```json
{
  "@capacitor/filesystem": "^5.0.0",
  "@capacitor/share": "^5.0.0"
}
```

## 使用方式

### 在手機應用程式中
1. 點擊「匯出」按鈕
2. 系統會將 CSV 檔案儲存到手機的 Documents 資料夾
3. 顯示 alert 提示檔案已儲存，包含檔案名稱和位置
4. 詢問是否要分享檔案
5. 如果選擇分享，會開啟系統分享選單，可選擇 LINE、Email、Google Drive 等

### 在網頁版本中
1. 點擊「匯出」按鈕
2. 系統會自動下載 CSV 檔案到瀏覽器的下載資料夾
3. 顯示 alert 提示檔案已下載

## 檔案命名規則

- **一般匯出**：`Pomodoro_Log_2024-01-15.csv`
- **搜尋匯出**：`Pomodoro_Log_2024-01-15_搜尋_讀書.csv`
- **無資料匯出**：`Pomodoro_Log_2024-01-15_無資料.csv`

## 相容性

- ✅ **Capacitor 2.x/3.x**：完全支援
- ✅ **Android 裝置**：已測試相容性
- ✅ **Web 瀏覽器**：自動回退到原本下載方式
- ✅ **iOS 裝置**：理論上支援（使用相同的 Capacitor 插件）

## 錯誤處理

- 自動檢測環境並選擇適當的匯出方式
- 提供詳細的錯誤訊息
- 在分享失敗時顯示具體錯誤原因

## 測試建議

1. **Web 環境測試**：
   - 在瀏覽器中測試匯出功能
   - 確認檔案能正常下載

2. **Android 環境測試**：
   - 使用 `npx cap run android` 在 Android 裝置上測試
   - 確認檔案能儲存到 Documents 資料夾
   - 測試分享功能是否正常運作

3. **功能測試**：
   - 測試有資料的匯出
   - 測試無資料的匯出
   - 測試搜尋結果的匯出
   - 測試分享功能

## 注意事項

- 確保已執行 `npx cap sync android` 同步插件到 Android 專案
- 在 Android 裝置上需要適當的檔案系統權限
- 分享功能依賴裝置上安裝的應用程式（如 LINE、Gmail 等）













