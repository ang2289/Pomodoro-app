# RXV Google Flow 示範影片｜YouTube 嵌入（零 MP4 儲存）

## 頁面與用途

- 公開 Flow 教學、提示詞、示範：`/tools/flow-video`
- 管理者 YouTube 影片清單：`/admin/flow-demos`
- 免費工具中心新增入口；既有 `/tools/image-to-video` 本機工具不修改。

## 管理者操作流程

1. 在 [YouTube Studio](https://studio.youtube.com/) 以自己的帳號上傳示範 MP4。
2. 設為「公開」或「不公開（Unlisted）」；避免設為「私人」，並確保允許嵌入。
3. 複製 YouTube 標準網址、`youtu.be` 分享網址或 Shorts 網址。
4. 登入 RXV 管理頁（與圖片後台共用 `RXV_IMAGE_ADMIN_KEY`），貼上網址、填入標題和說明。
5. 按「新增 YouTube 影片到示範區」；公開教學頁會顯示 YouTube 內嵌播放器。
6. 可從 RXV 後台移除展示項目（**不會刪除 YouTube 原片**）。

## 雲端空間與隱私

- **不會把 MP4 上傳到 RXV Vercel、R2、GitHub 或 Supabase。** 影片託管與播放流量由 YouTube 處理。
- RXV 只把 YouTube 11 碼影片 ID、名稱、說明等極少量 JSON metadata 儲存於現有 Cloudflare R2 公共 bucket 的 `tools/flow-demos/youtube/<uuid>.json`；因此不是字面上的「完全零儲存空間」。
- YouTube 嵌入播放器可能使用 cookies / 第三方連線；目前使用 `youtube-nocookie.com` 增強隱私的嵌入模式。
- 嵌入影片必須可被網站訪客觀看；「不公開」不是私人，任何有連結者都可能觀看。
- 最多 30 個展示項目，影片本體沒有 R2 大小限制。
- 本次新版本保留舊 R2 MP4 前綴不操作；如過去手動上傳過 MP4，需另行審慎處理，不會自動刪除。

## API 設計

沿用 `api/main.ts` 不增加新的 Vercel Function：
- `GET /api/main?action=flow-demo-list`：公開影片資料清單。
- `POST /api/main?action=flow-demo-add`：帶 `X-RXV-Image-Admin-Key`，只能加入有效 HTTPS YouTube 影片 ID。
- `POST /api/main?action=flow-demo-delete`：同樣要求管理金鑰，僅刪除對應 JSON metadata。

舊 MP4 直傳 API actions `flow-demo-prepare` / `flow-demo-complete` 已移除；不再使用 signed R2 PUT URL，也**不需要設定 R2 CORS**。

## 設定檢查

現有後端變數：
- `RXV_IMAGE_ADMIN_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BUCKET_NAME`

後端 R2 金鑰仍僅在伺服器使用。YouTube 影片由 iframe 自動載入，需確認網站 Content-Security-Policy 的 `frame-src` 放行 `https://www.youtube-nocookie.com`，不要一概放寬至任意網域。

## 發布前測試清單

1. 分支 `npm run build` 通過，且既有貼圖 ZIP / Excel build 檢查通過。
2. 預覽頁 `/tools/flow-video` 正常、提示詞可複製、Flow 外部網址正常。
3. 非管理者 `flow-demo-add` / `flow-demo-delete` 返回 401/403。
4. 嘗試假網址、短片網址、YouTube `watch` 標準網址及已存在影片的重複新增，預期分別拒絕或正常處理。
5. 以授權 YouTube 影片測試實際新增、公開頁播放、刪除，再確認 YouTube 原片未刪除。
6. 測試手機 9:16 版面、CSP、隱私政策以及 YouTube 播放受限的顯示。
7. 正式站圖片庫、APP、原本圖片工具及付費 ZIP 路由保持不變。
8. 通過測試前不要合併 main 或部署 Production。

## 連結

- [Google Flow](https://labs.google/fx/tools/flow)
- [YouTube Studio](https://studio.youtube.com/)
