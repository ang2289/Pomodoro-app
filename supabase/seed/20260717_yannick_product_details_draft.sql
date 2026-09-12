-- 僅更新既有亞尼克第一團商品，不新增訂單、不下載官方圖片。
-- 客觀資料查核來源限定 www.yannick.com.tw；查核日期 2026-07-17。
-- 來源對照保留在本管理用 SQL 註解，不會送到公開前台：
-- 原味 saleid=官方原味頁；特黑 2006110002；茶拿鐵 2010270001；北海道黑酷曲 2111080002；
-- 宇治抹茶 2604130004；香草布丁 2511060001；三顆布丁 2605080001；
-- 特濃薄荷巧克力脆片 2606160001；薄荷巧克力黑酷曲 2406270004。

begin;

update public.group_buy_products as p
   set short_description = f.short_description,
       long_description = f.long_description,
       original_price_ntd = f.original_price_ntd,
       weight_text = f.weight_text,
       dimensions_text = f.dimensions_text,
       storage_text = f.storage_text,
       vegetarian_text = f.vegetarian_text,
       allergen_text = coalesce(p.allergen_text, '過敏原資訊以商品實際包裝標示為準。'),
       ingredients_summary = f.ingredients_summary,
       serving_suggestion = f.serving_suggestion,
       product_notice = f.product_notice,
       content_source_checked_at = timestamptz '2026-07-17 00:00:00+08',
       content_review_status = f.content_review_status,
       detail_slug = f.detail_slug,
       updated_at = now()
  from (values
    ('原味生乳捲', '北海道奶霜搭配柔軟泡芙蛋糕的經典口味。', '以北海道奶霜與泡芙蛋糕組成，口味清爽，適合作為第一次嘗試生乳捲的選擇。', 392, '324g', '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '北海道奶霜、泡芙蛋糕', '依包裝建議冷藏保存，切片後儘早食用。', '規格與保存期限以實際商品包裝標示為準。', 'draft', 'original-cream-roll'),
    ('特黑巧克力生乳捲', '特黑泡芙蛋糕搭配北海道奶霜。', '可可風味的泡芙蛋糕包覆北海道奶霜，呈現巧克力與乳香的對比。', 420, '324g', '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '北海道奶霜、特黑泡芙蛋糕', '冷藏後切片食用。', '規格與保存期限以實際商品包裝標示為準。', 'draft', 'dark-chocolate-cream-roll'),
    ('茶拿鐵布丁生乳捲', '紅茶泡芙蛋糕、北海道奶霜與布丁的組合。', '以阿薩姆紅茶風味蛋糕搭配奶霜與布丁，兼具茶香、乳香與布丁口感。', 420, '378g', '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '紅茶泡芙蛋糕、北海道奶霜、布丁、阿薩姆紅茶奶霜', '冷藏後切片食用。', '布丁可能因切片或運送產生位移；以實際商品為準。', 'draft', 'tea-latte-pudding-roll'),
    ('北海道黑酷曲', '特黑蛋糕結合巧克力酥餅、北海道奶霜與卡士達。', '圓形特黑蛋糕搭配奶霜、卡士達與巧克力酥餅，提供柔軟與酥脆的口感層次。', 450, '360g', '直徑約 14.5×高約 4.6 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '特黑泡芙蛋糕、巧克力酥餅、北海道奶霜、卡士達、巧克力餅乾', '冷藏保存並使用適合的蛋糕刀分切。', '本品為圓形蛋糕，單位為顆；包裝與附贈品依供應商實際出貨。', 'draft', 'hokkaido-black-cookie'),
    ('宇治抹茶生乳捲', '宇治抹茶泡芙蛋糕搭配抹茶奶霜。', '以宇治抹茶製作蛋糕與奶霜，茶粉為手工灑製，實際外觀可能略有差異。', 699, '351g', '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；避免長時間光照，實際效期依包裝標示。', '奶蛋素', '宇治抹茶泡芙蛋糕、宇治抹茶奶霜', '冷藏並避光保存，切片後儘早食用。', '抹茶接觸光線可能產生自然褪色；粉量與外觀以實品為準。', 'draft', 'uji-matcha-cream-roll'),
    ('香草布丁生乳捲', '香草奶霜、泡芙蛋糕與布丁的組合。', '北海道香草奶霜搭配泡芙蛋糕與布丁，呈現香草乳香與滑嫩口感。', 420, null, '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '泡芙蛋糕、北海道香草奶霜、布丁', '冷藏後切片食用。', '官方頁未明確提供淨重，須人工確認；包裝以實際出貨為準。', 'needs_review', 'vanilla-pudding-roll'),
    ('期間限定－三顆布丁生乳捲', '泡芙蛋糕、北海道奶霜與三顆布丁的期間限定組合。', '柔軟泡芙蛋糕捲入奶霜與布丁，切面中的布丁可能因修整或運送而呈現不同形狀。', 465, null, '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '泡芙蛋糕、北海道奶霜、布丁', '布丁滑嫩易位移，切片與拿取時請小心。', '官方頁未明確提供淨重；期間限定供貨以供應商通知為準。', 'needs_review', 'three-pudding-roll'),
    ('期間限定－特濃薄荷巧克力脆片生乳捲', '特黑泡芙蛋糕搭配薄荷巧克力奶霜與巧克力脆片。', '薄荷奶霜結合特黑蛋糕、巧克力豆與巧克力脆片，呈現清涼與可可風味。', 565, null, '18×8.5×6.5 公分', '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '特黑泡芙蛋糕、苦甜巧克力、薄荷巧克力奶霜', '冷藏後切片食用。', '官方頁未明確提供淨重；期間限定供貨以供應商通知為準。', 'needs_review', 'mint-chocolate-crunch-roll'),
    ('期間限定－薄荷巧克力北海道黑酷曲', '特黑蛋糕、薄荷奶霜與巧克力酥餅的期間限定組合。', '圓形特黑蛋糕搭配北海道奶霜、薄荷奶霜、薄荷磅蛋糕與巧克力酥餅。', 535, null, null, '冷藏 2～3 天內食用完畢；實際效期依包裝標示。', '奶蛋素', '特黑泡芙蛋糕、巧克力片、薄荷磅蛋糕、北海道奶霜、薄荷奶霜、巧克力酥餅', '冷藏保存並使用適合的蛋糕刀分切。', '官方頁未明確提供本款尺寸與淨重；期間限定供貨以供應商通知為準。', 'needs_review', 'mint-chocolate-black-cookie')
  ) as f(title, short_description, long_description, original_price_ntd, weight_text, dimensions_text, storage_text, vegetarian_text, ingredients_summary, serving_suggestion, product_notice, content_review_status, detail_slug)
 where p.title = f.title
   and p.campaign_id = (
     select id from public.group_buy_campaigns where slug = 'yannick-first-group-buy' limit 1
   );

commit;
