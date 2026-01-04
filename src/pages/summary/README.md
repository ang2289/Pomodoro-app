# Summary 模組：已穩定 ✅

## ⚠️ 重要：此模組已完成重構，請勿回退

**問題排除完成日期：** 2024-12-19

## 架構說明

### 資料來源
- **Supabase Edge Function**: `auto-summary`

### 呼叫方式
- **使用 `fetch`**（非 `supabase.functions.invoke`）
- 服務層：`src/services/summaryService.ts`
- 流程控制：`src/pages/summary/useSummaryAction.ts`
- UI 顯示：`src/pages/summary/SummaryLayout.tsx`

### 關鍵規則
- ❌ **禁止回退使用 `invoke`**
- ✅ **必須使用 `fetch` 直接呼叫 Edge Function**
- ✅ **UI 層只做狀態顯示，不碰資料來源**
- ✅ **已加入保護機制（避免重複呼叫、覆蓋）**

## 檔案結構

```
src/
├── services/
│   └── summaryService.ts        # 純邏輯服務層（fetch 呼叫）
├── pages/
│   └── summary/
│       ├── useSummaryAction.ts  # 流程控制
│       ├── SummaryLayout.tsx    # UI 顯示
│       └── index.tsx            # 頁面入口
```

## 注意事項

- 此模組已通過完整測試
- 所有 fetch 邏輯集中在 `summaryService.ts`
- UI 層完全依賴 state，不包含任何資料解析
- 請勿修改核心架構，僅可調整 UI 樣式

---

**給未來的你：這段程式碼已經穩定運作，請不要再動核心邏輯。**
