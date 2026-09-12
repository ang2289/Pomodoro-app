-- ============================================
-- RPC 函數：檢查並扣除使用者字數額度
-- ============================================
-- 功能：檢查並扣除使用者字數額度
-- 輸入：user_id、input_chars、feature
-- 規則：
--   1. 優先扣試用額度（10000 字）
--   2. 試用不足才扣付費額度（total_credits - 10000）
--   3. 不足時回傳錯誤
--   4. 成功時寫 usage_logs
-- ============================================
-- ⚠️ 注意：不修改資料表結構，使用現有欄位
--   - remaining_chars: 剩餘可用字數
--   - total_credits: 總點數（試用 10000 + 付費加點）
-- ============================================

CREATE OR REPLACE FUNCTION check_and_deduct_credits(
  p_user_id UUID,
  p_input_chars INTEGER,
  p_feature TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining_chars INTEGER;
  v_total_credits INTEGER;
  v_trial_quota INTEGER := 10000; -- 試用額度固定為 10000
  v_paid_credits INTEGER; -- 付費額度 = total_credits - 10000
  v_used_trial INTEGER; -- 已使用的試用額度
  v_remaining_trial INTEGER; -- 剩餘試用額度
  v_remaining_paid INTEGER; -- 剩餘付費額度
  v_deduct_from_trial INTEGER := 0;
  v_deduct_from_paid INTEGER := 0;
  v_before_remaining INTEGER; -- 扣點前的剩餘點數（用於 usage_logs）
BEGIN
  -- 檢查輸入參數
  IF p_user_id IS NULL OR p_input_chars IS NULL OR p_input_chars <= 0 OR p_feature IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid parameters: user_id, input_chars (must be > 0), and feature are required'
    );
  END IF;

  -- 取得使用者點數資訊（如果不存在則初始化）
  SELECT 
    COALESCE(remaining_chars, 0),
    COALESCE(total_credits, 10000)
  INTO 
    v_remaining_chars,
    v_total_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- 如果記錄不存在，初始化
  IF v_remaining_chars IS NULL THEN
    INSERT INTO user_credits (user_id, remaining_chars, total_credits)
    VALUES (p_user_id, 10000, 10000)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 重新取得
    SELECT 
      COALESCE(remaining_chars, 10000),
      COALESCE(total_credits, 10000)
    INTO 
      v_remaining_chars,
      v_total_credits
    FROM user_credits
    WHERE user_id = p_user_id;
  END IF;

  -- 計算付費額度
  v_paid_credits := GREATEST(0, v_total_credits - v_trial_quota);

  -- 計算已使用的試用額度
  -- 如果 remaining_chars <= total_credits - 10000，表示試用已用完
  -- 否則剩餘試用 = remaining_chars - (total_credits - 10000)
  IF v_total_credits > v_trial_quota THEN
    -- 有付費加點
    v_remaining_paid := GREATEST(0, v_remaining_chars - (v_total_credits - v_trial_quota));
    v_remaining_trial := GREATEST(0, v_remaining_chars - v_remaining_paid);
    v_used_trial := v_trial_quota - v_remaining_trial;
  ELSE
    -- 只有試用額度
    v_remaining_trial := v_remaining_chars;
    v_remaining_paid := 0;
    v_used_trial := v_trial_quota - v_remaining_trial;
  END IF;

  -- 檢查總額度是否足夠
  IF v_remaining_chars < p_input_chars THEN
    -- 點數不足，回傳錯誤
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'remaining_chars', v_remaining_chars,
      'required_chars', p_input_chars,
      'shortage', p_input_chars - v_remaining_chars
    );
  END IF;

  -- 計算扣點策略：優先扣試用額度
  IF v_remaining_trial >= p_input_chars THEN
    -- 試用額度足夠，全部從試用額度扣除
    v_deduct_from_trial := p_input_chars;
    v_deduct_from_paid := 0;
  ELSE
    -- 試用額度不足，先扣完試用，剩餘從付費額度扣除
    v_deduct_from_trial := v_remaining_trial;
    v_deduct_from_paid := p_input_chars - v_remaining_trial;
  END IF;

  -- 更新 user_credits 表（只更新 remaining_chars，不修改其他欄位）
  UPDATE user_credits
  SET 
    remaining_chars = remaining_chars - p_input_chars,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 記錄使用前的剩餘點數（用於 usage_logs）
  v_before_remaining := v_remaining_chars;
  
  -- 取得更新後的剩餘點數
  SELECT remaining_chars INTO v_remaining_chars
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- 寫入 usage_logs（如果表存在）
  BEGIN
    INSERT INTO usage_logs (
      user_id, 
      feature, 
      input_chars, 
      output_chars, 
      total_chars, 
      before_remaining, 
      after_remaining, 
      created_at
    )
    VALUES (
      p_user_id, 
      p_feature, 
      p_input_chars, 
      0, 
      p_input_chars, 
      v_before_remaining, 
      v_remaining_chars, 
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- usage_logs 表不存在，跳過記錄（不影響主要功能）
      NULL;
  END;

  -- 回傳成功結果
  RETURN json_build_object(
    'success', true,
    'remaining_chars', v_remaining_chars,
    'deducted_from_trial', v_deduct_from_trial,
    'deducted_from_paid', v_deduct_from_paid,
    'total_deducted', p_input_chars
  );

EXCEPTION
  WHEN OTHERS THEN
    -- 發生錯誤，回傳錯誤資訊
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- 授予執行權限
GRANT EXECUTE ON FUNCTION check_and_deduct_credits(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_deduct_credits(UUID, INTEGER, TEXT) TO anon;
