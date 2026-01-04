-- 驗證 init_user_credits_if_not_exists 函數是否存在
-- 在 Supabase SQL Editor 中執行此查詢

SELECT 
  proname AS function_name,
  pronamespace::regnamespace AS schema,
  proowner::regrole AS owner,
  prosrc AS function_body
FROM pg_proc 
WHERE proname = 'init_user_credits_if_not_exists';

-- 正常應該查得到 1 筆，owner 是 postgres



