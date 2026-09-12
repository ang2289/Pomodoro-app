RxV Publisher Helper V39.10

本版只修改 TikTok 自動選 MP4 的事件流程與錯誤復原。

重點：
- DOM.setFileInputFiles 後先讓 TikTok 自己處理，不再立即同時 dispatch input + change。
- 只有 TikTok 完全沒有反應時，才補送一次 change，而且只送一次。
- 若自動選片後 TikTok Studio 進入「出錯了／請再試一次」，Extension 會按一次重試。
- 重試後不再重複自動注入，改等待你手動選 MP4；選好後會自動續填說明、蝦皮分潤連結與 Hashtag。
- 不修改 V37.14 影片核心、Backend、SQLite schema、Shopee Helper。

安裝後請到 edge://extensions/ 重新載入 RxV Publisher Helper，確認 39.10.0。
