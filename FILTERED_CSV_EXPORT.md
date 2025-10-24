# 番茄鐘過濾條件 CSV 匯出功能說明

## 功能概述

現在番茄鐘的 CSV 匯出功能已經升級，支援根據搜尋過濾條件匯出資料，並且在無資料時會顯示「0筆」的提示。

## 新功能特點

### 1. 智能匯出邏輯
- **有搜尋條件時**：匯出符合搜尋條件的記錄
- **無搜尋條件時**：匯出所有記錄
- **無資料時**：生成包含「0筆」提示的 CSV 文件

### 2. 檔案名智能命名
- **一般匯出**：`Pomodoro_Log_2024-01-15.csv`
- **搜尋匯出**：`Pomodoro_Log_2024-01-15_搜尋_讀書.csv`
- **無資料匯出**：`Pomodoro_Log_2024-01-15_無資料.csv`

### 3. 無資料處理
當搜尋結果為 0 筆時，會生成包含以下內容的 CSV：
```csv
狀態,說明,記錄筆數
無資料,"搜尋條件：「讀書」無符合條件的資料 (0筆)",0
```

## 使用方式

### 1. 匯出所有記錄
1. 確保沒有進行搜尋（搜尋框為空）
2. 點擊「匯出」按鈕
3. 系統會匯出所有記錄

### 2. 匯出搜尋結果
1. 在搜尋框中輸入關鍵字（如「讀書」）
2. 選擇搜尋欄位和日期範圍
3. 點擊「搜尋」按鈕
4. 點擊「匯出」按鈕
5. 系統會匯出符合搜尋條件的記錄

### 3. 無資料匯出
1. 進行搜尋但沒有找到符合條件的記錄
2. 點擊「匯出」按鈕
3. 系統會生成包含「0筆」提示的 CSV 文件

## 技術實現

### CSV 匯出服務更新

```typescript
// 新的函數簽名
export const exportPomodoroRecordsToCSV = (
  records: PomodoroRecord[], 
  focusItems: FocusItem[], 
  isSearchActive: boolean = false, 
  searchKeyword: string = ''
): void => {
  // 處理無資料情況
  if (records.length === 0) {
    const noDataMessage = isSearchActive && searchKeyword 
      ? `搜尋條件：「${searchKeyword}」無符合條件的資料 (0筆)`
      : '無資料可匯出 (0筆)'
    
    // 生成無資料 CSV
    const csvContent = [
      '"狀態","說明","記錄筆數"',
      `"無資料","${noDataMessage}","0"`
    ].join('\n')
    
    // 下載無資料 CSV
    // ...
    return
  }
  
  // 正常記錄匯出邏輯
  // ...
}
```

### 檔案名生成邏輯

```typescript
let fileName = `Pomodoro_Log_${year}-${month}-${day}`
if (isSearchActive && searchKeyword) {
  // 清理搜尋關鍵字，移除特殊字符以適合檔案名
  const cleanKeyword = searchKeyword.replace(/[<>:"/\\|?*]/g, '_').substring(0, 20)
  fileName += `_搜尋_${cleanKeyword}`
}
fileName += `.csv`
```

### PomodoroPage 匯出邏輯

```typescript
const handleExportRecords = async () => {
  // 決定要匯出的記錄
  const recordsToExport = isSearchActive ? filteredRecords : records;
  
  // 調用匯出函數
  await exportPomodoroRecordsToCSV(recordsToExport, focusItems, isSearchActive, searchKeyword);
  
  // 顯示相應的成功訊息
  const successMessage = isSearchActive 
    ? `已匯出 ${recordCount} 筆搜尋結果${searchKeyword ? ` (關鍵字: "${searchKeyword}")` : ''}`
    : `已匯出 ${recordCount} 筆記錄`;
}
```

## 使用場景範例

### 場景 1：匯出所有記錄
- 搜尋框：空
- 結果：匯出所有記錄
- 檔案名：`Pomodoro_Log_2024-01-15.csv`

### 場景 2：匯出「讀書」相關記錄
- 搜尋框：輸入「讀書」
- 結果：匯出包含「讀書」的記錄
- 檔案名：`Pomodoro_Log_2024-01-15_搜尋_讀書.csv`

### 場景 3：搜尋無結果
- 搜尋框：輸入「不存在」
- 結果：生成無資料 CSV
- 檔案名：`Pomodoro_Log_2024-01-15_無資料.csv`
- 內容：顯示「搜尋條件：『不存在』無符合條件的資料 (0筆)」

## 用戶體驗改善

### 1. 智能提示
- 匯出成功時會顯示匯出的記錄數量
- 搜尋匯出時會顯示搜尋關鍵字
- 無資料時會明確提示「0筆」

### 2. 檔案管理
- 檔案名包含日期和搜尋條件，便於管理
- 無資料檔案有特殊標識，避免混淆

### 3. 操作一致性
- 無論是否有資料，都能成功匯出
- 保持與搜尋功能的緊密整合

現在您可以根據需要匯出所有記錄或特定條件的記錄，即使沒有符合條件的資料也能獲得明確的「0筆」提示！
