# 訪客點數管理工具使用說明

## 📋 概述

`guestCredits` 工具用於管理訪客試用點數，使用 localStorage 儲存，提供完整的點數檢查、扣點和過期管理功能。

## 🔧 API 方法

### `getGuestRemaining()`

取得訪客剩餘點數。

**回傳值：** `number` - 剩餘點數（若試用已過期則回傳 0）

**範例：**
```typescript
import { getGuestRemaining } from '@/utils/guestCredits'

const remaining = getGuestRemaining()
console.log(`剩餘點數：${remaining} 字`)
```

---

### `canGuestUse(requiredPoints)`

檢查訪客是否可以使用指定點數。

**參數：**
- `requiredPoints: number` - 需要的點數

**回傳值：**
```typescript
{
  allowed: boolean      // 是否可以使用
  reason?: string      // 若不可使用，原因說明
  remaining?: number   // 剩餘點數
}
```

**範例：**
```typescript
import { canGuestUse } from '@/utils/guestCredits'

const inputLength = 1000
const estimatedOutputLength = 500
const requiredPoints = inputLength + estimatedOutputLength

const checkResult = canGuestUse(requiredPoints)

if (!checkResult.allowed) {
  console.error(checkResult.reason) // 顯示錯誤原因
  return
}

// 點數足夠，繼續執行
```

---

### `consumeGuestPoints(points)`

扣除訪客點數。

**參數：**
- `points: number` - 要扣除的點數

**回傳值：**
```typescript
{
  success: boolean     // 是否成功
  remaining?: number   // 扣除後的剩餘點數
  error?: string       // 若失敗，錯誤訊息
}
```

**範例：**
```typescript
import { consumeGuestPoints } from '@/utils/guestCredits'

const inputLength = 1000
const outputLength = 500
const totalPoints = inputLength + outputLength

const result = consumeGuestPoints(totalPoints)

if (!result.success) {
  console.error(result.error) // 顯示錯誤訊息
  return
}

console.log(`扣點成功，剩餘：${result.remaining} 字`)
```

---

## 📝 完整使用範例

### 在摘要功能中使用

```typescript
import { canGuestUse, consumeGuestPoints } from '@/utils/guestCredits'

async function handleSummary() {
  const input = '文章內容...'
  const inputLength = input.length
  
  // 1. 預估輸出字數（可選）
  const estimatedOutputLength = Math.ceil(inputLength * 0.15)
  const estimatedTotalPoints = inputLength + estimatedOutputLength
  
  // 2. 檢查點數是否足夠
  const checkResult = canGuestUse(estimatedTotalPoints)
  
  if (!checkResult.allowed) {
    // 顯示錯誤訊息
    setError(checkResult.reason || '點數不足')
    return
  }
  
  // 3. 呼叫 API
  const response = await fetch('/api/summary', {
    method: 'POST',
    body: JSON.stringify({ content: input }),
  })
  
  const data = await response.json()
  const summaryText = data.summary
  
  // 4. 計算實際使用點數
  const actualOutputLength = summaryText.length
  const actualTotalPoints = inputLength + actualOutputLength
  
  // 5. 扣除點數
  const consumeResult = consumeGuestPoints(actualTotalPoints)
  
  if (!consumeResult.success) {
    console.error('扣點失敗：', consumeResult.error)
    // 處理扣點失敗的情況
  }
  
  console.log(`扣點成功，剩餘：${consumeResult.remaining} 字`)
}
```

---

## 🔍 其他工具方法

### `getGuestCreditsInfo()`

取得訪客點數詳細資訊（用於除錯或顯示）。

**回傳值：**
```typescript
{
  total: number           // 總額
  used: number           // 已使用
  remaining: number       // 剩餘
  startAt: number | null // 開始時間（timestamp）
  daysRemaining: number | null // 剩餘天數
  isExpired: boolean      // 是否已過期
}
```

**範例：**
```typescript
import { getGuestCreditsInfo } from '@/utils/guestCredits'

const info = getGuestCreditsInfo()
console.log('點數資訊：', info)
```

---

### `resetGuestCredits()`

重置訪客點數（用於測試或管理）。

**範例：**
```typescript
import { resetGuestCredits } from '@/utils/guestCredits'

// 重置點數（僅用於測試）
resetGuestCredits()
```

---

## 📊 資料結構

### localStorage 鍵值

- `guest_total`: 總額（預設 10000）
- `guest_used`: 已使用點數（預設 0）
- `guest_start_at`: 開始時間（timestamp，預設現在時間）

### 規則

1. **初次使用：**
   - 自動初始化所有值
   - `guest_total = 10000`
   - `guest_used = 0`
   - `guest_start_at = 現在時間`

2. **過期檢查：**
   - 每次呼叫 `getGuestRemaining()`、`canGuestUse()` 或 `consumeGuestPoints()` 時自動檢查
   - 若 `現在時間 - guest_start_at > 7 天`，清空所有資料並回傳錯誤

3. **扣點規則：**
   - `guest_used += 使用字數`
   - 若 `guest_used > guest_total`，阻止使用並回傳錯誤

---

## ⚠️ 注意事項

1. **僅在瀏覽器環境中可用**
   - 所有方法在 SSR 環境中會回傳預設值或錯誤

2. **自動初始化**
   - 首次呼叫任何方法時會自動初始化點數

3. **過期自動清理**
   - 超過 7 天後會自動清空所有資料

4. **事件通知**
   - 扣點成功後會觸發 `localStorageUpdate` 事件，其他組件可以監聽此事件來更新 UI

---

## 🔄 與現有系統整合

### 在 summary 頁面中使用

```typescript
import { canGuestUse, consumeGuestPoints } from '@/utils/guestCredits'

// 檢查點數
const checkResult = canGuestUse(input.length)
if (!checkResult.allowed) {
  setError(checkResult.reason)
  return
}

// API 成功後扣點
const result = consumeGuestPoints(input.length + output.length)
if (!result.success) {
  console.error(result.error)
}
```

---

## 🧪 測試範例

```typescript
import { 
  getGuestRemaining, 
  canGuestUse, 
  consumeGuestPoints,
  resetGuestCredits 
} from '@/utils/guestCredits'

// 重置點數（測試用）
resetGuestCredits()

// 檢查剩餘點數
console.log('剩餘點數：', getGuestRemaining()) // 10000

// 檢查是否可以使用 5000 字
const check = canGuestUse(5000)
console.log(check) // { allowed: true, remaining: 10000 }

// 扣除 5000 字
const consume = consumeGuestPoints(5000)
console.log(consume) // { success: true, remaining: 5000 }

// 再次檢查剩餘點數
console.log('剩餘點數：', getGuestRemaining()) // 5000
```

