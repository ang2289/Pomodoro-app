-- 圖片下載扣點：image_downloads 表、usage_logs 支援 image_download
-- 用於：同一使用者同一張圖片只扣一次點、記錄扣點

-- 1) 建立 image_downloads：紀錄使用者已下載過的圖片（同一 user+image 只扣一次）
CREATE TABLE IF NOT EXISTS public.image_downloads (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, image_id)
);

CREATE INDEX IF NOT EXISTS idx_image_downloads_user_id ON public.image_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_image_downloads_image_id ON public.image_downloads(image_id);

COMMENT ON TABLE public.image_downloads IS '圖片下載紀錄：同一使用者同一張圖片只扣一次點，再次下載不扣點';

-- 2) usage_logs 支援 feature = 'image_download'（用於扣點記錄）
ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_feature_check;
ALTER TABLE public.usage_logs
  ADD CONSTRAINT usage_logs_feature_check
  CHECK (feature IN ('summary', 'homework', 'image_download'));

-- 3) usage_logs 新增 metadata（可選，供 image_download 存 image_id 等）
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMENT ON COLUMN public.usage_logs.metadata IS '延伸資料，例如 image_download 的 image_id';

-- 4) RPC：圖片下載扣點（原子：鎖列、檢查、扣點、寫 usage_logs、寫 image_downloads）
-- 回傳：扣點後剩餘點數；不足時 raise insufficient_credits
CREATE OR REPLACE FUNCTION public.deduct_credits_for_image(
  p_user_id UUID,
  p_amount INTEGER,
  p_image_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_before INTEGER;
  v_after INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN 0;
  END IF;

  SELECT remaining_chars INTO v_before
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_before IS NULL OR v_before < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits'
      USING MESSAGE = format('Insufficient credits: need %s, have %s', p_amount, COALESCE(v_before, 0)),
            ERRCODE = 'P0001';
  END IF;

  v_after := v_before - p_amount;

  UPDATE public.user_credits
  SET remaining_chars = v_after, updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.usage_logs (
    user_id, feature, input_chars, output_chars, total_chars,
    before_remaining, after_remaining, metadata, created_at
  ) VALUES (
    p_user_id, 'image_download', 0, p_amount, p_amount,
    v_before, v_after, jsonb_build_object('image_id', p_image_id::TEXT), NOW()
  );

  INSERT INTO public.image_downloads (user_id, image_id)
  VALUES (p_user_id, p_image_id)
  ON CONFLICT (user_id, image_id) DO NOTHING;

  RETURN v_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.deduct_credits_for_image(UUID, INTEGER, UUID) IS
  '圖片下載扣點：原子扣點、寫 usage_logs、寫 image_downloads。點數不足時 raise insufficient_credits。';
