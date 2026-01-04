-- ============================================
-- RPC 函數：初始化匿名使用者
-- ============================================
-- 功能：為匿名使用者建立 user_credits 記錄
-- 輸入：p_anonymous_user_id (uuid)
-- 行為：
--   1. 檢查 user_credits 是否存在該 anonymous_user_id
--   2. 若不存在：
--      - 建立一筆 user_credits（使用 anonymous_user_id 作為 user_id）
--      - trial_total_chars = 10000
--      - trial_used_chars = 0
--      - paid_total_chars = 0
--      - paid_used_chars = 0
--   3. 若已存在，什麼都不做
--   4. 必須是 idempotent（可重複呼叫不會重建）
--   5. 只做初始化，不扣點
-- ============================================

CREATE OR REPLACE FUNCTION public.init_anonymous_user(
  p_anonymous_user_id UUID
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
    WHERE user_id = p_anonymous_user_id
  ) THEN
    INSERT INTO public.user_credits (
      user_id,
      trial_total_chars,
      trial_used_chars,
      paid_total_chars,
      paid_used_chars,
      updated_at
    )
    VALUES (
      p_anonymous_user_id,
      10000,  -- trial_total_chars
      0,      -- trial_used_chars
      0,      -- paid_total_chars
      0,      -- paid_used_chars
      NOW()   -- updated_at
    )
    ON CONFLICT (user_id) DO NOTHING;  -- 確保 idempotent
  END IF;
END;
$$;

-- 授予執行權限
GRANT EXECUTE ON FUNCTION public.init_anonymous_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.init_anonymous_user(UUID) TO anon;

-- 註解說明
COMMENT ON FUNCTION public.init_anonymous_user(UUID) IS '初始化匿名使用者：建立 user_credits 記錄，設定 trial_total_chars = 10000, trial_used_chars = 0, paid_total_chars = 0, paid_used_chars = 0（只做初始化，不扣點）';
