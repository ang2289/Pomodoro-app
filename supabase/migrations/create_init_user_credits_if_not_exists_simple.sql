-- 建立或更新 init_user_credits_if_not_exists 函數（簡化版，返回 VOID）
-- 如果函數不存在，執行此 SQL 建立
-- 此版本符合現有的 user_credits 表結構

CREATE OR REPLACE FUNCTION public.init_user_credits_if_not_exists(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 如果 user_credits 記錄不存在，則建立
  IF NOT EXISTS (
    SELECT 1 
    FROM public.user_credits 
    WHERE user_id = p_user_id
  ) THEN
    INSERT INTO public.user_credits (
      user_id,
      remaining_chars,
      total_credits,
      trial_expires_at,
      updated_at
    )
    VALUES (
      p_user_id,
      10000,
      10000,
      now() + interval '7 days',
      now()
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.init_user_credits_if_not_exists(UUID) IS '初始化使用者點數（如果不存在）：建立 user_credits 記錄，設定 remaining_chars = 10000, total_credits = 10000, trial_expires_at = now() + 7 days';

-- 注意：此函數返回 VOID，與現有的返回 INTEGER 版本不同
-- 如果前端需要返回值，請使用 create_user_credits_system.sql 中的版本

