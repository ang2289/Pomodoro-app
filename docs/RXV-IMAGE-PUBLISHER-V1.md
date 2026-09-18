# RXV 圖片自動推廣器 v1

## 目的

第一版只做 3 件事：

1. 自動讀取 R2 最新圖片清單。
2. 用本機 SQLite 排除 TikTok 已經用過的圖片。
3. 自動產生 TikTok 待發布圖片與文案，發布後可標記為已發布。

不使用 Supabase、不使用付費 AI API、不需要另外租資料庫。

## 一鍵啟動

Windows 直接雙擊：

`START-RXV-IMAGE-PUBLISHER-V1.bat`

會開啟：

`http://127.0.0.1:3017/`

## 資料來源

優先讀：

`.env.local` 的 `VITE_PUBLIC_R2_URL`

並取得：

`catalog/images-public.json`

若沒有設定，才退回：

`public/data/images-public.json`

## 本機紀錄

SQLite：

`data/rxv-image-publisher.db`

每張圖片會以 `image_id + platform` 記錄狀態，因此 TikTok 已建立待發或已發布的圖片不會再次被選中。

## 操作

- 「產生 5 張待發內容」：自動選尚未用過的圖片。
- 「複製文案」：直接貼到 TikTok。
- 「開啟圖片」：開啟目前待發圖片。
- 「標記已發布」：記錄為 TikTok 已發布，可選填貼文網址。
- 「取消待發」：釋放這張圖片，之後可以再次被選到。

## OpenClaw / 小龍蝦自動化入口

不開網頁也可以執行：

`node server/rxv-image-publisher-v1.cjs --generate 5`

此指令會：

- 讀最新圖片清單
- 排除 SQLite 已使用圖片
- 產生 5 張 TikTok 待發內容
- 回傳 JSON 給 OpenClaw 繼續處理

第一版先不直接自動發布 TikTok，沿用「自動準備 + 人工確認」模式。
