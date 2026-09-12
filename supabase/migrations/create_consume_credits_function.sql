-- 建立原子扣點數函數（避免 race condition）
-- ⚠️ 重要：此函數使用 PostgreSQL 的原子更新，確保同時請求不會超扣
-- 
-- 支援兩種呼叫方式：
-- 1. UUID（正規方式）：consume_user_credits('uuid-here'::uuid, 100)
-- 2. TEXT（向後兼容）：consume_user_credits('text-id', 100)

-- UUID 版本（正規）
CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id UUID,
  p_used_chars INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_chars INTEGER;
  v_remaining_chars INTEGER;
BEGIN
  -- 初始化使用者點數（如果不存在）
  INSERT INTO public.user_credits (user_id, remaining_chars)
  VALUES (p_user_id, 10000)
  ON CONFLICT (user_id) DO NOTHING;

  -- 取得目前剩餘點數（鎖定該列）
  SELECT remaining_chars INTO v_current_chars
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- 🔒 鎖定該列，防止並發更新

  -- 檢查點數是否足夠
  IF v_current_chars < p_used_chars THEN
    RAISE EXCEPTION 'insufficient_credits' 
      USING MESSAGE = format('Insufficient credits: remaining %s, requested %s', v_current_chars, p_used_chars),
            HINT = 'Please purchase more credits',
            ERRCODE = 'P0001';
  END IF;

  -- 原子更新：扣除點數
  UPDATE public.user_credits
  SET remaining_chars = remaining_chars - p_used_chars,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING remaining_chars INTO v_remaining_chars;

  -- 回傳剩餘點數
  RETURN v_remaining_chars;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TEXT 版本（向後兼容，用於匿名使用者）
CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id TEXT,
  p_used_chars INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_chars INTEGER;
  v_remaining_chars INTEGER;
BEGIN
  -- 初始化使用者點數（如果不存在）
  INSERT INTO public.user_credits (user_id, remaining_chars)
  VALUES (p_user_id::UUID, 10000)
  ON CONFLICT (user_id) DO NOTHING;

  -- 取得目前剩餘點數（鎖定該列）
  SELECT remaining_chars INTO v_current_chars
  FROM public.user_credits
  WHERE user_id = p_user_id::UUID
  FOR UPDATE;

  -- 檢查點數是否足夠
  IF v_current_chars < p_used_chars THEN
    RAISE EXCEPTION 'insufficient_credits' 
      USING MESSAGE = format('Insufficient credits: remaining %s, requested %s', v_current_chars, p_used_chars),
            HINT = 'Please purchase more credits',
            ERRCODE = 'P0001';
  END IF;

  -- 原子更新：扣除點數
  UPDATE public.user_credits
  SET remaining_chars = remaining_chars - p_used_chars,
      updated_at = NOW()
  WHERE user_id = p_user_id::UUID
  RETURNING remaining_chars INTO v_remaining_chars;

  -- 回傳剩餘點數
  RETURN v_remaining_chars;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- 如果無法轉換為 UUID，建立一個臨時 UUID 對應（僅用於匿名使用者）
    -- 這裡簡化處理，實際應該使用 hash 或其他方式對應
    RAISE EXCEPTION 'invalid_user_id' USING MESSAGE = 'Invalid user ID format';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予執行權限（根據需求調整）
-- GRANT EXECUTE ON FUNCTION consume_user_credits(TEXT, INTEGER) TO authenticated;
-- GRANT EXECUTE ON FUNCTION consume_user_credits(TEXT, INTEGER) TO service_role;

-- 測試函數（可選）
-- SELECT * FROM consume_user_credits('test_user_id', 100);

