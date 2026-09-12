-- 建立 is_admin() RPC 函數
-- 檢查當前使用者是否為管理者
-- 使用環境變數 ADMIN_USER_IDS 來定義管理者 ID 列表

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  admin_user_ids TEXT;
  admin_list TEXT[];
BEGIN
  -- 取得當前使用者 ID
  current_user_id := auth.uid();
  
  -- 如果未登入，回傳 false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- 從環境變數或設定表讀取管理者 ID 列表
  -- ⚠️ 注意：這裡使用 current_setting 讀取自訂設定
  -- 實際部署時需要在 Supabase Dashboard 設定自訂設定，或使用資料表儲存
  -- 暫時使用硬編碼方式（可改為從資料表讀取）
  
  -- 方法 1：從自訂設定讀取（需要在 Supabase Dashboard 設定）
  BEGIN
    admin_user_ids := current_setting('app.admin_user_ids', true);
  EXCEPTION WHEN OTHERS THEN
    admin_user_ids := NULL;
  END;
  
  -- 如果沒有設定，回傳 false
  IF admin_user_ids IS NULL OR admin_user_ids = '' THEN
    RETURN false;
  END IF;
  
  -- 將逗號分隔的字串轉換為陣列
  admin_list := string_to_array(admin_user_ids, ',');
  
  -- 檢查當前使用者 ID 是否在管理者列表中
  RETURN current_user_id::TEXT = ANY(admin_list);
END;
$$;

-- 註解說明
COMMENT ON FUNCTION public.is_admin() IS '檢查當前使用者是否為管理者，使用環境變數或自訂設定來定義管理者 ID 列表';

-- ⚠️ 注意：實際使用時需要在 Supabase Dashboard > Settings > Database > Custom Settings 中設定：
-- app.admin_user_ids = 'user-id-1,user-id-2,user-id-3'
-- 
-- 或者建立一個 admin_users 資料表來儲存管理者 ID：
-- CREATE TABLE admin_users (user_id UUID PRIMARY KEY REFERENCES auth.users(id));
-- 然後修改此函數從資料表讀取


