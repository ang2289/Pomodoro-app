-- 第一步：先讓 images.price_type 合法接受 bundle。
-- 安全性：只擴充 CHECK constraint，不修改任何既有圖片資料。

begin;

alter table public.images
  drop constraint if exists images_price_type_check;

alter table public.images
  add constraint images_price_type_check
  check (price_type in ('free', 'bundle', 'price_99', 'price_199'));

commit;

-- 驗證：應看到 bundle 已在 CHECK 條件中
select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.images'::regclass
  and conname = 'images_price_type_check';
