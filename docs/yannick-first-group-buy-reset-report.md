# 亞尼克第一團測試資料重設稽核報告

稽核日期：2026-07-20（Asia/Taipei）  
目標 slug：`yannick-first-group-buy`  
本報告階段：**2026-07-20 已完成正式重設；未寄送 Email。**

## 正式執行結果（2026-07-20）

- 已在 Supabase SQL Editor 以單一 transaction 執行並 COMMIT。
- 已刪除 7 筆測試訂單及其 21 筆明細、3 筆匯款回報、26 筆訂單事件、1 筆 recovery token、17 筆訂單通知。
- 重設後訂單、明細、匯款回報、訂單事件、recovery token、訂單通知均為 0。
- Campaign 狀態為 `registration_open`，公開登記與已付款進度均為 0。
- 公開／已付款門檻均為 70，`payment_open_mode = manual`。
- 開始時間更新為 2026-07-20 18:08（台灣時間）；結團日使用資料庫既有原始日期 2026-07-30 15:59。
- 付款期限、開放付款時間、關閉登記時間、供應商下單時間皆為空白。
- 保留商品 9 筆、圖片 54 筆、冷凍宅配 1 筆；Storage 未操作。
- 正式頁已確認顯示「目前已登記 0，成團門檻 70」及「登入後送出團購登記」，且未顯示銀行帳號。
- 可還原備份：`backups/group-buy/yannick-first-group-buy-test-data-20260720-verified.json`（Git ignored，已移除 access/recovery token hash）。

## 已確認的正式資料

| 項目 | 唯讀查詢結果 |
| --- | --- |
| Campaign ID | `a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410` |
| Campaign slug | `yannick-first-group-buy` |
| Campaign title | `test ~ 亞尼克生乳捲第一團｜單條也享76折` |
| Workspace ID | `d5c44874-8a20-44a3-8505-20bcd39441a3` |
| Workspace | `RXV 團購工作空間` / `rxv-d42de46c` / `active` |
| 目前活動狀態 | `payment_open` |
| 目前門檻 | 登記 58、已付款 58 |
| 建議門檻 | 登記 70、已付款 70 |
| 開放付款模式 | `manual` |
| 預計結團日期 | 2026-07-18 17:00（台灣時間），**已過期** |
| 原始預計結團日期欄位 | 2026-07-30 15:59（台灣時間） |
| 預計出貨規則 | 7～14 個工作天（保留） |

資料庫依 slug 查到唯一活動，ID 與畫面曾顯示值一致；workspace ID、名稱與狀態也一致。資料庫目前只有這一個團購 campaign，未發現其他團購活動。

## 預計刪除筆數

下列數字於 2026-07-20 以 Supabase REST service-role **唯讀**查詢取得：

| 刪除順序 | 資料表 | 筆數 | 關聯依據 |
| ---: | --- | ---: | --- |
| 1 | `group_buy_notifications` | 17 | `campaign_id` 與目標訂單 `order_id` 同時符合 |
| 2 | `group_buy_order_recovery_tokens` | 1 | `order_id` |
| 3 | `group_buy_payment_reports` | 3 | `order_id` |
| 4 | `group_buy_order_events` | 26 | `order_id` |
| 5 | `group_buy_order_items` | 21 | `order_id` |
| 6 | `group_buy_orders` | 7 | `campaign_id` |

目前有效（非 cancelled）登記數為 53，已確認付款數為 6。刪除訂單後，公開進度、後台登記數、已付款數與商品彙總都會由資料重新計算為 0，沒有額外的計數器資料需要清除。

通知紀錄包含 16 筆 `notification_pending` 與 1 筆 `notification_sent`；重設腳本只刪除同時符合 campaign 與這 7 筆測試訂單的通知，不會碰其他活動或 campaign 設定。

## 明確保留資料

| 資料 | 筆數／處理 |
| --- | --- |
| `group_buy_campaigns` | 1 筆，保留原 ID、slug、標題與設定 |
| `group_buy_products` | 9 筆，全數保留；價格、成本、單位與詳情不變 |
| `group_buy_product_images` | 54 筆，全數保留 |
| `group_buy_shipping_methods` | 1 筆，保留冷凍宅配、未滿 10 條 200 元、滿 10 條免運 |
| `group_buy_workspaces`、members、users | 全數保留 |
| 收款銀行資料 | 保留；重設腳本未更新銀行欄位 |
| Supabase Storage | **不呼叫 Storage API，也不對 `storage.*` 做 DELETE/UPDATE** |
| Email／站內通知程式 | 保留；本次不寄信 |

公開文案的 `description` 與 `notice_text` 目前仍寫「58 條」。重設腳本只把字面 `58 條` 改成一般用語「成團門檻」，實際顯示數字由資料庫 `min_registration_value = 70` 提供；供應商 58 條的內部成本／備註不在上述公開欄位中。

## Schema、外鍵與刪除策略

已檢查 migrations、PostgREST OpenAPI schema、`api/group-buy.ts` 與 `src/lib/groupBuyApi.ts`。實際資料庫可見 13 張 `group_buy_*` 表。已確認的關聯包括：

