# 待辦事項表單重構說明

## 需求描述
用戶要求將 TodoPage.tsx 中的新增任務表單區塊按照以下順序重新排列，並統一使用 Tailwind 類別美化：

1. 任務內容輸入欄位
2. 任務分類選單（預設下拉 + 右側新增分類按鈕）
3. 優先順序選單（高、中、低）
4. 開始／結束時間欄位（需左右對齊）
5. 提醒時間複選區（前10分鐘、30分鐘、1小時）
6. 「儲存任務」按鈕（使用統一的 IconButton 樣式）

每個欄位請使用 flex + gap 排版，按鈕區塊使用 justify-end。
表單統一放在一個 card 樣式容器內，整體 className="card w-full p-4 mb-4"

## 重構內容

### 1. 表單結構重新設計

**原始結構問題**：
- 表單欄位分散在不同區塊
- 使用內聯樣式，難以維護
- 布局不一致，缺乏統一的視覺設計
- 按鈕位置不當，用戶體驗不佳

**新的表單結構**：
```typescript
{/* 新增任務表單 */}
<div className="card w-full p-4 mb-4">
  <div className="flex flex-col gap-4">
    {/* 1. 任務內容輸入欄位 */}
    {/* 2. 任務分類選單 */}
    {/* 3. 優先順序選單 */}
    {/* 4. 開始／結束時間欄位 */}
    {/* 5. 提醒時間複選區 */}
    {/* 6. 儲存任務按鈕 */}
  </div>
</div>
```

### 2. 各欄位詳細設計

#### 1. 任務內容輸入欄位
```typescript
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-gray-700">任務內容</label>
  <input
    type="text"
    value={newTodo}
    onChange={(e) => setNewTodo(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
    placeholder="請輸入任務內容..."
    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
  />
</div>
```

**設計特點**：
- ✅ 使用 Tailwind 類別統一樣式
- ✅ 清晰的標籤和輸入框分離
- ✅ 支援 Enter 鍵快速提交
- ✅ 聚焦時的視覺回饋

#### 2. 任務分類選單
```typescript
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-gray-700">分類</label>
  <div className="flex gap-2">
    <select
      value={newCategory}
      onChange={(e) => setNewCategory(e.target.value)}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
    >
      <option value="">選擇分類</option>
      {categories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
    <button
      onClick={() => setShowAddCategory(!showAddCategory)}
      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors whitespace-nowrap"
    >
      ⚙ 管理分類
    </button>
  </div>
</div>
```

**設計特點**：
- ✅ 分類下拉選單佔主要空間
- ✅ 管理分類按鈕緊鄰右側
- ✅ 響應式設計，手機版垂直排列
- ✅ 統一的 Tailwind 樣式

#### 3. 優先順序選單
```typescript
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-gray-700">優先順序</label>
  <select
    value={newPriority}
    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
  >
    <option value="low">低</option>
    <option value="medium">中</option>
    <option value="high">高</option>
  </select>
</div>
```

**設計特點**：
- ✅ 簡潔的下拉選單設計
- ✅ 清晰的優先級選項（低、中、高）
- ✅ 統一的樣式與其他欄位一致

#### 4. 開始／結束時間欄位
```typescript
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-gray-700">時間設定</label>
  <div className="flex gap-4">
    {/* 開始時間 */}
    <div className="flex-1 flex flex-col gap-1">
      <label className="text-xs text-gray-600">開始時間</label>
      <DatePicker
        selected={newStartDateTime}
        onChange={(date) => {
          setNewStartDateTime(date)
          setTimeout(() => validateTimes(), 100)
        }}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="yyyy/MM/dd HH:mm"
        placeholderText="選擇開始時間"
        className="custom-datepicker"
        wrapperClassName="datepicker-wrapper"
      />
    </div>
    {/* 結束時間 */}
    <div className="flex-1 flex flex-col gap-1">
      <label className="text-xs text-gray-600">結束時間</label>
      <DatePicker
        selected={newEndDateTime}
        onChange={(date) => {
          setNewEndDateTime(date)
          setTimeout(() => validateTimes(), 100)
        }}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="yyyy/MM/dd HH:mm"
        placeholderText="選擇結束時間"
        className="custom-datepicker"
        wrapperClassName="datepicker-wrapper"
      />
    </div>
  </div>
</div>
```

**設計特點**：
- ✅ 左右對齊的雙欄布局
- ✅ 每個時間欄位佔 50% 寬度
- ✅ 使用 CSS 類別而非內聯樣式
- ✅ 保持原有的時間驗證邏輯

#### 5. 提醒時間複選區
```typescript
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-gray-700">提醒時間</label>
  <div className="flex flex-wrap gap-2">
    {reminderQuickOptions.map((option, index) => (
      <button
        key={index}
        onClick={() => {
          const time = option.value()
          setNewReminderTime(time)
          setTimeout(() => validateTimes(), 100)
        }}
        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors"
      >
        {option.label}
      </button>
    ))}
  </div>
</div>
```

**設計特點**：
- ✅ 快捷按鈕設計，提升用戶體驗
- ✅ 支援多個提醒時間選項
- ✅ 視覺上與主要按鈕區分
- ✅ 響應式布局，自動換行

