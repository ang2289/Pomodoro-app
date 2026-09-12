# 番茄鐘 CSV 匯出功能修復說明

## 問題描述
番茄鐘匯出 CSV 時，專注項目欄位顯示「未選擇」，即使有選擇專注項目也無法正確顯示專注項目名稱。

## 問題分析
經過檢查發現問題的根本原因：

1. **記錄創建時的問題**：在 `PomodoroPage.tsx` 中創建新記錄時，只設置了 `focusItemId`，但沒有設置 `focusItemName`
2. **CSV 匯出邏輯問題**：`csvExportService.ts` 依賴於 `record.focusItemName` 欄位來顯示專注項目名稱，但該欄位為空

## 修復方案

### 1. 更新 CSV 匯出服務
- 修改 `exportPomodoroRecordsToCSV` 函數簽名，接收 `focusItems` 參數
- 添加 `getFocusItemName` 輔助函數，根據 `focusItemId` 查找對應的專注項目名稱
- 更新 CSV 行生成邏輯，使用 `focusItemId` 而不是 `focusItemName`

### 2. 更新函數調用
- 修改 `PomodoroPage.tsx` 中的匯出函數調用，傳入 `focusItems` 參數

## 修復內容

### csvExportService.ts 的修改

```typescript
// 新增輔助函數
const getFocusItemName = (focusItemId: string | undefined, focusItems: FocusItem[]): string => {
  if (!focusItemId) {
    return '未選擇'
  }
  
  const focusItem = focusItems.find(item => item.id === focusItemId)
  return focusItem ? focusItem.name : '未知項目'
}

// 修改函數簽名
export const exportPomodoroRecordsToCSV = (records: PomodoroRecord[], focusItems: FocusItem[]): void => {
  // ...
  
  // 修改格式化函數
  const formatFocusItem = (focusItemId: string | undefined) => {
    const displayName = getFocusItemName(focusItemId, focusItems)
    return displayName.padEnd(10, ' ')
  }
  
  // 修改 CSV 行生成
  return [
    formatFocusItem(record.focusItemId), // 使用 focusItemId 而不是 focusItemName
    formatDateTime(startTime),
    formatDateTime(completedAt),
    formatNumber(record.workMinutes),
    ' 是 ',
    formatNumber(record.workMinutes),
    formatNumber(record.breakMinutes)
  ]
}
```

### PomodoroPage.tsx 的修改

```typescript
// 修改匯出函數調用
await exportPomodoroRecordsToCSV(records, focusItems);
```

## 修復結果

現在 CSV 匯出功能會：

1. **正確顯示專注項目名稱**：根據 `focusItemId` 查找對應的專注項目名稱
2. **處理邊界情況**：
   - 如果 `focusItemId` 為空，顯示「未選擇」
   - 如果找不到對應的專注項目，顯示「未知項目」
3. **保持原有格式**：維持 CSV 的格式化和編碼設定

## 測試建議

1. **創建測試記錄**：
   - 選擇不同的專注項目完成番茄鐘
   - 創建多個記錄

2. **測試 CSV 匯出**：
   - 點擊匯出按鈕
   - 檢查生成的 CSV 文件
   - 確認專注項目欄位顯示正確的名稱

3. **測試邊界情況**：
   - 測試沒有專注項目的記錄
   - 測試已刪除專注項目的記錄

## 技術細節

### 數據流程
1. 用戶完成番茄鐘 → 創建記錄（包含 `focusItemId`）
2. 用戶點擊匯出 → 調用 `exportPomodoroRecordsToCSV(records, focusItems)`
3. 服務根據 `focusItemId` 在 `focusItems` 中查找對應名稱
4. 生成包含正確專注項目名稱的 CSV

### 優勢
- **數據一致性**：不需要在記錄中重複存儲專注項目名稱
- **維護性**：專注項目名稱變更時，歷史記錄會自動反映新名稱
- **擴展性**：可以輕鬆添加其他需要查找的關聯數據

現在 CSV 匯出功能應該能正確顯示專注項目名稱了！
