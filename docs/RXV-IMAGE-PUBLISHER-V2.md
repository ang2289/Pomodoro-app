# RXV 圖片自動推廣器 v2

零成本本機版流程：R2 最新圖片 → 同分類自動選 4~6 張 → 痛點字幕 → QR Code → 可選 MP3 → 本機 FFmpeg 產生 1080x1920 MP4 → TikTok 官方 API。

## 固定價格規則
- 單一職業小包：NT$99
- 全部圖片素材庫：NT$199
- 張數一律從網站同一份 `catalog/images-public.json` 即時計算，不寫死。
- 公開數量套用網站相同規則，排除「本機 WebP 測試」。

## 本機檔案
- MP4：`D:\RXV-AutoVideo\output`
- 工作檔：`D:\RXV-AutoVideo\work`
- SQLite：`data\rxv-image-publisher.db`
- MP4 不放 GitHub，也不放 Vercel。

## 啟動
雙擊 `START-RXV-IMAGE-PUBLISHER-V2.bat`，瀏覽器開啟 `http://127.0.0.1:3018`。

## 一鍵流程
1. 選分類、每支 4/5/6 張圖、MP3。
2. 按「自動建立 1 支」。
3. 按「產生 MP4」。
4. 預覽影片：上方痛點字幕、下方價格字幕，最後 CTA 含 QR Code。
5. 按「確認並發布 TikTok」。

若 TikTok API 是 Direct Post，成功後自動記錄為 published；若只有 Upload 模式，會送到 TikTok 草稿／收件匣，再到 App 完成最後發布。

## 痛點文案
小包文案自動帶入分類最新張數、NT$99；完整素材庫自動帶入網站公開最新總數、NT$199。房仲等大於 99 張的小包會顯示「平均一張不到 NT$1」。

## MP3
工具掃描：
- `D:\RXV-AutoVideo\mp3`
- 專案 `assets`
- 專案 `public\music`

可選自動、無音樂或指定 MP3。

## 一鍵更新
雙擊 `UPDATE-RXV-IMAGE-PUBLISHER-V2.bat`。它只做 `git fetch` + `git reset --hard origin/main`，不執行 `git clean`。

## 一鍵自動跑一輪
雙擊 `RUN-RXV-TIKTOK-ONCE-V2.bat`，先要求使用者確認，再自動挑圖、做 MP4、送 TikTok。


## v2.1：9:16 原圖專用
- 影片內容圖只接受接近 9:16 的直式原圖（ratio 0.54～0.59）。
- 最低預設解析度：900×1600；可用環境變數 `RXV_MIN_916_WIDTH` / `RXV_MIN_916_HEIGHT` 調高。
- 不再使用公開 480px 縮圖製作 MP4；本機會先取得原圖，再用 Sharp 讀尺寸。
- 原圖快取：`D:\RXV-AutoVideo\original-cache`。
- 圖片尺寸與 9:16 判斷快取在 SQLite `rxv_image_metadata`，之後不必重複分析。
- 實際用進影片的 9:16 圖會寫入 `rxv_video_916_usage`，下一支優先避開重複。
- 內容頁使用 contain，不把橫圖硬裁成直式；CTA 頁仍可模糊背景。
- 如果原本任務選到橫圖或低解析度圖，產片時會自動從同分類改找合格 9:16 原圖。


## v2.2：TikTok 安全版 + Upload Draft
- v2 啟動器預設開啟 `RXV_TIKTOK_SAFE_VIDEO=1`。
- TikTok 專用 MP4 只保留 9:16 原圖與痛點字幕，不燒入 QR Code、網址、LINE、NT$99 / NT$199 CTA。
- TikTok 專用輸出檔名會以 `_tiktok_safe.mp4` 結尾。
- 舊版促銷 MP4 在 Audit 未通過時不會送 TikTok，請重新產生新版 MP4。
- 如果設定原本是 Direct Post，但 `TIKTOK_CLIENT_AUDITED=false`，工具會自動切換為 Upload Draft。
- 若目前 OAuth 沒有 `video.upload` scope，畫面會顯示「Upload：需重新授權」，請開啟 TikTok 授權設定重新連接。
- Upload Draft 成功後，影片會送到 TikTok 草稿／收件匣；最後文字與正式發布在 TikTok App 完成。
- 商品價格、完整素材庫 NT$199、小包 NT$99 等銷售資訊仍保留在 v2 產生的貼文文案中，影片本身不燒促銷 CTA。


## v2.3：沿用蝦皮影音成功的 TikTok Direct Post 測試路徑
- `TIKTOK_POST_MODE=direct` 時仍走 TikTok 官方 Direct Post API，不再因本機 Audit flag 自動改成 Upload Draft。
- 本機尚未標記 Audit 通過時，預設使用 `SELF_ONLY`，也就是只對自己的 TikTok 帳號可見。
- 這個模式用來先確認舊版成功路徑：`creator_info/query → video/init → FILE_UPLOAD → status/fetch → PUBLISH_COMPLETE`。
- 成功條件是 TikTok 回傳 `PUBLISH_COMPLETE`，工具才記錄為已發布。
- 畫面會清楚顯示「Direct Post 測試（SELF_ONLY）」與實際隱私。
- 若之後 Production / Direct Post 正式權限確認可公開，再把 `TIKTOK_DIRECT_SELF_ONLY_TEST=0`，即可使用設定的公開隱私等級。
- 此版不會自動把 SELF_ONLY 測試影片當成公開影片；先驗證 API 路徑是否可成功。
