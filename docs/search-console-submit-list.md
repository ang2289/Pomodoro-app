# Search Console 手動提交／檢索索引清單

**網站基準網址（請依 Search Console 內實際網域替換）：**  
`https://pomodoro-app-eight-rouge.vercel.app`

下列路徑請貼上完整 URL（基準網址 + 路徑）至「網址檢查」或匯入清單。

---

## 首頁

| 路徑 |
|------|
| `/` |

---

## 四個工具分類頁

| 路徑 |
|------|
| `/tools/ai` |
| `/tools/image` |
| `/tools/productivity` |
| `/tools/life` |

---

## 核心工具頁（主功能入口）

| 路徑 | 說明 |
|------|------|
| `/tools/image-resize` | 圖片尺寸轉換 |
| `/tools/image-compress` | 圖片壓縮 |
| `/tools/qr-code` | QR Code 產生器 |
| `/summary` | AI 摘要（主流程） |
| `/tools/homework-helper` | 作業解題助手 |

> 另設 `/tools/summary`、`/tools/ai-summary` 為同一介紹頁元件，建議以 Search Console 實際收錄為準擇一為主規範。

---

## 20 個核心 SEO 落地頁（`/tools/{segment}/{slug}`）

| # | 路徑 |
|---|------|
| 1 | `/tools/image-resize/instagram-post-size` |
| 2 | `/tools/image-resize/instagram-reels-size` |
| 3 | `/tools/image-resize/youtube-thumbnail-size` |
| 4 | `/tools/image-resize/youtube-shorts-size` |
| 5 | `/tools/image-resize/facebook-post-size` |
| 6 | `/tools/image-compress/compress-image-online` |
| 7 | `/tools/image-compress/compress-jpg-online` |
| 8 | `/tools/image-compress/compress-png-online` |
| 9 | `/tools/image-compress/reduce-image-file-size` |
| 10 | `/tools/image-compress/compress-image-under-1mb` |
| 11 | `/tools/qr-code/free-qr-code-generator` |
| 12 | `/tools/qr-code/wifi-qr-code` |
| 13 | `/tools/qr-code/business-card-qr-code` |
| 14 | `/tools/qr-code/google-review-qr-code` |
| 15 | `/tools/ai-summary/ai-text-summarizer` |
| 16 | `/tools/ai-summary/article-summarizer` |
| 17 | `/tools/ai-summary/pdf-summarizer` |
| 18 | `/tools/ai-summary/youtube-video-summarizer` |
| 19 | `/tools/homework-helper/ai-homework-solver` |
| 20 | `/tools/homework-helper/math-homework-solver` |

（其餘如 `/tools/productivity/pomodoro-timer-online` 等亦已列入 sitemap，可視需求增列。）

---

## 10 個核心 Guide 教學頁（`/guide/{slug}`）

| # | 路徑 |
|---|------|
| 1 | `/guide/instagram-post-size` |
| 2 | `/guide/instagram-reels-size` |
| 3 | `/guide/youtube-shorts-size` |
| 4 | `/guide/youtube-thumbnail-size` |
| 5 | `/guide/line-sticker-size` |
| 6 | `/guide/compress-image-large-files` |
| 7 | `/guide/qr-code-with-logo` |
| 8 | `/guide/wifi-qr-code-how-to` |
| 9 | `/guide/pdf-summary-how-to` |
| 10 | `/guide/summarize-long-article` |

---

## 自動產出

完整清單亦由 `npm run generate-sitemap` 寫入 `public/sitemap.xml`（含 `guideRoutePaths`、`toolLandingRoutePaths` 等），與本表一致時即可依 sitemap 提交全站。
