# 📋 摘要模組工程地圖

**生成日期：** 2024-12-19  
**模組狀態：** ✅ 已穩定（請勿回退）

---

## 📁 檔案清單與責任分工

### 核心檔案（Active）

| 檔案路徑 | 用途 | 狀態 | 關鍵函式/功能 |
|---------|------|------|--------------|
| `src/pages/summary/index.tsx` | 摘要頁面入口，管理所有 state 並傳遞給子元件 | **Used** | `SummaryPage`, state 管理（input, loading, summary, keywords, error） |
| `src/pages/summary/useSummaryAction.ts` | 摘要流程控制 hook，處理保護機制與 API 呼叫流程 | **Used** | `useSummaryAction`, `handleSummary`, `runSummary`, `detectLanguage` |
| `src/pages/summary/SummaryLayout.tsx` | 摘要 UI 顯示元件，只負責狀態顯示 | **Used** | `SummaryLayout`, 狀態列元件, 摘要顯示邏輯 |
| `src/services/summaryService.ts` | 純邏輯服務層，使用 fetch 直接呼叫 Edge Function | **Used** | `callSummaryService` |
| `src/pages/summary/README.md` | 模組說明文件，標示已穩定 | **Used** | 文件說明 |

### 路由檔案

| 檔案路徑 | 用途 | 狀態 | 關鍵路由 |
|---------|------|------|---------|
| `src/App.tsx` | 主路由配置 | **Used** | `/summary` → `SummaryPage` |

### 相關支援檔案

| 檔案路徑 | 用途 | 狀態 | 關鍵函式/功能 |
|---------|------|------|--------------|
| `src/lib/creditService.ts` | 點數服務（已停用，但檔案仍存在） | **Unused** | `consumeCredits`, `getRemainingCredits`, `init_user_credits_if_not_exists` |
| `src/lib/trafficKeywords.ts` | 流量關鍵字處理（使用舊的 invoke 方式） | **Unknown** | `generateTrafficKeywords`, 使用 `supabase.functions.invoke` |
| `src/hooks/useAuth.ts` | 登入狀態管理 | **Used** | `useAuth`, 提供 `user` 狀態 |
| `src/hooks/useAuthCredits.ts` | 點數狀態管理 | **Used** | `useAuthCredits`, 提供 `remainingChars` 狀態 |

### 未使用/舊檔案

| 檔案路徑 | 用途 | 狀態 | 備註 |
|---------|------|------|------|
| `src/hooks/useSummary.ts` | 舊版摘要 hook（使用 invoke） | **Unused** | 使用 `supabase.functions.invoke`，已被 `useSummaryAction` 取代 |
| `api-unused/auto-summary.ts` | Vercel Serverless Function（已停用） | **Unused** | 註解標示已停用 |
| `supabase/functions/summary/index.ts` | Supabase Edge Function（可能已改名） | **Unknown** | 實際使用 `auto-summary`，此檔案可能已過時 |

### 未使用的函式

| 檔案路徑 | 函式名稱 | 狀態 | 備註 |
|---------|---------|------|------|
| `src/pages/summary/useSummaryAction.ts` | `generateKeywordsFromSummary` | **Unused** | 定義但從未被呼叫，關鍵字現在由後端回傳 |

---

## 🔄 目前摘要流程圖（文字版）

```
使用者點擊「一鍵摘要」按鈕
    ↓
SummaryLayout.tsx: onSubmit={handleSummary}
    ↓
index.tsx: handleSummary (來自 useSummaryAction)
    ↓
useSummaryAction.ts: handleSummary()
    ├─ 保護機制檢查
    │  ├─ 輸入長度為 0? → console.log("[SUMMARY][ACTION] skipped") → return
    │  ├─ loading === true? → console.log("[SUMMARY][ACTION] skipped") → return
    │  └─ summary 已存在? → console.log("[SUMMARY][ACTION] skipped") → return
    │
    ├─ setError('')
    ├─ setSummary({ content: '' })
    │
    └─ runSummary()
        ├─ setLoading(true)
        ├─ detectLanguage(input) → 偵測語言
        ├─ console.log("[SUMMARY][ACTION] start")
        │
        ├─ callSummaryService({ content, lang })
        │   └─ summaryService.ts: callSummaryService()
        │       ├─ console.log("[SUMMARY][SERVICE] start")
        │       ├─ fetch(`${supabaseUrl}/functions/v1/auto-summary`, ...)
        │       ├─ console.log("[SUMMARY][SERVICE] status")
        │       ├─ res.text() → console.log("[SUMMARY][SERVICE] rawText")
        │       ├─ JSON.parse() → console.log("[SUMMARY][SERVICE] json")
        │       └─ return json
        │
        ├─ console.log("[SUMMARY][ACTION] received", data)
        ├─ 解析摘要：data?.summary || data?.result || data?.content || ""
        ├─ console.log("[SUMMARY][ACTION] parsed", ...)
        │
        ├─ setState 寫入：
        │   ├─ setSummary({ content: summaryText })
        │   ├─ setKeywords(data.keywords) [如果存在]
        │   ├─ setTrafficKeywords(data.traffic_keywords) [如果存在]
        │   ├─ setTrafficKeywordsReady(true)
        │   └─ setUsageChars(input.length)
        │
        └─ finally: setLoading(false)
            ↓
UI 顯示（SummaryLayout.tsx）：
    ├─ loading === true → 顯示「生成中…」
    ├─ error 有值 → 顯示 error 文字（紅色）
    ├─ summary.content 為空 → 顯示 placeholder
    ├─ summary.content 有內容 → 顯示摘要內容
    └─ !loading && !error && summary.content → 顯示「摘要完成 ✅」
```

