# 番茄鐘計時邏輯修正說明

## 📅 更新日期
2025年9月30日

## 🎯 修正目標

修正番茄鐘計時邏輯，讓使用者在 UI 上設定的工作時間與休息時間可以正確套用。

## ❌ 原有問題

### 1. **預設時間寫死**
```tsx
// 問題：寫死 25 分鐘和 5 分鐘
const [workMinutes, setWorkMinutes] = useState(25);
const [breakMinutes, setBreakMinutes] = useState(5);
const [timeLeft, setTimeLeft] = useState(25 * 60);
```

### 2. **設定變更無法正確套用**
```tsx
// 問題：條件太嚴格，只有當 timeLeft === workMinutes * 60 時才更新
useEffect(() => {
  if (!isRunning && !isBreak && timeLeft === workMinutes * 60) {
    setTimeLeft(workMinutes * 60);
  }
}, [workMinutes]);
```

這個邏輯有問題：
- 如果使用者修改了 `workMinutes`，但 `timeLeft` 不等於舊的 `workMinutes * 60`，就不會更新
- 例如：使用者設定 30 分鐘，計時器會停留在 25:00 而不是更新為 30:00

### 3. **沒有持久化儲存**
- 使用者設定的時間在重新整理後會恢復為預設值

## ✅ 修正方案

### 1. **從 localStorage 讀取預設值**
```tsx
// 讀取儲存的工作時間，沒有則預設 25 分鐘
const getInitialWorkMinutes = () => {
  const saved = localStorage.getItem('pomodoroWorkMinutes');
  return saved ? parseInt(saved, 10) : 25;
};

// 讀取儲存的休息時間，沒有則預設 5 分鐘
const getInitialBreakMinutes = () => {
  const saved = localStorage.getItem('pomodoroBreakMinutes');
  return saved ? parseInt(saved, 10) : 5;
};

const [workMinutes, setWorkMinutes] = useState(getInitialWorkMinutes);
const [breakMinutes, setBreakMinutes] = useState(getInitialBreakMinutes);
const [timeLeft, setTimeLeft] = useState(getInitialWorkMinutes() * 60);
```

### 2. **正確更新計時器時間**
```tsx
// 當工作時間設定改變時，更新計時器（僅在非運行狀態且非休息狀態）
useEffect(() => {
  if (!isRunning && !isBreak) {
    setTimeLeft(workMinutes * 60);
    // 儲存到 localStorage
    localStorage.setItem('pomodoroWorkMinutes', workMinutes.toString());
  }
}, [workMinutes]);

// 當休息時間設定改變時，儲存到 localStorage
useEffect(() => {
  localStorage.setItem('pomodoroBreakMinutes', breakMinutes.toString());
}, [breakMinutes]);
```

### 3. **儲存設定到 localStorage**
- 工作時間變更時自動儲存
- 休息時間變更時自動儲存
- 重新整理後保留使用者設定

## 🔄 運作流程

### 初始載入
1. 從 localStorage 讀取 `pomodoroWorkMinutes`（沒有則使用 25）
2. 從 localStorage 讀取 `pomodoroBreakMinutes`（沒有則使用 5）
3. 設定計時器初始時間為工作時間

### 使用者修改工作時間
1. 點擊 ➕ 或 ➖ 按鈕，或直接輸入數字
2. `workMinutes` 狀態更新
3. useEffect 監聽到變化：
   - 檢查計時器是否在運行（`!isRunning`）
   - 檢查是否在休息狀態（`!isBreak`）
   - 如果都不是，則更新 `timeLeft = workMinutes * 60`
   - 同時儲存到 localStorage

### 使用者修改休息時間
1. 點擊 ➕ 或 ➖ 按鈕，或直接輸入數字
2. `breakMinutes` 狀態更新
3. useEffect 監聽到變化，儲存到 localStorage

### 開始計時
1. 使用者點擊「開始」按鈕
2. `setIsRunning(true)`
3. 計時器開始倒數，每秒減少 1 秒
4. 防止螢幕休眠功能啟動

### 計時結束
1. 工作時間結束 → 切換到休息時間（`timeLeft = breakMinutes * 60`）
2. 休息時間結束 → 切換到工作時間（`timeLeft = workMinutes * 60`）

## 📋 測試場景

### ✅ 場景 1：修改工作時間（計時器停止時）
1. 打開番茄鐘頁面
2. 將工作時間從 25 改為 30
3. **預期結果**：計時器顯示 30:00

### ✅ 場景 2：修改工作時間（計時器運行中）
1. 開始計時
2. 嘗試修改工作時間
3. **預期結果**：按鈕被禁用，無法修改

### ✅ 場景 3：重新整理後保留設定
1. 將工作時間改為 35，休息時間改為 10
2. 重新整理頁面
3. **預期結果**：工作時間顯示 35，休息時間顯示 10

### ✅ 場景 4：完成工作時段後進入休息
1. 設定工作時間 1 分鐘，休息時間 1 分鐘
2. 開始計時並等待工作時間結束
3. **預期結果**：自動進入休息時間，顯示 01:00

### ✅ 場景 5：休息時間為 0
1. 設定工作時間 1 分鐘，休息時間 0 分鐘
2. 開始計時並等待工作時間結束
3. **預期結果**：直接重置到下一輪工作時間，計時器停止

## 🔧 localStorage 鍵值

| 鍵名 | 說明 | 預設值 |
|------|------|--------|
| `pomodoroWorkMinutes` | 工作時間（分鐘） | 25 |
| `pomodoroBreakMinutes` | 休息時間（分鐘） | 5 |

## 🎨 UI 行為

### 計時器停止時
- ✅ 可以修改工作時間和休息時間
- ✅ 修改工作時間會立即更新計時器顯示
- ✅ 修改休息時間不會影響當前計時器顯示（只在進入休息時生效）

### 計時器運行中
- ❌ 無法修改工作時間（按鈕禁用）
- ❌ 無法修改休息時間（按鈕禁用）
- ✅ 可以暫停計時器
- ✅ 可以提早結束當前階段

## 📱 相容性

- ✅ 瀏覽器：支援所有現代瀏覽器（需支援 localStorage）
- ✅ 行動裝置：完全支援
- ✅ 離線使用：完全支援（設定儲存在本地）

## 🚀 未來可優化項目

1. **更多時間預設選項**
   - 提供快速選擇：25/5、30/10、45/15
   - 自訂時間預設組合

2. **歷史記錄統計**
   - 記錄每次完成的實際時間
   - 統計平均專注時間

3. **時間提醒設定**
   - 快結束前 N 分鐘提醒
   - 自訂提醒音效

4. **番茄鐘循環設定**
   - 設定完成 N 個番茄鐘後長休息
   - 自動循環模式


















