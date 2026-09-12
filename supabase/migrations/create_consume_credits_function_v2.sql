-- 核心扣點數函數（交易保護版本）
-- ⚠️ 重要：此函數在單一 transaction 中完成扣點和記錄，使用 FOR UPDATE 防止 race condition
--
-- 功能：
-- 1. 計算 totalChars = inputChars + outputChars
-- 2. 在 transaction 中 SELECT FOR UPDATE 鎖定行
-- 3. 檢查點數是否足夠
-- 4. 扣除點數
-- 5. 插入使用紀錄
-- 6. 回傳最新剩餘點數

-- ==========================================
-- UUID 版本（正規）
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

  -- 計算扣除後的剩餘點數
  v_after_remaining := v_before_remaining - v_total_chars;

  -- 原子更新：扣除點數
  UPDATE public.user_credits
  SET remaining_chars = v_after_remaining,
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
  '核心扣點數函數：在單一 transaction 中完成扣點和記錄，使用 FOR UPDATE 防止 race condition。參數：user_id, feature (summary/homework), input_chars, output_chars';

-- ==========================================
-- TEXT 版本（向後兼容，用於匿名使用者）
-- ==========================================
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id TEXT,
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
  v_user_uuid UUID;
BEGIN
  -- 嘗試轉換為 UUID
  BEGIN
    v_user_uuid := p_user_id::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      -- 如果無法轉換為 UUID，拋出錯誤
      RAISE EXCEPTION 'invalid_user_id' 
        USING MESSAGE = format('Invalid user ID format: %s', p_user_id),
              ERRCODE = '22P02';
  END;

  -- 呼叫 UUID 版本
  RETURN QUERY
  SELECT * FROM public.consume_credits(
    v_user_uuid,
    p_feature,
    p_input_chars,
    p_output_chars
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 註解說明
COMMENT ON FUNCTION public.consume_credits(TEXT, TEXT, INTEGER, INTEGER) IS 
  '核心扣點數函數（TEXT 版本，向後兼容）';

-- ==========================================
-- 授予執行權限
-- ==========================================
-- 注意：此函數使用 SECURITY DEFINER，應由後端服務（Edge Function）使用 SERVICE_ROLE_KEY 執行
-- 不授予給 authenticated 角色，避免前端直接呼叫

-- ==========================================
-- 測試函數（可選，僅用於開發測試）
-- ==========================================
-- 測試範例：
-- SELECT * FROM consume_credits('user-uuid-here'::UUID, 'summary', 500, 200);
-- 預期回傳：remaining_chars, before_remaining, after_remaining

