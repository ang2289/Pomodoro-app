# 專注項目管理頁面改善說明

## 問題描述
根據用戶反饋，專注項目管理頁面存在以下問題：
1. 新增按鈕看不見
2. 文字太淡看不清楚
3. 新增時需要能選擇圓點的顏色

## 修復內容

### 1. 修復新增按鈕可見性問題
**問題**：原本使用 Tailwind CSS 類別，可能與現有樣式系統衝突導致按鈕不可見。

**解決方案**：
- 移除 Tailwind CSS 類別，改用內聯樣式
- 使用明確的背景色、文字色和邊框
- 添加 hover 效果和禁用狀態樣式
- 使用圖示和文字讓按鈕更明顯

```typescript
<button
  onClick={handleAdd}
  disabled={!newFocusItemName.trim()}
  style={{
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: newFocusItemName.trim() ? '#3b82f6' : '#9ca3af',
    border: 'none',
    borderRadius: '8px',
    cursor: newFocusItemName.trim() ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
    boxShadow: newFocusItemName.trim() ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
  }}
>
  ➕ 新增專注項目
</button>
```

### 2. 改善文字對比度
**問題**：原本使用 `text-gray-300` 等淡色文字，在白色背景上看不清楚。

**解決方案**：
- 將所有文字顏色改為深色（`#333`）
- 使用適當的字體粗細（`fontWeight: '600'`）
- 改善背景對比度
- 使用更清晰的顏色層次

```typescript
// 項目名稱
<span style={{ 
  fontSize: '16px', 
  fontWeight: '600', 
  color: '#333' 
}}>
  {item.name}
</span>

// 使用次數
<div style={{ 
  marginTop: '8px', 
  fontSize: '14px', 
  color: '#666',
  fontWeight: '500'
}}>
  使用 {item.usageCount} 次
</div>
```

### 3. 添加顏色選擇器功能
**問題**：新增專注項目時無法選擇圓點顏色。

**解決方案**：
- 添加 8 種預設顏色的選擇器
- 使用 radio button 讓用戶選擇顏色
- 顯示顏色預覽和顏色名稱
- 支援自訂顏色選擇

```typescript
// 顏色選擇器
<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
  {[
    { name: '藍色', value: '#3b82f6' },
    { name: '綠色', value: '#10b981' },
    { name: '紫色', value: '#8b5cf6' },
    { name: '橘色', value: '#f59e0b' },
    { name: '紅色', value: '#ef4444' },
    { name: '青色', value: '#06b6d4' },
    { name: '粉色', value: '#ec4899' },
    { name: '灰色', value: '#6b7280' }
  ].map((color) => (
    <label style={{ /* 樣式 */ }}>
      <input
        type="radio"
        name="color"
        value={color.value}
        checked={selectedColor === color.value}
        onChange={(e) => setSelectedColor(e.target.value)}
      />
      <div style={{ /* 顏色圓點樣式 */ }} />
      <span>{color.name}</span>
    </label>
  ))}
</div>
```

### 4. 更新服務層支援
**修改** `focusItemService.ts`：
```typescript
export const addFocusItem = (name: string, color: string = '#3b82f6', createdBy: string = 'user'): FocusItem => {
  const newItem: FocusItem = {
    id: generateUUID(),
    name: name.trim(),
    isDefault: false,
    createdAt: new Date().toISOString(),
    createdBy,
    color: color // 使用選擇的顏色
  }
  // ...
}
```

### 5. 改善整體 UI 設計
- **卡片設計**：使用白色背景、圓角、陰影效果
- **按鈕設計**：使用不同顏色區分功能（藍色-儲存、灰色-取消、橘色-編輯、紅色-刪除）
- **間距設計**：改善元素間距，讓界面更舒適
- **響應式設計**：支援不同螢幕尺寸

## 新功能特點

### 1. 顏色選擇器
- **8 種預設顏色**：藍色、綠色、紫色、橘色、紅色、青色、粉色、灰色
- **視覺預覽**：每個選項都有顏色圓點預覽
- **顏色名稱**：顯示中文顏色名稱
- **選擇狀態**：選中的顏色有邊框高亮

### 2. 改善的按鈕設計
- **新增按鈕**：藍色背景，帶圖示，禁用時變灰
- **編輯按鈕**：橘色背景
- **刪除按鈕**：紅色背景
- **儲存按鈕**：藍色背景
- **取消按鈕**：灰色背景

### 3. 更好的文字可讀性
- **深色文字**：使用 `#333` 確保足夠對比度
- **適當字體大小**：16px 主標題，14px 副標題
- **字體粗細**：使用 `fontWeight: '600'` 讓文字更清晰

### 4. 改善的布局
- **卡片式設計**：每個項目都有獨立的卡片
- **清晰的層次**：使用間距和陰影區分不同層級
- **一致的樣式**：所有元素使用統一的設計語言

## 使用方式

### 新增專注項目
1. 在「輸入專注項目名稱」框中輸入名稱
2. 從 8 種顏色中選擇一個
3. 點擊「➕ 新增專注項目」按鈕
4. 新項目會出現在列表中，帶有所選的顏色圓點

### 編輯專注項目
1. 點擊項目右側的「編輯」按鈕
2. 修改項目名稱
3. 點擊「儲存」或「取消」

### 刪除專注項目
1. 點擊項目右側的「刪除」按鈕
2. 確認刪除操作

## 技術實現

### 狀態管理
```typescript
const [selectedColor, setSelectedColor] = useState('#3b82f6') // 預設藍色
```

### 顏色選擇邏輯
```typescript
const handleAdd = () => {
  if (!newFocusItemName.trim()) return
  addFocusItem(newFocusItemName.trim(), selectedColor)
  setFocusItems(getFocusItemsWithCount())
  setNewFocusItemName('')
  setSelectedColor('#3b82f6') // 重置為預設顏色
}
```

### 樣式系統
- 使用內聯樣式確保樣式一致性
- 避免 Tailwind CSS 類別衝突
- 支援 hover 效果和禁用狀態

現在專注項目管理頁面具有：
- ✅ 清晰可見的新增按鈕
- ✅ 高對比度的文字顯示
- ✅ 完整的顏色選擇功能
- ✅ 美觀的 UI 設計
- ✅ 良好的用戶體驗