- campaign → orders / products / shipping methods / notifications / campaign events
- order → items / payment reports / order events / recovery tokens / notifications
- product → product images
- order → shipping method、user

Repository migrations 明確定義 `group_buy_order_recovery_tokens.order_id`、`group_buy_notifications.campaign_id/order_id`、`group_buy_campaign_events.campaign_id`、`group_buy_product_images.product_id` 為 `ON DELETE CASCADE`。較早建立的 orders/items/payment reports/order events 基礎建表 SQL不在目前 repository；PostgREST 可確認外鍵方向，但不提供 `ON DELETE` 動作。因此預覽 SQL會直接從 `pg_constraint.confdeltype` 顯示正式資料庫的實際動作，正式重設仍採最下層到訂單的明確 DELETE，不依賴 cascade。

## 人工確認清單與風險

1. **目前預計結團日已過期，但資料庫保存的原始結團日仍是 2026-07-30 15:59（台灣時間）。** 經正式重新開團要求，重設腳本會把 `registration_ends_at` 恢復成這個既有日期；不自行編造日期。若執行時該日期已過，guard 會直接中止並 rollback。
2. 活動標題目前含 `test ~`。因要求保留標題，重設腳本不修改；正式開團前請確認是否手動移除。
3. `group_buy_campaign_events` 有 1 筆 `payment_opened`（`registration_open → payment_open`）。此表沒有 `order_id`，無法證明只由測試訂單產生，因此腳本預設保留並列為人工確認。
4. Campaign schema 沒有 `closed_at`、`completed_at`、`shipped_at` 欄位。已存在且屬 campaign 主流程的欄位只有 `registration_closed_at`、`payment_opened_at`、`supplier_ordered_at` 等；腳本不會猜測或新增欄位。
5. `registration_ends_at` 與 `original_registration_ends_at` 目前前後不一致（現值較早且已過期）。為使正式團能重新登記，腳本只把前者恢復為資料庫已保存的原始日期，不修改原始日期內容。

## 門檻程式檢查

後端進度、達標、手動開放付款、正式成團、Excel 彙總、付款核對與批次出貨均由 campaign 的 `min_registration_value`、`min_paid_value`、`threshold_mode` 與訂單/明細資料計算，沒有以 58 或 70 作判斷。

發現公開頁提示、首頁宣傳文案與後台初始化範本曾寫死 58，均已改成資料庫欄位或一般「成團門檻」文字。後台的門檻判斷原本已使用載入自資料庫的 `form.minRegistrationValue`／`form.minPaidValue`；未設定門檻的新活動現在會阻擋儲存。亞尼克 seed 的公開門檻集中在 `v_public_threshold`，正式既有資料仍以本次 reset SQL設定為準。

## 執行方式

1. 在 Supabase SQL Editor 執行 `supabase/scripts/preview-reset-yannick-first-group-buy.sql`。
2. 確認 identity 顯示唯一 campaign/workspace，並逐項核對預覽筆數與外鍵 `ON DELETE`。
3. 執行 `supabase/scripts/backup-yannick-first-group-buy-test-data.sql`，將唯一 JSON 結果下載至 `backups/group-buy/`，不要提交 Git。
4. 執行 `supabase/scripts/reset-yannick-first-group-buy.sql`。它預設 `ROLLBACK`，只用來演練並檢查最後查詢結果。
5. 演練結果正確且備份已下載後，另存一份執行副本，把**最後一行** `ROLLBACK` 改為 `COMMIT`，再次完整執行。不要只執行局部 DELETE。
6. COMMIT 後重新執行 preview SQL；刪除表筆數應為 0，保留筆數應仍為商品 9、圖片 54、配送方式 1。

## 還原方式

若 COMMIT 後需要還原，使用下載的 JSON，在新的 transaction 內依序插回：orders → order items → payment reports → order events → notifications。因備份刻意不含 access-token hash 與 recovery-token hash，還原時必須產生新的 order access hash，且 recovery link 必須重新簽發；不得嘗試復原舊 token。完整驗證後才 COMMIT。

## 正式開團前檢查清單

- [ ] 確認使用資料庫既有原始結團日 2026-07-30 15:59（台灣時間）
- [ ] 確認是否移除標題 `test ~`
- [ ] 執行預覽 SQL並核對外鍵/筆數
- [ ] 下載 JSON 備份到 Git ignored 目錄
- [ ] 先跑 ROLLBACK 演練，再人工決定是否 COMMIT
- [ ] 訂單、匯款回報、訂單通知均為 0
- [ ] 商品 9 筆、圖片 54 筆、配送方式 1 筆仍存在
- [ ] 公開門檻顯示 70，進度為 0
- [ ] 達 70 條只顯示已達門檻，不自動結團或付款
- [ ] `payment_open_mode = manual`，付款資料未開放
- [ ] 團媽後台按「成團，開放付款」才進入付款階段
- [ ] 冷凍宅配與 10 條免運規則正確
- [ ] 商品詳情與多張圖片正常
- [ ] 未觸發任何測試 Email
- [ ] `npm run build` 成功
