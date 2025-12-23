-- 建立/更新 user_credits 資料表
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行此腳本
-- 
-- 說明：
-- 1. 如果資料表不存在，建立符合需求的結構
-- 2. 如果資料表已存在，補齊缺少的欄位
-- 3. 建立觸發器自動同步 remaining_chars = total_credits - used_credits
-- 4. 為 user_id 建立索引

-- ==========================================
-- 1. 建立 user_credits 表（如果不存在）
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 10000,
  used_credits INTEGER NOT NULL DEFAULT 0,
  remaining_chars INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 2. 如果表已存在，補齊缺少的欄位
-- ==========================================

-- 添加 id 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'id'
  ) THEN
    -- 檢查是否有主鍵約束在 user_id 上
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' 
        AND tc.table_name = 'user_credits'
        AND tc.constraint_type = 'PRIMARY KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
      -- 先添加 id 欄位
      ALTER TABLE public.user_credits ADD COLUMN id UUID DEFAULT gen_random_uuid();
      -- 更新現有記錄
      UPDATE public.user_credits SET id = gen_random_uuid() WHERE id IS NULL;
      -- 注意：移除 user_id 的主鍵約束需要手動執行
      -- 可以在 Supabase Dashboard 中手動移除 user_id 的主鍵約束，然後執行：
      -- ALTER TABLE public.user_credits ADD PRIMARY KEY (id);
    ELSE
      -- 如果沒有主鍵約束，直接添加 id 欄位並設為主鍵
      ALTER TABLE public.user_credits ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
      UPDATE public.user_credits SET id = gen_random_uuid() WHERE id IS NULL;
    END IF;
  END IF;
END $$;

-- 添加 total_credits 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'total_credits'
  ) THEN
    ALTER TABLE public.user_credits ADD COLUMN total_credits INTEGER NOT NULL DEFAULT 10000;
    -- 初始化現有記錄：total_credits = remaining_chars + used_credits（如果 used_credits 存在）
    -- 否則 total_credits = remaining_chars + 0
    UPDATE public.user_credits 
    SET total_credits = COALESCE(remaining_chars, 10000) + COALESCE(used_credits, 0)
    WHERE total_credits IS NULL;
  END IF;
END $$;

-- 添加 used_credits 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'used_credits'
  ) THEN
    ALTER TABLE public.user_credits ADD COLUMN used_credits INTEGER NOT NULL DEFAULT 0;
    -- 初始化現有記錄：used_credits = total_credits - remaining_chars
    UPDATE public.user_credits 
    SET used_credits = GREATEST(0, COALESCE(total_credits, 10000) - COALESCE(remaining_chars, 10000))
    WHERE used_credits IS NULL;
  END IF;
END $$;

-- 添加 remaining_chars 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'remaining_chars'
  ) THEN
    ALTER TABLE public.user_credits ADD COLUMN remaining_chars INTEGER NOT NULL DEFAULT 10000;
    -- 初始化：remaining_chars = total_credits - used_credits
    UPDATE public.user_credits 
    SET remaining_chars = COALESCE(total_credits, 10000) - COALESCE(used_credits, 0)
    WHERE remaining_chars IS NULL;
  END IF;
END $$;

-- 添加 created_at 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.user_credits ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    -- 初始化現有記錄：使用 updated_at 或當前時間
    UPDATE public.user_credits 
    SET created_at = COALESCE(updated_at, NOW())
    WHERE created_at IS NULL;
  END IF;
END $$;

-- 添加 updated_at 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_credits ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- ==========================================
-- 3. 建立/更新 updated_at 自動更新 trigger
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_credits_updated_at ON public.user_credits;

CREATE TRIGGER trigger_update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_credits_updated_at();

-- ==========================================
-- 4. 建立觸發器：自動同步 remaining_chars
-- ==========================================

CREATE OR REPLACE FUNCTION public.sync_remaining_chars()
RETURNS TRIGGER AS $$
BEGIN
  -- 自動計算 remaining_chars = total_credits - used_credits
  NEW.remaining_chars := NEW.total_credits - NEW.used_credits;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_remaining_chars ON public.user_credits;

CREATE TRIGGER trigger_sync_remaining_chars
  BEFORE INSERT OR UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_remaining_chars();

-- ==========================================
-- 5. 為 user_id 建立索引
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

-- ==========================================
-- 6. 更新註解說明
-- ==========================================

COMMENT ON TABLE public.user_credits IS '使用者點數帳戶表，每個使用者只有一筆記錄';
COMMENT ON COLUMN public.user_credits.id IS '主鍵（UUID）';
COMMENT ON COLUMN public.user_credits.user_id IS '使用者 ID（關聯 auth.users，唯一）';
COMMENT ON COLUMN public.user_credits.total_credits IS '總點數（預設 10000）';
COMMENT ON COLUMN public.user_credits.used_credits IS '已使用點數（預設 0）';
COMMENT ON COLUMN public.user_credits.remaining_chars IS '剩餘可用字數點數（自動計算：total_credits - used_credits）';
COMMENT ON COLUMN public.user_credits.created_at IS '建立時間';
COMMENT ON COLUMN public.user_credits.updated_at IS '最後更新時間';

-- ==========================================
-- 7. 驗證設定
-- ==========================================

DO $$
BEGIN
  -- 驗證表已建立
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits'
  ) THEN
    RAISE EXCEPTION 'user_credits 表建立失敗';
  END IF;
  
  -- 驗證必要欄位存在
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'id 欄位不存在';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'user_id 欄位不存在';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'total_credits'
  ) THEN
    RAISE EXCEPTION 'total_credits 欄位不存在';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'used_credits'
  ) THEN
    RAISE EXCEPTION 'used_credits 欄位不存在';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'remaining_chars'
  ) THEN
    RAISE EXCEPTION 'remaining_chars 欄位不存在';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'created_at'
  ) THEN
    RAISE EXCEPTION 'created_at 欄位不存在';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_credits' 
    AND column_name = 'updated_at'
  ) THEN
    RAISE EXCEPTION 'updated_at 欄位不存在';
  END IF;
  
  RAISE NOTICE '✅ user_credits 資料表結構驗證成功';
  RAISE NOTICE '✅ 所有必要欄位已存在';
  RAISE NOTICE '✅ 觸發器已建立';
  RAISE NOTICE '✅ 索引已建立';
END $$;
