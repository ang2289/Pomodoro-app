
# Pomodoro App 專案規範

> 本文件說明本 App 專案的功能模組、畫面規範、樣式一致性與不實作的部分，供 Cursor 與開發者遵循。

---

## 📱 App 模組功能列表

### ✅ 主畫面（HomePage.tsx）
- 四大功能入口卡片：
  - 番茄鐘 Pomodoro
  - 待辦清單 Todo
  - 念經計數 ChantCounter
  - 設定中心 Settings
- 每張卡片為深藍卡片樣式（使用 `.card` 類別）

---

### 🍅 番茄鐘（PomodoroPage.tsx）
- 功能：
  - 專注計時（開始、暫停、重置）
  - 任務選取（以圓點顏色代表不同任務）
  - 設定時間（專注／休息）
  - 統計分析（專注次數與任務比例）
- UI：
  - 所有按鈕改用 IconButton（src/components/ui/IconButton.tsx）
  - 專案選單圓點僅顯示顏色（不可點選）

---

### ✅ 專注任務管理（FocusProjectsPage.tsx）
- 功能：
  - 新增／刪除任務
  - 指定顏色圓點（預設色系：藍／綠／紅／黃／橘／紫）
  - 記錄使用次數
- UI：任務列用 `.record-card` 類別呈現

---

### 📋 待辦清單（TodoPage.tsx）
- 功能：
  - 新增／完成待辦事項
  - 無同步 Google 日曆（已移除）
- UI：
  - 使用 `.record-card` 類別

---

### 🙏 念經計數（ChantCounter.tsx）
- 功能：
  - 記錄誦念次數
  - 集氣模組（新增、列表、統計）
  - 預設集氣目的：祈福康復／助念超薦／轉運消災
  - 支援多宗教（佛教、基督教、天主教）
- UI：使用 `.record-card` 類別
- 備註：語音輸入暫不實作

---

### ⚙️ 設定頁（SettingsPage.tsx）
- 功能：
  - 去除廣告（按鈕切換）
  - 匯出／匯入 JSON
  - 主題固定為亮色（dark 模式已移除）

---

## 🧡 集氣牆模組（PrayerWallPage.tsx）

### 功能目的
允許使用者建立一則祈願／集氣事項，並邀請他人「幫忙集氣」。

### 功能列表
- 📝 使用者可輸入：
  - 祈願主題（例：「希望手術順利」、「願媽媽身體康復」）
  - 類別（下拉選單：祈福／助念／祝福）
  - 顯示名稱（可選填）
- 🙏 他人可點按「幫忙集氣」按鈕，累積集氣次數
- 🔢 顯示每個祈願的集氣總次數
- 🗂 可選擇按類別篩選祈願事項（例如只看「助念」）
- 📆 時間戳記自動加上（發佈時間）

### 畫面風格
- 每一則祈願卡片採用 `.card` 樣式
- 按鈕使用共用元件 `<Button>`（variant="orange"）
- 集氣次數以小字顯示（灰色文字）

### 注意事項
- 預設為亮色主題設計
- 不需登入也可匿名幫忙集氣
- 無需留言功能（MVP 階段不含留言）

---

## 🎨 UI 樣式規則

### 容器類別
- 最外層頁面容器：`className="page"`
- 資料卡片容器：`className="card"` or `record-card`
- 標題標準格式：`<h1 className="text-xl font-bold">` 樣式

### 按鈕
- 所有按鈕使用共用元件 `IconButton.tsx`
- 支援 icon、hover 效果、橘色與藍色兩款

### 主題
- 固定使用亮色主題（不再提供暗色切換）

---

## ❌ 暫不實作項目
- ❌ 同步到 Google Calendar
- ❌ 念經語音輸入／語音播報
- ❌ 多人帳號系統
- ❌ 自訂背景主題

---

## 📁 檔案放置結構（src 下）
- `pages/`：各畫面主頁（如 PomodoroPage.tsx、TodoPage.tsx）
- `components/`：各共用元件
  - `ui/`：共用 UI 元件（Button.tsx、IconButton.tsx、card.tsx...）
  - `Pomodoro/`：番茄鐘專屬元件（如 CountdownReminder.tsx）

---

> 📁 本檔案請放於根目錄 `/project.md`，Cursor 開發過程務必參考本規範。
