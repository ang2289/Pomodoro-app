-- 檢查 user_credits 表的實際結構
-- 在 Supabase Dashboard → SQL Editor 中執行此查詢

-- 方法 1：查詢 information_schema 獲取所有欄位資訊
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_credits'
ORDER BY ordinal_position;

-- 方法 2：檢查特定欄位是否存在
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_credits' 
      AND column_name = 'remaining_chars'
  ) THEN '✅ remaining_chars 存在' ELSE '❌ remaining_chars 不存在' END AS remaining_chars_check,
  
  CASE WHEN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_credits' 
      AND column_name = 'total_credits'
  ) THEN '✅ total_credits 存在' ELSE '❌ total_credits 不存在' END AS total_credits_check,
  
  CASE WHEN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_credits' 
      AND column_name = 'trial_expires_at'
  ) THEN '✅ trial_expires_at 存在' ELSE '❌ trial_expires_at 不存在' END AS trial_expires_at_check;

-- 方法 3：簡潔版本 - 只列出欄位名稱
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_credits'
ORDER BY ordinal_position;


