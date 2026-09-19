# RXV FREE_ONLY 開發規則

## 最高原則

本專案以「0 元額外雲端成本」為第一優先。

任何新增功能、套件、API、資料庫、Storage、Serverless、背景任務，在實作前必須先做成本檢查。

不得因為開發方便，就直接導入可能產生付費或超額計費的服務。

---

## 架構優先順序

必須依下列順序優先評估：

1. 純前端
2. localStorage / IndexedDB
3. Windows 本機處理
4. 靜態 JSON / CSV
5. Cloudflare R2
6. Supabase Auth / 小型 DB
7. 少量必要 Serverless Function
8. 第三方 API
9. 付費或按量計費 API

若前一級可以完成，就不應使用下一級。

---

## Supabase

允許：
- Auth
- 必要的小型資料表
- 商品 metadata
- 訂單資料
- 必要使用者資料

預設禁止：
- 大量圖片
- MP4
- ZIP
- APK
- AI 生成素材
- 大型備份
- 可公開下載的大型檔案

新增 Supabase 功能前，必須先回答：
「這個功能不用 Supabase 是否可以完成？」

可以就不要使用 Supabase。

---

## Vercel

允許：
- React / Vite 網站部署
- 少量必要 API

禁止：
- 當大型圖片庫
- 當影片庫
- 大量 ZIP
- 長時間背景作業
- 大量影片轉檔
- 能在瀏覽器完成卻改用 Function 的工作

能在前端完成，就不用 Function。
能在本機完成，就不上雲端。

---

## Cloudflare R2

用途：
- 圖片
- ZIP
- 大型下載檔
- 必要公開素材

必須讀取 COST_LIMITS.json。

預設：
- 7 GB：警告
- 8 GB：停止新增大型檔案

不得繞過 stopUploadGB。

---

## GitHub

主要保存：
- 程式碼
- 小型設定
- 文件
- 小型 JSON

禁止大量保存：
- 圖片
- MP4
- ZIP
- APK
- AI 素材庫
- 備份

---

## AI / API

優先：
1. 已有訂閱內功能
2. 免費額度
3. Ollama
4. ComfyUI
5. 本機模型

未經使用者明確同意，禁止導入：
- 按 token 計費 API
- 按圖片計費 API
- 按影片計費 API
- 自動充值
- 自動升級
- recurring billing SaaS

---

## RXV COST GATE

每次新增功能前，先輸出：

- 功能：
- 使用服務：
- 是否免費：
- 會消耗什麼免費額度：
- 大量使用風險：
- 免費替代方案：
- 是否需要資料庫：
- 是否需要 Serverless：
- 是否需要付費 API：
- 停止線：

若存在可能產生成本的風險，先停止實作並說明，不得直接導入。

---

## 開發原則

永遠優先：
- 最快可用
- 最少步驟
- 零成本
- 本機優先
- 可備份
- 可續跑
- 可移轉
- 避免供應商綁定
