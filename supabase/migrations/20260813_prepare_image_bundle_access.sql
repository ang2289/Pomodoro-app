-- 一次性販售初始化：每個分類保留最新 5 張免費下載，其餘設為完整素材庫。
-- 目的：約保留 50～100 張分散在各分類的免費試用圖，避免 1,577+ 張全部免費下載。
-- 不刪除圖片、不搬動 R2 物件，只更新 images.price_type / is_free。

begin;

with ranked as (
  select
    id,
    row_number() over (
      partition by category_id
      order by created_at desc nulls last, id
    ) as rn
  from public.images
)
update public.images as i
set
  price_type = case when ranked.rn <= 5 then 'free' else 'bundle' end,
  is_free = case when ranked.rn <= 5 then true else false end
from ranked
where i.id = ranked.id;

commit;

-- 執行後可用下列查詢確認：
-- select price_type, count(*) from public.images group by price_type order by price_type;
-- select c.name, i.price_type, count(*)
-- from public.images i
-- left join public.image_categories c on c.id = i.category_id
-- group by c.name, i.price_type
-- order by c.name, i.price_type;
