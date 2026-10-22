# RxV Pinterest 一鍵填入 v1

## 目標

第一版採零成本、本機優先：

1. 從 RxV 圖片清單選圖。
2. 依分類用規則模板產生 Pinterest 標題與說明。
3. 自動帶入 RxV 圖片網站連結。
4. 使用既有 RxV Publisher Helper，在使用者平常登入的 Edge 開啟 Pinterest。
5. 自動上傳圖片、填標題、說明、連結與圖版。
6. 停在最後一步；「發布／儲存」一定由使用者本人按。

不使用 Supabase、不新增 Vercel Function、不使用付費 AI API，也不自動輸入 Pinterest 密碼。

## 使用

1. 啟動既有 RxV 本機服務（3006）。
2. 到 Edge 的擴充功能頁重新載入 `browser-extension/rxv-publisher`；版本應顯示 V39.11。
3. 開啟既有 RxV 發布工具，按「Pinterest 一鍵填入」；或直接開：
   `http://127.0.0.1:3006/pinterest-helper`
4. 選分類與圖片。
5. 檢查／修改自動產生的標題、說明、網址。
6. 第一次輸入 Pinterest 已存在的圖版名稱；工具會記住。
7. 按「開啟 Pinterest 並自動填入」。
8. Pinterest 內容填完後，人工檢查並按最後的「發布／儲存」。

## 第一版分類模板

- 佛像
- 花卉
- 貓咪／寵物
- 房仲
- 美髮
- 美甲
- 美容 SPA／芳療
- 牙醫
- 其他圖片

## 安全限制

- 不自動按 Pinterest 最後發布。
- 找不到必要的標題／說明／連結欄位時停止並顯示錯誤。
- 找不到指定圖版時仍保留已填內容，讓使用者人工選圖版。
- 使用正常 Edge 登入狀態，不保存 Pinterest 帳密。
