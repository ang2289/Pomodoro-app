-- 更新 consume_credits 函數以支援新的資料表結構
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行此腳本
-- 
-- 說明：
-- 1. 更新 consume_credits 函數，同時更新 used_credits 和 remaining_chars
-- 2. 保持向後兼容，remaining_chars 由觸發器自動同步

-- ==========================================
-- 更新 consume_credits 函數（UUID 版本）
-- ==========================================

CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_feature TEXT,
  p_input_chars INTEGER,
  p_output_chars INTEGER
)
RETURNS TABLE(
  remaining_chars INTEGER,
  before_remaining INTEGER,
  after_remaining INTEGER
) AS $$
DECLARE
  v_total_chars INTEGER;
  v_before_remaining INTEGER;
  v_after_remaining INTEGER;
  v_before_used INTEGER;
  v_after_used INTEGER;
BEGIN
  -- 計算總使用字數
  v_total_chars := p_input_chars + p_output_chars;

  -- 驗證 feature 參數
  IF p_feature NOT IN ('summary', 'homework') THEN
    RAISE EXCEPTION 'invalid_feature' 
      USING MESSAGE = format('Invalid feature: %s. Must be "summary" or "homework"', p_feature),
            ERRCODE = '22P02';
  END IF;

  -- 驗證字數參數
  IF p_input_chars < 0 OR p_output_chars < 0 THEN
    RAISE EXCEPTION 'invalid_chars' 
      USING MESSAGE = 'Input and output chars must be non-negative',
            ERRCODE = '22P02';
  END IF;

  -- ==========================================
  -- 開始 Transaction（自動處理）
  -- ==========================================

  -- 初始化使用者點數（如果不存在）
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, remaining_chars)
  VALUES (p_user_id, 10000, 0, 10000)
  ON CONFLICT (user_id) DO NOTHING;

  -- 🔒 鎖定行並取得目前點數（FOR UPDATE）
  SELECT remaining_chars, used_credits INTO v_before_remaining, v_before_used
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- 關鍵：鎖定該列，防止並發更新

  -- 如果使用者不存在（理論上不應該發生，因為上面已經 INSERT）
  IF v_before_remaining IS NULL THEN
    RAISE EXCEPTION 'user_not_found' 
      USING MESSAGE = format('User credits record not found for user_id: %s', p_user_id),
            ERRCODE = 'P0002';
  END IF;

  -- 檢查點數是否足夠
  IF v_before_remaining < v_total_chars THEN
    -- 點數不足，拋出異常（會自動 ROLLBACK）
    RAISE EXCEPTION 'insufficient_credits' 
      USING MESSAGE = format(
        'Insufficient credits: remaining %s, requested %s (input: %s, output: %s)',
        v_before_remaining,
        v_total_chars,
        p_input_chars,
        p_output_chars
      ),
      HINT = 'Please purchase more credits',
      ERRCODE = 'P0001';
  END IF;

  -- 計算扣除後的剩餘點數和已使用點數
  v_after_remaining := v_before_remaining - v_total_chars;
  v_after_used := COALESCE(v_before_used, 0) + v_total_chars;

  -- 原子更新：同時更新 used_credits 和 remaining_chars
  -- remaining_chars 會由觸發器自動同步（total_credits - used_credits）
  UPDATE public.user_credits
  SET used_credits = v_after_used,
      remaining_chars = v_after_remaining, -- 觸發器會確保一致性
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 插入使用紀錄
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
    p_input_chars,
    p_output_chars,
    v_total_chars,
    v_before_remaining,
    v_after_remaining,
    NOW()
  );

  -- 回傳結果（COMMIT 會在函數結束時自動執行）
  RETURN QUERY SELECT
    v_after_remaining AS remaining_chars,
    v_before_remaining AS before_remaining,
    v_after_remaining AS after_remaining;

  -- 如果發生任何錯誤，PostgreSQL 會自動 ROLLBACK
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 註解說明
COMMENT ON FUNCTION public.consume_credits(UUID, TEXT, INTEGER, INTEGER) IS 
  '核心扣點數函數：在單一 transaction 中完成扣點和記錄，使用 FOR UPDATE 防止 race condition。同時更新 used_credits 和 remaining_chars。參數：user_id, feature (summary/homework), input_chars, output_chars';

