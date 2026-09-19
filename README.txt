RXV 圖片後台：乾淨獨立後端收尾版

目的：
- 不再碰目前混有多個功能的 api/main.ts。
- 新增 api/image-admin.ts，專門負責 RXV 圖片後台：
  * admin-list-images
  * admin-list-image-categories（相容用）
  * uploadImage
- 原圖 -> Private R2
- 縮圖 -> Public R2
- 更新 catalog/images-public.json
- 新上傳固定 bundle
- 沿用 RXV_IMAGE_ADMIN_KEY

使用：
1. 解壓縮 ZIP。
2. 右鍵 PowerShell 執行 APPLY_RXV_CLEAN_IMAGE_ADMIN.ps1
   或：
   powershell -ExecutionPolicy Bypass -File ".\APPLY_RXV_CLEAN_IMAGE_ADMIN.ps1"
3. 腳本會自動備份、套用並執行 npm run build。
4. Build PASS 後，可執行：
   npm run dev:image-admin

此腳本不修改 api/main.ts，不刪除 R2 圖片，不更改 bucket/credentials。
