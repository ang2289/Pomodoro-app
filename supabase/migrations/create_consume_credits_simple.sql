-- 建立簡化版 consume_credits RPC 函數
-- 接受總額（p_amount）而不是分別的 input_chars 和 output_chars
-- 用於前端直接呼叫，簡化扣點流程

CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_feature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_before_remaining INTEGER;
  v_after_remaining INTEGER;
BEGIN
  -- 驗證 feature 參數（支援 summary, homework, seo）
  IF p_feature NOT IN ('summary', 'homework', 'seo') THEN
    RAISE EXCEPTION 'invalid_feature' 
      USING MESSAGE = format('Invalid feature: %s. Must be "summary", "homework", or "seo"', p_feature),
            ERRCODE = '22P02';
  END IF;

  -- 驗證金額參數
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount' 
      USING MESSAGE = 'Amount must be positive',
            ERRCODE = '22P02';
  END IF;

  -- 初始化使用者點數（如果不存在）
  INSERT INTO public.user_credits (user_id, remaining_chars)
  VALUES (p_user_id, 10000)
  ON CONFLICT (user_id) DO NOTHING;

  -- 🔒 鎖定行並取得目前剩餘點數（FOR UPDATE）
  SELECT remaining_chars INTO v_before_remaining
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- 關鍵：鎖定該列，防止並發更新

  -- 如果使用者不存在（理論上不應該發生，因為上面已經 INSERT）
  IF v_before_remaining IS NULL THEN
    RAISE EXCEPTION 'user_not_found' 
      USING MESSAGE = format('User credits record not found for user_id: %s', p_user_id),
            ERRCODE = 'P0002';
  END IF;

  -- 試用到期檢查
  IF EXISTS (
    SELECT 1
    FROM public.user_credits
    WHERE user_id = p_user_id
      AND trial_expires_at IS NOT NULL
      AND trial_expires_at < NOW()
  ) THEN
    -- 試用已到期，回傳 false（不拋出異常，讓前端處理）
    RETURN false;
  END IF;

  -- 檢查點數是否足夠
  IF v_before_remaining < p_amount THEN
    -- 點數不足，回傳 false（不拋出異常，讓前端處理）
    RETURN false;
  END IF;

  -- 計算扣除後的剩餘點數
  v_after_remaining := v_before_remaining - p_amount;

  -- 原子更新：扣除點數
  UPDATE public.user_credits
  SET remaining_chars = v_after_remaining,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 插入使用紀錄（input_chars 和 output_chars 都設為 0，因為只記錄總額）
  INSERT INTO public.usage_logs (
    user_id,
    feature,
    input_chars,
    output_chars,
    total_chars,
    before_remaining,
    after_remaining,
    created_at
  ) VALUES (
    p_user_id,
    p_feature,
    0, -- input_chars 設為 0（因為只記錄總額）
    0, -- output_chars 設為 0（因為只記錄總額）
    p_amount, -- total_chars 使用 p_amount
    v_before_remaining,
    v_after_remaining,
    NOW()
  );

  -- 回傳 true 表示扣點成功
  RETURN true;

  -- 如果發生任何錯誤，PostgreSQL 會自動 ROLLBACK
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 註解說明
COMMENT ON FUNCTION public.consume_credits(UUID, INTEGER, TEXT) IS 
  '簡化版扣點數函數：接受總額（p_amount）而不是分別的 input_chars 和 output_chars。參數：user_id, amount（總額）, feature（summary/homework/seo）。回傳 true 表示成功，false 表示點數不足。';

-- ⚠️ 注意：此函數與現有的 consume_credits(UUID, TEXT, INTEGER, INTEGER) 函數並存
-- PostgreSQL 會根據參數數量自動選擇正確的函數版本

