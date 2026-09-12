-- 建立 add_credits RPC 函數
-- ✅ STEP 7：只負責「加點數」

CREATE OR REPLACE FUNCTION public.add_credits(
  p_anon_token TEXT,
  p_add_chars INT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_credits
  SET remaining_chars = remaining_chars + p_add_chars,
      updated_at = now()
  WHERE anon_token = p_anon_token;
END;
$$;

-- 授權
GRANT EXECUTE ON FUNCTION public.add_credits(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(TEXT, INT) TO anon;

-- 註解說明
COMMENT ON FUNCTION public.add_credits(TEXT, INT) IS 
  '為匿名使用者加點：使用 anon_token 更新 remaining_chars，只負責加點數。';