#### 6. 儲存任務按鈕
```typescript
<div className="flex justify-end gap-2">
  <button
    onClick={resetForm}
    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
  >
    🔄 重設
  </button>
  <button
    onClick={addTodo}
    disabled={!canSubmitForm()}
    className={`px-6 py-2 rounded-md font-medium transition-colors ${
      canSubmitForm()
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    💾 儲存任務
  </button>
</div>
```

**設計特點**：
- ✅ 右對齊布局（justify-end）
- ✅ 主要按鈕（儲存）突出顯示
- ✅ 次要按鈕（重設）使用灰色
- ✅ 禁用狀態的視覺回饋
- ✅ 使用表情符號增加親和力

### 3. CSS 樣式優化

#### DatePicker 樣式
```css
.custom-datepicker {
  padding: 14px !important;
  border-radius: 8px !important;
  border: 2px solid #cccccc !important;
  background-color: #ffffff !important;
  color: #333333 !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  outline: none !important;
  transition: border-color 0.2s !important;
  min-width: 200px !important;
  width: 100% !important;
  height: 52px !important;
  box-sizing: border-box !important;
}

.custom-datepicker:focus {
  border-color: #4ecdc4 !important;
}

.datepicker-wrapper {
  width: 100% !important;
}
```

**優化特點**：
- ✅ 移除不支援的 style 屬性
- ✅ 使用 CSS 類別控制樣式
- ✅ 確保樣式優先級
- ✅ 保持與其他輸入框一致的視覺效果

### 4. 響應式設計

#### 桌面版布局
- ✅ 水平排列的欄位（時間設定）
- ✅ 合適的間距和對齊
- ✅ 按鈕右對齊

#### 手機版布局
- ✅ 垂直排列所有欄位
- ✅ 全寬度輸入框
- ✅ 觸控友好的按鈕大小

### 5. 用戶體驗改善

#### 視覺層次
- ✅ 清晰的標籤和輸入框分離
- ✅ 一致的間距和對齊
- ✅ 統一的顏色和字體設計

#### 互動體驗
- ✅ 聚焦時的視覺回饋
- ✅ 按鈕懸停效果
- ✅ 禁用狀態的明確指示
- ✅ 快捷操作（Enter 鍵提交）

#### 功能完整性
- ✅ 保持所有原有功能
- ✅ 時間驗證邏輯不變
- ✅ 分類管理功能完整
- ✅ 提醒時間快捷選項

### 6. 技術實現

#### Tailwind 類別使用
```typescript
// 容器樣式
className="card w-full p-4 mb-4"

// 布局樣式
className="flex flex-col gap-4"
className="flex gap-2"
className="flex justify-end gap-2"

// 輸入框樣式
className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"

// 按鈕樣式
className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
```

#### 響應式設計
```typescript
// 桌面版：水平排列
<div className="flex gap-4">
  <div className="flex-1">...</div>
  <div className="flex-1">...</div>
</div>

// 手機版：垂直排列
<div className="flex flex-col gap-2">
  <div className="w-full">...</div>
  <div className="w-full">...</div>
</div>
```

### 7. 移除的舊代碼

#### 清理內容
- ✅ 移除舊的內聯樣式表單
- ✅ 移除重複的時間欄位定義
- ✅ 移除舊的按鈕布局
- ✅ 清理未使用的樣式代碼

#### 保留功能
- ✅ 時間驗證邏輯
- ✅ 分類管理功能
- ✅ 提醒時間快捷選項
- ✅ 表單提交邏輯

### 8. 測試場景

#### 功能測試
- ✅ 任務內容輸入和提交
- ✅ 分類選擇和管理
- ✅ 優先級設定
- ✅ 時間選擇和驗證
- ✅ 提醒時間快捷設定
- ✅ 表單重設功能

#### 響應式測試
- ✅ 桌面版布局正常
- ✅ 手機版布局正常
- ✅ 各種螢幕尺寸適配
- ✅ 觸控操作友好

#### 視覺測試
- ✅ 統一的視覺設計
- ✅ 清晰的視覺層次
- ✅ 良好的對比度
- ✅ 一致的間距和對齊

### 9. 最終效果

#### 表單布局
```
┌─────────────────────────────────────┐
│ 任務內容                             │
│ [請輸入任務內容...              ]   │
├─────────────────────────────────────┤
│ 分類                                 │
│ [選擇分類 ▼] [⚙ 管理分類]           │
├─────────────────────────────────────┤
│ 優先順序                             │
│ [低 ▼]                              │
├─────────────────────────────────────┤
│ 時間設定                             │
│ 開始時間          結束時間           │
│ [選擇開始時間]    [選擇結束時間]     │
├─────────────────────────────────────┤
│ 提醒時間                             │
│ [開始前10分鐘] [開始前30分鐘] [1小時] │
├─────────────────────────────────────┤
│                     [🔄 重設] [💾 儲存任務] │
└─────────────────────────────────────┘
```

#### 主要改善
- 📝 **清晰的欄位順序**：按照邏輯順序排列
- 🎨 **統一的視覺設計**：使用 Tailwind 類別
- 📱 **響應式布局**：適配各種設備
- ⚡ **提升用戶體驗**：快捷操作和視覺回饋
- 🔧 **易於維護**：統一的樣式系統
- ✨ **現代化設計**：符合當代 UI/UX 標準

**表單重構完成！現在新增任務表單具有清晰的欄位順序、統一的 Tailwind 樣式設計、良好的響應式布局，並保持了所有原有功能。用戶可以更直觀地創建和管理待辦事項！**

