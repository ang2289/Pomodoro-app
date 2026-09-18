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
