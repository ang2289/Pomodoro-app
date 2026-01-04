-- 建立 RPC 函數：取得使用者點數資訊（包含 remaining_chars, total_credits, trial_expires_at）
-- 用於取代前端直接 REST 查詢 user_credits

CREATE OR REPLACE FUNCTION public.get_user_credits_info(
  p_user_id UUID
)
RETURNS TABLE (
  remaining_chars INTEGER,
  total_credits INTEGER,
  trial_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining_chars INTEGER;
  v_total_credits INTEGER;
  v_trial_expires_at TIMESTAMPTZ;
BEGIN
  -- 從 public.user_credits 讀取該 user_id 的資料
  SELECT 
    uc.remaining_chars,
    uc.total_credits,
    uc.trial_expires_at
  INTO 
    v_remaining_chars,
    v_total_credits,
    v_trial_expires_at
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;
  
  -- 若不存在則回傳 0, 0, NULL
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, NULL::TIMESTAMPTZ;
  ELSE
    -- 回傳查詢到的資料
    RETURN QUERY SELECT 
      COALESCE(v_remaining_chars, 0)::INTEGER,
      COALESCE(v_total_credits, 0)::INTEGER,
      v_trial_expires_at;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_user_credits_info(UUID) IS '取得使用者點數資訊（remaining_chars, total_credits, trial_expires_at），用於取代前端直接 REST 查詢。若不存在則回傳 0, 0, NULL';

