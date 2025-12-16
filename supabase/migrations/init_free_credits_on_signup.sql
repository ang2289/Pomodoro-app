-- 自動初始化免費試用點數（使用者首次註冊時）
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行此腳本
--
-- 功能說明：
-- 當使用者首次註冊（auth.users 新增一筆記錄）時，自動建立對應的 user_credits 記錄
-- 初始化 remaining_chars = 10000（免費試用點數）
-- 不設定任何期限或狀態欄位

-- ==========================================
-- 1. 建立自動初始化點數的函數
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 檢查 user_credits 是否存在
  -- 如果不存在，則建立一筆記錄，remaining_chars = 10000
  INSERT INTO public.user_credits (user_id, remaining_chars)
  VALUES (NEW.id, 10000)
  ON CONFLICT (user_id) DO NOTHING; -- 如果已存在則不做任何事（避免重複初始化）
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 註解說明
COMMENT ON FUNCTION public.handle_new_user IS '自動初始化新使用者的免費試用點數（10000 字）';

-- ==========================================
-- 2. 建立 Trigger（當 auth.users 新增使用者時觸發）
-- ==========================================

-- 刪除舊的 trigger（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 建立 trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 註解說明
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS '當新使用者註冊時，自動初始化免費試用點數';

-- ==========================================
-- 3. 為現有使用者初始化點數（一次性執行）
-- ==========================================
-- 如果資料庫中已有使用者但沒有對應的 user_credits 記錄，執行此腳本進行初始化

INSERT INTO public.user_credits (user_id, remaining_chars)
SELECT 
  id,
  10000 -- 免費試用點數
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- ==========================================
-- 4. 驗證設定
-- ==========================================

-- 驗證 trigger 已建立
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    RAISE EXCEPTION 'Trigger 建立失敗';
  END IF;
  
  RAISE NOTICE '✅ Trigger 建立成功';
  RAISE NOTICE '✅ 新使用者註冊時將自動獲得 10000 字免費試用點數';
END $$;

