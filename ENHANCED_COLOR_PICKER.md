# 增強版顏色選擇器功能說明

## 功能概述
根據用戶需求，為專注項目管理頁面增加了更豐富的顏色選擇功能，讓用戶可以選擇更多想要的顏色。

## 新增功能

### 1. 擴展預設顏色選項
**從 8 種顏色擴展到 16 種顏色**：

**第一行（基礎顏色）**：
- 藍色 (#3b82f6)
- 綠色 (#10b981)
- 紫色 (#8b5cf6)
- 橘色 (#f59e0b)

**第二行（鮮豔顏色）**：
- 紅色 (#ef4444)
- 青色 (#06b6d4)
- 粉色 (#ec4899)
- 灰色 (#6b7280)

**第三行（深色系）**：
- 深藍 (#1e40af)
- 深綠 (#059669)
- 深紫 (#7c3aed)
- 深紅 (#dc2626)

**第四行（特殊顏色）**：
- 黃色 (#eab308)
- 靛色 (#6366f1)
- 玫瑰 (#f43f5e)
- 薄荷 (#14b8a6)

### 2. 自訂顏色選擇器
**新增「更多顏色」功能**：
- 點擊「更多顏色」按鈕展開自訂顏色選項
- 提供 HTML5 原生顏色選擇器
- 支援手動輸入 HEX 顏色代碼
- 即時預覽選擇的顏色

### 3. 當前選擇顏色預覽
**新增顏色預覽區域**：
- 顯示當前選擇的顏色圓點
- 顯示對應的 HEX 顏色代碼
- 使用等寬字體顯示顏色代碼
- 提供視覺反饋確認選擇

## 技術實現

### 狀態管理
```typescript
const [selectedColor, setSelectedColor] = useState('#3b82f6') // 當前選擇的顏色
const [customColor, setCustomColor] = useState('#3b82f6') // 自訂顏色
const [showCustomColorPicker, setShowCustomColorPicker] = useState(false) // 是否顯示自訂顏色選擇器
```

### 顏色選擇邏輯
```typescript
const handleColorSelect = (color: string) => {
  setSelectedColor(color)
  setCustomColor(color)
  setShowCustomColorPicker(false)
}

const handleCustomColorChange = (color: string) => {
  setCustomColor(color)
  setSelectedColor(color)
}
```

### UI 設計改進

#### 1. 網格布局
- 使用 CSS Grid 布局，4列顯示
- 每個顏色選項都有獨立的卡片樣式
- 選中狀態有藍色邊框高亮

#### 2. 自訂顏色選擇器
```typescript
{showCustomColorPicker && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <input
      type="color"
      value={customColor}
      onChange={(e) => handleCustomColorChange(e.target.value)}
      style={{
        width: '40px',
        height: '40px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    />
    <input
      type="text"
      value={customColor}
      onChange={(e) => handleCustomColorChange(e.target.value)}
      placeholder="#000000"
      style={{
        padding: '8px 12px',
        fontSize: '14px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        outline: 'none',
        width: '100px',
        fontFamily: 'monospace'
      }}
    />
  </div>
)}
```

#### 3. 顏色預覽區域
```typescript
<div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e0e0e0'
}}>
  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
    當前選擇：
  </span>
  <div
    style={{
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: selectedColor,
      border: '3px solid #ffffff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}
  />
  <span style={{ fontSize: '14px', color: '#333', fontWeight: '600', fontFamily: 'monospace' }}>
    {selectedColor.toUpperCase()}
  </span>
</div>
```

## 使用方式

### 1. 選擇預設顏色
1. 在「預設顏色」區域中查看 16 種預設顏色
2. 點擊任意顏色圓點即可選擇
3. 選中的顏色會有藍色邊框高亮
4. 在「當前選擇」區域可以看到預覽

### 2. 使用自訂顏色
1. 點擊「更多顏色」按鈕展開自訂顏色選項
2. 使用顏色選擇器（圓形按鈕）選擇任意顏色
3. 或者直接在文字框中輸入 HEX 顏色代碼（如 #ff5733）
4. 選擇的顏色會即時顯示在預覽區域

### 3. 確認選擇
1. 在「當前選擇」區域確認選擇的顏色
2. 輸入專注項目名稱
3. 點擊「➕ 新增專注項目」按鈕
4. 新項目會使用選擇的顏色

## 功能特點

### 1. 豐富的顏色選項
- **16 種預設顏色**：涵蓋常用顏色和特殊顏色
- **無限自訂顏色**：支援任意 HEX 顏色代碼
- **顏色分類**：基礎色、鮮豔色、深色系、特殊色

### 2. 直觀的用戶界面
- **網格布局**：4x4 網格整齊排列
- **視覺預覽**：每個顏色都有圓點預覽
- **中文標籤**：每個顏色都有中文名稱
- **選中狀態**：清晰的選中視覺反饋

### 3. 靈活的自訂功能
- **原生顏色選擇器**：使用瀏覽器原生顏色選擇器
- **手動輸入**：支援直接輸入 HEX 代碼
- **即時預覽**：選擇顏色時即時更新預覽
- **收起/展開**：可控制自訂顏色選擇器的顯示

### 4. 良好的用戶體驗
- **當前選擇預覽**：清楚顯示當前選擇的顏色和代碼
- **響應式設計**：支援不同螢幕尺寸
- **平滑動畫**：hover 效果和狀態切換動畫
- **無障礙設計**：支援鍵盤操作和螢幕閱讀器

## 技術優勢

### 1. 效能優化
- 使用內聯樣式避免 CSS 類別衝突
- 最小化重新渲染
- 高效的事件處理

### 2. 兼容性
- 支援所有現代瀏覽器
- HTML5 原生顏色選擇器
- 降級處理：不支援的瀏覽器仍可使用文字輸入

### 3. 可維護性
- 清晰的狀態管理
- 模組化的函數設計
- 詳細的註釋和文檔

### 4. 擴展性
- 易於添加新的預設顏色
- 支援未來添加更多自訂選項
- 可整合其他顏色格式（RGB、HSL 等）

現在用戶可以：
- ✅ 從 16 種預設顏色中選擇
- ✅ 使用自訂顏色選擇器選擇任意顏色
- ✅ 手動輸入 HEX 顏色代碼
- ✅ 即時預覽選擇的顏色
- ✅ 享受直觀易用的界面設計
