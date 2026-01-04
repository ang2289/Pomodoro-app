# 點數系統監控 SQL 查詢（每週檢查 SOP）

此文件包含用於監控點數系統的 SQL 查詢，建議每週執行一次，用於：
- 追蹤試用期狀態
- 識別高潛力用戶
- 監控功能使用情況
- 檢查付費帳號狀態

---

## 1. 試用 2 天內到期名單

**用途說明：**
此查詢用於找出試用期將在 2 天內到期的使用者，可用於：
- 發送試用到期提醒通知
- 準備轉換為付費用戶的行銷活動
- 追蹤試用期即將結束的用戶數量

```sql
SELECT 
  uc.user_id,
  au.email,
  uc.remaining_chars,
  uc.total_credits,
  uc.trial_expires_at,
  uc.trial_expires_at - NOW() AS days_until_expiry,
  uc.updated_at
FROM public.user_credits uc
JOIN auth.users au ON uc.user_id = au.id
WHERE uc.trial_expires_at IS NOT NULL
  AND uc.trial_expires_at > NOW()
  AND uc.trial_expires_at <= NOW() + INTERVAL '2 days'
ORDER BY uc.trial_expires_at ASC;
```

---

## 2. 試用過期但仍有剩餘點數名單

**用途說明：**
此查詢用於找出試用期已過期但仍剩餘點數的使用者，可用於：
- 識別可能需要延長試用期的特殊情況
- 檢查是否有系統邏輯錯誤（過期後仍能使用）
- 準備清理或處理這些帳號

```sql
SELECT 
  uc.user_id,
  au.email,
  uc.remaining_chars,
  uc.total_credits,
  uc.trial_expires_at,
  NOW() - uc.trial_expires_at AS days_since_expiry,
  uc.updated_at
FROM public.user_credits uc
JOIN auth.users au ON uc.user_id = au.id
WHERE uc.trial_expires_at IS NOT NULL
  AND uc.trial_expires_at < NOW()
  AND uc.remaining_chars > 0
ORDER BY uc.trial_expires_at ASC;
```

---

## 3. 使用超過 9000 點的高潛力用戶

**用途說明：**
此查詢用於找出已使用超過 9000 點的使用者（接近 10,000 點試用額度），可用於：
- 識別高活躍度的潛在付費用戶
- 準備針對性的升級行銷活動
- 追蹤用戶使用習慣和需求

```sql
SELECT 
  uc.user_id,
  au.email,
  uc.remaining_chars,
  uc.total_credits,
  uc.total_credits - uc.remaining_chars AS used_chars,
  uc.trial_expires_at,
  uc.updated_at
FROM public.user_credits uc
JOIN auth.users au ON uc.user_id = au.id
WHERE (uc.total_credits - uc.remaining_chars) >= 9000
ORDER BY used_chars DESC;
```

---

## 4. 功能使用排行（依 total chars）

**用途說明：**
此查詢用於統計各功能的使用情況，依總使用字數排序，可用於：
- 了解哪些功能最受歡迎
- 分析用戶使用偏好
- 優化功能開發優先順序
- 評估各功能的資源消耗

```sql
SELECT 
  feature,
  COUNT(*) AS usage_count,
  SUM(total_chars) AS total_chars_used,
  SUM(input_chars) AS total_input_chars,
  SUM(output_chars) AS total_output_chars,
  AVG(total_chars) AS avg_chars_per_use,
  MIN(created_at) AS first_usage,
  MAX(created_at) AS last_usage
FROM public.usage_logs
GROUP BY feature
ORDER BY total_chars_used DESC;
```

---

## 5. 已付費帳號點數檢查

**用途說明：**
此查詢用於檢查已付費的帳號（total_credits > 10000）的點數狀態，可用於：
- 確認付費用戶的點數是否正常
- 檢查是否有異常的點數消耗
- 追蹤付費用戶的使用情況
- 驗證付費加點是否正確記錄

```sql
SELECT 
  uc.user_id,
  au.email,
  uc.remaining_chars,
  uc.total_credits,
  uc.total_credits - uc.remaining_chars AS used_chars,
  uc.total_credits - 10000 AS paid_credits,
  uc.trial_expires_at,
  uc.updated_at,
  CASE 
    WHEN uc.remaining_chars = 0 THEN '點數已用完'
    WHEN uc.remaining_chars < 1000 THEN '點數即將用完'
    ELSE '點數充足'
  END AS status
FROM public.user_credits uc
JOIN auth.users au ON uc.user_id = au.id
WHERE uc.total_credits > 10000
ORDER BY uc.total_credits DESC;
```

---

## 使用建議

1. **執行頻率：** 建議每週執行一次所有查詢
2. **執行時間：** 建議在週一上午執行，以便掌握上週的使用情況
3. **記錄方式：** 將查詢結果截圖或匯出，記錄在管理後台或文件中
4. **後續行動：**
   - 試用即將到期：準備發送提醒通知
   - 高潛力用戶：準備升級行銷活動
   - 功能使用排行：分析功能優化方向
   - 付費帳號異常：聯繫用戶確認

---

## 注意事項

- 所有查詢都需要適當的資料庫權限
- 建議在 Supabase Dashboard > SQL Editor 中執行
- 查詢結果可能包含敏感資訊，請妥善保管
- 定期檢查可幫助及早發現系統問題


