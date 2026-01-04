-- 建立 RPC 函數：取得或初始化使用者點數
-- 如果 user_credits 不存在，自動新增一筆 remaining_chars = 10000
-- 回傳該使用者的 remaining_chars
-- ⚠️ 使用 security definer 避免被 RLS 阻擋

CREATE OR REPLACE FUNCTION public.get_or_init_user_credits()
RETURNS TABLE (remaining_chars INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 如果 user_credits 記錄不存在，則建立
  INSERT INTO public.user_credits (
    user_id,
    remaining_chars,
    total_credits,
    trial_expires_at,
    updated_at
  )
  VALUES (
    auth.uid(),
    10000,
    10000,
    now() + interval '7 days',
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 回傳該使用者的 remaining_chars
  RETURN QUERY
  SELECT uc.remaining_chars
  FROM public.user_credits uc
  WHERE uc.user_id = auth.uid();
END;
$$;

COMMENT ON FUNCTION public.get_or_init_user_credits() IS '取得或初始化使用者點數：如果 user_credits 不存在則新增（remaining_chars = 10000），並回傳該使用者的 remaining_chars。使用 security definer 避免被 RLS 阻擋。';
