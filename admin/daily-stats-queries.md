# 每日統計 SQL 查詢備忘

此文件包含用於每日統計的 SQL 查詢，可用於建立管理後台儀表板。

---

## 1. 今日註冊數

**用途說明：**
統計今日新註冊的使用者數量，用於：
- 追蹤每日新用戶成長
- 分析註冊趨勢
- 評估行銷活動效果

```sql
SELECT 
  COUNT(*) AS today_registrations
FROM auth.users
WHERE DATE(created_at) = CURRENT_DATE;
```

**詳細版本（含 Email）：**
```sql
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' AS full_name
FROM auth.users
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## 2. 今日匯款回報數

**用途說明：**
統計今日收到的匯款回報數量，用於：
- 追蹤每日匯款回報數量
- 評估補點需求
- 監控匯款流程效率

```sql
SELECT 
  COUNT(*) AS today_payment_reports
FROM public.payment_reports
WHERE DATE(created_at) = CURRENT_DATE;
```

**詳細版本（含金額）：**
```sql
SELECT 
  id,
  email,
  plan_id,
  amount_ntd,
  status,
  processed,
  created_at
FROM public.payment_reports
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## 3. 今日補點成功數

**用途說明：**
統計今日成功補點的數量，用於：
- 追蹤每日補點完成數量
- 評估補點處理效率
- 監控補點流程

```sql
SELECT 
  COUNT(*) AS today_processed_payments
FROM public.payment_reports
WHERE processed = true
  AND DATE(processed_at) = CURRENT_DATE;
```

**詳細版本（含補點資訊）：**
```sql
SELECT 
  pr.id,
  pr.email,
  pr.plan_id,
  pr.amount_ntd,
  pr.processed_at,
  au.email AS user_email,
  CASE 
    WHEN pr.plan_id = '99' THEN 100000
    WHEN pr.plan_id = '199' THEN 300000
    ELSE 0
  END AS credits_added
FROM public.payment_reports pr
LEFT JOIN auth.users au ON pr.email = au.email
WHERE pr.processed = true
  AND DATE(pr.processed_at) = CURRENT_DATE
ORDER BY pr.processed_at DESC;
```

---

## 4. 今日點數使用總量

**用途說明：**
統計今日所有使用者使用的點數總量，用於：
- 追蹤每日點數消耗
- 評估系統使用量
- 分析功能使用情況

```sql
SELECT 
  COALESCE(SUM(total_chars), 0) AS today_total_usage
FROM public.usage_logs
WHERE DATE(created_at) = CURRENT_DATE;
```

**詳細版本（依功能分類）：**
```sql
SELECT 
  feature,
  COUNT(*) AS usage_count,
  SUM(total_chars) AS total_chars_used,
  SUM(input_chars) AS total_input_chars,
  SUM(output_chars) AS total_output_chars,
  AVG(total_chars) AS avg_chars_per_use
FROM public.usage_logs
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY feature
ORDER BY total_chars_used DESC;
```

**依使用者統計：**
```sql
SELECT 
  ul.user_id,
  au.email,
  COUNT(*) AS usage_count,
  SUM(ul.total_chars) AS total_chars_used,
  STRING_AGG(DISTINCT ul.feature, ', ') AS features_used
FROM public.usage_logs ul
LEFT JOIN auth.users au ON ul.user_id = au.id
WHERE DATE(ul.created_at) = CURRENT_DATE
GROUP BY ul.user_id, au.email
ORDER BY total_chars_used DESC
LIMIT 20;
```

---

## 綜合查詢（一次取得所有統計）

**用途說明：**
一次查詢取得所有今日統計數據，適合用於儀表板顯示。

```sql
WITH today_stats AS (
  SELECT 
    -- 今日註冊數
    (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) = CURRENT_DATE) AS today_registrations,
    
    -- 今日匯款回報數
    (SELECT COUNT(*) FROM public.payment_reports WHERE DATE(created_at) = CURRENT_DATE) AS today_payment_reports,
    
    -- 今日補點成功數
    (SELECT COUNT(*) FROM public.payment_reports WHERE processed = true AND DATE(processed_at) = CURRENT_DATE) AS today_processed_payments,
    
    -- 今日點數使用總量
    (SELECT COALESCE(SUM(total_chars), 0) FROM public.usage_logs WHERE DATE(created_at) = CURRENT_DATE) AS today_total_usage,
    
    -- 今日匯款總金額
    (SELECT COALESCE(SUM(amount_ntd), 0) FROM public.payment_reports WHERE DATE(created_at) = CURRENT_DATE) AS today_payment_amount
)
SELECT * FROM today_stats;
```

---

## 使用建議

1. **執行頻率：** 建議每日執行一次，用於建立每日統計報表
2. **執行時間：** 建議在每日結束時（23:59）或隔日開始時（00:00）執行
3. **儲存方式：** 可將查詢結果儲存到統計表或記錄在管理後台
4. **視覺化：** 建議建立儀表板（Dashboard）顯示這些統計數據

---

## 注意事項

- 所有查詢都需要適當的資料庫權限
- 建議在 Supabase Dashboard > SQL Editor 中執行
- 查詢結果可能包含敏感資訊，請妥善保管
- `CURRENT_DATE` 使用資料庫伺服器的時區，請確認時區設定正確
- 如需特定時區，可使用 `DATE(created_at AT TIME ZONE 'Asia/Taipei') = CURRENT_DATE`

---

## 後續 UI 開發建議

建立管理後台儀表板時，建議包含：

1. **統計卡片區塊：**
   - 今日註冊數（卡片）
   - 今日匯款回報數（卡片）
   - 今日補點成功數（卡片）
   - 今日點數使用總量（卡片）

2. **詳細列表：**
   - 今日註冊用戶列表
   - 今日匯款回報列表
   - 今日補點記錄列表
   - 今日使用記錄排行

3. **圖表視覺化：**
   - 每日註冊趨勢圖（過去 7 天 / 30 天）
   - 每日匯款金額趨勢圖
   - 每日點數使用趨勢圖
   - 功能使用分布圓餅圖

