# RXV Google Flow 示範影片專區｜R2 上線檢查表

## 新頁面

- 公開教學：`/tools/flow-video`
- 管理員上傳：`/admin/flow-demos`
- 工具中心已新增 Flow 教學入口。
- 既有本機專用 `/tools/image-to-video` 不變，沒有改圖片後台與商店付款流程。

## 影片儲存方式

使用既有 `api/main.ts` 提供短效簽名 URL，瀏覽器直接 PUT 到 **R2 公開資源 Bucket**；使用以下**獨立前綴**：

- MP4：`tools/flow-demos/<uuid>.mp4`
- 公開影片標題 metadata：`tools/flow-demos/<uuid>.json`

避免 MP4 進入 Vercel build bundle / GitHub；也避免與 `originals/`、`catalog/` 和已付費圖片 ZIP 共用路徑。

## Vercel 設定檢查

Server env 已有以下變數時可沿用，不要覆蓋原值：

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BUCKET_NAME`（預設值為原本公開圖片庫 Bucket）
- `R2_PUBLIC_ASSET_URL`（或 `VITE_PUBLIC_R2_URL`）
- `RXV_IMAGE_ADMIN_KEY`（與圖片後台共用；不得公開）

確認 `R2_PUBLIC_ASSET_URL` 是 **public bucket 的 CDN / r2.dev 公開網址**，不能填寫 R2 S3 API endpoint。並確認 R2 credentials 對該公開 Bucket 具備 PutObject / GetObject / ListObjects / HeadObject / DeleteObject 權限。

## R2 CORS

瀏覽器對 R2 的直接 PUT 必須有 CORS。**不要直接把既有 CORS 規則覆蓋**；先讀取目前規則，僅加入所需 origin、method、headers，確保既有圖片正常顯示。新增規則範例：

```json
[
  {
    "AllowedOrigins": [
      "https://pomodoro-app-eight-rouge.vercel.app",
      "http://localhost:3005"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

如需 Preview 測試，必須另外精確加入 Preview 網域 Origin；不要為了測試直接開放任意網站 PUT。

## 安全與限制

- 只有帶有效 `X-RXV-Image-Admin-Key` 的管理員可取得 PUT URL、完成影片上架與刪除。
- 單檔上限 40 MiB，限 MP4；metadata 在 HEAD 驗證檔案大小及 MIME 後才建立。
- 影片示範是**公開資料**，不得上傳真人隱私、未授權內容、付費限定素材。
- 上傳失敗時可能留下沒有 JSON 標題的孤兒 MP4：先確認再僅清理 `tools/flow-demos/` 下的孤兒檔；**不要**批次清理整個 bucket。
- 若文件或分支修改未通過 `npm run build` 和上傳測試，不要合併到 main／部署 Production。
- Flow 額度以 Google 當時官方公告為準。RXV 不承諾代為生成影片。

## 發布前驗收

1. 在功能分支執行 `npm run build`，檢查 TypeScript 與 Vite。
2. 以 Preview 確認 `/tools/flow-video` 顯示說明、提示詞可複製、Flow 外連能開啟。
3. 無管理金鑰呼叫 prepare 必須得到 401/403。
4. 用一支小型、自有、合法授權 MP4 上傳；確認 R2 CORS 不擋 PUT。
5. 確認完成上傳後示範區載入、播放與手機 9:16 排版。
6. 用錯誤金鑰嘗試刪除應遭拒；正確金鑰可刪除指定示範（不影響圖片）。
7. 必要時排查 Vercel 12 functions 限額：本次未新增獨立 /api function。
8. 確認正式圖片後台、貼圖工具、App、NT$199 全圖 ZIP 付款/下載未受到影響。

參考：Cloudflare R2 文件 https://developers.cloudflare.com/r2/buckets/cors/