---

## ⚠️ 重複/疑似混亂點清單

### 1. 同功能不同檔案重複

| 問題 | 檔案 1 | 檔案 2 | 狀態 |
|------|--------|--------|------|
| 摘要 API 呼叫方式 | `src/services/summaryService.ts` (使用 fetch) | `src/hooks/useSummary.ts` (使用 invoke) | ❌ **衝突** |
| 流量關鍵字 API 呼叫 | `src/lib/trafficKeywords.ts` (使用 invoke) | 應統一使用 fetch | ⚠️ **不一致** |

### 2. 同名函式多份

| 函式名稱 | 位置 1 | 位置 2 | 狀態 |
|---------|--------|--------|------|
| `generateSummary` | `src/hooks/useSummary.ts` | - | ❌ **舊版，未使用** |
| `generateKeywordsFromSummary` | `src/pages/summary/useSummaryAction.ts` | - | ❌ **定義但未使用** |

### 3. 多個 state setter 管同一個資料

| 資料 | Setter 1 | Setter 2 | 狀態 |
|------|----------|----------|------|
| 摘要內容 | `setSummary` (index.tsx) | - | ✅ **正常** |
| 關鍵字 | `setKeywords` (index.tsx) | `setTrafficKeywords` (index.tsx) | ✅ **正常**（不同用途） |

### 4. 未使用但仍存在的舊檔案

| 檔案路徑 | 狀態 | 原因 |
|---------|------|------|
| `src/hooks/useSummary.ts` | ❌ **Unused** | 使用舊的 `invoke` 方式，已被 `useSummaryAction` 取代 |
| `api-unused/auto-summary.ts` | ❌ **Unused** | Vercel Serverless Function，已停用 |
| `src/pages/summary/useSummaryAction.ts` 中的 `generateKeywordsFromSummary` | ❌ **Unused** | 定義但從未被呼叫 |

### 5. 測試模式殘留

| 檔案路徑 | 問題 | 狀態 |
|---------|------|------|
| `src/lib/creditService.ts` | 包含 `TEST_USER_ID = 'test-user'` | ⚠️ **測試模式** |
| `src/pages/summary/index.tsx` | `remainingChars={null}` 硬編碼 | ⚠️ **測試模式** |

---

## 🗑️ 建議刪除/合併候選清單

### 高優先級（建議立即處理）

1. **`src/hooks/useSummary.ts`**
   - **原因：** 使用舊的 `supabase.functions.invoke` 方式，已被 `useSummaryAction` 完全取代
   - **風險：** 低（已確認無其他檔案引用）
   - **動作：** 刪除

2. **`src/pages/summary/useSummaryAction.ts` 中的 `generateKeywordsFromSummary` 函式**
   - **原因：** 定義但從未被呼叫，關鍵字現在由後端回傳
   - **風險：** 低（未使用）
   - **動作：** 刪除函式定義（保留 `detectLanguage`）

### 中優先級（建議評估後處理）

3. **`api-unused/auto-summary.ts`**
   - **原因：** Vercel Serverless Function，已停用且註解標示
   - **風險：** 低（在 `api-unused` 目錄）
   - **動作：** 刪除或移至 `archive` 目錄

4. **`src/lib/trafficKeywords.ts` 中的 `supabase.functions.invoke` 呼叫**
   - **原因：** 與新的 fetch 方式不一致
   - **風險：** 中（可能仍在使用）
   - **動作：** 評估是否改為使用 `callSummaryService` 或獨立服務

### 低優先級（建議保留但標註）

5. **`src/lib/creditService.ts` 中的測試模式代碼**
   - **原因：** 包含 `TEST_USER_ID`，但檔案可能仍被其他功能使用
   - **風險：** 低（不影響摘要功能）
   - **動作：** 標註測試模式，未來統一清理

6. **`supabase/functions/summary/index.ts`**
   - **原因：** 可能已過時（實際使用 `auto-summary`）
   - **風險：** 低（Supabase Edge Function）
   - **動作：** 確認是否仍在使用，若未使用則刪除

---

## 📊 架構總結

### 當前架構（✅ 穩定）

```
UI 層 (SummaryLayout.tsx)
    ↓ 只顯示 state
State 層 (index.tsx)
    ↓ 管理 state，呼叫 hook
流程控制層 (useSummaryAction.ts)
    ↓ 保護機制 + 流程控制
服務層 (summaryService.ts)
    ↓ fetch 呼叫 Edge Function
Edge Function (auto-summary)
    ↓ 回傳 JSON
```

### 關鍵原則

1. ✅ **UI 層不碰資料來源** - SummaryLayout 只顯示 state
2. ✅ **使用 fetch 而非 invoke** - 所有 API 呼叫統一使用 `callSummaryService`
3. ✅ **保護機制完整** - 避免重複呼叫、覆蓋
4. ✅ **狀態管理清晰** - 單一來源，明確職責

---

**最後更新：** 2024-12-19  
**維護者注意：** 此模組已穩定，請勿回退使用 `invoke` 方式
