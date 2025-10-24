# 首頁卡片重構說明

## 📅 更新日期
2025年9月30日

## 🎯 主要改動

### 1. ✅ 卡片樣式統一與顏色重構
- **統一圓角**：所有卡片改用 `rounded-xl`
- **單色背景**：將漸變色改為單色背景
  - 番茄鐘：`bg-pink-100`
  - 待辦清單：`bg-blue-100`
  - 念經計數：`bg-yellow-100`
  - 設定中心：`bg-gray-100`
- **陰影效果**：使用 `shadow` + `hover:shadow-lg`
- **點擊效果**：加上 `active:scale-95` 提供觸覺反饋

### 2. ✅ 版面統一與響應式設計
- **外層容器**：`w-full max-w-md mx-auto px-4 py-6 space-y-4`
  - 置中顯示
  - 最大寬度 448px（手機友善）
  - 統一內距與間距
- **卡片布局**：`flex items-center justify-between`
  - 左側：圖示 + 標題 + 說明
  - 右側：預留空間（未來可加箭頭）

### 3. ✅ 圖示與文字對齊優化
- **圖示大小**：改為 `text-2xl`（之前為 `text-4xl`）
- **左側布局**：`flex items-center gap-3`
- **字體大小**：
  - 標題：`text-lg font-bold text-gray-800`
  - 副標：`text-sm text-gray-600`

### 4. ✅ 整卡點擊跳轉
- 將 `onClick + navigate` 改為 `<Link to="...">`
- 整張卡片可點擊
- 加上 `cursor-pointer` 提示可點擊
- 路徑對應：
  | 模組 | 路徑 |
  |------|------|
  | 番茄鐘 | `/pomodoro` |
  | 待辦清單 | `/todo` |
  | 念經計數 | `/chant` |
  | 設定中心 | `/settings` |

### 5. ✅ 多語言支援（i18n）
- 新增 `src/utils/i18n.ts` 多語言工具
- 支援三種語言：
  - 繁體中文（zh-TW）
  - 英文（en）
  - 日文（ja）
- 使用方式：
  ```tsx
  import { t } from '../utils/i18n'
  
  // 使用翻譯 key
  t('home.pomodoro.title')  // 輸出：番茄鐘
  t('home.pomodoro.desc')   // 輸出：專注工作 25 分鐘．休息 5 分鐘
  ```

## 📝 翻譯 Key 列表

### 首頁卡片
- `home.pomodoro.title` - 番茄鐘標題
- `home.pomodoro.desc` - 番茄鐘說明
- `home.todo.title` - 待辦清單標題
- `home.todo.desc` - 待辦清單說明
- `home.meditation.title` - 念經計數標題
- `home.meditation.desc` - 念經計數說明
- `home.settings.title` - 設定中心標題
- `home.settings.desc` - 設定中心說明

## 🔧 如何擴展多語言

### 新增翻譯
編輯 `src/utils/i18n.ts`，在 `translations` 物件中新增 key：

```typescript
const translations: Record<Language, Record<string, string>> = {
  'zh-TW': {
    'your.new.key': '你的中文翻譯'
  },
  'en': {
    'your.new.key': 'Your English translation'
  },
  'ja': {
    'your.new.key': 'あなたの日本語翻訳'
  }
}
```

### 切換語言
```typescript
import { setLanguage } from '../utils/i18n'

// 切換到英文
setLanguage('en')

// 切換到日文
setLanguage('ja')

// 切換回繁體中文
setLanguage('zh-TW')
```

### 升級為完整的 i18n 系統
未來可升級為 `react-i18next` 或其他專業的多語言解決方案。目前的實作已預留接口，遷移成本低。

## 🎨 設計特色

1. **手機優先**：所有尺寸都針對手機螢幕優化
2. **觸控友善**：大面積點擊區域 + 視覺反饋
3. **一致性**：統一的間距、圓角、陰影
4. **可擴展**：預留右側空間供未來加入箭頭或其他圖示
5. **國際化**：內建多語言支援

## 📱 響應式行為

- 在手機上（< 448px）：卡片會貼近螢幕邊緣，保持 16px 內距
- 在平板/桌面上：卡片最大寬度為 448px，保持置中顯示
- 所有裝置：統一的 16px 卡片間距（`space-y-4`）

## ✨ 動畫效果

- **Hover**：陰影加深（`hover:shadow-lg`）
- **Active**：輕微縮小（`active:scale-95`）
- **過渡**：所有效果都有平滑動畫（`transition-all duration-200`）

## 🚀 未來可優化項目

1. 在右側加入箭頭圖示（→ 或 chevron-right）
2. 為暗色模式優化顏色（目前已有 dark: 類別）
3. 加入語言切換選項到設定頁面
4. 可考慮使用更進階的動畫庫（如 framer-motion）


















