# 圖片尺寸一鍵轉換工具（Image Resize Tool）規格說明

## 1. 工具定位
- 類型：免費圖片小工具（SEO 流量入口）
- 目的：快速將圖片轉換成 IG／蝦皮／YouTube Shorts 等常見尺寸
- 特點：
  - 不需註冊
  - 0 API、0 後端成本
  - 圖片在瀏覽器內處理，不上傳伺服器
  - **預設不變形**

---

## 2. 頁面資訊
- 路由：`/tools/image-resize`
- 頁面標題（H1）：
  - IG／蝦皮／Shorts 圖片尺寸一鍵轉換
- SEO Title：
  - IG／蝦皮／Shorts 圖片尺寸一鍵轉換（免費、不變形）
- SEO Description：
  - 免費線上圖片尺寸轉換工具，支援 IG 貼文、IG 限動、蝦皮商品圖、YouTube Shorts。預設不變形（補白），即時預覽並下載。

---

## 3. 支援尺寸 Preset（MVP）

### Preset Key 對照
| key | 說明 | 比例 |
|---|---|---|
| ig_square | IG 貼文（方形） | 1:1 |
| ig_portrait | IG 貼文（直式） | 4:5 |
| ig_story | IG 限動 / Reels / Shorts | 9:16 |
| shopee_square | 蝦皮商品主圖 | 1:1 |

---

## 4. 輸出解析度策略
- 使用「長邊」控制輸出尺寸
- 選項：
  - 1080（預設）
  - 1350
  - 1920

### 尺寸換算規則
- 1:1 → width = longEdge, height = longEdge
- 4:5 → width = longEdge, height = round(longEdge * 5 / 4)
- 9:16 → width = longEdge, height = round(longEdge * 16 / 9)

---

## 5. 圖片處理模式（關鍵設計）

### 模式 A（預設）
**不變形（補白，完整顯示）**
- 保持原圖比例
- 不裁切、不拉伸
- 剩餘區域補白色背景（#FFFFFF）

### 模式 B
**裁切滿版（不變形）**
- 等比例放大填滿目標尺寸
- 超出範圍置中裁切
- 需顯示提示：
  - 「此模式可能裁掉圖片邊緣」

❌ 禁止提供任何會導致圖片比例扭曲的拉伸模式

---

## 6. 使用流程（UX）
1. 上傳圖片（拖拉或點選）
2. 選擇平台尺寸（Preset）
3. 選擇輸出解析度
4. 選擇模式（預設不變形）
5. 即時預覽輸出結果
6. 下載 PNG 或 JPG

---

## 7. 檔案與限制
- 支援格式：JPG / JPEG / PNG / WebP
- 檔案大小限制：10MB
- 最大邊長建議：8000px
- 超出限制需顯示友善錯誤訊息，不可崩潰

---

## 8. 下載規格
- PNG：原始品質
- JPG：quality = 0.92
- 檔名格式：
  - `{原檔名}_{presetKey}_{width}x{height}.{ext}`
- 範例：
  - `photo_ig_story_1080x1920.jpg`

---

## 9. FAQ（SEO 必備）
1. IG 貼文圖片尺寸是多少？
2. IG 限動／Reels／Shorts 圖片比例是多少？
3. 蝦皮商品主圖建議尺寸與比例？
4. 不變形（補白）與裁切滿版差在哪？
5. 圖片會上傳到伺服器嗎？是否有隱私風險？

---

## 10. GA4 事件規劃
- tool_image_resize_open
- tool_image_resize_upload
- tool_image_resize_preset_select
  - params: presetKey
- tool_image_resize_mode_select
  - params: mode = pad | crop
- tool_image_resize_download
  - params: format, width, height, mode, presetKey

---

## 11. 法律與隱私聲明（頁面固定顯示）
- 使用者需確認對圖片擁有使用權或已取得授權
- 圖片僅在本機瀏覽器內處理，不會上傳或儲存到伺服器

---

## 12. 後續擴充（不屬於 MVP）
- 模糊背景補滿
- 批次處理＋ZIP 下載
- 更多平台尺寸（FB、X、LINE、LinkedIn）
- 安全區提示框（文字不被裁切）