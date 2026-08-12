-- 數位商品訂單：用於銀行匯款後人工核對並發放限時下載權限

CREATE TABLE IF NOT EXISTS public.digital_product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL DEFAULT (
    'IMG-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  product_code TEXT NOT NULL CHECK (product_code IN ('image-bundle-full')),
  email TEXT NOT NULL,
  amount_ntd INTEGER NOT NULL CHECK (amount_ntd > 0),
  account_last_five TEXT NOT NULL CHECK (account_last_five ~ '^[0-9]{5}$'),
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  download_token TEXT UNIQUE,
  download_expires_at TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  download_limit INTEGER NOT NULL DEFAULT 3 CHECK (download_limit > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_product_orders_status
  ON public.digital_product_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_product_orders_email
  ON public.digital_product_orders(email);
CREATE INDEX IF NOT EXISTS idx_digital_product_orders_token
  ON public.digital_product_orders(download_token)
  WHERE download_token IS NOT NULL;

-- 目前 ZIP 的儲存位置。之後只要覆蓋 latest.zip 或更新這筆資料，不必改前端。
CREATE TABLE IF NOT EXISTS public.digital_product_bundles (
  product_code TEXT PRIMARY KEY CHECK (product_code IN ('image-bundle-full')),
  storage_bucket TEXT NOT NULL DEFAULT 'digital-products',
  storage_path TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD'),
  image_count INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.digital_product_bundles (product_code, storage_bucket, storage_path)
VALUES ('image-bundle-full', 'digital-products', 'image-bundles/latest.zip')
ON CONFLICT (product_code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_digital_product_order_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_touch_digital_product_order_updated_at ON public.digital_product_orders;
CREATE TRIGGER trigger_touch_digital_product_order_updated_at
BEFORE UPDATE ON public.digital_product_orders
FOR EACH ROW EXECUTE FUNCTION public.touch_digital_product_order_updated_at();

ALTER TABLE public.digital_product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_product_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create valid digital product order" ON public.digital_product_orders;
CREATE POLICY "Anyone can create valid digital product order"
ON public.digital_product_orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  product_code = 'image-bundle-full'
  AND amount_ntd = 399
  AND status = 'pending'
  AND download_token IS NULL
  AND download_count = 0
);

DROP POLICY IF EXISTS "Admins can read digital product orders" ON public.digital_product_orders;
CREATE POLICY "Admins can read digital product orders"
ON public.digital_product_orders
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update digital product orders" ON public.digital_product_orders;
CREATE POLICY "Admins can update digital product orders"
ON public.digital_product_orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read digital product bundles" ON public.digital_product_bundles;
CREATE POLICY "Admins can read digital product bundles"
ON public.digital_product_bundles
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update digital product bundles" ON public.digital_product_bundles;
CREATE POLICY "Admins can update digital product bundles"
ON public.digital_product_bundles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 管理者核對匯款後呼叫。產生 7 天、最多 3 次下載權限。
CREATE OR REPLACE FUNCTION public.approve_digital_product_order(p_order_id UUID)
RETURNS TABLE (
  order_no TEXT,
  download_token TEXT,
  download_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin permission required';
  END IF;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  RETURN QUERY
  UPDATE public.digital_product_orders
  SET
    status = 'approved',
    processed_by = auth.uid(),
    processed_at = NOW(),
    download_token = v_token,
    download_expires_at = NOW() + INTERVAL '7 days',
    download_count = 0,
    download_limit = 3
  WHERE id = p_order_id
    AND status = 'pending'
  RETURNING
    digital_product_orders.order_no,
    digital_product_orders.download_token,
    digital_product_orders.download_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_digital_product_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin permission required';
  END IF;

  UPDATE public.digital_product_orders
  SET
    status = 'rejected',
    processed_by = auth.uid(),
    processed_at = NOW(),
    download_token = NULL,
    download_expires_at = NULL
  WHERE id = p_order_id
    AND status = 'pending';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_digital_product_order(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_digital_product_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_digital_product_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_digital_product_order(UUID) TO authenticated;
