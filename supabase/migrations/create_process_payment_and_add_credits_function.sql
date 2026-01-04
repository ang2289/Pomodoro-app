-- 建立 process_payment_and_add_credits RPC 函數
-- 處理付款回報並為使用者加點

CREATE OR REPLACE FUNCTION public.process_payment_and_add_credits(
  p_payment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payment_record RECORD;
  v_user_id UUID;
  v_credits_to_add INTEGER;
BEGIN
  -- 1. 查詢 payment_reports 記錄
  SELECT * INTO v_payment_record
  FROM public.payment_reports
  WHERE id = p_payment_id
    AND processed = false; -- 只處理未處理的記錄

  -- 如果記錄不存在或已處理，回傳 false
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_not_found' 
      USING MESSAGE = format('Payment record not found or already processed: %s', p_payment_id),
            ERRCODE = 'P0003';
  END IF;

  -- 2. 根據 plan_id 計算加點數量（99=100000, 199=300000）
  IF v_payment_record.plan_id = '99' THEN
    v_credits_to_add := 100000;
  ELSIF v_payment_record.plan_id = '199' THEN
    v_credits_to_add := 300000;
  ELSE
    RAISE EXCEPTION 'invalid_plan_id' 
      USING MESSAGE = format('Invalid plan_id: %s', v_payment_record.plan_id),
            ERRCODE = '22P02';
  END IF;

  -- 3. 根據 email 找到對應的 user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_payment_record.email
  LIMIT 1;

  -- 如果找不到使用者，回傳 false
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found' 
      USING MESSAGE = format('User not found for email: %s', v_payment_record.email),
            ERRCODE = 'P0004';
  END IF;

  -- 4. 在 transaction 中執行以下操作：
  -- 4.1 更新 payment_reports 的 processed = true
  UPDATE public.payment_reports
  SET processed = true,
      status = 'processed',
      processed_by = auth.uid(),
      processed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- 4.2 初始化或更新 user_credits
  INSERT INTO public.user_credits (user_id, remaining_chars)
  VALUES (v_user_id, v_credits_to_add)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    remaining_chars = user_credits.remaining_chars + v_credits_to_add,
    updated_at = NOW();

  -- 5. 發送 Email 通知（非阻塞，失敗不影響補點成功）
  -- 使用 pg_net 擴充功能呼叫 Edge Function
  -- 注意：需要先啟用 pg_net 擴充功能（見 enable_pg_net_extension.sql）
  -- 需要在 Supabase Dashboard 設定以下設定值：
  --   - app.supabase_url: Supabase 專案 URL
  --   - app.supabase_service_role_key: Service Role Key
  BEGIN
    PERFORM
      net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        ),
        body := jsonb_build_object(
          'email', v_payment_record.email,
          'plan_id', v_payment_record.plan_id,
          'credits_added', v_credits_to_add
        )
      );
  EXCEPTION
    WHEN OTHERS THEN
      -- Email 發送失敗不影響補點成功，只記錄 log
      -- 可能的錯誤原因：
      -- 1. pg_net 擴充功能未啟用
      -- 2. Supabase URL 或 Service Role Key 未設定
      -- 3. Edge Function 不存在或發生錯誤
      RAISE WARNING 'Email 發送失敗（不影響補點成功）: %', SQLERRM;
  END;

  -- 6. 回傳 true 表示成功
  RETURN true;

  -- 如果發生任何錯誤，PostgreSQL 會自動 ROLLBACK
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 註解說明
COMMENT ON FUNCTION public.process_payment_and_add_credits(UUID) IS 
  '處理付款回報並為使用者加點：根據 payment_id 找到付款記錄，計算加點數量（99=100000, 199=300000），根據 email 找到使用者，更新 payment_reports 的 processed = true，並增加 user_credits.remaining_chars。補點完成後會嘗試發送 Email 通知，但 Email 發送失敗不影響補點成功。回傳 true 表示成功，否則拋出異常。';


