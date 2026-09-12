# 番茄鐘搜尋功能修復說明

## 問題描述
原本的番茄鐘搜尋功能存在問題：搜尋「讀書」時沒有正確過濾條件，顯示了所有資料而不是符合條件的記錄。

## 修復內容

### 1. 添加搜尋狀態管理
- 新增 `filteredRecords` 狀態來存儲過濾後的記錄
- 新增 `isSearchActive` 狀態來追蹤搜尋是否處於活動狀態

### 2. 實現真正的搜尋邏輯
- **關鍵字搜尋**：支援搜尋專注項目名稱、描述內容、完成時間
- **多欄位搜尋**：可以選擇在哪些欄位中搜尋（專注項目、描述、時間）
- **日期範圍過濾**：支援按開始日期和結束日期過濾記錄
- **搜尋歷史**：自動保存搜尋關鍵字歷史，方便重複使用

### 3. 更新記錄顯示
- RecordsList 組件現在會顯示過濾後的記錄
- 添加搜尋結果統計信息（顯示找到多少筆記錄）
- 搜尋活動時會顯示當前搜尋關鍵字

### 4. 智能更新機制
- 當記錄被添加、編輯或刪除時，如果搜尋處於活動狀態，會自動重新執行搜尋
- 確保搜尋結果始終與最新的記錄數據保持同步

## 搜尋功能特點

### 關鍵字搜尋
- 支援中文搜尋
- 不區分大小寫
- 可以在專注項目名稱、描述內容、完成時間中搜尋

### 搜尋範圍選擇
- 專注項目：在專注項目名稱中搜尋
- 描述內容：在記錄描述中搜尋
- 完成時間：在完成時間中搜尋

### 日期範圍過濾
- 可以設定開始日期和結束日期
- 支援單獨設定開始或結束日期
- 日期格式：YYYY-MM-DD

### 搜尋歷史
- 自動保存最近 10 次搜尋關鍵字
- 點擊歷史關鍵字可以快速重新搜尋
- 搜尋歷史會持久化保存

## 使用方式

1. **基本搜尋**：
   - 在搜尋框中輸入關鍵字（如「讀書」）
   - 選擇要搜尋的欄位
   - 點擊「搜尋」按鈕

2. **日期範圍搜尋**：
   - 設定開始日期和結束日期
   - 可以只設定其中一個日期
   - 配合關鍵字搜尋使用效果更佳

3. **清除搜尋**：
   - 點擊「清除」按鈕可以清除所有搜尋條件
   - 恢復顯示所有記錄

## 技術實現

### 核心函數
- `handleSearch()`: 執行搜尋邏輯
- `handleClearSearch()`: 清除搜尋條件
- `loadRecords()`: 載入記錄並初始化過濾記錄

### 搜尋邏輯
```typescript
// 關鍵字搜尋
if (searchKeyword.trim()) {
  const keyword = searchKeyword.trim().toLowerCase();
  filtered = filtered.filter(record => {
    const matches: boolean[] = [];
    
    // 搜尋專注項目名稱
    if (searchFields.focusItem) {
      const focusItem = focusItems.find(item => item.id === record.focusItemId);
      if (focusItem && focusItem.name.toLowerCase().includes(keyword)) {
        matches.push(true);
      }
    }
    
    // 搜尋描述內容
    if (searchFields.description && record.description) {
      if (record.description.toLowerCase().includes(keyword)) {
        matches.push(true);
      }
    }
    
    // 搜尋時間
    if (searchFields.time) {
      const dateTime = new Date(record.completedAt).toLocaleString('zh-TW');
      if (dateTime.toLowerCase().includes(keyword)) {
        matches.push(true);
      }
    }
    
    return matches.length > 0;
  });
}

// 日期範圍過濾
if (startDate || endDate) {
  filtered = filtered.filter(record => {
    const recordDate = new Date(record.completedAt);
    const recordDateStr = recordDate.toISOString().split('T')[0];
    
    let matchesDate = true;
    
    if (startDate) {
      matchesDate = matchesDate && recordDateStr >= startDate;
    }
    
    if (endDate) {
      matchesDate = matchesDate && recordDateStr <= endDate;
    }
    
    return matchesDate;
  });
}
```

## 修復結果

現在搜尋「讀書」時會：
1. 正確過濾出包含「讀書」關鍵字的記錄
2. 顯示搜尋結果統計
3. 只顯示符合條件的記錄
4. 支援多種搜尋條件組合

搜尋功能現在完全正常工作，可以準確過濾和顯示符合條件的記錄。
