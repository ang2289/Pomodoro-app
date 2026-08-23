RXV NT$399 圖片素材庫：R2 獨立收款版

這版只處理 NT$399 圖片素材庫，不改其他購買功能。

改動：
1. 客戶 /payment/report?product=image-bundle-full
   - 不需要登入
   - 匯款回報直接存 Private R2
   - 不再建立 Supabase digital_product_orders
   - 成功後顯示訂單編號

2. /admin/payments
   - NT$399 訂單改讀 R2
   - 使用 RXV_IMAGE_ADMIN_KEY 驗證
   - Supabase 402 時，NT$399 訂單仍能顯示/核准/拒絕
   - 可上傳 Private R2 ZIP、複製 7 天 R2 下載連結

3. 獨立管理頁
   - /rxv-image-bundle-admin.html
   - 完全不依賴 Supabase 登入
   - 可看待核款、核准/拒絕、上傳 ZIP、複製下載連結

4. 新 API
   - /api/image-bundle-orders
   - 訂單 JSON 存 R2_PRIVATE_BUCKET_NAME
   - 管理端沿用 RXV_IMAGE_ADMIN_KEY
   - 不 hard-code 任何金鑰

未修改：
- api/main.ts
- Supabase 登入/註冊
- 其他付款/名片/團購功能
- 圖片庫 R2 manifest

安裝：
PowerShell 執行：
powershell -ExecutionPolicy Bypass -File ".\APPLY_399_R2_PAYMENT.ps1"

Build PASS 後部署到 Vercel。

部署後驗收：
A. 客戶測試
   /payment/bank-transfer?product=image-bundle-full
   -> 我已完成匯款，送出回報
   -> 填 Email、末五碼、日期
   -> 應顯示「已收到匯款回報」與訂單編號

B. 管理測試
   /rxv-image-bundle-admin.html
   -> 輸入既有 RXV_IMAGE_ADMIN_KEY
   -> 應看到剛才測試訂單

注意：
若 Private R2 bucket 的瀏覽器 PUT CORS 尚未允許正式網站網域，
「ZIP 直傳」可能需要再補 CORS；但匯款回報、訂單列表、核准/拒絕本身仍可正常使用。
