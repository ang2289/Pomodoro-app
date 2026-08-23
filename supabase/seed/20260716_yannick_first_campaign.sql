begin;

do $seed$
declare
  v_owner_id uuid;
  v_workspace_id uuid;
  v_campaign_id uuid;
  v_registration_starts_at timestamptz;
  v_registration_ends_at timestamptz;
  v_public_threshold numeric := 70;
begin
  v_registration_starts_at := now();
  v_registration_ends_at := (
    (timezone('Asia/Taipei', v_registration_starts_at)::date + 7) + time '23:59'
  ) at time zone 'Asia/Taipei';

  select id
    into v_owner_id
    from public.users
   where lower(email) = 'ang2289@gmail.com'
   limit 1;

  if v_owner_id is null then
    raise exception '找不到 ang2289@gmail.com 對應的 public.users 使用者，停止建立第一團。';
  end if;

  select id, workspace_id
    into v_campaign_id, v_workspace_id
    from public.group_buy_campaigns
   where slug = 'yannick-first-group-buy'
   limit 1;

  if v_campaign_id is not null then
    update public.group_buy_campaigns
       set title = '亞尼克生乳捲第一團｜單條也享76折',
           description = '第一團採網站登記制：達到公開成團門檻不會立即結團；預計結團時間僅供參考，主辦方正式結團前仍可登記。正式結團後才開放付款；全團付款核對完成並向供應商下單後，安排冷凍宅配。',
           notice_text = E'1. 本頁完成登記即可，不需私訊粉絲團。\n2. 達到公開成團門檻不會立即結團，主辦方正式結團前仍可登記。\n3. 預計結團時間僅供參考；管理員正式結團後才開放付款。\n4. 未達門檻時最多延長一次，每次 3 天。\n5. 全團付款核對完成並向供應商下單後，預計 7～14 個工作天內出貨。\n6. 冷凍宅配每筆訂單未滿 10 條運費 200 元，滿 10 條免運。',
           organizer_disclaimer = '本團由 RXV 夢想創作工作室獨立發起，非亞尼克官方網站或官方活動頁。',
           -- 既有活動可能已有正式訂單；保留目前生命週期與登記日期，避免重置進行中的團。
           original_registration_ends_at = coalesce(original_registration_ends_at, registration_ends_at),
           payment_deadline = case when status = 'payment_open' then payment_deadline else null end,
           estimated_arrival_text = '全團付款核對完成並向供應商下單後，預計7～14個工作天內出貨；實際最晚出貨日將於供應商回覆後顯示。',
           estimated_ship_min_business_days = 7,
           estimated_ship_max_business_days = 14,
           threshold_mode = 'quantity',
           min_registration_value = v_public_threshold,
           min_paid_value = v_public_threshold,
           allow_mixed_products = true,
           show_progress = true,
           address_collection_stage = 'registration',
           payment_open_mode = 'manual',
           show_bank_after_payment_open = true,
           updated_at = now()
     where id = v_campaign_id;

    update public.group_buy_shipping_methods
       set is_active = (method_type = 'home_delivery'),
           label = case when method_type = 'home_delivery'
             then '冷凍宅配｜未滿 10 條運費 200 元，滿 10 條免運'
             else label end,
           fee_mode = case when method_type = 'home_delivery' then 'quantity_free_threshold' else fee_mode end,
           base_fee_ntd = case when method_type = 'home_delivery' then 200 else base_fee_ntd end,
           free_threshold_quantity = case when method_type = 'home_delivery' then 10 else free_threshold_quantity end,
           allow_mixed_products = true,
           updated_at = now()
     where campaign_id = v_campaign_id;
    return;
  end if;

  select id
    into v_workspace_id
    from public.group_buy_workspaces
   where owner_user_id = v_owner_id
     and status = 'active'
   order by created_at
   limit 1;

  if v_workspace_id is null then
    insert into public.group_buy_workspaces (
      owner_user_id,
      name,
      slug,
      status,
      default_bank_name,
      default_bank_code
    ) values (
      v_owner_id,
      'RXV 團購工作空間',
      'rxv-' || left(v_owner_id::text, 8),
      'active',
      '中華郵政',
      '700'
    )
    returning id into v_workspace_id;
  end if;

  insert into public.group_buy_campaigns (
    workspace_id,
    title,
    slug,
    description,
    cover_image_url,
    notice_text,
    organizer_disclaimer,
    status,
    registration_starts_at,
    registration_ends_at,
    original_registration_ends_at,
    registration_extension_count,
    payment_deadline,
    estimated_arrival_text,
    estimated_ship_min_business_days,
    estimated_ship_max_business_days,
    threshold_mode,
    min_registration_value,
    min_paid_value,
    allow_mixed_products,
    show_progress,
    address_collection_stage,
    payment_open_mode,
    bank_name,
    bank_code,
    show_bank_after_payment_open,
    created_by_user_id
  ) values (
    v_workspace_id,
    '亞尼克生乳捲第一團｜單條也享76折',
    'yannick-first-group-buy',
    '第一團採網站登記制：達到公開成團門檻不會立即結團；預計結團時間僅供參考，主辦方正式結團前仍可登記。正式結團後才開放付款；全團付款核對完成並向供應商下單後，安排冷凍宅配。',
    '/group-buy/yannick/original.jpg',
    E'1. 本頁完成登記即可，不需私訊粉絲團。\n2. 達到公開成團門檻不會立即結團，主辦方正式結團前仍可登記。\n3. 預計結團時間僅供參考；管理員正式結團後才開放付款。\n4. 未達門檻時最多延長一次，每次 3 天。\n5. 全團付款核對完成並向供應商下單後，預計 7～14 個工作天內出貨。\n6. 冷凍宅配每筆訂單未滿 10 條運費 200 元，滿 10 條免運。',
    '本團由 RXV 夢想創作工作室獨立發起，非亞尼克官方網站或官方活動頁。',
    'registration_open',
    v_registration_starts_at,
    v_registration_ends_at,
    v_registration_ends_at,
    0,
    null,
    '全團付款核對完成並向供應商下單後，預計7～14個工作天內出貨；實際最晚出貨日將於供應商回覆後顯示。',
    7,
    14,
    'quantity',
    v_public_threshold,
    v_public_threshold,
    true,
    true,
    'registration',
    'manual',
    '中華郵政',
    '700',
    true,
    v_owner_id
  )
  returning id into v_campaign_id;

  insert into public.group_buy_products (
    campaign_id, title, description, image_url, unit_label,
    sale_price_ntd, cost_price_ntd, threshold_weight, is_active, sort_order
  ) values
    (v_campaign_id, '原味生乳捲', '亞尼克經典原味生乳捲。官網定價 392 元，本團 76 折。', '/group-buy/yannick/original.jpg', '條', 298, 267, 1, true, 0),
    (v_campaign_id, '特黑巧克力生乳捲', '濃郁巧克力風味。官網定價 420 元，本團 76 折。', '/group-buy/yannick/dark-chocolate.jpg', '條', 319, 286, 1, true, 1),
    (v_campaign_id, '茶拿鐵布丁生乳捲', '茶拿鐵與布丁風味。官網定價 420 元，本團 76 折。', '/group-buy/yannick/tea-latte-pudding.jpg', '條', 319, 286, 1, true, 2),
    (v_campaign_id, '北海道黑酷曲', '北海道黑酷曲風味。官網定價 450 元，本團 76 折。', '/group-buy/yannick/hokkaido-black-cookie.jpg', '條', 342, 306, 1, true, 3),
    (v_campaign_id, '宇治抹茶生乳捲', '宇治抹茶風味。官網定價 699 元，本團 76 折。', '/group-buy/yannick/uji-matcha.jpg', '條', 531, 475, 1, true, 4),
    (v_campaign_id, '香草布丁生乳捲', '香草布丁風味。官網定價 420 元，本團 76 折。', '/group-buy/yannick/vanilla-pudding.jpg', '條', 319, 286, 1, true, 5),
    (v_campaign_id, '期間限定－三顆布丁生乳捲', '期間限定品。官網定價 465 元，本團 76 折；依供應商實際供貨為準。', '/group-buy/yannick/three-pudding.jpg', '條', 353, 316, 1, true, 6),
    (v_campaign_id, '期間限定－特濃薄荷巧克力脆片生乳捲', '期間限定品。官網定價 565 元，本團 76 折；依供應商實際供貨為準。', '/group-buy/yannick/mint-chocolate-crunch.jpg', '條', 429, 384, 1, true, 7),
    (v_campaign_id, '期間限定－薄荷巧克力北海道黑酷曲', '期間限定品。官網定價 535 元，本團 76 折；依供應商實際供貨為準。', '/group-buy/yannick/mint-black-cookie.jpg', '條', 407, 364, 1, true, 8);

  insert into public.group_buy_shipping_methods (
    campaign_id,
    method_type,
    label,
    is_active,
    fee_mode,
    base_fee_ntd,
    free_threshold_quantity,
    allow_mixed_products,
    sort_order
  ) values (
    v_campaign_id,
    'home_delivery',
    '冷凍宅配｜未滿 10 條運費 200 元，滿 10 條免運',
    true,
    'quantity_free_threshold',
    200,
    10,
    true,
    0
  );
end
$seed$;

commit;
