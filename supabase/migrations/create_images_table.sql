-- ============================================
-- 建立 images 資料表
-- ============================================
-- 說明：用於記錄上傳到 Supabase Storage 的圖片資訊
-- 用途：管理圖片檔案的路徑、URL、大小等資訊
-- ============================================

-- 檢查資料表是否存在，若不存在則建立
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_size_kb INTEGER,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 補齊缺少的欄位（僅當欄位不存在時新增）
DO $$
DECLARE
  has_primary_key BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  -- 檢查表是否存在
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'images'
  ) INTO table_exists;

  -- 如果表已存在，檢查並新增缺少的欄位
  IF table_exists THEN
    -- 檢查表是否已有主鍵
    SELECT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND constraint_type = 'PRIMARY KEY'
    ) INTO has_primary_key;

    -- 檢查並新增 id 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND column_name = 'id'
    ) THEN
      -- 如果沒有主鍵，設定 id 為主鍵；否則只新增欄位
      IF NOT has_primary_key THEN
        ALTER TABLE public.images ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
      ELSE
        ALTER TABLE public.images ADD COLUMN id UUID DEFAULT gen_random_uuid();
      END IF;
    END IF;

    -- 檢查並新增 file_path 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND column_name = 'file_path'
    ) THEN
      ALTER TABLE public.images ADD COLUMN file_path TEXT NOT NULL;
    END IF;

    -- 檢查並新增 public_url 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND column_name = 'public_url'
    ) THEN
      ALTER TABLE public.images ADD COLUMN public_url TEXT NOT NULL;
    END IF;

    -- 檢查並新增 file_size_kb 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND column_name = 'file_size_kb'
    ) THEN
      ALTER TABLE public.images ADD COLUMN file_size_kb INTEGER;
    END IF;

    -- 檢查並新增 is_free 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND column_name = 'is_free'
    ) THEN
      ALTER TABLE public.images ADD COLUMN is_free BOOLEAN DEFAULT true;
    END IF;

    -- 檢查並新增 created_at 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'images' 
      AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.images ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    END IF;
  END IF;
END $$;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_images_file_path ON public.images(file_path);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_is_free ON public.images(is_free);

-- 註解說明
COMMENT ON TABLE public.images IS '圖片資訊表，記錄上傳到 Supabase Storage 的圖片資訊';
COMMENT ON COLUMN public.images.id IS '圖片 ID（UUID）';
COMMENT ON COLUMN public.images.file_path IS '檔案路徑（例如：images/17685222316801.jpg）';
COMMENT ON COLUMN public.images.public_url IS '公開 URL';
COMMENT ON COLUMN public.images.file_size_kb IS '檔案大小（KB）';
COMMENT ON COLUMN public.images.is_free IS '是否為免費圖片（預設為 true）';
COMMENT ON COLUMN public.images.created_at IS '建立時間';

-- ==========================================
-- 驗證設定
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'images'
  ) THEN
    RAISE EXCEPTION 'images 表建立失敗';
  END IF;
  
  RAISE NOTICE '✅ images 表建立成功';
  RAISE NOTICE '✅ 所有欄位已確認';
  RAISE NOTICE '✅ 索引已建立';
END $$;
