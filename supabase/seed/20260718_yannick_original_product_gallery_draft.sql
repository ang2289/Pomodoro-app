begin;

with target_product as (
  select p.id
    from public.group_buy_products p
    join public.group_buy_campaigns c on c.id = p.campaign_id
   where p.id = '56155d1f-4ece-409b-8e4e-03eb00c71214'::uuid
     and c.slug = 'yannick-first-group-buy'
), gallery(image_type, image_url, alt_text, sort_order, generation_prompt) as (
  values
    ('hero', '/images/group-buy/products/56155d1f-4ece-409b-8e4e-03eb00c71214/56155d1f-4ece-409b-8e4e-03eb00c71214-hero.webp', '原味生乳捲完整商品與切片自製示意圖', 1, '高級主商品圖：完整原味生乳捲搭配一至二片切片，淡金黃蛋糕體與純白奶霜。'),
    ('cutaway', '/images/group-buy/products/56155d1f-4ece-409b-8e4e-03eb00c71214/56155d1f-4ece-409b-8e4e-03eb00c71214-cutaway.webp', '原味生乳捲蛋糕體與奶霜切面自製示意圖', 2, '切面近拍：忠實呈現淡金黃泡芙蛋糕與純白奶霜，不增加配料。'),
    ('size_diagram', '/images/group-buy/products/56155d1f-4ece-409b-8e4e-03eb00c71214/56155d1f-4ece-409b-8e4e-03eb00c71214-size.webp', '原味生乳捲尺寸比例自製示意圖', 3, '尺寸底圖：單一完整商品，圖片本體不含文字，尺寸由網站介面疊加。'),
    ('afternoon_tea', '/images/group-buy/products/56155d1f-4ece-409b-8e4e-03eb00c71214/56155d1f-4ece-409b-8e4e-03eb00c71214-afternoon-tea.webp', '窗邊享用原味生乳捲的下午茶自製情境圖', 4, '單人窗邊下午茶，人物頭部完整並保留安全空間，商品位於前景。'),
    ('family_lakeside', '/images/group-buy/products/56155d1f-4ece-409b-8e4e-03eb00c71214/56155d1f-4ece-409b-8e4e-03eb00c71214-family-lakeside.webp', '一家四口湖邊分享原味生乳捲的自製情境圖', 5, '一家四口湖邊分享，所有頭部完整，前景商品與每份切片外觀一致。'),
    ('office_sharing', '/images/group-buy/products/56155d1f-4ece-409b-8e4e-03eb00c71214/56155d1f-4ece-409b-8e4e-03eb00c71214-office-sharing.webp', '辦公室同事分享原味生乳捲的自製情境圖', 6, '四位上班族分享，所有頭部完整，桌面商品清楚且切片一致。')
)
insert into public.group_buy_product_images (
  product_id, image_type, image_url, alt_text, sort_order,
  is_active, is_ai_generated, review_status, generation_prompt
)
select target_product.id, gallery.image_type, gallery.image_url, gallery.alt_text,
       gallery.sort_order, false, true, 'draft', gallery.generation_prompt
  from target_product cross join gallery
 where not exists (
   select 1
     from public.group_buy_product_images existing
    where existing.product_id = target_product.id
      and existing.image_type = gallery.image_type
      and existing.image_url = gallery.image_url
 );

commit;
