# RXV 貼圖新手五步驟整合紀錄（2026-10-14）

## 工作分支

`codex/sticker-new-user-guided-steps-20261014`

- 從 `codex/images-download-to-mp4-cta-20261013` 建立，保留首頁 2,858 張免費圖片、圖片下載導向 MP4、/tools/image-to-mp4 與既有文案。
- **未修改 main、未合併 PR、未要求 Vercel 部署。**
- 只測試分支；等 Windows 本機 build 與手機功能確認後再規劃 PR/合併，避免覆蓋現有正式站。

## 此次新手使用體驗

- 首頁和工具中心提供「第一次製作貼圖／五步驟說明」。
- 工具中心五張清楚的步驟卡：1 選主題 → 2 複製指令讓 ChatGPT 畫圖 → 3 上傳母圖 → 4 自動切圖與檢查 → 5 下載 ZIP／接續動態。
- 共用 `LineStickerFlowSteps` 可以按步驟跳轉並標示當前階段。
- 按鈕文案已標示第幾步；新增 hash 錨點：`#sticker-start`、`#sticker-copy`、`#mother-upload`、`#mother-split`、`#sticker-download`、`#animated-sticker-batch`。
- 貼圖教學頁改用三張已存在的圖片示範，移除找不到的影片來源，不加載新付費 API。
- 手機版按鈕採內容寬度、必要時換行，避免導覽鈕整排寬滿。

## 保留之前尚未進 main 的更新

| 來源 | 本分支保留的程式內容 |
| --- | --- |
| `codex/images-download-to-mp4-cta-20261013` | 首頁/圖片庫/工具頁/MP4 入口/語系與 App 路由 |
| `codex/rxv-r2-batch-free-rollback-20261013` | R2 批次免費圖片 QA、PowerShell/批次工具、回復檢查 |
| `codex/line-apng-real-frame-qc-20261013` | WhatsApp 手機 ZIP 交接、APNG 真實影格品質檢查、相關測試 |
| `perf/reduce-cdn-transfer-20261012` | 小型 favicon、貼圖展示圖 lazy loading |
| `fix/line-sticker-animation-safe-padding-20261014` | 動態影格放大畫布安全縮放、12px 輸出安全距離；同時保留前述 APNG 影格檢查 |

這是**程式內容整合**，原始分支、未合併 PR 均保留；此整合提交不是原 PR 的 Git merge commit。
後續開發必須從**此整合分支（或將其正確合併後的最新分支）**往前繼續，禁止退回舊 main 直接覆蓋同名檔案。

## 本機驗證（尚未在 GitHub 上執行）

在 `D:\Pomodoro-app` 保留原本工作目錄，不要 reset 或強制覆蓋。
建議另外開一個工作樹檢查：

```powershell
cd D:\Pomodoro-app
git fetch origin codex/sticker-new-user-guided-steps-20261014
git worktree add D:\Pomodoro-app-sticker-guide-test origin/codex/sticker-new-user-guided-steps-20261014
cd D:\Pomodoro-app-sticker-guide-test
npm ci
node --test test/rxvStickerOnboarding.test.mjs
npm run build
npm run dev
```

**人工測試**：手機首頁 → 點「第 1 步」 → 選主題 → 第 2 步複製指令 → 用 AI 生圖 → 第 3 步上傳母圖 → 第 4 步確認切圖 → 第 5 步下載 ZIP；再驗證 LINE 靜態/動態、WhatsApp WebP 與手機匯入。確認原來的圖片下載轉 MP4 與免費圖片 QA 仍可執行。

不要先部署 Vercel Preview。只有本機驗證完成、完成分支差異審閱後才合併。
