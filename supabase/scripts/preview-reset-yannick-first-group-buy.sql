-- Yannick first group-buy reset preview (READ ONLY)
-- Safe to run in Supabase SQL Editor. This script performs SELECT statements only.

-- 1) Verify the target identity and current campaign state.
with target_campaign as (
  select c.*
  from public.group_buy_campaigns c
  where c.slug = 'yannick-first-group-buy'
)
select
  c.id as campaign_id,
  c.slug as campaign_slug,
  c.title as campaign_title,
  c.workspace_id,
  w.name as workspace_name,
  w.slug as workspace_slug,
  w.status as workspace_status,
  c.status as campaign_status,
  c.threshold_mode,
  c.min_registration_value as current_registration_threshold,
  c.min_paid_value as current_paid_threshold,
  70::numeric as proposed_registration_threshold,
  70::numeric as proposed_paid_threshold,
  c.payment_open_mode,
  c.registration_ends_at,
  c.original_registration_ends_at,
  c.payment_deadline,
  c.registration_closed_at,
  c.payment_opened_at,
  c.supplier_ordered_at,
  c.estimated_ship_min_business_days,
  c.estimated_ship_max_business_days,
  position('58 條' in coalesce(c.description, '')) > 0 as description_contains_public_58,
  position('58 條' in coalesce(c.notice_text, '')) > 0 as notice_contains_public_58,
  case
    when count(*) over () <> 1 then 'BLOCK: slug must resolve to exactly one campaign'
    when c.id <> 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid then 'BLOCK: campaign id differs from inspected id'
    when c.workspace_id <> 'd5c44874-8a20-44a3-8505-20bcd39441a3'::uuid then 'BLOCK: workspace id differs from inspected id'
    when w.name <> 'RXV 團購工作空間' or w.status <> 'active' then 'BLOCK: workspace identity/status differs'
    when c.registration_ends_at <= now() then 'ACTION REQUIRED: registration end date has passed'
    else 'identity verified'
  end as verification
from target_campaign c
join public.group_buy_workspaces w on w.id = c.workspace_id;

-- 2) Show every public.group_buy_* foreign key and its actual ON DELETE action.
-- c = CASCADE, r = RESTRICT, a = NO ACTION, n = SET NULL, d = SET DEFAULT.
select
  child.relname as child_table,
  con.conname as constraint_name,
  parent.relname as parent_table,
  pg_get_constraintdef(con.oid, true) as definition,
  case con.confdeltype
    when 'c' then 'CASCADE'
    when 'r' then 'RESTRICT'
    when 'a' then 'NO ACTION'
    when 'n' then 'SET NULL'
    when 'd' then 'SET DEFAULT'
  end as on_delete
from pg_constraint con
join pg_class child on child.oid = con.conrelid
join pg_namespace child_ns on child_ns.oid = child.relnamespace
join pg_class parent on parent.oid = con.confrelid
where con.contype = 'f'
  and child_ns.nspname = 'public'
  and (child.relname like 'group_buy_%' or parent.relname like 'group_buy_%')
order by parent.relname, child.relname, con.conname;

-- 3) Exact rows that the reset script proposes to delete.
with target_campaign as (
  select id
  from public.group_buy_campaigns
  where slug = 'yannick-first-group-buy'
    and id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
    and workspace_id = 'd5c44874-8a20-44a3-8505-20bcd39441a3'::uuid
), target_orders as (
  select o.id
  from public.group_buy_orders o
  join target_campaign c on c.id = o.campaign_id
)
select *
from (
  select 1 as delete_order, 'group_buy_notifications'::text as table_name,
    (select count(*) from public.group_buy_notifications n
      join target_orders o on o.id = n.order_id
      join target_campaign c on c.id = n.campaign_id) as row_count,
    'DELETE: campaign_id and order_id both match'::text as disposition
  union all
  select 2, 'group_buy_order_recovery_tokens',
    (select count(*) from public.group_buy_order_recovery_tokens t join target_orders o on o.id = t.order_id),
    'DELETE: order child'
  union all
  select 3, 'group_buy_payment_reports',
    (select count(*) from public.group_buy_payment_reports p join target_orders o on o.id = p.order_id),
    'DELETE: order child'
  union all
  select 4, 'group_buy_order_events',
    (select count(*) from public.group_buy_order_events e join target_orders o on o.id = e.order_id),
    'DELETE: order child'
  union all
  select 5, 'group_buy_order_items',
    (select count(*) from public.group_buy_order_items i join target_orders o on o.id = i.order_id),
    'DELETE: order child'
  union all
  select 6, 'group_buy_orders', (select count(*) from target_orders), 'DELETE LAST'
) affected
order by delete_order;

-- 4) Data that must be preserved.
with target_campaign as (
  select id, workspace_id
  from public.group_buy_campaigns
  where slug = 'yannick-first-group-buy'
    and id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
), target_products as (
  select p.id from public.group_buy_products p join target_campaign c on c.id = p.campaign_id
)
select *
from (
  select 'group_buy_campaigns'::text as table_name, count(*) as row_count, 'PRESERVE'::text as disposition
    from public.group_buy_campaigns c join target_campaign t on t.id = c.id
  union all
  select 'group_buy_products', count(*), 'PRESERVE'
    from public.group_buy_products p join target_campaign c on c.id = p.campaign_id
  union all
  select 'group_buy_product_images', count(*), 'PRESERVE (and no Storage deletion)'
    from public.group_buy_product_images i join target_products p on p.id = i.product_id
  union all
  select 'group_buy_shipping_methods', count(*), 'PRESERVE'
    from public.group_buy_shipping_methods s join target_campaign c on c.id = s.campaign_id
  union all
  select 'group_buy_workspaces', count(*), 'PRESERVE'
    from public.group_buy_workspaces w join target_campaign c on c.workspace_id = w.id
) preserved
order by table_name;

-- 5) Campaign-level events do not have order_id. They are intentionally not deleted.
select
  e.event_type,
  e.from_status,
  e.to_status,
  count(*) as row_count,
  'MANUAL REVIEW: preserved by reset script because no order_id proves transaction ownership'::text as disposition
from public.group_buy_campaign_events e
join public.group_buy_campaigns c on c.id = e.campaign_id
where c.slug = 'yannick-first-group-buy'
group by e.event_type, e.from_status, e.to_status
order by e.event_type, e.from_status, e.to_status;

-- 6) Confirm whether any other campaigns exist. No row below is touched by reset.
select id, slug, title, workspace_id, status
from public.group_buy_campaigns
where id <> 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
order by created_at;

-- 7) Storage confirmation: this script and the reset script never reference storage.*.
select
  'Supabase Storage'::text as protected_resource,
  'NO DELETE / NO UPDATE / NO STORAGE API CALL'::text as action;
